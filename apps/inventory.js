import { utils, api } from '#models'
import { Render, App, Config } from '#components'
import _ from 'lodash'

const appInfo = {
  id: 'inventory',
  name: '库存'
}

const rule = {
  inventory: {
    reg: App.getReg('(?:库存|游戏列表|(?:最近|近期)(?:游?玩|运行|启动))\\s*(\\d*)'),
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
      if (e.msg.includes('近')) {
        const games = await api.IPlayerService.GetRecentlyPlayedGames(steamId)
        if (!games.length) {
          return Config.tips.recentPlayEmptyTips
        }
        screenshotOptions.games = _.orderBy(games, 'playtime_2weeks', 'desc')
        screenshotOptions.title = `${nickname} 近期游玩了 ${games.length} 个游戏`
      } else {
        const games = await api.IPlayerService.GetOwnedGames(steamId)
        if (!games.length) {
          return Config.tips.inventoryEmptyTips
        }
        screenshotOptions.games = _.orderBy(games, 'playtime_forever', 'desc')
        screenshotOptions.title = `${nickname} 库存共有 ${games.length} 个游戏`
      }
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
function getTime (time) {
  return (time / 60).toFixed(1) + 'h'
}

export const app = new App(appInfo, rule).create()
