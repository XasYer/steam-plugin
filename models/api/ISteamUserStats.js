import { utils } from '#models'
import { logger } from '#lib'

/**
 * 获取游戏成就总览
 * @param {string} appid
 * @returns {Promise<{
 *   gameName: string,
 *   gameVersion: string,
 *   availableGameStats?: {
 *     achievements?: {
 *       name: string,
 *       defaultvalue: number,
 *       displayName: string,
 *       hidden: number,
 *       description: string,
 *       icon: string,
 *       icongray: string
 *     }[],
 *     stats?: {
 *       name: string,
 *       defaultvalue: number,
 *       displayName: string,
 *     }[]
 *   }
 * }>}
 */
export async function GetSchemaForGame (appid) {
  logger.info(`开始获取${appid}成就总览`)
  const start = Date.now()
  return utils.request.get('ISteamUserStats/GetSchemaForGame/v2', {
    params: {
      appid,
      l: 'schinese'
    }
  }).then(res => {
    logger.info(`获取${appid}成就总览成功: 成就数量${res.data.game?.availableGameStats?.achievements?.length} 统计数量${res.data.game?.availableGameStats?.stats?.length}，耗时${Date.now() - start}ms`)
    return res.data.game
  })
}

/**
 * 获取用户游戏成就数据
 * @param {string} appid
 * @param {string} steamid
 * @returns {Promise<{
 *   steamID: string,
 *   gameName: string,
 *   achievements: {
 *     name: string,
 *     achieved: number,
 *   }[],
 *   stats: {
 *     name: string,
 *     value: number,
 *   }[]
 * }>}
 */
export async function GetUserStatsForGame (appid, steamid) {
  logger.info(`开始获取用户${steamid}的${appid}成就数据`)
  const start = Date.now()
  return utils.request.get('ISteamUserStats/GetUserStatsForGame/v2', {
    params: {
      appid,
      steamid
    }
  }).then(res => {
    logger.info(`获取用户${steamid}的${appid}成就数据成功: 成就数量${res.data.playerstats?.achievements?.length} 统计数量${res.data.playerstats?.stats?.length}，耗时${Date.now() - start}ms`)
    return res.data.playerstats
  })
}
