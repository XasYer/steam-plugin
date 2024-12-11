import { App } from '#components'
import { segment } from '#lib'
import { api, utils } from '#models'

const app = {
  id: 'online',
  name: 'Online'
}

export const rule = {
  online: {
    reg: /^#?steam在线(?:统计|数据|人数)?\s*(\d+)?$/i,
    fnc: async e => {
      const appid = rule.online.reg.exec(e.msg)[1]
      if (!appid) {
        await e.reply('需要带上appid哦')
        return true
      }
      const players = await api.ISteamUserStats.GetNumberOfCurrentPlayers(appid)
      if (players === false) {
        await e.reply('查询失败，可能没有这个游戏?')
        return true
      }
      const icon = utils.getHeaderImgUrlByAppid(appid)
      const iconBuffer = await utils.getImgUrlBuffer(icon)
      const msg = []
      if (iconBuffer) {
        msg.push(segment.image(iconBuffer))
      }
      msg.push(`当前在线人数: ${players}`)
      await e.reply(msg)
      return true
    }
  }
}

export const onlineApp = new App(app, rule).create()
