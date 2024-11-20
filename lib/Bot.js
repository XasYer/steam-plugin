import { Version } from '#components'

const Bot = await (async () => {
  switch (Version.BotName) {
    case 'Karin':
      return (await import('node-karin')).Bot
    default:
      return global.Bot
  }
})()

export default Bot
