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
      },
      timeout: {
        title: '请求超时时间',
        key: '超时',
        type: 'number',
        input: (n) => {
          if (n > 0) {
            return n * 1
          } else {
            return 5
          }
        },
        desc: '请求超时时间,单位秒',
        def: 5
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
        def: true,
        desc: '是否开启推送功能'
      },
      defaultPush: {
        title: '默认开启推送',
        key: '默认推送',
        type: 'boolean',
        def: true,
        desc: '是否默认开启推送, 绑定steamId后自动开启推送'
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
