import { App, Render } from '#components'
import { api, utils } from '#models'
import moment from 'moment'

const appInfo = {
  id: 'charts',
  name: '排行榜'
}

const rule = {
  mostplayed: {
    reg: App.getReg('(当前|[每当][日天])?(热玩|在线人数|玩家数量?)排行榜?单?'),
    cfg: {
      tips: true
    },
    fnc: async e => {
      const isDay = e.msg.includes('日')
      const games = []
      let updateTime
      if (isDay) {
        const res = await api.ISteamChartsService.GetMostPlayedGames()
        updateTime = res.rollup_date
        for (const i of res.ranks) {
          const change = (i.last_week_rank >= 1 && i.last_week_rank <= 100) ? i.last_week_rank - i.rank : '新上榜'
          const price = i.item.best_purchase_option || {}
          games.push({
            name: i.item.name,
            appid: change ? `变更: ${change > 0 ? `+${change}` : change}` : '',
            desc: `峰值: ${i.peak_in_game}`,
            image: utils.steam.getHeaderImgUrlByAppid(i.appid),
            price: getPrice(price, i.item.is_free)
          })
        }
      } else {
        const res = await api.ISteamChartsService.GetGamesByConcurrentPlayers()
        updateTime = res.last_update
        for (const i of res.ranks) {
          const price = i.item.best_purchase_option || {}
          games.push({
            name: i.item.name,
            appid: `当前玩家: ${i.concurrent_in_game}`,
            desc: `峰值: ${i.peak_in_game}`,
            image: utils.steam.getHeaderImgUrlByAppid(i.appid),
            price: getPrice(price, i.item.is_free)
          })
        }
      }
      const data = [
        {
          title: `${isDay ? '每日' : '当前'}玩家数量最多的游戏排行榜`,
          desc: `${isDay ? '汇总' : '更新'}时间: ${moment.unix(updateTime).format('YYYY-MM-DD HH:mm:ss')}`,
          games
        }
      ]
      const img = await Render.render('inventory/index', { data })
      await e.reply(img)
      return true
    }
  },
  topnewreleases: {
    reg: App.getReg('最?热门?新品排行榜?单?'),
    cfg: {
      tips: true
    },
    fnc: async e => {
      const topNewReleases = await api.ISteamChartsService.GetTopReleasesPages()
      const appids = topNewReleases.map(i => i.item_ids).flat()
      const appInfo = await api.IStoreBrowseService.GetItems(appids.map(i => i.appid), {
        include_release: true,
        include_reviews: true,
        include_assets: true
      })
      const data = []
      for (const i of topNewReleases) {
        data.push({
          title: `${moment.unix(i.start_of_month).format('YYYY年MM月')} 最热新品 (随机排序)`,
          games: i.item_ids.map(({ appid }) => {
            const info = appInfo[appid]
            if (!info) {
              return { appid }
            }
            const price = info.best_purchase_option || {}
            return {
              name: info.name,
              appid: `${appid} ${info.reviews?.summary_filtered.review_score_label || ''}`,
              desc: info.release ? `${moment.unix(info.release.steam_release_date).format('YYYY年MM月DD日')}` : '',
              image: utils.steam.getHeaderImgUrlByAppid(appid, 'apps', info.assets?.header),
              price: getPrice(price, info.is_free)
            }
          })
        })
      }
      const img = await Render.render('inventory/index', { data })
      await e.reply(img)
      return true
    }
  },
  topsellers: {
    reg: App.getReg('([本上每]?周)?热销排行榜?单?'),
    cfg: {
      tips: true
    },
    fnc: async e => {
      const isLastWeek = e.msg.includes('上')
      const lastWeekData = await api.IStoreTopSellersService.GetWeeklyTopSellers()
      const tuesdayTime = moment().day(2).format('YYYY年MM月DD日')
      const statisticalTime = isLastWeek
        ? `${moment.unix(lastWeekData.start_date).format('YYYY年MM月DD日')} - ${tuesdayTime}`
        : `${tuesdayTime} - 现在`
      const games = []
      if (isLastWeek) {
        for (const i of lastWeekData.ranks) {
          const change = i.first_top100 ? '新上榜' : (i.last_week_rank - i.rank || '')
          const price = i.item.best_purchase_option || {}
          games.push({
            name: i.item.name,
            appid: change ? `变更: ${change > 0 ? `+${change}` : change}` : '',
            desc: `持续周数: ${i.consecutive_weeks}`,
            image: utils.steam.getHeaderImgUrlByAppid(i.appid),
            price: getPrice(price, i.item.is_free)
          })
        }
      } else {
        const thisWeekData = await api.IStoreQueryService.Query('SteamCharts Live Top Sellers')
        for (const index in thisWeekData) {
          const i = thisWeekData[index]
          const lastWeekInfo = lastWeekData.ranks.find(item => item.item.appid === i.appid)
          const change = lastWeekInfo ? lastWeekInfo.rank - index + 1 : '新上榜'
          const price = i.best_purchase_option || {}
          games.push({
            name: i.name,
            appid: change ? `变更: ${change > 0 ? `+${change}` : change}` : '',
            desc: `持续周数: ${lastWeekInfo ? lastWeekInfo.consecutive_weeks : 1}`,
            image: utils.steam.getHeaderImgUrlByAppid(i.appid),
            price: getPrice(price, i.is_free)
          })
        }
      }
      const data = [
        {
          title: `${isLastWeek ? '上' : '本'}周热销游戏排行榜`,
          desc: `统计时间: ${statisticalTime}`,
          games
        }
      ]
      const img = await Render.render('inventory/index', { data })
      await e.reply(img)
      return true
    }
  }
}

function getPrice (price, isFree) {
  return price.discount_pct
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
