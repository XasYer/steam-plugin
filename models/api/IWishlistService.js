import { utils } from '#models'
import { logger } from '#lib'

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
  logger.info(`开始获取用户 ${steamid} 的愿望单`)
  const start = Date.now()
  return utils.request.get('IWishlistService/GetWishlist/v1', {
    params: {
      steamid
    }
  }).then(res => {
    logger.info(`获取用户 ${steamid} 的愿望单成功 共 ${res.data.response.items?.length}个 用时 ${Date.now() - start}ms`)
    return res.data.response.items || []
  })
}

/**
 * 获取用户的愿望单数量
 * @param {string} steamid
 * @returns {Promise<number>}
 */
export async function GetWishlistItemCount (steamid) {
  logger.info(`开始获取用户 ${steamid} 的愿望单数量`)
  const start = Date.now()
  return utils.request.get('IWishlistService/GetWishlistItemCount/v1', {
    params: {
      steamid
    }
  }).then(res => {
    logger.info(`获取用户 ${steamid} 的愿望单数量成功 数量 ${res.data.response.count} 用时 ${Date.now() - start}ms`)
    return res.data.response.count
  })
}
