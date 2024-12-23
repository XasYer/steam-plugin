import { App, Config } from '#components'
import { segment } from '#lib'
import { api, db, utils } from '#models'
import _ from 'lodash'
import moment from 'moment'

const appInfo = {
  id: 'yearReview',
  name: '年度回顾'
}

const rule = {
  shareImage: {
    reg: App.getReg('年度回顾分享图片\\s*(\\d+|\\d+[-:\\s]\\d+)?'),
    fnc: async e => {
      const text = rule.shareImage.reg.exec(e.msg)[1]
      const uid = utils.bot.getAtUid(e.at, e.user_id)
      const { year, steamId } = await (async () => {
        if (text) {
          if (/[-:\s]/.test(text)) {
            const [year, steamId] = text.split(/[-:\s]/)
            return {
              year,
              steamId: utils.steam.getSteamId(steamId)
            }
          } else {
            return {
              year: text,
              steamId: await db.UserTableGetBindSteamIdByUserId(uid)
            }
          }
        } else {
          return {
            year: getYear(),
            steamId: await db.UserTableGetBindSteamIdByUserId(uid)
          }
        }
      })()
      if (!steamId) {
        await e.reply([segment.at(uid), '\n', Config.tips.noSteamIdTips])
        return true
      }
      const images = await api.ISaleFeatureService.GetUserYearInReviewShareImage(steamId, year)
      const i = _.sample(images)
      if (!i) {
        await e.reply(`年度回顾可见性未公开, 获取失败, 可前往\nhttps://store.steampowered.com/replay/${steamId}/${year}\n进行查看`)
        return true
      }
      const path = utils.steam.getStaticUrl(i.url_path)
      const buffer = await utils.getImgUrlBuffer(path)
      if (buffer) {
        await e.reply(segment.image(buffer))
      } else {
        await e.reply('图片获取失败，请稍后再试')
      }
      return true
    }
  }
}

function getYear () {
  const m = moment().month()
  const y = moment().year()
  return m < 11 ? y - 1 : y
}

export const app = new App(appInfo, rule).create()
