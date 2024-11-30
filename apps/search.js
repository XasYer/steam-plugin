import { api } from '#models'
import { App, Render } from '#components'

const app = {
  id: 'search',
  name: '搜索'
}

export const rule = {
  search: {
    reg: /^#?steam(?:搜索|search|查找|find)\s*(.*)$/i,
    fnc: async e => {
      const name = rule.search.reg.exec(e.msg)[1].trim()
      if (!name) {
        await e.reply('要搜什么?')
        return true
      }
      const result = await api.store.search(name)
      const games = result.split('</a>').map(i => {
        if (!i.includes('appid')) {
          return null
        }
        const appid = i.match(/data-ds-appid="(\d+)"/)?.[1]
        const name = i.match(/class="match_name">(.*?)<\/div>/)?.[1]
        const price = i.match(/class="match_price">(.*?)<\/div>/)?.[1]
        return {
          appid,
          name,
          price: {
            discount: 0,
            original: price
          }
        }
      }).filter(Boolean)
      if (!games.length) {
        await e.reply(`没有搜索到${name}相关的游戏, 换个关键词试试?`)
        return true
      }
      const screenshotOptions = {
        title: `${name} 搜索结果`,
        games,
        size: 'large'
      }
      const img = await Render.render('inventory/index', { data: [screenshotOptions] })
      if (img) {
        await e.reply(img)
      } else {
        await e.reply('制作图片出错辣! 再试一次吧')
      }
      return true
    }
  }
}

export const search = new App(app, rule).create()
