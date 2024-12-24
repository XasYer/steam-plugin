import { App, Config, Render } from '#components'
import lodash from 'lodash'
import { setting } from '#models'

const keys = lodash.chain(setting.getCfgSchemaMap())
  .map(i => i.key)
  .sortBy(str => -str.length)
  .value()

const appInfo = {
  id: 'setting',
  name: '设置'
}

const rule = {
  setting: {
    reg: App.getReg(`设置\\s*(${keys.join('|')})?[\\s+]*(.*)`),
    fnc: async e => {
      if (!e.isMaster) {
        await e.reply('只有主人才可以设置哦~')
        return true
      }
      const regRet = rule.setting.reg.exec(e.msg)
      const cfgSchemaMap = setting.getCfgSchemaMap()
      if (!regRet) {
        return true
      }

      if (regRet[1]) {
        // 设置模式
        let val = regRet[2] || ''

        if (/apiKey/i.test(regRet[1])) {
          e.msg = e.msg.replace('设置', '添加')
          return false
        }

        const key = (() => {
          if (/随机Bot/i.test(regRet[1])) {
            return '随机Bot'
          } else {
            return regRet[1]
          }
        })()

        if (key == '全部') {
          val = !/关闭/.test(val)
          for (const i of keys) {
            if (typeof cfgSchemaMap[i].def == 'boolean') {
              if (cfgSchemaMap[i].key == '全部') {
                await redis.set('steam-plugin:set-all', val ? 1 : 0)
              } else {
                Config.modify(cfgSchemaMap[i].fileName, cfgSchemaMap[i].cfgKey, val)
              }
            }
          }
        } else {
          const cfgSchema = cfgSchemaMap[key]
          if (cfgSchema.type !== 'array') {
            if (cfgSchema.input) {
              val = cfgSchema.input(val)
            } else if (cfgSchema.type === 'number') {
              val = val * 1 || cfgSchema.def
            } else if (cfgSchema.type === 'boolean') {
              val = !/关闭/.test(val)
            } else if (cfgSchema.type === 'string') {
              val = val.trim() || cfgSchema.def
            }
            Config.modify(cfgSchema.fileName, cfgSchema.cfgKey, val)
          }
        }
      }

      const schema = setting.cfgSchema
      const cfg = Config.getCfg()
      cfg.setAll = (await redis.get('steam-plugin:set-all')) == 1

      const img = await Render.render('setting/index', {
        schema,
        cfg
      }, { e, scale: 1.4 })
      if (img) {
        await e.reply(img)
      } else {
        await e.reply('截图失败辣! 再试一次叭')
      }
      return true
    }
  },
  push: {
    reg: App.getReg('(添加|删除)?(?:推送((?:bot)?[黑白])名单|apikey)(列表)?[\\s+]*(.*)'),
    fnc: async e => {
      if (!e.isMaster) {
        await e.reply('只有主人才可以设置哦~')
        return true
      }
      const regRet = rule.push.reg.exec(e.msg)
      if (/推送/.test(e.msg)) {
        const isBot = /bot/i.test(e.msg)
        const target = regRet[2].includes('黑')
          ? isBot ? 'blackBotList' : 'blackGroupList'
          : isBot ? 'whiteBotList' : 'whiteGroupList'
        const data = Config.push[target]
        if (regRet[3] || !regRet[1]) {
          await e.reply(`${regRet[2]}名单列表:\n${data.join('\n') || '空'}`)
          return true
        }
        const type = regRet[1] === '添加' ? 'add' : 'del'
        const id = regRet[4]?.trim() || (isBot ? String(e.self_id) : String(e.group_id))
        if (!id) {
          await e.reply('请输入群号或在指定群中使用~')
          return true
        }
        if (type === 'add') {
          if (data.some(i => i == id)) {
            await e.reply(`${id}已经在${regRet[2]}名单中了~`)
          } else {
            data.push(id)
            await e.reply(`已将${id}添加到${regRet[2]}名单了~现在的${regRet[2]}名单是:\n${data.join('\n') || '空'}`)
            Config.modify('push', target, data)
          }
        } else {
          const index = data.findIndex(i => i == id)
          if (index === -1) {
            await e.reply(`${id}不在${regRet[2]}名单中~`)
          } else {
            data.splice(index, 1)
            await e.reply(`已将${id}移出${regRet[2]}名单了~现在的${regRet[2]}名单是:\n${data.join('\n') || '空'}`)
            Config.modify('push', target, data)
          }
        }
      } else {
        const data = Config.steam.apiKey
        if (regRet[3] || !regRet[1]) {
          if (e.group_id) {
            await e.reply('请私聊查看apikey列表~')
          } else {
            await e.reply(`apiKey列表:\n${data.join('\n') || '空'}`)
          }
          return true
        }
        const type = regRet[1] === '添加' ? 'add' : 'del'
        const id = regRet[4]?.trim()
        if (!id) {
          await e.reply('请输入apiKey~')
          return true
        }
        if (type === 'add') {
          if (data.some(i => i == id)) {
            await e.reply(`${id}已经在列表中了~`)
          } else {
            data.push(id)
            await e.reply(`已将${id}添加到apikey列表了~现在的apikey列表是:\n${data.join('\n') || '空'}`)
            Config.modify('steam', 'apiKey', data)
          }
        } else {
          const index = data.findIndex(i => i == id)
          if (index === -1) {
            await e.reply(`${id}不在apikey列表中~`)
          } else {
            data.splice(index, 1)
            await e.reply(`已将${id}移出apikey列表了~现在的apikey列表是:\n${data.join('\n') || '空'}`)
            Config.modify('steam', 'apiKey', data)
          }
        }
      }
      return true
    }
  }
}

export const app = new App(appInfo, rule).create()
