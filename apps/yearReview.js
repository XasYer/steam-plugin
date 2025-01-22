import { App } from '#components'
import { segment } from '#lib'
import { api, utils } from '#models'
import _ from 'lodash'
import moment from 'moment'

const appInfo = {
  id: 'yearReview',
  name: '年度回顾'
}

const rule = {
  shareImage: {
    reg: App.getReg('年度回顾分享图片\\s*(\\d+|\\d+[-:\\s]\\d+)?'),
    cfg: {
      steamId: true
    },
    fnc: async (e, { steamId }) => {
      const year = e.msg.match(/\d+/g)?.shift() || getYear()
      const images = await api.ISaleFeatureService.GetUserYearInReviewShareImage(steamId, year)
      const i = _.sample(images)
      if (!i) {
        return `年度回顾可见性未公开, 获取失败, 可前往\nhttps://store.steampowered.com/replay/${steamId}/${year}\n进行查看`
      }
      const path = utils.steam.getStaticUrl(i.url_path)
      const buffer = await utils.getImgUrlBuffer(path)
      if (buffer) {
        return segment.image(buffer)
      } else {
        return '图片获取失败，请稍后再试'
      }
    }
  }
}

function getYear () {
  const m = moment().month()
  const y = moment().year()
  return m < 11 ? y - 1 : y
}

export const app = new App(appInfo, rule).create()
