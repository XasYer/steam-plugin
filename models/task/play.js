import _ from 'lodash'
import { db, utils } from '#models'
import schedule from 'node-schedule'
import { Bot, logger, redis, segment } from '#lib'
import { Config, Version, Render } from '#components'

let timer = null

const redisKey = 'steam-plugin:user-play:'

export function startTimer () {
  if ((!Config.push.enable && !Config.push.stateChange) || !Config.push.time) {
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
  if (!Config.steam.apiKey.length) {
    return
  }
  logger.info('开始检查Steam游戏信息')
  try {
    // 获取现在的时间
    const now = Math.floor(Date.now() / 1000)
    // 从推送表中获取所有数据
    const PushData = await db.push.getAll(Config.push.statusFilterGroup)
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
        state: player.personastate == 0 ? 0 : 1,
        playTime: lastPlay.time || lastPlay.playTime,
        onlineTime: lastPlay.time || lastPlay.onlineTime,
        header: player.header
      }
      // 如果这一次和上一次的状态不一样
      if (lastPlay.appid != player.gameid || lastPlay.state != state.state) {
        // 找到所有的推送群
        const pushGroups = PushData.filter(i => i.steamId === player.steamid)
        const iconUrl = utils.steam.getHeaderImgUrlByAppid(player.gameid || lastPlay.appid, 'apps', player.header)
        for (const i of pushGroups) {
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
          if (player.gameid && player.gameid != lastPlay.appid) {
            if (Config.push.enable && Config.push.playStart) {
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
            }
            db.stats.set(i.userId, i.groupId, i.botId, i.steamId, player.gameid, player.gameextrainfo, 'playTotal', 1).catch(e => logger.error('更新游玩统计数据失败', e.message))
          }
          if (lastPlay.appid && lastPlay.appid != player.gameid) {
            const time = now - lastPlay.playTime
            if (Config.push.enable && Config.push.playEnd) {
              state.playTime = now
              userList[i.groupId][i.botId].end.push({
                name: lastPlay.name,
                appid: `${nickname}(${player.personaname})`,
                desc: `时长: ${utils.formatDuration(time)}`,
                image: utils.steam.getHeaderImgUrlByAppid(lastPlay.appid, 'apps', lastPlay.header),
                avatar,
                type: 'end'
              })
            }
            db.stats.set(i.userId, i.groupId, i.botId, i.steamId, lastPlay.appid, lastPlay.name, 'playTime', time).catch(e => logger.error('更新结束游玩统计数据失败', e.message))
          }
          // 在线状态改变
          if (state.state != lastPlay.state) {
            const time = now - lastPlay.onlineTime
            if (state.state === 0) {
              db.stats.set(i.userId, i.groupId, i.botId, i.steamId, player.gameid, player.gameextrainfo, 'onlineTime', time).catch(e => logger.error('更新离线统计数据失败', e.message))
            } else if (state.state === 1) {
              db.stats.set(i.userId, i.groupId, i.botId, i.steamId, player.gameid, player.gameextrainfo, 'onlineTotal', 1).catch(e => logger.error('更新在线统计数据失败', e.message))
            } else {
              continue
            }
            // 没有开启状态改变推送
            if (!Config.push.stateChange) {
              continue
            }
            // 没有开启离线状态推送
            if (state.state === 0 && !Config.push.stateOffline) {
              continue
            }
            // 没有开启在线状态推送
            if (state.state === 1 && !Config.push.stateOnline) {
              continue
            }
            state.onlineTime = now
            userList[i.groupId][i.botId].state.push({
              name: `${nickname}(${player.personaname})`,
              appid: lastPlay.onlineTime ? `距离上次 ${utils.formatDuration(time)}` : '',
              desc: `已${utils.steam.getPersonaState(state.state)}`,
              image: avatar || (Config.other.steamAvatar ? i.avatarfull : ''),
              isAvatar: true,
              descBgColor: utils.steam.getStateColor(state.state)
            })
          }
        }
      }
      redis.set(redisKey + player.steamid, JSON.stringify(state))
    }
    for (const gid in userList) {
      for (const botId in userList[gid]) {
        if (Version.BotName === 'Karin') {
          if (!Bot.getBot(botId)) {
            continue
          }
        } else if (!Bot[botId] && !Config.push.randomBot) {
          continue
        }
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
            await sendGroupMsg(botId, gid, img)
          }
        } else {
          for (const msg of data) {
            await sendGroupMsg(botId, gid, msg)
          }
        }
      }
    }
  } catch (error) {
    logger.error('检查Steam游戏信息出现错误', error.message)
  }
}

async function sendGroupMsg (bid, gid, msg) {
  if (typeof msg === 'string') {
    return
  }
  if (!Config.push.statusFilterGroup && !utils.bot.checkGroup(gid).success) {
    return
  }
  await utils.bot.sendGroupMsg(bid, gid, msg)
}
