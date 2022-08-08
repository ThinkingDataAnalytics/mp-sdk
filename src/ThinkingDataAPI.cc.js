/* eslint-disable no-undef */
import {
    _,
} from './utils';

// Information for default properties: #lib_name, #lib_version, etc.
// The value of these properties is set in compile process.
import {
    Config
} from './Config';

// PlatformAPI provides interfaces for storage, network, system information, etc.
import PlatformAPI from './PlatformAPI';

const DEFAULT_CONFIG = {
    name: 'thinkingdata', // 全局变量名称
    enableLog: true, // 是否打开日志
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
        if (cc.sys.isNative && cc.sys.os === 'iOS') {
            return true;
        } else {
            return false;
        }
    }
    _isAndroid() {
        if (cc.sys.isNative && cc.sys.os === 'Android') {
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
            this.initInstanceForNative(this.name, config, this.appId);
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
        // 先尝试同步获取js层缓存，如失败则异步获取js层缓存
        this._state = PlatformAPI.getStorage(name) || {};
        if(_.isEmptyObject(this._state)) {
            this._state = PlatformAPI.getStorage(nameOld) || {};
        }
        if(_.isEmptyObject(this._state)) {
            PlatformAPI.getStorage(name, true, (data) => {
                if (_.isEmptyObject(data)) {
                    PlatformAPI.getStorage(nameOld, true, (dataOld) => {
                        this._state = _.extend2Layers({}, dataOld, this._state);
                    });
                } else {
                    this._state = _.extend2Layers({}, data, this._state);
                }
                //获取js层缓存成功，提取访客id和账号id
                if (this._state.distinct_id) {
                    this.identifyForNative(this._state.distinct_id);
                }
                if (this._state.account_id) {
                    this.loginForNative(this._state.account_id);
                }        
            });
        } else {
            //获取js层缓存成功，提取访客id和账号id
            if (this._state.distinct_id) {
                this.identifyForNative(this._state.distinct_id);
            }
            if (this._state.account_id) {
                this.loginForNative(this._state.account_id);
            }
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
            if (!_.isUndefined(config)) {
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
            let w = window;
            var _that = this;
            w.__autoTrackCallback = function(s){
                if (_.isFunction(_that.config.autoTrack.callback)) {
                    let properties = _that.config.autoTrack.callback(s);
                    return JSON.stringify(properties);
                } else {
                    return '{}';
                }
            };
            this.startThinkingAnalyticsForNative();
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
            this.trackForNative(eventName, properties, time, this.appId);
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
            this.trackUpdateForNative(options, this.appId);
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
            this.trackOverwriteForNative(options, this.appId);
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
            this.trackFirstEventForNative(options, this.appId);
            return;
        }
        this.taJs.trackFirstEvent(options);
    }

    userSet(properties, time, onComplete) {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.userSetForNative(properties, this.appId);
            return;
        }
        this.taJs.userSet(properties, time, onComplete);
    }

    userSetOnce(properties, time, onComplete) {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.userSetOnceForNative(properties, this.appId);
            return;
        }
        this.taJs.userSetOnce(properties, time, onComplete);
    }

    userUnset(property, time, onComplete) {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.userUnsetForNative(property, this.appId);
            return;
        }
        this.taJs.userUnset(property, time, onComplete);
    }

    userDel(time, onComplete) {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.userDelForNative(this.appId);
            return;
        }
        this.taJs.userDel(time, onComplete);
    }

    userAdd(properties, time, onComplete) {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.userAddForNative(properties, this.appId);
            return;
        }
        this.taJs.userAdd(properties, time, onComplete);
    }

    userAppend(properties, time, onComplete) {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.userAppendForNative(properties, this.appId);
            return;
        }
        this.taJs.userAppend(properties, time, onComplete);
    }

    userUniqAppend(properties, time, onComplete) {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.userUniqAppendForNative(properties, this.appId);
            return;
        }
        this.taJs.userUniqAppend(properties, time, onComplete);
    }

    authorizeOpenID(id) {
        this.identify(id);
    }

    identify(id) {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.identifyForNative(id,this.appId);
            return;
        }
        this.taJs.identify(id);
    }

    getDistinctId() {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            return this.getDistinctIdForNative(this.appId);
        }
        return this.taJs.getDistinctId();
    }

    login(accoundId) {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.loginForNative(accoundId,this.appId);
            return;
        }
        this.taJs.login(accoundId);
    }

    getAccountId() {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            return this.getAccountIdForNative(this.appId);
        }
        return this.taJs.getAccountId();
    }

    logout() {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.logoutForNative(this.appId);
            return;
        }
        this.taJs.logout();
    }

    setSuperProperties(obj) {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.setSuperPropertiesForNative(obj,this.appId);
            return;
        }
        this.taJs.setSuperProperties(obj);
    }

    clearSuperProperties() {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.clearSuperPropertiesForNative(this.appId);
            return;
        }
        this.taJs.clearSuperProperties();
    }

    unsetSuperProperty(propertyName) {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.unsetSuperPropertyForNative(propertyName,this.appId);
            return;
        }
        this.taJs.unsetSuperProperty(propertyName);
    }

    getSuperProperties() {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            return this.getSuperPropertiesForNative(this.appId);
        }
        return this.taJs.getSuperProperties();
    }
    getPresetProperties() {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            var properties = this.getPresetPropertiesForNative(this.appId);
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
            if (typeof dynamicProperties === 'function') {
                this.dynamicProperties = dynamicProperties;
                let w = window;
                w.__dynamicPropertiesForNative = function(s){
                    console.log('__dynamicPropertiesForNative: native msg: ', s);
                    let properties = dynamicProperties();
                    properties = _.encodeDates(properties);
                    return JSON.stringify(properties);
                };
                this.setDynamicSuperPropertiesForNative('__dynamicPropertiesForNative');
            } else {
                logger.warn('setDynamicSuperProperties parameter must be a function type');
            }
            return;
        }
        this.taJs.setDynamicSuperProperties(dynamicProperties);
    }

    timeEvent(eventName, time) {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            return this.timeEventForNative(eventName, this.appId);
        }
        return this.taJs.timeEvent(eventName, time);
    }

    getDeviceId() {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            return this.getDeviceIdForNative(this.appId);
        }
        return this.taJs.getDeviceId();
    }

    /**
     * 暂停/开启上报
     * @param {bool} enabled YES：开启上报 NO：暂停上报
     * @deprecated This method is deprecated, use setTrackStatus() instand.
     */
    enableTracking(enabled) {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.enableTrackingForNative(enabled, this.appId);
            return;
        }
        this.taJs.enableTracking(enabled);
    }

    /**
     * 停止上报，后续的上报和设置都无效，数据将清空
     * @deprecated This method is deprecated, use setTrackStatus() instand.
     */
    optOutTracking() {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.optOutTrackingForNative(this.appId);
            return;
        }
        this.taJs.optOutTracking();
    }

    /**
     * 停止上报，后续的上报和设置都无效，数据将清空，并且发送 user_del
     * @deprecated This method is deprecated, use setTrackStatus() instand.
     */
    optOutTrackingAndDeleteUser() {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.optOutTrackingAndDeleteUserForNative(this.appId);
            return;
        }
        this.taJs.optOutTrackingAndDeleteUser();
    }

    /**
     * 允许上报
     * @deprecated This method is deprecated, use setTrackStatus() instand.
     */
    optInTracking() {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.optInTrackingForNative(this.appId);
            return;
        }
        this.taJs.optInTracking();
    }

    /**
    * 设置数据上报状态
    * PAUSE 暂停数据上报
    * STOP 停止数据上报，并清除缓存
    * SAVE_ONLY 数据入库，但不上报 (接入Native原生可支持，JS暂不支持此状态，默认等同 NORMAL)
    * NORMAL 恢复数据上报
    * @param {string} status 上报状态
    */
    setTrackStatus(status) {
        if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
            this.setTrackStatusForNative(status, this.appId);
            return;
        }
        this.taJs.setTrackStatus(status);
    }

    trackForNative(eventName, properties, time, appId) {
        var formatTime = _.isDate(time)?_.formatDate(time):'';
        if (_.isUndefined(properties)) properties = {};
        properties = _.extend(properties,
            this.dynamicProperties ? this.dynamicProperties() : {}
        );
        properties = _.encodeDates(properties);
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'track', '(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V', eventName, JSON.stringify(properties), formatTime, appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi','track:properties:time:appId:', eventName, JSON.stringify(properties), formatTime, appId);
        }
    }
    trackUpdateForNative(taEvent, appId) {
        taEvent.properties = _.extend(!_.isUndefined(taEvent.properties) ? taEvent.properties : {},
            this.dynamicProperties ? this.dynamicProperties() : {}
        );
        taEvent = _.encodeDates(taEvent);
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'trackUpdate', '(Ljava/lang/String;Ljava/lang/String;)V', JSON.stringify(taEvent), appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi','trackUpdate:appId:', JSON.stringify(taEvent), appId);
        }
    }
    trackFirstEventForNative(taEvent, appId) {
        taEvent.properties = _.extend(!_.isUndefined(taEvent.properties) ? taEvent.properties : {},
            this.dynamicProperties ? this.dynamicProperties() : {}
        );
        taEvent = _.encodeDates(taEvent);
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'trackFirstEvent', '(Ljava/lang/String;Ljava/lang/String;)V', JSON.stringify(taEvent), appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi','trackFirstEvent:appId:', JSON.stringify(taEvent), appId);
        }
    }
    trackOverwriteForNative(taEvent, appId) {
        taEvent.properties = _.extend(!_.isUndefined(taEvent.properties) ? taEvent.properties : {},
            this.dynamicProperties ? this.dynamicProperties() : {}
        );
        taEvent = _.encodeDates(taEvent);
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'trackOverwrite', '(Ljava/lang/String;Ljava/lang/String;)V', JSON.stringify(taEvent), appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi','trackOverwrite:appId:', JSON.stringify(taEvent), appId);
        }
    }
    timeEventForNative(eventName, appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'timeEvent', '(Ljava/lang/String;Ljava/lang/String;)V', eventName, appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi','timeEvent:appId:', eventName, appId);
        }
    }
    loginForNative(accoundId, appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'login', '(Ljava/lang/String;Ljava/lang/String;)V', accoundId, appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi','login:appId:', accoundId, appId);
        }
    }
    logoutForNative(appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'logout', '(Ljava/lang/String;)V', appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi','logout:', appId);
        }
    }
    setSuperPropertiesForNative(properties, appId) {
        properties = _.encodeDates(properties);
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'setSuperProperties', '(Ljava/lang/String;Ljava/lang/String;)V', JSON.stringify(properties), appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi','setSuperProperties:appId:', JSON.stringify(properties), appId);
        }
    }
    getSuperPropertiesForNative(appId) {
        var properties = '{}';
        if (this._isAndroid()) {
            properties = jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'getSuperProperties', '(Ljava/lang/String;)V', appId);
        }
        else if (this._isIOS()) {
            properties =  jsb.reflection.callStaticMethod('CocosCreatorProxyApi','getSuperProperties:', appId);
        }
        return JSON.parse(properties);
    }
    unsetSuperPropertyForNative(property, appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'unsetSuperProperty', '(Ljava/lang/String;Ljava/lang/String;)V', property, appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi','unsetSuperProperty:appId:', property, appId);
        }
    }
    clearSuperPropertiesForNative(appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'clearSuperProperties', '(Ljava/lang/String;)V', appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi','clearSuperProperties:', appId);
        }
    }
    userSetForNative(properties, appId) {
        properties = _.encodeDates(properties);
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'userSet', '(Ljava/lang/String;Ljava/lang/String;)V', JSON.stringify(properties), appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi','userSet:appId:', JSON.stringify(properties), appId);
        }
    }
    userSetOnceForNative(properties, appId) {
        properties = _.encodeDates(properties);
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'userSetOnce', '(Ljava/lang/String;Ljava/lang/String;)V', JSON.stringify(properties), appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi','userSetOnce:appId:', JSON.stringify(properties), appId);
        }
    }
    userAppendForNative(properties, appId) {
        properties = _.encodeDates(properties);
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'userAppend', '(Ljava/lang/String;Ljava/lang/String;)V', JSON.stringify(properties), appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi','userAppend:appId:', JSON.stringify(properties), appId);
        }
    }
    userUniqAppendForNative(properties, appId) {
        properties = _.encodeDates(properties);
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'userUniqAppend', '(Ljava/lang/String;Ljava/lang/String;)V', JSON.stringify(properties), appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi','userUniqAppend:appId:', JSON.stringify(properties), appId);
        }
    }
    userAddForNative(properties, appId) {
        properties = _.encodeDates(properties);
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'userAdd', '(Ljava/lang/String;Ljava/lang/String;)V', JSON.stringify(properties), appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi','userAdd:appId:', JSON.stringify(properties), appId);
        }
    }
    userUnsetForNative(property, appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'userUnset', '(Ljava/lang/String;Ljava/lang/String;)V', property, appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi','userUnset:appId:', property, appId);
        }
    }
    userDelForNative(appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'userDel', '(Ljava/lang/String;)V', appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi','userDel:', appId);
        }
    }
    authorizeOpenIDForNative(distinctId, appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'authorizeOpenID', '(Ljava/lang/String;Ljava/lang/String;)V', distinctId, appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi','authorizeOpenID:appId:', distinctId, appId);
        }
    }
    identifyForNative(distinctId, appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'identify', '(Ljava/lang/String;Ljava/lang/String;)V', distinctId, appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi','identify:appId:', distinctId, appId);
        }
    }
    initInstanceForNative(name, config, appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi','setCustomerLibInfo', '(Ljava/lang/String;Ljava/lang/String;)V', Config.LIB_NAME, Config.LIB_VERSION);
            if (!_.isUndefined(config)) {
                jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'initInstanceConfig', '(Ljava/lang/String;Ljava/lang/String;)V', name, JSON.stringify(config));
            } else {
                jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'initInstanceAppId', '(Ljava/lang/String;Ljava/lang/String;)V', name, appId);
            }
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi','setCustomerLibInfoWithLibName:libVersion:', Config.LIB_NAME, Config.LIB_VERSION);
            if (!_.isUndefined(config)) {
                jsb.reflection.callStaticMethod('CocosCreatorProxyApi','initInstance:config:', name, JSON.stringify(config));
            } else {
                jsb.reflection.callStaticMethod('CocosCreatorProxyApi','initInstance:appId:', name, appId);
            }
        }
    }
    lightInstanceForNative(name, appId) {
        if (this._isAndroid()) {
            return jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'lightInstance', '(Ljava/lang/String;Ljava/lang/String;)V', name, appId);
        }
        else if (this._isIOS()) {
            return jsb.reflection.callStaticMethod('CocosCreatorProxyApi','lightInstance:appId:', name, appId);
        }
    }
    startThinkingAnalyticsForNative(appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'startThinkingAnalytics', '(Ljava/lang/String;)V', appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi','startThinkingAnalytics:', appId);
        }
    }
    setDynamicSuperPropertiesForNative(callFromNative, appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'setDynamicSuperProperties', '(Ljava/lang/String;Ljava/lang/String;)V', callFromNative, appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi','setDynamicSuperProperties:appId:', callFromNative, appId);
        }
    }
    getDeviceIdForNative(appId) {
        if (this._isAndroid()) {
            return jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'getDeviceId', '(Ljava/lang/String;)Ljava/lang/String;', appId);
        }
        else if (this._isIOS()) {
            return jsb.reflection.callStaticMethod('CocosCreatorProxyApi','getDeviceId:', appId);
        }
    }
    getDistinctIdForNative(appId) {
        if (this._isAndroid()) {
            return jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'getDistinctId', '(Ljava/lang/String;)Ljava/lang/String;', appId);
        }
        else if (this._isIOS()) {
            return jsb.reflection.callStaticMethod('CocosCreatorProxyApi','getDistinctId:', appId);
        }
    }
    getAccountIdForNative(appId) {
        if (this._isAndroid()) {
            return jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'getAccountId', '(Ljava/lang/String;)Ljava/lang/String;', appId);
        }
        else if (this._isIOS()) {
            return jsb.reflection.callStaticMethod('CocosCreatorProxyApi','getAccountId:', appId);
        }
    }
    getPresetPropertiesForNative(appId) {
        var properties = '{}';
        if (this._isAndroid()) {
            properties = jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'getPresetProperties', '(Ljava/lang/String;)Ljava/lang/String;', appId);
        }
        else if (this._isIOS()) {
            properties = jsb.reflection.callStaticMethod('CocosCreatorProxyApi','getPresetProperties:', appId);
        }
        return JSON.parse(properties);
    }
    enableTrackingForNative(enabled, appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'enableTracking', '(Ljava/lang/String;Ljava/lang/String;)V', enabled.toString(), appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi','enableTracking:appId:', enabled.toString(), appId);
        }
    }
    optOutTrackingForNative(appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'optOutTracking', '(Ljava/lang/String;)V', appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi','optOutTracking:', appId);
        }
    }
    optOutTrackingAndDeleteUserForNative(appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'optOutTrackingAndDeleteUser', '(Ljava/lang/String;)V', appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi','optOutTrackingAndDeleteUser:', appId);
        }
    }
    optInTrackingForNative(appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'optInTracking', '(Ljava/lang/String;)V', appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi','optInTracking:', appId);
        }
    }

    setTrackStatusForNative(status, appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'setTrackStatus', '(Ljava/lang/String;Ljava/lang/String;)V', status, appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi','setTrackStatus:appId:', status, appId);
        }
    }
}

window['ThinkingAnalyticsAPI'] = ThinkingDataAPIForNative;

import ThinkingDataAPI from './ThinkingDataAPI';
window['ThinkingAnalyticsAPIForJS'] = ThinkingDataAPI;

