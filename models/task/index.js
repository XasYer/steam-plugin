import { Config, Version, Render } from '#components'
import { Bot, logger, redis, segment } from '#lib'
import { db, utils } from '#models'
import _ from 'lodash'

let timer = null

// TODO: 改成sqlite?
const redisKey = 'steam-plugin:user-play:'

export function startTimer () {
  if (!Config.push.enable && !Config.push.stateChange) {
    return
  }
  clearInterval(timer)
  timer = setInterval(async () => {
    if (!Config.steam.apiKey.length) {
      return
    }
    logger.info('开始检查Steam游戏信息')
    try {
      // 获取现在的时间
      const now = Math.floor(Date.now() / 1000)
      // 从推送表中获取所有数据
      const PushData = await db.PushTableGetAllData(true)
      // 所有的steamId
      const steamIds = _.uniq(PushData.map(i => i.steamId))
      // 获取所有steamId现在的状态
      const result = await utils.steam.getUserSummaries(steamIds)
      const userList = {}
      for (const player of result) {
        // 获取上一次的状态
        let lastPlay = await redis.get(redisKey + player.steamid)
        if (lastPlay) {
          lastPlay = JSON.parse(lastPlay)
        } else {
          lastPlay = { name: '', appid: 0, state: 0, playTime: 0, onlineTime: 0 }
        }
        const state = {
          name: player.gameextrainfo,
          appid: player.gameid,
          state: player.personastate,
          playTime: lastPlay.time || lastPlay.playTime,
          onlineTime: lastPlay.time || lastPlay.onlineTime
        }
        // 如果这一次和上一次的状态不一样
        if (lastPlay.appid != player.gameid || lastPlay.state != player.personastate) {
          // 找到所有的推送群
          const pushGroups = PushData.filter(i => i.steamId === player.steamid)
          const iconUrl = utils.steam.getHeaderImgUrlByAppid(player.gameid || lastPlay.appid)
          for (const i of pushGroups) {
            if (Version.BotName === 'Karin') {
              if (!Bot.getBot(i.botId)) {
                continue
              }
            } else if (!Bot[i.botId] && !Config.push.randomBot) {
              continue
            }
            const avatar = await utils.bot.getUserAvatar(i.botId, i.userId, i.groupId)
            // 0 就是没有人绑定
            const nickname = i.userId == '0' ? player.personaname : await utils.bot.getUserName(i.botId, i.userId, i.groupId)
            // 先收集所有要推送的用户
            if (!userList[i.groupId]) {
              userList[i.groupId] = {}
            }
            if (!userList[i.groupId][i.botId]) {
              userList[i.groupId][i.botId] = {
                start: [],
                end: [],
                state: []
              }
            }
            if (Config.push.enable && Config.push.playStart && player.gameid && player.gameid != lastPlay.appid) {
              const time = now - lastPlay.playTime
              state.playTime = now
              userList[i.groupId][i.botId].start.push({
                name: player.gameextrainfo,
                appid: `${nickname}(${player.personaname})`,
                desc: lastPlay.playTime ? `距离上次 ${utils.formatDuration(time)}` : '',
                image: iconUrl,
                avatar,
                type: 'start'
              })
              db.StatsTableUpdate(i.userId, i.groupId, i.botId, i.steamId, player.gameid, player.gameextrainfo, 'playTotal', 1).catch(e => logger.error('更新统计数据失败', e.message))
            }
            if (Config.push.enable && Config.push.playEnd && lastPlay.name && lastPlay.name != player.gameextrainfo) {
              const time = now - lastPlay.playTime
              state.playTime = now
              userList[i.groupId][i.botId].end.push({
                name: lastPlay.name,
                appid: `${nickname}(${player.personaname})`,
                desc: `时长: ${utils.formatDuration(time)}`,
                image: utils.steam.getHeaderImgUrlByAppid(lastPlay.appid),
                avatar,
                type: 'end'
              })
              db.StatsTableUpdate(i.userId, i.groupId, i.botId, i.steamId, lastPlay.appid, lastPlay.name, 'playTime', time).catch(e => logger.error('更新统计数据失败', e.message))
            }
            // 在线状态改变
            if (Config.push.stateChange && player.personastate != lastPlay.state) {
              const time = now - lastPlay.onlineTime
              if (Config.push.stateOffline && player.personastate === 0) {
                db.StatsTableUpdate(i.userId, i.groupId, i.botId, i.steamId, player.gameid, player.gameextrainfo, 'onlineTime', time).catch(e => logger.error('更新统计数据失败', e.message))
              } else if (Config.push.stateOnline && player.personastate === 1) {
                db.StatsTableUpdate(i.userId, i.groupId, i.botId, i.steamId, player.gameid, player.gameextrainfo, 'onlineTotal', 1).catch(e => logger.error('更新统计数据失败', e.message))
              } else {
                continue
              }
              state.onlineTime = now
              userList[i.groupId][i.botId].state.push({
                name: `${nickname}(${player.personaname})`,
                appid: lastPlay.onlineTime ? `距离上次 ${utils.formatDuration(time)}` : '',
                desc: `已${utils.steam.getPersonaState(player.personastate)}`,
                image: avatar || (Config.other.steamAvatar ? i.avatarfull : ''),
                isAvatar: true,
                descBgColor: getColor(player.personastate)
              })
            }
          }
        }
        redis.set(redisKey + player.steamid, JSON.stringify(state))
      }
      for (const gid in userList) {
        for (const botId in userList[gid]) {
          const i = userList[gid][botId]
          const data = []
          const isImg = [2, 3].includes(Number(Config.push.pushMode))
          if (i.start.length) {
            if (isImg) {
              data.push({
                title: '开始玩游戏的群友',
                games: i.start
              })
            } else {
              data.push(...i.start.map(item => [segment.image(item.image), `[Steam] ${item.appid} 正在玩 ${item.name}\n${item.desc}`]))
            }
          }
          if (i.end.length) {
            if (isImg) {
              data.push({
                title: '结束玩游戏的群友',
                games: i.end
              })
            } else {
              data.push(...i.end.map(item => [segment.image(item.image), `[Steam] ${item.appid} 已结束游玩 ${item.name}\n${item.desc}`]))
            }
          }
          if (i.state.length) {
            if (isImg) {
              data.push({
                title: '在线状态改变的群友',
                games: i.state
              })
            } else {
              data.push(...i.state.map(item => [
                item.image ? segment.image(item.image) : '',
                `[Steam] ${item.name} ${item.desc} \n${item.appid}`
              ]))
            }
          }
          if (!data.length) {
            continue
          }
          if (isImg) {
            const path = Config.push.pushMode === 2 ? 'inventory/index' : 'game/game'
            const img = await Render.render(path, { data })
            if (typeof img !== 'string') {
              await utils.bot.sendGroupMsg(botId, gid, img)
            }
          } else {
            for (const msg of data) {
              await utils.bot.sendGroupMsg(botId, gid, msg)
            }
          }
        }
      }
    } catch (error) {
      logger.error('检查Steam游戏信息出现错误', error.message)
    }
  }, 1000 * 60 * Config.push.time)
}

// TODO:
function getColor (state) {
  switch (Number(state)) {
    case 1:
      return '#beee11'
    case 0:
      return '#999999'
    default:
      return '#8fbc8b'
  }
}
