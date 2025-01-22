import _ from 'lodash'
import { sequelize, DataTypes, Op } from './base.js'

/**
 * @typedef {Object} GameColumns
 * @property {string} appid appid
 * @property {string} name 游戏名称
 * @property {string} community 社区icon
 * @property {string} header header图片
 */

export const table = sequelize.define('game', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  appid: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  community: {
    type: DataTypes.STRING,
    defaultValue: false
  },
  header: {
    type: DataTypes.STRING,
    defaultValue: false
  }
}, {
  freezeTableName: true
})

await table.sync()

/**
 * 添加游戏信息
 * @param {GameColumns[]} games
 */
export async function add (games) {
  if (!Array.isArray(games)) {
    if (typeof games === 'object') {
      games = Object.values(games)
    } else {
      games = [games]
    }
  }
  return (await table.bulkCreate(games.map(i => ({ ...i, appid: String(i.appid) })))).map(i => i.dataValues)
}

/**
 * 查询游戏信息
 * @param {string[]} appids
 * @returns {Promise<{[appid: string]: GameColumns}>}
 */
export async function get (appids) {
  if (!Array.isArray(appids)) appids = [appids]
  return await table.findAll({
    where: {
      appid: {
        [Op.in]: appids.map(String)
      }
    }
  }).then(res => res.map(i => i.dataValues)).then(i => _.keyBy(i, 'appid'))
}
