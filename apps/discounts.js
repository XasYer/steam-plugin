import { App, Render } from '#components'
import { api, utils } from '#models'
import { segment } from '#lib'
import moment from 'moment'

const appInfo = {
  id: 'discounts',
  name: '优惠'
}

const rule = {
  discounts: {
    reg: App.getReg('(优惠|特惠|热销|新品|即将推出)'),
    cfg: {
      tips: true
    },
    fnc: async e => {
      const res = await api.store.featuredcategories()
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
          games: []
        }
        for (const i of res[item.key].items) {
          key.games.push({
            appid: i.id,
            name: i.name,
            desc: i.discount_expiration ? moment.unix(i.discount_expiration).format('YYYY-MM-DD HH:mm:ss') : '',
            image: i.image,
            price: i.discounted
              ? {
                  original: `¥ ${i.original_price / 100}`,
                  discount: i.discount_percent,
                  current: `¥ ${i.final_price / 100}`
                }
              : {
                  original: i.original_price ? `¥ ${i.original_price / 100}` : ''
                }
          })
        }
        data.push(key)
      }
      const img = await Render.render('inventory/index', { data })
      await e.reply(img)
      return true
    }
  },
  queue: {
    reg: App.getReg('探索队列'),
    cfg: {
      tips: true
    },
    fnc: async e => {
      const token = await utils.steam.getAccessToken(e.user_id)
      if (!token.success) {
        await e.reply([segment.at(e.user_id), '\n', token.message])
        return true
      }
      const country = await api.IUserAccountService.GetUserCountry(token.accessToken, token.steamId)
      if (!country) {
        await e.reply('获取地区代码失败...')
        return true
      }
      const { appids, skipped } = await api.IStoreService.GetDiscoveryQueue(token.accessToken, country)
      const infoList = await api.IStoreBrowseService.GetItems(appids, { include_assets: true })
      const games = appids.map(appid => {
        const info = infoList[appid]
        if (!info) {
          return {
            appid
          }
        }
        return {
          appid,
          name: info.name,
          image: utils.steam.getHeaderImgUrlByAppid(appid, 'apps', info.assets.header),
          price: getPrice(info.best_purchase_option, info.is_free)
        }
      })
      const data = [{
        title: `${await utils.bot.getUserName(e.self_id, e.user_id, e.group_id)}的探索队列`,
        desc: [`已跳过${skipped}个游戏`, '#steam探索队列跳过+appid', '#steam探索队列全部跳过'],
        games
      }]
      const img = await Render.render('inventory/index', { data })
      await e.reply(img)
      return true
    }
  },
  queueSkip: {
    reg: App.getReg('探索队列(?:全部)?跳过\\s*(\\d*)'),
    fnc: async e => {
      const token = await utils.steam.getAccessToken(e.user_id)
      if (!token.success) {
        await e.reply([segment.at(e.user_id), '\n', token.message])
        return true
      }
      if (e.msg.includes('全部')) {
        const country = await api.IUserAccountService.GetUserCountry(token.accessToken, token.steamId)
        if (!country) {
          await e.reply('获取地区代码失败...')
          return true
        }
        const appids = (await api.IStoreService.GetDiscoveryQueue(token.accessToken, country)).appids
        await Promise.all(appids.map(async appid => await api.IStoreService.SkipDiscoveryQueueItem(token.accessToken, appid)))
        await e.reply('已跳过所有游戏~')
        return true
      }
      const appid = rule.queueSkip.reg.exec(e.msg)[1]
      if (!appid) {
        await e.reply('请输入appid~')
        return true
      }
      await api.IStoreService.SkipDiscoveryQueueItem(token.accessToken, appid)
      await e.reply(`已跳过游戏${appid}~`)
      return true
    }
  }
}

function getPrice (price, isFree) {
  return price?.discount_pct
    ? {
        original: price.formatted_original_price,
        discount: price.discount_pct,
        current: price.formatted_final_price
      }
    : {
        original: isFree ? '免费开玩' : price.formatted_final_price || ''
      }
}

export const app = new App(appInfo, rule).create()
