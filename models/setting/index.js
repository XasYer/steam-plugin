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
      stateChange: {
        title: '状态改变推送',
        key: '状态推送',
        type: 'boolean',
        def: true,
        desc: '是否推送游戏状态改变 比如上线 下线等'
      },
      pushMode: {
        title: '推送模式',
        key: '推送模式',
        type: 'number',
        def: 1,
        component: 'RadioGroup',
        options: [
          { label: '文字推送', value: 1 },
          { label: '图片推送', value: 2 }
        ],
        input: (n) => {
          if (n >= 1 && n <= 2) {
            return n * 1
          } else {
            return 1
          }
        },
        desc: '推送模式 1: 文字推送 2: 图片推送'
      },
      randomBot: {
        title: '随机推送Bot',
        key: '随机Bot',
        type: 'boolean',
        def: false,
        desc: '有多个Bot在同一群群时随机选择一个在线的Bot推送状态 (仅限TRSS)'
      },
      blackBotList: {
        title: '推送黑名单机器人',
        key: '推送bot黑名单',
        type: 'array',
        def: [],
        desc: '黑名单中的Bot账号不会开启推送',
        component: 'GTags'
      },
      whiteBotList: {
        title: '推送白名单机器人',
        key: '推送bot白名单',
        type: 'array',
        def: [],
        desc: '只推送白名单Bot账号的状态',
        component: 'GTags'
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
  other: {
    title: '其他设置',
    cfg: {
      renderScale: {
        title: '渲染精度',
        key: '渲染',
        type: 'number',
        min: 50,
        max: 200,
        def: 120,
        input: (n) => Math.min(200, Math.max(50, (n * 1 || 100))),
        desc: '可选值50~200，设置高精度会提高图片的精细度，但因图片较大可能会影响渲染与发送速度'
      },
      hiddenLength: {
        title: '隐藏长度',
        key: '隐藏',
        type: 'number',
        min: 1,
        def: 99,
        input: (n) => Math.max(1, n * 1 || 99),
        desc: '比如库存等超过设置的长度后会隐藏剩余的游戏, 避免太多而导致截图失败'
      },
      itemLength: {
        title: '每行最多显示数量',
        key: '每行个数',
        type: 'number',
        min: 1,
        def: 3,
        input: (n) => Math.max(1, n * 1 || 3),
        desc: '截图时每行最多显示的数量'
      },
      steamAvatar: {
        title: '展示steam头像',
        key: '展示头像',
        type: 'boolean',
        def: true,
        desc: '是否展示steam头像, 可能会有18+头像'
      },
      rollGameCount: {
        title: '游戏推荐数量',
        key: '推荐数量',
        type: 'number',
        min: 1,
        def: 3,
        input: (n) => Math.max(1, n * 1 || 99),
        desc: 'roll游戏推荐的游戏数量'
      },
      statsCount: {
        title: '统计数据数量',
        key: '统计数量',
        type: 'number',
        min: 1,
        def: 10,
        input: (n) => Math.max(1, n * 1 || 10),
        desc: '统计数据数量 (由steam-plugin统计)'
      },
      infoMode: {
        title: 'steam状态发送模式',
        key: '状态模式',
        type: 'number',
        def: 2,
        min: 1,
        max: 2,
        input: (n) => {
          if (n >= 1 && n <= 2) {
            return n * 1
          } else {
            return 2
          }
        },
        desc: 'steam状态发送消息的模式 1: 文字 2: 图片 若图片发送时间长可更换为文字'
      },
      log: {
        title: '日志输出',
        key: '日志',
        type: 'boolean',
        def: true,
        desc: '是否输出日志'
      },
      priority: {
        title: '插件优先级',
        key: '优先级',
        type: 'number',
        def: 5,
        input: (n) => Number(n) || 5,
        desc: '数值越小优先级越高'
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
