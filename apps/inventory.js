import { utils, db, api } from '#models'
import { segment } from '#lib'
import { Render, App, Config } from '#components'
import moment from 'moment'
import _ from 'lodash'

const app = {
  id: 'inventory',
  name: '库存'
}

export const rule = {
  inventory: {
    reg: /^#?steam(?:库存|游戏列表|(?:最近|近期)(?:游?玩|运行|启动)|愿望单)\s*(\d+)?$/i,
    fnc: async e => {
      const textId = rule.inventory.reg.exec(e.msg)?.[1]
      const uid = utils.getAtUid(e.at, e.user_id)
      const steamId = textId ? utils.getSteamId(textId) : await db.UserTableGetBindSteamIdByUserId(uid)
      if (!steamId) {
        await e.reply([segment.at(uid), '\n还没有绑定steamId哦, 先绑定steamId吧'])
        return true
      }
      e.reply([segment.at(uid), '\n在查了...在查了...'])
      const nickname = textId || await utils.getUserName(e.self_id, uid, e.group_id)
      const screenshotOptions = {
        title: '',
        games: [],
        size: 'small',
        desc: ''
      }
      if (e.msg.includes('近')) {
        const games = await api.IPlayerService.GetRecentlyPlayedGames(steamId)
        if (!games.length) {
          await e.reply([segment.at(uid), '\n最近电子阳痿了'])
          return true
        }
        screenshotOptions.games = _.orderBy(games, 'playtime_2weeks', 'desc')
        screenshotOptions.title = `${nickname} 近期游玩了 ${games.length} 个游戏`
      } else if (e.msg.includes('愿')) {
        const wishlist = await api.IWishlistService.GetWishlist(steamId)
        if (!wishlist.length) {
          await e.reply([segment.at(uid), '\n愿望当场就实现了, 羡慕'])
          return true
        }
        if (wishlist.length > Config.other.hiddenLength) {
          wishlist.length = Config.other.hiddenLength
        }
        // 愿望单没有给name, 尝试获取一下, 顺便也可以获取一下价格 获取失败超过3次就不再获取了
        // 2024年11月27日 已更新 有个api可以获取多个appid
        const appidsInfo = await api.IStoreBrowseService.GetItems(wishlist.map(i => i.appid))
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
        screenshotOptions.title = `${nickname} 愿望单共有 ${wishlist.length} 个游戏`
        screenshotOptions.games = _.orderBy(wishlist, 'date_added', 'desc')
        screenshotOptions.size = 'large'
      } else {
        const games = await api.IPlayerService.GetOwnedGames(steamId)
        if (!games.length) {
          await e.reply([segment.at(uid), '\n获得成就: 没有给G胖一分钱'])
          return true
        }
        screenshotOptions.games = _.orderBy(games, 'playtime_forever', 'desc')
        screenshotOptions.title = `${nickname} 库存共有 ${games.length} 个游戏`
      }
      if (screenshotOptions.size === 'small') {
        let playtimeForever = 0
        let playtime2weeks = 0
        screenshotOptions.games.map(i => {
          i.desc = `${getTime(i.playtime_forever)} ${i.playtime_2weeks ? `/ ${getTime(i.playtime_2weeks)}` : ''}`
          playtimeForever += i.playtime_forever
          i.playtime_2weeks && (playtime2weeks += i.playtime_2weeks)
          return i
        })
        screenshotOptions.desc = `总游戏时长：${getTime(playtimeForever)} / 最近两周游戏时长：${getTime(playtime2weeks)}`
      }
      const img = await Render.render('inventory/index', {
        data: [screenshotOptions]
      })
      if (img) {
        await e.reply(img)
      } else {
        await e.reply([segment.at(uid), '\n制作图片出错辣! 再试一次吧'])
      }
      return true
    }
  }
}

/**
 * 将游戏时长(单位:分)转换小时
 * @param {number} time
 * @returns {string}
*/
function getTime (time) {
  return (time / 60).toFixed(1) + 'h'
}

export const inventory = new App(app, rule).create()
