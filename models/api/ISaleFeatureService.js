// 如果页面可见性为私密则获取不到

import { utils } from '#models'
import _ from 'lodash'

/**
 * 获得好友年度统计可见性
 * @param {string} accessToken
 * @param {string} steamid
 * @param {number} year
 * @returns {Promise<{
 *   steamid: string
 *   privacy_state: number
 *   rt_privacy_updated: number
 *   privacy_override: boolean
 * }[]>}
 */
export async function GetFriendsSharedYearInReview (accessToken, steamid, year = new Date().getFullYear()) {
  return utils.request.get('ISaleFeatureService/GetFriendsSharedYearInReview/v1', {
    params: {
      access_token: accessToken,
      steamid,
      year
    }
  }).then(res => res.response?.friend_shares || [])
}

/**
 * 获得好友年度统计可见性
 * @param {string} accessToken
 * @param {string} steamid
 * @param {number} year
 * @returns {Promise<{
 *   privacy_state: number
 *   generated_value: boolean
 *   steamid: string
 *   rt_privacy_updated: number
 * }|undefined>}
 */
export async function GetUserSharingPermissions (accessToken, steamid, year = new Date().getFullYear()) {
  return utils.request.post('ISaleFeatureService/GetUserSharingPermissions/v1', {
    params: {
      access_token: accessToken,
      steamid,
      year
    }
  }).then(res => _.isEmpty(res.response) ? undefined : res.response)
}

/**
 * 获取steamId在指定年份的指定游戏的年度成就信息
 * @param {string} steamid
 * @param {string[]} appids
 * @param {number?} year
 * @returns {Promise<{
 *   game_achievements: {
 *     appid: number,
 *     achievements: {
 *       statid: number,
 *       fieldid: number,
 *       achievement_name_internal: string,
 *     }[]
 *     all_time_unlocked_achievements: number,
 *     unlocked_more_in_future: boolean,
 *   }
 *   total_achievements: number,
 *   total_rare_achievements: number,
 *   total_games_with_achievements: number
 * }>}
 */
export async function GetUserYearAchievements (steamid, appids, year = new Date().getFullYear()) {
  !Array.isArray(appids) && (appids = [appids])
  const input = {
    steamid,
    appids,
    year
  }
  return await utils.request.get('ISaleFeatureService/GetUserYearAchievements/v1', {
    params: {
      input_json: JSON.stringify(input)
    }
  })
}

/**
 * @typedef {Object} stats
 * @property {number} total_sessions
 * @property {number} vr_sessions
 * @property {number} deck_sessions
 * @property {number} controller_sessions
 * @property {number} linux_sessions
 * @property {number} macos_sessions
 * @property {number} windows_sessions
 * @property {number} total_playtime_percentagex100
 * @property {number} vr_playtime_percentagex100
 * @property {number} deck_playtime_percentagex100
 * @property {number} controller_playtime_percentagex100
 * @property {number} linux_playtime_percentagex100
 * @property {number} macos_playtime_percentagex100
 * @property {number} windows_playtime_percentagex100
 */

/**
 * @typedef {Object} ranking
 * @property {number} appid
 * @property {number} rank
 * @property {number} relative_playtime_percentagex100
 */

/**
 * 获取用户年度统计信息
 * @param {string} steamid
 * @param {number?} year
 * @returns {Promise<{
 *   stats: {
 *     account_id: number,
 *     year: number,
 *     playtime_stats: {
 *       total_stats: stats,
 *       games: {
 *         appid: number,
 *         stats: stats,
 *         playtime_ranks: {
 *           overall_rank: number,
 *           windows_rank: number,
 *         }
 *         rtime_first_played: number
 *         relative_game_stats: stats
 *       }[],
 *       months: {
 *         rtime_month: number,
 *         stats: stats,
 *         appid: {
 *           appid: number,
 *           stats: stats,
 *           rtime_first_played: number,
 *           relative_game_stats: stats
 *         }[],
 *       }[],
 *       game_summary: {
 *         appid: number,
 *         new_this_year: boolean,
 *         rtime_first_played_lifetime: number,
 *         demo: boolean,
 *         playtest: boolean,
 *         played_vr: boolean,
 *         played_deck: boolean,
 *         played_controller: boolean,
 *         played_linux: boolean,
 *         played_mac: boolean,
 *         played_windows: boolean,
 *         total_playtime_percentagex100: number,
 *         total_sessions: number,
 *         rtime_release_date: number,
 *       }[],
 *       demos_played: number,
 *       game_rankings: {
 *         overall_ranking: 'overall',
 *         rankings?: ranking[],
 *         vr_ranking: {
 *           category: 'vr',
 *           rankings?: ranking[],
 *         },
 *         deck_ranking: {
 *           category: 'deck',
 *           rankings?: ranking[],
 *         },
 *         controller_ranking: {
 *           category: 'controller',
 *           rankings?: ranking[],
 *         },
 *         linux_ranking: {
 *           category: 'linux',
 *           rankings?: ranking[],
 *         },
 *         mac_ranking: {
 *           category: 'mac',
 *           rankings?: ranking[],
 *         },
 *         windows_ranking: {
 *           category: 'windows',
 *           rankings?: ranking[],
 *         },
 *       },
 *       playtests_played: number,
 *       summary_stats: {
 *         total_achievements: number,
 *         total_games_with_achievements: number,
 *         total_rare_achievements: number,
 *       },
 *       substantial: boolean,
 *       tag_stats: {
 *         stats: {
 *           tag_id: number,
 *           tag_weight: number,
 *           tag_weight_pre_selection: number,
 *         }[]
 *       },
 *       by_numbers: {
 *         screenshots_shared: number,
 *         gifts_sent: number,
 *         loyalty_reactions: number,
 *         written_reviews: number,
 *         guides_submitted: number,
 *         workshop_contributions: number,
 *         badges_earned: number,
 *         friends_added: number,
 *         forum_posts: number,
 *         workshop_subscriptions: number,
 *         guide_subscribers: number,
 *         workshop_subscribers: number,
 *         games_played_pct: number,
 *         achievements_pct: number,
 *         games_played_avg: number,
 *         achievements_avg: number,
 *         game_streak_avg: number,
 *       }
 *     },
 *     privacy_state: number,
 *   },
 *   performance_stats: {
 *     from_dbo: boolean,
 *     overall_time_ms: string,
 *     dbo_load_ms: string,
 *     message_population_ms: string,
 *     dbo_lock_load_ms: string,
 *   },
 *   distribution: {
 *     new_releases: number,
 *     recent_releases: number,
 *     classic_releases: number,
 *     recent_cutoff_year: number,
 *   }
 * }>}
 */
export async function GetUserYearInReview (steamid, year = new Date().getFullYear()) {
  return utils.request.get('ISaleFeatureService/GetUserYearInReview/v1', {
    params: {
      steamid,
      year
    }
  }).then(res => res.response)
}

/**
 * 获取steamId在指定年份的年度回顾图片链接
 * replayxxxx/xxxx.png
 * @param {string} steamid
 * @param {number?} year
 * @returns {Promise<{
*   name: string,
*   url_path: string,
* }[]>}
*/
export async function GetUserYearInReviewShareImage (steamid, year = new Date().getFullYear()) {
  return utils.request.get('ISaleFeatureService/GetUserYearInReviewShareImage/v1', {
    params: {
      steamid,
      year
    }
  }).then(res => res.response?.images || [])
}

/**
 * 获取steamId在指定年份的年度游戏截图
 * @param {string} steamid
 * @param {string[]} appids
 * @param {number?} year
 * @returns {Promise<unknown>}
*/
export async function GetUserYearScreenshots (steamid, appids, year = new Date().getFullYear()) {
  !Array.isArray(appids) && (appids = [appids])
  const input = {
    steamid,
    appids,
    year
  }
  return await utils.request.get('ISaleFeatureService/GetUserYearScreenshots/v1', {
    params: {
      input_json: JSON.stringify(input)
    }
  }).then(res => res.response.apps)
}

/**
 * 获得好友年度统计可见性
 * @param {string} accessToken
 * @param {string} steamid
 * @param {1|2|3} privacyState 1:私密, 2:好友可见, 3:公开
 * @param {number} year
 * @returns {Promise<unknown>}
*/
export async function SetUserSharingPermissions (accessToken, steamid, privacyState, year = new Date().getFullYear()) {
  return utils.request.post('ISaleFeatureService/SetUserSharingPermissions/v1', {
    params: {
      access_token: accessToken,
      steamid,
      year,
      privacy_state: privacyState
    }
  })
}
