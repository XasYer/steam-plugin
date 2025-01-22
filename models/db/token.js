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

const table = sequelize.define('token', {
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

await table.sync()

/**
 * 添加accessToken到userId
 * @param {string} userId
 * @param {string} accessToken
 * @param {string?} refreshToken
 * @param {string?} cookie
 * @returns {Promise<TokenColumns|null>}
 */
export async function set (userId, accessToken, cookie = '', refreshToken = '') {
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

  const existingRecord = await table.findOne({
    where: baseData
  })

  if (existingRecord) {
    return await existingRecord.update(extraData).then(res => res.dataValues)
  } else {
    const newRecord = {
      ...baseData,
      ...extraData
    }

    return await table.create(newRecord).then(res => res.dataValues)
  }
}

/**
 * 查询accessToken
 * @param {string} userId
 * @param {string} steamId
 * @returns {Promise<TokenColumns|null>}
 */
export async function getByUserIdAndSteamId (userId, steamId) {
  userId = String(userId)
  steamId = String(steamId)
  return await table.findOne({
    where: {
      userId,
      steamId
    }
  }).then(res => res?.dataValues)
}

/**
 * 根据userId查询所有信息
 * @param {string} userId
 * @returns {Promise<TokenColumns[]|null>}
 */
export async function getAllByUserId (userId) {
  userId = String(userId)
  return await table.findAll({
    where: {
      userId
    }
  }).then(res => res.map(item => item.dataValues))
}

/**
 * 删除accessToken
 * @param {string} userId
 * @param {string} steamId
 * @returns
 */
export async function del (userId, steamId) {
  userId = String(userId)
  steamId = String(steamId)
  return await table.destroy({
    where: {
      userId,
      steamId
    }
  })
}

/**
 * 查询所有accessToken
 * @returns {Promise<TokenColumns[]>}
 */
export async function getAll () {
  return await table.findAll().then(res => res.map(item => item.dataValues))
}

/**
 * 获得绑定的accessToken数量
 * @returns {Promise<number>}
 */
export async function count () {
  return await table.count()
}
