# 规划 CAD

> 部分参考资料在 [wiki](https://wiki.xkool.org/x/BwEvAQ)

## Setup

1. 参考[前端微服务调试环境混编](https://wiki.xkool.org/x/VgbnAQ)，在本机用 `Nginx` 搭建多服务环境，这一步会将各服务入口统一为 `http://xkool.local:8081/` （也可以自行修改 `xkool.conf` 改成其他地址 ）；
2. 将 `dashboard` 和本服务 clone 到本地后，将 public/xkool_config.js 替换为[此文件](https://wiki.xkool.org/download/attachments/19857671/xkool_config.js?version=1&modificationDate=1649733879253&api=v2)，然后在 `dashboard`和本服务根目录下运行
   ```bash
   npm i --legacy-peer-deps && npm run start
   ```
3. 本服务正常运行后会自动打开 `http://localhost:3333`，页面显示空白，Don't panic，这是正常现象；
4. 服务正常运行后，从第一步的统一入口地址打开（如有必要，可在本地 clone 并运行一下 `homepage` 服务）；
5. 如果 `hot-loader` 报错可以在`App.tsx`中将 `export default hot(module)(App)` 替换为`export default App`；

## 主目录结构

```bash
 - api    # 接口文件
 - assets     # 静态资源
 - components     # 跨部分跨页面组件或通用组件
 - config     # 部分全局配置
 - hooks    # 部分全局 hook
 - locales    # i18n
 - models     # 全局数据结构
 - pages    # 按路由划分的页面组件
   - 404    #
   - Cad    # 主功能页面
   - Home     # 默认页（即路由 '/' 对应的页面）
   - Share    # 分享页
   - index.tsx    # 路由根组件
 - store    # 全局状态管理
 - styles     # 全局样式 & 继承的公共样式
 - tests    # 测试基础配置与公共 mock
 - utils    # 部分公用 Utils
 - xkEditor     # 3D 场景编辑控制相关
 - xkObject3D     # 部分重新梳理后的 3D 对象
 - App.tsx    # 根组件
 - index.tsx    # 挂载
 - react-app-env.d.ts     #
 - serviceWorker.ts     #
 - setupTests.ts    #
```

## TODO

- [ ] replace all js with ts
- [ ] unit test coverage
- [ ] VO class layer
- [ ]
