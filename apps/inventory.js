import { utils, api } from '#models'
import { Render, App, Config } from '#components'
import _ from 'lodash'

const appInfo = {
  id: 'inventory',
  name: '库存'
}

const rule = {
  inventory: {
    reg: App.getReg('(?:库存|游戏列表)(?:图片)?\\s*(\\d*)'),
    cfg: {
      tips: true,
      steamId: true
    },
    fnc: async (e, { steamId, uid }) => {
      const username = await utils.bot.getUserName(e.self_id, uid, e.group_id) || steamId
      const ownedGames = await api.IPlayerService.GetOwnedGames(steamId)
      if (!ownedGames.length) {
        return Config.tips.inventoryEmptyTips
      }
      const games = _.orderBy(ownedGames, 'playtime_forever', 'desc')
      if (Config.other.inventoryMode == 1 && !e.msg.includes('图片')) {
        let playtimeForever = 0
        let playtime2weeks = 0
        const screenshotOptions = {
          title: `${username} 库存共有 ${games.length} 个游戏`,
          games: games.map(i => {
            i.desc = `${getTime(i.playtime_forever)} ${i.playtime_2weeks ? `/ ${getTime(i.playtime_2weeks)}` : ''}`
            playtimeForever += i.playtime_forever
            i.playtime_2weeks && (playtime2weeks += i.playtime_2weeks)
            return i
          }),
          desc: ''
        }
        screenshotOptions.desc = `总游戏时长：${getTime(playtimeForever)} / 最近两周游戏时长：${getTime(playtime2weeks)}`
        return await Render.render('inventory/index', {
          data: [screenshotOptions],
          schinese: true
        })
      } else {
        const hiddenLength = Config.other.hiddenLength
        if (games.length > hiddenLength) {
          games.length = hiddenLength
        }
        const items = await api.IStoreBrowseService.GetItems(games.map(i => i.appid), {
          include_assets: true
        })
        const data = games.map(i => {
          if (!i) {
            return false
          }
          const info = items[i.appid]
          if (!info || !info?.assets) {
            return false
          }
          const suffix = info.assets.asset_url_format
          const library = info.assets.library_capsule
          const image = suffix.replace('${FILENAME}', library)
          return {
            image: utils.steam.getStaticUrl(image),
            size: getInventoryImageSize(i.playtime_forever)
          }
        }).filter(Boolean)
        const { playtimeForever, playtime2weeks } = ownedGames.reduce((acc, i) => {
          acc.playtimeForever += i.playtime_forever
          i.playtime_2weeks && (acc.playtime2weeks += i.playtime_2weeks)
          return acc
        }, { playtimeForever: 0, playtime2weeks: 0 })
        return await Render.render('inventory/image', {
          // data: _.sampleSize(data, data.length)
          data,
          avatar: await utils.bot.getUserAvatar(e.self_id, uid, e.group_id),
          username,
          count: ownedGames.length,
          playtimeForever: getTime(playtimeForever),
          playtime2weeks: getTime(playtime2weeks),
          limit: hiddenLength
        })
      }
    }
  },
  recently: {
    reg: App.getReg('(?:(?:最近|近期)(?:游?玩|运行|启动))\\s*(\\d*)'),
    cfg: {
      tips: true,
      steamId: true
    },
    fnc: async (e, { steamId, uid }) => {
      const nickname = await utils.bot.getUserName(e.self_id, uid, e.group_id) || steamId
      const screenshotOptions = {
        title: '',
        games: [],
        desc: ''
      }
      const games = await api.IPlayerService.GetRecentlyPlayedGames(steamId)
      if (!games.length) {
        return Config.tips.recentPlayEmptyTips
      }
      screenshotOptions.games = _.orderBy(games, 'playtime_2weeks', 'desc')
      screenshotOptions.title = `${nickname} 近期游玩了 ${games.length} 个游戏`
      let playtimeForever = 0
      let playtime2weeks = 0
      screenshotOptions.games = screenshotOptions.games.map(i => {
        i.desc = `${getTime(i.playtime_forever)} ${i.playtime_2weeks ? `/ ${getTime(i.playtime_2weeks)}` : ''}`
        playtimeForever += i.playtime_forever
        i.playtime_2weeks && (playtime2weeks += i.playtime_2weeks)
        return i
      })
      screenshotOptions.desc = `总游戏时长：${getTime(playtimeForever)} / 最近两周游戏时长：${getTime(playtime2weeks)}`
      return await Render.render('inventory/index', {
        data: [screenshotOptions],
        schinese: true
      })
    }
  },
  familyInventory: {
    reg: App.getReg('家庭库存'),
    cfg: {
      tips: true,
      accessToken: true
    },
    fnc: async (e, { accessToken, steamId }) => {
      // 先获取家庭共享信息
      const familyInfo = await api.IFamilyGroupsService.GetFamilyGroupForUser(accessToken, steamId)
      if (!familyInfo.family_groupid) {
        return `${steamId}未加入家庭`
      }
      // 获取家庭库存
      const familyInventory = await api.IFamilyGroupsService.GetSharedLibraryApps(accessToken, familyInfo.family_groupid, steamId)
      if (!familyInventory.apps.length) {
        return `${steamId}家庭库存为空`
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
      return await Render.render('inventory/index', {
        data,
        schinese: true
      })
    }
  },
  privateInventory: {
    reg: App.getReg('私密(库存|游戏)(列表)?'),
    cfg: {
      tips: true,
      accessToken: true
    },
    fnc: async (e, { accessToken, steamId }) => {
      const appids = await api.IAccountPrivateAppsService.GetPrivateAppList(accessToken)
      if (!appids.length) {
        return '没有偷偷藏小黄油呢'
      }
      const appInfo = await api.IStoreBrowseService.GetItems(appids)
      const data = [{
        title: `${steamId}的私密库存`,
        games: appids.map(i => {
          const info = appInfo[i]
          return {
            appid: i,
            name: info.name || ''
          }
        })
      }]
      return await Render.render('inventory/index', {
        data,
        schinese: true
      })
    }
  },
  togglePrivate: {
    reg: App.getReg('(?:添加|删除)私密(?:库存|游戏)(.*)'),
    cfg: {
      accessToken: true,
      appid: true
    },
    fnc: async (e, { accessToken, appid }) => {
      const flag = e.msg.includes('添加')
      await api.IAccountPrivateAppsService.ToggleAppPrivacy(accessToken, [appid], flag)
      return `${flag ? '添加' : '删除'}私密游戏成功~`
    }
  },
  addInventory: {
    reg: App.getReg('入库(?:游戏)?\\s*(\\d*)'),
    cfg: {
      accessToken: true,
      appid: true
    },
    fnc: async (e, { accessToken, appid }) => {
      const infos = await api.IStoreBrowseService.GetItems([appid])
      const info = infos[appid]
      if (!info) {
        return '没有找到这个游戏哦'
      }
      if (!info.is_free) {
        return [info.name, '不是免费游戏!目前价格: ', info.best_purchase_option.formatted_final_price]
      }
      const res = await api.ICheckoutService.AddFreeLicense(accessToken, appid)
      if (res.appids_added?.some(i => i == appid)) {
        // 再获取一下库存确定一下?
        return '入库成功~'
      } else {
        return '入库失败...'
      }
    }
  }
}

/**
 * 将游戏时长(单位:分)转换小时
 * @param {number} time
 * @returns {string}
*/
function getTime(time) {
  return (time / 60).toFixed(1) + 'h'
}

/**
 * 获取库存的图片大小
 * @param {number} time 游戏时间单位分钟
 * @returns {number}
 */
function getInventoryImageSize(time) {
  // 小于1个小时
  if (time < 60) {
    return 1
  }
  // 小于24个小时
  if (time < 1440) {
    return 2
  }
  // 小于72个小时
  if (time < 4320) {
    return 3
  }
  // 小于7天
  if (time < 10080) {
    return 4
  }
  // 小于30天
  if (time < 43200) {
    return 5
  }
  // 大于30天
  return 6
}

export const app = new App(appInfo, rule).create()
