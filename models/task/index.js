import { Config, Version, Render } from '#components'
import { Bot, logger, redis, segment } from '#lib'
import { api, db, utils } from '#models'
import _ from 'lodash'

let timer = null

// TODO: 改成sqlite?
const redisKey = 'steam-plugin:user-play:'

export function startTimer () {
  if (!Config.steam.apiKey) {
    return
  }
  if (!Config.push.enable && !Config.push.stateChange) {
    return
  }
  clearInterval(timer)
  timer = setInterval(async () => {
    logger.info('开始检查Steam游戏信息')
    try {
      // 获取现在的时间
      const now = Math.floor(Date.now() / 1000)
      // 从推送表中获取所有数据
      const PushData = await db.PushTableGetAllData(true)
      // 所有的steamId
      const steamIds = _.uniq(PushData.map(i => i.steamId))
      // 获取所有steamId现在的状态
      const result = await api.ISteamUser.GetPlayerSummaries(steamIds)
      const userList = {}
      for (const player of result) {
        // 获取上一次的状态
        let lastPlay = await redis.get(redisKey + player.steamid)
        if (lastPlay) {
          lastPlay = JSON.parse(lastPlay)
        } else {
          lastPlay = { name: '', time: 0, appid: 0, state: 0 }
        }
        const state = {
          name: player.gameextrainfo,
          appid: player.gameid,
          time: lastPlay.time,
          state: player.personastate
        }
        // 如果这一次和上一次的状态不一样
        if (lastPlay.appid != player.gameid || lastPlay.state != player.personastate) {
          // 找到所有的推送群
          const pushGroups = PushData.filter(i => i.steamId === player.steamid)
          const iconUrl = utils.getHeaderImgUrlByAppid(player.gameid || lastPlay.appid)
          // 文本推送才获取图片
          const iconBuffer = Config.push.pushMode != 2 ? await utils.getImgUrlBuffer(iconUrl) : null
          for (const i of pushGroups) {
            if (Version.BotName === 'Karin') {
              if (!Bot.getBot(i.botId)) {
                continue
              }
            } else if (!Bot[i.botId]) {
              continue
            }
            // 0 就是没有人绑定
            const nickname = i.userId == '0' ? player.personaname : await utils.getUserName(i.botId, i.userId, i.groupId)
            const msg = []
            iconBuffer && msg.push(segment.image(iconBuffer))
            if (Config.push.pushMode == 2) {
              // 图片推送 先收集所有要推送的用户
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
              if (player.gameid && Config.push.enable) {
                state.time = now
                userList[i.groupId][i.botId].start.push({
                  name: player.gameextrainfo,
                  appid: `${nickname}(${player.personaname})`,
                  desc: lastPlay.time ? `距离上次 ${utils.formatDuration(now - lastPlay.time)}` : '',
                  header_image: iconUrl
                })
              }
              if (lastPlay.name != player.gameextrainfo && Config.push.enable) {
                state.time = now
                userList[i.groupId][i.botId].end.push({
                  name: lastPlay.name,
                  appid: `${nickname}(${player.personaname})`,
                  desc: `时长: ${utils.formatDuration(now - lastPlay.time)}`,
                  header_image: utils.getHeaderImgUrlByAppid(lastPlay.appid)
                })
              }
              // 在线状态改变
              if (player.personastate != lastPlay.state && Config.push.stateChange) {
                state.time = now
                userList[i.groupId][i.botId].state.push({
                  name: `${nickname}(${player.personaname})`,
                  appid: lastPlay.time ? `距离上次 ${utils.formatDuration(now - lastPlay.time)}` : '',
                  desc: `已${utils.getPersonaState(player.personastate)}`,
                  header_image: await utils.getUserAvatar(i.botId, i.userId, i.groupId) || i.avatarfull,
                  header_image_class: 'square',
                  desc_style: `style="background-color: #${getColor(player.personastate)};color: white;width: fit-content;border-radius: 5px; padding: 0 5px;"`
                })
              }
            } else {
              // 如果有gameid就是开始玩
              if (player.gameid && Config.push.enable) {
                state.time = now
                msg.push(`${nickname}(${player.personaname}) 正在玩 ${player.gameextrainfo}`)
                // 看看上次有没有在玩别的游戏
                if (lastPlay.name) {
                  msg.push(`\n已结束游玩 ${lastPlay.name} 时长 ${utils.formatDuration(now - lastPlay.time)}`)
                } else if (lastPlay.time) {
                  msg.push(`\n距离上次 ${utils.formatDuration(now - lastPlay.time)}`)
                }
                // 记录这一次的状态
                // 如果有上次记录就是结束游玩
              } else if (lastPlay.name != player.gameextrainfo && Config.push.enable) {
                state.time = now
                msg.push(`${nickname}(${player.personaname}) 已结束游玩 ${lastPlay.name} 时长 ${utils.formatDuration(now - lastPlay.time)}`)
              } else if (player.personastate != lastPlay.state && Config.push.stateChange) {
                state.time = now
                msg.shift()
                msg.push(`${nickname}(${player.personaname}) 已${utils.getPersonaState(player.personastate)}`)
                if (lastPlay.time) {
                  msg.push(`\n距离上次 ${utils.formatDuration(now - lastPlay.time)}`)
                }
              } else {
                continue
              }
              try {
                await utils.sendGroupMsg(i.botId, i.groupId, msg)
              } catch (error) {
                logger.error(`群消息发送失败: ${i.groupId}`, error)
              }
            }
          }
        } else {
          // TODO: 上下线推送
        }
        redis.set(redisKey + player.steamid, JSON.stringify(state))
      }
      for (const gid in userList) {
        for (const botId in userList[gid]) {
          const i = userList[gid][botId]
          const data = []
          if (i.start.length) {
            data.push({
              title: '开始玩游戏的群友',
              games: i.start,
              size: 'large'
            })
          }
          if (i.end.length) {
            data.push({
              title: '结束玩游戏的群友',
              games: i.end,
              size: 'large'
            })
          }
          if (i.state.length) {
            data.push({
              title: '在线状态改变的群友',
              games: i.state,
              size: 'large'
            })
          }
          if (!data.length) {
            continue
          }
          try {
            const img = await Render.render('inventory/index', { data })
            await utils.sendGroupMsg(botId, gid, img)
          } catch (error) {
            logger.error(`群消息发送失败: ${gid}`, error)
          }
        }
      }
    } catch (error) {
      logger.error('检查Steam游戏信息出现错误', error)
    }
  }, 1000 * 60 * Config.push.time)
}

// TODO:
function getColor (state) {
  switch (Number(state)) {
    case 1:
      return 'beee11'
    case 0:
      return '999999'
    default:
      return '8fbc8b'
  }
}
