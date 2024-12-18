import axios from 'axios'
import { Config } from '#components'
import { HttpProxyAgent } from 'http-proxy-agent'
import { HttpsProxyAgent } from 'https-proxy-agent'

/**
 * 通用请求方法
 * @param {string} url
 * @param {AxiosRequestConfig} options
 * @returns {Promise<AxiosResponse<any>>}
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
  })
}

/**
 * get 请求方法
 * @param {string} url
 * @param {AxiosRequestConfig} options
 * @returns {Promise<AxiosResponse<any>>}
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
 * @param {AxiosRequestConfig} options
 * @returns {Promise<AxiosResponse<any>>}
 */
export async function post (url, options = {}) {
  return await request(url, {
    ...options,
    method: 'POST'
  })
}
