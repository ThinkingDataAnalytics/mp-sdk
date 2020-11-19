## ThinkingAnalytics SDK 接入指南 - Egret

ThinkingAnalytics SDK 实现了对 Egret 白鹭引擎开发的小游戏的埋点接口。您可以通过集成 ThinkingAnalytics SDK 向 TA (ThinkingAnalytics) 集群上报数据。

如果您需要详细的使用说明，请参考我们的[官方使用手册](https://docs.thinkingdata.cn/ta-manual/latest/installation/installation_menu/client_sdk/mp_sdk_installation/egret_sdk_installation.html)。

### 一、在您的项目中集成 TA SDK

ThinkingAnalyticsSDK 目录放入您项目的 libs 目录下。然后在您项目的配置文件 egretProperties.json 中引入 TA SDK:
```json
{
     "name": "ThinkingAnalyticsSDK",
     "path": "./libs/ThinkingAnalyticsSDK"
}
```

### 二、初始化 SDK

集成 TA SDK 后，您可以在代码中直接使用 ThinkingAnalyticsAPI:

```ts
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
