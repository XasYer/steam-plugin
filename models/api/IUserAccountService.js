import { utils } from '#models'

/**
 * 获取用户的地区代码
 * @param {string} accessToken
 * @param {string} steamId
 * @returns {Promise<string>}
 */
export async function GetUserCountry (accessToken, steamId) {
  return utils.request.post('IUserAccountService/GetUserCountry/v1', {
    params: {
      access_token: accessToken,
      steamid: steamId
    }
  }).then(res => res.response.country)
}
