/* eslint-disable no-undef */
import {
    _,
    logger
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
        if (egret.Capabilities.os === 'iOS' && egret.Capabilities.runtimeType === egret.RuntimeType.RUNTIME2) {
            return true;
        } else {
            return false;
        }
    }
    _isAndroid() {
        if (egret.Capabilities.os === 'Android' && egret.Capabilities.runtimeType === egret.RuntimeType.RUNTIME2) {
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
            this.initInstanceForNative(this.name, config, this.appId);
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

    getDistinctId(callback) {
        if (!_.isUndefined(callback)) {
            if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
                this.getDistinctIdForNative(callback, this.appId);
                return;
            } else {
                callback(this.taJs.getDistinctId());
            }
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

    getAccountId(callback) {
        if (!_.isUndefined(callback)) {
            if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
                this.getAccountIdForNative(callback, this.appId);
                return;
            } else {
                callback(this.taJs.getAccountId());
            }
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

    getSuperProperties(callback) {
        if (!_.isUndefined(callback)) {
            if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
                this.getSuperPropertiesForNative(callback, this.appId);
                return;
            } else {
                callback(this.taJs.getSuperProperties());
            }
        }
        return this.taJs.getSuperProperties();
    }
    getPresetProperties(callback) {
        if (!_.isUndefined(callback)) {
            if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
                this.getPresetPropertiesForNative(callback, this.appId);
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

    getDeviceId(callback) {
        if (!_.isUndefined(callback)) {
            if (this._isNativePlatform()) {//判断是否是原生平台并且是否是iOS平台
                this.getDeviceIdForNative(callback, this.appId);
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
        eventName = !_.isUndefined(eventName)?eventName:'';
        properties = !_.isUndefined(properties)?properties:{};
        formatTime = !_.isUndefined(formatTime)?formatTime:'';
        appId = !_.isUndefined(appId)?appId:'';
        var params = _.extend(properties,
            this.dynamicProperties ? this.dynamicProperties() : {}
        );
        params = _.encodeDates(params);
        let msg = {eventName: eventName, properties: JSON.stringify(params), formatTime: formatTime, appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call('track', jsonMsg);
    }
    trackUpdateForNative(taEvent, appId) {
        taEvent = !_.isUndefined(taEvent)?taEvent:{};
        appId = !_.isUndefined(appId)?appId:'';
        taEvent.properties = _.extend(!_.isUndefined(taEvent.properties) ? taEvent.properties : {},
            this.dynamicProperties ? this.dynamicProperties() : {}
        );
        taEvent.properties = _.encodeDates(taEvent.properties);
        let msg = {taEvent: JSON.stringify(taEvent), appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call('trackUpdate', jsonMsg);
    }
    trackFirstEventForNative(taEvent, appId) {
        taEvent = !_.isUndefined(taEvent)?taEvent:{};
        appId = !_.isUndefined(appId)?appId:'';
        taEvent.properties = _.extend(!_.isUndefined(taEvent.properties) ? taEvent.properties : {},
            this.dynamicProperties ? this.dynamicProperties() : {}
        );
        taEvent.properties = _.encodeDates(taEvent.properties);
        let msg = {taEvent: JSON.stringify(taEvent), appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call('trackFirstEvent', jsonMsg);
    }
    trackOverwriteForNative(taEvent, appId) {
        taEvent = !_.isUndefined(taEvent)?taEvent:{};
        appId = !_.isUndefined(appId)?appId:'';
        taEvent.properties = _.extend(!_.isUndefined(taEvent.properties) ? taEvent.properties : {},
            this.dynamicProperties ? this.dynamicProperties() : {}
        );
        taEvent.properties = _.encodeDates(taEvent.properties);
        let msg = {taEvent: JSON.stringify(taEvent), appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call('trackOverwrite', jsonMsg);
    }
    timeEventForNative(eventName, appId) {
        eventName = !_.isUndefined(eventName)?eventName:'';
        appId = !_.isUndefined(appId)?appId:'';
        let msg = {eventName: eventName, appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call('timeEvent', jsonMsg);
    }
    loginForNative(accoundId, appId) {
        accoundId = !_.isUndefined(accoundId)?accoundId:'';
        appId = !_.isUndefined(appId)?appId:'';
        let msg = {accoundId: accoundId, appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call('login', jsonMsg);
    }
    logoutForNative(appId) {
        appId = !_.isUndefined(appId)?appId:'';
        let msg = {appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call('logout', jsonMsg);
    }
    setSuperPropertiesForNative(properties, appId) {
        properties = !_.isUndefined(properties)?properties:{};
        appId = !_.isUndefined(appId)?appId:'';
        properties = _.encodeDates(properties);
        let msg = {properties: JSON.stringify(properties), appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call('setSuperProperties', jsonMsg);
    }
    getSuperPropertiesForNative(callback, appId) {
        appId = !_.isUndefined(appId)?appId:'';
        let msg = {appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.addCallback('getSuperProperties', function(n) {
            callback(JSON.parse(n));
        });
        egret.ExternalInterface.call('getSuperProperties', jsonMsg);
    }
    unsetSuperPropertyForNative(property, appId) {
        property = !_.isUndefined(property)?property:'';
        appId = !_.isUndefined(appId)?appId:'';
        let msg = {property: property, appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call('unsetSuperProperty', jsonMsg);
    }
    clearSuperPropertiesForNative(appId) {
        appId = !_.isUndefined(appId)?appId:'';
        let msg = {appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call('clearSuperProperties', jsonMsg);
    }
    userSetForNative(properties, appId) {
        properties = !_.isUndefined(properties)?properties:{};
        appId = !_.isUndefined(appId)?appId:'';
        properties = _.encodeDates(properties);
        let msg = {properties: JSON.stringify(properties), appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call('userSet', jsonMsg);
    }
    userSetOnceForNative(properties, appId) {
        properties = !_.isUndefined(properties)?properties:{};
        appId = !_.isUndefined(appId)?appId:'';
        properties = _.encodeDates(properties);
        let msg = {properties: JSON.stringify(properties), appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call('userSetOnce', jsonMsg);
    }
    userAppendForNative(properties, appId) {
        properties = !_.isUndefined(properties)?properties:{};
        appId = !_.isUndefined(appId)?appId:'';
        properties = _.encodeDates(properties);
        let msg = {properties: JSON.stringify(properties), appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call('userAppend', jsonMsg);
    }
    userUniqAppendForNative(properties, appId) {
        properties = !_.isUndefined(properties)?properties:{};
        appId = !_.isUndefined(appId)?appId:'';
        properties = _.encodeDates(properties);
        let msg = {properties: JSON.stringify(properties), appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call('userUniqAppend', jsonMsg);
    }
    userAddForNative(properties, appId) {
        properties = !_.isUndefined(properties)?properties:{};
        appId = !_.isUndefined(appId)?appId:'';
        properties = _.encodeDates(properties);
        let msg = {properties: JSON.stringify(properties), appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call('userAdd', jsonMsg);
    }
    userUnsetForNative(property, appId) {
        property = !_.isUndefined(property)?property:'';
        appId = !_.isUndefined(appId)?appId:'';
        let msg = {property: property, appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call('userUnset', jsonMsg);
    }
    userDelForNative(appId) {
        appId = !_.isUndefined(appId)?appId:'';
        let msg = {appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call('userDel', jsonMsg);
    }
    authorizeOpenIDForNative(distinctId, appId) {
        this.identifyForNative(distinctId, appId);
    }
    identifyForNative(distinctId, appId) {
        distinctId = !_.isUndefined(distinctId)?distinctId:'';
        appId = !_.isUndefined(appId)?appId:'';
        let msg = {distinctId: distinctId, appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call('identify', jsonMsg);
    }
    initInstanceForNative(name, config, appId) {
        name = !_.isUndefined(name)?name:'';
        config = !_.isUndefined(config)?config:{};
        appId = !_.isUndefined(appId)?appId:'';
        egret.ExternalInterface.call('setCustomerLibInfo', JSON.stringify({libName: Config.LIB_NAME, libVersion: Config.LIB_VERSION}));
        if (!_.isUndefined(config)) {
            let msg = {name: name, config: JSON.stringify(config)};
            let jsonMsg = JSON.stringify(msg);
            egret.ExternalInterface.call('initInstanceConfig', jsonMsg);
        } else {
            let msg = {name: name, appId: appId};
            let jsonMsg = JSON.stringify(msg);
            egret.ExternalInterface.call('initInstanceAppId', jsonMsg);
        }
    }
    lightInstanceForNative(name, appId, callback) {
        name = !_.isUndefined(name)?name:'';
        appId = !_.isUndefined(appId)?appId:'';
        let msg = {name: name, appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.addCallback('lightInstance', function(n) {
            callback(n);
        });
        egret.ExternalInterface.call('lightInstance', jsonMsg);
    }
    startThinkingAnalyticsForNative(appId) {
        appId = !_.isUndefined(appId)?appId:'';
        let msg = {appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call('startThinkingAnalytics', jsonMsg);
    }
    // setDynamicSuperPropertiesForNative(dynamicProperties, appId) {
    //     appId = !_.isUndefined(appId)?appId:'';
    //     let msg = {dynamicProperties: dynamicProperties, appId: appId};
    //     let jsonMsg = JSON.stringify(msg);
    //     egret.ExternalInterface.addCallback('setDynamicSuperProperties', function(n) {
    //         // let properties = dynamicProperties();
    //     });
    //     egret.ExternalInterface.call('setDynamicSuperProperties', jsonMsg);
    // }
    getDeviceIdForNative(callback, appId) {
        appId = !_.isUndefined(appId)?appId:'';
        let msg = {appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.addCallback('getDeviceId', function(n) {
            callback(n);
        });
        egret.ExternalInterface.call('getDeviceId', jsonMsg);
    }
    getDistinctIdForNative(callback, appId) {
        appId = !_.isUndefined(appId)?appId:'';
        let msg = {appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.addCallback('getDistinctId', function(n) {
            callback(n);
        });
        egret.ExternalInterface.call('getDistinctId', jsonMsg);
    }
    getAccountIdForNative(callback, appId) {
        appId = !_.isUndefined(appId)?appId:'';
        let msg = {appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.addCallback('getAccountId', function(n) {
            callback(n);
        });
        egret.ExternalInterface.call('getAccountId', jsonMsg);
    }
    getPresetPropertiesForNative(callback, appId) {
        appId = !_.isUndefined(appId)?appId:'';
        let msg = {appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.addCallback('getPresetProperties', function(n) {
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
        egret.ExternalInterface.call('getPresetProperties', jsonMsg);
    }
    enableTrackingForNative(enabled, appId) {
        enabled = !_.isUndefined(enabled)?enabled:false;
        appId = !_.isUndefined(appId)?appId:'';
        let msg = {enabled: enabled.toString(), appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call('enableTracking', jsonMsg);
    }
    optOutTrackingForNative(appId) {
        appId = !_.isUndefined(appId)?appId:'';
        let msg = {appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call('optOutTracking', jsonMsg);
    }
    optOutTrackingAndDeleteUserForNative(appId) {
        appId = !_.isUndefined(appId)?appId:'';
        let msg = {appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call('optOutTrackingAndDeleteUser', jsonMsg);
    }
    optInTrackingForNative(appId) {
        appId = !_.isUndefined(appId)?appId:'';
        let msg = {appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call('optInTracking', jsonMsg);
    }

    setTrackStatusForNative(status, appId) {
        appId = !_.isUndefined(appId)?appId:'';
        let msg = {status: status, appId: appId};
        let jsonMsg = JSON.stringify(msg);
        egret.ExternalInterface.call('setTrackStatus', jsonMsg);
    }
}

window['ThinkingAnalyticsAPI'] = ThinkingDataAPIForNative;

import ThinkingDataAPI from './ThinkingDataAPI';
window['ThinkingAnalyticsAPIForJS'] = ThinkingDataAPI;
