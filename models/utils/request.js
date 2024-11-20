import axios from 'axios'
import { Config } from '#components'
import { HttpsProxyAgent } from 'https-proxy-agent'

/**
 * 通用请求方法
 * @param {string} url
 * @param {AxiosRequestConfig} options
 * @returns {Promise<AxiosResponse<any>>}
 */
export default async function request (url, options = {}) {
  const ateamApi = 'https://api.steampowered.com'
  const baseURL = options.baseURL?.replace(/\/$/, '') ?? ateamApi
  return await axios.request({
    url,
    baseURL,
    httpsAgent: Config.steam.proxy ? new HttpsProxyAgent(Config.steam.proxy) : undefined,
    ...options,
    params: {
      key: baseURL === ateamApi ? Config.steam.apiKey : undefined,
      ...options.params
    },
    timeout: 5000
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
