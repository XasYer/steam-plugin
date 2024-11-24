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
  const steamApi = Config.steam.apiProxy?.replace(/\/$/, '') ?? 'https://api.steampowered.com'
  const baseURL = options.baseURL?.replace(/\/$/, '') ?? steamApi
  const agents = {
    httpAgent: undefined,
    httpsAgent: undefined
  }
  if (Config.steam.proxy?.startsWith('http://')) {
    agents.httpAgent = new HttpProxyAgent(Config.steam.proxy)
  } else if (Config.steam.proxy?.startsWith('https://')) {
    agents.httpsAgent = new HttpsProxyAgent(Config.steam.proxy)
  }
  return await axios.request({
    url,
    baseURL,
    ...agents,
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
