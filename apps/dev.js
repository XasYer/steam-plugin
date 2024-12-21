import { App } from '#components'
import { api, db, utils } from '#models'

const appInfo = {
  id: 'dev',
  name: '接口测试'
}

const rule = {
  dev: {
    reg: App.getReg('dev\\s*(.*)'),
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
          '参数可使用{steamid}占位符，表示当前绑定的SteamID',
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
        await e.reply('没有绑定steamId')
        return true
      }
      const replaceParams = (text) => {
        if (Array.isArray(text)) {
          return text.map(replaceParams)
        } else {
          return text.replace(/{steamid}/ig, steamId)
        }
      }
      const params = args.map(replaceParams)
      const start = Date.now()
      const result = await method(...params)
      const end = Date.now()
      const time = end - start
      const msg = [
        `接口: ${interfaceName}.${methodName}(${methodParams.join(', ')})`,
        `参数: ${params.join(' ')}`,
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
  const reg = /\[.*?\]|\S+/g
  const matches = text.match(reg)

  return matches.map(match => {
    if (match.startsWith('[') && match.endsWith(']')) {
      return match.slice(1, -1).split(' ')
    }
    return match
  })
}

export const app = new App(appInfo, rule).create()
