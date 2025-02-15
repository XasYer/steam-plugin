import YAML from 'yaml'
import fs from 'node:fs'
import { logger } from '#lib'
import { task } from '#models'
import Version from './Version.js'
import YamlReader from './YamlReader.js'
import { basename, dirname } from 'path'

const chokidar = await import('chokidar')

class Config {
  constructor () {
    this.config = {}
    this.watcher = this.other.watchFile
      ? new chokidar.FSWatcher({
        persistent: true,
        ignoreInitial: true,
        usePolling: true
      })
      : {
          add: () => {},
          on: () => {}
        }
    this.initCfg()
  }

  /** 初始化配置 */
  initCfg () {
    const path = `${Version.pluginPath}/config/config/`
    if (!fs.existsSync(path)) fs.mkdirSync(path)
    const pathDef = `${Version.pluginPath}/config/default_config/`
    const files = fs.readdirSync(pathDef).filter(file => file.endsWith('.yaml'))
    this.files = files
    const ignore = []
    for (const file of files) {
      if (!fs.existsSync(`${path}${file}`)) {
        fs.copyFileSync(`${pathDef}${file}`, `${path}${file}`)
      } else {
        const config = YAML.parse(fs.readFileSync(`${path}${file}`, 'utf8'))
        const defaultConfig = YAML.parse(fs.readFileSync(`${pathDef}${file}`, 'utf8'))
        let isChange = false
        const saveKeys = []
        const merge = (defValue, value, prefix = '') => {
          const defKeys = Object.keys(defValue)
          const configKeys = Object.keys(value || {})
          if (defKeys.length !== configKeys.length) {
            isChange = true
          }
          for (const key of defKeys) {
            switch (typeof defValue[key]) {
              case 'object':
                // 其他情况有了再说
                if (Array.isArray(defValue[key])) {
                  if (!Array.isArray(value[key])) {
                    isChange = true
                    defValue[key] = value[key] ? [value[key]] : defValue[key]
                  } else {
                    defValue[key] = value[key]
                  }
                  saveKeys.push(`${prefix}${key}`)
                } else if (!ignore.includes(`${file.replace('.yaml', '')}.${key}`)) {
                  defValue[key] = merge(defValue[key], value[key], key + '.')
                }
                break
              // eslint-disable-next-line no-fallthrough
              default:
                if (!configKeys.includes(key)) {
                  isChange = true
                } else {
                  defValue[key] = value[key]
                }
                saveKeys.push(`${prefix}${key}`)
            }
          }
          return defValue
        }
        const value = merge(defaultConfig, config)
        if (isChange) {
          fs.copyFileSync(`${pathDef}${file}`, `${path}${file}`)
          for (const key of saveKeys) {
            this.modify(file.replace('.yaml', ''), key, key.split('.').reduce((obj, key) => obj[key], value))
          }
        }
      }
      this.watch(`${path}${file}`, file.replace('.yaml', ''), 'config')
    }
    this.watcher.on('change', path => {
      const name = basename(path).replace('.yaml', '')
      const type = basename(dirname(path))
      const key = `${type}.${name}`
      delete this.config[key]
      logger.mark(`[${Version.pluginName}][修改配置文件][${type}][${name}]`)
      if (key === 'config.push') {
        task.startTask()
      }
    })
  }

  /**
   * 获取steam配置
   * @returns {{
   *  apiKey: string[],
   *  proxy: string,
   *  timeout: number,
   *  commonProxy: string,
   *  apiProxy: string,
   *  storeProxy: string
   *  communityProxy: string,
   * }}
   */
  get steam () {
    return this.getDefOrConfig('steam')
  }

  /**
   * 获取推送配置
   * @returns {{
   *  enable: boolean,
   *  playStart: boolean,
   *  playEnd: boolean,
   *  stateChange: boolean,
   *  stateOnline: boolean,
   *  stateOffline: boolean,
   *  familyInventotyAdd: boolean,
   *  familyInventotyTime: number|string
   *  userInventoryChange: number,
   *  userInventoryTime: number|string,
   *  userWishlistChange: number,
   *  userWishlistTime: number|string,
   *  pushApi: number,
   *  pushMode: number,
   *  time: number|string,
   *  defaultPush: boolean,
   *  randomBot: boolean,
   *  cacheName: boolean,
   *  statusFilterGroup: boolean,
   *  blackBotList: string[],
   *  whiteBotList: string[],
   *  blackGroupList: string[],
   *  whiteGroupList: string[]
   * }}
   */
  get push () {
    return this.getDefOrConfig('push')
  }

  /**
   * 获取其他配置
   * @returns {{
   *  renderScale: number,
   *  renderType: number,
   *  hiddenLength: number,
   *  itemLength: number,
   *  steamAvatar: boolean,
   *  infoMode: number,
   *  log: boolean,
   *  rollGameCount: number,
   *  statsCount: number,
   *  priority: number,
   *  requireHashTag: boolean,
   *  watchFile: boolean,
   * }}
   */
  get other () {
    return this.getDefOrConfig('other')
  }

  /**
   * 获取测试配置
   * @returns {{
   *   gifMode: number,
   *   frameCount: number,
   *   frameSleep: number,
   *   frameRate: number,
   *   videoLimit: number,
   *   infoGif: boolean,
   * }}
   */
  get gif () {
    return this.getDefOrConfig('gif')
  }

  /**
   * 获取提示配置
   * @returns {{
   *   repeatTips: string,
   *   loadingTips: string,
   *   noSteamIdTips: string,
   *   repeatBindTips: string,
   *   noAppidTips: string,
   *   inventoryEmptyTips: string,
   *   recentPlayEmptyTips: string,
   *   wishListEmptyTips: string,
   *   privateUseTips: string,
   *   groupUseTips: string,
   *   pushDisableTips: string,
   *   pushPermissionTips: string
   *   pushChangeTips: string
   *   blackGroupTips: string,
   *   noWhiteGroupTips: string,
   *   makeImageFailedTips: string,
   *   familyInventoryDisabledTips: string,
   * }}
   */
  get tips () {
    return this.getDefOrConfig('tips', true)
  }

  /** 默认配置和用户配置 */
  getDefOrConfig (name, repeatEmpty = false) {
    const def = this.getdefSet(name)
    const config = this.getConfig(name)
    if (repeatEmpty) {
      const res = {}
      for (const key of Object.keys(def)) {
        res[key] = ['boolean', 'number'].includes(typeof def[key])
          ? config[key]
          : config[key] || def[key]
      }
      return res
    } else {
      return { ...def, ...config }
    }
  }

  /** 默认配置 */
  getdefSet (name) {
    return this.getYaml('default_config', name)
  }

  /** 用户配置 */
  getConfig (name) {
    return this.getYaml('config', name)
  }

  /**
   * 获取配置yaml
   * @param {'config'|'default_config'} type
   * @param {String} name 文件名
   */
  getYaml (type, name) {
    const file = `${Version.pluginPath}/config/${type}/${name}.yaml`
    const key = `${type}.${name}`

    if (this.config[key]) return this.config[key]

    try {
      this.config[key] = YAML.parse(
        fs.readFileSync(file, 'utf8')
      )
    } catch (error) {
      this.config[key] = {}
    }

    return this.config[key]
  }

  /** 获取所有配置 */
  getCfg () {
    return {
      ...this.files.map(file => this.getDefOrConfig(file.replace('.yaml', ''))).reduce((obj, item) => {
        return { ...obj, ...item }
      }, {})
    }
  }

  /** 监听配置文件 */
  watch (file) {
    this.watcher.add(file)
  }

  /**
   * 修改设置
   * @param {String} name 文件名
   * @param {String} key 修改的key值
   * @param {String|Number} value 修改的value值
   * @param {'config'|'default_config'} type 配置文件或默认
   */
  modify (name, key, value, type = 'config') {
    const path = `${Version.pluginPath}/config/${type}/${name}.yaml`
    new YamlReader(path).set(key, value)
    delete this.config[`${type}.${name}`]
  }
}
export default new Config()
