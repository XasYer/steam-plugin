import fs from 'fs'
import axios from 'axios'
import { utils } from '#models'
import { segment } from '#lib'
import { Version } from '#components'
import { basename, join } from 'path'
import { execSync } from 'child_process'
import { loadImage, createCanvas, shortenText, toImage } from './canvas.js'

/**
 * 使用canvas合成GIF
 * @param {{
 *   avatar: string,
 *   background: string,
 *   backgroundWebm?: string,
 *   frame?: string,
 *   name: string,
 *   status: string,
 *   color: string,
 *   gameId?: string,
 *   gameName?: string,
 *   friendCode: string,
 *   createTime?: string,
 *   lastTime?: string,
 *   country?: string
 *   tempPath: string,
 *   toGif: boolean
 * }} data
 */
export async function render (data) {
  const { ctx, canvas } = createCanvas(640, 570)

  const name = shortenText(ctx, data.name, 300)
  const status = shortenText(ctx, data.status, 300)
  const gameAvatar = data.gameId ? await loadImage(utils.steam.getHeaderImgUrlByAppid(data.gameId)) : null
  const gameName = shortenText(ctx, data.gameName, 300)
  const friendCode = shortenText(ctx, `好友代码: ${data.friendCode}`, 580)
  const createTime = shortenText(ctx, `注册时间: ${data.createTime}`, 580)
  const lastTime = shortenText(ctx, data.lastTime ? `最后在线: ${data.lastTime}` : '', 580)
  const country = shortenText(ctx, data.country ? `账号地区: ${data.country}` : '', 580)
  const copyright = `Created By ${Version.BotName} v${Version.BotVersion} & ${Version.pluginName} v${Version.pluginVersion}`

  // 背景默认灰色
  ctx.fillStyle = '#2e3239'
  ctx.fillRect(0, 0, 640, 570)

  ctx.fillStyle = data.color
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 1.5

  const draw = async (avatarPath, framePath, backgroundPath) => {
    const avatar = await loadImage(avatarPath)
    const frame = framePath && await loadImage(framePath)
    const background = backgroundPath && await loadImage(backgroundPath)
    // 背景
    if (background) {
      ctx.drawImage(background, 0, 0, 640, 570)
    }
    // 大头像
    ctx.drawImage(avatar, 40, 40, 164, 164)

    ctx.font = '30px Bold'

    // 名字
    ctx.fillText(name, 220, 110)
    ctx.strokeText(name, 220, 110)

    ctx.font = '24px Bold'

    // 在线状态
    ctx.fillText(status, 220, 150)
    ctx.strokeText(status, 220, 150)

    // 头像框
    if (frame) {
      ctx.drawImage(frame, 20, 20, 200, 200)
    }

    let y = 250

    // 正在玩
    if (gameAvatar) {
      ctx.drawImage(gameAvatar, 40, 220, 164, 77)
      ctx.fillText('游戏中', 220, y)
      ctx.strokeText('游戏中', 220, y)
      y += 30
      ctx.fillText(gameName, 220, y)
      ctx.strokeText(gameName, 220, y)
      y += 50
    } else {
      y -= 10
    }

    // 好友代码
    ctx.fillText(friendCode, 40, y)
    ctx.strokeText(friendCode, 40, y)
    y += 40

    // 注册时间
    ctx.fillText(createTime, 40, y)
    ctx.strokeText(createTime, 40, y)
    y += 40

    // 最后在线
    if (lastTime) {
      ctx.fillText(lastTime, 40, y)
      ctx.strokeText(lastTime, 40, y)
      y += 40
    }
    if (country) {
      ctx.fillText(country, 40, y)
      ctx.strokeText(country, 40, y)
    }

    ctx.save()
    ctx.font = '20px MiSans'
    ctx.textAlign = 'center'
    ctx.fillText(copyright, canvas.width / 2, canvas.height - 20)
    ctx.restore()
  }

  if (data.toGif) {
    fs.mkdirSync(join(data.tempPath, 'input'))
    fs.mkdirSync(join(data.tempPath, 'output'))
    const saveKeys = ['avatar', 'frame', 'backgroundWebm']
    // 先保存头像 头像框 背景图
    const tempPaths = await Promise.all(saveKeys.map(async key => {
      if (data[key]) {
        return await axios.get(data[key], { responseType: 'arraybuffer' }).then(res => {
          const ext = res.headers['content-type'].split('/').pop()
          const path = join(data.tempPath, `${key}.${ext}`)
          fs.writeFileSync(path, res.data)
          return path
        }).catch(() => '')
      }
      return ''
    }))
    const avatarGif = tempPaths[0].endsWith('gif')

    // 拆成图片
    for (const i of tempPaths) {
      if (!i) continue
      const [name] = basename(i).split('.')
      let cmd = ''
      if (name === 'avatar') {
        if (avatarGif) {
          cmd = `ffmpeg -i ${i} -vf "fps=7" "${join(data.tempPath, 'input', 'avatar%d.png')}"`
        }
      } else if (name === 'frame') {
        cmd = `ffmpeg -i ${i} -vf "fps=20" "${join(data.tempPath, 'input', 'frame%d.png')}"`
      } else if (name === 'backgroundWebm') {
        cmd = `ffmpeg -i ${i} -vf "fps=7" "${join(data.tempPath, 'input', 'backgroundWebm%d.png')}"`
      }
      if (cmd) {
        cmd += ' -loglevel quiet'
        execSync(cmd)
      }
    }

    // 收集图片
    const images = {
      avatar: [],
      frame: [],
      backgroundWebm: []
    }
    fs.readdirSync(join(data.tempPath, 'input')).sort((a, b) => {
      const num1 = a.match(/\d+/)?.[0]
      const num2 = b.match(/\d+/)?.[0]
      return parseInt(num1) - parseInt(num2)
    }).forEach(file => {
      for (const key of saveKeys) {
        if (file.startsWith(key)) {
          images[key].push(join(data.tempPath, 'input', file))
          break
        }
      }
    })

    // 根据最大长度补齐
    const length = Math.max(...saveKeys.map(i => images[i].length))
    for (const key of saveKeys) {
      if (!images[key].length) continue
      while (images[key].length < length) {
        images[key].push(...images[key])
      }
    }

    // 根据最大长度循环渲染
    for (let i = 0; i < length; i++) {
      const avatarPath = avatarGif ? images.avatar.shift() : tempPaths[0]
      const framePath = images.frame.shift()
      const backgroundPath = images.backgroundWebm.shift()

      await draw(avatarPath, framePath, backgroundPath)

      const buffer = canvas.toBuffer('image/jpeg')
      fs.writeFileSync(join(data.tempPath, 'output', `output${i}.jpeg`), buffer)
    }

    const input = join(data.tempPath, 'output', 'output%d.jpeg')
    const output = join(data.tempPath, 'output.gif')
    // 渲染完成后合成gif
    execSync(`ffmpeg -framerate 10 -i "${input}" "${output}" -loglevel quiet`)
    // 看看时间
    toImage(canvas)
    setTimeout(() => {
      fs.rmSync(data.tempPath, { recursive: true })
    }, 1000 * 60 * 5)
    return segment.image(`file://${output}`)
  } else {
    await draw(data.avatar, data.frame, data.background)
    return toImage(canvas)
  }
}
