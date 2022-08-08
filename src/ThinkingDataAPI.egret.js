/* eslint-disable no-undef */
import {
    _,
} from './utils';

// PlatformAPI provides interfaces for storage, network, system information, etc.
import PlatformAPI from './PlatformAPI';

const DEFAULT_CONFIG = {
    name: 'thinkingdata', // 全局变量名称
    // eslint-disable-next-line camelcase
    is_plugin: false, // 是否是插件版本。基础库 < 2.6.4 不允许修改 App 和 Page
    maxRetries: 3, // 当网络出错或者超时时，最大重试次数. v1.3.0+
    sendTimeout: 3000, // 请求超时时间, 单位毫秒
    enablePersistence: true, // 是否使用本地缓存
    asyncPersistence: false, // 是否使用异步存储
    enableLog: true, // 是否打开日志
    strict: false, // 关闭严格数据格式校验。允许可能的问题数据上报
    debugMode: 'none', // Debug 模式
    enableNative: false
};

// export default class ThinkingDataAPIForNative {}
class ThinkingDataAPIForNative {
    constructor(config) {
        config.appId = config.appId ? _.checkAppId(config.appId) : _.checkAppId(config.appid);
        config.serverUrl = config.serverUrl ? _.checkUrl(config.serverUrl) : _.checkUrl(config.server_url);
        var defaultConfig = _.extend({}, DEFAULT_CONFIG);
        if (_.isObject(config)) {
            this.config = _.extend(defaultConfig, config);
        } else {
            this.config = defaultConfig;
        }
        this._init(this.config);
    }

    // 判断是否native平台，目前支持 iOS
    _isNativePlatform() {
        if ((this._isIOS() || this._isAndroid()) && this.config.enableNative) {
            return true;
        } else {
            return false;
        }
    }
    _isIOS() {
        if (egret.Capabilities.os === 'iOS' && egret.Capabilities.runtimeType == egret.RuntimeType.RUNTIME2) {
            return true;
        } else {
            return false;
        }
    }
    _isAndroid() {
        if (egret.Capabilities.os === 'Android' && egret.Capabilities.runtimeType == egret.RuntimeType.RUNTIME2) {
            return true;
        } else {
            return false;
        }
    }
    // internal init function. it should not be used by users.
    _init(config) {
        this.name = config.name;
        this.appId = config.appId || config.appid;
        
        if (this._isNativePlatform()) {
            this.initInstance_native(this.name, config, this.appId);
            this._readStorage(config);
        } else {
            this.taJs = new ThinkingAnalyticsAPIForJS(config);
        }
    }

    // 读取js层存储的访客id/账号id，传递到native层，保持账号系统一致
    _readStorage(config) {
        var name = config.persistenceName;
        var nameOld = config.persistenceNameOld;
        if (config.isChildInstance) {
            name = config.persistenceName + '_' + config.name;
            nameOld = config.persistenceNameOld + '_' + config.name;
        } 
        if (config.asyncPersistence) {
            this._state = {};
            PlatformAPI.getStorage(name, true, (data) => {
                if (_.isEmptyObject(data)) {
                    PlatformAPI.getStorage(nameOld, true, (dataOld) => {
                        this._state = _.extend2Layers({}, dataOld, this._state);
                    });
                } else {
                    this._state = _.extend2Layers({}, data, this._state);
                }
            });
        } else {
            this._state = PlatformAPI.getStorage(name) || {};
            if(_.isEmptyObject(this._state)) {
                this._state = PlatformAPI.getStorage(nameOld) || {};
            }
        }

        if (this._state.distinct_id) {
            this.identify_native(this._state.distinct_id);            
        }
        if (this._state.account_id) {
            this.login_native(this._state.account_id);            
        }
    }

    /**
     * 创建新的实例（子实例）。所有可以设置的属性都与主实例独立。
     *
     * @param {string} name 子实例名称
     * @param {object} config 可选 子实例配置信息
     */
    initInstance(name, config) {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            if (config != null) {
                this[name] = new ThinkingAnalyticsAPI(config);
            } else {
                this[name] = new ThinkingAnalyticsAPI(this.config);
            }
            return this[name];
        }
        this[name] = this.taJs.initInstance(name, config);
        return this[name];
    }

    /**
     * 用于获取子实例，用于白鹭引擎 t.ds 代码调用
     *
     * @param {string} name 子实例名称
     */
    lightInstance(name) {
        return this[name];
    }

    /**
     * 用户主动调用 init()，开始真正的上报。
     *
     * 在调用此函数之前，所有的上报请求将被缓存。当用户完成必要的设置时，调用此函数触发上报.
     */
    init() {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.startThinkingAnalytics_native();
            return;
        }
        this.taJs.init();
    }

    /**
     * 发送事件数据. 会对属性值进行校验.
     * @param {string} eventName 必填
     * @param {object} properties 可选
     * @param {date} time 可选
     * @param {function} onComplete 可选, 回调函数
     */
    track(eventName, properties, time, onComplete) {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.track_native(eventName, properties, time, this.appId);
            return;
        }
        this.taJs.track(eventName, properties, time, onComplete);
    }

    /**
     * 发送可更新事件
     * @param {object} options 参数对象
     *
     * options.eventName: 必须，事件名称
     * options.eventId: 必须，事件 ID, 用以标识可更新事件
     * options.time: 可选，事件时间
     * options.properties: 可选，事件属性
     * options.onComplete: 可选，事件上报回调，参数为 object
     */
    trackUpdate(options) {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.trackUpdate_native(options, this.appId);
            return;
        }
        this.taJs.trackUpdate(options);
    }

    /**
     * 发送可重写事件
     * @param {object} options 参数对象
     *
     * options.eventName: 必须，事件名称
     * options.eventId: 必须，事件 ID, 用以标识可更新事件
     * options.time: 可选，事件时间
     * options.properties: 可选，事件属性
     * options.onComplete: 可选，事件上报回调，参数为 object
     */
    trackOverwrite(options) {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.trackOverwrite_native(options, this.appId);
            return;
        }
        this.taJs.trackOverwrite(options);
    }

    /**
     * 发送首次事件
     * @param {object} options 参数对象
     *
     * options.eventName: 必须，事件名称
     * options.firstCheckId: 可选，用作首次检测标识，默认取随机生成的 #device_id
     * options.time: 可选，事件时间
     * options.properties: 可选，事件属性
     * options.onComplete: 可选，事件上报回调，参数为 object
     */
    trackFirstEvent(options) {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.trackFirstEvent_native(options, this.appId);
            return;
        }
        this.taJs.trackFirstEvent(options);
    }

    userSet(properties, time, onComplete) {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.userSet_native(properties, this.appId);
            return;
        }
        this.taJs.userSet(properties, time, onComplete);
    }

    userSetOnce(properties, time, onComplete) {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.userSetOnce_native(properties, this.appId);
            return;
        }
        this.taJs.userSetOnce(properties, time, onComplete);
    }

    userUnset(property, time, onComplete) {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.userUnset_native(property, this.appId);
            return;
        }
        this.taJs.userUnset(property, time, onComplete);
    }

    userDel(time, onComplete) {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.userDel_native(this.appId);
            return;
        }
        this.taJs.userDel(time, onComplete);
    }

    userAdd(properties, time, onComplete) {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.userAdd_native(properties, this.appId);
            return;
        }
        this.taJs.userAdd(properties, time, onComplete);
    }

    userAppend(properties, time, onComplete) {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.userAppend_native(properties, this.appId);
            return;
        }
        this.taJs.userAppend(properties, time, onComplete);
    }

    authorizeOpenID(id) {
        this.identify(id);
    }

    identify(id) {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.identify_native(id,this.appId);
            return;
        }
        this.taJs.identify(id);
    }

    getDistinctId(callback) {
        if (callback != null) {
            if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
                this.getDistinctId_native(callback, this.appId);
                return;
            } else {
                callback(this.taJs.getDistinctId());
            }
        }
        return this.taJs.getDistinctId();
    }

    login(accoundId) {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.login_native(accoundId,this.appId);
            return;
        }
        this.taJs.login(accoundId);
    }

    getAccountId(callback) {
        if (callback != null) {
            if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
                this.getAccountId_native(callback, this.appId);
                return;
            } else {
                callback(this.taJs.getAccountId());
            }
        }
        return this.taJs.getAccountId();
    }

    logout() {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.logout_native(this.appId);
            return;
        }
        this.taJs.logout();
    }

    setSuperProperties(obj) {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.setSuperProperties_native(obj,this.appId);
            return;
        }
        this.taJs.setSuperProperties(obj);
    }

    clearSuperProperties() {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.clearSuperProperties_native(this.appId);
            return;
        }
        this.taJs.clearSuperProperties();
    }

    unsetSuperProperty(propertyName) {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.unsetSuperProperty_native(propertyName,this.appId);
            return;
        }
        this.taJs.unsetSuperProperty(propertyName);
    }

    getSuperProperties(callback) {
        if (callback != null) {
            if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
                this.getSuperProperties_native(callback, this.appId);
                return;
            } else {
                callback(this.taJs.getSuperProperties());
            }
        }
        return this.taJs.getSuperProperties();
    }
    getPresetProperties(callback) {
        if (callback != null) {
            if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
                this.getPresetProperties_native(callback, this.appId);
                return;
            } else {
                callback(this.taJs.getPresetProperties());
            }
        }
        return this.taJs.getPresetProperties();
    }

    setDynamicSuperProperties(dynamicProperties) {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            if (typeof dynamicProperties === 'function') {
                this.dynamicProperties = dynamicProperties;
            } else {
                logger.warn('setDynamicSuperProperties 的参数必须是 function 类型');
            }
            return;
        }
        this.taJs.setDynamicSuperProperties(dynamicProperties);
    }

    timeEvent(eventName, time) {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            return this.timeEvent_native(eventName, this.appId);
        }
        return this.taJs.timeEvent(eventName, time);
    }

    getDeviceId(callback) {
        if (callback != null) {
            if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
                this.getDeviceId_native(callback, this.appId);
                return;
            } else {
                callback(this.taJs.getDeviceId());
            }
        }
        return this.taJs.getDeviceId();
    }


    /**
     * 暂停/开启上报
     * @param {bool} enabled YES：开启上报 NO：暂停上报
     */
    enableTracking(enabled) {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.enableTracking_native(enabled, this.appId);
            return;
        }
        this.taJs.enableTracking(enabled);
    }

    /**
     * 停止上报，后续的上报和设置都无效，数据将清空
     */
    optOutTracking() {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.optOutTracking_native(this.appId);
            return;
        }
        this.taJs.optOutTracking();
    }

    /**
     * 停止上报，后续的上报和设置都无效，数据将清空，并且发送 user_del
     */
    optOutTrackingAndDeleteUser() {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.optOutTrackingAndDeleteUser_native(this.appId);
            return;
        }
        this.taJs.optOutTrackingAndDeleteUser();
    }

    /**
     * 允许上报
     */
    optInTracking() {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.optInTracking_native(this.appId);
            return;
        }
        this.taJs.optInTracking();
    }

    //时间戳转换方法 date:时间 formatter:"yyyy-MM-dd HH:mm:ss.sss" (Local)
    formatDate(date) {
        if (date != null) {
            var yyyy = date.getFullYear();
            var MM = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
            var dd = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate());
            var HH = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours());
            var mm = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
            var ss = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
            var sss = (date.getMilliseconds() < 10 ? '00' + date.getMilliseconds() : (date.getMilliseconds() < 100 ? '0' + date.getMilliseconds() : date.getMilliseconds()));
            return yyyy + "-" + MM + "-" + dd + " " + HH + ":" + mm + ":" + ss + "." + sss;
        } else {
            return null;
        }
    }
    track_native(eventName, properties, time, appId) {
        var formatTime = this.formatDate(time);
        eventName = eventName!=null?eventName:"";
        properties = properties!=null?properties:{};
        formatTime = formatTime!=null?formatTime:"";
        appId = appId!=null?appId:"";
        var params = _.extend(properties, 
            this.dynamicProperties ? this.dynamicProperties() : {}
            );
        let msg = {eventName: eventName, properties: JSON.stringify(params), formatTime: formatTime, appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call("track", jsonMsg);
    }
    trackUpdate_native(taEvent, appId) {
        taEvent = taEvent!=null?taEvent:{};
        appId = appId!=null?appId:"";
        taEvent.properties = _.extend(taEvent.properties != null ? taEvent.properties : {}, 
            this.dynamicProperties ? this.dynamicProperties() : {}
            );
        let msg = {taEvent: JSON.stringify(taEvent), appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call("trackUpdate", jsonMsg);
    }
    trackFirstEvent_native(taEvent, appId) {
        taEvent = taEvent!=null?taEvent:{};
        appId = appId!=null?appId:"";
        taEvent.properties = _.extend(taEvent.properties != null ? taEvent.properties : {}, 
            this.dynamicProperties ? this.dynamicProperties() : {}
            );
        let msg = {taEvent: JSON.stringify(taEvent), appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call("trackFirstEvent", jsonMsg);
    }
    trackOverwrite_native(taEvent, appId) {
        taEvent = taEvent!=null?taEvent:{};
        appId = appId!=null?appId:"";
        taEvent.properties = _.extend(taEvent.properties != null ? taEvent.properties : {}, 
            this.dynamicProperties ? this.dynamicProperties() : {}
            );
        let msg = {taEvent: JSON.stringify(taEvent), appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call("trackOverwrite", jsonMsg);
    }
    timeEvent_native(eventName, appId) {
        eventName = eventName!=null?eventName:"";
        appId = appId!=null?appId:"";
        let msg = {eventName: eventName, appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call("timeEvent", jsonMsg);
    }
    login_native(accoundId, appId) {
        accoundId = accoundId!=null?accoundId:"";
        appId = appId!=null?appId:"";
        let msg = {accoundId: accoundId, appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call("login", jsonMsg);
    }
    logout_native(appId) {
        appId = appId!=null?appId:"";
        let msg = {appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call("logout", jsonMsg);
    }
    setSuperProperties_native(properties, appId) {
        properties = properties!=null?properties:{};
        appId = appId!=null?appId:"";
        let msg = {properties: JSON.stringify(properties), appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call("setSuperProperties", jsonMsg);
    }
    getSuperProperties_native(callback, appId) {
        appId = appId!=null?appId:"";
        let msg = {appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.addCallback("getSuperProperties", function(n) {
            callback(JSON.parse(n));
        });
        egret.ExternalInterface.call("getSuperProperties", jsonMsg);
    }
    unsetSuperProperty_native(property, appId) {
        property = property!=null?property:"";
        appId = appId!=null?appId:"";
        let msg = {property: property, appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call("unsetSuperProperty", jsonMsg);
    }
    clearSuperProperties_native(appId) {
        appId = appId!=null?appId:"";
        let msg = {appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call("clearSuperProperties", jsonMsg);
    }
    userSet_native(properties, appId) {
        properties = properties!=null?properties:{};
        appId = appId!=null?appId:"";
        let msg = {properties: JSON.stringify(properties), appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call("userSet", jsonMsg);
    }
    userSetOnce_native(properties, appId) {
        properties = properties!=null?properties:{};
        appId = appId!=null?appId:"";
        let msg = {properties: JSON.stringify(properties), appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call("userSetOnce", jsonMsg);
    }
    userAppend_native(properties, appId) {
        properties = properties!=null?properties:{};
        appId = appId!=null?appId:"";
        let msg = {properties: JSON.stringify(properties), appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call("userAppend", jsonMsg);
    }
    userAdd_native(properties, appId) {
        properties = properties!=null?properties:{};
        appId = appId!=null?appId:"";
        let msg = {properties: JSON.stringify(properties), appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call("userAdd", jsonMsg);
    }
    userUnset_native(property, appId) {
        property = property!=null?property:"";
        appId = appId!=null?appId:"";
        let msg = {property: property, appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call("userUnset", jsonMsg);
    }
    userDel_native(appId) {
        appId = appId!=null?appId:"";
        let msg = {appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call("userDel", jsonMsg);
    }
    authorizeOpenID_native(distinctId, appId) {
        this.identify_native(distinctId, appId);
    }
    identify_native(distinctId, appId) {
        distinctId = distinctId!=null?distinctId:"";
        appId = appId!=null?appId:"";
        let msg = {distinctId: distinctId, appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call("identify", jsonMsg);
    }
    initInstance_native(name, config, appId) {
        name = name!=null?name:"";
        config = config!=null?config:{};
        appId = appId!=null?appId:"";
        if (config != null) {
            let msg = {name: name, config: JSON.stringify(config)};
            let jsonMsg = JSON.stringify(msg);
            egret.ExternalInterface.call("initInstanceConfig", jsonMsg);
        } else {
            let msg = {name: name, appId: appId};
            let jsonMsg = JSON.stringify(msg);
            egret.ExternalInterface.call("initInstanceAppId", jsonMsg);
        }
    }
    lightInstance_native(name, appId, callback) {
        name = name!=null?name:"";
        appId = appId!=null?appId:"";
        let msg = {name: name, appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.addCallback("lightInstance", function(n) {
            callback(n);
        });
        egret.ExternalInterface.call("lightInstance", jsonMsg);
    }
    startThinkingAnalytics_native(appId) {
        appId = appId!=null?appId:"";
        let msg = {appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call("startThinkingAnalytics", jsonMsg);
    }
    setDynamicSuperProperties_native(dynamicProperties, appId) {
        appId = appId!=null?appId:"";
        let msg = {dynamicProperties: dynamicProperties, appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.addCallback("setDynamicSuperProperties", function(n) {
            // let properties = dynamicProperties();
        });
        egret.ExternalInterface.call("setDynamicSuperProperties", jsonMsg);
    }
    getDeviceId_native(callback, appId) {
        appId = appId!=null?appId:"";
        let msg = {appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.addCallback("getDeviceId", function(n) {
            callback(n);
        });
        egret.ExternalInterface.call("getDeviceId", jsonMsg);
    }
    getDistinctId_native(callback, appId) {
        appId = appId!=null?appId:"";
        let msg = {appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.addCallback("getDistinctId", function(n) {
            callback(n);
        });
        egret.ExternalInterface.call("getDistinctId", jsonMsg);
    }
    getAccountId_native(callback, appId) {
        appId = appId!=null?appId:"";
        let msg = {appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.addCallback("getAccountId", function(n) {
            callback(n);
        });
        egret.ExternalInterface.call("getAccountId", jsonMsg);
    }
    getPresetProperties_native(callback, appId) {
        appId = appId!=null?appId:"";
        let msg = {appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.addCallback("getPresetProperties", function(n) {
            var properties = JSON.parse(n);
            var presetProperties = {};
            var os = properties['#os'];
            presetProperties.os = _.isUndefined(os) ? '' : os;
            var screenWidth = properties['#screen_width'];
            presetProperties.screenWidth = _.isUndefined(screenWidth) ? 0 : screenWidth;
            var screenHeight = properties['#screen_height'];
            presetProperties.screenHeight = _.isUndefined(screenHeight) ? 0 : screenHeight;
            var networkType = properties['#network_type'];
            presetProperties.networkType = _.isUndefined(networkType) ? '' : networkType;
            var deviceModel = properties['#device_model'];
            presetProperties.deviceModel = _.isUndefined(deviceModel) ? '' : deviceModel;
            var osVersion = properties['#os_version'];
            presetProperties.osVersion = _.isUndefined(osVersion) ? '' : osVersion;
            var deviceId = properties['#device_id'];
            presetProperties.deviceId = _.isUndefined(deviceId) ? '' : deviceId;
            var zoneOffset = properties['#zone_offset'];
            presetProperties.zoneOffset = _.isUndefined(zoneOffset) ? '' : zoneOffset;
            var manufacturer = properties['#manufacturer'];
            presetProperties.manufacturer = _.isUndefined(manufacturer) ? '' : manufacturer;
            presetProperties.toEventPresetProperties = function() {
                return {
                    '#device_model':presetProperties.deviceModel,
                    '#device_id':presetProperties.deviceId,
                    '#screen_width':presetProperties.screenWidth,
                    '#screen_height':presetProperties.screenHeight,
                    '#os':presetProperties.os,
                    '#os_version':presetProperties.osVersion,
                    '#network_type':presetProperties.networkType,
                    '#zone_offset':presetProperties.zoneOffset,
                    '#manufacturer':presetProperties.manufacturer
                };
            };
            callback(presetProperties);
        });
        egret.ExternalInterface.call("getPresetProperties", jsonMsg);
    }
    enableTracking_native(enabled, appId) {
        enabled = enabled!=null?enabled:false;
        appId = appId!=null?appId:"";
        let msg = {enabled: enabled.toString(), appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call("enableTracking", jsonMsg);
    }
    optOutTracking_native(appId) {
        appId = appId!=null?appId:"";
        let msg = {appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call("optOutTracking", jsonMsg);
    }
    optOutTrackingAndDeleteUser_native(appId) {
        appId = appId!=null?appId:"";
        let msg = {appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call("optOutTrackingAndDeleteUser", jsonMsg);
    }
    optInTracking_native(appId) {
        appId = appId!=null?appId:"";
        let msg = {appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call("optInTracking", jsonMsg);
    }
}

window['ThinkingAnalyticsAPI'] = ThinkingDataAPIForNative;

import ThinkingDataAPI from './ThinkingDataAPI';
window['ThinkingAnalyticsAPIForJS'] = ThinkingDataAPI;
