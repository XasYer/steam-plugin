import _ from 'lodash'
import { utils } from '#models'

/**
 * 获取用户相关信息
 * @param {string|string[]} steamIds
 * @returns {Promise<{
 *   steamid: string,
 *   communityvisibilitystate: number,
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
  !Array.isArray(steamIds) && (steamIds = [steamIds])
  const result = []
  // 一次只能获取100个用户信息
  for (const items of _.chunk(steamIds, 100)) {
    const res = await utils.request.get('ISteamUser/GetPlayerSummaries/v2', {
      params: {
        steamIds: items.join(',')
      }
    })
    if (res.response?.players?.length) {
      result.push(...res.response.players)
    }
  }
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
  return await utils.request.get('ISteamUser/GetFriendList/v1', {
    params: {
      steamid
    }
  }).then(res => res.friendslist.friends)
}

/**
 * 获取群组列表
 * @param {string} steamid
 * @returns {Promise<{
 *   gid: string,
 * }[]>}
 */
export async function GetUserGroupList (steamid) {
  return await utils.request.get('ISteamUser/GetUserGroupList/v1', {
    params: {
      steamid
    }
  }).then(res => res.response?.groups || [])
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
  !Array.isArray(steamIds) && (steamIds = [steamIds])
  const result = []
  for (const items of _.chunk(steamIds, 100)) {
    const res = await utils.request.get('ISteamUser/GetPlayerBans/v1', {
      params: {
        steamIds: items.join(',')
      }
    })
    result.push(...res.players)
  }
  return result
}
