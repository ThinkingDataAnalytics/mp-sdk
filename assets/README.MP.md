## ThinkingAnalytics SDK 接入指南 - 小程序

ThinkingAnalytics SDK 实现了针对常见小程序平台和快应用的埋点接口。您可以通过集成 ThinkingAnalytics SDK 向 TA (ThinkingAnalytics) 集群上报数据。

详细的使用说明，请参考我们的[官方使用手册](https://docs.thinkingdata.cn/ta-manual/latest/installation/installation_menu/client_sdk/mp_sdk_installation/mp_sdk_installation.html)。


### 一、引入 TA SDK

平台和 SDK 文件对应关系:
* 微信小程序: thinkingdata.wx.min.js
* 百度小程序: thinkingdata.swan.min.js
* 字节跳动小程序: thinkingdata.tt.min.js
* 支付宝小程序: thinkingdata.my.min.js
* 钉钉小程序: thinkingdata.dd.min.js
* 快应用: thinkingdata.quick.min.js

以微信小程序为例，在 app.js 中添加以下代码以引入 TA SDK

```js
var ThinkingAnalyticsAPI = require("./thinkingdata.wx.min.js");
```

### 二、初始化 SDK

```js
// TA SDK 配置对象
var config = {
    appId: 'YOUR_APPID', // 项目 APP ID
    serverUrl: 'YOUR_SERVER_URL', // 上报地址
    autoTrack: {
    	appLaunch: true, // 自动采集 ta_mp_launch
    	appShow: true, // 自动采集 ta_mp_show
    	appHide: true, // 自动采集 ta_mp_hide
    }
};

// 创建 TA 实例
var ta = new ThinkingAnalyticsAPI(config);

// 初始化
ta.init();

// 上报一条数据
ta.track('test_event');
```

> 注意: 快应用暂不支持自动采集
