import _ from 'lodash'
import moment from 'moment'
import { api, db } from '#models'
import { Config } from '#components'

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
 * @param {string} userId
 * @param {string} steamId
 * @returns {Promise<string>}
 */
export async function getAccessToken (userId, steamId) {
  if (!userId || !steamId) return ''
  const token = await db.TokenTableGetByUserIdAndSteamId(userId, steamId)
  return await refreshAccessToken(token)
}

/**
 * 刷新access_token
 * @param {import('models/db').TokenColumns} token
 * @returns
 */
export async function refreshAccessToken (token) {
  if (!token) return ''
  const now = moment().unix()
  // 提前30分钟刷新access_token
  const exp = token.accessTokenExpires - 60 * 30
  if (exp > now) return token.accessToken
  // 判断refresh_token是否过期
  const rtExp = token.refreshTokenExpires - 60 * 30
  if (rtExp < now) {
    await db.TokenTableDeleteByUserIdAndSteamId(token.userId, token.steamId)
    throw new Error('refresh_token已过期, 请重新登录')
  }
  const accessToken = (await api.IAuthenticationService.GenerateAccessTokenForApp(token.refreshToken, token.steamId)).access_token
  if (!accessToken) throw new Error('刷新access_token失败')
  await db.TokenTableAddData(token.userId, accessToken)
  return accessToken
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
    const tokenList = await db.TokenTableGetAll()
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
        if (Config.push.cacheName) {
          const names = await getGameName(data.map(i => i.gameid))
          return data.map(i => {
            const info = names[i.gameid]
            if (info) {
              i.gameextrainfo = info.name
            }
            return i
          })
        } else {
          return data
        }
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
      if (Config.push.cacheName) {
        const names = await getGameName(data.map(i => i.gameid))
        return data.map(i => {
          const info = names[i.gameid]
          if (info) {
            i.gameextrainfo = info.name
          }
          return i
        })
      } else {
        return data
      }
    }
  }
  return await api.IPlayerService.GetPlayerLinkDetails(steamIds).then(async res => {
    const appids = res.map(i => i.private_data.game_id).filter(Boolean)
    const appInfo = {}
    if (appids.length) {
      if (Config.push.cacheName) {
        Object.assign(appInfo, await getGameName(appids))
      } else {
        const info = await api.IStoreBrowseService.GetItems(appids, { include_assets: true })
        Object.assign(appInfo, info)
      }
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
        gameid,
        gameextrainfo,
        lastlogoff: i.private_data.last_logoff_time
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
export async function getGameName (appids) {
  appids = appids.filter(Boolean).map(String)
  if (!appids.length) {
    return {}
  }
  try {
    // 先从数据库中找出对应的游戏名
    const appInfo = await db.GameTableGetGameByAppids(appids)
    const cacheAppids = Object.keys(appInfo)
    // 找到没有被缓存的appid
    const noCacheAppids = _.difference(appids, cacheAppids)
    if (noCacheAppids.length) {
      // 获取游戏名
      const info = await api.IStoreBrowseService.GetItems(noCacheAppids, { include_assets: true })
      const cache = noCacheAppids.map(i => info[i]
        ? ({
            appid: i,
            name: info[i].name,
            community: info[i].assets?.community_icon,
            header: info[i].assets?.header
          })
        : null).filter(Boolean)
      // 缓存游戏名
      await db.GameTableAddGame(cache)
      Object.assign(appInfo, _.keyBy(cache, 'appid'))
    }
    return appInfo
  } catch (error) {
    return {}
  }
}
