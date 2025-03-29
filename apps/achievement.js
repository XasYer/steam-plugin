import { App, Render } from '#components'
import { utils, api } from '#models'
import _ from 'lodash'

const appInfo = {
  id: 'achievement',
  name: '成就统计'
}

const rule = {
  achievements: {
    reg: App.getReg('(成就|统计)\\s*(\\d+|\\d+[-:\\s]\\d+)?'),
    cfg: {
      tips: true,
      steamId: true,
      appid: true
    },
    fnc: async (e, { appid, steamId, uid }) => {
      const type = e.msg.includes('成就') ? '成就' : '统计'
      // 先获取游戏的成就列表
      const achievementsByGame = await api.ISteamUserStats.GetSchemaForGame(appid).catch(() => {})
      if (!achievementsByGame || !achievementsByGame.availableGameStats) {
        return `没有找到${appid}的成就信息`
      }
      const achievementsByUser = await api.ISteamUserStats.GetUserStatsForGame(appid, steamId).catch(() => {})
      if (!achievementsByUser || !achievementsByUser.achievements) {
        return `没有找到${steamId}在${appid}的成就信息`
      }
      const nickname = await utils.bot.getUserName(e.self_id, uid, e.group_id)
      const data = [
        {
          title: `${nickname}的${achievementsByGame.gameName} ${type}统计`,
          games: [{
            name: achievementsByGame.gameName,
            appid
          }]
        }
      ]
      if (type === '成就') {
        if (!achievementsByGame.availableGameStats.achievements?.length) {
          return `${achievementsByGame.gameName}好像没有成就呢`
        }
        const completeAchievements = []
        const unCompleteAchievements = []
        achievementsByGame.availableGameStats.achievements.forEach(all => {
          const user = achievementsByUser.achievements.find(i => i.name === all.name)
          const info = {
            name: all.displayName,
            desc: all.hidden ? '已隐藏' : all.description,
            image: user ? all.icon : all.icongray,
            isAvatar: true
          }
          if (user) {
            completeAchievements.push(info)
          } else {
            unCompleteAchievements.push(info)
          }
        })
        data.push(
          {
            title: '已完成成就',
            desc: `共${completeAchievements.length}个`,
            games: completeAchievements
          },
          {
            title: '未完成成就',
            desc: `共${unCompleteAchievements.length}个`,
            games: unCompleteAchievements
          }
        )
      } else {
        if (!achievementsByGame.availableGameStats.stats?.length) {
          return `${achievementsByGame.gameName}好像没有统计呢`
        }
        const completeStats = achievementsByUser.stats.map(i => {
          const item = achievementsByGame.availableGameStats.stats.find(j => j.name === i.name)
          if (item) {
            return {
              name: item.name,
              detail: i.value,
              desc: item.displayName || '',
              noImg: true
            }
          } else {
            return false
          }
        }).filter(Boolean)
        data.push(
          {
            title: '已完成统计',
            desc: `共${completeStats.length}个`,
            games: completeStats
          }
        )
      }
      return await Render.render('inventory/index', { data })
    }
  },
  achievementStats: {
    reg: App.getReg('成就统计\\s*(\\d*)'),
    cfg: {
      tips: true,
      appid: true
    },
    fnc: async (e, { appid }) => {
      // 先获取游戏的成就列表
      const achievementsByGame = await api.ISteamUserStats.GetSchemaForGame(appid)
      if (!achievementsByGame || !achievementsByGame.availableGameStats) {
        return `没有找到${appid}的成就信息`
      }
      // 全球统计
      const achievements = await api.ISteamUserStats.GetGlobalAchievementPercentagesForApp(appid)
      const data = [
        {
          title: `${achievementsByGame.gameName} 全球成就统计`,
          games: [{
            name: achievementsByGame.gameName,
            appid
          }]
        }
      ]
      const games = []
      achievementsByGame.availableGameStats.achievements.forEach(all => {
        const i = achievements.find(i => i.name === all.name)
        if (!i) return
        const percent = parseInt(i.percent)
        const info = {
          name: all.displayName,
          desc: all.hidden ? '已隐藏' : all.description,
          image: i ? all.icon : all.icongray,
          isAvatar: true,
          detail: `${percent}%`,
          detailPercent: percent
        }
        games.push(info)
      })
      data.push({
        title: '全球成就统计',
        desc: `共${games.length}个`,
        games: _.orderBy(games, 'detailPercent', 'desc')
      })
      return await Render.render('inventory/index', { data })
    }
  }
}

export const app = new App(appInfo, rule).create()
