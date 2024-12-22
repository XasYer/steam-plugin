import { utils } from '#models'

/**
 * GetCountryList
 * @returns {Promise<{
 *   country_code: string,
 *   name: string,
 * }[]>}
 */
export async function GetCountryList () {
  return utils.request.get('IStoreTopSellersService/GetCountryList/v1')
    .then(res => res.response.countries)
}

/**
 * 获取每周热销榜
 * @param {number?} startDate 开始日期
 * @returns {Promise<{
*   start_date: number,
*   ranks: {
*     rank: number,
*     appid: number,
*     last_week_rank: number,
*     consecutive_weeks: number,
*     item: {
*       name: string,
*       appid: number,
*       is_free: boolean,
*       best_purchase_option?: {
*         formatted_final_price: string,
*         formatted_original_price: string,
*         discount_pct?: number,
*       }
*     },
*     first_top100?: boolean,
*     consecutive_weeks: number,
*     last_week_rank?: number,
*   }[]
 * }>}
 */
export async function GetWeeklyTopSellers (startDate) {
  const input = {
    country_code: 'CN',
    page_count: 100,
    context: {
      language: 'schinese',
      country_code: 'CN'
    },
    data_request: {
      include_basic_info: true
    }
  }
  return utils.request.get('IStoreTopSellersService/GetWeeklyTopSellers/v1', {
    params: {
      input_json: JSON.stringify(input),
      start_date: startDate
    }
  }).then(res => res.response)
}
