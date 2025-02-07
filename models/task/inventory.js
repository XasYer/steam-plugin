import _ from 'lodash'
import moment from 'moment'
import schedule from 'node-schedule'
import { logger, redis } from '#lib'
import { api, db, utils } from '#models'
import { Config, Render } from '#components'

let timer = null

const redisKey = 'steam-plugin:family-inventory-time:'

export function startTimer () {
  if (!Config.push.familyInventotyAdd || !Config.push.familyInventotyTime) {
    return
  }
  clearInterval(timer)
  timer?.cancel?.()
  if (Number(Config.push.time)) {
    timer = setInterval(callback, 1000 * 60 * Config.push.time)
  } else {
    timer = schedule.scheduleJob(Config.push.time, callback)
  }
}

async function callback () {
  logger.info('开始检查Steam家庭库存信息')
  const pushList = await db.familyInventoryPush.getAll()
  for (const i of _.uniqBy(pushList, 'steamId')) {
    try {
      const token = await utils.steam.getAccessToken(i.userId, i.steamId)
      if (!token.success) {
        continue
      }
      const familyInfo = await api.IFamilyGroupsService.GetFamilyGroupForUser(token.accessToken, token.steamId)
      if (!familyInfo.family_groupid) {
        continue
      }
      const familyInventory = await api.IFamilyGroupsService.GetSharedLibraryApps(token.accessToken, familyInfo.family_groupid, token.steamId)
      if (!familyInventory.apps.length) {
        continue
      }
      const lastTime = await redis.get(redisKey + i.steamId)
      const nowTime = moment().unix()
      redis.set(redisKey + i.steamId, nowTime)
      if (!lastTime) {
        continue
      }
      const games = familyInventory.apps.filter(i => i.rt_time_acquired > Number(lastTime)).map(i => ({
        name: i.name,
        appid: i.appid,
        desc: moment.unix(i.rt_time_acquired).format('YYYY-MM-DD HH:mm:ss')
      }))
      if (!games.length) {
        continue
      }
      for (const g of pushList.filter(p => p.steamId === i.steamId)) {
        const username = await utils.bot.getUserName(g.botId, g.userId, g.groupId)
        const img = await Render.render('inventory/index', {
          data: [{
            title: `${username}的家庭库存新增`,
            games
          }]
        })
        await utils.bot.sendGroupMsg(g.botId, g.groupId, img)
      }
    } catch { }
  }
}
