import { App } from '#components'
import { segment } from '#lib'
import { api, db, utils } from '#models'
import moment from 'moment'
import QRCode from 'qrcode'

const appInfo = {
  id: 'QRLogin',
  name: '扫码登录'
}

const baseReg = '扫码(?:登[录陆]|绑定)'

const rule = {
  QRLoginTips: {
    reg: App.getReg(`${baseReg}(帮助)?`),
    fnc: async (e) => {
      const msg = [
        '将使用steamApp扫码二维码进行登录, 登录完成后机器人可获得对应账号的access_token并保存, 拥有access_token后可执行各种隐私操作, 请在**特别信任**的机器人上进行扫码登录, 如果确认需要扫码登录, 请先打开steamApp进入扫码界面并使用以下方法(不支持扫描相册二维码)',
        '使用方法:',
        '1. 发送#steam确认扫码登录',
        '可能会出现地区不一致导致Steam阻止登录的情况, 可以先尝试切换到和Bot反代地区一致后再次扫码登录',
        '---------------',
        '2. 本地请求二维码',
        '2.1: 打开Chrome浏览器访问 https://store.steampowered.com/',
        '2.2: 按f12点击控制台/Console,输入以下内容并回车',
        'copy("#steam辅助扫码登录"+await fetch(\'https://api.steampowered.com/IAuthenticationService/BeginAuthSessionViaQR/v1?input_json={"device_details":{"device_friendly_name":"Xiaomi 15 Pro","platform_type":3,"os_type":-500,"gaming_device_type":528},"website_id":"Mobile"}\',{method: \'POST\'}).then(res=>res.json()).then(res=>res.response).then(JSON.stringify).then(res=>{console.log(res);return res}));alert("复制成功")',
        '2.3 弹窗复制成功后发送复制后的内容到机器人',
        'ps: 需自行处理代理保证请求和扫码的地址一致'
      ]
      await utils.bot.makeForwardMsg(e, msg)
      return true
    }
  },
  QRLogin: {
    reg: App.getReg(`(?:确认|辅助)${baseReg}(.*)`),
    fnc: async (e) => {
      const input = rule.QRLogin.reg.exec(e.msg)[1].trim()
      let session = input ? JSON.parse(input) : await api.IAuthenticationService.BeginAuthSessionViaQR()
      if (session.response) {
        session = session.response
      }
      const qrcode = (await QRCode.toDataURL(session.challenge_url)).replace('data:image/png;base64,', 'base64://')
      await App.reply(e, ['请在30秒内使用steamApp扫描二维码进行登录', segment.image(qrcode)], {
        recallMsg: 30,
        quote: true
      })
      for (let i = 0; i < 6; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000 * 5))
        const qrcodeRes = await api.IAuthenticationService.PollAuthSessionStatus(session.client_id, session.request_id).catch(() => ({}))
        if (qrcodeRes.access_token) {
          const dbRes = await db.TokenTableAddData(e.user_id, qrcodeRes.access_token, qrcodeRes.refresh_token)
          const user = await db.UserTableGetDataBySteamId(dbRes.steamId)
          if (user?.userId) {
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
  },
  refreshToken: {
    reg: App.getReg('刷新(access_token|token|ak|ck|accesstoken|cookie)'),
    fnc: async e => {
      const accessToken = await utils.steam.getAccessToken(e.user_id)
      if (!accessToken.success) {
        await e.reply([segment.at(e.user_id), '\n', accessToken.message])
        return true
      }
      await utils.steam.refreshAccessToken(accessToken, true)
      await e.reply([segment.at(e.user_id), '\n', 'access_token已刷新~'])
      return true
    }
  },
  showToken: {
    reg: App.getReg('我的(access_token|token|ak|ck|accesstoken|cookie)'),
    fnc: async e => {
      if (e.group_id) {
        await e.reply([segment.at(e.user_id), '\n', '请私聊查看'])
        return true
      }
      const accessToken = await utils.steam.getAccessToken(e.user_id)
      if (!accessToken.success) {
        await e.reply([segment.at(e.user_id), '\n', accessToken.message])
        return true
      }
      const jwt = utils.steam.decodeAccessTokenJwt(accessToken.token)
      await e.reply([accessToken.token])
      await e.reply(`过期时间: ${moment.unix(jwt.exp).format('YYYY-MM-DD HH:mm:ss')}`)
      return true
    }
  },
  deleteToken: {
    reg: App.getReg('删除(access_token|token|ak|ck|accesstoken|cookie)'),
    fnc: async e => {
      const accessToken = await utils.steam.getAccessToken(e.user_id)
      if (!accessToken.success) {
        await e.reply([segment.at(e.user_id), '\n', accessToken.message])
        return true
      }
      await db.TokenTableDeleteByUserIdAndSteamId(e.user_id, accessToken.steamId)
      await e.reply([segment.at(e.user_id), '\n', 'access_token已删除~'])
      return true
    }
  }
}

export const app = new App(appInfo, rule).create()
