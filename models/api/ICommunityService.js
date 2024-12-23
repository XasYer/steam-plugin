import { utils } from '#models'
import _ from 'lodash'

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
  const result = []
  for (const items of _.chunk(appids, 100)) {
    const params = items.reduce((acc, appid, index) => {
      acc[`appids[${index}]`] = appid
      return acc
    }, {})
    const res = await utils.request.get('ICommunityService/GetApps/v1', {
      params: {
        language: 6,
        ...params
      }
    })
    if (res.response.apps?.length) {
      result.push(...res.response.apps)
    }
  }
  return result
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
