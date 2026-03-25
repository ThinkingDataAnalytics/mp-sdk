## ThinkingAnalytics SDK 接入指南 - CocosCreator

ThinkingAnalytics SDK 实现了对 CocosCreator 引擎开发的小游戏的埋点接口。您可以通过集成 ThinkingAnalytics SDK 向 TA (ThinkingAnalytics) 集群上报数据。

如果您需要详细的使用说明，请参考我们的[官方使用手册](https://docs.thinkingdata.cn/ta-manual/latest/installation/installation_menu/client_sdk/mp_sdk_installation/cocoscreator_sdk_installation.html)。

### 一、在您的项目中集成 TA SDK
如果您的项目是 TypeScript 工程，接入步骤如下：
1. 将声明文件 ThinkingAnalyticsSDK.d.ts 放入项目根目录下 assets 同级的 libs 目录，如果 libs 不存在，新建 libs 目录
2. 将 SDK 文件 (thinkingdata.mg.cocoscreator.min.js) 放入 assets/Script 目录中

如果您的项目是 JavaScript 工程，您可以直接将 SDK 文件 (thinkingdata.mg.cocoscreator.min.js) 放入 assets/Script 目录中

### 二、初始化 SDK
集成 TA SDK 后，您可以在代码中直接使用 ThinkingAnalyticsAPI:

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
