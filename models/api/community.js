import { utils } from '#models'
import { Config } from '#components'

export function getBaseURL () {
  const url = 'https://steamcommunity.com/'
  if (Config.steam.commonProxy) {
    return Config.steam.commonProxy.replace('{{url}}', url)
  } else if (Config.steam.communityProxy) {
    return Config.steam.communityProxy.replace(/\/$/, '')
  } else {
    return url
  }
}

/**
 * 获取迷你信息
 * @param {number} friendCode
 * @param {boolean} json
 * @returns {Promise<{
 *   level: number,
 *   level_class: string,
 *   avatar_url: string,
 *   persona_name: string,
 *   favorite_badge?: {
 *     name: string,
 *     xp: string
 *     level: number
 *     description: string
 *     icon: string
 *   },
 *   in_game?: {
 *     name: string,
 *     is_non_steam: boolean,
 *     logo: string,
 *     rich_presence: string
 *   },
 *   profile_background?: {
 *     'video/webm': string,
 *     'video/mp4': string,
 *   },
 *   avatar_frame?: string,
 * }|string>}
 */
export async function miniprofile (friendCode, json = false) {
  return utils.request.get(`miniprofile/${friendCode}${json ? '/json' : ''}`, {
    baseURL: getBaseURL(),
    params: {
      t: Date.now()
    }
  })
}
