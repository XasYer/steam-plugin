import { App, Render } from '#components'
import { utils, db, api } from '#models'
import { segment } from '#lib'
import _ from 'lodash'

const appInfo = {
  id: 'achievement',
  name: '成就统计'
}

const rule = {
  achievements: {
    reg: App.getReg('(成就|统计)\\s*(\\d+|\\d+[-:\\s]\\d+)?'),
    fnc: async e => {
      const regRet = rule.achievements.reg.exec(e.msg)
      const textId = regRet[2]?.trim()
      if (!textId) {
        await e.reply([segment.at(e.user_id), '\n需要带上游戏的appid哦'])
        return true
      }
      const uid = utils.getAtUid(e.at, e.user_id)
      const { steamId, appid } = await (async () => {
        if (/[-:\s]/.test(textId)) {
          const [appid, steamId] = textId.split(/[-:\s]/)
          return { steamId, appid }
        }
        const steamId = await db.UserTableGetBindSteamIdByUserId(uid)
        return { steamId, appid: textId }
      })()
      if (!steamId) {
        await e.reply([segment.at(uid), '\n还没有绑定steamId哦, 先绑定steamId吧'])
        return true
      }
      e.reply(['在查了...在查了...'])
      // 先获取游戏的成就列表
      const achievementsByGame = await api.ISteamUserStats.GetSchemaForGame(appid).catch(() => {})
      if (!achievementsByGame || !achievementsByGame.availableGameStats) {
        await e.reply([segment.at(uid), `\n没有找到${appid}的成就信息`])
        return true
      }
      const achievementsByUser = await api.ISteamUserStats.GetUserStatsForGame(appid, steamId).catch(() => {})
      if (!achievementsByUser || !achievementsByUser.achievements) {
        await e.reply([segment.at(uid), `\n没有找到${steamId}在${appid}的成就信息`])
        return true
      }
      const nickname = await utils.getUserName(e.self_id, uid, e.group_id)
      const data = [
        {
          title: `${nickname}的${achievementsByGame.gameName} ${regRet[1]}统计`,
          games: [{
            name: achievementsByGame.gameName,
            appid
          }],
          size: 'large'
        }
      ]
      if (regRet[1] === '成就') {
        if (!achievementsByGame.availableGameStats.achievements?.length) {
          await e.reply([segment.at(uid), `\n${achievementsByGame.gameName}好像没有成就呢`])
          return true
        }
        const completeAchievements = []
        const unCompleteAchievements = []
        achievementsByGame.availableGameStats.achievements.forEach(all => {
          const user = achievementsByUser.achievements.find(i => i.name === all.name)
          const info = {
            name: all.displayName,
            desc: all.hidden ? '已隐藏' : all.description,
            header_image: user ? all.icon : all.icongray,
            header_image_class: 'square'
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
            games: completeAchievements,
            size: 'large'
          },
          {
            title: '未完成成就',
            desc: `共${unCompleteAchievements.length}个`,
            games: unCompleteAchievements,
            size: 'large'
          }
        )
      } else if (regRet[1] === '统计') {
        if (!achievementsByGame.availableGameStats.stats?.length) {
          await e.reply([segment.at(uid), `\n${achievementsByGame.gameName}好像没有统计呢`])
          return true
        }
        const completeStats = achievementsByUser.stats.map(i => {
          const item = achievementsByGame.availableGameStats.stats.find(j => j.name === i.name)
          if (item) {
            return {
              name: item.name,
              appid: i.value,
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
            games: completeStats,
            size: 'large'
          }
        )
      }
      const img = await Render.render('inventory/index', { data })
      if (img) {
        await e.reply(img)
      } else {
        await e.reply('制作图片出错辣! 再试一次吧')
      }
      return true
    }
  },
  achievementStats: {
    reg: /^#?steam成就统计\s*(\d+)?$/i,
    fnc: async e => {
      const appid = rule.achievementStats.reg.exec(e.msg)[1]
      if (!appid) {
        await e.reply([segment.at(e.user_id), '\n需要带上游戏的appid哦'])
        return true
      }
      e.reply(['在查了...在查了...'])
      // 先获取游戏的成就列表
      const achievementsByGame = await api.ISteamUserStats.GetSchemaForGame(appid)
      if (!achievementsByGame || !achievementsByGame.availableGameStats) {
        await e.reply([segment.at(e.user_id), `\n没有找到${appid}的成就信息`])
        return true
      }
      // 全球统计
      const achievements = await api.ISteamUserStats.GetGlobalAchievementPercentagesForApp(appid)
      const data = [
        {
          title: `${achievementsByGame.gameName} 全球成就统计`,
          games: [{
            name: achievementsByGame.gameName,
            appid
          }],
          size: 'large'
        }
      ]
      const games = []
      achievementsByGame.availableGameStats.achievements.forEach(all => {
        const i = achievements.find(i => i.name === all.name)
        const percent = `${i.percent.toFixed(0)}%`
        const info = {
          name: all.displayName,
          desc: all.hidden ? '已隐藏' : all.description,
          header_image: i ? all.icon : all.icongray,
          header_image_class: 'square',
          appid: percent,
          appid_style: `style="background-color: #999999; width: ${percent};"`,
          percent: i.percent
        }
        games.push(info)
      })
      data.push({
        title: '全球成就统计',
        desc: `共${games.length}个`,
        games: _.orderBy(games, 'percent', 'desc'),
        size: 'large'
      })
      const img = await Render.render('inventory/index', { data })
      if (img) {
        await e.reply(img)
      } else {
        await e.reply('制作图片出错辣! 再试一次吧')
      }
      return true
    }
  }
}

export const app = new App(appInfo, rule).create()
