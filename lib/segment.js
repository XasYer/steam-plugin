import { Version } from '#components'

const segment = await (async () => {
  switch (Version.BotName) {
    case 'Karin':
      return (await import('node-karin')).segment
    default:
      return global.segment
  }
})()

export default segment
