import { utils } from '#models'
import _ from 'lodash'

/**
 * 获得所有客户端登录信息
 * @param {string} accessToken
 * @returns {Promise<{
 *  sessions?: {
 *    client_instanceid: string
 *    protocol_version: number
 *    os_name: string
 *    machine_name: string
 *    os_type: number
 *    device_type: number
 *    realm: number
 *  }[],
 *  refetch_interval_sec: number
 * }>}
 */
export async function GetAllClientLogonInfo (accessToken) {
  return utils.request.get('IClientCommService/GetAllClientLogonInfo/v1', {
    params: {
      access_token: accessToken
    }
  }).then(res => res.response)
}

/**
 * 获得客户端的游戏列表 需要有已登录的客户端实例
 * @param {string} accessToken
 * @param {string} clientInstanceid 客户端id
 * @returns {Promise<{
 *  bytes_available: string,
 *  apps: {
 *    appid: number
 *    app: string
 *    app_type: string
 *    bytes_downloaded: string
 *    bytes_to_download: string
 *    auto_update: boolean
 *    installed: boolean
 *    download_paused: boolean
 *    changing: boolean
 *    available_on_platform: boolean
 *    bytes_staged: string
 *    bytes_to_stage: string
 *    source_buildid: number
 *    target_buildid: number
 *    queue_position: number
 *    running: boolean
 *  }[],
 *  client_info: {
 *    package_version: number
 *    os: string
 *    machine_name: string
 *    ip_public: string
 *    ip_private: string
 *    bytes_available: string
 *    protocol_version: number
 *    clientcomm_version: number,
 *    local_users: number[],
 *  },
 *  refetch_interval_sec_full: number,
 *  refetch_interval_sec_changing: number,
 *  refetch_interval_sec_updating: number,
 * }|undefined>}
 */
export async function GetClientAppList (accessToken, clientInstanceid) {
  return utils.request.get('IClientCommService/GetClientAppList/v1', {
    params: {
      access_token: accessToken,
      fields: 'games', // all|media|tools|games
      filters: 'none', // none|changing|installed
      include_client_info: true,
      client_instanceid: clientInstanceid
    }
  }).then(res => _.isEmpty(res.response) ? undefined : res.response)
}

/**
 * 获得客户端的信息 需要有已登录的客户端实例
 * @param {string} accessToken
 * @param {number} clientInstanceid 客户端id
 * @returns {Promise<{
 *  package_version: number
 *  os: string
 *  machine_name: string
 *  ip_public: string
 *  ip_private: string
 *  bytes_available: string
 *  protocol_version: number
 *  clientcomm_version: number,
 *  local_users: number[],
 * }|undefined>}
 */
export async function GetClientInfo (accessToken, clientInstanceid) {
  return utils.request.get('IClientCommService/GetClientInfo/v1', {
    params: {
      access_token: accessToken,
      client_instanceid: clientInstanceid
    }
  }).then(res => res.response?.client_info || undefined)
}

/**
 * 获得客户端的信息 需要有已登录的客户端实例
 * @param {string} accessToken
 * @param {number} clientInstanceid 客户端id
 * @returns {Promise<{
 *  package_version: number
 *  os: string
 *  machine_name: string
 * }>}
 */
export async function GetClientLogonInfo (accessToken, clientInstanceid) {
  return utils.request.get('IClientCommService/GetClientInfo/v1', {
    params: {
      access_token: accessToken,
      client_instanceid: clientInstanceid
    }
  }).then(res => _.isEmpty(res.response) ? undefined : res.response)
}

/**
 * 让客户端直接下载游戏
 * @param {string} accessToken
 * @param {number} appid
 * @param {number} clientInstanceid 客户端id
 * @returns {Promise<undefined>}
 */
export async function InstallClientApp (accessToken, appid, clientInstanceid) {
  return utils.request.post('IClientCommService/InstallClientApp/v1', {
    params: {
      access_token: accessToken,
      appid,
      client_instanceid: clientInstanceid
    }
  }).then(res => res.response)
}

/**
 * 让客户端启动游戏
 * @param {string} accessToken
 * @param {number} appid
 * @param {number} clientInstanceid 客户端id
 * @returns {Promise<undefined>}
 */
export async function LaunchClientApp (accessToken, appid, clientInstanceid) {
  return utils.request.post('IClientCommService/LaunchClientApp/v1', {
    params: {
      access_token: accessToken,
      appid,
      client_instanceid: clientInstanceid
    }
  }).then(res => res.response)
}

/**
 * 让客户端恢复或暂停下载
 * @param {string} accessToken
 * @param {number} appid
 * @param {boolean} download true: 恢复下载 false: 暂停下载 默认true
 * @param {number} clientInstanceid 客户端id
 * @returns {Promise<undefined>}
 */
export async function SetClientAppUpdateState (accessToken, appid, download = true, clientInstanceid) {
  return utils.request.post('IClientCommService/SetClientAppUpdateState/v1', {
    params: {
      access_token: accessToken,
      appid,
      action: download ? 1 : 0,
      client_instanceid: clientInstanceid
    }
  }).then(res => res.response)
}

/**
 * 让客户端删除指定的游戏
 * @param {string} accessToken
 * @param {number} appid
 * @param {number} clientInstanceid 客户端id
 * @returns {Promise<undefined>}
 */
export async function UninstallClientApp (accessToken, appid, clientInstanceid) {
  return utils.request.post('IClientCommService/UninstallClientApp/v1', {
    params: {
      access_token: accessToken,
      appid,
      client_instanceid: clientInstanceid
    }
  }).then(res => res.response)
}
