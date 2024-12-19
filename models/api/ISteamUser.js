import _ from 'lodash'
import { utils } from '#models'
import { logger } from '#lib'

/**
 * 获取用户相关信息
 * @param {string|string[]} steamIds
 * @returns {Promise<{
 *   steamid: string,
 *   profilestate: number,
 *   personaname: string,
 *   profileurl: string,
 *   avatar: string,
 *   avatarmedium: string,
 *   avatarfull: string,
 *   lastlogoff?: number,
 *   personastate: number,
 *   timecreated: string,
 *   gameid?: string,
 *   gameextrainfo?: string,
 * }[]>}
 */
export async function GetPlayerSummaries (steamIds) {
  logger.info('开始获取用户相关信息')
  const start = Date.now()
  !Array.isArray(steamIds) && (steamIds = [steamIds])
  const result = []
  // 一次只能获取100个用户信息
  for (const items of _.chunk(steamIds, 100)) {
    const res = await utils.request.get('ISteamUser/GetPlayerSummaries/v2', {
      params: {
        steamIds: items.join(',')
      }
    })
    if (res.data.response?.players?.length) {
      result.push(...res.data.response.players)
    }
  }
  logger.info(`获取用户相关信息成功 ${result.length} 条数据，用时 ${Date.now() - start}ms`)
  return result
}

/**
 * 获取好友列表
 * @param {string} steamid
 * @returns {Promise<{
 *   steamid: string,
 *   relationship: string,
 *   friend_since: number
 * }[]>}
 */
export async function GetFriendList (steamid) {
  logger.info(`开始获取${steamid}的好友列表`)
  const start = Date.now()
  return await utils.request.get('ISteamUser/GetFriendList/v1', {
    params: {
      steamid
    }
  }).then(res => {
    const data = res.data.friendslist.friends
    logger.info(`获取${steamid}的好友列表成功 共${data.length}个好友，用时 ${Date.now() - start}ms`)
    return data
  })
}

/**
 * 获取群组列表
 * @param {string} steamid
 * @returns {Promise<{
 *   gid: string,
 * }[]>}
 */
export async function GetUserGroupList (steamid) {
  logger.info(`开始获取${steamid}的群组列表`)
  const start = Date.now()
  return await utils.request.get('ISteamUser/GetUserGroupList/v1', {
    params: {
      steamid
    }
  }).then(res => {
    const data = res.data.response?.groups || []
    logger.info(`获取${steamid}的群组列表成功 共${data.length}个群组，用时 ${Date.now() - start}ms`)
    return data
  })
}

/**
 * 获取用户封禁信息
 * @param {string|string[]} steamIds
 * @returns {Promise<{
 *   SteamId: string,
 *   CommunityBanned: boolean,
 *   VACBanned: boolean,
 *   NumberOfVACBans: number,
 *   DaysSinceLastBan: number,
 *   NumberOfGameBans: number,
 *   EconomyBan: string,
 * }[]>}
 */
export async function GetPlayerBans (steamIds) {
  logger.info(`开始获取${steamIds.length}个用户的封禁信息`)
  const start = Date.now()
  !Array.isArray(steamIds) && (steamIds = [steamIds])
  const result = []
  for (const items of _.chunk(steamIds, 100)) {
    const res = await utils.request.get('ISteamUser/GetPlayerBans/v1', {
      params: {
        steamIds: items.join(',')
      }
    })
    result.push(...res.data.players)
  }
  logger.info(`获取用户封禁信息成功 ${result.length} 条数据，用时 ${Date.now() - start}ms`)
  return result
}
