import { api } from '#models'
import { App, Render } from '#components'

const appInfo = {
  id: 'search',
  name: '搜索'
}

const rule = {
  search: {
    reg: App.getReg('(?:搜索|search|查找|find)\\s*(.*)'),
    cfg: {
      tips: true
    },
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
        games

      }
      const img = await Render.render('inventory/index', { data: [screenshotOptions] })
      await e.reply(img)
      return true
    }
  }
}

export const app = new App(appInfo, rule).create()
