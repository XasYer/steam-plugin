import { Render, App, Config } from '#components'
import { db, utils } from '#models'

const appInfo = {
  id: 'stats',
  name: '统计数据'
}

const rule = {
  stats: {
    reg: App.getReg('群统计'),
    cfg: {
      tips: true
    },
    fnc: async e => {
      if (!checkGroup(e.group_id)) {
        return true
      }
      const limit = Math.max(1, Number(Config.other.statsCount) || 10)
      const stats = await db.StatsTableGetByGroupId(e.group_id, limit)
      const data = []

      if (stats.gamePlayTotal.length) {
        data.push({
          title: '本群游玩次数最多的游戏',
          games: stats.gamePlayTotal.map(i => ({ ...i, desc: `共 ${i.playTotal} 次` })),
          size: 'small'
        })
      }
      if (stats.gamePlayTime.length) {
        data.push({
          title: '本群游玩时长最多的游戏',
          games: stats.gamePlayTime.map(i => ({ ...i, desc: `共 ${utils.formatDuration(i.playTime) || '正在游玩中'}` })),
          size: 'small'
        })
      }

      const userPlayTotal = []
      for (const i of stats.userPlayTotal) {
        userPlayTotal.push({
          name: await utils.getUserName(i.botId, i.userId, e.group_id),
          appid: i.steamId,
          desc: `共 ${i.playTotal} 次`,
          header_image: await utils.getUserAvatar(i.botId, i.userId, e.group_id),
          header_image_class: 'square'
        })
      }
      if (userPlayTotal.length) {
        data.push({
          title: '本群游玩次数最多的用户',
          games: userPlayTotal,
          size: 'small'
        })
      }

      const userPlayTime = []
      for (const i of stats.userPlayTime) {
        userPlayTime.push({
          name: await utils.getUserName(i.botId, i.userId, e.group_id),
          appid: i.steamId,
          desc: `共 ${utils.formatDuration(i.playTime) || '正在游玩中'}`,
          header_image: await utils.getUserAvatar(i.botId, i.userId, e.group_id),
          header_image_class: 'square'
        })
      }
      if (userPlayTime.length) {
        data.push({
          title: '本群游玩时长最多的用户',
          games: userPlayTime,
          size: 'small'
        })
      }

      const userOnlineTotal = []
      for (const i of stats.userOnlineTotal) {
        userOnlineTotal.push({
          name: await utils.getUserName(i.botId, i.userId, e.group_id),
          appid: i.steamId,
          desc: `共 ${i.onlineTotal} 次`,
          header_image: await utils.getUserAvatar(i.botId, i.userId, e.group_id),
          header_image_class: 'square'
        })
      }
      if (userOnlineTotal.length) {
        data.push({
          title: '本群上线次数最多的用户',
          games: userOnlineTotal,
          size: 'small'
        })
      }

      const userOnlineTime = []
      for (const i of stats.userOnlineTime) {
        userOnlineTime.push({
          name: await utils.getUserName(i.botId, i.userId, e.group_id),
          appid: i.steamId,
          desc: `共 ${utils.formatDuration(i.onlineTime) || '正在游玩中'}`,
          header_image: await utils.getUserAvatar(i.botId, i.userId, e.group_id),
          header_image_class: 'square'
        })
      }
      if (userOnlineTime.length) {
        data.push({
          title: '本群在线时长最多的用户',
          games: userOnlineTime,
          size: 'small'
        })
      }

      if (!data.length) {
        await e.reply('本群还没有统计哦~')
        return true
      }

      const img = await Render.render('inventory/index', { data })
      await e.reply(img)
      return true
    }
  }
}

async function checkGroup (e) {
  if (!e.group_id) {
    return false
  }
  if (!Config.push.enable) {
    await e.reply('主人没有开启推送功能哦')
    return false
  }
  if (Config.push.whiteGroupList.length && !Config.push.whiteGroupList.some(id => id == e.group_id)) {
    await e.reply('本群没有在推送白名单中, 请联系主人添加~')
    return false
  }
  if (Config.push.blackGroupList.length && Config.push.blackGroupList.some(id => id == e.group_id)) {
    await e.reply('本群在推送黑名单中, 请联系主人解除~')
    return false
  }
  return true
}

export const app = new App(appInfo, rule).create()
