import { utils } from '#models'

/**
 * 添加好友
 * @param {string} accessToken
 * @param {string} steamid
 * @returns {Promise<unknown>}
*/
export async function AddFriend (accessToken, steamid) {
  return utils.request.post('IPlayerService/AddFriend/v1', {
    params: {
      access_token: accessToken,
      steamid
    }
  })
}

/**
 * 获取所有玩过的游戏, 包括家庭共享等
 * @param {string} accessToken
 * @param {number?} minLastPlayed
 * @returns {Promise<{
 *   appid: number
 *   last_playtime: number
 *   playtime_2weeks: number
 *   playtime_forever: number
 *   first_playtime: number
 *   playtime_windows_forever: number
 *   playtime_mac_forever: number
 *   playtime_linux_forever: number
 *   playtime_deck_forever: number
 *   first_windows_playtime: number
 *   first_mac_playtime: number
 *   first_linux_playtime: number
 *   first_deck_playtime: number
 *   last_windows_playtime: number
 *   last_mac_playtime: number
 *   last_linux_playtime: number
 *   last_deck_playtime: number
 *   playtime_disconnected: number
 * }[]>}
*/
export async function ClientGetLastPlayedTimes (accessToken, minLastPlayed = 0) {
  return utils.request.get('IPlayerService/ClientGetLastPlayedTimes/v1', {
    params: {
      access_token: accessToken,
      min_last_played: minLastPlayed
    }
  }).then(res => res.response?.games || [])
}

/**
 * 获取指定应用程序列表的成就完成统计信息。
 * @param {string} accessToken
 * @param {number?} minLastPlayed
 * @returns {Promise<{
 *   appid: number
 *   unlocked: number
 *   total: number
 *   percentage: number
 *   all_unlocked: boolean
 *   cache_time: number
 *   vetted: boolean
 * }[]>}
*/
export async function GetAchievementsProgress (accessToken, steamid, appids) {
  !Array.isArray(appids) && (appids = [appids])
  const input = {
    language: 'schinese',
    steamid,
    appids
  }
  return await utils.request.post('IPlayerService/GetAchievementsProgress/v1', {
    params: {
      access_token: accessToken,
      input_json: JSON.stringify(input)
    }
  }).then(res => res.response?.achievement_progress || [])
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
 * 返回玩家的社区偏好
 * @param {string} accessToken
 * @returns {Promise<{
 *   preferences: {
 *     parenthesize_nicknames: boolean
 *     text_filter_setting: number
 *     text_filter_ignore_friends: boolean
 *     text_filter_words_revision: number
 *     timestamp_updated: number
 *   },
 *   content_descriptor_preferences: {
 *     content_descriptors_to_exclude: {
 *       content_descriptorid: number
 *     }[]
 *   }
 * }>}
 */
export async function GetCommunityPreferences (accessToken) {
  return utils.request.post('IPlayerService/GetCommunityPreferences/v1', {
    params: {
      access_token: accessToken
    }
  }).then(res => res.response)
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
 * 获取正在玩游戏、曾经玩过游戏、拥有游戏或想要玩游戏的好友列表
 * @param {string} accessToken
 * @param {string} appid
 * @returns {Promise<{
 *   your_info: {
 *     steamid: string,
 *     minutes_played_forever: number,
 *     owned: boolean
 *   },
 *   played_ever: {
 *     steamid: string,
 *     minutes_played_forever: number,
 *   }[],
 *   owns: {
 *     steamid: string,
 *   }[]
 * }>}
 */
export async function GetFriendsGameplayInfo (accessToken, appid) {
  return utils.request.get('IPlayerService/GetFriendsGameplayInfo/v1', {
    params: {
      access_token: accessToken,
      appid
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
 * 获得备注的好友信息
 * @param {string} accessToken
 * @returns {Promise<{
*   accountid: number,
*   nickname: string,
* }[]>}
*/
export async function GetNicknameList (accessToken) {
  return utils.request.get('IPlayerService/GetNicknameList/v1', {
    params: {
      access_token: accessToken
    }
  }).then(res => res.response?.nicknames || [])
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
      include_extended_appinfo: true,
      include_played_free_games: true
    }
  }).then(res => res.response?.games || [])
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
  const input = {
    steamids
  }
  return utils.request.get('IPlayerService/GetPlayerLinkDetails/v1', {
    params: {
      input_json: JSON.stringify(input)
    }
  }).then(res => res.response.accounts)
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

/**
 * 获得拥有的背景,nimi背景,头像等信息
 * @param {string} accessToken
 * @returns {Promise<{
 *   profile_background?: {
 *     communityitemid: string,
 *     image_large: string,
 *     name: string,
 *     item_title: string,
 *     item_description: string,
 *     appid: number,
 *     item_type: number,
 *     item_class: number,
 *   }[],
 *   mini_profile_background?: {
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
 *   }[],
 *   avatar_frame?: {
 *     communityitemid: string,
 *     image_small: string,
 *     image_large: string,
 *     name: string,
 *     item_title: string
 *     item_description: string,
 *     appid: number,
 *     item_type: number,
 *     item_class: number,
 *   }[],
 *   animated_avatar?: {
 *     communityitemid: string,
 *     image_small: string,
 *     image_large: string,
 *     name: string,
 *     item_title: string
 *     item_description: string,
 *     appid: number,
 *     item_type: number,
 *     item_class: number,
 *   }[],
 * }>}
 */
export async function GetProfileItemsOwned (accessToken) {
  return utils.request.get('IPlayerService/GetProfileItemsOwned/v1', {
    params: {
      access_token: accessToken
    }
  }).then(res => res.response || {})
}

/**
 * 获取用户可用的主题。
 * @param {string} accessToken
 * @returns {Promise<{
 *   theme_id: string,
 *   title: string,
 * }[]>}
 */
export async function GetProfileThemesAvailable (accessToken) {
  return utils.request.get('IPlayerService/GetProfileThemesAvailable/v1', {
    params: {
      access_token: accessToken
    }
  }).then(res => res.response?.profile_themes || [])
}

/**
 * 返回购买和升级的配置文件自定义
 * @param {string} steamid
 * @returns {Promise<unknown>}
 */
export async function GetPurchasedAndUpgradedProfileCustomizations (steamid) {
  return utils.request.get('IPlayerService/GetPurchasedAndUpgradedProfileCustomizations/v1', {
    params: {
      steamid
    }
  })
}

/**
 * 返回购买的配置文件自定义
 * @param {string} steamid
 * @returns {Promise<unknown>}
 */
export async function GetPurchasedProfileCustomizations (steamid) {
  return utils.request.get('IPlayerService/GetPurchasedProfileCustomizations/v1', {
    params: {
      steamid
    }
  })
}

/**
 * 获得最近的游戏时间
 * @param {string} accessToken
 * @param {string} steamid
 * @returns {Promise<{
 *   time_start: number
 *   time_end: number
 *   appid: number
 *   device_type: number
 *   disconnected: boolean
 * }[]>}
 */
export async function GetRecentPlaytimeSessionsForChild (accessToken, steamid) {
  return utils.request.get('IPlayerService/GetRecentPlaytimeSessionsForChild/v1', {
    params: {
      access_token: accessToken,
      steamid
    }
  }).then(res => res.response?.sessions || [])
}

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
 * Gets which Steam Deck keyboard skin is active for a specific user
 * @param {string} steamid
 * @returns {Promise<unknown>}
 */
export async function GetSteamDeckKeyboardSkin (steamid) {
  return utils.request.get('IPlayerService/GetSteamDeckKeyboardSkin/v1', {
    params: {
      steamid
    }
  })
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
 * 返回给定Steam级别与广大用户基础的比较
 * @param {number} playerLevel
 * @returns {Promise<number>}
 */
export async function GetSteamLevelDistribution (playerLevel) {
  return utils.request.get('IPlayerService/GetSteamLevelDistribution/v1', {
    params: {
      player_level: playerLevel
    }
  }).then(res => res.response?.player_level_percentile)
}

/**
 * 获取用户在指定应用列表中获得的最佳成就。
 * @param {string} steamid
 * @param {number[]} appids
 * @param {number} maxAchievements
 * @returns {Promise<{
 *   appid: number,
 *   total_achievements: number,
 * }>}
 */
export async function GetTopAchievementsForGames (steamid, appids, maxAchievements = 8) {
  !Array.isArray(appids) && (appids = [appids])
  const input = {
    language: 'schinese',
    steamid,
    appids,
    max_achievements: maxAchievements
  }
  return await utils.request.post('IPlayerService/GetTopAchievementsForGames/v1', {
    params: {
      input_json: JSON.stringify(input)
    }
  }).then(res => res.response?.games || [])
}

/**
 * Blocks or unblocks communication with the user. Despite name, can be a non-friend.
 * @param {string} accessToken
 * @param {string} steamid
 * @param {boolean} unignore If set, remove from ignore/block list instead of adding
 * @returns {Promise<unknown>}
 */
export async function IgnoreFriend (accessToken, steamid, unignore = false) {
  return utils.request.post('IPlayerService/IgnoreFriend/v1', {
    params: {
      access_token: accessToken,
      steamid,
      unignore
    }
  })
}

/**
 * 删除好友或忽略好友建议
 * @param {string} accessToken
 * @param {string} steamid
 * @returns {Promise<unknown>}
 */
export async function RemoveFriend (accessToken, steamid) {
  return utils.request.post('IPlayerService/RemoveFriend/v1', {
    params: {
      access_token: accessToken,
      steamid
    }
  })
}

/**
 * 为用户的个人资料设置动画头像
 * @param {string} accessToken
 * @param {number} communityitemid
 * @returns {Promise<unknown>}
 */
export async function SetAnimatedAvatar (accessToken, communityitemid) {
  return utils.request.post('IPlayerService/SetAnimatedAvatar/v1', {
    params: {
      access_token: accessToken,
      communityitemid
    }
  })
}

/**
 * 为用户的个人资料的头像框
 * @param {string} accessToken
 * @param {number} communityitemid
 * @returns {Promise<unknown>}
 */
export async function SetAvatarFrame (accessToken, communityitemid) {
  return utils.request.post('IPlayerService/SetAvatarFrame/v1', {
    params: {
      access_token: accessToken,
      communityitemid
    }
  })
}

/**
 * Sets special flags on the equipped item
 * @param {string} accessToken
 * @param {number} communityitemid
 * @param {number} flags Set of EProfileItemEquippedFlag
 * @returns {Promise<unknown>}
 */
export async function SetEquippedProfileItemFlags (accessToken, communityitemid, flags) {
  return utils.request.post('IPlayerService/SetEquippedProfileItemFlags/v1', {
    params: {
      access_token: accessToken,
      communityitemid,
      flags
    }
  })
}

/**
 * 将徽章设置为用户收藏
 * @param {string} accessToken
 * @param {number} communityitemid
 * @param {number} badgeid
 * @returns {Promise<unknown>}
 */
export async function SetFavoriteBadge (accessToken, communityitemid, badgeid) {
  return utils.request.post('IPlayerService/SetFavoriteBadge/v1', {
    params: {
      access_token: accessToken,
      communityitemid,
      badgeid
    }
  })
}

/**
 * 设置用户的迷你背景
 * @param {string} accessToken
 * @param {number} communityitemid
 * @returns {Promise<unknown>}
 */
export async function SetMiniProfileBackground (accessToken, communityitemid) {
  return utils.request.post('IPlayerService/SetMiniProfileBackground/v1', {
    params: {
      access_token: accessToken,
      communityitemid
    }
  })
}

/**
 * 设置用户的资料背景
 * @param {string} accessToken
 * @param {number} communityitemid
 * @returns {Promise<unknown>}
 */
export async function SetProfileBackground (accessToken, communityitemid) {
  return utils.request.post('IPlayerService/SetProfileBackground/v1', {
    params: {
      access_token: accessToken,
      communityitemid
    }
  })
}

/**
 * 设置配置文件首选项
 * @param {string} accessToken
 * @param {boolean} hideProfileAwards
 * @returns {Promise<unknown>}
 */
export async function SetProfilePreferences (accessToken, hideProfileAwards) {
  return utils.request.post('IPlayerService/SetProfilePreferences/v1', {
    params: {
      access_token: accessToken,
      input_json: JSON.stringify({
        profile_preferences: {
          hide_profile_awards: hideProfileAwards
        }
      })
    }
  })
}

/**
 * Selects a theme for the profile
 * @param {string} accessToken
 * @param {string} theme_id
 * @returns {Promise<unknown>}
 */
export async function SetProfileTheme (accessToken, themeId) {
  return utils.request.post('IPlayerService/SetProfileTheme/v1', {
    params: {
      access_token: accessToken,
      theme_id: themeId
    }
  })
}

/**
 * Selects a theme for the profile
 * @param {string} accessToken
 * @param {number} communityitemid
 * @returns {Promise<unknown>}
 */
export async function SetSteamDeckKeyboardSkin (accessToken, communityitemid) {
  return utils.request.post('IPlayerService/SetSteamDeckKeyboardSkin/v1', {
    params: {
      access_token: accessToken,
      communityitemid
    }
  })
}
