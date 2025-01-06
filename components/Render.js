import fs from 'fs'
import _ from 'lodash'
import { join } from 'path'
import { puppeteer } from '#lib'
import template from 'art-template'
import { canvas, info } from '#models'
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
        // waitUntil: 'networkidle0' // +0.5s
        waitUntil: 'load'
      },
      ...params
    }
    if (path === 'inventory/index') {
      const hiddenLength = Config.other.hiddenLength
      const minLength = Math.min(
        Math.max(...params.data.map(i => i.games.length)),
        Math.max(1, Number(Config.other.itemLength) || 1)
      )
      params.data = params.data.map(i => {
        if (!Array.isArray(i.desc)) i.desc = [i.desc].filter(Boolean)
        if (i.games.length > hiddenLength) {
          const length = i.games.length - hiddenLength
          i.desc.push(`太多辣 ! 已隐藏${length}个项目`)
          i.games.length = hiddenLength
        }
        return i
      })
      const len = minLength === 1 ? 1.4 : minLength
      data.style = `<style>\n#container,.games{\nwidth: ${len * 370}px;\n}\n</style>`
      // 暂时只支持inventory/index
      if (Config.other.renderType == 2) {
        return canvas.inventory.render(params.data, minLength)
      }
    } else if (path === 'game/game') {
      params.data = params.data.map(i => _.sortBy(i.games, 'name')).flat()
      if (Config.other.renderType == 2) {
        return canvas.game.render(params.data)
      } else {
        return this.simpleRender(path, params)
      }
    } else if (path === 'info/index') {
      if (params.toGif) {
        try {
          return info.gif.render(data)
        } catch (error) {
          const tempPath = join(Version.pluginPath, 'temp', String(data.tempName || Date.now())).replace(/\\/g, '/')
          fs.rmdirSync(tempPath, { recursive: true })
          throw error
        }
      } else if (Config.other.renderType == 2) {
        return await canvas.info.render(data)
      }
    }
    const img = await puppeteer.screenshot(`${Version.pluginName}/${path}`, data)
    if (img) {
      return img
    } else {
      return Config.tips.makeImageFailedTips
    }
  },
  async simpleRender (path, params) {
    path = path.replace(/.html$/, '')
    const data = {
      tplFile: `${Version.pluginPath}/resources/${path}.html`,
      pluResPath: `${Version.pluginPath}/resources/`,
      saveId: path.split('/').pop(),
      imgType: 'jpeg',
      pageGotoParams: {
        waitUntil: 'load'
      },
      ...params
    }
    const img = await puppeteer.screenshot(`${Version.pluginName}/${path}`, data)
    if (img) {
      return img
    } else {
      return '制作图片出错辣！再试一次吧'
    }
  },
  tplFile (path, params, tempPath) {
    const name = path.split('/').pop()
    const tplPath = join(tempPath, name + '.html')
    const tmp = template.render(fs.readFileSync(params.tplFile, 'utf-8'), params)
    fs.writeFileSync(tplPath, tmp)
    return tplPath.replace(/\\/g, '/')
  }
}

export default Render
