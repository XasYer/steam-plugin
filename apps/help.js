import { App, Render, Version } from '#components'
import lodash from 'lodash'
import { help as helpUtil } from '#models'

const appInfo = {
  id: 'help',
  name: '帮助'
}

const rule = {
  help: {
    reg: App.getReg('(插件|plugin)?(帮助|菜单|help)'),
    fnc: help
  }
  // version: {
  //   reg: /^#?steam(插件|plugin)?(版本|version)$/i,
  //   fnc: version
  // }
}

async function help (e) {
  const helpGroup = []

  lodash.forEach(helpUtil.helpList, (group) => {
    if (group.auth && group.auth === 'master' && !e.isMaster) {
      return true
    }

    lodash.forEach(group.list, (help) => {
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
  if (img) {
    await e.reply(img)
  } else {
    await e.reply('截图失败辣! 再试一次叭')
  }
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
