import fs from 'node:fs'
import { logger } from '#lib'
import { join } from 'node:path'
import { Version } from '#components'

const startTime = Date.now()

const path = join(Version.pluginPath, 'apps')

const files = fs.readdirSync(path).filter(file => file.endsWith('.js'))

const apps = {}
for (const i of files) {
  if (i === 'index.js') continue
  try {
    const startTime = Date.now()
    const exp = await import(`file://${join(path, i)}`)
    const id = i.replace('.js', '')
    apps[id] = exp.app
    logger.debug(`加载js: apps/${i}成功 耗时: ${Date.now() - startTime}ms`)
  } catch (error) {
    logger.error('error', `加载js: apps/${i}错误\n`, error)
  }
}

export { apps }

logger.log('info', '-----------------')
logger.log('info', `${Version.pluginName} v${Version.pluginVersion} 加载成功~ 耗时: ${Date.now() - startTime}ms`)
logger.log('info', '-------^_^-------')
