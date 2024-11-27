import YAML from 'yaml'
import fs from 'node:fs'
import { logger } from '#lib'
import chokidar from 'chokidar'
import Version from './Version.js'
import YamlReader from './YamlReader.js'
import { task } from '#models'

class Config {
  constructor () {
    this.config = {}
    /** 监听文件 */
    this.watcher = { config: {}, defSet: {} }

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
                if (!Array.isArray(defValue[key]) && !ignore.includes(`${file.replace('.yaml', '')}.${key}`)) {
                  defValue[key] = merge(defValue[key], value[key], key + '.')
                  break
                }
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
  }

  /**
   * 获取steam配置
   * @returns {{
   *  apiKey: string,
   *  proxy: string,
   *  timeout: number,
   *  commonProxy: string,
   *  apiProxy: string,
   *  storeProxy: string
   * }}
   */
  get steam () {
    return this.getDefOrConfig('steam')
  }

  /**
   * 获取推送配置
   * @returns {{
   *  enable: boolean,
   *  stateChange: boolean,
   *  pushMode: number,
   *  time: number,
   *  defaultPush: boolean,
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
   *  hiddenLength: number,
   *  itemLength: number,
   *  steamAvatar: boolean,
   * }}
   */
  get other () {
    return this.getDefOrConfig('other')
  }

  /** 默认配置和用户配置 */
  getDefOrConfig (name) {
    const def = this.getdefSet(name)
    const config = this.getConfig(name)
    return { ...def, ...config }
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
   * @param type 默认跑配置-defSet，用户配置-config
   * @param name 名称
   */
  getYaml (type, name) {
    const file = `${Version.pluginPath}/config/${type}/${name}.yaml`
    const key = `${type}.${name}`

    if (this.config[key]) return this.config[key]

    this.config[key] = YAML.parse(
      fs.readFileSync(file, 'utf8')
    )

    this.watch(file, name, type)

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
  watch (file, name, type = 'default_config') {
    const key = `${type}.${name}`
    if (this.watcher[key]) return

    const watcher = chokidar.watch(file)
    watcher.on('change', async path => {
      delete this.config[key]
      logger.mark(`[${Version.pluginName}][修改配置文件][${type}][${name}]`)
      if (type === 'config' && name === 'push') {
        task.startTimer()
      }
    })

    this.watcher[key] = watcher
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
