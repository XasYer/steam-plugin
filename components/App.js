import lodash from 'lodash'
import Version from './Version.js'
import { plugin, logger } from '#lib'
import Config from './Config.js'
import { db, utils } from '#models'

const throttle = {}

function clearThrottle (key) {
  if (throttle[key]) {
    clearTimeout(throttle[key])
    delete throttle[key]
  }
}

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

  static reply (e, msg, options = { recallMsg: 0, quote: false, at: true }) {
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

  rule (name, reg, fnc, cfg = {
    // 是否仅私聊触发
    private: false,
    // 是否发送触发提示
    tips: false,
    // 是否需要appid
    appid: false,
    // 是否需要steamId
    steamId: false,
    // 是否需要accessToken
    accessToken: false
  }) {
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
          await App.reply(e, '没有配置apiKey不能调用Steam Web API哦\n先到https://steamcommunity.com/dev/apikey 申请一下apiKey\n然后使用 #steam添加apiKey + 申请到的apiKey\n之后再使用吧', { at: false })
          return true
        }
        const key = `${name}:${e.user_id}`
        if (throttle[key]) {
          await App.reply(e, Config.tips.repeatTips, { recallMsg: 5, at: true })
          return true
        } else {
          throttle[key] = setTimeout(() => {
            delete throttle[key]
          }, 1000 * 60)
        }
        if (cfg.private && e.group_id) {
          await App.reply(e, Config.tips.groupUseTips)
          clearThrottle(key)
          return true
        }
        if (cfg.group && !e.group_id) {
          await App.reply(e, Config.tips.privateUseTips)
          clearThrottle(key)
          return true
        }
        if (cfg.tips) {
          App.reply(e, Config.tips.loadingTips, { recallMsg: 5, at: true })
        }
        const nums = e.msg.match(/\d+/g) || []
        const options = {
          uid: e.user_id
        }
        // 需要appid
        if (cfg.appid) {
          if (!nums.length) {
            await App.reply(e, Config.tips.noAppidTips)
            clearThrottle(key)
            return true
          } else {
            options.appid = nums.shift()
          }
        }
        // 需要steamId
        if (cfg.steamId) {
          options.userSteamIdList = await db.user.getAllByUserId(options.uid)
          options.uid = utils.bot.getAtUid(e.at, e.user_id)
          // 先看看有没有在指令中附带steamId
          if (nums.length) {
            // 最后一个
            const steamId = nums.pop()
            if (options.userSteamIdList[steamId - 1]) {
              options.steamId = options.userSteamIdList[steamId - 1].steamId
            } else {
              options.steamId = steamId
              options.uid = e.user_id
            }
          } else {
            options.steamId = options.userSteamIdList.find(i => i.isBind)?.steamId
            if (!options.steamId) {
              await App.reply(e, Config.tips.noSteamIdTips, { at: options.uid })
              clearThrottle(key)
              return true
            }
          }
          options.steamId = utils.steam.getSteamId(options.steamId)
          options.userSteamIdList = options.userSteamIdList.map(i => i.steamId)
        }
        // 需要accessToken
        if (cfg.accessToken) {
          const token = await utils.steam.getAccessToken(e.user_id)
          if (!token.success) {
            await App.reply(e, token.message)
            clearThrottle(key)
            return true
          }
          options.accessToken = token.accessToken
          options.cookie = token.cookie
          options.steamId = token.steamId
        }
        let res
        try {
          res = fnc(e, options)
          if (res instanceof Promise) {
            res = await res
          }
        } catch (error) {
          if (error.isAxiosError) {
            logger.error(error.message)
          } else {
            logger.error(error)
          }
          let message = error.message
          const keyMap = [
            { key: 'apiProxy', title: 'api反代' },
            { key: 'storeProxy', title: 'store反代' },
            { key: 'commonProxy', title: '通用反代' },
            { key: 'communityProxy', title: '社区反代' }
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
          App.reply(e, `出错辣! ${message}`, { quote: true })
          res = true
        }
        clearThrottle(key)
        if (typeof res == 'boolean') {
          return res
        } else if (res) {
          await App.reply(e, res, { at: res.type !== 'image' })
        }
        return true
      }
    }
    return cls
  }
}
