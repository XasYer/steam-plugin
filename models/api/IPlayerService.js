import { utils } from '#models'

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
  return utils.request.get('IPlayerService/GetRecentlyPlayedGames/v1', {
    params: {
      steamid
    }
  }).then(res => res.response?.games || [])
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
  return utils.request.get('IPlayerService/GetOwnedGames/v1', {
    params: {
      steamid,
      include_appinfo: true,
      include_extended_appinfo: true
    }
  }).then(res => res.response?.games || [])
}

/**
 * 获取steamId的Steam等级
 * @param {string} steamid
 * @returns {Promise<number>}
 */
export async function GetSteamLevel (steamid) {
  return utils.request.get('IPlayerService/GetSteamLevel/v1', {
    params: {
      steamid
    }
  }).then(res => res.response?.player_level)
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
  return utils.request.get('IPlayerService/GetBadges/v1', {
    params: {
      steamid
    }
  }).then(res => res.response || {})
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
  return utils.request.get('IPlayerService/GetCommunityBadgeProgress/v1', {
    params: {
      steamid,
      badgeid
    }
  }).then(res => res.response?.quests || [])
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
  return utils.request.get('IPlayerService/GetFavoriteBadge/v1', {
    params: {
      steamid
    }
  }).then(res => res.response)
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
  return utils.request.get('IPlayerService/GetGameAchievements/v1', {
    params: {
      appid
    }
  }).then(res => res.response.achievements || [])
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
  return utils.request.get('IPlayerService/GetPlayerLinkDetails/v1', {
    params
  }).then(res => res.response.accounts)
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
  return utils.request.get('IPlayerService/GetAnimatedAvatar/v1', {
    params: {
      steamid
    }
  }).then(res => res.response?.avatar || {})
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
  return utils.request.get('IPlayerService/GetProfileCustomization/v1', {
    params: {
      steamid
    }
  }).then(res => res.response)
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
  return utils.request.get('IPlayerService/GetAvatarFrame/v1', {
    params: {
      steamid
    }
  }).then(res => res.response?.avatar_frame || {})
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
  return utils.request.get('IPlayerService/GetMiniProfileBackground/v1', {
    params: {
      steamid
    }
  }).then(res => res.response?.profile_background || {})
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
 * }>}
 */
export async function GetProfileBackground (steamid) {
  return utils.request.get('IPlayerService/GetProfileBackground/v1', {
    params: {
      steamid
    }
  }).then(res => res.response?.profile_background || {})
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
  return utils.request.get('IPlayerService/GetProfileItemsEquipped/v1', {
    params: {
      steamid
    }
  }).then(res => res.response || {})
}
