import _ from 'lodash'
import schedule from 'node-schedule'
import { api, db, utils } from '#models'
import { Config, Render } from '#components'
import { logger, segment } from '#lib'

let timer = null

export function startTimer () {
  if (Config.push.userInventoryChange == 0 || !Config.push.userInventoryTime) {
    return
  }
  clearInterval(timer)
  if (Number(Config.push.userInventoryTime)) {
    timer = setInterval(callback, 1000 * 60 * Config.push.userInventoryTime)
  } else {
    timer = schedule.scheduleJob(Config.push.userInventoryTime, callback)
  }
}

export async function callback () {
  logger.info('开始检查Steam个人库存信息')
  const pushList = await db.push.getAll({ inventory: true }, true)
  for (const i of _.uniqBy(pushList, 'steamId')) {
    try {
      const newGames = await api.IPlayerService.GetOwnedGames(i.steamId)
      const newGamesAppids = newGames.map(i => i.appid)
      const oldGamesAppids = await db.userInventory.get(i.steamId)
      // 缓存新库存信息
      await db.userInventory.set(i.steamId, newGamesAppids)
      if (!oldGamesAppids.length) {
        continue
      }
      const diff = _.difference(newGamesAppids, oldGamesAppids)
      if (!diff.length) {
        continue
      }
      const games = newGames.filter(i => diff.includes(i.appid))
      for (const g of pushList.filter(p => p.steamId === i.steamId)) {
        const username = await utils.bot.getUserName(g.botId, g.userId, g.groupId)
        if (Config.push.pushMode == 1) {
          for (const i of games) {
            const msg = [
              segment.image(i.image),
              `[Steam] ${username}的库存新增: ${i.name}`
            ]
            await utils.bot.sendGroupMsg(g.botId, g.groupId, msg)
          }
        } else {
          const img = await Render.render('inventory/index', {
            data: [{
              title: `${username}的库存新增`,
              games
            }]
          })
          await utils.bot.sendGroupMsg(g.botId, g.groupId, img)
        }
      }
    } catch { }
  }
}
