import { Bot, common, logger, segment } from '#lib'
import { Config, Version } from '#components'

/**
 * 获得bot
 * @param {string} botId
 * @returns {any}
 */
export function getBot (botId) {
  switch (Version.BotName) {
    case 'Karin':
      return Bot.getBot(botId)
    case 'Trss-Yunzai':
      return Config.push.randomBot ? Bot : Bot[botId]
    case 'Miao-Yunzai': {
      const bot = Bot[botId]
      return bot || Bot
    }
  }
}

/**
 * 获取用户名
 * @param {string} botId
 * @param {string} uid
 * @param {string?} gid
 */
export async function getUserName (botId, uid, gid) {
  try {
    const bot = getBot(botId)
    if (Version.BotName === 'Karin') {
      if (gid) {
        const info = await bot.GetGroupMemberInfo(gid, uid)
        return info.card || info.nick || info.uid || uid
      } else {
        return uid
      }
    } else {
      uid = Number(uid) || uid
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
    const bot = getBot(botId)
    if (Version.BotName === 'Karin') {
      const avatarUrl = await bot.getAvatarUrl(uid, 100)
      return avatarUrl || ''
    } else {
      uid = Number(uid) || uid
      if (gid) {
        gid = Number(gid) || gid
        const group = bot.pickGroup(gid)
        const avatarUrl = (await group.pickMember(uid)).getAvatarUrl(100)
        return avatarUrl || bot.avatar
      } else {
        const user = bot.pickUser(uid)
        const avatarUrl = await user.getAvatarUrl(100)
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
    const bot = getBot(botId)
    if (Version.BotName === 'Karin') {
      const memberList = await bot.GetGroupMemberList(groupId)
      result.push(...memberList.map(i => i.uid))
    } else {
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
      return at[at.length - 1]
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
  try {
    const bot = getBot(botId)
    if (!bot) {
      return false
    }
    if (Version.BotName === 'Karin') {
      return await Bot.sendMsg(botId, { scene: 'group', peer: gid }, msg)
    } else {
      gid = Number(gid) || gid
      return await bot.pickGroup(gid).sendMsg(msg)
    }
  } catch (error) {
    logger.error(`群消息发送失败: ${gid}`, error)
    return false
  }
}

/**
   * 制作并发送转发消息
   * @param {any} e
   * @param {any} msg
   */
export async function makeForwardMsg (e, msg) {
  try {
    if (Version.BotName === 'Karin') {
      msg = msg.map(i => typeof i === 'string' ? segment.text(i) : i)
      msg = common.makeForward(msg, e.selfId, e.bot.account.name)
      return await e.bot.sendForwardMsg(e.contact, msg)
    } else {
      msg = await common.makeForwardMsg(e, msg)
      return await e.reply(msg)
    }
  } catch (error) {
    logger.error('发送转发消息失败', error)
    return ''
  }
}

/**
 * 检查黑白名单 返回ture表示通过
 * @param {string} gid
 * @returns {{success: boolean, message?: string}}
 */
export function checkGroup (gid) {
  if (Config.push.whiteGroupList.length && !Config.push.whiteGroupList.some(id => id == gid)) {
    return {
      success: false,
      message: Config.tips.noWhiteGroupTips
    }
  }
  if (Config.push.blackGroupList.length && Config.push.blackGroupList.some(id => id == gid)) {
    return {
      success: false,
      message: Config.tips.blackGroupTips
    }
  }
  return {
    success: true
  }
}
