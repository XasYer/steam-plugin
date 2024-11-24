import { join } from 'path'
import { puppeteer } from '#lib'
import { Version, Config } from '#components'

function scale (pct = 1) {
  const scale = Math.min(2, Math.max(0.5, Config.other.renderScale / 100))
  pct = pct * scale
  return `style=transform:scale(${pct})`
}

const Render = {
  async render (path, params) {
    path = path.replace(/.html$/, '')
    const layoutPath = join(Version.pluginPath, 'resources', 'common', 'layout')
    const data = {
      tplFile: `${Version.pluginPath}/resources/${path}.html`,
      pluResPath: `${Version.pluginPath}/resources/`,
      saveId: path.split('/').pop(),
      imgType: 'jpeg',
      defaultLayout: join(layoutPath, 'default.html'),
      sys: {
        scale: scale(params.scale || 1),
        copyright: params.copyright || `Created By <span class="version"> ${Version.BotName} v${Version.BotVersion} </span> & <span class="version"> ${Version.pluginName} v${Version.pluginVersion} </span>`
      },
      pageGotoParams: {
        waitUntil: 'networkidle0' // +0.5s
      },
      ...params
    }
    if (path === 'inventory/index') {
      data.hiddenLength = Config.other.hiddenLength
      const minLength = Math.min(
        Math.max(...params.data.map(i => i.games.length)),
        Math.max(1, Number(Config.other.itemLength) || 1)
      )
      const size = params.data.findIndex(i => i.size === 'large') >= 0 ? 370 : 300
      const len = minLength === 1 ? (size === 370 ? 1 : 1.4) : minLength
      data.style = `<style>\n#container,.games{\nwidth: ${len * size}px;\n}\n</style>`
    }
    return await puppeteer.screenshot(path, data)
  },
  async simpleRender (path, params) {
    path = path.replace(/.html$/, '')
    const data = {
      tplFile: `${Version.pluginPath}/resources/${path}.html`,
      pluResPath: `${Version.pluginPath}/resources/`,
      saveId: path.split('/').pop(),
      imgType: 'jpeg',
      pageGotoParams: {
        waitUntil: 'networkidle0' // +0.5s
      },
      ...params
    }
    return await puppeteer.screenshot(path, data)
  }
}

export default Render
