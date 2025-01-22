import { App } from '#components'
import { segment } from '#lib'
import { api, utils } from '#models'

const appInfo = {
  id: 'online',
  name: 'Online'
}

const rule = {
  online: {
    reg: App.getReg('在线(?:统计|数据|人数)?\\s*(\\d*)'),
    cfg: {
      appid: true
    },
    fnc: async (e, { appid }) => {
      const players = await api.ISteamUserStats.GetNumberOfCurrentPlayers(appid)
      if (players === false) {
        return '查询失败，可能没有这个游戏?'
      }
      const icon = utils.steam.getHeaderImgUrlByAppid(appid)
      const iconBuffer = await utils.getImgUrlBuffer(icon)
      const msg = []
      if (iconBuffer) {
        msg.push(segment.image(iconBuffer))
      }
      msg.push(`当前在线人数: ${players}`)
      return msg
    }
  }
}

export const app = new App(appInfo, rule).create()
