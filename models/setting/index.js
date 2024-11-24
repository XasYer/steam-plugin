import _ from 'lodash'

export const cfgSchema = {
  steam: {
    title: 'api设置',
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
      commonProxy: {
        title: '通用反代',
        key: '通用反代',
        type: 'string',
        def: '',
        desc: '通用反代 比如填写: https://example.com/{{url}} 则会替换 {{url}} 为实际请求的url'
      },
      apiProxy: {
        title: 'api反代',
        key: 'api反代',
        type: 'string',
        def: '',
        desc: '替换https://api.steampowered.com为自定义地址'
      },
      storeProxy: {
        title: 'store反代',
        key: 'store反代',
        type: 'string',
        def: '',
        desc: '替换https://store.steampowered.com为自定义地址'
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
        min: 0,
        max: 60,
        desc: '请求超时时间,单位秒',
        def: 5
      },
      renderScale: {
        title: '渲染精度',
        key: '渲染',
        type: 'number',
        min: 50,
        max: 200,
        def: 120,
        input: (n) => Math.min(200, Math.max(50, (n * 1 || 100))),
        desc: '可选值50~200，设置高精度会提高图片的精细度，但因图片较大可能会影响渲染与发送速度'
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
      blackGroupList: {
        title: '推送黑名单群',
        key: '推送黑名单',
        type: 'array',
        def: [],
        desc: '不推送黑名单群的状态'
      },
      whiteGroupList: {
        title: '推送白名单群',
        key: '推送白名单',
        type: 'array',
        def: [],
        desc: '只推送白名单群的状态'
      },
      time: {
        title: '推送间隔',
        key: '推送间隔',
        def: 5,
        min: 1,
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

export function getGuobasChemas () {
  const ret = []
  _.forEach(cfgSchema, (cfgGroup, fileName) => {
    if (fileName === 'setAll') {
      return
    }
    const item = []
    item.push({
      component: 'Divider',
      label: cfgGroup.title
    })
    _.forEach(cfgGroup.cfg, (cfgItem, cfgKey) => {
      item.push({
        field: `${fileName}.${cfgKey}`,
        label: cfgItem.title,
        bottomHelpMessage: cfgItem.desc,
        component: getComponent(cfgItem.type, cfgItem.component),
        componentProps: {
          ...cfgItem,
          input: undefined
        }
      })
    })
    ret.push(...item)
  })
  return ret
}

function getComponent (type, def) {
  const components = {
    string: 'Input',
    boolean: 'Switch',
    number: 'InputNumber',
    array: 'GSelectGroup'
  }
  return def || components[type]
}
