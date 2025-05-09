import { sequelize, DataTypes } from './base.js'

/**
 * @typedef {Object} KVColumns
 * @property {string} key 键
 * @property {string} value 值
 */

export const table = sequelize.define('kv', {
  key: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  value: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  freezeTableName: true
})

/**
 * 查找
 * @param {string} key
 * @returns {Promise<string|null>} value
 */
export async function get (key) {
  return await table.findOne({
    where: {
      key
    }
  }).then(res => res?.dataValues)
}

/**
 * 插入或更新
 * @param {string} key
 * @param {string} value
 * @returns {Promise<KVColumns>}
 */
export async function set (key, value) {
  if (!key || !value) {
    throw new Error('更新数据时，key和value不能为空')
  }
  return await table.upsert({
    key,
    value
  }).then(res => res[0].dataValues)
}

/**
 * 删除
 * @param {string} key
 * @returns {Promise<number>}
 */
export async function del (key) {
  return await table.destroy({
    where: {
      key
    }
  })
}
