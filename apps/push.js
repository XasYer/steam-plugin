import { App, Config } from '#components'
import { segment } from '#lib'
import { db, utils, task } from '#models'

task.startTimer()

const app = {
  id: 'push',
  name: '推送'
}

export const rule = {
  push: {
    reg: /^#?steam(?:开启|关闭)推送\s*(\d+)?$/i,
    fnc: async e => {
      if (!e.group_id) {
        return true
      }
      if (!Config.push.enable) {
        await e.reply('主人没有开启推送功能哦')
        return true
      }
      if (Config.push.whiteGroupList.length && !Config.push.whiteGroupList.some(id => id == e.group_id)) {
        await e.reply('本群没有在推送白名单中, 请联系主人添加~')
        return true
      }
      if (Config.push.blackGroupList.length && Config.push.blackGroupList.some(id => id == e.group_id)) {
        await e.reply('本群在推送黑名单中, 请联系主人解除~')
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
          const uid = e.isMaster ? utils.getAtUid(e.at, '0') : e.user_id
          if (open) {
            await db.PushTableAddData(uid, steamId, e.self_id, e.group_id)
            await e.reply([uid == '0' ? '' : segment.at(uid), `已开启推送: ${steamId}`])
          } else {
            await db.PushTableDelData(uid, steamId, e.self_id, e.group_id)
            await e.reply([uid == '0' ? '' : segment.at(uid), `已关闭推送: ${steamId}`])
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
            await e.reply([segment.at(uid), `已开启推送: ${steamId}`])
          } else {
            await db.PushTableDelData(uid, steamId, e.self_id, e.group_id)
            await e.reply([segment.at(uid), `已关闭推送: ${steamId}`])
          }
        } else {
          await e.reply('你还没有steamId哦')
        }
      }
      return true
    }
  }
}

export const pushApp = new App(app, rule).create()
