import _ from 'lodash'

export const cfgSchema = {
  steam: {
    title: 'API设置',
    cfg: {
      apiKey: {
        title: 'Steam Web API Key',
        key: 'apiKey',
        type: 'array',
        def: [],
        desc: 'Steamworks Web API key',
        component: 'GTags'
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
      communityProxy: {
        title: '社区反代',
        key: '社区反代',
        type: 'string',
        def: '',
        desc: '替换https://steamcommunity.com/为自定义地址'
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
  other: {
    title: '其他设置',
    cfg: {
      renderType: {
        title: '渲染图片方式',
        key: '图片',
        type: 'number',
        def: 1,
        min: 1,
        max: 2,
        input: (n) => Math.max(1, n * 1 || 2),
        component: 'RadioGroup',
        options: [
          { label: 'puppeteer', value: 1 },
          { label: 'canvas', value: 2 }
        ],
        desc: '生成图片方式 1: puppeteer 2: canvas (暂时只支持游戏列表)'
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
        desc: '群统计数据数量 (由steam-plugin统计)'
      },
      infoMode: {
        title: 'steam状态发送模式',
        key: '状态模式',
        type: 'number',
        def: 2,
        min: 1,
        max: 3,
        input: (n) => {
          if (n >= 1 && n <= 3) {
            return n * 1
          } else {
            return 2
          }
        },
        component: 'RadioGroup',
        options: [
          { label: '文字', value: 1 },
          { label: '仿steam风格图片', value: 2 },
          { label: 'steam风格图片(需要社区反代)', value: 3 }
        ],
        desc: 'steam状态发送消息的模式 1: 文字 2: 仿steam风格图片 3: steam风格图片(需要社区反代)'
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
        desc: '数值越小优先级越高, 可以为负数, 重启后生效'
      },
      requireHashTag: {
        title: '必须携带#',
        key: '指令匹配',
        type: 'boolean',
        def: false,
        desc: '是否必须携带#指令才能触发对应功能, 重启后生效'
      },
      watchFile: {
        title: '监听文件变化',
        key: '监听文件',
        type: 'boolean',
        def: true,
        desc: '如果不监听文件变化则每次改动和设置都需要重启后才会生效'
      },
      countryCode: {
        title: '地区代码',
        key: '地区代码',
        type: 'string',
        def: 'CN',
        desc: '设置默认地区代码,有些游戏有锁区,影响搜索,排行榜,价格格式等,常用:CN中国 US美国'
      }
    }
  },
  gif: {
    title: '渲染GIF',
    cfg: {
      gifMode: {
        title: '渲染gif模式',
        key: 'gif模式',
        type: 'number',
        def: 1,
        min: 1,
        max: 2,
        input: (n) => {
          if (n >= 1 && n <= 3) {
            return n * 1
          } else {
            return 1
          }
        },
        component: 'RadioGroup',
        options: [
          { label: '截图合成', value: 1 },
          { label: '视频合成', value: 2 },
          { label: 'canvas合成', value: 3 }
        ],
        desc: '1: 多张截图合成一张gif 2: 视频转换gif 3: canvas多次截图(不会使用下面的配置)'
      },
      frameRate: {
        title: 'gif帧率',
        key: 'gif帧率',
        type: 'number',
        def: 24,
        min: 1,
        input: (n) => Math.max(1, n * 1 || 24),
        desc: 'gif的帧率'
      },
      frameCount: {
        title: '截图数量',
        key: 'gif数量',
        type: 'number',
        def: 30,
        min: 1,
        input: (n) => Math.max(1, n * 1 || 30),
        desc: '多少张图片合成一张gif, 图片越多渲染时间越长'
      },
      frameSleep: {
        title: '每张截图间隔',
        key: 'gif间隔',
        type: 'number',
        def: 50,
        min: 1,
        input: (n) => Math.max(1, n * 1 || 50),
        desc: '每张截图间隔多少毫秒'
      },
      videoLimit: {
        title: '录制视频的长度',
        key: 'gif长度',
        type: 'number',
        def: 3,
        min: 1,
        input: (n) => Math.max(1, n * 1 || 3),
        desc: '视频合成模式下, 视频的长度, 单位秒'
      },
      infoGif: {
        title: 'steam状态发送gif',
        key: '状态gif',
        type: 'boolean',
        def: false,
        desc: '是否将#steam状态发送为gif图片,谨慎开启! 会短时间内截图多次, 可能导致服务器压力过大'
      }
    }
  },
  push: {
    title: '推送设置',
    cfg: {
      enable: {
        title: '游玩推送总开关',
        key: '推送',
        type: 'boolean',
        def: true,
        desc: '是否开启推送功能'
      },
      playStart: {
        title: '游戏开始推送',
        key: '开始',
        type: 'boolean',
        def: true,
        desc: '是否推送开始游戏'
      },
      playEnd: {
        title: '游戏结束推送',
        key: '结束',
        type: 'boolean',
        def: true,
        desc: '是否推送结束游戏'
      },
      stateChange: {
        title: '状态改变推送总开关',
        key: '状态推送',
        type: 'boolean',
        def: true,
        desc: '是否推送游戏状态改变'
      },
      stateOnline: {
        title: '上线推送',
        key: '上线',
        type: 'boolean',
        def: true,
        desc: '是否推送上线'
      },
      stateOffline: {
        title: '下线推送',
        key: '下线',
        type: 'boolean',
        def: true,
        desc: '是否推送下线'
      },
      defaultPush: {
        title: '默认开启推送',
        key: '默认推送',
        type: 'boolean',
        def: true,
        desc: '是否默认开启推送, 绑定steamId后自动开启游玩推送和状态'
      },
      time: {
        title: '推送间隔',
        key: '推送间隔',
        def: 5,
        min: 1,
        type: 'string',
        desc: '游玩和状态推送间隔 可以是cron 也可以是数字 单位分钟'
      },
      familyInventotyAdd: {
        title: '家庭库存增加推送',
        key: '家庭库存推送',
        type: 'boolean',
        def: false,
        desc: '是否推送家庭库存增加,需要先扫码登录 不能批量查询'
      },
      familyInventotyTime: {
        title: '家庭库存推送间隔',
        key: '家庭库存间隔',
        type: 'string',
        def: '0 0 12 * * ?',
        desc: '家庭库存推送时间间隔 可以是cron 也可以是数字 单位分钟'
      },
      priceChange: {
        title: '游戏降价推送',
        key: '降价推送',
        type: 'number',
        def: 0,
        desc: '是否开启降价推送 0关闭 1绑定acceseToken可添加 2所有人可添加',
        input: (n) => {
          if (n >= 0 && n <= 2) {
            return n * 1
          } else {
            return 0
          }
        },
        component: 'RadioGroup',
        options: [
          { label: '关闭', value: 0 },
          { label: '绑定acceseToken可添加', value: 1 },
          { label: '所有人可添加', value: 2 }
        ]
      },
      priceChangeType: {
        title: '游戏降价推送模式',
        key: '降价推送模式',
        type: 'number',
        def: 1,
        desc: '降价推送模式 1: 仅降价期间第一次查询推送 2: 每次检查都推送',
        input: (n) => {
          if (n >= 1 && n <= 2) {
            return n * 1
          } else {
            return 1
          }
        },
        component: 'RadioGroup',
        options: [
          { label: '仅降价期间第一次查询推送', value: 1 },
          { label: '每次检查都推送', value: 2 }
        ]
      },
      priceChangeTime: {
        title: '游戏降价推送间隔',
        key: '降价推送间隔',
        type: 'string',
        def: '0 5 12 * * ?',
        desc: '库存推送时间间隔 可以是cron 也可以是数字 单位分钟'
      },
      userInventoryChange: {
        title: '库存变化推送',
        key: '库存推送',
        type: 'number',
        def: 0,
        desc: '是否开启库存推送 0关闭 1绑定acceseToken可开启 2所有人可开启 不能批量查询',
        input: (n) => {
          if (n >= 0 && n <= 2) {
            return n * 1
          } else {
            return 0
          }
        },
        component: 'RadioGroup',
        options: [
          { label: '关闭', value: 0 },
          { label: '绑定acceseToken可开启', value: 1 },
          { label: '所有人可开启', value: 2 }
        ]
      },
      userInventoryTime: {
        title: '库存推送间隔',
        key: '库存间隔',
        type: 'string',
        def: '0 0 12 * * ?',
        desc: '库存推送时间间隔 可以是cron 也可以是数字 单位分钟'
      },
      userWishlistChange: {
        title: '愿望单变化推送',
        key: '愿望单推送',
        type: 'number',
        def: false,
        desc: '是否开启愿望单推送 0关闭 1绑定acceseToken可开启 2所有人可开启 不能批量查询',
        input: (n) => {
          if (n >= 0 && n <= 2) {
            return n * 1
          } else {
            return 0
          }
        },
        component: 'RadioGroup',
        options: [
          { label: '关闭', value: 0 },
          { label: '绑定acceseToken可开启', value: 1 },
          { label: '所有人可开启', value: 2 }
        ]
      },
      userWishlistTime: {
        title: '愿望单推送间隔',
        key: '愿望单间隔',
        type: 'string',
        def: '0 0 12 * * ?',
        desc: '愿望单推送时间间隔 可以是cron 也可以是数字 单位分钟'
      },
      pushApi: {
        title: '推送请求api',
        key: '推送api',
        type: 'number',
        def: 2,
        min: 1,
        max: 4,
        input: (n) => {
          if (n >= 1 && n <= 4) {
            return n * 1
          } else {
            return 2
          }
        },
        component: 'RadioGroup',
        options: [
          { label: '需要access_token', value: 1 },
          { label: '默认 可能会出现429', value: 2 },
          { label: '需要请求两个接口', value: 3 },
          { label: '随机', value: 4 }
        ],
        desc: '推送消息的api 请查看default_config/push.yaml的注释'
      },
      pushMode: {
        title: '推送模式',
        key: '推送模式',
        type: 'number',
        def: 1,
        component: 'RadioGroup',
        options: [
          { label: '文字推送', value: 1 },
          { label: '图片推送', value: 2 },
          { label: 'steam风格图片', value: 3 }
        ],
        input: (n) => {
          if (n >= 1 && n <= 3) {
            return n * 1
          } else {
            return 1
          }
        },
        desc: '推送模式 1: 文字推送 2: 图片推送 3: steam风格图片'
      },
      randomBot: {
        title: '随机推送Bot',
        key: '随机Bot',
        type: 'boolean',
        def: false,
        desc: '有多个Bot在同一群群时随机选择一个在线的Bot推送状态 (仅限TRSS)'
      },
      statusFilterGroup: {
        title: '统计过滤黑白名单',
        key: '统计过滤群',
        type: 'boolean',
        def: true,
        desc: '群统计是否过滤掉黑名单群和白名单群 关闭则每次都会获取所有群的状态'
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
      label: cfgGroup.title,
      component: 'SOFT_GROUP_BEGIN'
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
