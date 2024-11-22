import { App, Render } from '#components'
import { api } from '#models'

const app = {
  id: 'review',
  name: '评论'
}

export const rule = {
  review: {
    reg: /^#?steam(?:最新|热门)?评论\s*(\d+)?$/i,
    fnc: async e => {
      const appid = rule.review.reg.exec(e.msg)[1]?.trim()
      if (!appid) {
        await e.reply('需要带上appid哦')
        return true
      }
      const data = await api.store.appreviews(appid, 20, e.msg.includes('最新'))
      const [, state, honor] = /data-tooltip-html="(.+?)">(.+?)<\//.exec(data.review_score) || []
      const img = await Render.render('review/index', {
        review: data.html,
        state,
        honor,
        appid
      })
      await e.reply(img)
      return true
    }
  }
}

export const reviewApp = new App(app, rule).create()
