import { utils } from '#models'

/**
 * GetFavorites
 * @param {string} accessToken
 * @returns {Promise<unknown>}
 */
export async function GetFavorites (accessToken) {
  return utils.request.get('IFriendsListService/GetFavorites/v1', {
    params: {
      access_token: accessToken
    }
  })
}

/**
 * 获得好友列表
 * @param {string} accessToken
 * @returns {Promise<{
 *   bincremental: boolean,
 *   friends: {
 *     ulfriendid: string,
 *     efriendrelationship: number,
 *   }
 * }>}
 */
export async function GetFriendsList (accessToken) {
  return utils.request.get('IFriendsListService/GetFriendsList/v1', {
    params: {
      access_token: accessToken
    }
  })
}
