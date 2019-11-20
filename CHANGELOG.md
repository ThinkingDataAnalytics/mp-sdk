**v1.4.2** (2019-11-19)
- 新增支持平台：VIVO快游戏

**v1.4.1** (2019-11-13)
- 新增支持平台：OPPO快游戏

**v1.4.0** (2019-10-18)
- 支持重置用户属性
- 事件预置属性新增时间偏移，适配多时区需求

**v1.3.2** (2019-09-29)
- 修复 v1.3.1 引入的部分平台的兼容性问题

**v1.3.1** (2019-09-27)
- 支持数据上报的回调函数 onComplete

**v1.3.0** (2019-08-13)
- 集成方式有重大更新，请参考使用手册
- 代码优化
	- #network_type 属性根据网络状态更新
	- 数据发送内容：用户属性数据不传送预制属性，简化发送内容
	- 优化日志打印
- 新增接口
	- getAccountId()
	- getDistinctId()
	- timeEvent()
	- initInstance()
	- identify() 同 authorizeOpenID()
	- getDeviceId()
	- getSuperProperties()
	- unsetSuperProperty()
	- setDynamicSuperProperties()
- 多实例
	- 通过调用 initInstance(name, config) 可以创建新的实例.
	- 子实例默认使用父实例的配置，默认情况下不启用本地缓存
- 配置信息
	- enablePersistence 父实例默认为true，子实例默认为false
	- asyncPersistence 异步读取缓存
	- maxRetries 当请求失败或超时时的重试次数, 默认为3次
	- sendTimeout 超时时间，单位为毫秒
	- enableLog: true, // 是否打开日志打印
- 跨平台
	= 支持主流小程序小游戏平台：微信、百度、支付宝、字节跳动、快应用
	- 增加预置属性 #mp_platform，标识应用所在的平台
	- #lib 为 MP/MG，分别代表小程序和小游戏

**v1.2.2** (2019-05-13)
- 修复了极端情况下，访客ID可能为空的问题

**v1.2.1** (2019-04-22)
- 增加了公共事件属性的接口：
	- setSuperProperties
	- clearSuperProperties

**v1.2.0** (2019-04-18)
- 初始化方式改动: 增加了初始化接口init，在init调用前触发的事件，将会被缓存于消息队列，init调用时，会将 #account_id 与 #distinct_id 同步到消息队列的数据中，并发送这些数据.
- 增加自动采集功能
- track接口添加了设置事件触发时间的重载
- 添加了对包含插件的小程序的支持

**v1.1.1** (2019-01-08)
- 修复了PageView误报的问题

**v1.1.0** (2018-07-06)
- 微信小程序SDK上线，提供接口：track、authorizeOpenID、login、logout、userSet、userSetOnce、userAdd、userDel

