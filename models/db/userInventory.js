import { sequelize, DataTypes } from './base.js'

export const table = sequelize.define('userInventory', {
  steamId: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  appids: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  freezeTableName: true
})

await table.sync()

/**
 * 创建或更新用户库存
 * @param {string} steamId
 * @param {number[]} appids
 * @returns {Promise<{steamId: string, appids: number[]}>}
 */
export async function set (steamId, appids) {
  const [res] = await table.upsert({ steamId, appids })
  return res.dataValues
}

/**
 * 获取用户库存
 * @param {string} steamId
 * @returns {Promise<number[]|undefined>}
 */
export async function get (steamId) {
  return await table.findOne({ where: { steamId } }).then(res => res?.dataValues.appids)
}
