import { sequelize, DataTypes } from './base.js'

/**
 * @typedef {Object} HistoryColumns
 * @property {number} id
 * @property {string} userId 用户id
 * @property {string} groupId 群id
 * @property {string} botId 机器人id
 * @property {string} steamId steamId
 * @property {string} appid 游戏id 如果有appid就是玩游戏记录 没有就是上线记录
 * @property {string} name 游戏名称
 * @property {number} start 开始的时间戳
 * @property {number} end 结束的时间戳
 */
const HistoryTable = sequelize.define('history', {
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
    type: DataTypes.STRING
  },
  name: {
    type: DataTypes.STRING
  },
  start: {
    type: DataTypes.BIGINT
  },
  end: {
    type: DataTypes.BIGINT
  }
}, {
  freezeTableName: true
})

await HistoryTable.sync()

HistoryTable.findAll().then(res => {
  if (res.length) {
    // 在这之前统计的记录有误差 全部删除重新统计
    const time = 1734495420
    const data = res[0].dataValues
    if (data.start < time && data.end < time) {
      HistoryTable.truncate().catch(() => {})
    }
  }
}).catch(() => {})

/**
 * 添加一条记录
 * @param {string} userId
 * @param {string} groupId
 * @param {string} botId
 * @param {string} steamId
 * @param {number} start
 * @param {number?} end
 * @param {string?} appid
 * @param {string?} name
 */
export async function HistoryAdd (userId, groupId, botId, steamId, start, end, appid, name) {
  userId = String(userId)
  groupId = String(groupId)
  botId = String(botId)
  steamId = String(steamId)
  start = Number(start)
  if (end) {
    end = Number(end)
  }

  const baseData = { userId, groupId, botId, steamId, start }

  const existingRecord = await HistoryTable.findOne({
    where: baseData
  })

  if (existingRecord) {
    // 如果有记录，更新 end 字段
    if (end) {
      await existingRecord.update({ end })
    }
  } else {
    // 如果没有记录，创建新记录
    const newRecord = {
      ...baseData,
      end
    }

    if (appid) {
      Object.assign(newRecord, {
        appid: String(appid),
        name
      })
    }

    await HistoryTable.create(newRecord)
  }
}
