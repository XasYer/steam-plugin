import axios from 'axios'
import { Config } from '#components'
import { ProxyAgent } from 'proxy-agent'

/**
 * 通用请求方法
 * @param {string} url
 * @param {AxiosRequestConfig} options
 * @returns {Promise<AxiosResponse<any>>}
 */
export default async function request (url, options = {}) {
  const steamApi = 'https://api.steampowered.com'
  const baseURL = options.baseURL?.replace(/\/$/, '') ?? steamApi
  return await axios.request({
    url,
    baseURL,
    httpAgent: Config.steam.proxy ? new ProxyAgent(Config.steam.proxy) : undefined,
    ...options,
    params: {
      key: baseURL === steamApi ? Config.steam.apiKey : undefined,
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
