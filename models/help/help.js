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
    group: '需要绑定steamid或好友码后才能使用',
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
        icon: 34,
        title: '#steam(开启|关闭)推送',
        desc: '开启或关闭steam个人状态推送'
      }
    ]
  },
  {
    group: '个人相关功能 此功能大部分可at用户或加上steamId使用',
    list: [
      {
        icon: 11,
        title: '#steam状态',
        desc: '查看steam个人状态'
      },
      {
        icon: 52,
        title: '#steam玩什么',
        desc: '从自己的游戏库中roll几个游戏玩'
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
        icon: 43,
        title: '#steam成就',
        desc: '查看某个游戏的成就,需要加上appid'
      },
      {
        icon: 14,
        title: '#steam统计',
        desc: '查看某个游戏的统计,需要加上appid'
      }
    ]
  },
  {
    group: '群聊相关功能',
    list: [
      {
        icon: 49,
        title: '#steam推送列表',
        desc: '查看本群推送列表'
      },
      {
        icon: 50,
        title: '#群友在玩什么',
        desc: '看看群聊绑定了steamId的成员状态'
      },
      {
        icon: 65,
        title: '#steam群统计',
        desc: '查看本群的一些统计数据'
      }
    ]
  },
  {
    group: 'steam相关信息',
    list: [
      {
        icon: 46,
        title: '#steam成就统计',
        desc: '查看游戏全球成就完成度,需要appid'
      },
      {
        icon: 48,
        title: '#steam在线人数',
        desc: '查看某个游戏的在线人数,需要appid'
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
      },
      {
        icon: 44,
        title: '#steam评论',
        desc: '查看某个游戏的热门评论,需要appid'
      },
      {
        icon: 45,
        title: '#steam最新评论',
        desc: '查看某个游戏的最新评论,需要appid'
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
        desc: '黑名单中的群不会推送'
      },
      {
        icon: 37,
        title: '#steam删除推送(黑|白)名单',
        desc: '若配置,则只会推送白名单中的群'
      },
      {
        icon: 42,
        title: '#steam推送(黑|白)名单列表',
        desc: '查看推送(黑|白)名单列表'
      },
      {
        icon: 49,
        title: '#steam添加推送bot(黑|白)名单',
        desc: '黑名单Bot中的账号不会进行推送'
      },
      {
        icon: 50,
        title: '#steam删除推送bot(黑|白)名单',
        desc: '只会推送白名单Bot中的账号'
      },
      {
        icon: 51,
        title: '#steam推送(黑|白)名单列表',
        desc: '查看推送bot(黑|白)名单列表'
      }
    ]
  }
]
