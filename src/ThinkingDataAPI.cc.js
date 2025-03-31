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
    name: 'thinkingdata', // global name
    enableLog: true, // enable printing logs
    enableNative: false // ebable call native code on iOS/Android
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

    // Check if the platform is native
    _isNativePlatform() {
        if ((this._isIOS() || this._isAndroid() || this._isOpenHarmony()) && this.config.enableNative) {
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

    _isOpenHarmony() {
        if (cc.sys.isNative && cc.sys.os === 'OpenHarmony') {
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
            this.initInstanceForNative(config);
            this._readStorage(config);
        }
        else {
            this.taJs = new ThinkingAnalyticsAPIForJS(config);
        }
    }

    // Read the visitor id/account id stored in the js,
    // and pass it to the native to keep the account consistent
    _readStorage(config) {
        var name = config.persistenceName;
        var nameOld = config.persistenceNameOld;
        if (config.isChildInstance) {
            name = config.persistenceName + '_' + config.name;
            nameOld = config.persistenceNameOld + '_' + config.name;
        }
        // try to get the js cache synchronously, if it fails, get the js cache asynchronously
        this._state = PlatformAPI.getStorage(name) || {};
        if (_.isEmptyObject(this._state)) {
            this._state = PlatformAPI.getStorage(nameOld) || {};
        }
        if (_.isEmptyObject(this._state)) {
            PlatformAPI.getStorage(name, true, (data) => {
                if (_.isEmptyObject(data)) {
                    PlatformAPI.getStorage(nameOld, true, (dataOld) => {
                        this._state = _.extend2Layers({}, dataOld, this._state);
                    });
                } else {
                    this._state = _.extend2Layers({}, data, this._state);
                }
                //get cache successfully, extract the visitor id and account id
                if (this._state.distinct_id) {
                    this.identifyForNative(this._state.distinct_id);
                }
                if (this._state.account_id) {
                    this.loginForNative(this._state.account_id);
                }
            });
        } else {
            //get cache successfully, extract the visitor id and account id
            if (this._state.distinct_id) {
                this.identifyForNative(this._state.distinct_id);
            }
            if (this._state.account_id) {
                this.loginForNative(this._state.account_id);
            }
        }
    }

    /**
     * Create a new instance (sub-instance).
     * All properties that can be set are independent of the main instance.
     *
     * @param {string} name: sub-instance name
     * @param {object} config: optional, config of sub-instance
     */
    initInstance(name, config) {
        if (this._isNativePlatform()) {
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
     * Get sub-instance with name
     *
     * @param {string} appId: sub-instance name
     */
    lightInstance() {
        if (this._isNativePlatform()) {
            return this.lightInstanceForNative(this.appId);
        }
        return this;
    }

    /**
     * After calling init(), the data starts to be reported
     *
     * Before calling this function, all reporting requests will be cached. When the user completes the necessary settings, call this function to trigger reporting.
     */
    init() {
        if (this._isNativePlatform()) {
            let w = window;
            var _that = this;
            w.__autoTrackCallback = function (s) {
                if (_.isFunction(_that.config.autoTrack.callback)) {
                    let properties = _that.config.autoTrack.callback(s);
                    return JSON.stringify(properties);
                } else {
                    return '{}';
                }
            };
            this.startThinkingAnalyticsForNative(this.appId);
            return;
        }
        this.taJs.init();
    }

    /**
     * Track a narmal Event.
     * @param {string} eventName: event name, required
     * @param {object} properties: event properties, optional
     * @param {date} time: event time, optional
     * @param {function} onComplete: callback, optional
     */
    track(eventName, properties, time, onComplete) {
        if (this._isNativePlatform()) {
            this.trackForNative(eventName, properties, time, this.appId);
            return;
        }
        this.taJs.track(eventName, properties, time, onComplete);
    }

    /**
     * Track a updatable Event
     * @param {object} options: event infomations
     *
     * options.eventName: event name, required
     * options.eventId: event ID, to mark the event, required
     * options.time: event time, optional
     * options.properties: event properties, optional
     * options.onComplete: callback, optional
     */
    trackUpdate(options) {
        if (this._isNativePlatform()) {
            this.trackUpdateForNative(options, this.appId);
            return;
        }
        this.taJs.trackUpdate(options);
    }

    /**
     * Track a overwritable Event
     * @param {object} options event infomations
     *
     * options.eventName: event name, required
     * options.eventId: event ID, to mark the event, required
     * options.time: event time, optional
     * options.properties: event properties, optional
     * options.onComplete: callback, optional
     */
    trackOverwrite(options) {
        if (this._isNativePlatform()) {
            this.trackOverwriteForNative(options, this.appId);
            return;
        }
        this.taJs.trackOverwrite(options);
    }

    /**
     * Track a first Event
     * @param {object} options event infomations
     *
     * options.eventName: event name, required
     * options.firstCheckId: event ID, to mark the event, default is #device_id, required
     * options.time: event time, optional
     * options.properties: event properties, optional
     * options.onComplete: callback, optional
     */
    trackFirstEvent(options) {
        if (this._isNativePlatform()) {
            this.trackFirstEventForNative(options, this.appId);
            return;
        }
        this.taJs.trackFirstEvent(options);
    }

    userSet(properties, time, onComplete) {
        if (this._isNativePlatform()) {
            this.userSetForNative(properties, this.appId);
            return;
        }
        this.taJs.userSet(properties, time, onComplete);
    }

    userSetOnce(properties, time, onComplete) {
        if (this._isNativePlatform()) {
            this.userSetOnceForNative(properties, this.appId);
            return;
        }
        this.taJs.userSetOnce(properties, time, onComplete);
    }

    userUnset(property, time, onComplete) {
        if (this._isNativePlatform()) {
            this.userUnsetForNative(property, this.appId);
            return;
        }
        this.taJs.userUnset(property, time, onComplete);
    }

    userDel(time, onComplete) {
        if (this._isNativePlatform()) {
            this.userDelForNative(this.appId);
            return;
        }
        this.taJs.userDel(time, onComplete);
    }

    userAdd(properties, time, onComplete) {
        if (this._isNativePlatform()) {
            this.userAddForNative(properties, this.appId);
            return;
        }
        this.taJs.userAdd(properties, time, onComplete);
    }

    userAppend(properties, time, onComplete) {
        if (this._isNativePlatform()) {
            this.userAppendForNative(properties, this.appId);
            return;
        }
        this.taJs.userAppend(properties, time, onComplete);
    }

    userUniqAppend(properties, time, onComplete) {
        if (this._isNativePlatform()) {
            this.userUniqAppendForNative(properties, this.appId);
            return;
        }
        this.taJs.userUniqAppend(properties, time, onComplete);
    }

    flush() {
        if (this._isNativePlatform()) {
            this.flushForNative(this.appId);
            return;
        }
        this.taJs.flush();
    }

    authorizeOpenID(id) {
        this.identify(id);
    }

    identify(id) {
        if (this._isNativePlatform()) {
            this.identifyForNative(id, this.appId);
            return;
        }
        this.taJs.identify(id);
    }

    getDistinctId() {
        if (this._isNativePlatform()) {
            return this.getDistinctIdForNative(this.appId);
        }
        return this.taJs.getDistinctId();
    }

    login(accoundId) {
        if (this._isNativePlatform()) {
            this.loginForNative(accoundId, this.appId);
            return;
        }
        this.taJs.login(accoundId);
    }

    getAccountId() {
        if (this._isNativePlatform()) {
            return this.getAccountIdForNative(this.appId);
        }
        return this.taJs.getAccountId();
    }

    logout() {
        if (this._isNativePlatform()) {
            this.logoutForNative(this.appId);
            return;
        }
        this.taJs.logout();
    }

    setSuperProperties(obj) {
        if (this._isNativePlatform()) {
            this.setSuperPropertiesForNative(obj, this.appId);
            return;
        }
        this.taJs.setSuperProperties(obj);
    }

    clearSuperProperties() {
        if (this._isNativePlatform()) {
            this.clearSuperPropertiesForNative(this.appId);
            return;
        }
        this.taJs.clearSuperProperties();
    }

    unsetSuperProperty(propertyName) {
        if (this._isNativePlatform()) {
            this.unsetSuperPropertyForNative(propertyName, this.appId);
            return;
        }
        this.taJs.unsetSuperProperty(propertyName);
    }

    getSuperProperties() {
        if (this._isNativePlatform()) {
            return this.getSuperPropertiesForNative(this.appId);
        }
        return this.taJs.getSuperProperties();
    }
    getPresetProperties() {
        if (this._isNativePlatform()) {
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
            var osVersion = properties['#os_version'];
            presetProperties.osVersion = _.isUndefined(osVersion) ? '' : osVersion;
            presetProperties.deviceId = this.getDeviceId();
            var zoneOffset = 0 - (new Date().getTimezoneOffset() / 60.0);
            presetProperties.zoneOffset = zoneOffset;
            var manufacturer = properties['#manufacturer'];
            presetProperties.manufacturer = _.isUndefined(manufacturer) ? '' : manufacturer;
            presetProperties.toEventPresetProperties = function () {
                return {
                    '#device_model': presetProperties.deviceModel,
                    '#device_id': presetProperties.deviceId,
                    '#screen_width': presetProperties.screenWidth,
                    '#screen_height': presetProperties.screenHeight,
                    '#os': presetProperties.os,
                    '#os_version': presetProperties.osVersion,
                    '#network_type': presetProperties.networkType,
                    '#zone_offset': zoneOffset,
                    '#manufacturer': presetProperties.manufacturer
                };
            };
            return presetProperties;
        }
        return this.taJs.getPresetProperties();
    }

    setDynamicSuperProperties(dynamicProperties) {
        if (this._isNativePlatform()) {
            if (typeof dynamicProperties === 'function') {
                this.dynamicProperties = dynamicProperties;
                let w = window;
                w.__dynamicPropertiesForNative = function (s) {
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
        if (this._isNativePlatform()) {
            return this.timeEventForNative(eventName, this.appId);
        }
        return this.taJs.timeEvent(eventName, time);
    }

    getDeviceId() {
        if (this._isNativePlatform()) {
            return this.getDeviceIdForNative(this.appId);
        }
        return this.taJs.getDeviceId();
    }

    /**
     * Pause/Resume reporting event data
     * @param {bool} enabled:true is Resume, false is Pause
     * @deprecated This method is deprecated, use setTrackStatus() instand.
     */
    enableTracking(enabled) {
        if (this._isNativePlatform()) {
            this.enableTrackingForNative(enabled, this.appId);
            return;
        }
        this.taJs.enableTracking(enabled);
    }

    /**
     * Stop reporting event data, and cache data will be cleared
     * @deprecated This method is deprecated, use setTrackStatus() instand.
     */
    optOutTracking() {
        if (this._isNativePlatform()) {
            this.optOutTrackingForNative(this.appId);
            return;
        }
        this.taJs.optOutTracking();
    }

    /**
     * Stop reporting event data, and cache data will be cleared, and flush a user_del
     * @deprecated This method is deprecated, use setTrackStatus() instand.
     */
    optOutTrackingAndDeleteUser() {
        if (this._isNativePlatform()) {
            this.optOutTrackingAndDeleteUserForNative(this.appId);
            return;
        }
        this.taJs.optOutTrackingAndDeleteUser();
    }

    /**
     * Allow reporting event data
     * @deprecated This method is deprecated, use setTrackStatus() instand.
     */
    optInTracking() {
        if (this._isNativePlatform()) {
            this.optInTrackingForNative(this.appId);
            return;
        }
        this.taJs.optInTracking();
    }

    /**
    * Set status for events reporting
    * PAUSE, pause events reporting
    * STOP, stop events reporting, and cache data will be cleared
    * SAVE_ONLY, event data stores in the cache, but not be reported (native support, js equal to NORMAL)
    * NORMAL, resume event reporting
    * @param {string} status, events reporting status
    */
    setTrackStatus(status) {
        if (this._isNativePlatform()) {
            this.setTrackStatusForNative(status, this.appId);
            return;
        }
        this.taJs.setTrackStatus(status);
    }

    trackForNative(eventName, properties, time, appId) {
        var formatTime = _.isDate(time) ? _.formatDate(time) : '';
        if (_.isUndefined(properties)) properties = {};
        properties = _.extend(properties,
            this.dynamicProperties ? this.dynamicProperties() : {}
        );
        properties = _.encodeDates(properties);
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'track', '(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V', eventName, JSON.stringify(properties), formatTime, appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi', 'track:properties:time:appId:', eventName, JSON.stringify(properties), formatTime, appId);
        } else if (this._isOpenHarmony()) {
            jsb.reflection.callStaticMethod("entry/src/main/ets/CocosCreatorProxyApi", "track", JSON.stringify({
                eventName: eventName,
                properties: properties,
                appId: appId
            }), true);
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
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi', 'trackUpdate:appId:', JSON.stringify(taEvent), appId);
        } else if (this._isOpenHarmony()) {
            jsb.reflection.callStaticMethod("entry/src/main/ets/CocosCreatorProxyApi", "trackUpdate", JSON.stringify({
                event: taEvent,
                appId: appId
            }), true);
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
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi', 'trackFirstEvent:appId:', JSON.stringify(taEvent), appId);
        } else if (this._isOpenHarmony()) {
            jsb.reflection.callStaticMethod("entry/src/main/ets/CocosCreatorProxyApi", "trackFirst", JSON.stringify({
                event: taEvent,
                appId: appId
            }), true);
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
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi', 'trackOverwrite:appId:', JSON.stringify(taEvent), appId);
        } else if (this._isOpenHarmony()) {
            jsb.reflection.callStaticMethod("entry/src/main/ets/CocosCreatorProxyApi", "trackOverwrite", JSON.stringify({
                event: taEvent,
                appId: appId
            }), true);
        }
    }
    timeEventForNative(eventName, appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'timeEvent', '(Ljava/lang/String;Ljava/lang/String;)V', eventName, appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi', 'timeEvent:appId:', eventName, appId);
        } else if (this._isOpenHarmony()) {
            jsb.reflection.callStaticMethod("entry/src/main/ets/CocosCreatorProxyApi", "timeEvent", JSON.stringify({
                eventName: eventName,
                appId: appId
            }), true);
        }
    }
    loginForNative(accoundId, appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'login', '(Ljava/lang/String;Ljava/lang/String;)V', accoundId, appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi', 'login:appId:', accoundId, appId);
        } else if (this._isOpenHarmony()) {
            jsb.reflection.callStaticMethod("entry/src/main/ets/CocosCreatorProxyApi", "login", JSON.stringify({
                accountId: accoundId,
                appId: appId
            }), true);
        }
    }
    logoutForNative(appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'logout', '(Ljava/lang/String;)V', appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi', 'logout:', appId);
        } else if (this._isOpenHarmony()) {
            jsb.reflection.callStaticMethod("entry/src/main/ets/CocosCreatorProxyApi", "logout", appId, true);
        }
    }
    setSuperPropertiesForNative(properties, appId) {
        properties = _.encodeDates(properties);
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'setSuperProperties', '(Ljava/lang/String;Ljava/lang/String;)V', JSON.stringify(properties), appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi', 'setSuperProperties:appId:', JSON.stringify(properties), appId);
        } else if (this._isOpenHarmony()) {
            jsb.reflection.callStaticMethod("entry/src/main/ets/CocosCreatorProxyApi", "setSuperProperties", JSON.stringify({
                properties: properties,
                appId: appId
            }), true);
        }
    }
    getSuperPropertiesForNative(appId) {
        var properties = '{}';
        if (this._isAndroid()) {
            properties = jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'getSuperProperties', '(Ljava/lang/String;)Ljava/lang/String;', appId);
        }
        else if (this._isIOS()) {
            properties = jsb.reflection.callStaticMethod('CocosCreatorProxyApi', 'getSuperProperties:', appId);
        } else if (this._isOpenHarmony()) {
            properties = jsb.reflection.callStaticMethod("entry/src/main/ets/CocosCreatorProxyApi", "getSuperProperties", appId, true);
        }
        return JSON.parse(properties);
    }
    unsetSuperPropertyForNative(property, appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'unsetSuperProperty', '(Ljava/lang/String;Ljava/lang/String;)V', property, appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi', 'unsetSuperProperty:appId:', property, appId);
        } else if (this._isOpenHarmony()) {
            jsb.reflection.callStaticMethod("entry/src/main/ets/CocosCreatorProxyApi", "unsetSuperProperty", JSON.stringify({
                property: property,
                appId: appId
            }), true);
        }
    }
    clearSuperPropertiesForNative(appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'clearSuperProperties', '(Ljava/lang/String;)V', appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi', 'clearSuperProperties:', appId);
        } else if (this._isOpenHarmony()) {
            jsb.reflection.callStaticMethod("entry/src/main/ets/CocosCreatorProxyApi", "clearSuperProperties", appId, true);
        }
    }
    userSetForNative(properties, appId) {
        properties = _.encodeDates(properties);
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'userSet', '(Ljava/lang/String;Ljava/lang/String;)V', JSON.stringify(properties), appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi', 'userSet:appId:', JSON.stringify(properties), appId);
        } else if (this._isOpenHarmony()) {
            jsb.reflection.callStaticMethod("entry/src/main/ets/CocosCreatorProxyApi", "userSet", JSON.stringify({
                properties: properties,
                appId: appId
            }), true);
        }
    }
    userSetOnceForNative(properties, appId) {
        properties = _.encodeDates(properties);
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'userSetOnce', '(Ljava/lang/String;Ljava/lang/String;)V', JSON.stringify(properties), appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi', 'userSetOnce:appId:', JSON.stringify(properties), appId);
        } else if (this._isOpenHarmony()) {
            jsb.reflection.callStaticMethod("entry/src/main/ets/CocosCreatorProxyApi", "userSetOnce", JSON.stringify({
                properties: properties,
                appId: appId
            }), true);
        }
    }
    userAppendForNative(properties, appId) {
        properties = _.encodeDates(properties);
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'userAppend', '(Ljava/lang/String;Ljava/lang/String;)V', JSON.stringify(properties), appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi', 'userAppend:appId:', JSON.stringify(properties), appId);
        } else if (this._isOpenHarmony()) {
            jsb.reflection.callStaticMethod("entry/src/main/ets/CocosCreatorProxyApi", "userAppend", JSON.stringify({
                properties: properties,
                appId: appId
            }), true);
        }
    }
    userUniqAppendForNative(properties, appId) {
        properties = _.encodeDates(properties);
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'userUniqAppend', '(Ljava/lang/String;Ljava/lang/String;)V', JSON.stringify(properties), appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi', 'userUniqAppend:appId:', JSON.stringify(properties), appId);
        } else if (this._isOpenHarmony()) {
            jsb.reflection.callStaticMethod("entry/src/main/ets/CocosCreatorProxyApi", "userUniqAppend", JSON.stringify({
                properties: properties,
                appId: appId
            }), true);
        }
    }
    userAddForNative(properties, appId) {
        properties = _.encodeDates(properties);
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'userAdd', '(Ljava/lang/String;Ljava/lang/String;)V', JSON.stringify(properties), appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi', 'userAdd:appId:', JSON.stringify(properties), appId);
        } else if (this._isOpenHarmony()) {
            jsb.reflection.callStaticMethod("entry/src/main/ets/CocosCreatorProxyApi", "userAdd", JSON.stringify({
                properties: properties,
                appId: appId
            }), true);
        }
    }
    userUnsetForNative(property, appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'userUnset', '(Ljava/lang/String;Ljava/lang/String;)V', property, appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi', 'userUnset:appId:', property, appId);
        } else if (this._isOpenHarmony()) {
            jsb.reflection.callStaticMethod("entry/src/main/ets/CocosCreatorProxyApi", "userUnset", JSON.stringify({
                property: property,
                appId: appId
            }), true);
        }
    }
    userDelForNative(appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'userDel', '(Ljava/lang/String;)V', appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi', 'userDel:', appId);
        } else if (this._isOpenHarmony()) {
            jsb.reflection.callStaticMethod("entry/src/main/ets/CocosCreatorProxyApi", "userDel", appId, true);
        }
    }
    flushForNative(appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'flush', '(Ljava/lang/String;)V', appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi', 'flush:', appId);
        } else if (this._isOpenHarmony()) {
            jsb.reflection.callStaticMethod("entry/src/main/ets/CocosCreatorProxyApi", "flush", appId, true);
        }
    }
    authorizeOpenIDForNative(distinctId, appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'authorizeOpenID', '(Ljava/lang/String;Ljava/lang/String;)V', distinctId, appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi', 'authorizeOpenID:appId:', distinctId, appId);
        }
    }
    identifyForNative(distinctId, appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'identify', '(Ljava/lang/String;Ljava/lang/String;)V', distinctId, appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi', 'identify:appId:', distinctId, appId);
        } else if (this._isOpenHarmony()) {
            jsb.reflection.callStaticMethod("entry/src/main/ets/CocosCreatorProxyApi", "setDistinctId", JSON.stringify({
                distinctId: distinctId,
                appId: appId
            }), true);
        }
    }
    initInstanceForNative(config) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'setCustomerLibInfo', '(Ljava/lang/String;Ljava/lang/String;)V', Config.LIB_NAME, Config.LIB_VERSION);
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'initWithConfig', '(Ljava/lang/String;)V', JSON.stringify(config));
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi', 'setCustomerLibInfoWithLibName:libVersion:', Config.LIB_NAME, Config.LIB_VERSION);
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi', 'initWithConfig:', JSON.stringify(config));
        } else if (this._isOpenHarmony()) {
            jsb.reflection.callStaticMethod("entry/src/main/ets/CocosCreatorProxyApi", "setCustomerLibInfo", JSON.stringify({
                lib: Config.LIB_NAME,
                version: Config.LIB_VERSION
            }), true);
            jsb.reflection.callStaticMethod("entry/src/main/ets/CocosCreatorProxyApi", "initWithConfig", JSON.stringify(config), true);
        }
    }
    lightInstanceForNative(appId) {
        if (this._isAndroid()) {
            return jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'lightInstance', '(Ljava/lang/String;)Ljava/lang/String;', appId);
        }
        else if (this._isIOS()) {
            return jsb.reflection.callStaticMethod('CocosCreatorProxyApi', 'lightInstance:', appId);
        }
    }
    startThinkingAnalyticsForNative(appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'startThinkingAnalytics', '(Ljava/lang/String;)V', appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi', 'startThinkingAnalytics:', appId);
        }
    }
    setDynamicSuperPropertiesForNative(callFromNative, appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'setDynamicSuperProperties', '(Ljava/lang/String;Ljava/lang/String;)V', callFromNative, appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi', 'setDynamicSuperProperties:appId:', callFromNative, appId);
        }
    }
    getDeviceIdForNative(appId) {
        if (this._isAndroid()) {
            return jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'getDeviceId', '(Ljava/lang/String;)Ljava/lang/String;', appId);
        }
        else if (this._isIOS()) {
            return jsb.reflection.callStaticMethod('CocosCreatorProxyApi', 'getDeviceId:', appId);
        } else if (this._isOpenHarmony()) {
            return jsb.reflection.callStaticMethod("entry/src/main/ets/CocosCreatorProxyApi", "getDeviceId", appId, true);
        }
    }
    getDistinctIdForNative(appId) {
        if (this._isAndroid()) {
            return jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'getDistinctId', '(Ljava/lang/String;)Ljava/lang/String;', appId);
        }
        else if (this._isIOS()) {
            return jsb.reflection.callStaticMethod('CocosCreatorProxyApi', 'getDistinctId:', appId);
        } else if (this._isOpenHarmony()) {
            return jsb.reflection.callStaticMethod("entry/src/main/ets/CocosCreatorProxyApi", "getDistinctId", appId, true);
        }
    }
    getAccountIdForNative(appId) {
        if (this._isAndroid()) {
            return jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'getAccountId', '(Ljava/lang/String;)Ljava/lang/String;', appId);
        }
        else if (this._isIOS()) {
            return jsb.reflection.callStaticMethod('CocosCreatorProxyApi', 'getAccountId:', appId);
        } else if (this._isOpenHarmony()) {
            return jsb.reflection.callStaticMethod("entry/src/main/ets/CocosCreatorProxyApi", "getAccountId", appId, true);
        }
    }
    getPresetPropertiesForNative(appId) {
        var properties = '{}';
        if (this._isAndroid()) {
            properties = jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'getPresetProperties', '(Ljava/lang/String;)Ljava/lang/String;', appId);
        }
        else if (this._isIOS()) {
            properties = jsb.reflection.callStaticMethod('CocosCreatorProxyApi', 'getPresetProperties:', appId);
        } else if (this._isOpenHarmony()) {
            properties = jsb.reflection.callStaticMethod("entry/src/main/ets/CocosCreatorProxyApi", "getPresetProperties", appId, true);
        }
        return JSON.parse(properties);
    }
    enableTrackingForNative(enabled, appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'enableTracking', '(Ljava/lang/String;Ljava/lang/String;)V', enabled.toString(), appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi', 'enableTracking:appId:', enabled.toString(), appId);
        }
    }
    optOutTrackingForNative(appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'optOutTracking', '(Ljava/lang/String;)V', appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi', 'optOutTracking:', appId);
        }
    }
    optOutTrackingAndDeleteUserForNative(appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'optOutTrackingAndDeleteUser', '(Ljava/lang/String;)V', appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi', 'optOutTrackingAndDeleteUser:', appId);
        }
    }
    optInTrackingForNative(appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'optInTracking', '(Ljava/lang/String;)V', appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi', 'optInTracking:', appId);
        }
    }

    setTrackStatusForNative(status, appId) {
        if (this._isAndroid()) {
            jsb.reflection.callStaticMethod('com/cocos/game/CocosCreatorProxyApi', 'setTrackStatus', '(Ljava/lang/String;Ljava/lang/String;)V', status, appId);
        }
        else if (this._isIOS()) {
            jsb.reflection.callStaticMethod('CocosCreatorProxyApi', 'setTrackStatus:appId:', status, appId);
        }
    }
}

window['ThinkingAnalyticsAPI'] = ThinkingDataAPIForNative;

import ThinkingDataAPI from './ThinkingDataAPI';
window['ThinkingAnalyticsAPIForJS'] = ThinkingDataAPI;

