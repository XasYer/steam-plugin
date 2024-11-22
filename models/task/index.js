import { Config, Version } from '#components'
import { Bot, logger, redis, segment } from '#lib'
import { api, db, utils } from '#models'
import _ from 'lodash'

let timer = null

// TODO: 改成sqlite?
const redisKey = 'steam-plugin:user-play:'

export function startTimer () {
  if (Config.push.enable) {
    clearInterval(timer)
    timer = setInterval(async () => {
      logger.info('开始检查Steam游戏信息')
      try {
        // 获取现在的时间
        const now = Math.floor(Date.now() / 1000)
        // 从推送表中获取所有数据
        const PushData = await db.PushTableGetAllData()
        // 所有的steamId
        const steamIds = _.uniq(PushData.map(i => i.steamId))
        // 获取所有steamId现在的状态
        const result = await api.ISteamUser.GetPlayerSummaries(steamIds)
        for (const player of result) {
          // 获取上一次的状态
          let lastPlay = await redis.get(redisKey + player.steamid)
          if (lastPlay) {
            lastPlay = JSON.parse(lastPlay)
          } else {
            lastPlay = { name: '', time: 0, appid: 0, state: 0 }
          }
          // 如果这一次和上一次的状态不一样
          if (lastPlay.appid != player.gameid) {
            // 找到所有的推送群
            const pushGroups = PushData.filter(i => i.steamId === player.steamid)
            const iconUrl = utils.getHeaderImgUrlByAppid(player.gameid || lastPlay.appid)
            const iconBuffer = await utils.getImgUrlBuffer(iconUrl)
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
              // 如果有gameid就是开始玩
              if (player.gameid) {
                logger.info(`${player.personaname} 正在玩 ${player.gameextrainfo}`)
                msg.push(`${nickname} 正在玩 ${player.gameextrainfo}`)
                // 看看上次有没有在玩别的游戏
                if (lastPlay.name) {
                  msg.push(`\n已结束游玩 ${lastPlay.name} 时长 ${utils.formatDuration(now - lastPlay.time)}`)
                }
                // 记录这一次的状态
                redis.set(redisKey + player.steamid, JSON.stringify({
                  name: player.gameextrainfo,
                  appid: player.gameid,
                  time: now,
                  state: player.personastate
                }))
                // 如果有上次记录就是结束游玩
              } else if (lastPlay.name) {
                msg.push(`${nickname} 已结束游玩 ${lastPlay.name} 时长 ${utils.formatDuration(now - lastPlay.time)}`)
                redis.del(redisKey + player.steamid)
              } else {
                continue
              }
              try {
                await utils.sendGroupMsg(i.botId, i.groupId, msg)
              } catch (error) {
                logger.error(`群消息发送失败: ${i.groupId}`, error)
              }
            }
          } else {
            // TODO: 上下线推送
          }
        }
      } catch (error) {
        logger.error('检查Steam游戏信息出现错误', error)
      }
    }, 1000 * 60 * Config.push.time)
  }
}
