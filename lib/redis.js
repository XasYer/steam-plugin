import { Version } from '#components'

const redis = await (async () => {
  switch (Version.BotName) {
    case 'Karin':
      return (await import('node-karin')).redis
    default:
      return global.redis
  }
})()

redis.get('test11').then(console.log)

export default redis
