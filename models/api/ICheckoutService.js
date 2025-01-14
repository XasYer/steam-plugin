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
