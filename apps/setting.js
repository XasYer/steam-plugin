import { App, Config, Render } from '#components'
import lodash from 'lodash'
import { setting } from '#models'

const keys = lodash.map(setting.getCfgSchemaMap(), (i) => i.key)

const app = {
  id: 'setting',
  name: '设置'
}

export const rule = {
  setting: {
    reg: new RegExp(`^#steam设置\\s*(${keys.join('|')})?\\s*(.*)$`),
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

        if (regRet[1] == '全部') {
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
          const cfgSchema = cfgSchemaMap[regRet[1]]
          if (cfgSchema.input) {
            val = cfgSchema.input(val)
          } else {
            if (cfgSchema.type === 'number') {
              val = val * 1 || cfgSchema.def
            } else if (cfgSchema.type === 'boolean') {
              val = !/关闭/.test(val)
            } else if (cfgSchema.type === 'string') {
              val = val.trim() || cfgSchema.def
            }
          }
          Config.modify(cfgSchema.fileName, cfgSchema.cfgKey, val)
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
    reg: /^#steam(添加|删除)?推送(黑|白)名单(列表)?\s*(.*)?$/,
    fnc: async e => {
      if (!e.isMaster) {
        await e.reply('只有主人才可以设置哦~')
        return true
      }
      const regRet = rule.push.reg.exec(e.msg)
      const target = regRet[2] === '黑' ? 'blackGroupList' : 'whiteGroupList'
      const data = Config.push[target]
      if (regRet[3] || !regRet[1]) {
        await e.reply(`${regRet[2]}名单列表:\n ${data.join(', ') || '空'}`)
        return true
      }
      const type = regRet[1] === '添加' ? 'add' : 'del'
      const id = regRet[3] || String(e.group_id)
      if (!id) {
        await e.reply('请输入群号或在指定群中使用~')
        return true
      }
      if (type === 'add') {
        if (data.some(i => i.id == id)) {
          await e.reply(`${id}已经在${regRet[2]}名单中了~`)
        } else {
          data.push(id)
          await e.reply(`已将${id}${regRet[1]}到${regRet[2]}名单了~现在的${regRet[2]}名单是:\n ${data.join(', ') || '空'}`)
          Config.modify('push', target, data)
        }
      }
      return true
    }
  }
}

export const settingApp = new App(app, rule).create()
