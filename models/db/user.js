import { PushTableDelAllDataBySteamId } from './push.js'
import { sequelize, DataTypes } from './base.js'
import { StatsTableDelete } from './stats.js'

/**
 * @typedef {Object} UserColumns
 * @property {number} id 表id
 * @property {string} userId 用户id
 * @property {string} steamId steamId
 * @property {boolean} isBind 是否绑定
 */

const UserTable = sequelize.define('user', {
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
    unique: true,
    allowNull: false
  },
  isBind: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  freezeTableName: true
})

await UserTable.sync()

/**
 * 添加steamId到userId
 * @param {string} userId
 * @param {string} steamId
 * @returns {Promise<UserColumns|null>}
 */
export async function UserTableAddSteamIdByUserId (userId, steamId) {
  userId = String(userId)
  const res = await UserTable.create({
    userId,
    steamId
  }).then(result => result?.dataValues)
  // 更换绑定为新的steamId
  await UserTableBindSteamIdByUserId(userId, steamId, true)
  return res
}

/**
 * 切换userId绑定的steamId
 * @param {string} userId
 * @param {string} steamId
 * @param {boolean} isBind 是否绑定
 */
export async function UserTableBindSteamIdByUserId (userId, steamId, isBind = true) {
  userId = String(userId)
  // 开启一个事务
  const transaction = await sequelize.transaction()
  try {
    if (isBind) {
      // 先将之前绑定的steamId解除绑定
      const data = await UserTableGetDataByUserId(userId)
      const bind = data.find(item => item.isBind)
      if (bind) {
        await UserTable.update({
          isBind: false
        }, {
          transaction,
          where: {
            userId: bind.userId,
            steamId: bind.steamId
          }
        })
      }
    }
    const res = await UserTable.update({
      isBind
    }, {
      transaction,
      where: {
        userId,
        steamId
      }
    })
    transaction.commit()
    return res
  } catch (error) {
    transaction.rollback()
    throw error
  }
}

/**
 * 删除userId的steamId
 * @param {string} userId
 * @param {string} steamId
 * @returns {Promise<UserColumns|null>}
 */
export async function UserTableDelSteamIdByUserId (userId, steamId) {
  userId = String(userId)
  const transaction = await sequelize.transaction()
  const data = await UserTableGetDataByUserId(userId)
  try {
    // 如果删除的是绑定的steamId，则将其他steamId设为绑定
    const bind = data.find(item => item.isBind)
    if (bind.steamId === steamId) {
      const notBindItem = data.find(item => !item.isBind)
      if (notBindItem) {
        await UserTable.update({
          isBind: true
        }, {
          where: {
            userId,
            steamId: notBindItem.steamId
          },
          transaction
        })
      }
    }
    const res = await UserTable.destroy({
      where: {
        userId,
        steamId
      },
      transaction
    })
    // 删除steamId对应的所有推送数据
    await PushTableDelAllDataBySteamId(steamId, transaction)
    await StatsTableDelete(steamId, transaction)
    transaction.commit()
    return res
  } catch (error) {
    transaction.rollback()
    throw error
  }
}

/**
 * 获取userId绑定的steamId
 * @param {string} userId
 * @returns {Promise<string|null>}
 */
export async function UserTableGetBindSteamIdByUserId (userId) {
  userId = String(userId)
  return await UserTable.findOne({
    where: {
      userId,
      isBind: true
    }
  }).then(result => result?.steamId)
}

/**
 * 根据steamId获取数据
 * @param {string} steamId
 * @returns {Promise<UserColumns|null>}
 */
export async function UserTableGetDataBySteamId (steamId) {
  return await UserTable.findOne({
    where: {
      steamId
    }
  }).then(result => result?.dataValues)
}

/**
 * 根据userId获取所有对应的数据
 * @param {string} userId
 * @returns {Promise<UserColumns[]>}
 */
export async function UserTableGetDataByUserId (userId) {
  userId = String(userId)
  return await UserTable.findAll({
    where: {
      userId
    }
  }).then(result => result?.map(i => i.dataValues))
}

/**
 * 获取所有steamId以及对应的userId
 * @returns {Promise<UserColumns[]>}
 */
export async function UserTableGetAllSteamIdAndUserId () {
  return await UserTable.findAll().then(result => result?.map(i => i.dataValues))
}
