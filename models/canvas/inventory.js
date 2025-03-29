import _ from 'lodash'
import { utils } from '#models'
import { Version } from '#components'
import { loadImage, drawBackgroundColor, createCanvas, toImage, shortenText } from './canvas.js'

export async function render (data, lineItemCount) {
  // 每一项的宽高间距
  const gameWidth = 468
  const gameHeight = 93
  const spacing = 10

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

  const { ctx, canvas } = createCanvas(canvasWidth, canvasHeight)

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
        const detailY = y + 52
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
            drawBackgroundColor(ctx, '#beee11', priceXOffset, detailY, maxPriceWidth, 20, 10)

            // 折扣率
            ctx.fillStyle = '#333'
            ctx.fillText(`-${i.price.discount}%`, priceXOffset, detailY)
            ctx.font = 'blob 20px MiSans'
            ctx.fillText(i.price.current, priceXOffset, descY)
          } else {
            ctx.fillText(i.price.original, priceXOffset, nameY)
          }
        }

        // name
        ctx.font = 'bold 20px MiSans'
        i.name = shortenText(ctx, i.name, maxContentWidth)
        ctx.fillText(i.name, currentX, nameY)

        // detail
        ctx.font = '20px MiSans'
        i.detail = i.detail ? String(i.detail) : ''
        i.detail = shortenText(ctx, i.detail, maxContentWidth)
        if (i.detailPercent) {
          ctx.fillStyle = '#999999'
          ctx.fillRect(currentX, detailY - 18, maxContentWidth * (i.detailPercent / 100), 20)
        }

        ctx.fillStyle = '#666'
        ctx.fillText(String(i.detail), currentX, detailY)

        // desc
        i.desc = i.desc || ''
        i.desc = shortenText(ctx, i.desc, maxContentWidth)

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

        // appid
        if (i.appid) {
          ctx.textAlign = 'right'
          const appidText = `Appid: ${i.appid}`
          const appidWidth = ctx.measureText(appidText).width
          drawBackgroundColor(ctx, '#ffffff', x + gameWidth - 30 - appidWidth, y + 10, appidWidth + 8, 11, 0)
          ctx.fillStyle = 'black'
          ctx.fillText(appidText, x + gameWidth - 30, y + 5)
        }

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
  ctx.font = '20px MiSans'
  ctx.textAlign = 'center'
  ctx.fillText(`Created By ${Version.BotName} v${Version.BotVersion} & ${Version.pluginName} v${Version.pluginVersion}`, centerX, startY + 30)

  return toImage(canvas)
}
