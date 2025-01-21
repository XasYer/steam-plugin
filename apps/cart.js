import { App, Render } from '#components'
import { api, utils } from '#models'
import { segment } from '#lib'

const appInfo = {
  id: 'cart',
  name: '购物车操作'
}

const rule = {
  modify: {
    reg: App.getReg('([添增]加|[删移][除出]|清空|查看)购物车\\s*(\\d*)'),
    cfg: {
      tips: true
    },
    fnc: async e => {
      const token = await utils.steam.getAccessToken(e.user_id)
      if (!token.success) {
        await e.reply([segment.at(e.user_id), '\n', token.message])
        return true
      }
      // 获取用户的地区代码
      const country = await api.IUserAccountService.GetUserCountry(token.accessToken, token.steamId)
      if (!country) {
        await e.reply('获取地区代码失败...')
        return true
      }
      if (e.msg.includes('清空')) {
        await api.IAccountCartService.DeleteCart(token.accessToken)
        await e.reply('已清空购物车~')
        return true
      } else if (e.msg.includes('查看')) {
        const cart = await api.IAccountCartService.GetCart(token.accessToken, country)
        if (!cart.line_items) {
          await e.reply('购物车为空~')
          return true
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
        const img = await Render.render('inventory/index', { data })
        await e.reply(img)
        return true
      }
      const appid = rule.modify.reg.exec(e.msg)[2]
      if (!appid) {
        await e.reply('需要和appid一起发送')
        return true
      }
      // 获取packageid
      const infos = await api.IStoreBrowseService.GetItems([{ bundleid: appid }, { appid }])
      const info = infos[appid]
      if (!info) {
        await e.reply(`没有获取到${appid}的信息`)
        return true
      }
      const modifyType = e.msg.includes('加') ? 'add' : 'del'
      if (info.is_free && modifyType === 'add') {
        await e.reply(`${info.name}是免费游戏哦, 直接入库吧`)
        return true
      }
      const appType = info.best_purchase_option.packageid ? 'packageid' : 'bundleid'
      const packageid = appType === 'packageid' ? info.best_purchase_option.packageid : info.best_purchase_option.bundleid
      // 先检查有没有在购物车中
      const cart = await api.IAccountCartService.GetCart(token.accessToken, country)
      const item = cart.line_items?.find(i => i[appType] === packageid)
      if (modifyType === 'del') {
        if (item) {
          const res = await api.IAccountCartService.RemoveItemFromCart(token.accessToken, item.line_item_id, country)
          if (!res.line_items?.some(i => i[appType] === packageid)) {
            await e.reply(`删除${info.name}成功~`)
          } else {
            await e.reply(`删除${info.name}失败...`)
          }
        } else {
          await e.reply(`${info.name}没有在购物车中~`)
        }
      } else {
        if (!item) {
          // 加入购物车
          const res = await api.IAccountCartService.AddItemsToCart(token.accessToken, { [appType]: packageid }, country)
          if (res.cart.line_items?.some(i => i.packageid === packageid)) {
            await e.reply(`已添加${info.name}到购物车~`)
          } else {
            await e.reply(`添加${info.name}到购物车失败...`)
          }
        } else {
          await e.reply(`${info.name}已经在购物车中~`)
        }
      }
      return true
    }
  }
}

export const app = new App(appInfo, rule).create()
