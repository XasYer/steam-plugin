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

// 添加一个字段isPush是否开启推送
// 2024年11月23日 七天后删除
async function PushTableColumnAddIsPush () {
  const queryInterface = sequelize.getQueryInterface()
  // 检查isPush是否存在
  const isPush = await queryInterface.describeTable('push').then(i => i.isPush)
  if (isPush) {
    return
  }
  // 添加isPush字段
  await queryInterface.addColumn('push', 'isPush', {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  })
  await PushTable.update({
    isPush: true
  }, {
    where: {}
  })
}

await PushTableColumnAddIsPush()

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
  botId = String(botId)
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
    return await PushTable.update({
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
  return await PushTable.create({
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
export async function PushTableDelData (userId, steamId, botId, groupId, transaction) {
  userId = String(userId)
  botId = String(botId)
  groupId = String(groupId)
  return await PushTable.update({
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
export async function PushTableGetDataBySteamId (steamId) {
  return await PushTable.findAll({
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
export async function PushTableGetAllSteamIdBySteamIdAndGroupId (userId, groupId, isPush = true) {
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
  return await PushTable.findAll({
    where
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
 * @param {boolean} [filter=true] 是否使用黑白名单查找 默认开启
 * @returns {Promise<PushColumns[]>}
 */
export async function PushTableGetAllData (filter = true) {
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
  return await PushTable.findAll({
    where
  }).then(result => result?.map(item => item?.dataValues))
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

/**
 * 根据groupId获取所有数据
 * @param {string} groupId
 * @param {boolean} [isPush=true] 是否只获取开启推送的用户
 * @returns {Promise<PushColumns[]>}
 */
export async function PushTableGetDataByGroupId (groupId, isPush = true) {
  groupId = String(groupId)
  const where = {
    groupId
  }
  if (isPush) {
    where.isPush = true
  }
  return await PushTable.findAll({
    where
  }).then(result => result?.map(item => item?.dataValues))
}
