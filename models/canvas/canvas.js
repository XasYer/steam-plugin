import { join } from 'path'
import { Version } from '#components'

export const canvasPKG = await (async () => {
  try {
    const pkg = await import('@napi-rs/canvas')
    const { GlobalFonts } = pkg
    const basePath = join(Version.pluginPath, 'resources', 'common', 'font')
    const normalFontPath = join(basePath, 'MiSans-Normal.ttf')
    const boldFontPath = join(basePath, 'MiSans-Bold.ttf')
    GlobalFonts.registerFromPath(normalFontPath, 'MiSans')
    GlobalFonts.registerFromPath(boldFontPath, 'Bold')
    return pkg
  } catch (error) {
    return null
  }
})()

export const hasCanvas = !!canvasPKG

const startTimeMap = new Map()

/**
 * 加载图片
 * @param {any} source
 * @param {import('@napi-rs/canvas').LoadImageOptions} options
 * @returns {Promise<import('@napi-rs/canvas').Image>}
 */
export const loadImage = async (source, options = {}) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 5000)
  try {
    const Image = await canvasPKG.loadImage(source, {
      requestOptions: {
        signal: controller.signal,
        ...options.requestOptions
      },
      ...options
    })
    clearTimeout(timer)
    return Image
  } catch {
    return null
  }
}

export function createCanvas (width, height) {
  if (!hasCanvas) throw new Error('请先pnpm i 安装依赖')
  const canvas = canvasPKG.createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  const start = Date.now()
  canvas.canvasId = Symbol('canvasId')
  startTimeMap.set(canvas.canvasId, start)
  setTimeout(() => {
    if (startTimeMap.has(canvas.canvasId)) {
      logger.error('[图片生成][canvas] 超时 30000ms')
      startTimeMap.delete(canvas.canvasId)
    }
  }, 1000 * 30)
  return { ctx, canvas }
}

/**
 * 转换成可发送的图片
 * @param {import('@napi-rs/canvas').Canvas} canvas
 * @returns
 */
export function toImage (canvas) {
  const buffer = canvas.toBuffer('image/jpeg')
  const end = Date.now()
  const start = startTimeMap.get(canvas.canvasId) || end - 1000 * 30
  startTimeMap.delete(canvas.canvasId)
  logger.info(`[图片生成][canvas] ${(buffer.length / 1024).toFixed(2)}KB ${end - start}ms`)
  if (Version.BotName === 'Karin') {
    return segment.image(`base64://${buffer.toString('base64')}`)
  } else {
    return segment.image(buffer)
  }
}

/**
 * 缩短文本
 * @param {import('@napi-rs/canvas').SKRSContext2D} ctx
 * @param {string} text
 * @param {number} maxWidth
 * @param {string} replace
 */
export function shortenText (ctx, text, maxWidth, replace = '...') {
  if (!text) return ''
  maxWidth += ctx.measureText(replace).width
  if (ctx.measureText(text).width < maxWidth) return text
  while (ctx.measureText(text).width > maxWidth) {
    text = text.slice(0, -1)
  }
  return text + replace
}

export function drawBackgroundColor (ctx, color, x, y, width, height, radius) {
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
