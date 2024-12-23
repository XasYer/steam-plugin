import { utils } from '#models'

/**
 * GetMobileSummary
 * @param {string} accessToken
 * @param {number} authenticatorGid
 * @returns {Promise<unknown>}
 */
export async function GetMobileSummary (accessToken, authenticatorGid) {
  return utils.request.post('IMobileAppService/GetMobileSummary/v1', {
    params: {
      access_token: accessToken,
      authenticator_gid: authenticatorGid
    }
  })
}
