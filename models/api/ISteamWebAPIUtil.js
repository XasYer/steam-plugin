import { utils } from '#models'

/**
 * GetServerInfo
 * @returns {Promise<{
 *   servertime: number,
 *   servertimestring: string,
 * }>}
 */
export async function GetServerInfo () {
  return utils.request.get('ISteamWebAPIUtil/GetServerInfo/v1')
}
