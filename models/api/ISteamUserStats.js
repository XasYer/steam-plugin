import { utils } from '#models'

/**
 * 获取指定游戏的全局成就百分比
 * @param {string} appid
 * @returns {Promise<{
 *     name: string,
 *     percent: number
 * }[]>}
 */
export async function GetGlobalAchievementPercentagesForApp (appid) {
  return utils.request.get('ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2', {
    params: {
      gameid: appid
    }
  }).then(res => res.achievementpercentages?.achievements || [])
}

/**
 * 获取指定游戏当前在 Steam 上的活跃玩家的总数量
 * @param {string} appid
 * @returns {Promise<number|boolean>}
 */
export async function GetNumberOfCurrentPlayers (appid) {
  return utils.request.get('ISteamUserStats/GetNumberOfCurrentPlayers/v1', {
    params: {
      appid
    }
  }).then(res => res.response.player_count ?? false)
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
  return utils.request.get('ISteamUserStats/GetSchemaForGame/v2', {
    params: {
      appid
    }
  }).then(res => res.game || {})
}

/**
 * 获取用户游戏成就数据
 * @param {string} appid
 * @param {string} steamid
 * @returns {Promise<{
 *   steamID: string,
 *   gameName: string,
 *   achievements?: {
 *     name: string,
 *     achieved: number,
 *   }[],
 *   stats?: {
 *     name: string,
 *     value: number,
 *   }[]
 * }>}
 */
export async function GetUserStatsForGame (appid, steamid) {
  return utils.request.get('ISteamUserStats/GetUserStatsForGame/v2', {
    params: {
      appid,
      steamid
    }
  }).then(res => res.playerstats || {})
}
