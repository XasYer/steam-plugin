import { utils, db, api } from '#models'
import { segment } from '#lib'
import { Render, App, Config } from '#components'
import moment from 'moment'
import _ from 'lodash'

const appInfo = {
  id: 'inventory',
  name: '库存'
}

const rule = {
  inventory: {
    reg: App.getReg('(?:库存|游戏列表|(?:最近|近期)(?:游?玩|运行|启动)|愿望单)\\s*(\\d*)'),
    cfg: {
      tips: true
    },
    fnc: async e => {
      const textId = rule.inventory.reg.exec(e.msg)?.[1]
      const uid = utils.bot.getAtUid(e.at, e.user_id)
      const steamId = textId ? utils.steam.getSteamId(textId) : await db.UserTableGetBindSteamIdByUserId(uid)
      if (!steamId) {
        await e.reply([segment.at(uid), '\n', Config.tips.noSteamIdTips])
        return true
      }
      const nickname = textId || await utils.bot.getUserName(e.self_id, uid, e.group_id)
      const screenshotOptions = {
        title: '',
        games: [],
        desc: ''
      }
      if (e.msg.includes('近')) {
        const games = await api.IPlayerService.GetRecentlyPlayedGames(steamId)
        if (!games.length) {
          await e.reply([segment.at(uid), '\n', Config.tips.recentPlayEmptyTips])
          return true
        }
        screenshotOptions.games = _.orderBy(games, 'playtime_2weeks', 'desc')
        screenshotOptions.title = `${nickname} 近期游玩了 ${games.length} 个游戏`
      } else if (e.msg.includes('愿')) {
        const wishlist = await api.IWishlistService.GetWishlist(steamId)
        if (!wishlist.length) {
          await e.reply([segment.at(uid), '\n', Config.tips.wishListEmptyTips])
          return true
        }
        if (wishlist.length > Config.other.hiddenLength) {
          wishlist.length = Config.other.hiddenLength
        }
        // 愿望单没有给name, 尝试获取一下, 顺便也可以获取一下价格 获取失败超过3次就不再获取了
        // 2024年11月27日 已更新 有个api可以获取多个appid 不知道一次最多能获取多少
        const appidsInfo = await api.IStoreBrowseService.GetItems(wishlist.map(i => i.appid), {
          include_assets: true
        })
        for (const i in wishlist) {
          const appid = wishlist[i].appid
          const info = appidsInfo[appid]
          if (!info) {
            wishlist[i].price = {
              discount: 0,
              original: '获取失败'
            }
            continue
          }
          wishlist[i].image = utils.steam.getHeaderImgUrlByAppid(appid, 'apps', info.assets?.header)
          wishlist[i].desc = moment.unix(wishlist[i].date_added).format('YYYY-MM-DD HH:mm:ss')
          wishlist[i].name = info.name
          wishlist[i].price = info.is_free
            ? {
                discount: 0,
                original: '免费'
              }
            : {
                discount: info.best_purchase_option?.discount_pct || 0,
                original: info.best_purchase_option?.formatted_original_price || info.best_purchase_option?.formatted_final_price || '即将推出',
                current: info.best_purchase_option?.formatted_final_price || ''
              }
        }
        screenshotOptions.title = `${nickname} 愿望单共有 ${wishlist.length} 个游戏`
        screenshotOptions.games = _.orderBy(wishlist, 'date_added', 'desc')
      } else {
        const games = await api.IPlayerService.GetOwnedGames(steamId)
        if (!games.length) {
          await e.reply([segment.at(uid), '\n', Config.tips.inventoryEmptyTips])
          return true
        }
        screenshotOptions.games = _.orderBy(games, 'playtime_forever', 'desc')
        screenshotOptions.title = `${nickname} 库存共有 ${games.length} 个游戏`
      }
      if (!e.msg.includes('愿')) {
        let playtimeForever = 0
        let playtime2weeks = 0
        screenshotOptions.games.map(i => {
          i.desc = `${getTime(i.playtime_forever)} ${i.playtime_2weeks ? `/ ${getTime(i.playtime_2weeks)}` : ''}`
          playtimeForever += i.playtime_forever
          i.playtime_2weeks && (playtime2weeks += i.playtime_2weeks)
          return i
        })
        screenshotOptions.desc = `总游戏时长：${getTime(playtimeForever)} / 最近两周游戏时长：${getTime(playtime2weeks)}`
      }
      const img = await Render.render('inventory/index', {
        data: [screenshotOptions]
      })
      await e.reply(img)
      return true
    }
  },
  familyInventory: {
    reg: App.getReg('家庭库存'),
    cfg: {
      tips: true
    },
    fnc: async e => {
      const token = await utils.steam.getAccessToken(e.user_id)
      if (!token.success) {
        await e.reply([segment.at(e.user_id), '\n', token.message])
        return true
      }
      const steamId = token.steamId
      // 先获取家庭共享信息
      const familyInfo = await api.IFamilyGroupsService.GetFamilyGroupForUser(token.accessToken, steamId)
      if (!familyInfo.family_groupid) {
        await e.reply([segment.at(e.user_id), '\n', steamId, '未加入家庭'])
        return true
      }
      // 获取家庭库存
      const familyInventory = await api.IFamilyGroupsService.GetSharedLibraryApps(token.accessToken, familyInfo.family_groupid, steamId)
      if (!familyInventory.apps.length) {
        await e.reply([segment.at(e.user_id), '\n', steamId, '家庭库存为空'])
        return true
      }
      // 过滤掉自己库存的游戏
      const games = familyInventory.apps.filter(i => !i.owner_steamids.includes(steamId)).map(i => ({
        playtime: i.rt_playtime,
        desc: getTime(i.rt_playtime),
        appid: i.appid,
        name: i.name
      }))
      const data = [{
        title: `${familyInfo.family_group.name} 共有 ${games.length} 个游戏`,
        desc: [
          `已排除自己库存的游戏${familyInventory.apps.length - games.length}个`
        ],
        games: _.orderBy(games, 'playtime', 'desc')
      }]
      const img = await Render.render('inventory/index', {
        data
      })
      await e.reply(img)
      return true
    }
  },
  privateInventory: {
    reg: App.getReg('私密(库存|游戏)(列表)?'),
    cfg: {
      tips: true
    },
    fnc: async e => {
      const token = await utils.steam.getAccessToken(e.user_id)
      if (!token.success) {
        await e.reply([segment.at(e.user_id), '\n', token.message])
        return true
      }
      const appids = await api.IAccountPrivateAppsService.GetPrivateAppList(token.accessToken)
      if (!appids.length) {
        await e.reply([segment.at(e.user_id), '\n', '没有偷偷藏小黄油呢'])
        return true
      }
      const appInfo = await api.IStoreBrowseService.GetItems(appids)
      const data = [{
        title: `${token.steamId}的私密库存`,
        games: appids.map(i => {
          const info = appInfo[i]
          return {
            appid: i,
            name: info.name || ''
          }
        })
      }]
      const img = await Render.render('inventory/index', {
        data
      })
      await e.reply(img)
      return true
    }
  },
  togglePrivate: {
    reg: App.getReg('(?:添加|删除)私密(?:库存|游戏)(.*)'),
    fnc: async e => {
      const token = await utils.steam.getAccessToken(e.user_id)
      if (!token.success) {
        await e.reply([segment.at(e.user_id), '\n', token.message])
        return true
      }
      const flag = e.msg.includes('添加')
      const input = rule.togglePrivate.reg.exec(e.msg)?.[1]
      const appids = input.split(' ').map(Number).filter(Boolean)
      if (!appids.length) {
        await e.reply([segment.at(e.user_id), '\n', '请带上appid~'])
        return true
      }
      await api.IAccountPrivateAppsService.ToggleAppPrivacy(token.accessToken, appids, flag)
      await e.reply([segment.at(e.user_id), '\n', flag ? '添加' : '删除', '私密游戏成功~'])
      return true
    }
  },
  addInventory: {
    reg: App.getReg('入库(?:游戏)?\\s*(\\d*)'),
    fnc: async e => {
      const token = await utils.steam.getAccessToken(e.user_id)
      if (!token.success) {
        await e.reply([segment.at(e.user_id), '\n', token.message])
        return true
      }
      const appid = rule.addInventory.reg.exec(e.msg)[1]
      if (!appid) {
        await e.reply([segment.at(e.user_id), '\n', '请带上appid~'])
        return true
      }
      const infos = await api.IStoreBrowseService.GetItems([appid])
      const info = infos[appid]
      if (!info) {
        await e.reply([segment.at(e.user_id), '\n', '没有找到这个游戏哦'])
        return true
      }
      if (!info.is_free) {
        await e.reply([segment.at(e.user_id), '\n', info.name, '不是免费游戏!目前价格: ', info.best_purchase_option.formatted_final_price])
        return true
      }
      const res = await api.ICheckoutService.AddFreeLicense(token.accessToken, appid)
      if (res.appids_added?.some(i => i == appid)) {
        // 再获取一下库存确定一下?
        await e.reply([segment.at(e.user_id), '\n', '入库成功~'])
      } else {
        await e.reply([segment.at(e.user_id), '\n', '入库失败...'])
      }
      return true
    }
  },
  modefyWishlist: {
    reg: App.getReg('([添增]加|[删移][除出])愿望单\\s*(\\d*)'),
    fnc: async e => {
      const regRes = rule.modefyWishlist.reg.exec(e.msg)
      const appid = regRes[2]
      if (!appid) {
        await e.reply([segment.at(e.user_id), '\n', '请带上appid~'])
        return true
      }
      const token = await utils.steam.getAccessToken(e.user_id)
      if (!token.success) {
        await e.reply([segment.at(e.user_id), '\n', token.message])
        return true
      }
      const res = regRes[1].includes('加')
        ? await api.store.addtowishlist(token.cookie, appid)
        : await api.store.removefromwishlist(token.cookie, appid)
      if (res.success) {
        await e.reply([segment.at(e.user_id), '\n', regRes[1], '愿望单成功~现在的愿望单数量是: ', res.wishlistCount])
      } else {
        await e.reply([segment.at(e.user_id), '\n', regRes[1], '愿望单失败...'])
      }
      return true
    }
  }
}

/**
 * 将游戏时长(单位:分)转换小时
 * @param {number} time
 * @returns {string}
*/
function getTime (time) {
  return (time / 60).toFixed(1) + 'h'
}

export const app = new App(appInfo, rule).create()
