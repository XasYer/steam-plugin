import { utils, db } from '#models'
import { App } from '#components'

const app = {
  id: 'bind',
  name: '绑定Steam'
}

export const rule = {
  bind: {
    reg: /^#?steam(?:[切更]换)?(?:绑定|bind)\s*(\d+)?$/i,
    fnc: async e => {
      // 如果是主人可以at其他用户进行绑定
      const uid = utils.getAtUid(e.isMaster ? e.at : '', e.user_id)
      const textId = rule.bind.reg.exec(e.msg)[1]
      if (!textId) {
        const userBindAll = await db.UserTableGetDataByUserId(uid)
        if (!userBindAll.length) {
          await e.reply('要和SteamID或好友码一起发送哦')
        } else {
          await e.reply(`已绑定:\n${userBindAll.map(item => `${item.steamId} ${item.isBind ? '√' : ''}`).join('\n')}`)
        }
        return true
      }
      const steamId = utils.getSteamId(textId)
      // 检查steamId是否被绑定
      const bindInfo = await db.UserTableGetDataBySteamId(steamId)
      if (bindInfo) {
        if (bindInfo.userId == uid) {
          await db.UserTableBindSteamIdByUserId(uid, steamId)
        } else {
          await e.reply('这个steamId已经被绑定惹, 要不要换一个?')
        }
        return true
      } else {
        await db.UserTableAddSteamIdByUserId(uid, steamId)
        // TODO: config如果默认开启推送则添加到推送列表
        // 群聊绑定才添加
        if (e.group_id) {
          await db.PushTableAddData(uid, steamId, e.self_id, e.group_id)
        }
      }
      const userBindAll = await db.UserTableGetDataByUserId(uid)
      await e.reply(`已添加steamId: ${steamId}\n已绑定:\n${userBindAll.map(item => `${item.steamId} ${item.isBind ? '√' : ''}`).join('\n')}`)
      return true
    }
  },
  unbind: {
    reg: /^#?steam(?:解除?绑定?|unbind)\s*(\d+)$/i,
    fnc: async e => {
      const textId = rule.unbind.reg.exec(e.msg)[1]
      if (!textId) {
        await e.reply('要和SteamID或好友码一起发送哦')
        return true
      }
      // 如果是主人可以at其他用户进行绑定
      const uid = utils.getAtUid(e.isMaster ? e.at : '', e.user_id)
      const steamId = utils.getSteamId(textId)
      // 检查steamId是否被绑定
      const bindInfo = await db.UserTableGetDataBySteamId(steamId)
      if (bindInfo) {
        if (bindInfo.userId == uid) {
          await db.UserTableDelSteamIdByUserId(uid, steamId)
          const userBindAll = await db.UserTableGetDataByUserId(uid)
          await e.reply(`已删除steamId: ${steamId}\n已绑定:\n${userBindAll.map(item => `${item.steamId} ${item.isBind ? '√' : ''}`).join('\n')}`)
        } else {
          await e.reply('只能解绑自己绑定的steamId哦')
        }
        return true
      }
      await e.reply('还没有人绑定这个steamId呢')
      return true
    }
  }
}

export const bind = new App(app, rule).create()
