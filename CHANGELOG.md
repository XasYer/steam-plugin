# Changelog

## [1.6.1](https://github.com/XasYer/steam-plugin/compare/v1.6.0...v1.6.1) (2024-11-29)


### Bug Fixes

* 好像没用 ([4f37a99](https://github.com/XasYer/steam-plugin/commit/4f37a997774efef54a7ec5bedd3ae580022882f6))
* 没判断 ([decafaa](https://github.com/XasYer/steam-plugin/commit/decafaa8ef697911d899d5066ab3d7b77cff8be4))


### Performance Improvements

* 主人可强制解绑某个steamId不需要艾特 ([b3bf892](https://github.com/XasYer/steam-plugin/commit/b3bf892f2ee3a30a6370e43a75ce62e2a19301f8))
* 没有填apiKey时输出提示 ([74df179](https://github.com/XasYer/steam-plugin/commit/74df179857158f86734210d1683a9116589bfb80))

## [1.6.0](https://github.com/XasYer/steam-plugin/compare/v1.5.2...v1.6.0) (2024-11-27)


### Features

* 在线状态推送 ([de6e106](https://github.com/XasYer/steam-plugin/commit/de6e106060949a6eb564663f6ef0efa99ca69572))


### Bug Fixes

* 不对 ([4c9ff00](https://github.com/XasYer/steam-plugin/commit/4c9ff008a0d83c44f2b614d14d9dd706dff31aff))
* 会推送undefined ([aa0907c](https://github.com/XasYer/steam-plugin/commit/aa0907c00360e1e6527f2516e7332c7255967bf3))
* 全部群友不判断黑白名单 ([1670744](https://github.com/XasYer/steam-plugin/commit/1670744a73574cb078166721d3a460ec675246b3))
* 定时任务获取图片 ([211d34b](https://github.com/XasYer/steam-plugin/commit/211d34b5c9030daa61d3a209f6ad55b63fcc5157))
* 布什,戈门 ([9d9bb43](https://github.com/XasYer/steam-plugin/commit/9d9bb4361272067867f8034c70af18852380f99d))
* 状态改变时重复推送开始游玩 ([4a1b649](https://github.com/XasYer/steam-plugin/commit/4a1b649823dee60fa91b906b43a2ea66697dc8e6))
* 离开时单独发图片 ([bbd4494](https://github.com/XasYer/steam-plugin/commit/bbd44942771b6db2f62c9e0a9b5850720efc644d))
* 获取本群的昵称 ([f97e26c](https://github.com/XasYer/steam-plugin/commit/f97e26c91afd8e5a02a700c26a8c874d4de15763))
* 重复推送结束游玩 ([7e507f2](https://github.com/XasYer/steam-plugin/commit/7e507f22a62cb4175f8064b13533ec7524125b5a))


### Performance Improvements

* 仅推送上下线 ([3ca964a](https://github.com/XasYer/steam-plugin/commit/3ca964a29c9eec40df3718ebd58704bc869f6a4b))
* 优化愿望单请求 ([498b811](https://github.com/XasYer/steam-plugin/commit/498b81165326c74767e0e4362b15c52935f96206))
* 增加几个api,以后可能用得上 ([ada1c5d](https://github.com/XasYer/steam-plugin/commit/ada1c5dd66659800cfdb8c3c1d3d870b784d8b73))

## [1.5.2](https://github.com/XasYer/steam-plugin/compare/v1.5.1...v1.5.2) (2024-11-26)


### Bug Fixes

* proxy代理 ([e97cf9a](https://github.com/XasYer/steam-plugin/commit/e97cf9a763687662b1b0a126d9b2f33944ad8da9))
* 判断一下群 ([9791fcc](https://github.com/XasYer/steam-plugin/commit/9791fcc29b8ad37b7cd12caa69a0ccc44ff09628))


### Performance Improvements

* 没填apiKey时不进行推送 ([dc4d6a6](https://github.com/XasYer/steam-plugin/commit/dc4d6a63f98dfbe48213b2a5dfda61f90d88e19e))
* 通过群成员列表获得steamId & 全部群友在玩什么 ([9c33c83](https://github.com/XasYer/steam-plugin/commit/9c33c833af7f79aa8b3eaae47301c2f48a0a6ba9))

## [1.5.1](https://github.com/XasYer/steam-plugin/compare/v1.5.0...v1.5.1) (2024-11-25)


### Performance Improvements

* 可设置是否展示steam头像 ([a002998](https://github.com/XasYer/steam-plugin/commit/a0029983b2a855de1442d0db90d26efbcf7c5a37))

## [1.5.0](https://github.com/XasYer/steam-plugin/compare/v1.4.0...v1.5.0) (2024-11-24)


### Features

* steam推送列表 & 群友在玩什么 ([1c13669](https://github.com/XasYer/steam-plugin/commit/1c13669bcea3dfb4a47f7f5801c47e92e98046e8))
* steam设置推送模式 ([f62da12](https://github.com/XasYer/steam-plugin/commit/f62da12327e1d2eb7b05830849d78e03f8189ebc))
* 设置通用反代 ([fb1a52d](https://github.com/XasYer/steam-plugin/commit/fb1a52d269657b0345b8445b6789438884c59ec0))


### Bug Fixes

* botId ([4e7270b](https://github.com/XasYer/steam-plugin/commit/4e7270b843e81e82704bf904d63f4eab13cf7db7))
* color ([2c3c5bc](https://github.com/XasYer/steam-plugin/commit/2c3c5bcd2c0fca9d53eef76aa557a569a6e5983f))
* 判断错了 ([846423a](https://github.com/XasYer/steam-plugin/commit/846423a9ac48995a9a406ab4c64169c4f3e782e0))
* 我是笨蛋 ([35045b2](https://github.com/XasYer/steam-plugin/commit/35045b273cc42bb9627bdc8da5c7c1ac98b23574))
* 结束的图片和开始的图片一样 ([27c2067](https://github.com/XasYer/steam-plugin/commit/27c20670b2f0f955bfa162210cf4952655c571e7))
* 群友在玩什么图片加载失败 ([f1d7ca0](https://github.com/XasYer/steam-plugin/commit/f1d7ca05ffa0e4a08af712ac92b49225c6875e1c))
* 设置不了 ([78c11ee](https://github.com/XasYer/steam-plugin/commit/78c11ee4af793484e32b97a07327e80aaac7e3a1))
* 重复推送 ([3af7706](https://github.com/XasYer/steam-plugin/commit/3af7706d7dfb8f02df5f0938a67c1033ded3df98))


### Performance Improvements

* steam设置每行个数 ([ce68d52](https://github.com/XasYer/steam-plugin/commit/ce68d52eae8c18621d07f74b398f802fb8824608))
* 优化图片 ([bc00a96](https://github.com/XasYer/steam-plugin/commit/bc00a96425004792966678dedd517ede376ca467))
* 优化群友在玩什么图片 ([adc83a5](https://github.com/XasYer/steam-plugin/commit/adc83a515846b5758c0a52645587046ea7c873ba))
* 可使用序号解除和切换绑定 ([63b8d63](https://github.com/XasYer/steam-plugin/commit/63b8d639f2710f96ca8fa8909561f1931c258551))
* 可设置超过多少游戏时隐藏剩余游戏 ([0af520e](https://github.com/XasYer/steam-plugin/commit/0af520ed000a0a9a2625319d2efd7d970324d60a))
* 图片结束时长 ([48a6625](https://github.com/XasYer/steam-plugin/commit/48a6625804fafb441b3e292cfb05bbd7d0523960))
* 推送bot黑白名单 ([8f86d12](https://github.com/XasYer/steam-plugin/commit/8f86d128b6514d40967d9c8eb5dfc75379d7df70))
* 推送列表图片 ([c8d7464](https://github.com/XasYer/steam-plugin/commit/c8d746416a958a5d1eebed60d1f5634bef7f5586))
* 状态排序 ([d688741](https://github.com/XasYer/steam-plugin/commit/d688741af10b05536a252e1e3a7142d668ce421e))
* 获取用户名 ([ea36f3c](https://github.com/XasYer/steam-plugin/commit/ea36f3cb9e03e831272eadf10b3847e54b1cac9a))

## [1.4.0](https://github.com/XasYer/steam-plugin/compare/v1.3.0...v1.4.0) (2024-11-22)


### Features

* steam成就统计 & steam在线统计 ([5380db7](https://github.com/XasYer/steam-plugin/commit/5380db7247c4666c8b3417f07acb819bf7aa57e3))
* steam评论 ([31f0ff7](https://github.com/XasYer/steam-plugin/commit/31f0ff747f1c269189ee8dc9306f0eb8eab3a40f))


### Bug Fixes

* 全局redis ([517aa10](https://github.com/XasYer/steam-plugin/commit/517aa10e1f2cad9001f503dc33923fb63989e15d))
* 没有删除黑白名单 ([e1f51c8](https://github.com/XasYer/steam-plugin/commit/e1f51c81f07fd3ad142bcd84777c92ea97093dd9))


### Performance Improvements

* steam设置默认推送 ([da69bbe](https://github.com/XasYer/steam-plugin/commit/da69bbe95917b2b7c08bb445c387775ad1c47988))
* 优化帮助图 ([1712fd2](https://github.com/XasYer/steam-plugin/commit/1712fd28abe58aed7599f2af2bebe645adfd5a9c))
* 优化评论图片 ([dbd0b5e](https://github.com/XasYer/steam-plugin/commit/dbd0b5e70ac54947fbcb0cbdec9d59665f08acec))
* 优化锅巴配置项 ([4ce4ee2](https://github.com/XasYer/steam-plugin/commit/4ce4ee285dd1e5e944c1501684b18b61c50b384c))
* 新增api和store反代 ([63b98dc](https://github.com/XasYer/steam-plugin/commit/63b98dc0374c0463b698dca9dfdfba8df28d8748))
* 日志输出 ([07c0f34](https://github.com/XasYer/steam-plugin/commit/07c0f342ad8e5aba157df1cf59eb7c4f98b804ed))
* 更新代理依赖 ([e9a6121](https://github.com/XasYer/steam-plugin/commit/e9a61215a7ab36ada55f4a2a03f9f3d1234dbb08))
* 设置渲染精度 ([af72653](https://github.com/XasYer/steam-plugin/commit/af726533de6e0f972e73d559807f4028c4c5e7b4))
* 锅巴配置项自动获取 ([c21fd2c](https://github.com/XasYer/steam-plugin/commit/c21fd2c988f785ad304993197215dceb331bab1b))

## [1.3.0](https://github.com/XasYer/steam-plugin/compare/v1.2.0...v1.3.0) (2024-11-21)


### Features

* steam开启/关闭推送 ([bc3fcff](https://github.com/XasYer/steam-plugin/commit/bc3fcff32e1f903ca8205f0b5daa1d6ed7c5a5a3))
* steam成就 & steam统计 ([a946ce8](https://github.com/XasYer/steam-plugin/commit/a946ce8b8b86b9822b6e60ce03f5b2734b513b10))
* steam推送黑/白名单 ([06efe48](https://github.com/XasYer/steam-plugin/commit/06efe486a14d88ae762b3268491195fe13e2d1ec))


### Performance Improvements

* 可配置超时时间 ([aaea47d](https://github.com/XasYer/steam-plugin/commit/aaea47d7ae7595929822bc5e1ab1dcfad7217069))
* 搜索为空 ([d460d76](https://github.com/XasYer/steam-plugin/commit/d460d760bf6e4d789fbe169c64b140d401f22457))
* 更改图片渲染方式 ([5506851](https://github.com/XasYer/steam-plugin/commit/550685183b7b948a8b74cfa36454ee9384b35db0))

## [1.2.0](https://github.com/XasYer/steam-plugin/compare/v1.1.0...v1.2.0) (2024-11-20)


### Features

* steam搜索 ([9d15f14](https://github.com/XasYer/steam-plugin/commit/9d15f144a2fb37f5d4c89cfc3466b0311ef12ae5))
* steam特惠 ([b7000a8](https://github.com/XasYer/steam-plugin/commit/b7000a84b81e786384aadf28dc4895f424c2936d))


### Bug Fixes

* 图片报错 ([0a31520](https://github.com/XasYer/steam-plugin/commit/0a3152013d14c142f7d8f906a14ba11cbd6fb145))
* 绑定了但没完全绑定 ([5986d03](https://github.com/XasYer/steam-plugin/commit/5986d03d4e6c59b620aec55d525d8a7251452e9d))
* 设置没判断主人 ([b762ce5](https://github.com/XasYer/steam-plugin/commit/b762ce5476bbf4ecc00de26c8828dfeea14f114b))

## [1.1.0](https://github.com/XasYer/steam-plugin/compare/v1.0.0...v1.1.0) (2024-11-20)


### Features

* 帮助 & 设置 ([aedc7d8](https://github.com/XasYer/steam-plugin/commit/aedc7d88b36426b8105dfcf4ef67311821d32333))

## 1.0.0 (2024-11-20)


### Features

* 适配karin ([a80de7e](https://github.com/XasYer/steam-plugin/commit/a80de7e7579c8d9f71e5fb511e21fd305d047185))
* steam愿望单 ([20e7795](https://github.com/XasYer/steam-plugin/commit/20e7795bd766ebe38b696ec5ea4837d521918171))
* steam库存 ([20e7795](https://github.com/XasYer/steam-plugin/commit/20e7795bd766ebe38b696ec5ea4837d521918171))
* steam最近游玩 ([20e7795](https://github.com/XasYer/steam-plugin/commit/20e7795bd766ebe38b696ec5ea4837d521918171))
* steam信息 ([20e7795](https://github.com/XasYer/steam-plugin/commit/20e7795bd766ebe38b696ec5ea4837d521918171))
* steam绑定 ([20e7795](https://github.com/XasYer/steam-plugin/commit/20e7795bd766ebe38b696ec5ea4837d521918171))
* steam解除绑定 ([20e7795](https://github.com/XasYer/steam-plugin/commit/20e7795bd766ebe38b696ec5ea4837d521918171))
* 游玩通知 结束通知 ([20e7795](https://github.com/XasYer/steam-plugin/commit/20e7795bd766ebe38b696ec5ea4837d521918171))
