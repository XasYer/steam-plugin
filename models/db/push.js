import { sequelize, DataTypes } from './base.js'

/**
 * @typedef {Object} PushColumns
 * @property {number} id 表id
 * @property {string} userId 用户id
 * @property {string} steamId steamId
 * @property {string} botId 机器人id
 * @property {string} groupId 群组id
 */

const PushTable = sequelize.define('push', {
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

await PushTable.sync()

/**
 * 添加一个推送群
 * @param {string} userId
 * @param {string} steamId
 * @param {string} botId
 * @param {string} groupId
 * @param {Transaction?} [transaction]
 * @returns {Promise<PushColumns>}
 */
export async function PushTableAddData (userId, steamId, botId, groupId, transaction) {
  userId = String(userId)
  groupId = String(groupId)
  // 判断是否存在
  const data = await PushTable.findOne({
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
  return await PushTable.create({
    userId,
    steamId,
    botId,
    groupId
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
export async function PushTableDelData (userId, steamId, botId, groupId, transaction) {
  userId = String(userId)
  groupId = String(groupId)
  return await PushTable.destroy({
    where: {
      userId,
      steamId,
      botId,
      groupId
    },
    transaction
  })
}

/**
 * 通过steamId获取所有推送群组
 * @param {string} steamId
 * @returns {Promise<PushColumns[]>}
 */
export async function PushTableGetDataBySteamId (steamId) {
  return await PushTable.findAll({
    where: {
      steamId
    }
  }).then(result => result?.map(item => item?.dataValues))
}

/**
 * 根据userId和groupId获取所有的steamId
 * @param {string} userId
 * @param {string} groupId
 */
export async function PushTableGetAllSteamIdBySteamIdAndGroupId (userId, groupId) {
  if (!groupId) return []
  userId = String(userId)
  groupId = String(groupId)
  return await PushTable.findAll({
    where: {
      userId,
      groupId
    }
  }).then(result => result.map(item => item?.dataValues?.steamId))
}

/**
 * 删除steamId的所有推送群组
 * @param {string} steamId
 * @param {Transaction?} [transaction]
 * @returns {Promise<number>}
 */
export async function PushTableDelAllDataBySteamId (steamId, transaction) {
  return await PushTable.destroy({
    where: {
      steamId
    },
    transaction
  })
}

/**
 * 获取所有推送群组
 * @returns {Promise<PushColumns[]>}
 */
export async function PushTableGetAllData () {
  return await PushTable.findAll().then(result => result?.map(item => item?.dataValues))
}

/**
 * 将指定的steamId对应的所有为0的userId替换为真实的userId
 * @param {string} userId
 * @param {string} steamId
 */
export async function PushTableSetNAUserIdToRealUserIdBySteamId (userId, steamId) {
  userId = String(userId)
  return await PushTable.update({
    userId
  }, {
    where: {
      steamId,
      userId: '0'
    }
  }).then(result => result?.[0])
}
