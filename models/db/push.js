import { Config } from '#components'
import { sequelize, DataTypes, Op } from './base.js'

/**
 * @typedef {Object} PushColumns
 * @property {number} id 表id
 * @property {string} userId 用户id
 * @property {string} steamId steamId
 * @property {string} botId 机器人id
 * @property {string} groupId 群组id
 * @property {boolean} isPush 是否开启推送
 */

export const table = sequelize.define('push', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  steamId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  botId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  groupId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isPush: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
}, {
  freezeTableName: true
})

await table.sync()

/**
 * 添加一个推送群
 * @param {string} userId
 * @param {string} steamId
 * @param {string} botId
 * @param {string} groupId
 * @param {Transaction?} [transaction]
 * @returns {Promise<PushColumns>}
 */
export async function add (userId, steamId, botId, groupId, transaction) {
  userId = String(userId)
  botId = String(botId)
  groupId = String(groupId)
  // 判断是否存在
  const data = await table.findOne({
    where: {
      userId,
      steamId,
      botId,
      groupId
    }
  }).then(i => i?.dataValues)
  if (data) {
    return await table.update({
      isPush: true
    }, {
      where: {
        userId,
        steamId,
        botId,
        groupId
      },
      transaction
    }).then(result => result?.[0])
  }
  return await table.create({
    userId,
    steamId,
    botId,
    groupId,
    isPush: Config.push.defaultPush
  }, { transaction }).then(result => result?.dataValues)
}

/**
 * 删除一个推送群
 * @param {string} userId
 * @param {string} steamId
 * @param {string} botId
 * @param {string} groupId
 * @param {Transaction?} [transaction]
 * @returns {Promise<number>}
 */
export async function set (userId, steamId, botId, groupId, transaction) {
  userId = String(userId)
  botId = String(botId)
  groupId = String(groupId)
  return await table.update({
    isPush: false
  }, {
    where: {
      userId,
      steamId,
      botId,
      groupId
    },
    transaction
  }).then(result => result?.[0])
}

/**
 * 通过steamId获取所有推送群组
 * @param {string} steamId
 * @returns {Promise<PushColumns[]>}
 */
export async function getAllBySteamId (steamId) {
  return await table.findAll({
    where: {
      steamId,
      isPush: true
    }
  }).then(result => result?.map(item => item?.dataValues))
}

/**
 * 根据userId和groupId获取所有的steamId
 * @param {string} userId
 * @param {string} groupId
 * @param {boolean} [isPush=true] 是否只获取开启推送的用户
 * @returns {Promise<string[]>}
 */
export async function getAllByUserIdAndGroupId (userId, groupId, isPush = true) {
  if (!groupId) return []
  userId = String(userId)
  groupId = String(groupId)
  const where = {
    userId,
    groupId
  }
  if (isPush) {
    where.isPush = true
  }
  return await table.findAll({
    where
  }).then(result => result.map(item => item?.dataValues?.steamId))
}

/**
 * 删除steamId的所有推送群组
 * @param {string} steamId
 * @param {Transaction?} [transaction]
 * @returns {Promise<number>}
 */
export async function delBySteamId (steamId, transaction) {
  return await table.destroy({
    where: {
      steamId
    },
    transaction
  })
}

/**
 * 获取所有推送群组
 * @param {boolean} [filter=true] 是否使用黑白名单查找 默认开启
 * @returns {Promise<PushColumns[]>}
 */
export async function getAll (filter = true) {
  const where = {
    isPush: true
  }
  if (filter) {
    if (Config.push.whiteGroupList.length) {
      where.groupId = {
        [Op.in]: Config.push.whiteGroupList.map(String)
      }
    } else if (Config.push.blackGroupList.length) {
      where.groupId = {
        [Op.notIn]: Config.push.blackGroupList.map(String)
      }
    }
    if (Config.push.whiteBotList.length) {
      where.botId = {
        [Op.in]: Config.push.whiteBotList.map(String)
      }
    } else if (Config.push.blackBotList.length) {
      where.botId = {
        [Op.notIn]: Config.push.blackBotList.map(String)
      }
    }
  }
  return await table.findAll({
    where
  }).then(result => result?.map(item => item?.dataValues))
}

/**
 * 将指定的steamId对应的所有为0的userId替换为真实的userId
 * @param {string} userId
 * @param {string} steamId
 */
export async function setNA (userId, steamId) {
  userId = String(userId)
  return await table.update({
    userId
  }, {
    where: {
      steamId,
      userId: '0'
    }
  }).then(result => result?.[0])
}

/**
 * 根据groupId获取所有数据
 * @param {string} groupId
 * @param {boolean} [isPush=true] 是否只获取开启推送的用户
 * @returns {Promise<PushColumns[]>}
 */
export async function getAllByGroupId (groupId, isPush = true) {
  groupId = String(groupId)
  const where = {
    groupId
  }
  if (isPush) {
    where.isPush = true
  }
  return await table.findAll({
    where
  }).then(result => result?.map(item => item?.dataValues))
}

/**
 * 根据userId列表获取对应的所有数据
 * @param {string[]} userList
 * @param {boolean} isPush 是否只获取开启推送的用户
 * @returns
 */
export async function getAllByUserIds (userList, isPush = true) {
  const where = {
    userId: {
      [Op.in]: userList.map(String)
    }
  }
  if (isPush) {
    where.isPush = true
  }
  return await table.findAll({
    where
  }).then(result => result?.map(item => item?.dataValues))
}
