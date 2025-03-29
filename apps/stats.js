import _ from 'lodash'
import moment from 'moment'
import { redis } from '#lib'
import { db, utils } from '#models'
import { Render, App, Config } from '#components'

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
      const g = utils.bot.checkGroup(e.group_id)
      if (!g.success) {
        return g.message
      }
      const limit = Math.max(1, Number(Config.other.statsCount) || 10)
      const stats = await db.stats.getAllByGroupId(e.group_id, limit)
      const data = []

      if (stats.gamePlayTotal.length) {
        data.push({
          title: '本群游玩次数最多的游戏',
          games: stats.gamePlayTotal.map(i => ({ ...i, desc: `共 ${i.playTotal} 次` }))
        })
      }
      if (stats.gamePlayTime.length) {
        data.push({
          title: '本群游玩时长最多的游戏',
          games: stats.gamePlayTime.map(i => ({ ...i, desc: `共 ${utils.formatDuration(i.playTime) || '正在游玩中'}` }))
        })
      }

      const userPlayTotal = []
      for (const i of stats.userPlayTotal) {
        userPlayTotal.push({
          name: await utils.bot.getUserName(i.botId, i.userId, e.group_id),
          detail: i.steamId,
          desc: `共 ${i.playTotal} 次`,
          image: await utils.bot.getUserAvatar(i.botId, i.userId, e.group_id),
          isAvatar: true
        })
      }
      if (userPlayTotal.length) {
        data.push({
          title: '本群游玩次数最多的用户',
          games: userPlayTotal
        })
      }

      const userPlayTime = []
      for (const i of stats.userPlayTime) {
        userPlayTime.push({
          name: await utils.bot.getUserName(i.botId, i.userId, e.group_id),
          detail: i.steamId,
          desc: `共 ${utils.formatDuration(i.playTime) || '正在游玩中'}`,
          image: await utils.bot.getUserAvatar(i.botId, i.userId, e.group_id),
          isAvatar: true
        })
      }
      if (userPlayTime.length) {
        data.push({
          title: '本群游玩时长最多的用户',
          games: userPlayTime
        })
      }

      const userOnlineTotal = []
      for (const i of stats.userOnlineTotal) {
        userOnlineTotal.push({
          name: await utils.bot.getUserName(i.botId, i.userId, e.group_id),
          detail: i.steamId,
          desc: `共 ${i.onlineTotal} 次`,
          image: await utils.bot.getUserAvatar(i.botId, i.userId, e.group_id),
          isAvatar: true
        })
      }
      if (userOnlineTotal.length) {
        data.push({
          title: '本群上线次数最多的用户',
          games: userOnlineTotal
        })
      }

      const userOnlineTime = []
      for (const i of stats.userOnlineTime) {
        userOnlineTime.push({
          name: await utils.bot.getUserName(i.botId, i.userId, e.group_id),
          detail: i.steamId,
          desc: `共 ${utils.formatDuration(i.onlineTime) || '正在游玩中'}`,
          image: await utils.bot.getUserAvatar(i.botId, i.userId, e.group_id),
          isAvatar: true
        })
      }
      if (userOnlineTime.length) {
        data.push({
          title: '本群在线时长最多的用户',
          games: userOnlineTime
        })
      }

      if (!data.length) {
        return '本群还没有统计哦~'
      }

      return await Render.render('inventory/index', { data })
    }
  },
  apiStats: {
    reg: App.getReg('api(调用)?统计'),
    fnc: async e => {
      const data = []
      for (let i = 0; i >= -1; i--) {
        const now = moment().add(i, 'days').format('YYYY-MM-DD')
        const apis = []
        let cursor = 0
        do {
          const res = await redis.scan(cursor, { MATCH: `steam-plugin:api:${now}:*`, COUNT: 10000 })
          cursor = res.cursor
          for (const key of res.keys) {
            const v = Number(await redis.get(key))
            apis.push({ name: key.split(':').pop(), v })
          }
        } while (cursor != 0)
        if (apis.length) {
          const total = _.sumBy(apis, 'v')
          data.push({
            title: `${now} api调用统计`,
            desc: `共${total}次`,
            games: _.orderBy(apis, 'v', 'desc').map(i => {
              const percent = (i.v / total * 100).toFixed(0)
              return {
                name: i.name,
                detail: percent + '%',
                detailPercent: percent,
                desc: `${i.v}次`,
                noImg: true
              }
            })
          })
        }
      }
      if (!data.length) {
        return '还没有api调用统计数据哦'
      }
      return await Render.render('inventory/index', { data })
    }
  },
  userStats: {
    reg: App.getReg('用户统计'),
    fnc: async e => {
      const steamIdCount = await db.user.count()
      const accessTokenCount = await db.token.count()
      return `绑定: ${steamIdCount}\n扫码: ${accessTokenCount}`
    }
  }
}

export const app = new App(appInfo, rule).create()
