import { utils } from '#models'

/**
 * 开始扫码登录
 * @returns {Promise<{
 *  client_id: string,
 *  challenge_url: string,
 *  request_id: string,
 *  interval: number,
 *  allowed_confirmations: {
 *    confirmation_type: number
 *  }[],
 *  version: number
 * }>}
 */
export async function BeginAuthSessionViaQR () {
  const input = {
    device_details: {
      device_friendly_name: 'Xiaomi 15 Pro',
      platform_type: 3,
      os_type: -500,
      gaming_device_type: 528
    },
    website_id: 'Mobile'
  }
  return utils.request.post('IAuthenticationService/BeginAuthSessionViaQR/v1', {
    params: {
      input_json: JSON.stringify(input),
      key: undefined
    }
  }).then(res => res.response)
}

/**
 * 列举已登录的账号
 * @param {string} accessToken
 * @returns {Promise<{
 *   refresh_tokens: {
 *     token_id: string,
 *     token_description: string,
 *     time_updated: number,
 *     platform_type: number,
 *     logged_in: boolean,
 *     os_platform: number,
 *     auth_type: number,
 *     gaming_device_type: number,
 *     first_seen: {
 *       time: number,
 *     },
 *     last_seen: {
 *       time: number,
 *       ip: {
 *         v4: number
 *       }
 *       country: string,
 *       state: string,
 *       city: string,
 *     },
 *     os_type: number,
 *     authentication_type: number,
 *   }[]
 *   requesting_token: string
 * }>}
 */
export async function EnumerateTokens (accessToken) {
  return utils.request.post('IAuthenticationService/EnumerateTokens/v1', {
    params: {
      access_token: accessToken,
      key: undefined
    }
  }).then(res => res.response)
}

/**
 * 刷新access_token
 * @param {string} refreshToken
 * @param {string} steamId
 * @returns {Promise<{
 *  access_token?: string,
 * }>}
 */
export async function GenerateAccessTokenForApp (refreshToken, steamId) {
  return utils.request.post('IAuthenticationService/GenerateAccessTokenForApp/v1', {
    params: {
      refresh_token: refreshToken,
      steamid: steamId,
      renewal_type: 0,
      key: undefined
    }
  }).then(res => res.response)
}

/**
 * 查询扫码登录结果
 * @param {string} clientId
 * @param {string} requestId
 * @returns {Promise<{
 *  had_remote_interaction: boolean,
 *  refresh_token?: string,
 *  access_token?: string,
 *  account_name?: string,
 * }>}
 */
export async function PollAuthSessionStatus (clientId, requestId) {
  return utils.request.post('IAuthenticationService/PollAuthSessionStatus/v1', {
    params: {
      client_id: clientId,
      request_id: requestId,
      token_to_revoke: 0,
      key: undefined
    }
  }).then(res => res.response)
}
