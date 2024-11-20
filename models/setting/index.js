import _ from 'lodash'

export const cfgSchema = {
  steam: {
    title: '核心设置',
    cfg: {
      apiKey: {
        title: 'Steam Web API Key',
        key: 'apiKey',
        type: 'string',
        def: '',
        desc: 'Steamworks Web API key'
      },
      proxy: {
        title: 'proxy代理',
        key: 'proxy',
        type: 'string',
        def: '',
        desc: '用于加速访问'
      }
    }
  },
  push: {
    title: '推送设置',
    cfg: {
      enable: {
        title: '推送总开关',
        key: '推送',
        type: 'boolean',
        def: false,
        desc: '是否开启推送功能'
      },
      time: {
        title: '推送间隔',
        key: '推送间隔',
        def: 5,
        type: 'number',
        input: (n) => {
          if (n >= 0) {
            return n * 1
          } else {
            return 5
          }
        },
        desc: '间隔多少分钟推送一次'
      }
    }
  },
  setAll: {
    title: '一键操作',
    cfg: {
      setAll: {
        title: '全部设置',
        key: '全部',
        type: 'boolean',
        def: false,
        desc: '一键 开启/关闭 全部设置项'
      }
    }
  }
}

export function getCfgSchemaMap () {
  const ret = {}
  _.forEach(cfgSchema, (cfgGroup, fileName) => {
    _.forEach(cfgGroup.cfg, (cfgItem, cfgKey) => {
      cfgItem.cfgKey = cfgKey
      cfgItem.fileName = fileName
      ret[cfgItem.key] = cfgItem
    })
  })
  return ret
}
