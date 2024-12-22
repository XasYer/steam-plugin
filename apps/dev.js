import { App, Config } from '#components'
import { api, db, utils } from '#models'

const appInfo = {
  id: 'dev',
  name: '接口测试'
}

const rule = {
  dev: {
    reg: App.getReg('dev\\s*(.*)'),
    cfg: {
      tips: true
    },
    fnc: async e => {
      const keys = Object.keys(api)
      const text = rule.dev.reg.exec(e.msg)[1]
      if (!text) {
        const methods = keys.map((interfaceName, interfaceIndex) => {
          return Object.keys(api[interfaceName]).map((methodName, methodIndex) => {
            return `${interfaceIndex}.${methodIndex} ${interfaceName}.${methodName}(${getParams(api[interfaceName][methodName]).join(', ')})`
          }).join('\n\n')
        })
        const msg = [
          '使用方法: ',
          '#steamdev 接口名.方法名 参数1 参数2...',
          '带s的参数为数组',
          '参数可使用{steamid}和{accesstoken}占位符，表示当前绑定的SteamID和AccessToken',
          '接口名和方法名可使用数字索引，例如: 0.0 1.1 2.2',
          '可使用的接口名和方法名如下:',
          ...methods
        ]
        await utils.makeForwardMsg(e, msg)
        return true
      }
      const [cmd, ...args] = split(text)
      const [interfaceKey, methodKey] = cmd.split('.')
      const interfaceName = keys[interfaceKey] || interfaceKey
      const methods = Object.keys(api[interfaceName])
      const methodName = methods[methodKey] || methodKey
      const method = api[interfaceName][methodName]
      const methodParams = getParams(method)
      const uid = utils.getAtUid(e.at, e.user_id)
      const steamId = await db.UserTableGetBindSteamIdByUserId(uid)
      if (!steamId) {
        await e.reply([segment.at(uid), '\n', Config.tips.noSteamIdTips])
        return true
      }
      const accessToken = await db.TokenTableGetByUserIdAndSteamId(uid, steamId)
      if (!accessToken?.accessToken && /{access_?token}/i.test(e.msg)) {
        await e.reply([segment.at(uid), '\n', '没有绑定accessToken'])
        return true
      }
      const replaceParams = (text) => {
        if (Array.isArray(text)) {
          return text.map(replaceParams)
        } else if (typeof text === 'object') {
          for (const key in text) {
            text[key] = replaceParams(text[key])
          }
          return text
        } else {
          return text.replace(/{steamid}/ig, steamId).replace(/{access_?token}/ig, accessToken.accessToken)
        }
      }
      const params = args.map(replaceParams)
      const start = Date.now()
      const result = await method(...params)
      const end = Date.now()
      const time = end - start
      const msg = [
        `接口: ${interfaceName}.${methodName}(${methodParams.join(', ')})`,
        `参数: ${params.map(i => i.length > 17 ? i.replace(/^(.{5})(.*)(.{5})$/, '$1...$3') : i).join(' ')}`,
        `耗时: ${time}ms`,
        '结果: ',
        JSON.stringify(result, null, 2) ?? 'undefined'
      ]
      await utils.makeForwardMsg(e, msg)
      return true
    }
  }
}

function getParams (fn) {
  const fnStr = fn.toString().split('\n')[0]
  const params = fnStr.match(/\((.*)\)/)[1]
  return params.split(',').map(param => param.trim()).filter(Boolean)
}

function split (text) {
  const reg = /\[.*?\]|\{.*?\}|\S+/g
  const matches = text.match(reg)

  return matches.map(match => {
    if (match.startsWith('[') && match.endsWith(']')) {
      return match.slice(1, -1).split(' ')
    } else if (match.startsWith('{') && match.endsWith('}')) {
      const obj = {}
      const entries = match.slice(1, -1).split(',')
      entries.forEach(entry => {
        const [key, value] = entry.split(':').map(str => str.trim())
        obj[key] = value
      })
      return obj
    }
    return match
  })
}

export const app = new App(appInfo, rule).create()
