import _ from 'lodash'
import moment from 'moment'
import schedule from 'node-schedule'
import { api, db, utils } from '#models'
import { Config, Render } from '#components'
import { logger, redis, segment } from '#lib'

let timer = null

const redisKey = 'steam-plugin:family-inventory-time:'

export function startTimer () {
  if (!Config.push.familyInventotyAdd || !Config.push.familyInventotyTime) {
    return
  }
  clearInterval(timer)
  timer?.cancel?.()
  if (Number(Config.push.familyInventotyTime)) {
    timer = setInterval(callback, 1000 * 60 * Config.push.familyInventotyTime)
  } else {
    timer = schedule.scheduleJob(Config.push.familyInventotyTime, callback)
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
      const games = []
      for (const app of familyInventory.apps.filter(i => i.rt_time_acquired > Number(lastTime))) {
        const owners = []
        const steamInfos = await api.IPlayerService.GetPlayerLinkDetails(app.owner_steamids)
          .catch(() => app.owner_steamids.map(i => ({ public_data: { persona_name: i, steamid: i } })))
        for (const info of steamInfos) {
          const user = await db.user.getBySteamId(info.public_data.steamid)
          if (user) {
            const username = await utils.bot.getUserName(i.botId, user.userId, i.groupId)
            if (user.userId != username) {
              owners.push(username)
              continue
            }
          }
          owners.push(info.public_data.persona_name)
        }
        games.push({
          name: app.name,
          image: utils.steam.getHeaderImgUrlByAppid(app.appid),
          appid: moment.unix(app.rt_time_acquired).format('YYYY-MM-DD HH:mm:ss'),
          desc: `来自: ${owners.join('、')}`
        })
      }
      if (!games.length) {
        continue
      }
      for (const g of pushList.filter(p => p.steamId === i.steamId)) {
        const username = await utils.bot.getUserName(g.botId, g.userId, g.groupId)
        if (Config.push.pushMode == 1) {
          for (const i of games) {
            const msg = [
              segment.image(i.image),
              `[Steam] ${username}的家庭库存新增:\n${i.name}\n时间: ${i.appid}\n${i.desc}`
            ]
            await utils.bot.sendGroupMsg(g.botId, g.groupId, msg)
          }
        } else {
          const img = await Render.render('inventory/index', {
            data: [{
              title: `${username}的家庭库存新增`,
              games
            }]
          })
          await utils.bot.sendGroupMsg(g.botId, g.groupId, img)
        }
      }
    } catch { }
  }
}
