import axios from 'axios'
import { Config } from '#components'
import { HttpProxyAgent } from 'http-proxy-agent'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { logger } from '#lib'

/**
 * 通用请求方法
 * @param {string} url
 * @param {import('axios').AxiosRequestConfig} options
 * @returns {Promise<import('axios').AxiosResponse<any>>}
 */
export default async function request (url, options = {}) {
  const steamApi = (() => {
    const url = 'https://api.steampowered.com'
    if (Config.steam.commonProxy) {
      return Config.steam.commonProxy.replace('{{url}}', url)
    } else if (Config.steam.apiProxy) {
      return Config.steam.apiProxy.replace(/\/$/, '')
    } else {
      return url
    }
  })()
  const baseURL = options.baseURL ?? steamApi
  logger.info(`开始请求api: ${url}`)
  const start = Date.now()
  return await axios.request({
    url,
    baseURL,
    httpAgent: Config.steam.proxy ? new HttpProxyAgent(Config.steam.proxy) : undefined,
    httpsAgent: Config.steam.proxy ? new HttpsProxyAgent(Config.steam.proxy) : undefined,
    ...options,
    params: {
      key: baseURL === steamApi ? Config.steam.apiKey : undefined,
      l: 'schinese',
      cc: 'CN',
      language: 'schinese',
      ...options.params
    },
    timeout: Config.steam.timeout * 1000
  }).then(res => {
    logger.info(`请求api成功: ${url}, 耗时: ${Date.now() - start}ms`)
    return res.data
  })
}

/**
 * get 请求方法
 * @param {string} url
 * @param {import('axios').AxiosRequestConfig} options
 * @returns {Promise<import('axios').AxiosResponse<any>>}
 */
export async function get (url, options = {}) {
  return await request(url, {
    ...options,
    method: 'GET'
  })
}

/**
 * post 请求方法
 * @param {string} url
 * @param {import('axios').AxiosRequestConfig} options
 * @returns {Promise<import('axios').AxiosResponse<any>>}
 */
export async function post (url, options = {}) {
  return await request(url, {
    ...options,
    method: 'POST'
  })
}
