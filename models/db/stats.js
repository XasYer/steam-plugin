import { sequelize, DataTypes, fn, col } from './base.js'

/**
 * @typedef {Object} GameStatsColumns
 * @property {number} id
 * @property {string} userId 用户id
 * @property {string} groupId 群id
 * @property {string} botId 机器人id
 * @property {string} steamId steamId
 * @property {string} appid 游戏id
 * @property {string} name 游戏名称
 * @property {number} playTotal 游玩总次数
 * @property {number} playTime 游玩总时间
 */
const GameStatsTable = sequelize.define('gameStats', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  groupId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  botId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  steamId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  appid: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  playTotal: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  playTime: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0
  }
}, {
  freezeTableName: true
})

/**
 * @typedef {Object} UserStatsColumns
 * @property {number} id
 * @property {string} userId 用户id
 * @property {string} groupId 群id
 * @property {string} botId 机器人id
 * @property {string} steamId steamId
 * @property {number} playTotal 游玩总次数
 * @property {number} playTime 游玩总时间 单位秒
 * @property {number} onlineTotal 上线总次数
 * @property {number} onlineTime 在线总时间 单位秒
 */
const UserStatsTable = sequelize.define('userStats', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  groupId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  botId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  steamId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  playTotal: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  playTime: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0
  },
  onlineTotal: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  onlineTime: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0
  }
}, {
  freezeTableName: true
})

await UserStatsTable.sync()
await GameStatsTable.sync()

/**
 * 更新游玩统计
 * @param {string} userId
 * @param {string} groupId
 * @param {string} botId
 * @param {string} steamId
 * @param {number} appid 游戏id
 * @param {string} name 游戏名称 仅第一次更新时使用
 * @param {'playTotal'|'playTime'|'onlineTotal'|'onlineTime'} field 更新的字段
 * @param {number} value 增加的值 默认1
 * @returns {Promise<boolean>}
 */
export async function StatsTableUpdate (userId, groupId, botId, steamId, appid, name, field, value = 1) {
  value = Number(value)
  if (!value) {
    return false
  }
  userId = String(userId)
  groupId = String(groupId)
  botId = String(botId)
  appid = String(appid)

  const transaction = await sequelize.transaction()
  try {
    // 更新用户统计表
    const [UserUpdateRows] = await UserStatsTable.update({
      [field]: sequelize.literal(`${field} + ${value}`)
    }, {
      where: {
        userId,
        groupId,
        botId,
        steamId
      },
      transaction
    })

    if (UserUpdateRows === 0) {
      const data = {
        userId,
        groupId,
        botId,
        steamId,
        playTotal: 0,
        playTime: 0,
        onlineTotal: 0,
        onlineTime: 0,
        [field]: value
      }
      if (field === 'onlineTime') {
        data.onlineTotal = 1
      } else if (field === 'playTime') {
        data.playTotal = 1
      }
      await UserStatsTable.create(data, { transaction })
    }

    if (['playTotal', 'playTime'].includes(field)) {
      // 更新游戏统计表
      const [GameUpdateRows] = await GameStatsTable.update({
        [field]: sequelize.literal(`${field} + ${value}`)
      }, {
        where: {
          userId,
          groupId,
          botId,
          steamId,
          appid
        },
        transaction
      })

      if (GameUpdateRows === 0) {
        const data = {
          userId,
          groupId,
          botId,
          steamId,
          appid,
          name,
          playTotal: 0,
          playTime: 0,
          [field]: value
        }
        if (field === 'playTime') {
          data.playTotal = 1
        }
        await GameStatsTable.create(data, { transaction })
      }
    }

    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw error
  }
  return true
}

/**
 * 删除steamId对应的统计数据
 * @param {string} steamId
 * @returns {Promise<boolean>}
 */
export async function StatsTableDelete (steamId, transaction) {
  const hasTransaction = !!transaction
  if (!hasTransaction) {
    transaction = await sequelize.transaction()
  }
  try {
    for (const Table of [UserStatsTable, GameStatsTable]) {
      await Table.destroy({
        where: {
          steamId
        },
        transaction
      })
    }
    !hasTransaction && await transaction.commit()
  } catch (error) {
    !hasTransaction && await transaction.rollback()
    throw error
  }
  return true
}

/**
 * 获取指定群的Topx: 游戏次数最多的x个游戏, 游戏时间最长的x个游戏, 上线次数最多的x个用户, 在线时间最长的x个用户, 总游戏次数最多的x个用户, 总游戏时间最长的x个用户
 * @param {string} groupId
 * @param {number} limit 获取的数量 默认10
 * @returns {Promise<{
 *   gamePlayTotal: Array<{ appid: string, name: string, steamId: string, playTotal: number }>,
 *   gamePlayTime: Array<{ appid: string, name: string, steamId: string, playTime: number }>,
 *   userOnlineTotal: Array<{ userId: string, botId: string, steamId: string, onlineTotal: number }>,
 *   userOnlineTime: Array<{ userId: string, botId: string, steamId: string, onlineTime: number }>,
 *   userPlayTotal: Array<{ userId: string, botId: string, steamId: string, playTotal: number }>,
 *   userPlayTime: Array<{ userId: string, botId: string, steamId: string, playTime: number }>
 * }>}
 */
export async function StatsTableGetByGroupId (groupId, limit = 10) {
  const where = { groupId: String(groupId) }
  const result = {
    gamePlayTotal: [],
    gamePlayTime: [],
    userOnlineTotal: [],
    userOnlineTime: [],
    userPlayTotal: [],
    userPlayTime: []
  }
  const keys = [
    { table: UserStatsTable, ret: 'userPlayTotal', key: 'playTotal', type: 'user' },
    { table: UserStatsTable, ret: 'userPlayTime', key: 'playTime', type: 'user' },
    { table: UserStatsTable, ret: 'userOnlineTotal', key: 'onlineTotal', type: 'user' },
    { table: UserStatsTable, ret: 'userOnlineTime', key: 'onlineTime', type: 'user' },
    { table: GameStatsTable, ret: 'gamePlayTotal', key: 'playTotal', type: 'game' },
    { table: GameStatsTable, ret: 'gamePlayTime', key: 'playTime', type: 'game' }
  ]
  for (const i of keys) {
    const options = {
      where,
      attributes: ['botId', 'steamId'],
      limit
    }
    if (i.type === 'game') {
      options.attributes.push('appid', 'name', [fn('SUM', col(i.key)), i.key])
      options.group = ['appid']
      options.order = [
        [fn('SUM', col(i.key)), 'DESC']
      ]
    } else {
      options.attributes.push(i.key, 'userId')
      options.order = [
        [i.key, 'DESC']
      ]
    }
    result[i.ret] = await i.table.findAll(options).then(rows => rows.map(row => row?.dataValues))
  }
  return result
}
