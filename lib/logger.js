import { Config, Version } from '#components'
import chalk from 'chalk'

const logger = await (async () => {
  switch (Version.BotName) {
    case 'Karin':
      return (await import('node-karin')).logger
    default:
      return global.logger
  }
})()

const getRandomHexColor = () => {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16)
  return `#${randomColor.padStart(6, '0')}`
}

export default {
  ...logger,
  log: (...logs) => logger.info(chalk.hex(getRandomHexColor())(`[${Version.pluginName}]`, ...logs)),
  info: (...logs) => logger[Config.other.log ? 'info' : 'debug'](chalk.hex(getRandomHexColor())(`[${Version.pluginName}]`, ...logs)),
  error: (...logs) => logger.error(`[${Version.pluginName}]`, ...logs)
}
