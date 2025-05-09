import _ from 'lodash'
import moment from 'moment'
import schedule from 'node-schedule'
import { api, db, utils } from '#models'
import { Config, Render } from '#components'
import { logger } from '#lib'

let timer = null

export function startTimer () {
  if (Config.push.priceChange == 0 || !Config.push.priceChangeTime) {
    return
  }
  clearInterval(timer)
  timer?.cancel?.()
  if (Number(Config.push.priceChangeTime)) {
    timer = setInterval(callback, 1000 * 60 * Config.push.priceChangeTime)
  } else {
    timer = schedule.scheduleJob(Config.push.priceChangeTime, callback)
  }
}

export async function callback () {
  logger.info('开始检查Steam游戏价格变化')
  const list = await db.priceChangePush.getAll()
  const appids = _.uniq(_.map(list, 'appid'))
  if (!appids.length) {
    return
  }
  const now = moment().unix()
  const updateLastTimeAppids = []
  const deleteLastTimeAppids = []
  const group = {}
  const infoList = await api.IStoreBrowseService.GetItems(appids, { include_assets: true })
  for (const appid in infoList) {
    const info = infoList[appid]
    const price = utils.steam.generatePrice(info.best_purchase_option, info.is_free)
    list.filter(i => i.appid == appid).forEach(({ groupId, lastTime, botId }) => {
      // 有最后一次推送的时间但是没有打折那就是打折时间过了
      if (lastTime && !price.discount) {
        deleteLastTimeAppids.push(appid)
        return
      }
      // 有最后一次推送时间并且还在打折 看看需不需要每次都推送
      if (lastTime && price.discount && Config.push.priceChangeType == 1) {
        return
      }
      // 没有最后一次推送时间并且也没有打折
      if (!lastTime && !price.discount) {
        return
      }
      // 只剩没有最后一次推送时间并且正在打折 直接推送
      if (!group[botId]) {
        group[botId] = {}
      }
      if (!group[botId][groupId]) {
        group[botId][groupId] = []
      }
      const unix = info.best_purchase_option.active_discounts.shift().discount_end_date
      group[botId][groupId].push({
        appid,
        name: info.name,
        price,
        desc: `结束时间: ${moment.unix(unix).format('YYYY-MM-DD')}`,
        image: utils.steam.getHeaderImgUrlByAppid(appid, 'apps', info.assets?.header)
      })
      if (updateLastTimeAppids.indexOf(appid) == -1) {
        updateLastTimeAppids.push(appid)
      }
    })
  }
  db.priceChangePush.updateLastTime(updateLastTimeAppids, now).catch(e => {})
  db.priceChangePush.updateLastTime(deleteLastTimeAppids, 0).catch(e => {})
  for (const botId in group) {
    const botList = group[botId]
    for (const groupId in botList) {
      const games = botList[groupId]
      const data = [{
        title: 'Steam降价推送',
        games
      }]
      const img = await Render.render('inventory/index', {
        data
      })
      await utils.bot.sendGroupMsg(botId, groupId, img)
    }
  }
}
