import lodash from 'lodash'
import { Config } from './components/index.js'

export function supportGuoba () {
  return {
    pluginInfo: {
      name: 'steam-plugin',
      title: 'steam-plugin',
      author: '@XasYer',
      authorLink: 'https://github.com/XasYer',
      link: 'https://github.com/XasYer/steam-plugin',
      isV3: true,
      isV2: false,
      description: '提供 steam 相关功能',
      icon: 'mdi:steam'
    },
    configInfo: {
      schemas: [
        {
          component: 'Divider',
          label: '插件设置'
        },
        {
          field: 'push.enable',
          label: '游玩推送',
          bottomHelpMessage: '是否开启游玩推送功能',
          component: 'Switch'
        },
        {
          field: 'push.time',
          label: '检查间隔',
          bottomHelpMessage: '每天对 Steam Web API 的调用次数限制为十万 (100,000) 次',
          component: 'InputNumber',
          componentProps: {
            placeholder: '请输入时间',
            addonAfter: '分钟'
          }
        },
        {
          field: 'push.defaultPush',
          label: '默认推送',
          bottomHelpMessage: '是否默认开启推送 即绑定steamId之后不需要发 #steam开启推送 指令',
          component: 'Switch'
        },
        {
          field: 'push.blackGroupList',
          label: '推送黑名单群',
          componentProps: {
            placeholder: '点击添加推送黑名单群'
          },
          component: 'GSelectGroup'
        },
        {
          field: 'push.whiteGroupList',
          label: '推送白名单群',
          componentProps: {
            placeholder: '点击添加推送白名单群'
          },
          component: 'GSelectGroup'
        },
        {
          field: 'steam.apiKey',
          label: 'ApiKey',
          bottomHelpMessage: '大部分功能都需要,申请地址 https://partner.steamgames.com/doc/webapi_overview/auth',
          component: 'Input',
          componentProps: {
            placeholder: 'Steam Web API的apiKey'
          }
        },
        {
          field: 'steam.proxy',
          label: '代理地址',
          bottomHelpMessage: '支持HTTP/SOCKS5协议,解决大部分用户无法连接Steam的问题',
          component: 'Input',
          componentProps: {
            placeholder: '支持HTTP/SOCKS5协议'
          }
        },
        {
          field: 'steam.timeout',
          label: '超时时间',
          bottomHelpMessage: 'Steam Web Api请求超时时间',
          component: 'InputNumber',
          componentProps: {
            placeholder: '请输入超时时间',
            addonAfter: '秒'
          }
        }
      ],
      getConfigData () {
        return {
          push: Config.getDefOrConfig('push'),
          steam: Config.getDefOrConfig('steam')
        }
      },
      setConfigData (data, { Result }) {
        let config = Config.getCfg()

        for (const key in data) {
          let split = key.split('.')
          if (lodash.isEqual(config[split[1]], data[key])) continue
          Config.modify(split[0], split[1], data[key])
        }
        return Result.ok({}, '𝑪𝒊𝒂𝒍𝒍𝒐～(∠・ω< )⌒★')
      }
    }
  }
}
