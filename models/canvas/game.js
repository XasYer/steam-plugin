import { join } from 'path'
import { canvasPKG, createCanvas, toImage } from './canvas.js'
import { Version } from '#components'

export async function render (data) {
  const { loadImage } = canvasPKG

  const bg = await loadImage(join(Version.pluginPath, 'resources', 'game', 'game.png'))

  const { ctx, canvas } = createCanvas(bg.width, bg.height * data.length)

  let x = 0
  let y = 0

  const images = await Promise.all(data.map(async (i) => ({ ...i, _avatar: await loadImage(i.avatar || i.image) }))).then(i => i.reduce((acc, cur) => {
    if (cur?._avatar) {
      acc[`${cur.name}${cur.appid}${cur.desc}`] = cur._avatar
    }
    return acc
  }, {}))

  for (const i of data) {
    ctx.drawImage(bg, x, y, bg.width, bg.height)

    x += 15
    y += 20
    const avatar = images[`${i.name}${i.appid}${i.desc}`]
    if (avatar) {
      ctx.drawImage(avatar, x, y, 66, 66)
    }

    ctx.font = '19px MiSans'
    ctx.fillStyle = '#e3ffc2'

    let nickname = i.isAvatar ? i.name : i.appid

    if (ctx.measureText(nickname).width > 300) {
      while (ctx.measureText(nickname).width > 300) {
        nickname = nickname.slice(0, -1)
      }
      nickname += ' ...'
    }

    x += 85
    y += 15
    ctx.fillText(nickname, x, y)

    if (!i.isAvatar) {
      y += 25
      ctx.font = '17px MiSans'
      ctx.fillStyle = '#969696'
      ctx.fillText(i.type === 'end' ? '结束玩' : '正在玩', x, y)

      let name = i.name

      if (ctx.measureText(name).width > 357) {
        while (ctx.measureText(name).width > 357) {
          name = name.slice(0, -1)
        }
        name += ' ...'
      }

      y += 25
      ctx.font = '14px Bold'
      ctx.fillStyle = '#91c257'
      ctx.fillText(name, x, y)
    } else {
      y += 50
      ctx.font = '14px Bold'
      ctx.fillStyle = i.desc.includes('在线') ? '#beee11' : '#999999'
      ctx.fillText(i.desc, x, y)
    }

    x = 0
    y += 20
  }

  return toImage(canvas)
}
