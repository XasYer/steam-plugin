import fs from 'fs'
import moment from 'moment'
import { Bot, logger } from '#lib'
import { Config, Version } from '#components'
import * as request from './request.js'
import { join } from 'path'

export { request }

const tempDir = join(Version.pluginPath, 'temp')

if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true })
}
fs.mkdirSync(tempDir)

const steamIdOffset = 76561197960265728n

/**
 * 将好友码或steamID转换成steamID
 * @param {string} id 好友码或steamID
 * @returns {string} steamID
 */
export function getSteamId (id) {
  if (!id) {
    return false
  }
  id = BigInt(id)
  if (id < steamIdOffset) {
    id = id + steamIdOffset
  }
  return id.toString()
}

/**
 * 将steamID转换成好友码
 * @param {string} steamId
 * @returns {string}
 */
export function getFriendCode (steamId) {
  if (!steamId) {
    return false
  }
  steamId = BigInt(steamId)
  return (steamId - steamIdOffset).toString()
}

/**
 * 将对应时间转换成时长字符串
 * @param {number} inp
 * @param {'year' | 'years' | 'y' |'month' | 'months' | 'M' |'week' | 'weeks' | 'w' |'day' | 'days' | 'd' 'hour' | 'hours' | 'h' | 'minute' | 'minutes' | 'm' | 'second' | 'seconds' | 's' | 'millisecond' | 'milliseconds' | 'ms' | 'quarter' | 'quarters' | 'Q'} unit
 * @returns {string}
 */
export function formatDuration (inp, unit = 'seconds') {
  const duration = moment.duration(inp, unit)

  const days = duration.days()
  const hours = duration.hours()
  const minutes = duration.minutes()
  // const secs = duration.seconds()

  let formatted = ''
  if (days > 0)formatted += `${days}天`
  if (hours > 0) formatted += `${hours}小时`
  if (minutes > 0) formatted += `${minutes}分钟`
  // if (secs > 0 || formatted === '') formatted += `${secs}秒`

  return formatted.trim()
}

/**
 * 获取用户名
 * @param {string} botId
 * @param {string} uid
 * @param {string?} gid
 */
export async function getUserName (botId, uid, gid) {
  try {
    if (Version.BotName === 'Karin') {
      if (gid) {
        const bot = Bot.getBot(botId)
        const info = await bot.GetGroupMemberInfo(gid, uid)
        return info.card || info.nick || info.uid || uid
      } else {
        return uid
      }
    } else {
      uid = Number(uid) || uid
      const bot = (Config.push.randomBot && Version.BotName === 'Trss-Yunzai') ? Bot : Bot[botId]
      if (gid) {
        gid = Number(gid) || gid
        const group = bot.pickGroup(gid)
        const member = await group.pickMember(uid)
        const info = await member.getInfo?.() || member.info || {}
        return info.card || info.nickname || info.user_id || uid
      } else {
        const user = bot.pickFriend(uid)
        const info = await user.getInfo?.() || user.info || {}
        return info.nickname || info.user_id || uid
      }
    }
  } catch {
    return uid
  }
}

/**
 * 获取用户头像
 * @param {string} botId
 * @param {string} uid
 * @param {string?} gid
 * @returns {Promise<string>}
 */
export async function getUserAvatar (botId, uid, gid) {
  try {
    if (Version.BotName === 'Karin') {
      const bot = Bot.getBot(botId)
      const avatarUrl = await bot.getAvatarUrl(uid)
      return avatarUrl || await bot.getAvatarUrl(botId) || ''
    } else {
      uid = Number(uid) || uid
      const bot = (Config.push.randomBot && Version.BotName === 'Trss-Yunzai') ? Bot : Bot[botId]
      if (gid) {
        gid = Number(gid) || gid
        const group = bot.pickGroup(gid)
        const avatarUrl = (await group.pickMember(uid)).getAvatarUrl()
        return avatarUrl || bot.avatar
      } else {
        const user = bot.pickUser(uid)
        const avatarUrl = await user.getAvatarUrl()
        return avatarUrl || bot.avatar || ''
      }
    }
  } catch {
    return ''
  }
}

/**
 * 获取某个群的群成员列表
 * @param {string} botId
 * @param {string} groupId
 * @returns {Promise<string[]>}
 */
export async function getGroupMemberList (botId, groupId) {
  const result = []
  try {
    if (Version.BotName === 'Karin') {
      const memberList = await Bot.getBot(botId).GetGroupMemberList(groupId)
      result.push(...memberList.map(i => i.uid))
    } else {
      const bot = (Config.push.randomBot && Version.BotName === 'Trss-Yunzai') ? Bot : Bot[botId]
      const memberMap = await bot.pickGroup(groupId).getMemberMap()
      result.push(...memberMap.keys())
    }
  } catch { }
  return result
}

/**
 * 获取at的id,没有则返回用户id
 * @param {string|string[]} at
 * @param {string} id
 * @returns {string}
 */
export function getAtUid (at, id) {
  if (Version.BotName === 'Karin') {
    if (typeof at === 'string') {
      return at
    }
    if (at.length) {
      return at.pop()
    } else {
      return id
    }
  } else {
    return at || id
  }
}

/**
 * 主动发送群消息
 * @param {string} botId
 * @param {string} gid
 * @param {any} msg
 * @returns {Promise<any>}
 */
export async function sendGroupMsg (botId, gid, msg) {
  if (Version.BotName === 'Karin') {
    return await Bot.sendMsg(botId, { scene: 'group', peer: gid }, msg)
  } else {
    gid = Number(gid) || gid
    const bot = (Config.push.randomBot && Version.BotName === 'Trss-Yunzai') ? Bot : Bot[botId]
    return await bot.pickGroup(gid).sendMsg(msg)
  }
}

/**
 * 获取appid对应的header图片url
 * @param {string} appid
 * @returns {string}
 */
export function getHeaderImgUrlByAppid (appid) {
  if (!appid) return ''
  // return `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appid}/header.jpg`
  return `https://steamcdn-a.akamaihd.net/steam/apps/${appid}/header.jpg`
}

/**
 * 获取静态资源url items/xxx
 * @param {string} path
 */
export function getStaticUrl (path) {
  if (path?.startsWith('items')) {
    // return `https://cdn.fastly.steamstatic.com/steamcommunity/public/images/${path}`
    return `https://steamcdn-a.akamaihd.net/steamcommunity/public/images/${path}`
  }
  return ''
}

/**
 * 获取图片buffer
 * @param {string} url
 * @param {number} retry 重试次数 默认3
 * @returns {Promise<Buffer|null|string>}
 */
export async function getImgUrlBuffer (url, retry = 3) {
  if (!url) return null
  const path = new URL(url)
  retry = Number(retry) || 3
  for (let i = 0; i < retry; i++) {
    try {
      const buffer = await request.get(path.pathname + path.search, {
        responseType: 'arraybuffer',
        baseURL: path.origin
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
  const path = new URL(url)
  retry = Number(retry) || 3
  for (let i = 0; i < retry; i++) {
    try {
      let ext = ''
      const buffer = await request.get(path.pathname + path.search, {
        responseType: 'arraybuffer',
        baseURL: path.origin
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

/**
 * 将用户状态码转换为中文
 * @param {number} state
 * @returns {string}
 */
export function getPersonaState (state) {
  const stateMap = {
    0: '离线',
    1: '在线',
    3: '离开',
    4: '离开'
  }
  return stateMap[state] || '其他'
}
