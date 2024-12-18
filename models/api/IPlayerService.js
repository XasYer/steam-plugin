import { utils } from '#models'
import { logger } from '#lib'

/**
 * 获取steamId最近玩过的游戏列表
 * @param {string} steamid
 * @returns {Promise<{
 *  appid: number,
 *  name: string,
 *  playtime_2weeks?: number,
 *  playtime_forever: number,
 *  img_icon_url: string,
 *  playtime_windows_forever: number,
 *  playtime_mac_forever: number,
 *  playtime_linux_forever: number
 *  playtime_deck_forever: number
 * }[]>}
 */
export async function GetRecentlyPlayedGames (steamid) {
  const start = Date.now()
  logger.info(`开始获取${steamid}最近游戏列表`)
  return utils.request.get('IPlayerService/GetRecentlyPlayedGames/v1', {
    params: {
      steamid
    }
  }).then(res => {
    logger.info(`获取${steamid}最近游戏列表成功，共${res.data.response?.total_count}个游戏，耗时${Date.now() - start}ms`)
    return res.data.response?.games || []
  })
}

/**
 * 获取steamId拥有的游戏列表
 * @param {string} steamid
 * @returns {Promise<{
*  appid: number,
*  name: string,
*  playtime_2weeks?: number,
*  playtime_forever: number,
*  img_icon_url: string,
*  has_community_visible_stats: boolean,
*  playtime_windows_forever: number,
*  playtime_mac_forever: number,
*  playtime_linux_forever: number
*  playtime_deck_forever: number
*  rtime_last_played: number
*  capsule_filename: string
*  has_workshop: boolean,
*  has_market: boolean,
*  has_dlc: boolean,
*  content_descriptorids: number[]
*  playtime_disconnected: number
* }[]>}
*/
export async function GetOwnedGames (steamid) {
  const start = Date.now()
  logger.info(`开始获取${steamid}拥有的游戏列表`)
  return utils.request.get('IPlayerService/GetOwnedGames/v1', {
    params: {
      steamid,
      include_appinfo: true,
      include_extended_appinfo: true
    }
  }).then(res => {
    logger.info(`获取${steamid}拥有的游戏列表成功，共${res.data.response?.game_count}个游戏，耗时${Date.now() - start}ms`)
    return res.data.response?.games || []
  })
}

/**
 * 获取steamId的Steam等级
 * @param {string} steamid
 * @returns {Promise<number>}
 */
export async function GetSteamLevel (steamid) {
  const start = Date.now()
  logger.info(`开始获取${steamid}的Steam等级`)
  return utils.request.get('IPlayerService/GetSteamLevel/v1', {
    params: {
      steamid
    }
  }).then(res => {
    const data = res.data.response?.player_level
    logger.info(`获取${steamid}的Steam等级成功，等级${res.data.response?.player_level}，耗时${Date.now() - start}ms`)
    return data
  })
}

/**
 * 获取steamId的勋章信息
 * @param {string} steamid
 * @returns {Promise<{
 *  badges: {
 *    badgeid: number,
 *    level: number,
 *    completion_time: number,
 *    xp: number,
 *    scarcity: number,
 *  }[],
 *  player_xp: number,
 *  player_level: number,
 *  player_xp_needed_to_level_up: number,
 *  player_next_level_xp: number
 * }>}
 */
export async function GetBadges (steamid) {
  const start = Date.now()
  logger.info(`开始获取${steamid}的徽章信息`)
  return utils.request.get('IPlayerService/GetBadges/v1', {
    params: {
      steamid
    }
  }).then(res => {
    const data = res.data.response || {}
    logger.info(`获取${steamid}的徽章信息成功，共${data.length}个徽章，耗时${Date.now() - start}ms`)
    return data
  })
}

/**
 * 获取要获得指定徽章所需的全部任务，以及已完成的任务
 * @param {string} steamid
 * @param {number} badgeid
 * @returns {Promise<{
 *   questid: number,
 *   completed: boolean
 * }[]>}
 */
export async function GetCommunityBadgeProgress (steamid, badgeid) {
  const start = Date.now()
  logger.info(`开始获取${steamid}的${badgeid}徽章任务`)
  return utils.request.get('IPlayerService/GetCommunityBadgeProgress/v1', {
    params: {
      steamid,
      badgeid
    }
  }).then(res => {
    const data = res.data.response?.quests || []
    logger.info(`获取${steamid}的社区徽章进度成功，共${data.length}个任务，耗时${Date.now() - start}ms`)
    return data
  })
}

/**
 * 获得用户标记为收藏的徽章
 * @param {string} steamid
 * @returns {Promise<{
 *   has_favorite_badge: boolean,
 *   communityitemid?: string,
 *   item_type?: number
 *   border_color?: number
 *   appid?: number
 *   level?: number
 * }>}
 */
export async function GetFavoriteBadge (steamid) {
  const start = Date.now()
  logger.info(`开始获取${steamid}的标记为收藏的徽章`)
  return utils.request.get('IPlayerService/GetFavoriteBadge/v1', {
    params: {
      steamid
    }
  }).then(res => {
    const data = res.data.response
    logger.info(`获取${steamid}的标记为收藏的徽章成功，耗时${Date.now() - start}ms`)
    return data
  })
}

/**
 * 也是获取指定游戏的全局成就百分比
 * @param {string} appid
 * @returns {Promise<{
 *  internal_name: string,
 *  localized_name: string,
 *  localized_desc: string,
 *  icon: string,
 *  icon_gray: string,
 *  hidden: boolean,
 *  player_percent_unlocked: string,
 * }>}
 */
export async function GetGameAchievements (appid) {
  const start = Date.now()
  logger.info(`开始获取${appid}的成就完成度`)
  return utils.request.get('IPlayerService/GetGameAchievements/v1', {
    params: {
      appid
    }
  }).then(res => {
    const data = res.data.response
    logger.info(`获取${appid}的成就列表成功，共${data.achievements?.length}个成就，耗时${Date.now() - start}ms`)
    return data.achievements || []
  })
}

/**
 * 获取用户信息
 * rich_presence_kv 包含了当前状态, 但是没有中文
 * @param {string[]} steamids
 * @returns {Promise<{
 *   public_data: {
 *     steamid: string,
 *     visibility_state: number,
 *     profile_state: number,
 *     sha_digest_avatar: string,
 *     persona_name: string,
 *     profile_url: string,
 *     content_country_restricted: number
 *   }
 *   private_data: {
 *     persona_state?: number,
 *     persona_state_flags?: number,
 *     time_created?: number,
 *     game_id?: number,
 *     game_server_steam_id?: number,
 *     game_server_ip_address?: number,
 *     game_server_port?: number,
 *     game_extra_info?: string,
 *     rich_presence_kv?: string,
 *     broadcast_session_id: string,
 *     last_logoff_time?: number,
 *     last_seen_online?: number,
 *     game_os_type?: number,
 *     game_device_type?: number,
 *     game_device_name?: string,
 *   }
 * }[]>}
 */
export async function GetPlayerLinkDetails (steamids) {
  steamids = Array.isArray(steamids) ? steamids : [steamids]
  const params = steamids.reduce((acc, steamid, index) => {
    acc[`steamids[${index}]`] = steamid
    return acc
  }, {})
  const start = Date.now()
  logger.info(`开始获取${steamids.length}个用户的信息`)
  return utils.request.get('IPlayerService/GetPlayerLinkDetails/v1', {
    params
  }).then(res => {
    const data = res.data.response.accounts
    logger.info(`获取${steamids.length}个用户的信息成功，耗时${Date.now() - start}ms`)
    return data
  })
}

/**
 * 获取steamId的动画头像信息
 * @param {string} steamid
 * @returns {Promise<{
*   communityitemid: string,
*   image_small: string,
*   image_large: string,
*   name: string,
*   item_title: string
*   item_description: string,
*   appid: number,
*   item_type: number,
*   item_class: number,
* }>}
*/
export async function GetAnimatedAvatar (steamid) {
  const start = Date.now()
  logger.info(`开始获取${steamid}的动态头像`)
  return utils.request.get('IPlayerService/GetAnimatedAvatar/v1', {
    params: {
      steamid
    }
  }).then(res => {
    const data = res.data.response?.avatar || {}
    logger.info(`获取${steamid}的动态头像成功，耗时${Date.now() - start}ms`)
    return data
  })
}

/**
 * 获取steamId的自定义展示内容
 * @param {string} steamid
 * @returns {Promise<{
 *   customizations?: {
 *     customization_type: number,
 *     large: boolean,
 *     slots: {
 *       slot: number,
 *       appid?: number,
 *       publishedfileid?: string,
 *     }[]
 *     active: boolean,
 *     customization_style: number,
 *     purchaseid: string,
 *     level: number,
 *   }
 *   slots_available?: number,
 *   profile_theme: {
 *     theme_id: string,
 *     title: string,
 *   },
 *   purchased_customizations?: [
 *     purchaseid: string,
 *     customization_type: number,
 *     level: number,
 *   ]
 *   profile_preferences: {
 *     hide_profile_awards: boolean,
 *   }
* }>}
*/
export async function GetProfileCustomization (steamid) {
  const start = Date.now()
  logger.info(`开始获取${steamid}的自定义展示内容`)
  return utils.request.get('IPlayerService/GetProfileCustomization/v1', {
    params: {
      steamid
    }
  }).then(res => {
    const data = res.data.response
    logger.info(`获取${steamid}的自定义展示内容成功，耗时${Date.now() - start}ms`)
    return data
  })
}

/**
 * 获取steamId的头像框信息
 * @param {string} steamid
 * @returns {Promise<{
 *   communityitemid: string,
 *   image_small: string,
 *   image_large: string,
 *   name: string,
 *   item_title: string
 *   item_description: string,
 *   appid: number,
 *   item_type: number,
 *   item_class: number,
 * }>}
 */
export async function GetAvatarFrame (steamid) {
  const start = Date.now()
  logger.info(`开始获取${steamid}的头像框`)
  return utils.request.get('IPlayerService/GetAvatarFrame/v1', {
    params: {
      steamid
    }
  }).then(res => {
    const data = res.data.response?.avatar_frame || {}
    logger.info(`获取${steamid}的头像框信息成功，耗时${Date.now() - start}ms`)
    return data
  })
}

/**
 * 获取steamId的小型头像背景信息
 * @param {*} steamid
 * @returns {Promise<{
 *   communityitemid: string,
 *   image_large: string,
 *   name: string,
 *   item_title: string,
 *   item_description: string,
 *   appid: number,
 *   item_type: number,
 *   item_class: number,
 *   movie_webm: string,
 *   movie_mp4: string
 * }>}
 */
export async function GetMiniProfileBackground (steamid) {
  const start = Date.now()
  logger.info(`开始获取${steamid}的小型头像背景信息`)
  return utils.request.get('IPlayerService/GetMiniProfileBackground/v1', {
    params: {
      steamid
    }
  }).then(res => {
    const data = res.data.response?.profile_background || {}
    logger.info(`获取${steamid}的小型头像背景信息成功，耗时${Date.now() - start}ms`)
    return data
  })
}

/**
 * 获取steamId的背景信息
 * @param {string} steamid
 * @returns {Promise<{
 *   communityitemid: string,
 *   image_large: string,
 *   name: string,
 *   item_title: string,
 *   item_description: string,
 *   appid: number,
 *   item_type: number,
 *   item_class: number,
 * }}
 */
export async function GetProfileBackground (steamid) {
  const start = Date.now()
  logger.info(`开始获取${steamid}的背景信息`)
  return utils.request.get('IPlayerService/GetProfileBackground/v1', {
    params: {
      steamid
    }
  }).then(res => {
    const data = res.data.response?.profile_background || {}
    logger.info(`获取${steamid}的小型头像背景信息成功，耗时${Date.now() - start}ms`)
    return data
  })
}

/**
 * 获取steamId的背景,nimi背景,头像等信息
 * @param {string} steamid
 * @returns {Promise<{
*   profile_background: {
*     communityitemid: string,
*     image_large: string,
*     name: string,
*     item_title: string,
*     item_description: string,
*     appid: number,
*     item_type: number,
*     item_class: number,
*   },
*   mini_profile_background: {
*     communityitemid: string,
*     image_large: string,
*     name: string,
*     item_title: string,
*     item_description: string,
*     appid: number,
*     item_type: number,
*     item_class: number,
*     movie_webm: string,
*     movie_mp4: string
*   },
*   avatar_frame: {
*     communityitemid: string,
*     image_small: string,
*     image_large: string,
*     name: string,
*     item_title: string
*     item_description: string,
*     appid: number,
*     item_type: number,
*     item_class: number,
*   },
*   animated_avatar: {
*     communityitemid: string,
*     image_small: string,
*     image_large: string,
*     name: string,
*     item_title: string
*     item_description: string,
*     appid: number,
*     item_type: number,
*     item_class: number,
*   },
*   profile_modifier: {
*     communityitemid: string,
*     image_small: string,
*     image_large: string,
*     name: string,
*     item_title: string
*     item_description: string,
*     appid: number,
*     item_type: number,
*     item_class: number,
*     profile_colors: {
*       style_name: string,
*       color: string,
*     }[]
*   },
*   steam_deck_keyboard_skin: unknown
* }>}
*/
export async function GetProfileItemsEquipped (steamid) {
  const start = Date.now()
  logger.info(`开始获取${steamid}头像背景信息等`)
  return utils.request.get('IPlayerService/GetProfileItemsEquipped/v1', {
    params: {
      steamid
    }
  }).then(res => {
    const data = res.data.response || {}
    logger.info(`获取${steamid}头像背景信息等成功，耗时${Date.now() - start}ms`)
    return data
  })
}
