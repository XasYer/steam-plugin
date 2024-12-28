import { utils } from '#models'

/**
 * 获取社区信息
 * @param {number} appid
 * @returns {Promise<{
 *  appid: number
 *  name: string
 *  icon: string
 *  community_visible_stats: boolean
 *  propagation: string
 *  app_type: number,
 *  content_descriptorids?: number[]
 * }[]>}
 */
export async function GetApps (appids) {
  !Array.isArray(appids) && (appids = [appids])
  const input = {
    language: 6,
    appids
  }
  return await utils.request.get('ICommunityService/GetApps/v1', {
    params: {
      input_json: JSON.stringify(input)
    }
  }).then(res => res.response.apps || [])
}

/**
 * 获取历史头像
 * @param {string} accessToken
 * @param {string} steamid
 * @returns {Promise<unknown>}
 */
export async function GetAvatarHistory (accessToken, steamid) {
  return await utils.request.post('ICommunityService/GetAvatarHistory/v1', {
    params: {
      access_token: accessToken,
      steamid
    }
  })
}
