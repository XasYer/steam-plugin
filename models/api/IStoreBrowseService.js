import { utils } from '#models'
import { logger } from '#lib'

/**
 * 也是获取游戏信息?
 * @param {string} appid
 * @returns {Promise<{
 *   item_type: number,
 *   id: number,
 *   success: boolean,
 *   visible: boolean,
 *   name: string,
 *   store_url_path: string,
 *   appid: number,
 *   type: number,
 *   categories: {
 *     supported_player_categoryids: number[],
 *     feature_categoryids: number[],
 *     controller_categoryids: number[],
 *   }
 *   best_purchase_option: {
 *     packageid: number,
 *     purchase_option_name: string,
 *     final_price_in_cents: string,
 *     formatted_final_price: string,
 *     user_can_purchase_as_gift: boolean,
 *     hide_discount_pct_for_compliance: boolean,
 *     included_game_count: number,
 *   }
 * }>}
 */
export async function GetItems (appid) {
  const data = {
    ids: [{ appid }],
    context: {
      language: 'schinese',
      country_code: 'CN'
    }
  }
  const start = Date.now()
  logger.info(`开始获取${appid}游戏信息`)
  return utils.request.get('IStoreBrowseService/GetItems/v1', {
    params: {
      input_json: JSON.stringify(data)
    }
  }).then(res => {
    const data = res.data.response.store_items?.[0] || {}
    logger.info(`获取${appid}游戏信息成功: ${data.name}，耗时${Date.now() - start}ms`)
    return data
  })
}
