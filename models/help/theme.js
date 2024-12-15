import lodash from 'lodash'
import { style } from './config.js'

const helpTheme = {
  getThemeCfg () {
    const resPath = `{{pluResPath}}help/theme/${lodash.random(1, 5)}.png`
    return {
      bg: resPath,
      style
    }
  },
  async getThemeData (diyStyle) {
    const helpConfig = lodash.extend({}, diyStyle)
    const colCount = Math.min(5, Math.max(parseInt(helpConfig?.colCount) || 3, 2))
    const colWidth = Math.min(500, Math.max(100, parseInt(helpConfig?.colWidth) || 265))
    const width = Math.min(2500, Math.max(800, colCount * colWidth + 30))
    const theme = helpTheme.getThemeCfg()
    const themeStyle = theme.style || {}
    const ret = [`
    .container{background-image:url(${theme.bg});width:${width}px;}
    .help-table .td,.help-table .th{width:${100 / colCount}%}
    `]
    const defFnc = (...args) => {
      for (const idx in args) {
        if (!lodash.isUndefined(args[idx])) {
          return args[idx]
        }
      }
    }
    const css = function (sel, css, key, def, fn) {
      let val = defFnc(themeStyle[key], diyStyle[key], def)
      if (fn) {
        val = fn(val)
      }
      ret.push(`${sel}{${css}:${val}}`)
    }
    css('.help-title,.help-group', 'color', 'fontColor', '#ceb78b')
    css('.help-title,.help-group', 'text-shadow', 'fontShadow', 'none')
    css('.help-desc', 'color', 'descColor', '#eee')
    css('.cont-box', 'background', 'contBgColor', 'rgba(43, 52, 61, 0.8)')
    css('.cont-box', 'backdrop-filter', 'contBgBlur', 3, (n) => diyStyle.bgBlur === false ? 'none' : `blur(${n}px)`)
    css('.help-group', 'background', 'headerBgColor', 'rgba(34, 41, 51, .4)')
    css('.help-table .tr:nth-child(odd)', 'background', 'rowBgColor1', 'rgba(34, 41, 51, .2)')
    css('.help-table .tr:nth-child(even)', 'background', 'rowBgColor2', 'rgba(34, 41, 51, .4)')
    return {
      style: `<style>${ret.join('\n')}</style>`,
      colCount
    }
  }
}
export default helpTheme
