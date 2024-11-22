import { utils } from '#models'
import { logger } from '#lib'

/**
 * 获取指定游戏的全局成就百分比
 * @param {string} gameid
 * @returns {Promise<{
 *     name: string,
 *     percent: number
 * }[]>}
 */
export async function GetGlobalAchievementPercentagesForApp (gameid) {
  logger.info(`开始获取${gameid}全局成就百分比`)
  const start = Date.now()
  return utils.request.get('ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2', {
    params: {
      gameid
    }
  }).then(res => {
    const data = res.data.achievementpercentages?.achievements || []
    logger.info(`获取${gameid}全局成就百分比成功: 成就数量${data.length}，耗时${Date.now() - start}ms`)
    return data
  })
}

/**
 * 获取指定游戏当前在 Steam 上的活跃玩家的总数量
 * @param {string} appid
 * @returns {Promise<number|boolean>}
 */
export async function GetNumberOfCurrentPlayers (appid) {
  logger.info(`开始获取${appid}当前在 Steam 上的活跃玩家的总数量`)
  const start = Date.now()
  return utils.request.get('ISteamUserStats/GetNumberOfCurrentPlayers/v1', {
    params: {
      appid
    }
  }).then(res => {
    const data = res.data.response
    if (data.result === 1) {
      logger.info(`获取${appid}steam在线成功: 数量: ${data.player_count}，耗时${Date.now() - start}ms`)
    } else {
      logger.info(`获取${appid}steam在线失败: 返回码: ${data.result}，耗时${Date.now() - start}ms`)
    }
    return data.player_count ?? false
  })
}

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
    const data = res.data.game || {}
    logger.info(`获取${appid}成就总览成功: 成就数量${data.availableGameStats?.achievements?.length} 统计数量${data.availableGameStats?.stats?.length}，耗时${Date.now() - start}ms`)
    return data
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
    const data = res.data.playerstats || {}
    logger.info(`获取用户${steamid}的${appid}成就数据成功: 成就数量${data.achievements?.length} 统计数量${data.stats?.length}，耗时${Date.now() - start}ms`)
    return data
  })
}
