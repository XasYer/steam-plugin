import { App } from '#components'
import { segment } from '#lib'
import { api, db } from '#models'
import QRCode from 'qrcode'

const appInfo = {
  id: 'QRLogin',
  name: '扫码登录'
}

const baseReg = '扫码(登[录陆]|绑定)'

const rule = {
  QRLoginTips: {
    reg: App.getReg(baseReg),
    fnc: async (e) => {
      const tips = '将使用steamApp扫码二维码进行登录, 登录完成后机器人可获得对应账号的access_token并保存, 拥有access_token后可执行各种隐私操作, 请在**特别信任**的机器人上进行扫码登录, 如果确认需要扫码登录, 请先打开steamApp进入扫码界面并继续发送(不支持扫描相册二维码)\n#steam确认扫码登录'
      await e.reply(tips)
      verify[e.user_id] = true
      return true
    }
  },
  QRLogin: {
    reg: App.getReg(`确认${baseReg}`),
    fnc: async (e) => {
      if (!verify[e.user_id]) return true
      const session = await api.IAuthenticationService.BeginAuthSessionViaQR()
      const qrcode = (await QRCode.toDataURL(session.challenge_url)).replace('data:image/png;base64,', 'base64://')
      await App.reply(e, ['请使用30秒内使用steamApp扫描二维码进行登录', segment.image(qrcode)], {
        recallMsg: 30,
        quote: true
      })
      for (let i = 0; i < 6; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000 * 5))
        const qrcodeRes = await api.IAuthenticationService.PollAuthSessionStatus(session.client_id, session.request_id).catch(() => ({}))
        if (qrcodeRes.access_token) {
          const dbRes = await db.TokenTableAddData(e.user_id, qrcodeRes.access_token, qrcodeRes.refresh_token)
          const user = await db.UserTableGetDataBySteamId(dbRes.steamId)
          if (user.userId) {
            if (user.userId != e.user_id) {
              await db.UserTableDelSteamIdByUserId(user.userId, dbRes.steamId)
              await db.UserTableAddSteamIdByUserId(e.user_id, dbRes.steamId)
            } else {
              await db.UserTableBindSteamIdByUserId(e.user_id, dbRes.steamId, true)
            }
          } else {
            await db.UserTableAddSteamIdByUserId(e.user_id, dbRes.steamId)
          }
          await e.reply(`登录成功\nsteamId: ${dbRes.steamId}\n登录名: ${qrcodeRes.account_name.replace(/^(.)(.*)(.)$/, '$1***$3')}\n需要切换到对应的steamId才会生效`)
          return true
        }
      }
      await e.reply('登录超时~请重新触发指令')
      return true
    }
  }
}

const verify = {}

export const app = new App(appInfo, rule).create()
