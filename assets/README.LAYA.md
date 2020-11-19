## ThinkingAnalytics SDK 接入指南 - LAYA 引擎

ThinkingAnalytics SDK 实现了对 LAYA 引擎开发的小游戏的埋点接口。您可以通过集成 ThinkingAnalytics SDK 向 TA (ThinkingAnalytics) 集群上报数据。

如果您需要详细的使用说明，请参考我们的[官方使用手册](https://docs.thinkingdata.cn/ta-manual/latest/installation/installation_menu/client_sdk/mp_sdk_installation/laya_sdk_installation.html)。

### 一、概述

ThinkingAnalytics SDK 包含三个文件，您可以根据您的项目类型，选择对应的文件来集成。

如果您的项目是 TypeScript 工程，您需要用到:
* ThinkingAnalyticsSDK.d.ts
* thinkingdata.mg.layats.min.js

如果您的项目是 JavaScript 工程，您需要用到:
* thinkingdata.mg.laya.min.js

### 二、TypeScript 工程集成方法

如果您的项目是 TypeScript 工程，接入步骤如下：
1. 将声明文件 ThinkingAnalyticsSDK.d.ts 放入 libs 目录
2. 将 SDK 文件（thinkingdata.mg.layats.min.js）放入 bin/js 目录中
3. 修改 bin/index.js 文件，加载 TA SDK：
```js
// 在加载 bundle.js 之前加载 TA SDK
loadLib("js/thinkingdata.mg.layats.min.js");
loadLib("js/bundle.js");
```

### 三、JavaScript 工程集成方法

如果您的项目是 JavaScript 工程，您可以直接将 `thinkingdata.mg.laya.min.js` 放入您的工程中，在源码中引用:
```js
import ThinkingAnalyticsAPI from "./thinkingdata.mg.laya.min";
```

### 四、初始化 SDK

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
