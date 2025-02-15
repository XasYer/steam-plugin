import { db, utils, api } from '#models'
import { Config, Render } from '#components'

/**
 * 获得已绑定的steamId的图片
 * @param {string} bid
 * @param {string} uid
 * @param {string} gid
 * @param {import('models/db').UserColumns[]?} userBindSteamIdList
 * @returns {Promise<Object>}
 */
export async function getBindSteamIdsImg (bid, uid, gid, userBindSteamIdList = []) {
  if (!userBindSteamIdList?.length) {
    userBindSteamIdList = await db.user.getAllByUserId(uid)
  }
  if (!userBindSteamIdList.length) {
    return Config.tips.noSteamIdTips
  }
  const accessTokenList = await db.token.getAllByUserId(uid)
  const groupPermission = (() => {
    if (!Config.push.enable) {
      return false
    }
    if (Config.push.whiteBotList.length && !Config.push.whiteBotList.some(i => i == bid)) {
      return false
    }
    if (Config.push.blackBotList.length && Config.push.blackBotList.some(i => i == bid)) {
      return false
    }
    if (Config.push.whiteGroupList.length && !Config.push.whiteGroupList.some(i => i == gid)) {
      return false
    }
    if (Config.push.blackGroupList.length && Config.push.blackGroupList.some(i => i == gid)) {
      return false
    }
    return true
  })()
  const data = []
  const enablePushSteamIdList = groupPermission ? await db.push.getAllByUserIdAndGroupId(uid, gid) : []
  const userInfo = {}
  try {
    await api.IPlayerService.GetPlayerLinkDetails(userBindSteamIdList.map(i => i.steamId))
      .forEach(i => {
        const avatarhash = Buffer.from(i.public_data.sha_digest_avatar, 'base64').toString('hex')
        userInfo[i.public_data.steamid] = {
          name: i.public_data.persona_name,
          avatar: `https://avatars.steamstatic.com/${avatarhash}_full.jpg`
        }
      })
  } catch { }
  let index = 1
  for (const item of userBindSteamIdList) {
    const accessToken = accessTokenList.find(i => i.steamId == item.steamId)
    const i = userInfo[item.steamId] || {}
    const avatar = Config.other.steamAvatar ? i.avatar : await utils.bot.getUserAvatar(bid, uid, gid)
    const pushInfo = enablePushSteamIdList.find(i => i.steamId == item.steamId)
    const info = {
      ...pushInfo,
      steamId: item.steamId,
      isBind: item.isBind,
      name: i.name || await utils.bot.getUserName(bid, uid, gid),
      avatar: avatar || await utils.bot.getUserAvatar(bid, uid, gid),
      index,
      type: accessToken ? 'ck' : 'reg'
    }
    data.push(info)
    index++
  }
  return await Render.render('user/index', {
    data: [{
      title: '已绑定的steamid',
      list: data
    }],
    groupPermission,
    play: Config.push.enable,
    state: Config.push.stateChange,
    inventory: Config.push.userInventoryChange,
    wishlist: Config.push.userWishlistChange,
    random: Math.floor(Math.random() * 5) + 1
  })
}
