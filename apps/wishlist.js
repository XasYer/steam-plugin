import _ from 'lodash'
import moment from 'moment'
import { utils, api } from '#models'
import { App, Config, Render } from '#components'

const appInfo = {
  id: 'wishlist',
  name: '愿望单'
}

const rule = {
  list: {
    reg: App.getReg('愿望单\\s*(\\d*)'),
    cfg: {
      tips: true,
      steamId: true
    },
    fnc: async (e, { steamId, uid }) => {
      const nickname = await utils.bot.getUserName(e.self_id, uid, e.group_id) || steamId
      const wishlist = await api.IWishlistService.GetWishlist(steamId)
      if (!wishlist.length) {
        return Config.tips.wishListEmptyTips
      }
      if (wishlist.length > Config.other.hiddenLength) {
        wishlist.length = Config.other.hiddenLength
      }
      // 愿望单没有给name, 尝试获取一下, 顺便也可以获取一下价格 获取失败超过3次就不再获取了
      // 2024年11月27日 已更新 有个api可以获取多个appid 仅url长度限制
      const appidsInfo = await api.IStoreBrowseService.GetItems(wishlist.map(i => i.appid), {
        include_assets: true
      })
      for (const i in wishlist) {
        const appid = wishlist[i].appid
        const info = appidsInfo[appid]
        if (!info) {
          wishlist[i].price = {
            discount: 0,
            original: '获取失败'
          }
          continue
        }
        wishlist[i].image = utils.steam.getHeaderImgUrlByAppid(appid, 'apps', info.assets?.header)
        wishlist[i].desc = moment.unix(wishlist[i].date_added).format('YYYY-MM-DD HH:mm:ss')
        wishlist[i].name = info.name
        wishlist[i].price = info.is_free
          ? {
              discount: 0,
              original: '免费'
            }
          : {
              discount: info.best_purchase_option?.discount_pct || 0,
              original: info.best_purchase_option?.formatted_original_price || info.best_purchase_option?.formatted_final_price || '即将推出',
              current: info.best_purchase_option?.formatted_final_price || ''
            }
      }
      const data = [{
        title: `${nickname} 愿望单共有 ${wishlist.length} 个游戏`,
        games: _.orderBy(wishlist, 'date_added', 'desc')
      }]
      return await Render.render('inventory/index', {
        data
      })
    }
  },
  add: {
    reg: App.getReg('[添增]加愿望单\\s*(\\d*)'),
    cfg: {
      accessToken: true,
      appid: true
    },
    fnc: async (e, { appid, accessToken }) => {
      await api.IWishlistService.AddToWishlist(accessToken, appid)
      return '已添加愿望单~'
    }
  },
  remove: {
    reg: App.getReg('[删移][除出]愿望单\\s*(\\d*)'),
    cfg: {
      accessToken: true,
      appid: true
    },
    fnc: async (e, { appid, accessToken }) => {
      await api.IWishlistService.RemoveFromWishlist(accessToken, appid)
      return '已移出愿望单~'
    }
  }
}

export const app = new App(appInfo, rule).create()
