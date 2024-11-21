export const helpCfg = {
  themeSet: false,
  title: 'steam帮助',
  subTitle: '',
  colCount: 3,
  colWidth: 265,
  theme: 'all',
  bgBlur: true
}
export const helpList = [
  {
    group: 'steam 信息 (可在指令后添加steamId或at用户使用)',
    list: [
      {
        icon: 9,
        title: '#steam绑定',
        desc: '绑定steamid或好友码'
      },
      {
        icon: 10,
        title: '#steam解除绑定',
        desc: '解除绑定steamid或好友码'
      },
      {
        icon: 11,
        title: '#steam状态',
        desc: '查看steam个人状态'
      },
      {
        icon: 33,
        title: '#steam开启推送',
        desc: '开启steam个人状态推送'
      },
      {
        icon: 34,
        title: '#steam关闭推送',
        desc: '关闭steam个人状态推送'
      },
      {
        icon: 12,
        title: '#steam库存',
        desc: '查看steam库存'
      },
      {
        icon: 13,
        title: '#steam最近游玩',
        desc: '查看steam最近游玩'
      },
      {
        icon: 14,
        title: '#steam愿望单',
        desc: '查看steam愿望单'
      },
      {
        icon: 31,
        title: '#steam搜索',
        desc: '搜索steam游戏'
      },
      {
        icon: 32,
        title: '#steam特惠',
        desc: '查看steam热销游戏'
      }
    ]
  },
  {
    group: '主人功能',
    auth: 'master',
    list: [
      {
        icon: 36,
        title: '#steam添加推送(黑|白)名单',
        desc: '添加指定群到推送(黑|白)名单'
      },
      {
        icon: 37,
        title: '#steam删除推送(黑|白)名单',
        desc: '删除指定群的推送(黑|白)名单'
      },
      {
        icon: 42,
        title: '#steam推送(黑|白)名单列表',
        desc: '查看推送(黑|白)名单列表'
      }
    ]
  }
]
