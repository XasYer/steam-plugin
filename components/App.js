import lodash from 'lodash'
import Version from './Version.js'
import { plugin, logger } from '#lib'
import Config from './Config.js'

const throttle = {}

export default class App {
  constructor ({
    id,
    name,
    dsc,
    event = 'message',
    priority = Number(Config.other.priority) || 5
  }, rule) {
    this.id = id
    this.name = name
    this.dsc = dsc || name
    this.event = event
    this.priority = priority
    this.apps = []
    this.rule(rule)
  }

  static getReg (text = '') {
    return new RegExp(`^#${Config.other.requireHashTag ? '' : '?'}steam${text}$`, 'i')
  }

  static reply (e, msg, options = { recallMsg: 0, quote: false, at: false }) {
    if (Version.BotName === 'Karin') {
      return e.reply(msg, { recallMsg: options.recallMsg, at: options.at, reply: options.quote }).catch(() => {})
    } else {
      return e.reply(msg, options.quote, { at: options.at }).then(res => {
        if (options.recallMsg) {
          setTimeout(() => {
            if (e.group?.recallMsg) {
              e.group.recallMsg(res.message_id)?.catch?.(() => {})
            } else if (e.friend?.recallMsg) {
              e.friend.recallMsg(res.message_id)?.catch?.(() => {})
            }
          }, options.recallMsg * 1000)
        }
      }).catch(() => {})
    }
  }

  rule (name, reg, fnc, cfg = {}) {
    if (!name) return false
    if (lodash.isPlainObject(name)) {
      lodash.forEach(name, (p, k) => {
        this.rule(k, p.reg, p.fnc, p.cfg)
      })
    } else {
      this.apps.push({ name, reg, fnc, cfg })
    }
  }

  create () {
    const { name, dsc, event, priority } = this
    const rule = []
    const cls = class extends plugin {
      constructor () {
        super({
          name: `[${Version.pluginName}]` + name,
          dsc: dsc || name,
          event,
          priority,
          rule
        })
      }
    }

    for (const { name, reg, fnc, cfg } of this.apps) {
      rule.push({
        reg,
        fnc: name,
        ...cfg
      })
      cls.prototype[name] = async (e) => {
        if (!Config.steam.apiKey.length && !/帮助|设置|添加|删除/.test(e.msg)) {
          await e.reply('没有配置apiKey不能调用Steam Web API哦\n先到https://steamcommunity.com/dev/apikey 申请一下apiKey\n然后使用 #steam添加apiKey + 申请到的apiKey\n之后再使用吧')
          return true
        }
        const key = `${name}:${e.user_id}`
        if (throttle[key]) {
          App.reply(e, Config.tips.repeatTips, { recallMsg: 5, at: true })
          return true
        } else {
          throttle[key] = setTimeout(() => {
            delete throttle[key]
          }, 1000 * 60)
        }
        if (cfg.tips) {
          App.reply(e, Config.tips.loadingTips, { recallMsg: 5, at: true })
        }
        const res = await fnc(e).catch(error => {
          if (error.isAxiosError) {
            logger.error(error.message)
          } else {
            logger.error(error)
          }
          let message = error.message
          const keyMap = [
            { key: 'apiProxy', title: 'api反代' },
            { key: 'storeProxy', title: 'store反代' },
            { key: 'commonProxy', title: '通用反代' }
          ]
          for (const i of keyMap) {
            const url = Config.steam[i.key]
            if (url && error.message) {
              try {
                const { host } = new URL(url)
                message = message.replace(host, `${i.title}地址`)
              } catch (error) { }
            }
          }
          e.reply(`出错辣! ${message}`).catch(() => {})
          return true
        })
        clearTimeout(throttle[key])
        delete throttle[key]
        return res ?? true
      }
    }
    return cls
  }
}
