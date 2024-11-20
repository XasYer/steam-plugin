import fs from 'fs'
import { join } from 'path'
import { Version } from '#components'
import { Sequelize, DataTypes, Op } from 'sequelize'

const dataPath = join(Version.pluginPath, 'data')
if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath)
}

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: join(dataPath, 'data.db'),
  logging: false
})

await sequelize.authenticate()

export {
  Op,
  DataTypes,
  sequelize
}
