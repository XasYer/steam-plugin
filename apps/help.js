import _ from 'lodash'
import { help as helpUtil, utils } from '#models'
import { App, Render, Version } from '#components'

const appInfo = {
  id: 'help',
  name: '帮助'
}

const rule = {
  help: {
    reg: App.getReg('(插件|plugin)?(帮助|菜单|help)'),
    fnc: async e => {
      const helpGroup = []

      const token = await utils.steam.getAccessToken(e.user_id)
      _.forEach(helpUtil.helpList, (group) => {
        switch (group.auth) {
          case 'master':
            if (!e.isMaster) {
              return true
            }
            break
          case 'accessToken':
            if (!token.success) {
              return true
            }
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
      const themeData = await helpUtil.helpTheme.getThemeData({
        colCount: token.success ? 4 : 3,
        colWidth: 275
      })
      return await Render.render('help/index', {
        helpGroup,
        ...themeData,
        scale: 1.4
      })
    }
  }
  // version: {
  //   reg: /^#?steam(插件|plugin)?(版本|version)$/i,
  //   fnc: version
  // }
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
