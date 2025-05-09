import { Config } from '#components'
import { sequelize, DataTypes, Op } from './base.js'

/**
 * @typedef {Object} priceChangePushColumns
 * @property {number} id 表id
 * @property {string} appid appid
 * @property {string} botId 机器人id
 * @property {string} groupId 群组id
 * @property {number} lastTime 最后推送时间 unix时间戳
 */

export const table = sequelize.define('priceChangePush', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  appid: {
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
  lastTime: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  }
}, {
  freezeTableName: true
})

await table.sync()

/**
 * 添加一个推送群
 * @param {string} appid
 * @param {string} botId
 * @param {string} groupId
 * @param {import('sequelize').Transaction?} transaction
 * @returns {Promise<priceChangePushColumns>}
 */
export async function add (appid, botId, groupId, transaction) {
  appid = String(appid)
  botId = String(botId)
  groupId = String(groupId)
  // 判断是否存在
  const data = await table.findOne({
    where: {
      appid,
      botId,
      groupId
    }
  }).then(i => i?.dataValues)
  if (data) {
    return data
  }
  return await table.create({
    appid,
    botId,
    groupId
  }, { transaction }).then(result => result?.dataValues)
}

/**
 * 删除推送群
 * @param {string} appid
 * @param {string} botId
 * @param {string} groupId
 * @param {import('sequelize').Transaction?} [transaction]
 * @returns {Promise<number>}
 */
export async function del (appid, botId, groupId, transaction) {
  appid = String(appid)
  botId = String(botId)
  groupId = String(groupId)
  return await table.destroy({
    where: {
      appid,
      botId,
      groupId
    },
    transaction
  }).then(result => result?.[0])
}

/**
 * 更新最后推送时间
 * @param {string[]} appids
 * @param {number} lastTime
 * @returns {Promise<number>}
 */
export async function updateLastTime (appids, lastTime) {
  if (!Array.isArray(appids)) appids = [appids]
  if (!appids.length) {
    return 0
  }
  return await table.update({
    lastTime
  }, {
    where: {
      appid: {
        [Op.in]: appids.map(String)
      }
    }
  }).then(result => result?.[0])
}

/**
 * 获得一个群所有的开启推送列
 * @param {string} groupId
 * @returns {Promise<priceChangePushColumns[]>}
 */
export async function getOneGroup (groupId) {
  groupId = String(groupId)
  return await table.findAll({
    where: {
      groupId
    }
  }).then(result => result?.map(item => item?.dataValues))
}

/**
 * 获取所有推送群组
 * @param {boolean} [filter=true] 是否使用黑白名单查找 默认开启
 * @returns {Promise<priceChangePushColumns[]>}
 */
export async function getAll (filter = true) {
  const where = {}
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
