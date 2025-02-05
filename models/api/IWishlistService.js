import { utils } from '#models'

/**
 * 添加到愿望单
 * @param {string} accessToken
 * @param {string} appid
 * @returns {Promise<undefined>}
 */
export async function AddToWishlist (accessToken, appid) {
  return utils.request.post('IWishlistService/AddToWishlist/v1', {
    params: {
      access_token: accessToken,
      appid
    }
  }).then(res => res.response)
}

/**
 * 获取用户的愿望单 (居然不给name)
 * @param {string} steamid
 * @returns {Promise<{
 *   appid: number,
 *   priority: number,
 *   date_added: number
 * }[]>}
 */
export async function GetWishlist (steamid) {
  return utils.request.get('IWishlistService/GetWishlist/v1', {
    params: {
      steamid
    }
  }).then(res => res.response.items || [])
}

/**
 * 获取用户的愿望单数量
 * @param {string} steamid
 * @returns {Promise<number>}
 */
export async function GetWishlistItemCount (steamid) {
  return utils.request.get('IWishlistService/GetWishlistItemCount/v1', {
    params: {
      steamid
    }
  }).then(res => res.response.count)
}

/**
 * 移除愿望单
 * @param {string} accessToken
 * @param {string} appid
 * @returns {Promise<number>} 愿望单数量
 */
export async function RemoveFromWishlist (accessToken, appid) {
  return utils.request.post('IWishlistService/RemoveFromWishlist/v1', {
    params: {
      access_token: accessToken,
      appid
    }
  }).then(res => res.response.wishlist_count)
}
