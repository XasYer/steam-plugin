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
    result.push(...res.data.response.players)
  }
  logger.info(`获取用户相关信息成功 ${result.length} 条数据，用时 ${Date.now() - start}ms`)
  return result
}
