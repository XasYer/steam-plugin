import { App, Config, Render } from '#components'
import { api, utils } from '#models'
import axios from 'axios'
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
  },
  beseOfYear: {
    reg: App.getReg('年度最?([畅热]销|新品|VR|抢先体验|热玩|DECK|控制器)?(?:游戏)?(?:排行榜?单?)\\s*(\\d*)'),
    cfg: {
      tips: true
    },
    fnc: async e => {
      const regRet = rule.beseOfYear.reg.exec(e.msg)
      // 指定年份 1-11月为上一年，12月为本年
      const year = regRet[2] || getYear()
      // 从年度最佳页面获取announcement_gid
      const baseURL = api.store.getBaseURL()
      const yearHtml = await axios.get('charts/bestofyear/bestof' + year, {
        baseURL,
        timeout: Config.steam.timeout * 1000
      }).then(res => res.data)
      const announcementGid = /ANNOUNCEMENT_GID&quot;:&quot;(\d+)/.exec(yearHtml)?.[1]
      if (!announcementGid) {
        await e.reply(`获取${year}年度最佳游戏失败...`)
        return true
      }
      const event = await api.store.ajaxgetpartnerevent(39049601, announcementGid)
      // 将返回的json数据转为正常json格式
      const saleSections = JSON.parse(event.jsondata.replace(/\\u[\dA-Fa-f]{4}/g, (match) => {
        return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16))
      })).sale_sections
      const keysMap = {
        畅销: 'game',
        热销: 'game',
        新品: 'new',
        VR: 'vr',
        抢先体验: 'early',
        热玩游戏: 'play',
        DECK: 'deck',
        控制器: 'controller'
      }
      const keys = Object.keys(keysMap)
      // 只获取对应类型
      const type = keysMap[keys.find(i => regRet[1]?.toUpperCase().includes(i)) || '热玩游戏']
      const data = []
      for (let index = 0; index < saleSections.length; index++) {
        const value = saleSections[index]
        // text_section_contents 为年度最佳游戏标题 6是简体中文
        if (value.section_type === 'text_section') {
          const text = value.text_section_contents[6]
          // 年度开头
          if (text.startsWith('年度')) {
            // 看看是不是对应类型
            const key = keys.find(i => text.toUpperCase().includes(i))
            if (key && keysMap[key] === type) {
              data.push({
                title: year + text,
                desc: [
                  '其他排行: 畅销|新品|vr|抢先体验|热玩|deck|控制器']
              })
              // 获取对应的游戏
              while (true) {
                index++
                if (saleSections[index].section_type === 'items') {
                  data.push({
                    title: saleSections[index].localized_label[6],
                    games: saleSections[index].capsules.map(i => i.id)
                  })
                } else {
                  break
                }
              }
              break
            }
          }
        }
      }
      // 获取对应游戏信息
      const appids = data.map(i => i.games || []).flat()
      if (!appids.length) {
        await e.reply(`${year}年没有${regRet[1] || '热玩游戏'}的排行呢`)
        return true
      }
      const infos = await api.IStoreBrowseService.GetItems(appids, {
        include_assets: true
      })
      const img = await Render.render('inventory/index', {
        data: data.map(i => {
          if (i.games?.length) {
            i.games = i.games.map(appid => {
              const info = infos[appid]
              if (!info) {
                return { appid }
              } else {
                const price = info.best_purchase_option || {}
                return {
                  name: info.name,
                  appid,
                  image: utils.steam.getHeaderImgUrlByAppid(appid, 'apps', info.assets?.header),
                  price: getPrice(price, info.is_free)
                }
              }
            })
          }
          return i
        })
      })
      await e.reply(img)
      return true
    }
  }
}

function getYear () {
  const m = moment().month()
  const y = moment().year()
  return m < 11 ? y - 1 : y
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
