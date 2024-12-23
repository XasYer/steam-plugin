import { utils, db, bind } from '#models'
import { App } from '#components'
import { segment } from '#lib'

const appInfo = {
  id: 'bind',
  name: '绑定Steam'
}

const rule = {
  getBindImg: {
    // 这个指令必须# 不然可能会误触发
    reg: /^#steam$/i,
    fnc: async e => await e.reply(await bind.getBindSteamIdsImg(e.self_id, utils.bot.getAtUid(e.at, e.user_id), e.group_id))
  },
  bind: {
    reg: App.getReg('(?:[切更]换)?(?:绑定|bind)\\s*(\\d+)?'),
    fnc: async e => {
      // 如果是主人可以at其他用户进行绑定
      const uid = utils.bot.getAtUid(e.isMaster ? e.at : '', e.user_id)
      const textId = rule.bind.reg.exec(e.msg)[1]
      const userBindAll = await db.UserTableGetDataByUserId(uid)
      if (!textId) {
        await e.reply(await bind.getBindSteamIdsImg(e.self_id, uid, e.group_id, userBindAll))
        return true
      }
      const index = Number(textId) <= userBindAll.length ? Number(textId) - 1 : -1
      const steamId = index >= 0 ? userBindAll[index].steamId : utils.steam.getSteamId(textId)
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
        if (e.group_id) {
          await db.PushTableSetNAUserIdToRealUserIdBySteamId(uid, steamId)
          await db.PushTableAddData(uid, steamId, e.self_id, e.group_id)
        }
      }
      const text = await bind.getBindSteamIdsImg(e.self_id, uid, e.group_id)
      await e.reply(text)
      return true
    }
  },
  unbind: {
    reg: App.getReg('(?:强制)?(?:解除?绑定?|unbind|取消绑定)\\s*(\\d+)?'),
    fnc: async e => {
      const textId = rule.unbind.reg.exec(e.msg)[1]
      if (!textId) {
        await e.reply('要和SteamID或好友码一起发送哦')
        return true
      }
      const isForce = e.msg.includes('强制') && e.isMaster
      // 如果是主人可以at其他用户进行绑定
      const uid = utils.bot.getAtUid(e.isMaster ? e.at : '', e.user_id)
      const userBindAll = await db.UserTableGetDataByUserId(uid)
      const index = Number(textId) <= userBindAll.length ? Number(textId) - 1 : -1
      const steamId = index >= 0 ? userBindAll[index].steamId : utils.steam.getSteamId(textId)
      // 检查steamId是否被绑定
      const bindInfo = await db.UserTableGetDataBySteamId(steamId)
      if (bindInfo) {
        if (bindInfo.userId == uid || isForce) {
          const id = isForce ? bindInfo.userId : uid
          await db.UserTableDelSteamIdByUserId(id, steamId).then(() => {
            const text = [segment.at(id), `\n已解除绑定${steamId}`]
            e.reply(text)
          }).catch(err => {
            console.error(err)
            e.reply('解绑失败了, 请稍后再试\n', err.message)
          })
          // const text = await bind.getBindSteamIdsImg(e.self_id, id, e.group_id)
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

export const app = new App(appInfo, rule).create()
