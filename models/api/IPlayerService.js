import { utils } from '#models'
import { logger } from '#lib'

/**
 * 获取steamId最近玩过的游戏列表
 * @param {string} steamid
 * @returns {Promise<{
 *  appid: number,
 *  name: string,
 *  playtime_2weeks?: number,
 *  playtime_forever: number,
 *  img_icon_url: string,
 *  playtime_windows_forever: number,
 *  playtime_mac_forever: number,
 *  playtime_linux_forever: number
 *  playtime_deck_forever: number
 * }[]>}
 */
export async function GetRecentlyPlayedGames (steamid) {
  const start = Date.now()
  logger.info(`开始获取${steamid}最近游戏列表`)
  return utils.request.get('IPlayerService/GetRecentlyPlayedGames/v1', {
    params: {
      steamid
    }
  }).then(res => {
    logger.info(`获取${steamid}最近游戏列表成功，共${res.data.response?.total_count}个游戏，耗时${Date.now() - start}ms`)
    return res.data.response?.games || []
  })
}

/**
 * 获取steamId拥有的游戏列表
 * @param {string} steamid
 * @returns {Promise<{
*  appid: number,
*  name: string,
*  playtime_2weeks?: number,
*  playtime_forever: number,
*  img_icon_url: string,
*  has_community_visible_stats: boolean,
*  playtime_windows_forever: number,
*  playtime_mac_forever: number,
*  playtime_linux_forever: number
*  playtime_deck_forever: number
*  rtime_last_played: number
*  capsule_filename: string
*  has_workshop: boolean,
*  has_market: boolean,
*  has_dlc: boolean,
*  content_descriptorids: number[]
*  playtime_disconnected: number
* }[]>}
*/
export async function GetOwnedGames (steamid) {
  const start = Date.now()
  logger.info(`开始获取${steamid}拥有的游戏列表`)
  return utils.request.get('IPlayerService/GetOwnedGames/v1', {
    params: {
      steamid,
      language: 'schinese',
      include_appinfo: true,
      include_extended_appinfo: true
    }
  }).then(res => {
    logger.info(`获取${steamid}拥有的游戏列表成功，共${res.data.response?.game_count}个游戏，耗时${Date.now() - start}ms`)
    return res.data.response?.games || []
  })
}
