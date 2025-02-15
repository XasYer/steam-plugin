export const helpList = [
  {
    group: '需要绑定steamid或好友码后才能使用',
    list: [
      {
        title: '#steam',
        desc: '查看已绑定的steamId'
      },
      {
        title: '#steam绑定',
        desc: '绑定steamid或好友码'
      },
      {
        title: '#steam解除绑定',
        desc: '解除绑定steamid或好友码'
      },
      {
        title: '#steam扫码登录',
        desc: 'steamapp扫码绑定access_token'
      }
    ]
  },
  {
    group: '个人相关功能 此功能大部分可at用户或加上steamId使用',
    list: [
      {
        title: '#steam状态',
        desc: '查看steam个人状态'
      },
      {
        title: '#steam玩什么',
        desc: '从自己的游戏库中roll几个游戏玩'
      },
      {
        title: '#steam库存',
        desc: '查看steam库存'
      },
      {
        title: '#steam最近游玩',
        desc: '查看steam最近游玩'
      },
      {
        title: '#steam愿望单',
        desc: '查看steam愿望单'
      },
      {
        title: '#steam成就',
        desc: '查看某个游戏的成就,需要加上appid'
      },
      {
        title: '#steam统计',
        desc: '查看某个游戏的统计,需要加上appid'
      },
      {
        title: '#steam开启游玩推送',
        desc: '开启steam个人游玩推送'
      },
      {
        title: '#steam关闭状态推送',
        desc: '可选:游玩|状态|库存|愿望单 推送'
      },
      {
        title: '#steam开启家庭库存推送',
        desc: '开启steam家庭库存新增推送'
      },
      {
        title: '#steam关闭家庭库存推送',
        desc: '关闭steam家庭库存新增推送'
      }
    ]
  },
  {
    group: '绑定accessToken可用功能',
    auth: 'accessToken',
    list: [
      {
        title: '#steam刷新ak',
        desc: '刷新access_token'
      },
      {
        title: '#steam我的ak',
        desc: '查看自己的access_token'
      },
      {
        title: '#steam删除ak',
        desc: '删除access_token'
      },
      {
        title: '#steam家庭库存',
        desc: '查看家庭库存'
      },
      {
        title: '#steam私密库存',
        desc: '查看私密库存'
      },
      {
        title: '#steam(添加|删除)私密游戏',
        desc: '添加或删除私密游戏, 需要appid'
      },
      {
        title: '#steam客户端信息',
        desc: '查看已登录的steam客户端信息'
      },
      {
        title: '#steam客户端游戏列表',
        desc: '查看客户端的游戏列表'
      },
      {
        title: '#steam客户端下载',
        desc: '在客户端上下载游戏, 需要appid'
      },
      {
        title: '#steam客户端(恢复|暂停)下载',
        desc: '恢复或暂停下载, 需要appid'
      },
      {
        title: '#steam客户端卸载',
        desc: '在客户端上卸载游戏, 需要appid'
      },
      {
        title: '#steam客户端启动',
        desc: '在客户端上启动游戏, 需要appid'
      },
      {
        title: '#steam入库',
        desc: '添加免费游戏入库, 需要appid'
      },
      {
        title: '#steam添加愿望单',
        desc: '添加游戏到愿望单, 需要appid'
      },
      {
        title: '#steam移除愿望单',
        desc: '从愿望单删除游戏, 需要appid'
      },
      {
        title: '#steam查看购物车',
        desc: '查看购物车'
      },
      {
        title: '#steam(添加|删除)购物车',
        desc: '添加或删除购物车项目, 需要appid'
      },
      {
        title: '#steam清空购物车',
        desc: '清空购物车'
      },
      {
        title: '#steam探索队列',
        desc: '查看探索队列'
      },
      {
        title: '#steam跳过探索队列',
        desc: '跳过探索队列, 需要appid, 或全部跳过'
      }
    ]
  },
  {
    group: '群聊相关功能',
    list: [
      {
        title: '#steam推送列表',
        desc: '查看本群推送列表'
      },
      {
        title: '#steam群友状态',
        desc: '看看群聊绑定了steamId的成员状态'
      },
      {
        title: '#steam群统计',
        desc: '查看本群的一些统计数据'
      }
    ]
  },
  {
    group: 'steam相关信息',
    list: [
      {
        title: '#steam游戏信息',
        desc: '查看游戏简单信息,需要appid'
      },
      {
        title: '#steam成就统计',
        desc: '查看游戏全球成就完成度,需要appid'
      },
      {
        title: '#steam在线人数',
        desc: '查看某个游戏的在线人数,需要appid'
      },
      {
        title: '#steam搜索',
        desc: '搜索steam游戏'
      },
      {
        title: '#steam特惠',
        desc: '查看steam热销游戏'
      },
      {
        title: '#steam评论',
        desc: '查看某个游戏的热门评论,需要appid'
      },
      {
        title: '#steam最新评论',
        desc: '查看某个游戏的最新评论,需要appid'
      },
      {
        title: '#steam年度回顾分享图片',
        desc: '查看steam回顾分享图片,可指定年份'
      },
      {
        title: '#steam当前热玩排行',
        desc: '查看steam当前游玩人数排行'
      },
      {
        title: '#steam每日热玩排行',
        desc: '查看steam每日玩家数排行'
      },
      {
        title: '#steam热门新品排行',
        desc: '查看steam每月热门新品排行'
      },
      {
        title: '#steam热销排行',
        desc: '查看steam本周热销排行'
      },
      {
        title: '#steam上周热销排行',
        desc: '查看steam上周热销排行'
      },
      {
        title: '#steam年度畅销排行',
        desc: '查看steam年度畅销排行,可指定年份'
      },
      {
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
        title: '#steam设置',
        desc: '设置steam相关功能'
      },
      {
        title: '#steam主动推送',
        desc: '主动触发推送流程'
      },
      {
        title: '#steam添加推送(黑|白)名单',
        desc: '黑名单中的群不会推送'
      },
      {
        title: '#steam删除推送(黑|白)名单',
        desc: '若配置,则只会推送白名单中的群'
      },
      {
        title: '#steam推送(黑|白)名单列表',
        desc: '查看推送(黑|白)名单列表'
      },
      {
        title: '#steam添加推送bot(黑|白)名单',
        desc: '黑名单Bot中的账号不会进行推送'
      },
      {
        title: '#steam删除推送bot(黑|白)名单',
        desc: '只会推送白名单Bot中的账号'
      },
      {
        title: '#steam推送(黑|白)名单列表',
        desc: '查看推送bot(黑|白)名单列表'
      }
    ]
  }
]
