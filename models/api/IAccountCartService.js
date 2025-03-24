import { utils } from '#models'

/**
 * 添加游戏到购物车
 * @param {string} accessToken
 * @param {number|{packageid?: number,bundleid?: number}} packageid
 * @param {string} country 用户地区代码
 * @returns {Promise<{
 *  line_item_ids: string[]
 *  cart: {
 *    line_items: {
 *      line_item_id: string
 *      type: number
 *      packageid: number
 *      is_valid: boolean
 *      time_added: number
 *      price_when_added: {
 *        amount_in_cents: string
 *        currency_code: number
 *        formatted_amount: string
 *      }
 *      flags: {
 *        is_gift: boolean
 *        is_private: boolean
 *      }
 *    }[]
 *    subtotal: {
 *      amount_in_cents: string
 *      currency_code: number
 *      formatted_amount: string
 *    }
 *    is_valid: boolean
 *  }
 * }>}
 */
export async function AddItemsToCart (accessToken, packageid, country = 'CN') {
  const input = {
    items: [typeof packageid !== 'object' ? { packageid } : packageid],
    user_country: country,
    navdata: {
      domain: 'store.steampowered.com',
      controller: 'search',
      method: 'search',
      submethod: 'query',
      feature: '',
      depth: 0,
      countrycode: country,
      is_client: false,
      curator_data: {},
      is_likely_bot: false,
      is_utm: false
    }
  }
  return utils.request.post('IAccountCartService/AddItemsToCart/v1', {
    params: {
      access_token: accessToken,
      input_json: JSON.stringify(input)
    }
  }).then(res => res.response)
}

/**
 * 清空购物车
 * @param {string} accessToken
 * @returns {Promise<undefined>}
 */
export async function DeleteCart (accessToken) {
  return utils.request.post('IAccountCartService/DeleteCart/v1', {
    params: {
      access_token: accessToken
    }
  }).then(res => undefined)
}

/**
 * 查看购物车
 * @param {string} accessToken
 * @param {string} country 用户地区代码
 * @returns {Promise<{
 *   line_items?: {
 *     line_item_id: string
 *     type: number
 *     packageid?: number
 *     bundleid?: number
 *     is_valid: boolean
 *     time_added: number
 *     price_when_added: {
 *       amount_in_cents: string
 *       currency_code: number
 *       formatted_amount: string
 *     }
 *     flags: {
 *       is_gift: boolean
 *       is_private: boolean
 *     }
 *   }[]
 *   subtotal: {
 *     amount_in_cents: string
 *     currency_code: number
 *     formatted_amount: string
 *   }
 *   is_valid: boolean
 * }>}
 */
export async function GetCart (accessToken, country = 'CN') {
  return utils.request.get('IAccountCartService/GetCart/v1', {
    params: {
      access_token: accessToken,
      user_country: country
    }
  }).then(res => res.response.cart)
}

/**
 * 删除购物车某一项
 * @param {string} accessToken
 * @param {string} lineItemId
 * @param {string} country 用户地区代码
 * @returns {Promise<{
 *   line_items: {
 *     line_item_id: string
 *     type: number
 *     packageid?: number
 *     bundleid?: number
 *     is_valid: boolean
 *     time_added: number
 *     price_when_added: {
 *       amount_in_cents: string
 *       currency_code: number
 *       formatted_amount: string
 *     }
 *     flags: {
 *       is_gift: boolean
 *       is_private: boolean
 *     }
 *   }[]
 *   subtotal: {
 *     amount_in_cents: string
 *     currency_code: number
 *     formatted_amount: string
 *   }
 *   is_valid: boolean
 * }>}
 */
export async function RemoveItemFromCart (accessToken, lineItemId, country = 'CN') {
  return utils.request.post('IAccountCartService/RemoveItemFromCart/v1', {
    params: {
      access_token: accessToken,
      line_item_id: lineItemId,
      user_country: country
    }
  }).then(res => res.response.cart)
}
