import { App } from '#components'
import { segment } from '#lib'
import { api, db, utils } from '#models'
import _ from 'lodash'

const app = {
  id: 'yearReview',
  name: '年度回顾'
}

export const rule = {
  shareImage: {
    reg: /^#?steam年度回顾分享图片\s*(\d+|\d+[-:\s]\d+)?$/,
    fnc: async e => {
      const text = rule.shareImage.reg.exec(e.msg)[1]
      const uid = utils.getAtUid(e.at, e.user_id)
      const { year, steamId } = await (async () => {
        if (text) {
          if (/[-:\s]/.test(text)) {
            const [year, steamId] = text.split(/[-:\s]/)
            return {
              year,
              steamId: utils.getSteamId(steamId)
            }
          } else {
            return {
              year: new Date().getFullYear(),
              steamId: utils.getSteamId(text)
            }
          }
        } else {
          return {
            year: new Date().getFullYear(),
            steamId: await db.UserTableGetBindSteamIdByUserId(uid)
          }
        }
      })()
      const images = await api.ISaleFeatureService.GetUserYearInReviewShareImage(steamId, year)
      const i = _.sample(images)
      const path = utils.getStaticUrl(i.url_path)
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

export const yearReviewApp = new App(app, rule).create()
