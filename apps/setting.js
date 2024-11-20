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
  }
}

export const settingPlugin = new App(app, rule).create()
