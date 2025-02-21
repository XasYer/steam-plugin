import { App } from '#components'
import { api } from '#models'
import _ from 'lodash'

const appInfo = {
  id: 'expend',
  name: '支出'
}

const rule = {
  total: {
    reg: App.getReg('总?(支出|消费|花费)'),
    cfg: {
      accessToken: true,
      tip: true
    },
    fnc: async (e, { cookie }) => {
      const html = await api.store.AjaxLoadMoreHistory(cookie)
      if (!html) {
        return '获取失败或消费为空'
      }
      let currency
      const data = html.replace(/[\n\t]/g, '').split('</tr>').filter(i => !/(退款|wht_refunded|钱包<)/.test(i)).map(i => {
        const reg = /<td\s*class="wht_total\s*">([\s\S]+?)<\/td>/
        const regRet = reg.exec(i)
        if (regRet) {
          const res = regRet[1].split(' ')
          currency = res[0]
          return parseFloat(res[1]) || 0
        }
        return 0
      })
      const total = _.sum(data)
      return `在steam消费了${currency} ${total.toFixed(2)}\n数据来源: 由 客服 -> 购买消费 -> 查看完整的购买记录 计算而来 仅供参考\n也可以前往 客服 -> 我的账户 -> 您 Steam 帐户的相关数据 -> 外部资金消费记录 查看 TotalSpend 的值`
    }
  }
}

export const app = new App(appInfo, rule).create()
