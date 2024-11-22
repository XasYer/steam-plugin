import lodash from 'lodash'
import { Config } from '#components'
import { setting } from '#models'

export function supportGuoba () {
  return {
    pluginInfo: {
      name: 'steam-plugin',
      title: 'steam-plugin',
      author: '@小叶',
      authorLink: 'https://github.com/XasYer',
      link: 'https://github.com/XasYer/steam-plugin',
      isV3: true,
      isV2: false,
      description: '提供 steam 相关功能',
      icon: 'mdi:steam'
    },
    configInfo: {
      schemas: setting.getGuobasChemas(),
      getConfigData () {
        const data = {}
        for (const file of Config.files) {
          const name = file.replace('.yaml', '')
          data[name] = Config.getDefOrConfig(name)
        }
        return data
      },
      setConfigData (data, { Result }) {
        const config = Config.getCfg()

        for (const key in data) {
          const split = key.split('.')
          if (lodash.isEqual(config[split[1]], data[key])) continue
          Config.modify(split[0], split[1], data[key])
        }
        return Result.ok({}, '𝑪𝒊𝒂𝒍𝒍𝒐～(∠・ω< )⌒★')
      }
    }
  }
}
