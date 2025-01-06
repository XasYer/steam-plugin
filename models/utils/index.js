import fs from 'fs'
import axios from 'axios'
import moment from 'moment'
import { join } from 'path'
import { logger } from '#lib'
import { Version } from '#components'

export * as bot from './bot.js'
export * as steam from './steam.js'
export * as request from './request.js'

const tempDir = join(Version.pluginPath, 'temp')
try {
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true })
  }
  fs.mkdirSync(tempDir)
} catch { }

/**
 * 将对应时间转换成时长字符串
 * @param {number} inp
 * @param {import('moment').DurationInputArg2} unit
 * @returns {string}
 */
export function formatDuration (inp, unit = 'seconds') {
  const duration = moment.duration(inp, unit)

  const days = duration.days()
  const hours = duration.hours()
  const minutes = duration.minutes()
  const secs = duration.seconds()

  let formatted = ''
  if (days > 0)formatted += `${days}天`
  if (hours > 0) formatted += `${hours}小时`
  if (minutes > 0) formatted += `${minutes}分钟`
  if (formatted === '' && secs > 0) formatted += `${secs}秒`

  return formatted.trim()
}

/**
 * 获取图片buffer
 * @param {string} url
 * @param {number} retry 重试次数 默认3
 * @returns {Promise<Buffer|null|string>}
 */
export async function getImgUrlBuffer (url, retry = 3) {
  if (!url) return null
  retry = Number(retry) || 3
  for (let i = 0; i < retry; i++) {
    try {
      const buffer = await axios.get(url, {
        responseType: 'arraybuffer'
      }).then(res => res.data)
      if (Version.BotName === 'Karin') {
        return `base64://${buffer.toString('base64')}`
      } else {
        return buffer
      }
    } catch (error) {
      logger.error(`获取图片${url}失败, 第${i + 1}次重试\n`, error.message)
    }
  }
  return null
}

/**
 * 将图片保存到临时文件夹
 * @param {*} url
 * @param {number} retry 重试次数 默认3
 * @returns {Promise<string>} 图片绝对路径
 */
export async function saveImg (url, retry = 3) {
  if (!url) return ''
  retry = Number(retry) || 3
  for (let i = 0; i < retry; i++) {
    try {
      let ext = ''
      const buffer = await axios.get(url, {
        responseType: 'arraybuffer'
      }).then(res => {
        ext = res.headers['content-type']?.split('/')?.pop() || 'png'
        return res.data
      })
      const filename = `${Date.now()}.${ext}`
      const filepath = join(tempDir, filename)
      fs.writeFileSync(filepath, buffer)
      setTimeout(() => {
        fs.unlinkSync(filepath)
      }, 1000 * 60 * 10) // 10分钟后删除
      return filepath.replace(/\\/g, '/')
    } catch (error) {
      logger.error(`保存图片${url}失败, 第${i + 1}次重试\n${error.message}`)
    }
  }
  return ''
}
