import { utils, db } from '#models'
import { App, Config } from '#components'

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
          await e.reply(await getBindSteamIdsText(uid, e.group_id, userBindAll))
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
          return true
        }
      } else {
        await db.UserTableAddSteamIdByUserId(uid, steamId)
        // 群聊绑定才添加
        if (Config.push.defaultPush && e.group_id) {
          await db.PushTableSetNAUserIdToRealUserIdBySteamId(uid, steamId)
          await db.PushTableAddData(uid, steamId, e.self_id, e.group_id)
        }
      }
      const text = await getBindSteamIdsText(uid, e.group_id)
      await e.reply(`已添加steamId: ${steamId}\n${text}`)
      return true
    }
  },
  unbind: {
    reg: /^#?steam(?:解除?绑定?|unbind|取消绑定)\s*(\d+)$/i,
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
          const text = await getBindSteamIdsText(uid, e.group_id)
          await e.reply(`已添加steamId: ${steamId}\n${text}`)
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

/**
 * 获得已绑定的steamId的文本
 * @param {string} uid
 * @param {string} gid
 * @param {UserColumns[]?} userBindAll
 * @returns
 */
async function getBindSteamIdsText (uid, gid, userBindAll = []) {
  if (!userBindAll?.length) {
    userBindAll = await db.UserTableGetDataByUserId(uid)
  }
  const pushEnable = (() => {
    if (!Config.push.enable) {
      return false
    }
    if (Config.push.whiteGroupList.length && !Config.push.whiteGroupList.some(i => i == gid)) {
      return false
    }
    if (Config.push.blackGroupList.length && Config.push.blackGroupList.some(i => i == gid)) {
      return false
    }
    return true
  })()
  const pushSteamIds = await db.PushTableGetAllSteamIdBySteamIdAndGroupId(uid, gid)
  return `全部steamId(${pushEnable ? '✧:是否推送 ' : ''}√:是否绑定):\n${userBindAll.map(item => {
    const isBind = item.isBind ? '√' : ''
    const isPush = (pushEnable && pushSteamIds.includes(item.steamId)) ? '✧' : ''
    return `${item.steamId} ${isPush} ${isBind} `
  }).join('\n')}`
}
