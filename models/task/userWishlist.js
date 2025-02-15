import _ from 'lodash'
import moment from 'moment'
import schedule from 'node-schedule'
import { api, db, utils } from '#models'
import { Config, Render } from '#components'
import { logger, redis, segment } from '#lib'

let timer = null

const redisKey = 'steam-plugin:user-wishlist-time:'

export function startTimer () {
  if (Config.push.userWishlistChange == 0 || !Config.push.userWishlistTime) {
    return
  }
  clearInterval(timer)
  timer?.cancel?.()
  if (Number(Config.push.userWishlistTime)) {
    timer = setInterval(callback, 1000 * 60 * Config.push.userWishlistTime)
  } else {
    timer = schedule.scheduleJob(Config.push.userWishlistTime, callback)
  }
}

export async function callback () {
  logger.info('开始检查Steam用户愿望单信息')
  const pushList = await db.push.getAll({ wishlist: true }, true)
  for (const i of _.uniqBy(pushList, 'steamId')) {
    try {
      const wishlist = await api.IWishlistService.GetWishlist(i.steamId)
      const lastTime = await redis.get(redisKey + i.steamId)
      const nowTime = moment().unix()
      redis.set(redisKey + i.steamId, nowTime)
      if (!lastTime) {
        continue
      }
      const addItems = wishlist.filter(i => i.date_added > Number(lastTime))
      if (!addItems.length) {
        continue
      }
      const infoMap = await api.IStoreBrowseService.GetItems(addItems.map(i => i.appid)).catch(() => ({}))
      const games = addItems.map(i => {
        const info = infoMap[i.appid]
        return {
          ...i,
          name: info.name,
          desc: moment.unix(i.date_added).format('YYYY-MM-DD HH:mm:ss')
        }
      })
      for (const g of pushList.filter(p => p.steamId === i.steamId)) {
        const username = await utils.bot.getUserName(g.botId, g.userId, g.groupId)
        if (Config.push.pushMode == 1) {
          for (const i of games) {
            const msg = [
              segment.image(i.image),
              `[Steam] ${username}的愿望单新增: ${i.name}`
            ]
            await utils.bot.sendGroupMsg(g.botId, g.groupId, msg)
          }
        } else {
          const img = await Render.render('inventory/index', {
            data: [{
              title: `${username}的愿望单新增`,
              games
            }]
          })
          await utils.bot.sendGroupMsg(g.botId, g.groupId, img)
        }
      }
    } catch { }
  }
}
