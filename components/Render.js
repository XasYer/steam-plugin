import { join } from 'path'
import { puppeteer, segment } from '#lib'
import { Version, Config } from '#components'
import template from 'art-template'
import fs from 'fs'
import { execSync } from 'child_process'

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
      data.hiddenLength = Config.other.hiddenLength
      const minLength = Math.min(
        Math.max(...params.data.map(i => i.games.length)),
        Math.max(1, Number(Config.other.itemLength) || 1)
      )
      const size = params.data.findIndex(i => i.size === 'large') >= 0 ? 370 : 300
      const len = minLength === 1 ? 1.4 : minLength
      data.style = `<style>\n#container,.games{\nwidth: ${len * size}px;\n}\n</style>`
    }
    return await puppeteer.screenshot(`${Version.pluginName}/${path}`, data)
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
    return await puppeteer.screenshot(`${Version.pluginName}/${path}`, data)
  },
  /**
   * 渲染gif 需要传入tempName参数 用于存放临时文件 建议使用唯一id 比如steamId
   * @param {string} path
   * @param {{
   *   tempName: string,
   *   [key: string]: any
   * }} params
   */
  async renderGif (path, params) {
    if (Version.BotName === 'Karin') {
      throw new Error('暂不支持karin渲染gif')
    }

    const tempPath = join(Version.pluginPath, 'temp', String(params.tempName || Date.now())).replace(/\\/g, '/')
    if (fs.existsSync(tempPath)) {
      fs.rmSync(tempPath, { force: true, recursive: true })
    }
    fs.mkdirSync(tempPath, { recursive: true })

    path = path.replace(/.html$/, '')
    const layoutPath = join(Version.pluginPath, 'resources', 'common', 'layout')
    const data = {
      tplFile: `${Version.pluginPath}/resources/${path}.html`,
      pluResPath: `${Version.pluginPath}/resources/`,
      defaultLayout: join(layoutPath, 'default.html'),
      sys: {
        scale: scale(params.scale || 1),
        copyright: params.copyright || `Created By <span class="version"> ${Version.BotName} v${Version.BotVersion} </span> & <span class="version"> ${Version.pluginName} v${Version.pluginVersion} </span>`
      },
      ...params
    }
    const tplPath = tplFile(path, data, tempPath)
    if (!puppeteer.browser) {
      await puppeteer.browserInit()
    }
    const page = await puppeteer.browser.newPage()
    const output = `${tempPath}/output.gif`
    const fps = Math.abs(Config.gif.frameRate || 20)
    try {
      await page.goto(`file://${tplPath}`)

      const body = await page.$('#container') || await page.$('body')

      if (Config.gif.gifMode == 2) {
        const { PuppeteerScreenRecorder } = await import('puppeteer-screen-recorder')
        const boundingBox = await body.boundingBox()

        page.setViewport({
          width: Math.round(boundingBox.width),
          height: Math.round(boundingBox.height)
        })

        const recorder = new PuppeteerScreenRecorder(page, {
          fps,
          followNewTab: false
        })

        const input = `${tempPath}/output.mp4`

        await recorder.start(input)
        const sleep = Math.abs(Config.gif.videoLimit || 3)
        await new Promise(resolve => setTimeout(resolve, sleep * 1000))

        await recorder.stop()
        execSync(`ffmpeg -i ${input} "${output}"`)
      } else {
        const sleep = Math.abs(Config.gif.frameSleep || 50)
        const count = Math.abs(Config.gif.frameCount || 30)

        const task = []
        for (let i = 1; i < count; i++) {
          await new Promise(resolve => setTimeout(resolve, sleep))
          task.push(
            body.screenshot({
              path: `${tempPath}/${i}.jpeg`,
              type: 'jpeg'
            })
          )
        }
        await Promise.all(task)

        execSync(`ffmpeg -framerate ${fps} -i "${tempPath}/%d.jpeg" "${output}"`)
      }
      page.close().catch((err) => logger.error(err))
    } catch (error) {
      page.close().catch((err) => logger.error(err))
      // 仅用于关闭页面
      throw error
    }
    setTimeout(() => {
      fs.rmSync(tempPath, { force: true, recursive: true })
    }, 1000 * 60 * 5) // 5分钟后删除
    return segment.image(`file://${output}`)
  }
}

function tplFile (path, params, tempPath) {
  const name = path.split('/').pop()
  const tplPath = join(tempPath, name + '.html')
  const tmp = template.render(fs.readFileSync(params.tplFile, 'utf-8'), params)
  fs.writeFileSync(tplPath, tmp)
  return tplPath.replace(/\\/g, '/')
}

export default Render
