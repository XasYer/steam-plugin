import { Config } from '#components'
import { sequelize, DataTypes, Op } from './base.js'

/**
 * @typedef {Object} PushColumns
 * @property {number} id 表id
 * @property {string} userId 用户id
 * @property {string} steamId steamId
 * @property {string} botId 机器人id
 * @property {string} groupId 群组id
 * @property {boolean} play 是否开启游玩推送
 * @property {boolean} state 是否开启状态推送
 * @property {boolean} inventory 是否开启库存推送
 * @property {boolean} wishlist 是否开启愿望单推送
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
  play: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  state: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  inventory: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  wishlist: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  freezeTableName: true
})

await table.sync()

// 修改字段isPush 细分为游玩推送 状态推送 库存推送 愿望单推送
// 2025年2月15日 七天后删除
async function PushTableUpdateColumn () {
  const queryInterface = sequelize.getQueryInterface()
  // 检查isPush是否存在
  const isPush = await queryInterface.describeTable('push').then(i => i.isPush)
  if (!isPush) {
    return
  }
  // 修改isPush字段为play
  await queryInterface.renameColumn('push', 'isPush', 'play')
  // 添加state字段
  await queryInterface.addColumn('push', 'state', {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  })
  // 添加inventory字段
  await queryInterface.addColumn('push', 'inventory', {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  })
  // 添加wishlist字段
  await queryInterface.addColumn('push', 'wishlist', {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  })
  // 修改state字段和play一样
  await table.update({
    state: true
  }, {
    where: {
      play: true
    }
  })
}

await PushTableUpdateColumn()

/**
 * 添加一个推送群
 * @param {string} userId
 * @param {string} steamId
 * @param {string} botId
 * @param {string} groupId
 * @param {{play: boolean, state: boolean, inventory: boolean, wishlist: boolean}} columns 开启推送的类型
 * @param {Transaction?} [transaction]
 * @returns {Promise<PushColumns>}
 */
export async function set (userId, steamId, botId, groupId, columns = {}, transaction) {
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
    return await table.update(columns, {
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
    ...columns
  }, { transaction }).then(result => result?.dataValues)
}

/**
 * 根据userId和groupId获取所有数据
 * @param {string} userId
 * @param {string} groupId
 * @returns {Promise<PushColumns[]>}
 */
export async function getAllByUserIdAndGroupId (userId, groupId) {
  if (!groupId) return []
  userId = String(userId)
  groupId = String(groupId)
  return await table.findAll({
    where: {
      userId,
      groupId
    }
  }).then(result => result.map(item => item?.dataValues))
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
 * @param {{play: boolean, state: boolean, inventory: boolean, wishlist: boolean}} where 查询条件
 * @param {boolean} [filter=true] 是否使用黑白名单查找 默认开启
 * @returns {Promise<PushColumns[]>}
 */
export async function getAll (columns = {
  play: true,
  state: true,
  inventory: false,
  wishlist: false
}, filter = true) {
  const where = {
  }
  if (Object.keys(columns).length) {
    where[Op.or] = columns
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
 * @param {{play: boolean, state: boolean, inventory: boolean, wishlist: boolean}} columns 查询条件
 * @returns {Promise<PushColumns[]>}
 */
export async function getAllByGroupId (groupId, columns = {
  play: true,
  state: true,
  inventory: false,
  wishlist: false
}) {
  groupId = String(groupId)
  const where = {
    groupId
  }
  if (Object.keys(columns).length) {
    where[Op.or] = columns
  }
  return await table.findAll({
    where
  }).then(result => result?.map(item => item?.dataValues))
}

/**
 * 根据userId列表获取对应的所有数据
 * @param {string[]} userList
 * @param {{play: boolean, state: boolean, inventory: boolean, wishlist: boolean}} columns 查询条件
 * @returns
 */
export async function getAllByUserIds (userList, columns = {
  play: true,
  state: true,
  inventory: false,
  wishlist: false
}) {
  const where = {
    userId: {
      [Op.in]: userList.map(String)
    }
  }
  if (Object.keys(columns).length) {
    where[Op.or] = columns
  }
  return await table.findAll({
    where
  }).then(result => result?.map(item => item?.dataValues))
}
