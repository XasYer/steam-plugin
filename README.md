# Steam Plugin

<div align="center">

**提供 steam 相关功能**

<br/>

![GitHub release (latest by date)](https://img.shields.io/github/v/release/XasYer/steam-plugin)
![GitHub stars](https://img.shields.io/github/stars/XasYer/steam-plugin?style=social)
![GitHub forks](https://img.shields.io/github/forks/XasYer/steam-plugin?style=social)
![GitHub license](https://img.shields.io/github/license/XasYer/steam-plugin)
![GitHub issues](https://img.shields.io/github/issues/XasYer/steam-plugin)
![GitHub pull requests](https://img.shields.io/github/issues-pr/XasYer/steam-plugin)
<br/>

<img src="https://count.getloli.com/get/@XasYer-steam-plugin?theme=rule34" />

</div>

![Star History Chart](https://api.star-history.com/svg?repos=XasYer/steam-plugin&type=Date)

## **注意**

一定要填**Steam Web API Key**,否则无法使用绝大部分功能,通常会返回 401 或 403 错误,请前往[Steam API](https://steamcommunity.com/dev/apikey)申请API Key

相关链接:

- [Steam Web API 说明](https://partner.steamgames.com/doc/webapi_overview/auth)
- [申请API Key](https://steamcommunity.com/dev/apikey)
- [Steam API 条款](https://steamcommunity.com/dev/apiterms)

## 介绍

这是一个基于 [Miao-Yunzai](https://github.com/yoimiya-kokomi/Miao-Yunzai)&[Trss-Yunzai](https://github.com/TimeRainStarSky/Yunzai)&[Karin](https://github.com/KarinJS/Karin)的扩展插件, 提供 steam 群友状态播报, steam 库存, steam 愿望单 等功能

## 安装

### Yunzai使用

#### 使用github
```bash
git clone --depth=1 https://github.com/XasYer/steam-plugin.git ./plugins/steam-plugin
```

#### 使用gitee
```bash
git clone --depth=1 https://gitee.com/xiaoye12123/steam-plugin.git ./plugins/steam-plugin
```

### Karin使用

#### 使用github
```bash
git clone --depth=1 https://github.com/XasYer/steam-plugin.git ./plugins/karin-plugin-steam
```

#### 使用gitee
```bash
git clone --depth=1 https://gitee.com/xiaoye12123/steam-plugin.git ./plugins/karin-plugin-steam
```

### 安装依赖
```bash
pnpm install --filter=steam-plugin
```

## 功能

- [x] steam绑定
- [x] steam更换绑定
- [x] steam解除绑定
- [x] steam状态
- [x] steam库存
- [x] steam最近游玩
- [x] steam愿望单
- [x] 群友状态播报
- [x] steam帮助
- [x] steam设置
- [x] steam搜索
- [x] steam成就
- [x] steam统计
- [x] 群友上下线通知
- [ ] steam喜加一
- [x] 开启/关闭推送
- [x] steam特惠
- [x] 推送黑/白群名单
- [ ] steam绑定渲染成图片
- [x] steam评论
- [ ] steam游戏详情
- [x] steam成就统计
- [x] steam在线统计
- [x] steam推送列表
- [x] 群友在玩什么

## 联系方式

- QQ 群: [741577559](http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=IvPaOVo_p-6n--FaLm1v39ML9EZaBRCm&authKey=YPs0p%2FRh8MGPQrWZgn99fk4kGB5PtRAoOYIUqK71FBsBYCDdekxCEHFFHnznpYA1&noverify=0&group_code=741577559)

## 使用cloudflare搭建反代 (连接不上steam情况下的备选)

### 1. 来自[@MapleLeaf2007](https://github.com/MapleLeaf2007) 的图文教程

[点我前往 地址: https://mapleleaf.icu/2024/11/29/CloudFlareReverseProxy/](https://mapleleaf.icu/2024/11/29/CloudFlareReverseProxy/)

### 2. 简易版

1. 需要`cloudflare账号`, 以及在`cf托管的域名`
2. 打开[Workers 和 Pages](https://dash.cloudflare.com/1e36e2833bb5f40af76d604e0894cb93/workers-and-pages), 点击`创建`, 然后点击`创建 Worker`
3. 名字随意, 可参考`steam` 然后点击`部署` 再点击`编辑代码`
4. 复制以下代码到编辑器, `覆盖`原内容, 然后点击`部署`, 出现`版本已保存`即可
    ```js
    export default {
      async fetch(request) {
        const url = new URL(request.url)
        const path = decodeURIComponent(url.pathname.replace('/',''))
        if (!path || !path.startsWith('http')) {
          return new Response('Ciallo～(∠・ω< )⌒☆');
        }
        const target = new URL(path)
        url.hostname = path.replace(/https?:\/\//,'')
        url.protocol = target.protocol
        url.pathname = target.pathname
        return await fetch(new Request(url, request))
      }
    }
    ```
5. 依次点击`左上角第3步填写的名字`, `设置`, `域和路由`右边的`添加`, `自定义域`, 然后填入你想设置的二级或多级域名, 比如`steam.example.com`, 然后点`添加域`
6. 测试(可选): 浏览器访问`https://steam.example.com/https://api.steampowered.com/ISteamWebAPIUtil/GetServerInfo/v1/`, `steam.example.com`替换成第5步设置的域名, 如果能看到`servertime`字段, 说明配置成功
7. 对你的Bot发送`#steam设置通用反代https://steam.example.com/{{url}}`, 域名替换成第5步设置的域名

### 注意事项

1. cloudflare的workers免费账户的每天请求数量限制10w次(一个账号所有的workers请求总量)

## 贡献者

> 🌟 星光闪烁，你们的智慧如同璀璨的夜空。感谢所有为 **steam-plugin** 做出贡献的人！

<a href="https://github.com/XasYer/steam-plugin/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=XasYer%2Fsteam-plugin" />
</a>

![Alt](https://repobeats.axiom.co/api/embed/aafe6a6a7a72df285ae3965974546314c467db8d.svg "Repobeats analytics image")

## 其他

如果觉得此插件对你有帮助的话,可以点一个 star,你的支持就是不断更新的动力~