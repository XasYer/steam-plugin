import { utils } from '#models'

/**
 * GetBestOfYearPages
 * @returns {Promise<{
 *   name: string,
 *   url_path: string,
 *   banner_url: string[]
 * }[]>}
 */
export async function GetBestOfYearPages () {
  return utils.request.get('ISteamChartsService/GetBestOfYearPages/v1')
    .then(res => res.response.pages)
}

/**
 * 获取steam当前热玩排行榜
 * @returns {Promise<{
 *   last_update: number,
 *   ranks: {
 *     rank: number,
 *     appid: number,
 *     concurrent_in_game: number,
 *     peak_in_game: number,
 *     item: {
 *       name: string,
 *       is_free: boolean,
 *       best_purchase_option?: {
 *         formatted_final_price: string,
 *         formatted_original_price: string,
 *         discount_pct?: number,
 *       }
 *     }
 *   }[]
 * }>}
 */
export async function GetGamesByConcurrentPlayers () {
  const input = {
    country_code: 'CN',
    context: {
      language: 'schinese',
      country_code: 'CN'
    },
    data_request: {
      include_basic_info: true
    }
  }
  return utils.request.get('ISteamChartsService/GetGamesByConcurrentPlayers/v1', {
    params: {
      input_json: JSON.stringify(input)
    }
  }).then(res => res.response)
}

/**
 * 获取steam每日热玩排行榜
 * @returns {Promise<{
 *   rollup_date: number,
 *   ranks: {
 *     rank: number,
 *     appid: number,
 *     last_week_rank: number,
 *     peak_in_game: number,
 *     item: {
 *       name: string,
 *       is_free: boolean,
 *       best_purchase_option?: {
 *         formatted_final_price: string,
 *         formatted_original_price: string,
 *         discount_pct?: number,
 *       }
 *     }
 *   }[]
 * }>}
 */
export async function GetMostPlayedGames () {
  const input = {
    context: {
      language: 'schinese',
      country_code: 'CN'
    },
    data_request: {
      include_basic_info: true
    }
  }
  return utils.request.get('ISteamChartsService/GetMostPlayedGames/v1', {
    params: {
      input_json: JSON.stringify(input)
    }
  }).then(res => res.response)
}

/**
 * 获取steam最热新品 (按月统计)
 * @returns {Promise<{
 *   name: string,
 *   start_of_month: number,
 *   url_path: string,
 *   item_ids: {
 *     appid: number,
 *   }[]
 * }[]>}
 */
export async function GetTopReleasesPages () {
  return utils.request.get('ISteamChartsService/GetTopReleasesPages/v1')
    .then(res => res.response.pages)
}
