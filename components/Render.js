import { join } from 'path'
import { puppeteer } from '#lib'
import { Version } from '#components'

function scale (pct = 1) {
  const scale = Math.min(2, Math.max(0.5, 150 / 100))
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
      ...params
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
