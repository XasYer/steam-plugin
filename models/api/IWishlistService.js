import { utils } from '#models'

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
