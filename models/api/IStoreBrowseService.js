import { utils } from '#models'
import { logger } from '#lib'

/**
 * 获取多个appid的游戏信息
 * @param {string[]} appids
 * @returns {Promise<{
 *   [appid: string] : {
 *     item_type: number,
 *     id: number,
 *     success: boolean,
 *     visible: boolean,
 *     name: string,
 *     store_url_path: string,
 *     appid: number,
 *     type: number,
 *     is_free?: boolean,
 *     categories: {
 *       supported_player_categoryids: number[],
 *       feature_categoryids: number[],
 *       controller_categoryids: number[],
 *     }
 *     best_purchase_option?: {
 *       packageid: number,
 *       purchase_option_name: string,
 *       final_price_in_cents: string,
 *       original_price_in_cents: string,
 *       formatted_final_price: string,
 *       formatted_original_price: string,
 *       discount_pct: number,
 *       active_discounts: {
 *         discount_amount: string,
 *         discount_description: string,
 *         discount_end_date: number
 *       },
 *       user_can_purchase_as_gift: boolean,
 *       hide_discount_pct_for_compliance: boolean,
 *       included_game_count: number,
 *     }
 *   }
 * }>}
 */
export async function GetItems (appids) {
  const data = {
    ids: appids.map(appid => ({ appid })),
    context: {
      language: 'schinese',
      country_code: 'CN'
    }
  }
  const start = Date.now()
  logger.info(`开始获取${appids.length}个游戏信息`)
  return utils.request.get('IStoreBrowseService/GetItems/v1', {
    params: {
      input_json: JSON.stringify(data)
    }
  }).then(res => {
    const data = res.data.response.store_items || []
    logger.info(`获取${appids.length}游戏信息成功，耗时${Date.now() - start}ms`)
    return data.reduce((acc, cur) => (acc[cur.appid] = cur) && acc, {})
  })
}
