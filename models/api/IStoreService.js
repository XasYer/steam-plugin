import { utils } from '#models'

/**
 * 获得探索队列
 * @param {string} accessToken
 * @returns {Promise<{
 *   appids: number[],
 *   country_code: string,
 *   settings: any,
 *   skipped: number,
 *   exhausted: boolean
 *   experimental_cohort: number,
 * }>}
 */
export async function GetDiscoveryQueue (accessToken) {
  const input = {
    queue_type: 0,
    country_code: 'CN',
    rebuild_queue: true,
    settings_changed: false,
    settings: {},
    rebuild_queue_if_stale: true,
    ignore_user_preferences: false,
    no_experimental_results: false,
    experimental_cohort: 0,
    debug_get_solr_query: false,
    store_page_filter: {}
  }
  return utils.request.get('IStoreService/GetDiscoveryQueue/v1', {
    params: {
      access_token: accessToken,
      input_json: JSON.stringify(input)
    }
  }).then(res => res.response)
}

/**
 * 获得探索队列的设置
 * @param {string} accessToken
 * @returns {Promise<unknown>}
 */
export async function GetDiscoveryQueueSettings (accessToken) {
  const input = {
    queue_type: 0
  }
  return utils.request.get('IStoreService/GetDiscoveryQueueSettings/v1', {
    params: {
      access_token: accessToken,
      input_json: JSON.stringify(input)
    }
  })
}

/**
 * 获得探索队列中已跳过的游戏
 * @param {string} accessToken
 * @param {number} steamid
 * @returns {Promise<number[]>}
 */
export async function GetDiscoveryQueueSkippedApps (accessToken, steamid) {
  const input = {
    queue_type: 0,
    steamid
  }
  return utils.request.get('IStoreService/GetDiscoveryQueueSkippedApps/v1', {
    params: {
      access_token: accessToken,
      input_json: JSON.stringify(input)
    }
  }).then(res => res.response.appids || [])
}

/**
 * 获取不同语言的tag名称
 * @returns {Promise<{
 *   tagid: number,
 *   english_name: string,
 *   name: string,
 *   normalized_name: string,
 * }[]>}
 */
export async function GetLocalizedNameForTags (tagids) {
  !Array.isArray(tagids) && (tagids = [tagids])
  const input = {
    tagids,
    language: 'schinese'
  }
  return utils.request.get('IStoreService/GetLocalizedNameForTags/v1', {
    params: {
      input_json: JSON.stringify(input)
    }
  }).then(res => res.response.tags || [])
}

/**
 * 获取所有带有本地化名称的白名单标签。
 * @returns {Promise<{
 *   tagid: number,
 *   name: string,
 * }[]>}
 */
export async function GetMostPopularTags () {
  return utils.request.get('IStoreService/GetMostPopularTags/v1').then(res => res.response.tags || [])
}

/**
 * 获得tag列表
 * @returns {Promise<{
 *   version_hash: string,
 *   tags: {
 *     tagid: number,
 *     name: string,
 *   }[]
 * }>}
 */
export async function GetTagList () {
  return utils.request.get('IStoreService/GetTagList/v1')
    .then(res => res.response)
}

/**
 * 跳过探索队列中的某一项
 * @returns {Promise<unknown>}
 */
export async function SkipDiscoveryQueueItem (appid) {
  const input = {
    queue_type: 0,
    appid
  }
  return utils.request.post('IStoreService/SkipDiscoveryQueueItem/v1', {
    params: {
      input_json: JSON.stringify(input)
    }
  })
}
