export const helpList = [
  {
    group: '需要绑定steamid或好友码后才能使用',
    list: [
      {
        icon: 66,
        title: '#steam',
        desc: '查看已绑定的steamId'
      },
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
        title: '#steam开启推送',
        desc: '开启steam个人状态推送'
      },
      {
        icon: 67,
        title: '#steam关闭推送',
        desc: '关闭steam个人状态推送'
      },
      {
        icon: 91,
        title: '#steam扫码登录',
        desc: 'steamapp扫码绑定access_token'
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
    group: '绑定accessToken可用功能',
    auth: 'accessToken',
    list: [
      {
        icon: 92,
        title: '#steam刷新ak',
        desc: '刷新access_token'
      },
      {
        icon: 93,
        title: '#steam我的ak',
        desc: '查看自己的access_token'
      },
      {
        icon: 94,
        title: '#steam删除ak',
        desc: '删除access_token'
      },
      {
        icon: 95,
        title: '#steam家庭库存',
        desc: '查看家庭库存'
      },
      {
        icon: 96,
        title: '#steam私密库存',
        desc: '查看私密库存'
      },
      {
        icon: 97,
        title: '#steam(添加|删除)私密游戏',
        desc: '添加或删除私密游戏, 需要appid'
      },
      {
        icon: 98,
        title: '#steam客户端信息',
        desc: '查看已登录的steam客户端信息'
      },
      {
        icon: 99,
        title: '#steam客户端游戏列表',
        desc: '查看客户端的游戏列表'
      },
      {
        icon: 100,
        title: '#steam客户端下载',
        desc: '在客户端上下载游戏, 需要appid'
      },
      {
        icon: 102,
        title: '#steam客户端(恢复|暂停)下载',
        desc: '恢复或暂停下载, 需要appid'
      },
      {
        icon: 101,
        title: '#steam客户端卸载',
        desc: '在客户端上卸载游戏, 需要appid'
      },
      {
        icon: 103,
        title: '#steam客户端启动',
        desc: '在客户端上启动游戏, 需要appid'
      },
      {
        icon: 104,
        title: '#steam入库',
        desc: '添加免费游戏入库, 需要appid'
      },
      {
        icon: 105,
        title: '#steam添加愿望单',
        desc: '添加游戏到愿望单, 需要appid'
      },
      {
        icon: 106,
        title: '#steam移除愿望单',
        desc: '从愿望单删除游戏, 需要appid'
      },
      {
        icon: 110,
        title: '#steam查看购物车',
        desc: '查看购物车'
      },
      {
        icon: 114,
        title: '#steam(添加|删除)购物车',
        desc: '添加或删除购物车项目, 需要appid'
      },
      {
        icon: 115,
        title: '#steam清空购物车',
        desc: '清空购物车'
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
        title: '#steam群友状态',
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
      },
      {
        icon: 70,
        title: '#steam年度回顾分享图片',
        desc: '查看steam回顾分享图片,可指定年份'
      },
      {
        icon: 71,
        title: '#steam当前热玩排行',
        desc: '查看steam当前游玩人数排行'
      },
      {
        icon: 72,
        title: '#steam每日热玩排行',
        desc: '查看steam每日玩家数排行'
      },
      {
        icon: 79,
        title: '#steam热门新品排行',
        desc: '查看steam每月热门新品排行'
      },
      {
        icon: 87,
        title: '#steam热销排行',
        desc: '查看steam本周热销排行'
      },
      {
        icon: 90,
        title: '#steam上周热销排行',
        desc: '查看steam上周热销排行'
      },
      {
        icon: 107,
        title: '#steam年度畅销排行',
        desc: '查看steam年度畅销排行,可指定年份'
      },
      {
        icon: 109,
        title: '#steam年度新品排行',
        desc: '热玩|vr|抢先体验|deck|控制器'
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
