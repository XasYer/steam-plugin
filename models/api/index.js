import { utils } from '#models'
import { logger } from '#lib'
export * as ISteamUser from './ISteamUser.js'
export * as IPlayerService from './IPlayerService.js'
export * as IWishlistService from './IWishlistService.js'
export * as ISteamUserStats from './ISteamUserStats.js'

/**
 * 根据appid获取游戏详情
 * @param {string|number} appid
 * @returns {Promise<{
 *   name: string,
 *   steam_appid: number,
 *   is_free: boolean,
 *   detailed_description: string,
 *   header_image: string,
 *   capsule_image: string,
 *   website: string,
 *   pc_requirements: {
 *     minimum: string,
 *     recommended: string
 *   },
 *   mac_requirements: {
 *     minimum: string,
 *     recommended: string
 *   },
 *   linux_requirements: {
 *     minimum: string,
 *     recommended: string
 *   },
 *   developers: string[],
 *   publishers: string[],
 *   price_overview: {
 *     currency: string,
 *     initial: number,
 *     final: number,
 *     discount_percent: number,
 *     initial_formatted: string,
 *     final_formatted: string
 *   },
 *   platforms: {
 *     windows: boolean,
 *     mac: boolean,
 *     linux: boolean
 *   },
 *   metacritic: {
 *     score: number,
 *     url: string
 *   },
 *   categories: {
 *     id: number,
 *     description: string
 *   }[],
 *   genres: {
 *     id: number,
 *     description: string
 *   }[],
 *   screenshots: {
 *     id: number,
 *     path_thumbnail: string,
 *     path_full: string
 *   }[],
 *   movies: {
 *     id: number,
 *     name: string,
 *     thumbnail: string,
 *     webm: {
 *       480: string,
 *       max: string,
 *     },
 *     mp4: {
 *       480: string,
 *       max: string,
 *     },
 *     highlight: boolean
 *   }[],
 *   recommendations: {
 *     total: number
 *   },
 *   achievements: {
 *     total: number,
 *     highlighted: {
 *       name: string,
 *       path: string,
 *     }[]
 *   },
 *   release_date: {
 *     coming_soon: boolean,
 *     date: string
 *   },
 *   support_info: {
 *     url: string,
 *     email: string
 *   },
 *   background: string,
 *   background_raw: string,
 * }>}
 */
export async function appdetails (appid) {
  const start = Date.now()
  logger.info(`开始获取${appid}游戏详情`)
  return utils.request.get('api/appdetails', {
    baseURL: 'https://store.steampowered.com',
    params: {
      appids: appid,
      l: 'schinese',
      cc: 'CN'
    }
  }).then(res => {
    if (res.data[appid].success) {
      logger.info(`获取${appid}游戏详情成功: ${res.data[appid].data.name}，耗时${Date.now() - start}ms`)
      return res.data[appid].data
    } else {
      logger.error(`获取${appid}游戏详情失败，耗时${Date.now() - start}ms`)
      return {}
    }
  })
}

/**
 * 搜索游戏
 * @param {string} name
 * @returns {Promise<string>}
 */
export async function search (name) {
  const start = Date.now()
  logger.info(`开始搜索${name}游戏`)
  return utils.request.get('search/suggest', {
    baseURL: 'https://store.steampowered.com',
    params: {
      term: name,
      f: 'games',
      cc: 'CN',
      realm: 1,
      l: 'schinese'
    },
    responseType: 'text'
  }).then(res => {
    logger.info(`搜索${name}成功，耗时${Date.now() - start}ms`)
    return res.data.replace?.(/\n/g, '')
  })
}

/**
 * @typedef {Object} items
 * @property {number} id appid
 * @property {number} type 未知
 * @property {string} name 游戏名
 * @property {boolean} discounted 是否正在打折
 * @property {number} discount_percent 折扣率
 * @property {number} original_price 原价(需要 / 100)
 * @property {number} final_price 现价(需要 / 100)
 * @property {string} currency 货币单位
 * @property {string} large_capsule_image 大图
 * @property {string} small_capsule_image 小图
 * @property {boolean} windows_available windows是否可用
 * @property {boolean} mac_available mac是否可用
 * @property {boolean} linux_available linux是否可用
 * @property {boolean} streamingvideo_available 未知
 * @property {number} discount_expiration 打折结束时间
 * @property {string} header_image header图
 * @property {string} controller_support 未知
 */

/**
 * 获取优惠信息
 * @returns {Promise<{
 *   specials: {
 *     id: string,
 *     name: string,
 *     items: items[]
 *   },
 *   coming_soon: {
 *     id: string,
 *     name: string,
 *     items: items[]
 *   },
 *   top_sellers: {
 *     id: string,
 *     name: string,
 *     items: items[]
 *   },
 *   new_releases: {
 *     id: string,
 *     name: string,
 *     items: items[]
 *   }
 * }>}
 */
export async function featuredcategories () {
  const start = Date.now()
  logger.info('开始获取优惠信息')
  return utils.request.get('api/featuredcategories', {
    baseURL: 'https://store.steampowered.com',
    params: {
      l: 'schinese',
      cc: 'CN'
    }
  }).then(res => {
    logger.info(`获取优惠信息成功，耗时${Date.now() - start}ms`)
    return res.data
  })
}
