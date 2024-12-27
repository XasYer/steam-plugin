import axios from 'axios'
import { Config } from '#components'
import { HttpProxyAgent } from 'http-proxy-agent'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { logger, redis } from '#lib'
import _ from 'lodash'
import moment from 'moment'

const redisKey = 'steam-plugin'

/**
 * 通用请求方法
 * @param {string} url
 * @param {import('axios').AxiosRequestConfig} options
 * @returns {Promise<import('axios').AxiosResponse<any>>}
 */
export default async function request (url, options = {}, retry = { count: 0, keys: Config.steam.apiKey }) {
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
  incr(url)
  const start = Date.now()
  const { key, keys } = await getKey(retry.keys)
  return await axios.request({
    url,
    baseURL,
    httpAgent: Config.steam.proxy ? new HttpProxyAgent(Config.steam.proxy) : undefined,
    httpsAgent: Config.steam.proxy ? new HttpsProxyAgent(Config.steam.proxy) : undefined,
    ...options,
    params: {
      key: (baseURL === steamApi && !options.params?.access_token) ? key : undefined,
      l: 'schinese',
      cc: 'CN',
      language: 'schinese',
      ...options.params
    },
    timeout: Config.steam.timeout * 1000
  }).then(res => {
    logger.info(`请求api成功: ${url}, 耗时: ${Date.now() - start}ms`)
    return res.data
  }).catch(err => {
    if (err.status === 429 && keys.length > 1) {
      // 十分钟内不使用相同的key
      redis.set(`${redisKey}:429key:${key}`, 1, { EX: 60 * 10 })
      retry.count++
      retry.keys = keys.filter(k => k !== key)
      logger.error(`请求api失败: ${url}, 状态码: ${err.status}, 更换apiKey开始重试第${retry.count}次`)
      return request(url, options, retry)
    }
    throw err
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

async function getKey (keys = Config.steam.apiKey) {
  const i = []
  if (keys.length > 1) {
    for (const key of keys) {
      if (!await redis.exists(`${redisKey}:429key:${key}`)) {
        i.push(key)
      }
    }
  } else {
    i.push(...keys)
  }
  return {
    keys: i,
    key: _.sample(i)
  }
}

function incr (url, day = 3) {
  const now = moment().format('YYYY-MM-DD')
  const key = `${redisKey}:api:${now}:${url}`
  redis.incr(key).then((i) => {
    if (i == 1 && day > 0) {
      redis.expire(key, 60 * 60 * 24 * day).catch(() => {})
    }
  }).catch(() => {})
}
