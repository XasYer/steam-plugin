import { App, Config, Render } from '#components'
import { segment } from '#lib'
import { db, utils, task, api } from '#models'
import _ from 'lodash'

task.startTimer()

const app = {
  id: 'push',
  name: '推送'
}

export const rule = {
  push: {
    reg: /^#?steam(?:开启|关闭)推送\s*(\d+)?$/i,
    fnc: async e => {
      if (!await checkGroup(e)) {
        return true
      }
      const textId = rule.push.reg.exec(e.msg)[1]
      const open = e.msg.includes('开启')
      // 如果附带了steamId
      if (textId) {
        const steamId = utils.getSteamId(textId)
        const user = await db.UserTableGetDataBySteamId(steamId)
        // 如果没有人绑定这个steamId则判断是否为主人,主人才能添加推送
        if (((!user && e.isMaster) || (user && user.userId == e.user_id))) {
          const uid = e.isMaster ? utils.getAtUid(_.isEmpty(e.at) ? e.user_id : e.at, '0') : e.user_id
          if (open) {
            await db.PushTableAddData(uid, steamId, e.self_id, e.group_id)
            await e.reply([uid == '0' ? '' : segment.at(uid), `已开启推送${steamId}到${e.group_id}`])
          } else {
            await db.PushTableDelData(uid, steamId, e.self_id, e.group_id)
            await e.reply([uid == '0' ? '' : segment.at(uid), `已关闭推送${steamId}到${e.group_id}`])
          }
        } else {
          await e.reply('只能开启或关闭自己的推送哦')
        }
      } else {
        const uid = utils.getAtUid(e.isMaster ? e.at : '', e.user_id)
        // 没有附带steamId则使用绑定的steamId
        const steamId = await db.UserTableGetBindSteamIdByUserId(uid)
        if (steamId) {
          if (open) {
            await db.PushTableAddData(uid, steamId, e.self_id, e.group_id)
            await e.reply([segment.at(uid), `已开启推送${steamId}到${e.group_id}`])
          } else {
            await db.PushTableDelData(uid, steamId, e.self_id, e.group_id)
            await e.reply([segment.at(uid), `已关闭推送${steamId}到${e.group_id}`])
          }
        } else {
          await e.reply('你还没有steamId哦')
        }
      }
      return true
    }
  },
  list: {
    reg: /^#?steam(本群)?推送列表$/i,
    fnc: async e => {
      if (!await checkGroup(e)) {
        return true
      }
      const list = await db.PushTableGetDataByGroupId(e.group_id, true)
      if (!list.length) {
        await e.reply('本群还没有推送用户哦')
        return true
      }
      const userList = []
      for (const i of list) {
        const name = i.userId == '0' ? 'N/A' : await utils.getUserName(i.botId, i.userId, i.groupId)
        userList.push({
          name,
          desc: i.steamId,
          header_image: await utils.getUserAvatar(i.botId, i.userId == '0' ? i.botId : i.userId, i.groupId),
          header_image_class: 'square'
        })
      }
      const data = [{
        title: `群${e.group_id}推送列表`,
        desc: `共${list.length}个推送用户`,
        games: userList,
        column: 3
      }]
      const img = await Render.render('inventory/index', { data })
      if (img) {
        await e.reply(img)
      } else {
        await e.reply('制作图片出错辣! 再试一次吧')
      }
      return true
    }
  },
  now: {
    reg: /^#?群友在玩什么呢?[?？]?$/i,
    fnc: async e => {
      if (!await checkGroup(e)) {
        return true
      }
      const list = await db.PushTableGetDataByGroupId(e.group_id, false)
      if (!list.length) {
        await e.reply('本群还没有用户绑定steamId哦')
        return true
      }
      const userState = await api.ISteamUser.GetPlayerSummaries(list.map(i => i.steamId))
      if (!userState.length) {
        await e.reply('获取玩家状态失败, 再试一次叭')
        return true
      }
      const playing = []
      const notPlaying = []
      const sort = (i) => {
        if (i.personastate == 1) {
          return 0
        } else if (i.personastate == 0) {
          return 2
        } else if (i.personastate == 2) {
          return 1
        } else {
          return i.personastate
        }
      }
      for (const i of _.sortBy(userState, sort)) {
        const userInfo = list.find(j => j.steamId == i.steamid)
        const nickname = await utils.getUserName(userInfo.botId, userInfo.userId, userInfo.groupId)
        if (i.gameid) {
          playing.push({
            name: i.gameextrainfo,
            appid: i.gameid,
            desc: `${nickname}(${i.personaname})`
          })
        } else {
          notPlaying.push({
            name: nickname,
            appid: i.personaname,
            desc: utils.getPersonaState(i.personastate),
            header_image: await utils.getUserAvatar(userInfo.botId, userInfo.userId, userInfo.groupId) || i.avatarfull,
            header_image_class: 'square',
            desc_style: `style="background-color: #${i.personastate == 1 ? 'beee11' : '999999'};color: white;width: fit-content;border-radius: 5px; padding: 0 5px;"`
          })
        }
      }
      const data = [
        {
          title: '正在玩游戏的群友',
          desc: `共${playing.length}个`,
          games: playing,
          column: 3
        },
        {
          title: '没有在玩游戏的群友',
          desc: `共${notPlaying.length}个`,
          games: notPlaying,
          column: 3
        }
      ]
      const img = await Render.render('inventory/index', { data })
      if (img) {
        await e.reply(img)
      } else {
        await e.reply('制作图片出错辣! 再试一次吧')
      }
      return true
    }
  }
}

export const pushApp = new App(app, rule).create()

async function checkGroup (e) {
  if (!e.group_id) {
    return false
  }
  if (!Config.push.enable) {
    await e.reply('主人没有开启推送功能哦')
    return false
  }
  if (Config.push.whiteGroupList.length && !Config.push.whiteGroupList.some(id => id == e.group_id)) {
    await e.reply('本群没有在推送白名单中, 请联系主人添加~')
    return false
  }
  if (Config.push.blackGroupList.length && Config.push.blackGroupList.some(id => id == e.group_id)) {
    await e.reply('本群在推送黑名单中, 请联系主人解除~')
    return false
  }
  return true
}
