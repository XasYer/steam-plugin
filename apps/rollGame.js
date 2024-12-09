import { utils, db, api } from '#models'
import { segment } from '#lib'
import { Render, App, Config } from '#components'
import _ from 'lodash'

const app = {
    id: 'rollGame',
    name: 'roll游戏'
}

export const rule = {
    rollGame: {
        reg: /^#?steam(玩什么|玩啥|roll)(游戏)?\s*(\d+)?$/i,
        fnc: async e => {
            const textId = rule.rollGame.reg.exec(e.msg)?.[3]
            const uid = utils.getAtUid(e.at, e.user_id)
            const steamId = textId ? utils.getSteamId(textId) : await db.UserTableGetBindSteamIdByUserId(uid)
            if (!steamId) {
                await e.reply([segment.at(uid), '\n还没有绑定steamId哦, 先绑定steamId吧'])
                return true
            }
            e.reply([segment.at(uid), '\n正在为你随机推荐游戏...'])
            const nickname = textId || await utils.getUserName(e.self_id, uid, e.group_id)
            const screenshotOptions = {
                title: '',
                games: [],
                size: 'small',
                desc: ''
            }

            const games = await api.IPlayerService.GetOwnedGames(steamId)
            if (!games.length) {
                await e.reply([segment.at(uid), '\n你的游戏库中空空如也'])
                return true
            }

            const configCount = Config.other.rollGameCount
            const recomendCount = games.length >= configCount ? configCount : games.length
            screenshotOptions.games = _.sampleSize(games, recomendCount)
            screenshotOptions.title = `${nickname} 随机给您推荐了 ${recomendCount} 个游戏`

            if (screenshotOptions.size === 'small') {
                let playtimeForever = 0
                let playtime2weeks = 0
                screenshotOptions.games.map(i => {
                    i.desc = `${getTime(i.playtime_forever)} ${i.playtime_2weeks ? `/ ${getTime(i.playtime_2weeks)}` : ''}`
                    playtimeForever += i.playtime_forever
                    i.playtime_2weeks && (playtime2weeks += i.playtime_2weeks)
                    return i
                })
                screenshotOptions.desc = `以下游戏从您的游戏库中通过完全随机的方式选出，不代表任何个人或团体的观点`
            }
            const img = await Render.render('inventory/index', {
                data: [screenshotOptions]
            })
            if (img) {
                await e.reply(img)
            } else {
                await e.reply([segment.at(uid), '\n制作图片出错辣! 再试一次吧'])
            }
            return true
        }
    }
}

export const rollGame = new App(app, rule).create()
