import fs from 'node:fs'
import { logger } from '#lib'
import { join } from 'node:path'
import { App, Version } from '#components'
import chalk from 'chalk'
import { task } from '#models'

const startTime = Date.now()

const path = join(Version.pluginPath, 'apps')

const files = fs.readdirSync(path).filter(file => file.endsWith('.js'))

const apps = {}
for (const i of files) {
  if (i === 'index.js') continue
  try {
    const exp = await import(`file://${join(path, i)}`)
    const app = new App(exp.app || {
      id: i.replace('.js', ''),
      name: i.replace('.js', '')
    })
    for (const key in exp.rule) {
      const rule = exp.rule[key]
      app.rule(key, rule.reg, rule.fnc, rule.cfg)
    }
    apps[app.id] = app.create()
  } catch (error) {
    logger.error(`[${Version.pluginName}]加载js: apps/${i}错误\n`, error)
  }
}

export { apps }

task.startTimer()

const getRandomHexColor = () => {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16)
  return `#${randomColor.padStart(6, '0')}`
}

const log = (...args) => logger.info(chalk.hex(getRandomHexColor())(...args))

log('-----------------')
log(`${Version.pluginName} v${Version.pluginVersion} 加载成功~ 耗时: ${Date.now() - startTime}ms`)
log('-------^_^-------')
