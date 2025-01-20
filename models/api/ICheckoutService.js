import { utils } from '#models'

/**
 * 添加免费游戏入库
 * @param {string} accessToken
 * @param {number} appid
 * @returns {Promise<{
 *  appids_added?: number[],
 *  packageids_added?: number[],
 *  purchase_result_detail?: number
 * }>}
 */
export async function AddFreeLicense (accessToken, appid) {
  const input = {
    item_id: {
      appid
    }
  }
  return utils.request.post('ICheckoutService/AddFreeLicense/v1', {
    params: {
      access_token: accessToken,
      input_json: JSON.stringify(input)
    }
  }).then(res => res.response)
}

/**
 * GetFriendOwnershipForGifting
 * @param {string} accessToken
 * @param {number[]} appids
 * @returns {Promise<{
 *  item_id: {
 *    appid: number
 *  }[],
 *  friend_ownership: {
 *    accountid: number,
 *    already_owns: boolean,
 *  }[]
 * }[]>}
 */
export async function GetFriendOwnershipForGifting (accessToken, appids) {
  !Array.isArray(appids) && (appids = [appids])
  const input = {
    item_ids: appids.map(appid => ({ appid }))
  }
  return utils.request.get('ICheckoutService/GetFriendOwnershipForGifting/v1', {
    params: {
      access_token: accessToken,
      input_json: JSON.stringify(input)
    }
  }).then(res => res.response?.ownership_info || [])
}

/**
 * 验证购物车
 * @param {string} accessToken
 * @returns {Promise<any>}
 */
export async function ValidateCart (accessToken, country = 'CN') {
  const input = {
    gidshoppingcart: '0',
    context: {
      language: 'schinese',
      elanguage: 0,
      country_code: country,
      steam_realm: 1
    },
    data_request: {
      include_assets: true,
      include_release: true,
      include_platforms: true,
      include_all_purchase_options: false,
      include_screenshots: false,
      include_trailers: false,
      include_ratings: false,
      include_tag_count: 0,
      include_reviews: false,
      include_basic_info: true,
      include_supported_languages: false,
      include_full_description: false,
      include_included_items: true,
      included_item_data_request: {
        include_assets: true,
        include_release: true,
        include_platforms: true,
        include_all_purchase_options: false,
        include_screenshots: false,
        include_trailers: false,
        include_ratings: false,
        include_tag_count: 0,
        include_reviews: false,
        include_basic_info: true,
        include_supported_languages: false,
        include_full_description: false,
        include_included_items: false,
        included_item_data_request: null,
        include_assets_without_overrides: false,
        apply_user_filters: false,
        include_links: false
      },
      include_assets_without_overrides: false,
      apply_user_filters: false,
      include_links: false
    },
    gift_info: null,
    gidreplayoftransid: '0',
    for_init_purchase: false
  }
  return utils.request.get('ICheckoutService/ValidateCart/v1', {
    params: {
      access_token: accessToken,
      input_json: JSON.stringify(input)
    }
  }).then(res => res.response)
}
