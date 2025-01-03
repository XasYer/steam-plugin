import fs from 'fs'
import _ from 'lodash'
import { join } from 'path'
import template from 'art-template'
import { execSync } from 'child_process'
import { logger, puppeteer, segment } from '#lib'
import { Version, Config } from '#components'
import { utils } from '#models'

const canvasPKG = await (async () => {
  try {
    const pkg = await import('@napi-rs/canvas')
    const { GlobalFonts } = pkg
    const fontPath = join(Version.pluginPath, 'resources', 'common', 'font', 'MiSans-Normal.ttf')
    GlobalFonts.registerFromPath(fontPath, 'MiSans')
    return pkg
  } catch (error) {
    return null
  }
})()

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
        if (!canvasPKG) {
          throw new Error('请先pnpm i 安装依赖')
        }
        return renderCanvas(params.data, minLength)
      }
    }
    const img = await puppeteer.screenshot(`${Version.pluginName}/${path}`, data)
    if (img) {
      return img
    } else {
      return '制作图片出错辣！再试一次吧'
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

function drawBackgroundColor (ctx, color, x, y, width, height, radius) {
  ctx.beginPath()
  const backgroundX = x - 5
  const backgroundY = y - 20
  const backgroundWidth = width + 2
  const backgroundHeight = height + 5
  ctx.fillStyle = color
  ctx.moveTo(backgroundX + radius, backgroundY)
  ctx.arcTo(backgroundX + backgroundWidth, backgroundY, backgroundX + backgroundWidth, backgroundY + backgroundHeight, radius)
  ctx.arcTo(backgroundX + backgroundWidth, backgroundY + backgroundHeight, backgroundX, backgroundY + backgroundHeight, radius)
  ctx.arcTo(backgroundX, backgroundY + backgroundHeight, backgroundX, backgroundY, radius)
  ctx.arcTo(backgroundX, backgroundY, backgroundX + backgroundWidth, backgroundY, radius)
  ctx.closePath()
  ctx.fill()
}

async function renderCanvas (data, minLength) {
  const { createCanvas, loadImage } = canvasPKG
  const start = Date.now()

  // 每一项的宽高间距
  const gameWidth = 468
  const gameHeight = 93
  const spacing = 10

  // 每行显示的游戏数量
  const lineItemCount = minLength

  // 总行数
  const lineTotal = _.sum(data.map(i => Math.ceil(i.games.length / lineItemCount)))
  // 额外高度
  const extraHeight = _.sumBy(data, i => i.desc.length * 30 + 50) + 30

  // 创建画布
  // 宽度为 (每项的宽+间距)*每行个数 + 左间距
  const canvasWidth = (gameWidth + spacing) * lineItemCount + spacing
  // 高度为 (每项的高+间距)*行数 + 额外高度
  const canvasHeight = (gameHeight + spacing) * lineTotal + extraHeight

  // 计算居中坐标
  const centerX = canvasWidth / 2

  const canvas = createCanvas(canvasWidth, canvasHeight)
  const ctx = canvas.getContext('2d')

  // 设置背景颜色
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  // 设置字体和颜色
  ctx.font = '20px MiSans'
  ctx.fillStyle = '#000000'

  // 异步加载图片
  const imgs = await Promise.all(data.map(i => i.games).flat().map(async i => {
    if (i.noImg) {
      return {}
    }
    const Image = await loadImage(i.image || utils.steam.getHeaderImgUrlByAppid(i.appid)).catch(() => null)
    return {
      ...i,
      Image
    }
  })).then(imgs => imgs.reduce((acc, cur) => {
    if (cur?.Image) {
      acc[`${cur.name}${cur.appid}${cur.desc}`] = cur.Image
    }
    return acc
  }, {}))

  let startX = 0
  let startY = 0

  for (const g of data) {
    startY += 40
    // title
    ctx.save()
    ctx.font = 'bold 24px MiSans'
    ctx.textAlign = 'center'
    ctx.fillText(g.title, centerX, startY)
    ctx.restore()

    // desc
    if (g.desc.length) {
      for (const desc of g.desc) {
        startY += 30
        ctx.save()
        ctx.font = 'bold 20px MiSans'
        ctx.textAlign = 'center'
        ctx.fillText(desc, centerX, startY)
        ctx.restore()
      }
    }

    let x = 10 - gameWidth + startX
    let y = startY + 10
    let index = 1

    for (const items of _.chunk(g.games, lineItemCount)) {
      const remainingItems = items.length

      // 如果是最后一行且元素数量不足，则居中
      if (remainingItems < lineItemCount) {
        const totalWidth = gameWidth * remainingItems + spacing * (remainingItems - 1)
        // 计算居中偏移量
        x = (canvasWidth - totalWidth) / 2
      } else {
        x = 10
      }

      // 绘制当前行的元素
      for (const i of items) {
        ctx.save()

        const nameY = y + 24
        const appidY = y + 52
        const descY = y + 79

        let currentX = x

        // 边框
        ctx.strokeStyle = '#ccc'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.roundRect(currentX, y, gameWidth, gameHeight, 10)
        ctx.stroke()

        // 内边距10
        currentX += 10

        // 最大内容宽度 20内间距
        let maxContentWidth = gameWidth - 20

        // 图片
        if (!i.noImg) {
          const img = imgs[`${i.name}${i.appid}${i.desc}`]
          const imgY = y + 10
          const imgWidth = i.isAvatar ? 72 : 156
          const imgHeight = 72
          const radius = 10
          if (img) {
            ctx.save()

            // 圆角矩形路径
            ctx.beginPath()
            ctx.moveTo(currentX + radius, imgY)
            ctx.arcTo(currentX + imgWidth, imgY, currentX + imgWidth, imgY + imgHeight, radius)
            ctx.arcTo(currentX + imgWidth, imgY + imgHeight, currentX, imgY + imgHeight, radius)
            ctx.arcTo(currentX, imgY + imgHeight, currentX, imgY, radius)
            ctx.arcTo(currentX, imgY, currentX + imgWidth, imgY, radius)
            ctx.closePath()

            // 设置裁剪区域
            ctx.clip()

            // 绘制图片
            ctx.drawImage(img, currentX, imgY, imgWidth, imgHeight)

            // 恢复绘图状态
            ctx.restore()
          }
          // 图片右边距5
          currentX += imgWidth + 5
          maxContentWidth -= (imgWidth + 5)
        }

        // 价格
        if (i.price) {
          const priceXOffset = 385 + x
          const maxPriceWidth = 70
          maxContentWidth -= maxPriceWidth
          ctx.font = '20px MiSans'
          if (i.price.discount) {
            // 打折的话原价格加删除线
            const originalWidth = ctx.measureText(i.price.original).width
            ctx.fillStyle = '#999'
            ctx.fillText(i.price.original, priceXOffset, nameY)
            // 删除线
            ctx.strokeStyle = '#999'
            // 删除线宽度
            ctx.lineWidth = 1
            ctx.beginPath()
            const lineOffset = -7
            ctx.moveTo(priceXOffset, nameY + lineOffset)
            ctx.lineTo(priceXOffset + originalWidth, nameY + lineOffset)
            ctx.stroke()

            // 折扣率的背景色
            drawBackgroundColor(ctx, '#beee11', priceXOffset, appidY, maxPriceWidth, 20, 10)

            // 折扣率
            ctx.fillStyle = '#333'
            ctx.fillText(`-${i.price.discount}%`, priceXOffset, appidY)
            ctx.font = 'blob 20px MiSans'
            ctx.fillText(i.price.current, priceXOffset, descY)
          } else {
            ctx.fillText(i.price.original, priceXOffset, nameY)
          }
        }

        // name
        ctx.font = 'bold 20px MiSans'
        while (ctx.measureText(i.name).width > maxContentWidth) {
          i.name = i.name.slice(0, -1)
        }
        ctx.fillText(i.name, currentX, nameY)

        // appid
        ctx.font = '20px MiSans'
        i.appid = i.appid ? String(i.appid) : ''
        while (ctx.measureText(i.appid).width > maxContentWidth) {
          i.appid = i.appid.slice(0, -1)
        }
        if (i.appidPercent) {
          ctx.fillStyle = '#999999'
          ctx.fillRect(currentX, appidY - 18, maxContentWidth * (i.appidPercent / 100), 20)
        }

        ctx.fillStyle = '#666'
        ctx.fillText(String(i.appid), currentX, appidY)

        // desc
        i.desc = i.desc || ''
        while (ctx.measureText(i.desc).width > maxContentWidth) {
          i.desc = i.desc.slice(0, -1)
        }

        if (i.descBgColor) {
          drawBackgroundColor(ctx, i.descBgColor, currentX, descY, ctx.measureText(i.desc).width + 10, 20, 10)
          ctx.fillStyle = '#ffffff'
        } else {
          ctx.fillStyle = '#999'
        }

        ctx.fillText(i.desc, currentX, descY)

        // 序号
        ctx.font = '12px MiSans'
        const indexText = `No. ${index}`
        const indexWidth = ctx.measureText(indexText).width
        drawBackgroundColor(ctx, '#ffffff', x + 30, y + 10, indexWidth + 8, 11, 0)
        ctx.fillStyle = 'black'
        ctx.fillText(indexText, x + 30, y + 5)
        index++

        ctx.restore()

        // 更新 x 坐标
        x += gameWidth + spacing
      }

      // 更新 y 坐标
      y += gameHeight + spacing
    }
    // 减去最后一行的间距
    y -= spacing
    startX = x
    startY = y
  }

  // 底部文字
  ctx.font = 'bold 20px MiSans'
  ctx.textAlign = 'center'
  ctx.fillText(`Created By ${Version.BotName} v${Version.BotVersion} & ${Version.pluginName} v${Version.pluginVersion}`, centerX, startY + 30)

  const buffer = canvas.toBuffer('image/jpeg')
  const end = Date.now()
  logger.info(`[图片生成][inventory/index] ${(buffer.length / 1024).toFixed(2)}KB ${end - start}ms`)
  if (Version.BotName === 'Karin') {
    return segment.image(`base64://${buffer.toString('base64')}`)
  } else {
    return segment.image(buffer)
  }
}

export default Render
