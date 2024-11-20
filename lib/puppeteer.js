import { segment } from '#lib'
import { Version } from '#components'

const puppeteer = await (async () => {
  switch (Version.BotName) {
    case 'Karin': {
      const Renderer = (await import('node-karin')).Renderer
      return {
        screenshot: async (path, options) => {
          options.data = { ...options }
          options.name = Version.pluginName + path
          options.file = options.tplFile
          options.type = options.imgType || 'jpeg'
          options.fileID = options.saveId
          options.screensEval = '#containter'
          const img = await Renderer.render(options)
          return segment.image(img)
        }
      }
    }
    default:
      return (await import('../../../lib/puppeteer/puppeteer.js')).default
  }
})()

export default puppeteer
