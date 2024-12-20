import { utils } from '#models'

/**
 * 查询热销排行
 * @returns {Promise<{
 *   appid: number,
 *   name: string,
 *   is_free: boolean,
 *   best_purchase_option?: {
 *     formatted_final_price: string,
 *     formatted_original_price: string,
 *     discount_pct?: number,
 *   }
 * }[]>}
 */
export async function Query () {
  const input = {
    query_name: 'SteamCharts Live Top Sellers',
    context: {
      language: 'schinese',
      elanguage: 0,
      country_code: 'CN',
      steam_realm: 1
    },
    query: {
      start: 0,
      count: 100,
      sort: 10,
      filters: {
        type_filters: {
          include_apps: true
        }
      }
    },
    data_request: {
      include_basic_info: true
    },
    overrideCountryCode: 'CN'
  }
  return utils.request.get('IStoreQueryService/Query/v1', {
    params: {
      input_json: JSON.stringify(input)
    }
  }).then(res => res.response.store_items || [])
}
