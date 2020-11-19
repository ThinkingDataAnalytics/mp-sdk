## ThinkingAnalytics SDK 接入指南 - 小游戏

ThinkingAnalytics SDK 实现了针对常见小游戏、快游戏平台的埋点接口。您可以通过集成 ThinkingAnalytics SDK 向 TA (ThinkingAnalytics) 集群上报数据。

对于小游戏开发，我们提供了白鹭引擎、Laya、CocosCreator 等常见游戏引擎的接入方案。如果您需要对应引擎的解决方案，请参考我们的[官方使用手册](https://docs.thinkingdata.cn/ta-manual/latest/installation/installation_menu/client_sdk/mp_sdk_installation/mp_sdk_installation.html)。

如果您只需要在指定平台接入小游戏 SDK，向 TA 上报数据，请继续阅读本文。

### 一、引入 TA SDK

平台和 SDK 文件对应关系:
* 微信小游戏: thinkingdata.mg.wx.min.js
* QQ 小游戏: thinkingdata.mg.qq.min.js
* 字节跳动小游戏: thinkingdata.mg.tt.min.js
* 百度小游戏: thinkingdata.mg.swan.min.js
* 哔哩哔哩小游戏: thinkingdata.mg.bl.min.js
* 华为快游戏: thinkingdata.mg.huawei.min.js
* OPPO 快游戏: thinkingdata.mg.oppo.min.js
* VIVO 快游戏: thinkingdata.mg.vivo.min.js
* 魅族快游戏: thinkingdata.mg.mz.min.js

以微信小游戏为例，在 game.js 中添加以下代码以引入 TA SDK

```js
var ThinkingAnalyticsAPI = require("./thinkingdata.mg.wx.min.js");
```

### 二、初始化 SDK

```js
// TA SDK 配置对象
var config = {
    appId: 'YOUR_APPID', // 项目 APP ID
    serverUrl: 'YOUR_SERVER_URL', // 上报地址
    autoTrack: {
        appShow: true, // 自动采集 ta_mg_show
        appHide: true, // 自动采集 ta_mg_hide
    }
};

// 创建 TA 实例
var ta = new ThinkingAnalyticsAPI(config);

// 初始化
ta.init();

// 上报一个简单事件, 事件名为 test_event
ta.track('test_event');
```
