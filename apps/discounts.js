import { App, Render } from '#components'
import { api } from '#models'
import moment from 'moment'

const app = {
  id: 'discounts',
  name: '优惠'
}

export const rule = {
  discounts: {
    reg: /^#?steam(优惠|特惠|热销|新品|即将推出)$/,
    fnc: async e => {
      e.reply('在查了....在查了')
      const res = await api.featuredcategories()
      const items = [
        {
          title: '优惠',
          key: 'specials'
        },
        {
          title: '即将推出',
          key: 'coming_soon'
        },
        {
          title: '热销',
          key: 'top_sellers'
        },
        {
          title: '新品',
          key: 'new_releases'
        }
      ]
      const data = []
      for (const item of items) {
        const key = {
          title: item.title,
          type: 'wishlist',
          games: []
        }
        for (const i of res[item.key].items) {
          key.games.push({
            appid: i.id,
            name: i.name,
            date_added: i.discount_expiration ? moment.unix(i.discount_expiration).format('YYYY-MM-DD HH:mm:ss') : '',
            header_image: i.header_image,
            header_image_type: i.header_image.match(/store_item_assets\/steam\/(.+?)\//)?.[1] || 'apps',
            price_overview: i.discounted
              ? {
                  initial_formatted: `¥ ${i.original_price / 100}`,
                  discount_percent: i.discount_percent,
                  final_formatted: `¥ ${i.final_price / 100}`
                }
              : {
                  initial_formatted: i.original_price ? `¥ ${i.original_price / 100}` : '',
                  discount_percent: 0
                }
          })
        }
        data.push(key)
      }
      const img = await Render.simpleRender('inventory/index', { data })
      if (img) {
        await e.reply(img)
      } else {
        await e.reply('制作图片出错辣! 再试一次吧')
      }
      return true
    }
  }
}

export const discounts = new App(app, rule).create()
