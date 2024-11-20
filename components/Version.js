import fs from 'fs'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'
import { join, dirname, basename } from 'path'

const __filename = fileURLToPath(import.meta.url)

const __dirname = dirname(__filename)

const BotPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'))

const pluginPath = join(__dirname, '..').replace(/\\/g, '/')

const pluginName = basename(pluginPath)

const pluginPackage = JSON.parse(fs.readFileSync(join(pluginPath, 'package.json'), 'utf8'))

const pluginVersion = pluginPackage.version

/**
 * @type {'Karin'|'Miao-Yunzai'|'Trss-Yunzai'|'Yunzai-Next'}
 */
const BotName = (() => {
  if (/^karin/i.test(pluginName)) {
    return 'Karin'
  } else if (BotPackage.dependencies.react) {
    exec(`rm -rf plugins/${pluginName}`)
    return 'Yunzai-Next'
  } else if (Array.isArray(global.Bot?.uin)) {
    return 'Trss-Yunzai'
  } else if (BotPackage.dependencies.sequelize) {
    return 'Miao-Yunzai'
  } else {
    throw new Error('还有人玩Yunzai-Bot??')
  }
})()

const BotVersion = BotPackage.version

const BotPath = join(pluginPath, '../..')

export default {
  BotName,
  BotPath,
  BotVersion,
  pluginName,
  pluginPath,
  pluginVersion
}
