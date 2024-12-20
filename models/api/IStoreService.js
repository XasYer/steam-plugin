import { utils } from '#models'
import _ from 'lodash'

/**
 * 获得tag列表
 * @returns {Promise<{
 *   version_hash: string,
 *   tags: {
 *     tagid: number,
 *     name: string,
 *   }
 * }>}
 */
export async function GetTagList () {
  return utils.request.get('IStoreService/GetTagList/v1')
    .then(res => res.response)
}

/**
 * Get all whitelisted tags, with localized names.
 * @returns {Promise<{
 *   tagid: number,
 *   name: string,
 * }[]>}
 */
export async function GetMostPopularTags () {
  return utils.request.get('IStoreService/GetMostPopularTags/v1')
    .then(res => res.response.tags)
}

/**
 * Gets tag names in a different language
 * @param {number[]} tagids
 * @returns {Promise<{
 *   tagid: number,
 *   english_name: string,
 *   name: string,
 *   normalized_name: string,
 * }>}
 */
export async function GetLocalizedNameForTags (tagids) {
  !Array.isArray(tagids) && (tagids = [tagids])
  const result = []
  for (const items of _.chunk(tagids, 100)) {
    const params = items.reduce((acc, tagid, index) => {
      acc[`tagids[${index}]`] = tagid
      return acc
    }, {})
    const res = await utils.request.get('IStoreService/GetLocalizedNameForTags/v1', {
      params
    })
    result.push(...res.response.tags)
  }
  return result
}
