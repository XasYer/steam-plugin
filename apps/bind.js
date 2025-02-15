import { utils, db, bind } from '#models'
import { App, Config } from '#components'
import { logger } from '#lib'

const appInfo = {
  id: 'bind',
  name: '绑定Steam'
}

const rule = {
  getBindImg: {
    // 这个指令必须# 不然可能会误触发
    reg: /^#steam$/i,
    fnc: async e => await bind.getBindSteamIdsImg(e.self_id, utils.bot.getAtUid(e.at, e.user_id), e.group_id)
  },
  bind: {
    reg: App.getReg('(?:[切更]换)?(?:绑定|bind)\\s*(\\d+)?'),
    fnc: async e => {
      // 如果是主人可以at其他用户进行绑定
      const uid = utils.bot.getAtUid(e.isMaster ? e.at : '', e.user_id)
      const textId = rule.bind.reg.exec(e.msg)[1]
      const userBindAll = await db.user.getAllByUserId(uid)
      if (!textId) {
        return await bind.getBindSteamIdsImg(e.self_id, uid, e.group_id, userBindAll)
      }
      const index = Number(textId) <= userBindAll.length ? Number(textId) - 1 : -1
      const steamId = index >= 0 ? userBindAll[index].steamId : utils.steam.getSteamId(textId)
      // 检查steamId是否被绑定
      const bindInfo = await db.user.getBySteamId(steamId)
      if (bindInfo) {
        if (bindInfo.userId == uid) {
          await db.user.set(uid, steamId)
        } else {
          return Config.tips.repeatBindTips
        }
      } else {
        await db.user.add(uid, steamId)
        // 群聊绑定才添加
        if (e.group_id) {
          await db.push.setNA(uid, steamId)
          await db.push.set(uid, steamId, e.self_id, e.group_id, {
            play: Config.push.defaultPush,
            state: Config.push.defaultPush,
            inventory: false,
            wishlist: false
          })
        }
      }
      return await bind.getBindSteamIdsImg(e.self_id, uid, e.group_id)
    }
  },
  unbind: {
    reg: App.getReg('(?:强制)?(?:解除?绑定?|unbind|取消绑定)\\s*(\\d+)?'),
    fnc: async e => {
      const textId = rule.unbind.reg.exec(e.msg)[1]
      if (!textId) {
        return '要和SteamID或好友码一起发送哦'
      }
      const isForce = e.msg.includes('强制') && e.isMaster
      // 如果是主人可以at其他用户进行绑定
      const uid = utils.bot.getAtUid(e.isMaster ? e.at : '', e.user_id)
      const userBindAll = await db.user.getAllByUserId(uid)
      const index = Number(textId) <= userBindAll.length ? Number(textId) - 1 : -1
      const steamId = index >= 0 ? userBindAll[index].steamId : utils.steam.getSteamId(textId)
      // 检查steamId是否被绑定
      const bindInfo = await db.user.getBySteamId(steamId)
      if (bindInfo) {
        if (bindInfo.userId == uid || isForce) {
          const id = isForce ? bindInfo.userId : uid
          try {
            await db.user.del(id, steamId)
            return `已解除绑定${steamId}`
          } catch (error) {
            logger.error(error)
            return `解绑失败了, 请稍后再试\n${error.message}`
          }
        } else {
          return '只能解绑自己绑定的steamId哦'
        }
      }
      return '还没有人绑定这个steamId呢'
    }
  }
}

export const app = new App(appInfo, rule).create()
