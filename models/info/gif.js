import fs from 'fs'
import { join } from 'path'
import { canvas } from '#models'
import { execSync } from 'child_process'
import { logger, puppeteer, segment } from '#lib'
import { Config, Render, Version } from '#components'

/**
 * 渲染gif 需要传入tempName参数 用于存放临时文件 建议使用唯一id 比如steamId
 * @param {{
 *   tempName: string,
 *   [key: string]: any
 * }} data
 */
export async function render (data) {
  const tempPath = join(Version.pluginPath, 'temp', String(data.tempName || Date.now())).replace(/\\/g, '/')
  if (fs.existsSync(tempPath)) {
    fs.rmSync(tempPath, { force: true, recursive: true })
  }
  fs.mkdirSync(tempPath, { recursive: true })
  if (Config.gif.gifMode == 3) {
    data.tempPath = tempPath
    return await canvas.info.render(data)
  } else {
    if (Version.BotName === 'Karin') {
      throw new Error('暂不支持karin使用puppeteer渲染gif')
    }

    const tplPath = Render.tplFile('info/index', data, tempPath)
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
        execSync(`ffmpeg -i ${input} "${output}" -loglevel quiet`)
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

        execSync(`ffmpeg -framerate ${fps} -i "${tempPath}/%d.jpeg" "${output}" -loglevel quiet`)
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
    const base64 = fs.readFileSync(output, { encoding: 'base64' })
    return segment.image(`base64://${base64}`)
  }
}
