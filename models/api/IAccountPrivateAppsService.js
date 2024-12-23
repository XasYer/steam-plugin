import { utils } from '#models'
import _ from 'lodash'

/**
 * 获得私密应用列表
 * @param {string} accessToken
 * @returns {Promise<number[]>}
 */
export async function GetPrivateAppList (accessToken) {
  return utils.request.get('IAccountPrivateAppsService/GetPrivateAppList/v1', {
    params: {
      access_token: accessToken
    }
  }).then(res => res.response.private_apps?.appids || [])
}

/**
 * 添加或删除私密应用
 * @param {string} accessToken
 * @param {number[]} appids
 * @param {boolean} flag
 * @returns {Promise<undefined>}
 */
export async function ToggleAppPrivacy (accessToken, appids, flag = true) {
  !Array.isArray(appids) && (appids = [appids])
  for (const items of _.chunk(appids, 100)) {
    const params = items.reduce((acc, appid, index) => {
      acc[`appids[${index}]`] = appid
      return acc
    }, {})
    await utils.request.post('IAccountPrivateAppsService/ToggleAppPrivacy/v1', {
      params: {
        access_token: accessToken,
        private: flag,
        ...params
      }
    })
  }
}
