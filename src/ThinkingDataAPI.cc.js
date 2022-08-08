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

export default class ThinkingDataAPIForNative {
    constructor(config) {
        config.appId = config.appId ? _.checkAppId(config.appId) : _.checkAppId(config.appid);
        config.serverUrl = config.serverUrl ? _.checkUrl(config.serverUrl) : _.checkUrl(config.server_url);
        var defaultConfig = _.extend({}, DEFAULT_CONFIG, PlatformAPI.getConfig());
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
        if (cc.sys.isNative && cc.sys.os=='iOS') {
            return true;
        } else {
            return false;
        }
    }
    _isAndroid() {
        if (cc.sys.isNative && cc.sys.os=='Android') {
            return true;
        } else {
            return false;
        }
    }
    // internal init function. it should not be used by users.
    _init(config) {
        this.name = config.name;
        this.appId = config.appId || config.appid;

        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.initInstance_native(this.name, config, this.appId);
            this._readStorage(config);
        }
        else {
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

    getDistinctId() {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            return this.getDistinctId_native(this.appId);
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

    getAccountId() {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            return this.getAccountId_native(this.appId);
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

    getSuperProperties() {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            return this.getSuperProperties_native(this.appId);
        }
        return this.taJs.getSuperProperties();
    }
    getPresetProperties() {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            var properties = this.getPresetProperties_native(this.appId);
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
            var osVersion   = properties['#os_version'];
            presetProperties.osVersion   = _.isUndefined(osVersion) ? '' : osVersion;
            presetProperties.deviceId = this.getDeviceId();
            var zoneOffset = 0 - (new Date().getTimezoneOffset() / 60.0);
            presetProperties.zoneOffset = zoneOffset;
            var manufacturer = properties['#manufacturer'];
            presetProperties.manufacturer   = _.isUndefined(manufacturer) ? '' : manufacturer;
            presetProperties.toEventPresetProperties = function() {
                return {
                    '#device_model':presetProperties.deviceModel,
                    '#device_id':presetProperties.deviceId,
                    '#screen_width':presetProperties.screenWidth,
                    '#screen_height':presetProperties.screenHeight,
                    '#os':presetProperties.os,
                    '#os_version':presetProperties.osVersion,
                    '#network_type':presetProperties.networkType,
                    '#zone_offset':zoneOffset,
                    '#manufacturer':presetProperties.manufacturer
                };
            };
            return presetProperties;
        }
        return this.taJs.getPresetProperties();
    }

    setDynamicSuperProperties(dynamicProperties) {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            let w = window;
            w.__dynamicPropertiesForNative = function(s){
                console.log('__dynamicPropertiesForNative: native msg: ', s);
                let properties = dynamicProperties();
                return JSON.stringify(properties);
            };
            this.setDynamicSuperProperties_native('__dynamicPropertiesForNative');
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

    getDeviceId() {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            return this.getDeviceId_native(this.appId);
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
        if (properties == null) properties = {};
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod("com/cocos/game/CocosCreatorProxyApi", "track", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", eventName, JSON.stringify(properties), formatTime, appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod("CocosCreatorProxyApi","track:properties:time:appId:", eventName, JSON.stringify(properties), formatTime, appId);            
        }
    }
    trackUpdate_native(taEvent, appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod("com/cocos/game/CocosCreatorProxyApi", "trackUpdate", "(Ljava/lang/String;Ljava/lang/String;)V", JSON.stringify(taEvent), appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod("CocosCreatorProxyApi","trackUpdate:appId:", JSON.stringify(taEvent), appId);
        }
    }
    trackFirstEvent_native(taEvent, appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod("com/cocos/game/CocosCreatorProxyApi", "trackFirstEvent", "(Ljava/lang/String;Ljava/lang/String;)V", JSON.stringify(taEvent), appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod("CocosCreatorProxyApi","trackFirstEvent:appId:", JSON.stringify(taEvent), appId);
        }
    }
    trackOverwrite_native(taEvent, appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod("com/cocos/game/CocosCreatorProxyApi", "trackOverwrite", "(Ljava/lang/String;Ljava/lang/String;)V", JSON.stringify(taEvent), appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod("CocosCreatorProxyApi","trackOverwrite:appId:", JSON.stringify(taEvent), appId);
        }
    }
    timeEvent_native(eventName, appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod("com/cocos/game/CocosCreatorProxyApi", "timeEvent", "(Ljava/lang/String;Ljava/lang/String;)V", eventName, appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod("CocosCreatorProxyApi","timeEvent:appId:", eventName, appId);
        }
    }
    login_native(accoundId, appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod("com/cocos/game/CocosCreatorProxyApi", "login", "(Ljava/lang/String;Ljava/lang/String;)V", accoundId, appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod("CocosCreatorProxyApi","login:appId:", accoundId, appId);
        }
    }
    logout_native(appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod("com/cocos/game/CocosCreatorProxyApi", "logout", "(Ljava/lang/String;)V", appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod("CocosCreatorProxyApi","logout:", appId);
        }
    }
    setSuperProperties_native(properties, appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod("com/cocos/game/CocosCreatorProxyApi", "setSuperProperties", "(Ljava/lang/String;Ljava/lang/String;)V", JSON.stringify(properties), appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod("CocosCreatorProxyApi","setSuperProperties:appId:", JSON.stringify(properties), appId);
        }
    }
    getSuperProperties_native(appId) {
        var properties = '{}';
        if (this._isAndroid()) {
            properties = jsb.reflection.callStaticMethod("com/cocos/game/CocosCreatorProxyApi", "getSuperProperties", "(Ljava/lang/String;)V", appId);
        }
        else if (this._isIOS()) {
            properties =  jsb.reflection.callStaticMethod("CocosCreatorProxyApi","getSuperProperties:", appId);
        }
        return JSON.parse(properties);
    }
    unsetSuperProperty_native(property, appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod("com/cocos/game/CocosCreatorProxyApi", "unsetSuperProperty", "(Ljava/lang/String;Ljava/lang/String;)V", property, appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod("CocosCreatorProxyApi","unsetSuperProperty:appId:", property, appId);
        }
    }
    clearSuperProperties_native(appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod("com/cocos/game/CocosCreatorProxyApi", "clearSuperProperties", "(Ljava/lang/String;)V", appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod("CocosCreatorProxyApi","clearSuperProperties:", appId);
        }
    }
    userSet_native(properties, appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod("com/cocos/game/CocosCreatorProxyApi", "userSet", "(Ljava/lang/String;Ljava/lang/String;)V", JSON.stringify(properties), appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod("CocosCreatorProxyApi","userSet:appId:", JSON.stringify(properties), appId);
        }
    }
    userSetOnce_native(properties, appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod("com/cocos/game/CocosCreatorProxyApi", "userSetOnce", "(Ljava/lang/String;Ljava/lang/String;)V", JSON.stringify(properties), appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod("CocosCreatorProxyApi","userSetOnce:appId:", JSON.stringify(properties), appId);
        }
    }
    userAppend_native(properties, appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod("com/cocos/game/CocosCreatorProxyApi", "userAppend", "(Ljava/lang/String;Ljava/lang/String;)V", JSON.stringify(properties), appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod("CocosCreatorProxyApi","userAppend:appId:", JSON.stringify(properties), appId);
        }
    }
    userAdd_native(properties, appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod("com/cocos/game/CocosCreatorProxyApi", "userAdd", "(Ljava/lang/String;Ljava/lang/String;)V", JSON.stringify(properties), appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod("CocosCreatorProxyApi","userAdd:appId:", JSON.stringify(properties), appId);
        }
    }
    userUnset_native(property, appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod("com/cocos/game/CocosCreatorProxyApi", "userUnset", "(Ljava/lang/String;Ljava/lang/String;)V", property, appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod("CocosCreatorProxyApi","userUnset:appId:", property, appId);
        }
    }
    userDel_native(appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod("com/cocos/game/CocosCreatorProxyApi", "userDel", "(Ljava/lang/String;)V", appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod("CocosCreatorProxyApi","userDel:", appId);
        }
    }
    authorizeOpenID_native(distinctId, appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod("com/cocos/game/CocosCreatorProxyApi", "authorizeOpenID", "(Ljava/lang/String;Ljava/lang/String;)V", distinctId, appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod("CocosCreatorProxyApi","authorizeOpenID:appId:", distinctId, appId);
        }
    }
    identify_native(distinctId, appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod("com/cocos/game/CocosCreatorProxyApi", "identify", "(Ljava/lang/String;Ljava/lang/String;)V", distinctId, appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod("CocosCreatorProxyApi","identify:appId:", distinctId, appId);
        }
    }
    initInstance_native(name, config, appId) {
        if (this._isAndroid()) {
            if (config != null) {
                jsb.reflection.callStaticMethod("com/cocos/game/CocosCreatorProxyApi", "initInstanceConfig", "(Ljava/lang/String;Ljava/lang/String;)V", name, JSON.stringify(config));
            } else {
                jsb.reflection.callStaticMethod("com/cocos/game/CocosCreatorProxyApi", "initInstanceAppId", "(Ljava/lang/String;Ljava/lang/String;)V", name, appId);
            }    
        }
        else if (this._isIOS()) {
            if (config != null) {
                jsb.reflection.callStaticMethod("CocosCreatorProxyApi","initInstance:config:", name, JSON.stringify(config));
            } else {
                jsb.reflection.callStaticMethod("CocosCreatorProxyApi","initInstance:appId:", name, appId);
            }
        }
    }
    lightInstance_native(name, appId) {
        if (this._isAndroid()) {
            return jsb.reflection.callStaticMethod("com/cocos/game/CocosCreatorProxyApi", "lightInstance", "(Ljava/lang/String;Ljava/lang/String;)V", name, appId);
        }
        else if (this._isIOS()) {
            return jsb.reflection.callStaticMethod("CocosCreatorProxyApi","lightInstance:appId:", name, appId);
        }
    }
    startThinkingAnalytics_native(appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod("com/cocos/game/CocosCreatorProxyApi", "startThinkingAnalytics", "(Ljava/lang/String;)V", appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod("CocosCreatorProxyApi","startThinkingAnalytics:", appId);
        }
    }
    setDynamicSuperProperties_native(callFromNative, appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod("com/cocos/game/CocosCreatorProxyApi", "setDynamicSuperProperties", "(Ljava/lang/String;Ljava/lang/String;)V", callFromNative, appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod("CocosCreatorProxyApi","setDynamicSuperProperties:appId:", callFromNative, appId);
        }
    }
    getDeviceId_native(appId) {
        if (this._isAndroid()) {
            return jsb.reflection.callStaticMethod("com/cocos/game/CocosCreatorProxyApi", "getDeviceId", "(Ljava/lang/String;)Ljava/lang/String;", appId);
        } 
        else if (this._isIOS()) {
            return jsb.reflection.callStaticMethod("CocosCreatorProxyApi","getDeviceId:", appId);
        }
    }
    getDistinctId_native(appId) {
        if (this._isAndroid()) {
            return jsb.reflection.callStaticMethod("com/cocos/game/CocosCreatorProxyApi", "getDistinctId", "(Ljava/lang/String;)Ljava/lang/String;", appId);
        } 
        else if (this._isIOS()) {
            return jsb.reflection.callStaticMethod("CocosCreatorProxyApi","getDistinctId:", appId);
        }
    }
    getAccountId_native(appId) {
        if (this._isAndroid()) {
            return jsb.reflection.callStaticMethod("com/cocos/game/CocosCreatorProxyApi", "getAccountId", "(Ljava/lang/String;)Ljava/lang/String;", appId);
        } 
        else if (this._isIOS()) {
            return jsb.reflection.callStaticMethod("CocosCreatorProxyApi","getAccountId:", appId);
        }
    }
    getPresetProperties_native(appId) {
        var properties = '{}';
        if (this._isAndroid()) {
            properties = jsb.reflection.callStaticMethod("com/cocos/game/CocosCreatorProxyApi", "getPresetProperties", "(Ljava/lang/String;)Ljava/lang/String;", appId);
        } 
        else if (this._isIOS()) {
            properties = jsb.reflection.callStaticMethod("CocosCreatorProxyApi","getPresetProperties:", appId);
        }
        return JSON.parse(properties);
    }
    enableTracking_native(enabled, appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod("com/cocos/game/CocosCreatorProxyApi", "enableTracking", "(Ljava/lang/String;Ljava/lang/String;)V", enabled.toString(), appId);
        } 
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod("CocosCreatorProxyApi","enableTracking:appId:", enabled.toString(), appId);
        }
    }
    optOutTracking_native(appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod("com/cocos/game/CocosCreatorProxyApi", "optOutTracking", "(Ljava/lang/String;)V", appId);
        } 
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod("CocosCreatorProxyApi","optOutTracking:", appId);
        }
    }
    optOutTrackingAndDeleteUser_native(appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod("com/cocos/game/CocosCreatorProxyApi", "optOutTrackingAndDeleteUser", "(Ljava/lang/String;)V", appId);
        } 
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod("CocosCreatorProxyApi","optOutTrackingAndDeleteUser:", appId);
        }
    }
    optInTracking_native(appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod("com/cocos/game/CocosCreatorProxyApi", "optInTracking", "(Ljava/lang/String;)V", appId);
        } 
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod("CocosCreatorProxyApi","optInTracking:", appId);
        }
    }
}

window['ThinkingAnalyticsAPI'] = ThinkingDataAPIForNative;

import ThinkingDataAPI from './ThinkingDataAPI';
window['ThinkingAnalyticsAPIForJS'] = ThinkingDataAPI;

