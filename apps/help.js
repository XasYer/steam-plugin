import _ from 'lodash'
import { redis } from '#lib'
import { help as helpUtil } from '#models'
import { App, Render, Version } from '#components'
import moment from 'moment'

const appInfo = {
  id: 'help',
  name: '帮助'
}

const rule = {
  help: {
    reg: App.getReg('(插件|plugin)?(帮助|菜单|help)'),
    fnc: help
  },
  apiStats: {
    reg: App.getReg('api(调用)?统计'),
    fnc: async e => {
      const data = []
      for (let i = 0; i >= -1; i--) {
        const now = moment().add(i, 'days').format('YYYY-MM-DD')
        const apis = []
        let cursor = 0
        do {
          const res = await redis.scan(cursor, { MATCH: `steam-plugin:api:${now}:*`, COUNT: 10000 })
          cursor = res.cursor
          for (const key of res.keys) {
            const v = Number(await redis.get(key))
            apis.push({ name: key.split(':').pop(), v })
          }
        } while (cursor != 0)
        if (apis.length) {
          const total = _.sumBy(apis, 'v')
          data.push({
            title: `${now} api调用统计`,
            desc: `共${total}次`,
            games: _.orderBy(apis, 'v', 'desc').map(i => {
              const percent = (i.v / total * 100).toFixed(0) + '%'
              return {
                name: i.name,
                appid: percent,
                appidStyle: `style="background-color: #999999; width: ${percent};"`,
                desc: `${i.v}次`,
                noImg: true
              }
            })
          })
        }
      }
      if (!data.length) {
        await e.reply('还没有api调用统计数据哦')
        return true
      }
      const img = await Render.render('inventory/index', { data })
      await e.reply(img)
      return true
    }
  }
  // version: {
  //   reg: /^#?steam(插件|plugin)?(版本|version)$/i,
  //   fnc: version
  // }
}

async function help (e) {
  const helpGroup = []

  _.forEach(helpUtil.helpList, (group) => {
    if (group.auth && group.auth === 'master' && !e.isMaster) {
      return true
    }

    _.forEach(group.list, (help) => {
      const icon = help.icon * 1
      if (!icon) {
        help.css = 'display:none'
      } else {
        const x = (icon - 1) % 10
        const y = (icon - x - 1) / 10
        help.css = `background-position:-${x * 50}px -${y * 50}px`
      }
    })

    helpGroup.push(group)
  })
  const themeData = await helpUtil.helpTheme.getThemeData(helpUtil.helpCfg)
  const img = await Render.render('help/index', {
    helpCfg: helpUtil.helpCfg,
    helpGroup,
    ...themeData,
    scale: 1.4
  })
  await e.reply(img)
  return true
}

// eslint-disable-next-line no-unused-vars
async function version (e) {
  const img = await Render.render('help/version-info', {
    currentVersion: Version.version,
    changelogs: Version.changelogs,
    scale: 1.2
  })
  return await e.reply(img)
}

export const app = new App(appInfo, rule).create()
