import _ from 'lodash'
import moment from 'moment'
import { api, db } from '#models'
import { Config } from '#components'
import { randomBytes } from 'crypto'

const steamIdOffset = 76561197960265728n
/**
 * 将好友码或steamID转换成steamID
 * @param {string} id 好友码或steamID
 * @returns {string} steamID
 */
export function getSteamId (id) {
  if (!id) {
    return false
  }
  id = BigInt(id)
  if (id < steamIdOffset) {
    id = id + steamIdOffset
  }
  return id.toString()
}

/**
 * 将steamID转换成好友码
 * @param {string} steamId
 * @returns {string}
 */
export function getFriendCode (steamId) {
  if (!steamId) {
    return false
  }
  steamId = BigInt(steamId)
  return (steamId - steamIdOffset).toString()
}

/**
 * 获取appid对应的header图片url
 * @param {string} appid
 * @param {string?} type
 * @param {boolean?} isSchinese
 * @returns {string}
 */
export function getHeaderImgUrlByAppid (appid, type = 'apps', name = 'header.jpg') {
  if (!appid) return ''
  // return `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appid}/header.jpg`
  // return `https://steamcdn-a.akamaihd.net/steam/${type}/${appid}/${name}`
  return `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/${type}/${appid}/${name}`
}

/**
 * 获取静态资源url
 * - items/xxx
 * - apps/xxx
 * - replayxxx
 * @param {string} path
 * @returns {string}
 */
export function getStaticUrl (path) {
  if (!path) return ''
  if (['items', 'apps'].some(item => path.startsWith(item))) {
    // return `https://cdn.fastly.steamstatic.com/steamcommunity/public/images/${path}`
    return `https://steamcdn-a.akamaihd.net/steamcommunity/public/images/${path}`
  } else if (path.startsWith('replay')) {
    return `https://shared.cloudflare.steamstatic.com/social_sharing/${path}`
  } else if (path.startsWith('steam')) {
    // return `https://steamcdn-a.akamaihd.net/${path}`
    return `https://shared.cloudflare.steamstatic.com/store_item_assets/${path}`
  } else {
    return `https://clan.fastly.steamstatic.com/images/${path}`
  }
}

/**
 * 将用户状态码转换为中文
 * @param {number} state
 * @returns {string}
 */
export function getPersonaState (state) {
  const stateMap = {
    0: '离线',
    1: '在线',
    3: '离开',
    4: '离开'
  }
  return stateMap[state] || '其他'
}

/**
 * 解码access_token中的jwt
 * @param {string} jwt
 * @returns {jwtInfo}
 * @typedef {Object} jwtInfo
 * @property {string} iss - 发行者（issuer）。
 * @property {string} sub - 用户的 Steam ID。
 * @property {string[]} aud - 接收者（audience）。
 * @property {number} exp - Access Token 的过期时间（UNIX 时间戳）。
 * @property {number} nbf - Access Token 的生效时间（UNIX 时间戳）。
 * @property {number} iat - Access Token 的刷新时间（UNIX 时间戳）。
 * @property {string} jti - Access Token 的唯一标识符（JWT ID）。
 * @property {number} oat - Access Token 的生成时间（UNIX 时间戳）。
 * @property {number} rt_exp - Refresh Token 的过期时间（UNIX 时间戳）。
 * @property {number} per - 权限（permission level）。
 * @property {string} ip_subject - 与 Access Token 关联的 IP 地址（主）。
 * @property {string} ip_confirmer - 与 Access Token 关联的 IP 地址（确认者）。
 */
export function decodeAccessTokenJwt (jwt) {
  const parts = jwt.split('.')
  if (parts.length != 3) {
    return false
  }

  const standardBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')

  return JSON.parse(Buffer.from(standardBase64, 'base64').toString('utf8'))
}

/**
 * 获取对应用户的token信息
 * @param {string} userId
 * @param {string?} steamId
 * @returns {Promise<{
 *   success: boolean,
 *   message?: string,
 *   accessToken?: string,
 *   cookie?: string
 *   steamId?: string
 * }>}
 */
export async function getAccessToken (userId, steamId) {
  if (!userId) {
    return {
      success: false,
      message: 'userId不能为空'
    }
  }
  if (!steamId) {
    steamId = await db.user.getBind(userId)
    if (!steamId) {
      return {
        success: false,
        message: Config.tips.noSteamIdTips
      }
    }
  }
  const token = await db.token.getByUserIdAndSteamId(userId, steamId)
  if (!token) {
    return {
      success: false,
      message: Config.tips.noAccessTokenTips
    }
  }
  try {
    return {
      success: true,
      ...await refreshAccessToken(token)
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}

/**
 * 刷新access_token
 * @param {import('models/db').token.TokenColumns|string} token token列或uid
 * @param {boolean} force 是否强制刷新
 * @returns {Promise<import('models/db').token.TokenColumns|null>}
 */
export async function refreshAccessToken (token, force = false) {
  if (typeof token === 'string') {
    const steamId = await db.user.getBind(token)
    if (!steamId) {
      return null
    }
    token = await db.token.getByUserIdAndSteamId(token, steamId)
  }
  if (!token) return null
  const now = moment().unix()
  // 提前30分钟刷新access_token
  const exp = token.accessTokenExpires - 60 * 30
  const isExpired = exp < now
  if (!isExpired && token.cookie && !force) return token
  // 判断refresh_token是否过期
  const rtExp = token.refreshTokenExpires - 60 * 30
  if (rtExp < now) {
    await db.token.del(token.userId, token.steamId)
    throw new Error('refresh_token已过期, 请重新登录')
  }
  const accessToken = (isExpired || force) ? (await api.IAuthenticationService.GenerateAccessTokenForApp(token.refreshToken, token.steamId)).access_token : token.accessToken
  if (!accessToken) throw new Error('刷新access_token失败')
  const cookie = getCookie(token.steamId, accessToken)
  return await db.token.set(token.userId, accessToken, cookie)
}

/**
 * 通过steamId和accessToken生成cookie
 * @param {string} steamId
 * @param {string} accessToken
 * @returns {string}
 */
export function getCookie (steamId, accessToken) {
  const cookieValue = encodeURIComponent([steamId, accessToken].join('||'))
  const sessionId = randomBytes(12).toString('hex')
  return [`steamLoginSecure=${cookieValue}`, `sessionid=${sessionId}`].join('; ')
}

/**
 * 获取用户相关信息
 * @param {string|string[]} steamIds
 * @returns {Promise<{
*   steamid: string,
*   communityvisibilitystate: number,
*   profilestate: number,
*   personaname: string,
*   avatar: string,
*   avatarmedium: string,
*   avatarfull: string,
*   lastlogoff?: number,
*   personastate: number,
*   timecreated: string,
*   gameid?: string,
*   gameextrainfo?: string,
*   community_icon?: string
*   header?: string
* }[]>}
*/
export async function getUserSummaries (steamIds) {
  if (_.isEmpty(steamIds)) return []
  let type = Math.floor(Number(Config.push.pushApi)) || 2
  if (type > 4 || type < 1) type = 2
  if (type === 4) {
    type = _.random(1, 3)
  }
  if (type === 1) {
    let accessToken = null
    const tokenList = await db.token.getAll()
    while (!accessToken) {
      const token = _.sample(tokenList)
      if (!token) {
        break
      }
      _.pull(tokenList, token)
      accessToken = await refreshAccessToken(token)
    }
    if (accessToken) {
      const data = await api.ISteamUserOAuth.GetUserSummaries(accessToken, steamIds).catch(err => {
        if ([429, 401, 403].includes(err.status)) {
          logger.info(`请求 ISteamUserOAuth.GetUserSummaries/v2 失败: ${err.status} 尝试使用 ISteamUser.GetPlayerSummaries/v2`)
          return false
        }
        throw err
      })
      if (data !== false) {
        const names = await getGameSchineseInfo(data.map(i => i.gameid))
        return data.map(i => {
          const info = names[i.gameid]
          if (info) {
            i.gameextrainfo = info.name
            i.header = info.header
          }
          return i
        })
      }
    }
    type = 2
  }
  if (type === 2) {
    const data = await api.ISteamUser.GetPlayerSummaries(steamIds).catch(err => {
      if (err.status === 429) {
        logger.info('请求 ISteamUser/GetPlayerSummaries/v2 失败: 429 尝试使用 IPlayerService.GetPlayerLinkDetails 接口不同返回的参数会有不同')
        return false
      }
      throw err
    })
    if (data !== false) {
      const names = await getGameSchineseInfo(data.map(i => i.gameid))
      return data.map(i => {
        const info = names[i.gameid]
        if (info) {
          i.gameextrainfo = info.name
          i.header = info.header
        }
        return i
      })
    }
  }
  return await api.IPlayerService.GetPlayerLinkDetails(steamIds).then(async res => {
    // 非steam游戏会返回 17579876560805036032 不知道是不是固定的
    const appids = res.map(i => i.private_data.game_id).filter(id => id && String(id).length <= 10)
    const appInfo = {}
    if (appids.length) {
      Object.assign(appInfo, await getGameSchineseInfo(appids))
    }
    return res.map(i => {
      const avatarhash = Buffer.from(i.public_data.sha_digest_avatar, 'base64').toString('hex')
      const gameid = i.private_data.game_id
      const info = appInfo[gameid] || {}
      const gameextrainfo = info.name
      return {
        steamid: i.public_data.steamid,
        communityvisibilitystate: i.public_data.visibility_state,
        profilestate: i.public_data.profile_state,
        personaname: i.public_data.persona_name,
        avatar: `https://avatars.steamstatic.com/${avatarhash}.jpg`,
        avatarmedium: `https://avatars.steamstatic.com/${avatarhash}_medium.jpg`,
        avatarfull: `https://avatars.steamstatic.com/${avatarhash}_full.jpg`,
        avatarhash,
        personastate: i.private_data.persona_state ?? 0,
        timecreated: i.private_data.time_created,
        gameid: (gameid && String(gameid).length <= 10) ? gameid : undefined,
        gameextrainfo,
        lastlogoff: i.private_data.last_logoff_time,
        header: info.assets?.header || info.header
        // TODO: 展示在好友列表的小图标
        // community_icon: appInfo[gameid]?.assets?.community_icon
      }
    })
  })
}

/**
 * 获取状态对应的颜色
 * @param {number} state
 * @returns {string}
 */
export function getStateColor (state) {
  switch (Number(state)) {
    case 1:
      return '#beee11'
    case 0:
      return '#999999'
    default:
      return '#8fbc8b'
  }
}

/**
 * 从数据库中获取游戏中文名
 * @param {string[]} appids
 * @returns {Promise<{[appid: string]: import('models/db/game').GameColumns}>}
 */
export async function getGameSchineseInfo (appids) {
  appids = _.uniq(appids.filter(Boolean).map(String))
  if (!appids.length) {
    return {}
  }
  try {
    // 先从数据库中找出对应的游戏名
    const appInfo = await db.game.get(appids)
    const cacheAppids = Object.keys(appInfo)
    // 找到没有被缓存的appid
    const noCacheAppids = _.difference(appids, cacheAppids)
    // 找到缓存超过3天的appid
    const now = moment().unix()
    const cacheExpiredAppids = cacheAppids.filter(i => {
      const lastUpdatedTime = moment(appInfo[i].updatedAt).unix()
      return (now - lastUpdatedTime) > 3 * 24 * 60 * 60
    })
    const hasCacheAppids = [...noCacheAppids, ...cacheExpiredAppids]
    if (hasCacheAppids.length) {
      // 获取游戏名
      const info = await api.IStoreBrowseService.GetItems(hasCacheAppids, { include_assets: true })
      const cache = hasCacheAppids.map(i => info[i]
        ? ({
            appid: String(i),
            name: info[i].name,
            community: info[i].assets?.community_icon,
            header: info[i].assets?.header
          })
        : null).filter(Boolean)
      const newCache = []
      const expiredCache = []
      cache.forEach(i => {
        if (noCacheAppids.includes(i.appid)) {
          newCache.push(i)
        } else if (cacheExpiredAppids.includes(i.appid)) {
          expiredCache.push(i)
        }
      })
      // 缓存游戏名
      if (newCache.length) {
        await db.game.add(newCache)
      }
      if (expiredCache.length) {
        for (const i of expiredCache) {
          await db.game.set(i.appid, i)
        }
      }
      Object.assign(appInfo, _.keyBy(cache, 'appid'))
    }
    return appInfo
  } catch (error) {
    return {}
  }
}

/**
 * 生成价格信息 用于制作图片
 * @param {Object} price IStoreBrowseService.GetItem().best_purchase_option 的格式 后续再兼容其他的
 * @param {boolean} isFree
 * @returns {{
 *   original: string,
 *   discount?: number,
 *   current?: string
 * }}
 */
export function generatePrice (price, isFree = false) {
  return price?.discount_pct
    ? {
        original: price.formatted_original_price,
        discount: price.discount_pct,
        current: price.formatted_final_price
      }
    : {
        original: isFree ? '免费开玩' : price?.formatted_final_price || ''
      }
}

/**
 * 数字对应的语言中文
 * @param {number} elanguage
 * @returns {string}
 */
export function getElanguageCN (elanguage) {
  return [
    '英语',
    '德语',
    '法语',
    '意大利语',
    '韩语',
    '西班牙语',
    '简体中文',
    '繁体中文',
    '俄语',
    '泰语',
    '日语',
    '葡萄牙语（巴西）',
    '波兰语',
    '丹麦语',
    '荷兰语',
    '芬兰语',
    '挪威语',
    '瑞典语',
    '匈牙利语',
    '捷克语',
    '罗马尼亚语',
    '土耳其语',
    '葡萄牙语（葡萄牙）',
    '保加利亚语',
    '希腊语',
    '不知道',
    '乌克兰语',
    '西班牙语（拉丁美洲）',
    '越南语',
    '不知道',
    '印尼语'
  ][elanguage] || '不知道'
}
