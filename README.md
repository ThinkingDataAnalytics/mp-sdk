## ThinkingAnalytics MP(小程序、小游戏) Library

ThinkingAnalytics MP Library 是为小程序、快应用等平台实现了代码埋点 API.  我们通过打包时对部分代码的替换，实现多个平台的适配。

目前，经过测试的平台有：微信小程序、微信小游戏、支付宝小程序、字节跳动小程序、字节跳动小游戏、百度小程序、百度小游戏、快应用等。
我们也支持了三种常见小游戏开发引擎的接入：CocosCreator, Egret 白鹭引擎, 和 Laya 引擎。

详细的使用说明，请参考我们的[官方使用手册](https://docs.thinkingdata.cn/ta-manual/latest/installation/installation_menu/client_sdk/mp_sdk_installation/mp_sdk_installation.html)。

### 一、安装方法

安装 npm 并在项目根目录中执行：
```sh
npm install
```

执行以下命令以打包指定平台的 SDK 版本：
```sh
npm run build
```

执行以下命令以编译发布版本:
```sh
npm run release
```

### 二、集成方法

#### 2.1 小游戏平台集成（以微信小游戏为例）

下载 thinkingdata.mg.wx.min.js，放入与app.js 相同的目录中，在 app.js 中添加以下代码:
```js
var TA = require('./thinkingdata.mg.wx.min.js')

var config = {
    appid: 'YOU-APP-ID',
    server_url: 'https://youserverurl.com',
    autoTrack: {
       appShow: true, // 自动采集 ta_mg_show
       appHide: true, // 自动采集 ta_mg_hide
    },
    name: 'ta', // 全局变量名称, 默认为 thinkingdata
};

// 在开启自动采集的情况下, 创建 TA 实例，config.name 将指向新创建的实例。相当于执行
// GameGlobal.ta = new TA(config);
new TA(config);

ta.init();
```

此后，即可使用我们提供接口追踪用户属性变更和用户行为事件。
```js
// 上报简单事件
ta.track('test_event');

// 上报带属性的事件
ta.track('test', {
    prop_string: 'string value',
    prop_int: 123,
    prop_date: new Date(),
    prop_double: 134.56,
});

// 自定义事件事件
var date = new Date();
date.setHours(10);

ta.track('test', null, date); // 如果不包含事件属性，在第二个参数传入 null 或 {}

```

#### 2.2 小程序平台集成 (以微信小程序为例)

```js
var TA = require('./utils/thinkingdata.wx.min.js');

var config = {
    appid: 'YOU-APP-ID',
    server_url: 'https://youserverurl.com',

    autoTrack: {
      appLaunch: true, // 自动采集 ta_mp_launch
      appShow: true, // 自动采集 ta_mp_show
      appHide: true, // 自动采集 ta_mp_hide
      pageShow: true, // 自动采集 ta_mp_view
      pageShare: true, // 自动采集 ta_mp_share
    },
  name: 'ta', // 全局变量名称, 默认为 thinkingdata
};

// 在开启自动采集的情况下, 创建 TA 实例，config.name 将指向新创建的实例。相当于执行
// var app = getApp();
// app.ta = new TA(config);
var ta = new TA(config);
ta.init();
```

>其他可能会用到的配置有：
```
enableLog: true, // 是否打开日志打印
sendTimeout: 3000, // 网络请求超时时间，单位毫秒，默认值 3000 ms
maxRetries: 3, // 网络请求失败时的重试次数，1 表示不重试。默认值是 3
enablePersistence: true, // 是否使用本地缓存，主实例默认为 true，子实例默认为 false
asyncPersistence: false, // 是否使用异步存储，默认为 false
persistenceComplete(ta) { // 异步存储初始化完成时的回调，可以做一些与缓存相关的删除操作
    ta.clearSuperProperties();
}
```

### 三、部分功能使用说明
#### 3.1 公共属性

公共属性包含两种，事件公共属性和动态公共属性。公共属性是所有事件都会加上的属性。如果出现相同key值的属性，其优先级为：
```用户自定义事件属性 > 动态公共属性 > 事件公共属性```

事件公共属性相关的接口如下:
```js
// 获取当前公共属性
ta.getSuperProperties();

// 设置公共属性，调用后，公共属性为 {superKeyString: "super value", superKeyDouble: 134.44}
ta.setSuperProperties({
    superKeyString: 'super value',
    superKeyDouble: 134.44,
});

// 再次执行设置公共属性时，如果已经有同名Key，则覆盖；如果没有，则会新增. 调用如下代码后，
// 公共属性变为： {superKeyString: "super value new", superKeyDouble: 134.44, superKeyInt: 123}
ta.setSuperProperties({
    superKeyString: 'super value new',
    superKeyInt: 123,
});

// 删除某个公共属性，调用后变为：{superKeyDouble: 134.44, superKeyInt: 123}
ta.unsetSuperProperty('superKeyString');

// 清空公共属性
ta.clearSuperProperties();

```

动态公共属性接口接受一个 function 作为参数，该 funtion 必须返回合法的属性值。
```js
// 通过动态公共属性设置 UTC 时间作为事件属性上报
ta.setDynamicSuperProperties(() => {
    var localDate = new Date();
    return {
        utcTime: new Date(localDate.getTime() + (localDate.getTimezoneOffset() * 60000)),
    };
});
```

#### 3.2 多实例
从 v1.3.0 开始，本 SDK 支持多实例。我们称通过上文描述的方法完成初始化的实例 ta 为主实例，通过本节描述的方法创建的实例为子实例。

多个实例之间共享设备相关的预置属性，其他的属性均不共享，包括：
- #distinct_id 访客 ID
- #account_id 账号 ID
- 公共事件属性、动态公共属性
- timeEvent 操作

您可以通过创建子实例，实现被动事件（被分享用户打开的时候，为分享用户上传一个事件）的上传。
```js
// 创建子实例 tt， 子实例默认配置与主实例相同
ta.initInstance('tt');

// 为子实例设置访客 ID
ta.tt.identify('another_distinct_id');

// 通过子实例上传事件
ta.tt.track('event_from_tt_instance');

// 创建不同配置的子实例
var config = {
    appid: 'ANOTHER-APP-ID',
    enablePersistence: true, // 为子实例开启本地缓存
};

ta.init('tt_1', config);
```

#### 3.3 异步函数调用导致的 SDK 状态问题

由于一些系统函数是异步调用的，包括我们在初始化的过程中，也会遇到异步调用的问题。
如果在实例未初始化完成的时候进行某些操作，可能会出现不可预知的后果。
针对异步调用导致的 SDK 状态问题，我们为每个实例设置了 Ready 状态。当以下条件全部满足时，我们认为 实例已经 Ready:
- 用户主动调用了 `ta.init()`
- 获取系统信息完成：我们通过调用平台提供的 getSystemInfo 获取系统信息
- 缓存信息读取完成：默认情况下，只有快应用是异步读取缓存，其他平台都可以同步读取缓存

当以上条件不完全满足时，我们会缓存所有上报的数据，等待实例初始化完成后，会清空缓存，以此保证状态正确。

如果使用了异步读取缓存（默认只有快应用版本是异步读取），需要特别注意下面的说明：
1. 在缓存信息未读取的时候，可以设置公共属性、登录账户。
2. 当缓存读取完成时，我们会用新的值覆盖之前在缓存中的值。
3. 在缓存读取完成之前，调用涉及删除或读取之前缓存的一些信息的函数，则可能会出现不符合预期的结果。

针对上述第 3 点，可以通过在初始化时传入回调函数来保证调用的时候，缓存已经读取完成:
```js
var config = {
    ...
    persistenceComplete(ta) {
        ta.clearSuperProperties();
    },
    ...
}

var ta = new TA(config);
```

#### 3.4 onCompelete 回调函数
从 v1.3.1 开始，对于 track, userSet, userSetOnce, userAdd, userDel 等接口，支持传入 onComplete 回调.
可以直接在原参数列表后传入 onComplete, 也可以使用参数对象的方式. 如果使用参数对象，参数对象中必须包含 onCompelte, 否则会出现参数错误.

以上传事件为例：

```js
// 以参数列表的形式传入回调
ta.track('test', {testkey:123}, new Date(), (res) => {
    console.log(res);
});

// 以参数对象的形式传入回调
ta.track({
    eventName: 'test', // 必填
    properties: {testkey: 123}, // 可选
    time: new Date(), // 可选
    onComplete: (res) => { console.log(res); }, // 必填
});
```

onComplete 的参数 res 为 object 类型，有两个属性 code 和 msg.

res.code 为 int 类型，定义如下:
- 0: 成功
- -1: 数据格式不正确
- -2: APP ID 无效
- -3: 网络或服务端异常

res.msg 是对 res.code 的文字说明.

