import { utils, api } from '#models'
import { Render, App, Config } from '#components'
import _ from 'lodash'

const appInfo = {
  id: 'rollGame',
  name: 'roll游戏'
}

const rule = {
  rollGame: {
    reg: App.getReg('(玩什么|玩啥|roll)(游戏)?\\s*(\\d*)'),
    cfg: {
      tips: true,
      steamId: true
    },
    fnc: async (e, { steamId, uid }) => {
      const nickname = await utils.bot.getUserName(e.self_id, uid, e.group_id) || steamId
      const screenshotOptions = {
        title: '',
        games: [],
        desc: ''
      }

      const games = await api.IPlayerService.GetOwnedGames(steamId)
      if (!games.length) {
        return Config.tips.inventoryEmptyTips
      }

      const configCount = Config.other.rollGameCount
      const recomendCount = games.length >= configCount ? configCount : games.length
      screenshotOptions.games = _.sampleSize(games, recomendCount)
      screenshotOptions.title = `${nickname} 随机给您推荐了 ${recomendCount} 个游戏`

      screenshotOptions.games.map(i => {
        i.desc = `${getTime(i.playtime_forever)} ${i.playtime_2weeks ? `/ ${getTime(i.playtime_2weeks)}` : ''}`
        return i
      })
      screenshotOptions.desc = '以下游戏从您的游戏库中通过完全随机的方式选出，不代表任何个人或团体的观点'
      return await Render.render('inventory/index', {
        data: [screenshotOptions],
        schinese: true
      })
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

export const app = new App(appInfo, rule).create()
