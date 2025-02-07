import { App, Config, Render } from '#components'
import { db, utils, task } from '#models'
import _ from 'lodash'

task.play.startTimer()
task.inventory.startTimer()

const appInfo = {
  id: 'push',
  name: '推送'
}

const rule = {
  push: {
    reg: App.getReg('(?:开启|关闭)推送\\s*(\\d*)'),
    cfg: {
      group: true
    },
    fnc: async e => {
      if (!Config.push.enable) {
        return Config.tips.pushDisabledTips
      }
      const g = utils.bot.checkGroup(e.group_id)
      if (!g.success) {
        return g.message
      }
      const textId = rule.push.reg.exec(e.msg)[1]
      const open = e.msg.includes('开启')
      // 如果附带了steamId
      if (textId) {
        let steamId = utils.steam.getSteamId(textId)
        const user = await db.user.getBySteamId(steamId)
        // 如果没有人绑定这个steamId则判断是否为主人,主人才能添加推送
        if (((!user && e.isMaster) || (user && user.userId == e.user_id))) {
          const uid = e.isMaster ? utils.bot.getAtUid(_.isEmpty(e.at) ? e.user_id : e.at, '0') : e.user_id
          if (uid != '0') {
            const userBindAll = await db.user.getAllByUserId(uid)
            const index = Number(textId) <= userBindAll.length ? Number(textId) - 1 : -1
            steamId = index >= 0 ? userBindAll[index].steamId : steamId
          }
          if (open) {
            await db.push.add(uid, steamId, e.self_id, e.group_id)
            return `已开启推送${steamId}到${e.group_id}`
          } else {
            await db.push.set(uid, steamId, e.self_id, e.group_id)
            return `已关闭推送${steamId}到${e.group_id}`
          }
        } else {
          return '只能开启或关闭自己的推送哦'
        }
      } else {
        const uid = utils.bot.getAtUid(e.isMaster ? e.at : '', e.user_id)
        // 没有附带steamId则使用绑定的steamId
        const steamId = await db.user.getBind(uid)
        if (steamId) {
          if (open) {
            await db.push.add(uid, steamId, e.self_id, e.group_id)
            return `已开启推送${steamId}到${e.group_id}`
          } else {
            await db.push.set(uid, steamId, e.self_id, e.group_id)
            return `已关闭推送${steamId}到${e.group_id}`
          }
        } else {
          return Config.tips.noSteamIdTips
        }
      }
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
      if (e.msg.includes('开启')) {
        await db.familyInventoryPush.add(e.user_id, steamId, e.self_id, e.group_id)
        return `已开启家庭库存推送到${e.group_id}~`
      } else {
        await db.familyInventoryPush.del(steamId)
        return `已关闭家庭库存推送到${e.group_id}~`
      }
    }
  },
  list: {
    reg: App.getReg('(本群)?推送列表'),
    fnc: async e => {
      const g = utils.bot.checkGroup(e.group_id)
      if (!g.success) {
        return g.message
      }
      const list = await db.push.getAllByGroupId(e.group_id, true)
      if (!list.length) {
        return '本群还没有推送用户哦'
      }
      const userList = []
      for (const i of list) {
        const name = i.userId == '0' ? 'N/A' : await utils.bot.getUserName(i.botId, i.userId, i.groupId)
        userList.push({
          name,
          desc: i.steamId,
          image: await utils.bot.getUserAvatar(i.botId, i.userId == '0' ? i.botId : i.userId, i.groupId),
          isAvatar: true
        })
      }
      const data = [{
        title: `群${e.group_id}推送列表`,
        desc: `共${list.length}个推送用户`,
        games: userList
      }]
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
      if (isAll) {
        list = await db.push.getAll(false)
        if (!list.length) {
          return Config.tips.noSteamIdTips
        }
      } else if (!e.group_id) {
        return '请在群内使用'
      } else {
        const memberList = await utils.bot.getGroupMemberList(e.self_id, e.group_id)
        list = memberList.length
          ? await db.push.getAllByUserIds(memberList, false)
          : await db.push.getAllByGroupId(e.group_id, false)
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
            appid: nickname,
            desc: i.personaname,
            image: utils.steam.getHeaderImgUrlByAppid(i.gameid)
          })
        } else {
          notPlaying.push({
            name: nickname,
            appid: i.personaname,
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
  }
}

export const app = new App(appInfo, rule).create()
