import { Bot, common, logger, segment } from '#lib'
import { Config, Version } from '#components'

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
  try {
    if (Version.BotName === 'Karin') {
      return await Bot.sendMsg(botId, { scene: 'group', peer: gid }, msg)
    } else {
      gid = Number(gid) || gid
      const bot = (Config.push.randomBot && Version.BotName === 'Trss-Yunzai') ? Bot : Bot[botId]
      return await bot.pickGroup(gid).sendMsg(msg)
    }
  } catch (error) {
    logger.error(`群消息发送失败: ${gid}`, error)
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
