import { Config } from '#components'
import { sequelize, DataTypes, Op } from './base.js'

/**
 * @typedef {Object} familyInventoryPushColumns
 * @property {number} id 表id
 * @property {string} userId 用户id
 * @property {string} steamId steamId
 * @property {string} botId 机器人id
 * @property {string} groupId 群组id
 */

export const table = sequelize.define('familyInventoryPush', {
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
 * @returns {Promise<familyInventoryPushColumns>}
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
    return data
  }
  return await table.create({
    userId,
    steamId,
    botId,
    groupId
  }, { transaction }).then(result => result?.dataValues)
}

/**
 * 删除推送群
 * @param {string} userId
 * @param {string} steamId
 * @param {string} botId
 * @param {string} groupId
 * @param {Transaction?} [transaction]
 * @returns {Promise<number>}
 */
export async function del (steamId, transaction) {
  return await table.destroy({
    where: {
      steamId
    },
    transaction
  }).then(result => result?.[0])
}

/**
 * 获取所有推送群组
 * @param {boolean} [filter=true] 是否使用黑白名单查找 默认开启
 * @returns {Promise<familyInventoryPushColumns[]>}
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
