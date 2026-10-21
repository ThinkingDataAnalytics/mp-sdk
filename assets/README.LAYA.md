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

### 五、Android 原生 APP 的 Context 获取

使用 Android 原生桥接（`enableNative: true`）时，将 SDK 的 `android` 目录中的
`LayaProxyApi.java`、`TDAnalytics.aar` 和 `TDCore.aar` 集成到导出的 Android 工程。
`LayaProxyApi.java` 默认包名为 `demo`，需要与 JS 端创建的 `demo.LayaProxyApi` 类路径一致。

SDK 会在 JS 端初始化时，通过 `ExportJavaFunction.GetInstance().m_pEngine.getGameContext()`
自动获取引擎的 Context，再转换为 Application Context。

该引擎入口在已核对的 LayaNative 2.x 和 3.x 中均存在，不依赖 `JSBridge`，无需通过反射获取。
宿主无需额外传入 Context，现有 JS 调用保持不变。JS 端 SDK 初始化应在 Laya 引擎启动后进行。

异步接口使用 SDK 自己的 Handler 切换到 Android 主线程，再通过 `ExportJavaFunction.CallBackToJS`
投递给 JS，不再依赖 `JSBridge.m_Handler`。
如果引擎实例或 Application Context 尚未就绪，SDK 会记录错误日志并跳过本次 Android SDK 初始化，
不会因 Context 为空抛出异常。引擎就绪后可重新调用初始化；SDK 不会自动重试。

### 六、原生模式下的采集状态控制

在 Android 和 iOS 原生模式（`enableNative: true`）下，已废弃的 `enableTracking`、
`optOutTracking`、`optInTracking` 和 `optOutTrackingAndDeleteUser` 不再执行操作或调用原生接口。
请使用 `setTrackStatus(status)` 控制采集状态，`status` 可选 `PAUSE`、`STOP`、`NORMAL` 或 `SAVE_ONLY`。
纯 JS 模式下，这四个旧接口仍保留原有行为。
