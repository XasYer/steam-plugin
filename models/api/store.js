import { utils } from '#models'
import { Config } from '#components'

export function getBaseURL () {
  const url = 'https://store.steampowered.com'
  if (Config.steam.commonProxy) {
    return Config.steam.commonProxy.replace('{{url}}', url)
  } else if (Config.steam.storeProxy) {
    return Config.steam.storeProxy?.replace(/\/$/, '')
  } else {
    return url
  }
}

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
  return utils.request.get('api/appdetails', {
    baseURL: getBaseURL(),
    params: {
      appids: appid
    }
  }).then(res => res?.[appid]?.data || {})
}

/**
* 搜索游戏
* @param {string} name
* @returns {Promise<string>}
*/
export async function search (name) {
  return utils.request.get('search/suggest', {
    baseURL: getBaseURL(),
    params: {
      term: name,
      f: 'games',
      realm: 1
    },
    responseType: 'text'
  }).then(res => res.replace?.(/\n/g, ''))
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
  return utils.request.get('api/featuredcategories', {
    baseURL: getBaseURL()
  })
}

/**
* 获取优惠信息
* @returns {Promise<{
*   id: number,
*   type: number,
*   name: string,
*   discounted: boolean,
*   discount_percent: number,
*   original_price: number,
*   final_price: number,
*   currency: string,
*   large_capsule_image: string,
*   small_capsule_image: string,
*   windows_available: boolean,
*   mac_available: boolean,
*   linux_available: boolean,
*   streamingvideo_available: boolean,
*   discount_expiration: number,
*   header_image: string
* }[]>}
*/
export async function featured () {
  return utils.request.get('api/featured', {
    baseURL: getBaseURL()
  }).then(res => res.featured_win || [])
}

/**
* 获取游戏评论
* @param {string} appid
* @param {boolean} recent 是否最新评论
* @param {number} count 数量
* @returns {Promise<{
*   success: boolean,
*   html: string,
*   review_score: string,
*   dayrange: number,
*   start_date: number,
*   end_date: number,
*   recommendationids: string[],
*   cursor: string
* }>}
*/
export async function appreviews (appid, count = 30, recent = false) {
  return utils.request.get(`appreviews/${appid}`, {
    baseURL: getBaseURL(),
    params: {
      filter: recent ? 'recent' : 'all',
      num_per_page: count
    }
  })
}

/**
 * 添加愿望单
 * @param {string} cookie
 * @param {number} appid
 * @returns {Promise<{
 *   success: boolean,
 *   wishlistCount: number
 * }>}
 */
export async function addtowishlist (cookie, appid) {
  const sessionid = cookie.split(';').find(i => i.includes('sessionid')).split('=')[1]
  const data = new URLSearchParams()
  data.append('appid', appid)
  data.append('sessionid', sessionid)
  return utils.request.post('api/addtowishlist', {
    baseURL: getBaseURL(),
    headers: {
      Cookie: cookie,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data
  })
}

/**
 * 删除愿望单
 * @param {string} cookie
 * @param {number} appid
 * @returns {Promise<{
 *   success: boolean,
 *   wishlistCount: number
 * }>}
 */
export async function removefromwishlist (cookie, appid) {
  const sessionid = cookie.split(';').find(i => i.includes('sessionid')).split('=')[1]
  const data = new URLSearchParams()
  data.append('appid', appid)
  data.append('sessionid', sessionid)
  return utils.request.post('api/removefromwishlist', {
    baseURL: getBaseURL(),
    headers: {
      Cookie: cookie,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data
  })
}

/**
 *
 * @param {number} clanAccountid
 * @param {number} announcementGid
 * @returns {Promise<any>}
 */
export async function ajaxgetpartnerevent (clanAccountid, announcementGid) {
  return utils.request.get('events/ajaxgetpartnerevent', {
    baseURL: getBaseURL(),
    params: {
      clan_accountid: clanAccountid,
      announcement_gid: announcementGid,
      lang_list: '6_0',
      last_modified_time: 0,
      for_edit: false
    }
  }).then(res => res.event || {})
}
