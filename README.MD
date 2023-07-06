# webpack plugin

Display build information on the browser console


```js
// webpack.config.js
const WebpackBuildInfo = require("webpack-build-info")

{
  ...

  plugins: [
    new WebpackBuildInfo(),

    // 支持自定义打印格式
    new WebpackBuildInfo({
      format(info) {
        return `console.log('${info.gitInfo} - ${info.startTime} - ${info.endTime}')`
      }
    }),
  ]

  ...
}


```

![img](screenshots/WechatIMG338.jpg)