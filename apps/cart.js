import { App, Render } from '#components'
import { api, utils } from '#models'

const appInfo = {
  id: 'cart',
  name: '购物车操作'
}

const rule = {
  modify: {
    reg: App.getReg('([添增]加|[删移][除出])购物车\\s*(\\d*)'),
    cfg: {
      tips: true,
      accessToken: true,
      appid: true
    },
    fnc: async (e, { accessToken, steamId, appid }) => {
      // 获取用户的地区代码
      const country = await api.IUserAccountService.GetUserCountry(accessToken, steamId)
      if (!country) {
        return '获取地区代码失败...'
      }
      // 获取packageid
      const infos = await api.IStoreBrowseService.GetItems([{ bundleid: appid }, { appid }])
      const info = infos[appid]
      if (!info) {
        return `没有获取到${appid}的信息`
      }
      const modifyType = e.msg.includes('加') ? 'add' : 'del'
      if (info.is_free && modifyType === 'add') {
        return `${info.name}是免费游戏哦, 直接入库吧`
      }
      const appType = info.best_purchase_option.packageid ? 'packageid' : 'bundleid'
      const packageid = appType === 'packageid' ? info.best_purchase_option.packageid : info.best_purchase_option.bundleid
      // 先检查有没有在购物车中
      const cart = await api.IAccountCartService.GetCart(accessToken, country)
      const item = cart.line_items?.find(i => i[appType] === packageid)
      if (modifyType === 'del') {
        if (item) {
          const res = await api.IAccountCartService.RemoveItemFromCart(accessToken, item.line_item_id, country)
          if (!res.line_items?.some(i => i[appType] === packageid)) {
            return `删除${info.name}成功~`
          } else {
            return `删除${info.name}失败...`
          }
        } else {
          return `${info.name}没有在购物车中~`
        }
      } else {
        if (!item) {
          // 加入购物车
          const res = await api.IAccountCartService.AddItemsToCart(accessToken, { [appType]: packageid }, country)
          if (res.cart.line_items?.some(i => i.packageid === packageid)) {
            return `已添加${info.name}到购物车~`
          } else {
            return `添加${info.name}到购物车失败...`
          }
        } else {
          return `${info.name}已经在购物车中~`
        }
      }
    }
  },
  look: {
    reg: App.getReg('(查看|清空)购物车'),
    cfg: {
      accessToken: true
    },
    fnc: async (e, { accessToken, steamId }) => {
      const country = await api.IUserAccountService.GetUserCountry(accessToken, steamId)
      if (!country) {
        return '获取地区代码失败...'
      }
      if (e.msg.includes('清空')) {
        await api.IAccountCartService.DeleteCart(accessToken)
        return '已清空购物车~'
      } else {
        const cart = await api.IAccountCartService.GetCart(accessToken, country)
        if (!cart.line_items) {
          return '购物车为空~'
        }
        const ids = cart.line_items.map(i => {
          if (i.packageid) {
            return { packageid: i.packageid }
          } else if (i.bundleid) {
            return { bundleid: i.bundleid }
          } else {
            return {}
          }
        })
        const infos = await api.IStoreBrowseService.GetItems(ids, { include_assets: true })
        const games = cart.line_items.map(i => {
          const info = infos[i.packageid || i.bundleid]
          if (!info) {
            return {
              name: '未知项目',
              appid: i.packageid || i.bundleid,
              image: '',
              price: {
                original: i.price_when_added?.formatted_amount
              }
            }
          }
          const image = info.assets
          // eslint-disable-next-line no-template-curly-in-string
            ? utils.steam.getStaticUrl(info.assets.asset_url_format.replace('${FILENAME}', info.assets.header))
            : utils.steam.getHeaderImgUrlByAppid(info.appid)
          return {
            name: info.name,
            appid: info.appid || info.id,
            image,
            desc: i.packageid ? '游戏或DLC' : '捆绑包',
            price: {
              original: i.price_when_added.formatted_amount
            }
          }
        })
        const data = [{
          title: `${await utils.bot.getUserName(e.self_id, e.user_id, e.group_id)}购物车一共有${games.length}件商品`,
          desc: `一共 ${cart.subtotal.formatted_amount}`,
          games
        }]
        return await Render.render('inventory/index', { data })
      }
    }
  }
}

export const app = new App(appInfo, rule).create()
