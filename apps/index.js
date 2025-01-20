import fs from 'node:fs'
import { logger } from '#lib'
import { join } from 'node:path'
import { Version } from '#components'

const startTime = Date.now()

const path = join(Version.pluginPath, 'apps')

const apps = {}

fs.readdirSync(path).forEach(file => {
  if (file.endsWith('.js') && file !== 'index.js') {
    apps[file.replace('.js', '')] = import(`file://${join(path, file)}`)
  }
})

await Promise.all(Object.keys(apps).map(async id => {
  try {
    const startTime = Date.now()
    const exp = await apps[id]
    apps[id] = exp.app
    logger.debug(`加载js: apps/${id}.js成功 耗时: ${Date.now() - startTime}ms`)
  } catch (error) {
    delete apps[id]
    logger.log('error', `加载js: apps/${id}.js错误\n`, error)
  }
}))

export { apps }

logger.log('info', '-----------------')
logger.log('info', `${Version.pluginName} v${Version.pluginVersion} 加载成功~ 耗时: ${Date.now() - startTime}ms`)
logger.log('info', '-------^_^-------')
