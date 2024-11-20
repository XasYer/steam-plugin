import fs from 'fs'
import YAML from 'yaml'

/**
 * YamlReader类提供了对YAML文件的动态读写功能
 */
export default class YamlReader {
  /**
     * 创建一个YamlReader实例。
     * @param {string} filePath - 文件路径
     */
  constructor (filePath) {
    this.filePath = filePath
    this.document = this.parseDocument()
  }

  /**
     * 解析YAML文件并返回Document对象，保留注释。
     * @returns {Document} 包含YAML数据和注释的Document对象
     */
  parseDocument () {
    const fileContent = fs.readFileSync(this.filePath, 'utf8')
    return YAML.parseDocument(fileContent)
  }

  /**
   * 修改指定参数的值。
   * @param {string} key - 参数键名
   * @param {any} value - 新的参数值
   */
  set (key, value) {
    const keys = key.split('.')
    const lastKey = keys.pop()
    let current = this.document
    // 遍历嵌套键名，直到找到最后一个键
    for (const key of keys) {
      if (!current.has(key)) {
        current.set(key, new YAML.YAMLMap())
      }
      current = current.get(key)
    }
    // 设置最后一个键的值
    current.set(lastKey, value)
    this.write()
  }

  /**
   * 从YAML文件中删除指定参数。
   * @param {string} key - 要删除的参数键名
   */
  rm (key) {
    const keys = key.split('.')
    const lastKey = keys.pop()
    let current = this.document
    // 遍历嵌套键名，直到找到最后一个键
    for (const key of keys) {
      if (current.has(key)) {
        current = current.get(key)
      } else {
        return // 如果键不存在，直接返回
      }
    }
    // 删除最后一个键
    current.delete(lastKey)
    this.write()
  }

  /**
     * 将更新后的Document对象写入YAML文件中。
     */
  write () {
    fs.writeFileSync(this.filePath, this.document.toString(), 'utf8')
  }
}
