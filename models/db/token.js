import { utils } from '#models'
import { sequelize, DataTypes } from './base.js'

/**
 * @typedef {Object} TokenColumns
 * @property {number} id 表id
 * @property {string} userId 用户id
 * @property {string} steamId steamId
 * @property {string} accessToken accessToken
 * @property {string} refreshToken refreshToken
 * @property {string} cookie cookie
 * @property {number} accessTokenExpires accessToken过期时间 unix时间戳
 * @property {number} refreshTokenExpires refreshToken过期时间 unix时间戳
 */

const TokenTable = sequelize.define('token', {
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
  accessToken: {
    type: DataTypes.STRING
  },
  refreshToken: {
    type: DataTypes.STRING
  },
  cookie: {
    type: DataTypes.STRING
  },
  accessTokenExpires: {
    type: DataTypes.BIGINT
  },
  refreshTokenExpires: {
    type: DataTypes.BIGINT
  }
}, {
  freezeTableName: true
})

await TokenTable.sync()

/**
 * 添加steamId到userId
 * @param {string} userId
 * @param {string} accessToken
 * @param {string?} refreshToken
 * @param {string?} cookie
 * @returns {Promise<TokenColumns|null>}
 */
export async function TokenTableAddData (userId, accessToken, refreshToken = '', cookie = '') {
  userId = String(userId)

  const jwt = utils.steam.decodeAccessTokenJwt(accessToken)

  if (!jwt) {
    throw new Error('accessToken 解码失败')
  }

  const baseData = { userId, steamId: jwt.sub }

  const extraData = {
    accessToken,
    accessTokenExpires: jwt.exp || 0,
    refreshTokenExpires: jwt.rt_exp || 0
  }
  if (refreshToken) {
    extraData.refreshToken = refreshToken
  }
  if (cookie) {
    extraData.cookie = cookie
  }

  const existingRecord = await TokenTable.findOne({
    where: baseData
  })

  if (existingRecord) {
    return await existingRecord.update(extraData).then(res => res.dataValues)
  } else {
    const newRecord = {
      ...baseData,
      ...extraData
    }

    return await TokenTable.create(newRecord).then(res => res.dataValues)
  }
}

/**
 * 查询accessToken
 * @param {string} userId
 * @param {string} steamId
 * @returns {Promise<TokenColumns|null>}
 */
export async function TokenTableGetByUserIdAndSteamId (userId, steamId) {
  userId = String(userId)
  steamId = String(steamId)
  return await TokenTable.findOne({
    where: {
      userId,
      steamId
    }
  }).then(res => res?.dataValues)
}

/**
 * 删除accessToken
 * @param {string} userId
 * @param {string} steamId
 * @returns
 */
export async function TokenTableDeleteByUserIdAndSteamId (userId, steamId) {
  userId = String(userId)
  steamId = String(steamId)
  return await TokenTable.destroy({
    where: {
      userId,
      steamId
    }
  })
}
