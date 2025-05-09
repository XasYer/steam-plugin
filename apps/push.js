import { App, Config, Render } from '#components'
import { db, utils, task, api } from '#models'
import _ from 'lodash'
import moment from 'moment'

task.startTask()

const appInfo = {
  id: 'push',
  name: '推送'
}

const rule = {
  push: {
    reg: App.getReg('(?:开启|关闭)(游玩|库存|愿望单|状态)?推送\\s*(\\d*)'),
    cfg: {
      group: true,
      steamId: true
    },
    fnc: async (e, { steamId, uid, userSteamIdList }) => {
      const g = utils.bot.checkGroup(e.group_id)
      if (!g.success) {
        return g.message
      }
      const regRet = rule.push.reg.exec(e.msg)
      const type = regRet[1] || '游玩'
      if ((uid != e.user_id && !e.isMaster) || !userSteamIdList.find(i => i == steamId)) {
        return Config.tips.pushPermissionTips.replace('{{type}}', type)
      }
      const key = {
        游玩: 'play',
        库存: 'inventory',
        愿望单: 'wishlist',
        状态: 'state'
      }[type]
      // 判断是否开启对应推送
      if (
        (key === 'inventory' && !Config.push.userInventoryChange) ||
        (key === 'wishlist' && !Config.push.userWishlistChange) ||
        (key === 'state' && !Config.push.stateChange) ||
        (key === 'play' && !Config.push.enable)
      ) {
        return Config.tips.pushDisableTips.replace('{{type}}', type)
      } else if (
        (key === 'inventory' && Config.push.userInventoryChange == 1) ||
        (key === 'wishlist' && Config.push.userWishlistChange == 1)
      ) {
        const token = await utils.steam.getAccessToken(uid, steamId)
        if (!token.success) {
          return `需要#steam扫码登录 后才可以开启${type}推送~`
        }
      }
      const open = e.msg.includes('开启')
      await db.push.set(uid, steamId, e.self_id, e.group_id, { [key]: open })
      return Config.tips.pushChangeTips
        .replace('{{type}}', type)
        .replace('{{target}}', open ? '开启' : '关闭')
        .replace('{{groupId}}', e.group_id)
        .replace('{{userId}}', uid)
        .replace('{{steamId}}', steamId)
    }
  },
  familyInventory: {
    reg: App.getReg('(?:开启|关闭)家庭库存推送'),
    cfg: {
      accessToken: true,
      group: true
    },
    fnc: async (e, { steamId }) => {
      if (!Config.push.familyInventotyAdd) {
        return Config.tips.familyInventoryDisabledTips
      }
      const g = utils.bot.checkGroup(e.group_id)
      if (!g.success) {
        return g.message
      }
      const isOpen = e.msg.includes('开启')
      if (isOpen) {
        await db.familyInventoryPush.add(e.user_id, steamId, e.self_id, e.group_id)
      } else {
        await db.familyInventoryPush.del(e.user_id, steamId, e.self_id, e.group_id)
      }
      return `已${isOpen ? '开启' : '关闭'}家庭库存推送到${e.group_id}~`
    }
  },
  priceChange: {
    reg: App.getReg('(?:开启|关闭|添加|删除)降价推送\\s*(\\d*)'),
    cfg: {
      appid: true
    },
    fnc: async (e, { appid }) => {
      if (!Config.push.priceChange) {
        return Config.tips.pushDisableTips.replace('{{type}}', '降价')
      }
      const g = utils.bot.checkGroup(e.group_id)
      if (!g.success) {
        return g.message
      }
      if (Config.push.priceChange == 1) {
        const token = await utils.steam.getAccessToken(e.user_id, e.user_id)
        if (!token.success) {
          return '需要#steam扫码登录 后才可以开启降价推送~'
        }
      }
      // 看看是不是免费游戏以及未发行的游戏
      const info = (await api.IStoreBrowseService.GetItems(appid))[appid]
      if (!info) {
        return `没有找到appid为${appid}的游戏~`
      }
      if (info.is_coming_soon) {
        return `${info.name}暂未发售~`
      }
      if (info.is_free) {
        return `${info.name}是免费游戏,直接添加入库吧~`
      }
      const isOpen = e.msg.includes('开启') || e.msg.includes('添加')
      if (isOpen) {
        await db.priceChangePush.add(appid, e.self_id, e.group_id)
      } else {
        await db.priceChangePush.del(appid, e.self_id, e.group_id)
      }
      return `已${isOpen ? '开启' : '关闭'}${info.name}的降价推送到${e.group_id}~`
    }
  },
  priceChangeList: {
    reg: App.getReg('(本群)?降价推送列表'),
    fnc: async e => {
      const g = utils.bot.checkGroup(e.group_id)
      if (!g.success) {
        return g.message
      }
      const list = await db.priceChangePush.getOneGroup(e.group_id)
      if (!list.length) {
        return '本群还没有开启降价推送的游戏哦'
      }
      const infoList = await api.IStoreBrowseService.GetItems(_.uniq(list.map(i => i.appid)), {
        include_assets: true
      })
      const games = []
      for (const appid in infoList) {
        const info = infoList[appid]
        if (!info) {
          continue
        }
        const price = utils.steam.generatePrice(info.best_purchase_option, info.is_free)
        games.push({
          appid,
          name: info.name,
          image: utils.steam.getHeaderImgUrlByAppid(appid, 'apps', info.assets?.header),
          price,
          desc: price.discount ? `结束时间: ${moment.unix(info.best_purchase_option.active_discounts.shift().discount_end_date).format('YYYY-MM-DD')}` : undefined
        })
      }
      return await Render.render('inventory/index', {
        data: [
          {
            title: '降价推送列表',
            games
          }
        ]
      })
    }
  },
  list: {
    reg: App.getReg('(本群)?推送列表'),
    fnc: async e => {
      const g = utils.bot.checkGroup(e.group_id)
      if (!g.success) {
        return g.message
      }
      const list = await db.push.getAllByGroupId(e.group_id, {
        play: true,
        state: true,
        inventory: true,
        wishlist: true
      })
      if (!list.length) {
        return '本群还没有推送用户哦'
      }
      const play = []
      const state = []
      const inventory = []
      const wishlist = []
      for (const i of list) {
        const name = i.userId == '0' ? 'N/A' : await utils.bot.getUserName(i.botId, i.userId, i.groupId)
        const info = {
          name,
          desc: i.steamId,
          image: await utils.bot.getUserAvatar(i.botId, i.userId == '0' ? i.botId : i.userId, i.groupId),
          isAvatar: true
        }
        if (i.play) {
          play.push(info)
        }
        if (i.state) {
          state.push(info)
        }
        if (i.inventory) {
          inventory.push(info)
        }
        if (i.wishlist) {
          wishlist.push(info)
        }
      }
      const data = []
      if (play.length) {
        data.push({
          title: '开启游玩推送的用户',
          games: play
        })
      }
      if (state.length) {
        data.push({
          title: '开启状态推送的用户',
          games: state
        })
      }
      if (inventory.length) {
        data.push({
          title: '开启库存推送的用户',
          games: inventory
        })
      }
      if (wishlist.length) {
        data.push({
          title: '开启愿望单推送的用户',
          games: wishlist
        })
      }
      return await Render.render('inventory/index', { data })
    }
  },
  now: {
    reg: App.getReg('(全部)?群友(在玩什么呢?|状态)[?？]?'),
    cfg: {
      tips: true
    },
    fnc: async e => {
      const isAll = e.msg.includes('全部')
      let list = []
      // TODO: 是否开启全部群友状态查询
      if (isAll) {
        list = await db.push.getAll({ }, false)
        if (!list.length) {
          return Config.tips.noSteamIdTips
        }
      } else if (!e.group_id) {
        return '请在群内使用'
      } else {
        const memberList = await utils.bot.getGroupMemberList(e.self_id, e.group_id)
        list = memberList.length
          ? await db.push.getAllByUserIds(memberList, {})
          : await db.push.getAllByGroupId(e.group_id, {})
        if (!list.length) {
          return '本群还没有推送用户哦'
        }
      }
      list = _.uniqBy(list, 'steamId')
      const userState = await utils.steam.getUserSummaries(list.map(i => i.steamId))
      if (!userState.length) {
        return '获取玩家状态失败, 再试一次叭'
      }
      const playing = []
      const notPlaying = []
      const sort = (i) => {
        if (i.personastate == 1) {
          return 0
        } else if (i.personastate == 0) {
          return 2
        } else {
          return 1
        }
      }
      for (const i of _.sortBy(userState, sort)) {
        const userInfo = list.find(j => j.steamId == i.steamid)
        const nickname = isAll ? i.personaname : await utils.bot.getUserName(userInfo.botId, userInfo.userId, e.group_id)
        if (i.gameid) {
          playing.push({
            name: i.gameextrainfo,
            detail: nickname,
            desc: i.personaname,
            image: utils.steam.getHeaderImgUrlByAppid(i.gameid)
          })
        } else {
          notPlaying.push({
            name: nickname,
            detail: i.personaname,
            desc: utils.steam.getPersonaState(i.personastate),
            image: await utils.bot.getUserAvatar(userInfo.botId, userInfo.userId, userInfo.groupId) || (Config.other.steamAvatar ? i.avatarfull : `https://q.qlogo.cn/g?b=qq&s=100&nk=${userInfo.userId}`),
            isAvatar: true,
            descBgColor: utils.steam.getStateColor(i.personastate)
          })
        }
      }
      const data = [
        {
          title: '正在玩游戏的群友',
          desc: `共${playing.length}个`,
          games: playing
        },
        {
          title: '没有在玩游戏的群友',
          desc: `共${notPlaying.length}个`,
          games: notPlaying
        }
      ]
      return await Render.render('inventory/index', { data })
    }
  },
  run: {
    reg: App.getReg('主动推送'),
    fnc: async e => {
      if (!e.isMaster) {
        return '只有主人才能操作哦~'
      }
      const run = []
      if (Config.push.enable) {
        await task.play.callback()
        run.push('游玩推送')
      }
      if (Config.push.familyInventotyAdd) {
        await task.familyInventory.callback()
        run.push('家庭库存推送')
      }
      if (Config.push.userInventoryChange) {
        await task.userInventory.callback()
        run.push('库存推送')
      }
      if (Config.push.userWishlistChange) {
        await task.userWishlist.callback()
        run.push('愿望单推送')
      }
      if (Config.push.priceChange) {
        await task.priceChange.callback()
        run.push('降价推送')
      }
      return '已主动触发' + run.join('、') + '~'
    }
  }
}

export const app = new App(appInfo, rule).create()
