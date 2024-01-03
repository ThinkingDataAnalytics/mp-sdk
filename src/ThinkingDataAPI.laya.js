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
    name: 'thinkingdata', // global name
    enableLog: true, // enable printing logs
    enableNative: false // ebable call native code on iOS/Android
};

export default class ThinkingDataAPIForNative {
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

    // Check if the platform is native
    _isNativePlatform() {
        if (!_.isUndefined(this.nativeProxy) && (this._isIOS() || this._isAndroid()) && this.config.enableNative) {
            return true;
        } else {
            return false;
        }
    }
    _isIOS() {
        if (conchConfig.getOS() === 'Conch-ios') {
            return true;
        } else {
            return false;
        }
    }
    _isAndroid() {
        if (conchConfig.getOS() === 'Conch-android') {
            return true;
        } else {
            return false;
        }
    }
    // internal init function. it should not be used by users.
    _init(config) {
        this.name = config.name;
        this.appId = config.appId || config.appid;
        try{
            // create native classes
            // this.nativeProxy = window['PlatformClass'].createClass('LayaProxyApi'); //this name must match the OC class name declared below, iOS does not use the package name
            if (this._isIOS()) {
                this.nativeProxy = PlatformClass.createClass('LayaProxyApi');//create script proxy
            }
            else if (this._isAndroid()) {
                //a complete class path is required, pay attention to the difference from iOS
                this.nativeProxy = PlatformClass.createClass('demo.LayaProxyApi');//create script proxy
            }
        } catch(err){
            console.log('[laya log] native createClass failed, err = ' + err);
        } finally {
            if (this._isNativePlatform()) {
                this.initInstanceForNative(this.name, config, this.appId);
                this._readStorage(config);
            } else {
                this.taJs = new ThinkingAnalyticsAPIForJS(config);
            }
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
     * @param {string} name: sub-instance name
     */
    lightInstance(name) {
        return this[name];
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
            w.__autoTrackCallback = function(s){
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
            this.identifyForNative(id,this.appId);
            return;
        }
        this.taJs.identify(id);
    }

    getDistinctId(callback) {
        if (!_.isUndefined(callback)) {
            if (this._isNativePlatform()) {
                this.getDistinctIdForNative(callback, this.appId);
                return;
            } else {
                callback(this.taJs.getDistinctId());
            }
        }
        return this.taJs.getDistinctId();
    }

    login(accoundId) {
        if (this._isNativePlatform()) {
            this.loginForNative(accoundId,this.appId);
            return;
        }
        this.taJs.login(accoundId);
    }

    getAccountId(callback) {
        if (!_.isUndefined(callback)) {
            if (this._isNativePlatform()) {
                this.getAccountIdForNative(callback, this.appId);
                return;
            } else {
                callback(this.taJs.getAccountId());
            }
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
            this.setSuperPropertiesForNative(obj,this.appId);
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
            this.unsetSuperPropertyForNative(propertyName,this.appId);
            return;
        }
        this.taJs.unsetSuperProperty(propertyName);
    }

    getSuperProperties(callback) {
        if (!_.isUndefined(callback)) {
            if (this._isNativePlatform()) {
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
            if (this._isNativePlatform()) {
                this.getPresetPropertiesForNative(callback, this.appId);
                return;
            } else {
                callback(this.taJs.getPresetProperties());
            }
        }
        return this.taJs.getPresetProperties();
    }

    setDynamicSuperProperties(dynamicProperties) {
        if (this._isNativePlatform()) {
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
        if (this._isNativePlatform()) {
            return this.timeEventForNative(eventName, this.appId);
        }
        return this.taJs.timeEvent(eventName, time);
    }

    getDeviceId(callback) {
        if (!_.isUndefined(callback)) {
            if (this._isNativePlatform()) {
                this.getDeviceIdForNative(callback, this.appId);
                return;
            } else {
                callback(this.taJs.getDeviceId());
            }
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
        var formatTime = _.isDate(time)?_.formatDate(time):'';
        eventName = !_.isUndefined(eventName)?eventName:'';
        properties = !_.isUndefined(properties)?properties:{};
        formatTime = !_.isUndefined(formatTime)?formatTime:'';
        appId = !_.isUndefined(appId)?appId:'';
        var params = _.extend(properties,
            this.dynamicProperties ? this.dynamicProperties() : {}
        );
        params = _.encodeDates(params);
        if (this._isIOS()) {
            this.nativeProxy.call('track:properties:time:appId:', eventName, JSON.stringify(params), formatTime, appId);
        }
        else if (this._isAndroid()) {
            this.nativeProxy.call('track', eventName, JSON.stringify(params), formatTime, appId);
        }
    }
    trackUpdateForNative(taEvent, appId) {
        taEvent = !_.isUndefined(taEvent)?taEvent:{};
        appId = !_.isUndefined(appId)?appId:'';
        taEvent.properties = _.extend(!_.isUndefined(taEvent.properties) ? taEvent.properties : {},
            this.dynamicProperties ? this.dynamicProperties() : {}
        );
        taEvent.properties = _.encodeDates(taEvent.properties);
        if (this._isIOS()) {
            this.nativeProxy.call('trackUpdate:appId:', JSON.stringify(taEvent), appId);
        }
        else if (this._isAndroid()) {
            this.nativeProxy.call('trackUpdate', JSON.stringify(taEvent), appId);
        }
    }
    trackFirstEventForNative(taEvent, appId) {
        taEvent = !_.isUndefined(taEvent)?taEvent:{};
        appId = !_.isUndefined(appId)?appId:'';
        taEvent.properties = _.extend(!_.isUndefined(taEvent.properties) ? taEvent.properties : {},
            this.dynamicProperties ? this.dynamicProperties() : {}
        );
        taEvent.properties = _.encodeDates(taEvent.properties);
        if (this._isIOS()) {
            this.nativeProxy.call('trackFirstEvent:appId:', JSON.stringify(taEvent), appId);
        }
        else if (this._isAndroid()) {
            this.nativeProxy.call('trackFirstEvent', JSON.stringify(taEvent), appId);
        }
    }
    trackOverwriteForNative(taEvent, appId) {
        taEvent = !_.isUndefined(taEvent)?taEvent:{};
        appId = !_.isUndefined(appId)?appId:'';
        taEvent.properties = _.extend(!_.isUndefined(taEvent.properties) ? taEvent.properties : {},
            this.dynamicProperties ? this.dynamicProperties() : {}
        );
        taEvent.properties = _.encodeDates(taEvent.properties);
        if (this._isIOS()) {
            this.nativeProxy.call('trackOverwrite:appId:', JSON.stringify(taEvent), appId);
        }
        else if (this._isAndroid()) {
            this.nativeProxy.call('trackOverwrite', JSON.stringify(taEvent), appId);
        }
    }
    timeEventForNative(eventName, appId) {
        eventName = !_.isUndefined(eventName)?eventName:'';
        appId = !_.isUndefined(appId)?appId:'';
        if (this._isIOS()) {
            this.nativeProxy.call('timeEvent:appId:', eventName, appId);
        }
        else if (this._isAndroid()) {
            this.nativeProxy.call('timeEvent', eventName, appId);
        }
    }
    loginForNative(accoundId, appId) {
        accoundId = !_.isUndefined(accoundId)?accoundId:'';
        appId = !_.isUndefined(appId)?appId:'';
        if (this._isIOS()) {
            this.nativeProxy.call('login:appId:', accoundId, appId);
        }
        else if (this._isAndroid()) {
            this.nativeProxy.call('login', accoundId, appId);
        }
    }
    logoutForNative(appId) {
        appId = !_.isUndefined(appId)?appId:'';
        if (this._isIOS()) {
            this.nativeProxy.call('logout:', appId);
        }
        else if (this._isAndroid()) {
            this.nativeProxy.call('logout', appId);
        }
    }
    setSuperPropertiesForNative(properties, appId) {
        properties = !_.isUndefined(properties)?properties:{};
        appId = !_.isUndefined(appId)?appId:'';
        properties = _.encodeDates(properties);
        if (this._isIOS()) {
            this.nativeProxy.call('setSuperProperties:appId:', JSON.stringify(properties), appId);
        }
        else if (this._isAndroid()) {
            this.nativeProxy.call('setSuperProperties', JSON.stringify(properties), appId);
        }
    }
    getSuperPropertiesForNative(callback, appId) {
        appId = !_.isUndefined(appId)?appId:'';
        if (this._isIOS()) {
            this.nativeProxy.callWithBack(function(n) {
                callback(JSON.parse(n));
            }, 'getSuperProperties:', appId);
        }
        else if (this._isAndroid()) {
            this.nativeProxy.callWithBack(function(n) {
                callback(JSON.parse(n));
            }, 'getSuperProperties', appId);
        }
    }
    unsetSuperPropertyForNative(property, appId) {
        property = !_.isUndefined(property)?property:'';
        appId = !_.isUndefined(appId)?appId:'';
        if (this._isIOS()) {
            this.nativeProxy.call('unsetSuperProperty:appId:', property, appId);
        }
        else if (this._isAndroid()) {
            this.nativeProxy.call('unsetSuperProperty', property, appId);
        }
    }
    clearSuperPropertiesForNative(appId) {
        appId = !_.isUndefined(appId)?appId:'';
        if (this._isIOS()) {
            this.nativeProxy.call('clearSuperProperties:', appId);
        }
        else if (this._isAndroid()) {
            this.nativeProxy.call('clearSuperProperties', appId);
        }
    }
    userSetForNative(properties, appId) {
        properties = !_.isUndefined(properties)?properties:{};
        appId = !_.isUndefined(appId)?appId:'';
        properties = _.encodeDates(properties);
        if (this._isIOS()) {
            this.nativeProxy.call('userSet:appId:', JSON.stringify(properties), appId);
        }
        else if (this._isAndroid()) {
            this.nativeProxy.call('userSet', JSON.stringify(properties), appId);
        }
    }
    userSetOnceForNative(properties, appId) {
        properties = !_.isUndefined(properties)?properties:{};
        appId = !_.isUndefined(appId)?appId:'';
        properties = _.encodeDates(properties);
        if (this._isIOS()) {
            this.nativeProxy.call('userSetOnce:appId:', JSON.stringify(properties), appId);
        }
        else if (this._isAndroid()) {
            this.nativeProxy.call('userSetOnce', JSON.stringify(properties), appId);
        }
    }
    userAppendForNative(properties, appId) {
        properties = !_.isUndefined(properties)?properties:{};
        appId = !_.isUndefined(appId)?appId:'';
        properties = _.encodeDates(properties);
        if (this._isIOS()) {
            this.nativeProxy.call('userAppend:appId:', JSON.stringify(properties), appId);
        }
        else if (this._isAndroid()) {
            this.nativeProxy.call('userAppend', JSON.stringify(properties), appId);
        }
    }
    userUniqAppendForNative(properties, appId) {
        properties = !_.isUndefined(properties)?properties:{};
        appId = !_.isUndefined(appId)?appId:'';
        properties = _.encodeDates(properties);
        if (this._isIOS()) {
            this.nativeProxy.call('userUniqAppend:appId:', JSON.stringify(properties), appId);
        }
        else if (this._isAndroid()) {
            this.nativeProxy.call('userUniqAppend', JSON.stringify(properties), appId);
        }
    }
    userAddForNative(properties, appId) {
        properties = !_.isUndefined(properties)?properties:{};
        appId = !_.isUndefined(appId)?appId:'';
        properties = _.encodeDates(properties);
        if (this._isIOS()) {
            this.nativeProxy.call('userAdd:appId:', JSON.stringify(properties), appId);
        }
        else if (this._isAndroid()) {
            this.nativeProxy.call('userAdd', JSON.stringify(properties), appId);
        }
    }
    userUnsetForNative(property, appId) {
        property = !_.isUndefined(property)?property:'';
        appId = !_.isUndefined(appId)?appId:'';
        if (this._isIOS()) {
            this.nativeProxy.call('userUnset:appId:', property, appId);
        }
        else if (this._isAndroid()) {
            this.nativeProxy.call('userUnset', property, appId);
        }
    }
    userDelForNative(appId) {
        appId = !_.isUndefined(appId)?appId:'';
        if (this._isIOS()) {
            this.nativeProxy.call('userDel:', appId);
        }
        else if (this._isAndroid()) {
            this.nativeProxy.call('userDel', appId);
        }
    }
    flushForNative(appId) {
        appId = !_.isUndefined(appId)?appId:'';
        if (this._isIOS()) {
            this.nativeProxy.call('flush:', appId);
        }
        else if (this._isAndroid()) {
            this.nativeProxy.call('flush', appId);
        }
    }
    authorizeOpenIDForNative(distinctId, appId) {
        this.identifyForNative(distinctId, appId);
    }
    identifyForNative(distinctId, appId) {
        distinctId = !_.isUndefined(distinctId)?distinctId:'';
        appId = !_.isUndefined(appId)?appId:'';
        if (this._isIOS()) {
            this.nativeProxy.call('identify:appId:', distinctId, appId);
        }
        else if (this._isAndroid()) {
            this.nativeProxy.call('identify', distinctId, appId);
        }
    }
    initInstanceForNative(name, config, appId) {
        name = !_.isUndefined(name)?name:'';
        config = !_.isUndefined(config)?config:{};
        appId = !_.isUndefined(appId)?appId:'';
        if (this._isIOS()) {
            this.nativeProxy.call('setCustomerLibInfoWithLibName:libVersion:', Config.LIB_NAME, Config.LIB_VERSION);
            this.nativeProxy.call('initWithConfig:', JSON.stringify(config));
        }
        else if (this._isAndroid()) {
            this.nativeProxy.call('setCustomerLibInfo', Config.LIB_NAME, Config.LIB_VERSION);
            this.nativeProxy.call('initWithConfig', JSON.stringify(config));
        }
    }
    lightInstanceForNative(name, appId, callback) {
        name = !_.isUndefined(name)?name:'';
        appId = !_.isUndefined(appId)?appId:'';
        if (this._isIOS()) {
            this.nativeProxy.callWithBack(function(n){
                callback(n);
            },'lightInstance:appId:', name, appId);
        }
        else if (this._isAndroid()) {
            this.nativeProxy.callWithBack(function(n){
                callback(n);
            },'lightInstance', name, appId);
        }
    }
    startThinkingAnalyticsForNative(appId) {
        appId = !_.isUndefined(appId)?appId:'';
        if (this._isIOS()) {
            this.nativeProxy.call('startThinkingAnalytics:', appId);
        }
        else if (this._isAndroid()) {
            this.nativeProxy.call('startThinkingAnalytics', appId);
        }
    }
    // setDynamicSuperPropertiesForNative(dynamicProperties, appId) {
    //     appId = !_.isUndefined(appId)?appId:'';
    //     if (this._isIOS()) {
    //         this.nativeProxy.callWithBack(function(n){
    //             // let properties = dynamicProperties();
    //         },'setDynamicSuperProperties:appId:', dynamicProperties, appId);
    //     }
    //     else if (this._isAndroid()) {
    //         this.nativeProxy.callWithBack(function(n){
    //             // let properties = dynamicProperties();
    //         },'setDynamicSuperProperties', dynamicProperties, appId);
    //     }
    // }
    getDeviceIdForNative(callback, appId) {
        appId = !_.isUndefined(appId)?appId:'';
        if (this._isIOS()) {
            this.nativeProxy.callWithBack(function(n){
                callback(n);
            },'getDeviceId:', appId);
        }
        else if (this._isAndroid()) {
            this.nativeProxy.callWithBack(function(n){
                callback(n);
            },'getDeviceId', appId);
        }
    }
    getDistinctIdForNative(callback, appId) {
        appId = !_.isUndefined(appId)?appId:'';
        if (this._isIOS()) {
            this.nativeProxy.callWithBack(function(n){
                callback(n);
            },'getDistinctId:', appId);
        }
        else if (this._isAndroid()) {
            this.nativeProxy.callWithBack(function(n){
                callback(n);
            },'getDistinctId', appId);
        }
    }
    getAccountIdForNative(callback, appId) {
        appId = !_.isUndefined(appId)?appId:'';
        if (this._isIOS()) {
            this.nativeProxy.callWithBack(function(n){
                callback(n);
            },'getAccountId:', appId);
        }
        else if (this._isAndroid()) {
            this.nativeProxy.callWithBack(function(n){
                callback(n);
            },'getAccountId', appId);
        }
    }
    getPresetPropertiesForNative(callback, appId) {
        appId = !_.isUndefined(appId)?appId:'';
        function callWithBack(n) {
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
        }
        if (this._isIOS()) {
            this.nativeProxy.callWithBack(callWithBack,'getPresetProperties:', appId);
        }
        else if (this._isAndroid()) {
            this.nativeProxy.callWithBack(callWithBack,'getPresetProperties', appId);
        }
    }
    enableTrackingForNative(enabled, appId) {
        enabled = !_.isUndefined(enabled)?enabled:false;
        appId = !_.isUndefined(appId)?appId:'';
        if (this._isIOS()) {
            this.nativeProxy.call('enableTracking:appId:', enabled.toString(), appId);
        }
        else if (this._isAndroid()) {
            this.nativeProxy.call('enableTracking', enabled.toString(), appId);
        }
    }
    optOutTrackingForNative(appId) {
        appId = !_.isUndefined(appId)?appId:'';
        if (this._isIOS()) {
            this.nativeProxy.call('optOutTracking:', appId);
        }
        else if (this._isAndroid()) {
            this.nativeProxy.call('optOutTracking', appId);
        }
    }
    optOutTrackingAndDeleteUserForNative(appId) {
        appId = !_.isUndefined(appId)?appId:'';
        if (this._isIOS()) {
            this.nativeProxy.call('optOutTrackingAndDeleteUser:', appId);
        }
        else if (this._isAndroid()) {
            this.nativeProxy.call('optOutTrackingAndDeleteUser', appId);
        }
    }
    optInTrackingForNative(appId) {
        appId = !_.isUndefined(appId)?appId:'';
        if (this._isIOS()) {
            this.nativeProxy.call('optInTracking:', appId);
        }
        else if (this._isAndroid()) {
            this.nativeProxy.call('optInTracking', appId);
        }
    }

    setTrackStatusForNative(status, appId) {
        appId = !_.isUndefined(appId)?appId:'';
        if (this._isIOS()) {
            this.nativeProxy.call('setTrackStatus:appId:', status, appId);
        }
        else if (this._isAndroid()) {
            this.nativeProxy.call('setTrackStatus', status, appId);
        }
    }
}

window['ThinkingAnalyticsAPI'] = ThinkingDataAPIForNative;

import ThinkingDataAPI from './ThinkingDataAPI';
window['ThinkingAnalyticsAPIForJS'] = ThinkingDataAPI;
