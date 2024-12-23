import { api, db } from '#models'
import moment from 'moment'

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
  return `https://steamcdn-a.akamaihd.net/steam/${type}/${appid}/${name}`
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
 * 获取对应用户的access_token
 * @param {*} userId
 * @param {*} steamId
 * @returns {Promise<string>}
 */
export async function getAccessToken (userId, steamId) {
  if (!userId || !steamId) return ''
  const token = await db.TokenTableGetByUserIdAndSteamId(userId, steamId)
  if (!token) return ''
  const now = moment.unix()
  // 提前30分钟刷新access_token
  const exp = token.accessTokenExpires - 60 * 30
  if (exp > now) return token.accessToken
  // 判断refresh_token是否过期
  const rtExp = token.refreshTokenExpires - 60 * 30
  if (rtExp < now) {
    throw new Error('refresh_token已过期, 请重新登录')
  }
  const accessToken = (await api.IAuthenticationService.GenerateAccessTokenForApp(token.refreshToken, token.steamId)).access_token
  if (!accessToken) throw new Error('刷新access_token失败')
  await db.TokenTableAddData(token.userId, token.accessToken)
  return accessToken
}
