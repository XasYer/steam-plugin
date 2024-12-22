import { utils } from '#models'
import _ from 'lodash'

/**
 * 添加免费游戏入库
 * @param {string} accessToken
 * @param {{
 *   appid?: number,
 *   packageid?: number,
 *   bundleid?: number,
 *   tagid?: number,
 *   creatorid?: number,
 *   hubcategoryid?: number,
 * }} item
 * @returns {Promise<{
 *  appids_added: number[],
 *  packageids_added: number[],
 *  purchase_result_detail: number
 * }>}
 */
export async function AddFreeLicense (accessToken, item = {}) {
  if (_.isEmpty(item) || _.isEmpty(accessToken)) {
    return false
  }
  const input = {
    item_id: item
  }
  return utils.request.post('ICheckoutService/AddFreeLicense/v1', {
    params: {
      access_token: accessToken,
      input_json: JSON.stringify(input),
      key: undefined
    }
  }).then(res => res.response)
}
