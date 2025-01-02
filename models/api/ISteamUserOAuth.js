import _ from 'lodash'
import { utils } from '#models'

/**
 * 获取用户相关信息
 * @param {string} accessToken
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
export async function GetUserSummaries (accessToken, steamIds) {
  !Array.isArray(steamIds) && (steamIds = [steamIds])
  const result = []
  // 一次只能获取100个用户信息
  for (const items of _.chunk(steamIds, 100)) {
    const res = await utils.request.get('ISteamUserOAuth/GetUserSummaries/v2', {
      params: {
        access_token: accessToken,
        steamIds: items.join(',')
      }
    })
    if (res.players?.length) {
      result.push(...res.players)
    }
  }
  return result
}
