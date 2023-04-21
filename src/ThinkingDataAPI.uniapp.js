
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
import ThinkingDataAPI from './ThinkingDataAPI';

const DEFAULT_CONFIG = {
    name: 'thinkingdata', // Global variable name
    enableLog: true, // Whether to enable log
    enableNative: false
};

export default class ThinkingAnalyticsAPI {
    /**
     * Create an sdk instance and pass in configuration information
     * @param {*} config configuration information
     */
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

    _isNativePlatform() {
        // #ifdef  APP-PLUS
        return true;
        // #endif
    }

    _isIOS() {
        if (_.isUndefined(this.isiOSPlat)) {
            var iOSApiClass = plus.ios.importClass('ThinkingGameEngineApi');
            if (iOSApiClass) {
                this.isiOSPlat = true;
            } else {
                this.isiOSPlat = false;
            }
        }
        return this.isiOSPlat;
    }

    _isAndroid() {
        if (_.isUndefined(this.isAndroidPlat)) {
            var androidApiClass = plus.android.importClass('cn.thinkingdata.engine.ThinkingAnalyticsUniAppAPI');
            if (androidApiClass) {
                this.isAndroidPlat = true;
            } else {
                this.isAndroidPlat = false;
            }
        }
        return this.isAndroidPlat;
    }

    _init(config) {
        this.name = config.name;
        this.appId = config.appId || config.appid;
        if (this._isNativePlatform()) {
            this.initInstanceForNative();
            //this._readStorage(config);
        } else {
            this.taJs = new ThinkingDataAPI(config);
        }
    }

    /**
     * SDK initialization
     * @returns sdk instance
     */
    init() {
        if (this._isNativePlatform()) {
            this.startThinkingAnalyticsForNative();
            return;
        }
        this.taJs.init();
    }

    startThinkingAnalyticsForNative() {
        var mode = 0;
        if (this.config.debugMode === 'debug') {
            mode = 1;
        } else if (this.config.debugMode === 'debugOnly') {
            mode = 2;
        }
        var secretKey = {};
        if (_.isObject(this.config.secretKey)) {
            secretKey.publicKey = this.config.secretKey.publicKey;
            secretKey.version = this.config.secretKey.version;
            secretKey.symmetricEncryption = 'AES';
            secretKey.asymmetricEncryption = 'RSA';
        }
        var tConfig = {
            appId: this.config.appId,
            serverUrl: this.config.serverUrl,
            mode: mode,
            enableEncrypt: this.config.enableEncrypt,
            secretKey: secretKey,
            timeZone: this.config.timeZone
        };
        var autoTrack = [];
        if (_.isObject(this.config.autoTrack)) {
            if (this.config.autoTrack.appInstall) {
                autoTrack.push('appInstall');
            }
            if (this.config.autoTrack.appShow) {
                autoTrack.push('appStart');
            }
            if (this.config.autoTrack.appHide) {
                autoTrack.push('appEnd');
            }
            if (this.config.autoTrack.appCrash) {
                autoTrack.push('appCrash');
            }
        }
        var str = {
            appId: this.appId,
            autoTrack: autoTrack
        };
        if (this._isAndroid()) {
            this.androidApi.setCustomerLibInfo(Config.LIB_NAME, Config.LIB_VERSION);
            this.androidApi.enableTrackLog(this.config.enableLog);
            this.androidApi.sharedInstance(JSON.stringify(tConfig));
            this.androidApi.enableAutoTrack(JSON.stringify(str));
        } else if (this._isIOS()) {
            this.iosApi.setCustomerLibInfolibVersion(Config.LIB_NAME, Config.LIB_VERSION);
            this.iosApi.enableTrackLog(this.config.enableLog);
            this.iosApi.sharedInstance(JSON.stringify(tConfig));
            this.iosApi.enableAutoTrack(JSON.stringify(str));
        }
    }

    initInstance(name, config) {
        if (this._isNativePlatform()) {
            if (!_.isUndefined(config)) {
                this[name] = new ThinkingAnalyticsAPI(config);
            } else {
                this[name] = new ThinkingAnalyticsAPI(this.config);
            }
            this[name].init();
            return this[name];
        }
        this[name] = this.taJs.initInstance(name, config);
        return this[name];
    }

    lightInstance(name) {
        return this[name];
    }

    initInstanceForNative() {
        if (this._isAndroid()) {
            var androidApiClass = plus.android.importClass('cn.thinkingdata.engine.ThinkingAnalyticsUniAppAPI');
            this.androidApi = new androidApiClass();
        } else if (this._isIOS()) {
            var iOSApiClass = plus.ios.importClass('ThinkingGameEngineApi');
            this.iosApi = new iOSApiClass();
        }
    }

    calibrateTime(timeStampMillis) {
        // #ifdef  APP-PLUS
        if (this._isAndroid()) {
            this.androidApi.calibrateTime(timeStampMillis);
        } else if (this._isIOS()) {
            this.iosApi.calibrateTime(timeStampMillis);
        }
        // #endif
    }

    calibrateTimeWithNtp(ntpServer) {
        // #ifdef  APP-PLUS
        if (this._isAndroid()) {
            this.androidApi.calibrateTimeWithNtp(ntpServer);
        } else if (this._isIOS()) {
            this.iosApi.calibrateTimeWithNtp(ntpServer);
        }
        // #endif
    }

    /**
     * track a event
     * @param {*} eventName event name
     * @param {*} properties  event properties
     * @param {*} time event time
     * @param {*} onComplete callback
     */
    track(eventName, properties, time, onComplete) {
        if (this._isNativePlatform()) {
            this.trackForNative(eventName, properties, time);
            return;
        }
        this.taJs.track(eventName, properties, time, onComplete);
    }

    trackForNative(eventName, properties, time) {
        var timeStamp = _.isDate(time) ? time.getTime() : '';
        if (_.isUndefined(properties)) properties = {};
        properties = _.extend(properties,
            this.dynamicProperties ? this.dynamicProperties() : {}
        );
        properties = _.encodeDates(properties);
        var str = {
            appId: this.appId,
            eventName: eventName,
            properties: properties,
            time: timeStamp
        };
        if (this._isAndroid()) {
            this.androidApi.track(JSON.stringify(str));
        } else if (this._isIOS()) {
            this.iosApi.track(JSON.stringify(str));
        }
    }

    /**
     * You can implement the requirement to modify event data in a specific scenario through updatable events.
     * Updatable events need to specify an ID that identifies the event and pass it in when the updatable event object is created.
     * @param {*} options
     */
    trackUpdate(options) {
        if (this._isNativePlatform()) {
            this.trackUpdateForNative(options);
            return;
        }
        this.taJs.trackUpdate(options);
    }

    trackUpdateForNative(options) {
        var properties = _.extend(!_.isUndefined(options.properties) ? options.properties : {},
            this.dynamicProperties ? this.dynamicProperties() : {}
        );
        properties = _.encodeDates(properties);
        var timeStamp = _.isDate(options.time) ? options.time.getTime() : '';
        var str = {
            appId: this.appId,
            eventName: options.eventName,
            properties: properties,
            type: 1,
            eventId: options.eventId,
            time: timeStamp,
            timeZone: options.timeZone
        };
        if (this._isAndroid()) {
            this.androidApi.trackEvent(JSON.stringify(str));
        } else if (this._isIOS()) {
            this.iosApi.trackEvent(JSON.stringify(str));
        }
    }

    /**
     * Rewritable events will completely cover historical data with the latest data,
     * which is equivalent to deleting the previous data and storing the latest data in effect.
     * @param {*} options
     */
    trackOverwrite(options) {
        if (this._isNativePlatform()) {
            this.trackOverwriteForNative(options);
            return;
        }
        this.taJs.trackOverwrite(options);
    }

    trackOverwriteForNative(options) {
        var properties = _.extend(!_.isUndefined(options.properties) ? options.properties : {},
            this.dynamicProperties ? this.dynamicProperties() : {}
        );
        properties = _.encodeDates(properties);
        var timeStamp = _.isDate(options.time) ? options.time.getTime() : '';
        var str = {
            appId: this.appId,
            eventName: options.eventName,
            properties: properties,
            type: 2,
            eventId: options.eventId,
            time: timeStamp,
            timeZone: options.timeZone
        };
        if (this._isAndroid()) {
            this.androidApi.trackEvent(JSON.stringify(str));
        } else if (this._isIOS()) {
            this.iosApi.trackEvent(JSON.stringify(str));
        }
    }

    /**
     * The first event refers to the ID of a device or other dimension, which will only be recorded once.
     * @param {*} options
     */
    trackFirstEvent(options) {
        if (this._isNativePlatform()) {
            this.trackFirstEventForNative(options);
            return;
        }
        this.taJs.trackFirstEvent(options);
    }

    trackFirstEventForNative(options) {
        var properties = _.extend(!_.isUndefined(options.properties) ? options.properties : {},
            this.dynamicProperties ? this.dynamicProperties() : {}
        );
        properties = _.encodeDates(properties);
        var timeStamp = _.isDate(options.time) ? options.time.getTime() : '';
        var str = {
            appId: this.appId,
            eventName: options.eventName,
            properties: properties,
            type: 0,
            eventId: options.firstCheckId,
            time: timeStamp,
            timeZone: options.timeZone
        };
        if (this._isAndroid()) {
            this.androidApi.trackEvent(JSON.stringify(str));
        } else if (this._isIOS()) {
            this.iosApi.trackEvent(JSON.stringify(str));
        }
    }

    /**
     * Sets the user property, replacing the original value with the new value if the property already exists.
     * @param {*} properties user properties
     * @param {*} time track time
     * @param {*} onComplete callback
     */
    userSet(properties, time, onComplete) {
        if (this._isNativePlatform()) {
            this.userSetForNative(properties, time);
            return;
        }
        this.taJs.userSet(properties, time, onComplete);
    }

    userSetForNative(properties, time) {
        var timeStamp = _.isDate(time) ? time.getTime() : '';
        properties = _.encodeDates(properties);
        var str = {
            appId: this.appId,
            properties: properties,
            time: timeStamp
        };
        if (this._isAndroid()) {
            this.androidApi.userSet(JSON.stringify(str));
        } else if (this._isIOS()) {
            this.iosApi.userSet(JSON.stringify(str));
        }
    }

    /**
     * Sets a single user attribute, ignoring the new attribute value if the attribute already exists.
     * @param {*} properties user properties
     * @param {*} time track time
     * @param {*} onComplete callback
     * @returns
     */
    userSetOnce(properties, time, onComplete) {
        if (this._isNativePlatform()) {
            this.userSetOnceForNative(properties, time);
            return;
        }
        this.taJs.userSetOnce(properties, time, onComplete);
    }

    userSetOnceForNative(properties, time) {
        var timeStamp = _.isDate(time) ? time.getTime() : '';
        properties = _.encodeDates(properties);
        var str = {
            appId: this.appId,
            properties: properties,
            time: timeStamp
        };
        if (this._isAndroid()) {
            this.androidApi.userSetOnce(JSON.stringify(str));
        } else if (this._isIOS()) {
            this.iosApi.userSetOnce(JSON.stringify(str));
        }
    }

    /**
     * Reset user properties.
     * @param {*} property
     * @param {*} time
     * @param {*} onComplete
     * @returns
     */
    userUnset(property, time, onComplete) {
        if (this._isNativePlatform()) {
            this.userUnsetForNative(property, time);
            return;
        }
        this.taJs.userUnset(property, time, onComplete);
    }

    userUnsetForNative(property, time) {
        var timeStamp = _.isDate(time) ? time.getTime() : '';
        var str = {
            appId: this.appId,
            properties: [
                property
            ],
            time: timeStamp
        };
        if (this._isAndroid()) {
            this.androidApi.userUnset(JSON.stringify(str));
        } else if (this._isIOS()) {
            this.iosApi.userUnset(JSON.stringify(str));
        }
    }

    /**
     * Delete the user attributes,This operation is not reversible and should be performed with caution.
     * @param {*} time
     * @param {*} onComplete
     * @returns
     */
    userDel(time, onComplete) {
        if (this._isNativePlatform()) {
            this.userDelForNative(time);
            return;
        }
        this.taJs.userDel(time, onComplete);
    }

    userDelForNative(time) {
        var timeStamp = _.isDate(time) ? time.getTime() : '';
        var str = {
            appId: this.appId,
            time: timeStamp
        };
        if (this._isAndroid()) {
            this.androidApi.userDel(JSON.stringify(str));
        } else if (this._isIOS()) {
            this.iosApi.userDel(JSON.stringify(str));
        }
    }
    /**
     * Adds the numeric type user attributes.
     * @param {*} properties
     * @param {*} time
     * @param {*} onComplete
     * @returns
     */
    userAdd(properties, time, onComplete) {
        if (this._isNativePlatform()) {
            this.userAddForNative(properties, time);
            return;
        }
        this.taJs.userAdd(properties, time, onComplete);
    }

    userAddForNative(properties, time) {
        var timeStamp = _.isDate(time) ? time.getTime() : '';
        properties = _.encodeDates(properties);
        var str = {
            appId: this.appId,
            properties: properties,
            time: timeStamp
        };
        if (this._isAndroid()) {
            this.androidApi.userAdd(JSON.stringify(str));
        } else if (this._isIOS()) {
            this.iosApi.userAdd(JSON.stringify(str));
        }
    }

    /**
     * Append a user attribute of the List type.
     * @param {*} properties
     * @param {*} time
     * @param {*} onComplete
     * @returns
     */
    userAppend(properties, time, onComplete) {
        if (this._isNativePlatform()) {
            this.userAppendForNative(properties, time);
            return;
        }
        this.taJs.userAppend(properties, time, onComplete);
    }

    userAppendForNative(properties, time) {
        var timeStamp = _.isDate(time) ? time.getTime() : '';
        properties = _.encodeDates(properties);
        var str = {
            appId: this.appId,
            properties: properties,
            time: timeStamp
        };
        if (this._isAndroid()) {
            this.androidApi.userAppend(JSON.stringify(str));
        } else if (this._isIOS()) {
            this.iosApi.userAppend(JSON.stringify(str));
        }
    }

    /**
     * The element appended to the library needs to be done to remove the processing,and then import.
     * @param {*} properties
     * @param {*} time
     * @param {*} onComplete
     * @returns
     */
    userUniqAppend(properties, time, onComplete) {
        if (this._isNativePlatform()) {
            this.userUniqAppendForNative(properties, time);
            return;
        }
        this.taJs.userUniqAppend(properties, time, onComplete);
    }

    userUniqAppendForNative(properties, time) {
        var timeStamp = _.isDate(time) ? time.getTime() : '';
        properties = _.encodeDates(properties);
        var str = {
            appId: this.appId,
            properties: properties,
            time: timeStamp
        };
        if (this._isAndroid()) {
            this.androidApi.userUniqAppend(JSON.stringify(str));
        } else if (this._isIOS()) {
            this.iosApi.userUniqAppend(JSON.stringify(str));
        }
    }
    /**
     * Empty the cache queue. When this api is called, the data in the current cache queue will attempt to be reported.
     * If the report succeeds, local cache data will be deleted.
     * @returns
     */
    flush() {
        if (this._isNativePlatform()) {
            this.flushForNative();
            return;
        }
        this.taJs.flush();
    }

    flushForNative() {
        var str = {
            appId: this.appId
        };
        if (this._isAndroid()) {
            this.androidApi.flush(JSON.stringify(str));
        } else if (this._isIOS()) {
            this.iosApi.flush(JSON.stringify(str));
        }
    }

    authorizeOpenID(id) {
        this.identify(id);
    }

    /**
     * Set the distinct ID to replace the default UUID distinct ID.
     * @param {*} id
     * @returns
     */
    identify(id) {
        if (this._isNativePlatform()) {
            this.identifyForNative(id);
            return;
        }
        this.taJs.identify(id);
    }

    identifyForNative(distinctId) {
        var str = {
            appId: this.appId,
            distinctId: distinctId
        };
        if (this._isAndroid()) {
            this.androidApi.identify(JSON.stringify(str));
        } else if (this._isIOS()) {
            this.iosApi.identify(JSON.stringify(str));
        }
    }

    /**
     * Get a visitor ID: The #distinct_id value in the reported data.
     * @returns distinct ID
     */
    getDistinctId() {
        if (this._isNativePlatform()) {
            return this.getDistinctIdForNative();
        }
        return this.taJs.getDistinctId();
    }

    getDistinctIdForNative() {
        var str = {
            appId: this.appId
        };
        if (this._isAndroid()) {
            return this.androidApi.getDistinctId(JSON.stringify(str));
        } else if (this._isIOS()) {
            return this.iosApi.getDistinctId(JSON.stringify(str));
        }
    }

    /**
     * Set the account ID. Each setting overrides the previous value. Login events will not be uploaded.
     * @param {*} accoundId
     * @returns
     */
    login(accoundId) {
        if (this._isNativePlatform()) {
            this.loginForNative(accoundId);
            return;
        }
        this.taJs.login(accoundId);
    }

    loginForNative(accoundId) {
        var str = {
            appId: this.appId,
            loginId: accoundId
        };
        if (this._isAndroid()) {
            this.androidApi.login(JSON.stringify(str));
        } else if (this._isIOS()) {
            this.iosApi.login(JSON.stringify(str));
        }
    }

    getAccountId() {
        if (this._isNativePlatform()) {
            return this.getAccountIdForNative();
        }
        return this.taJs.getAccountId();
    }

    getAccountIdForNative() {
        return '';
    }

    /**
     * Clearing the account ID will not upload user logout events.
     * @returns
     */
    logout() {
        if (this._isNativePlatform()) {
            this.logoutForNative();
            return;
        }
        this.taJs.logout();
    }

    logoutForNative() {
        var str = {
            appId: this.appId,
        };
        if (this._isAndroid()) {
            this.androidApi.logout(JSON.stringify(str));
        } else if (this._isIOS()) {
            this.iosApi.logout(JSON.stringify(str));
        }
    }

    /**
     * Set the public event attribute, which will be included in every event uploaded after that.
     * The public event properties are saved without setting them each time.
     * @param {*} obj
     * @returns
     */
    setSuperProperties(obj) {
        if (this._isNativePlatform()) {
            this.setSuperPropertiesForNative(obj);
            return;
        }
        this.taJs.setSuperProperties(obj);
    }

    setSuperPropertiesForNative(properties) {
        properties = _.encodeDates(properties);
        var str = {
            appId: this.appId,
            properties: properties
        };
        if (this._isAndroid()) {
            this.androidApi.setSuperProperties(JSON.stringify(str));
        } else if (this._isIOS()) {
            this.iosApi.setSuperProperties(JSON.stringify(str));
        }
    }

    /**
     * Clear all public event attributes.
     * @returns
     */
    clearSuperProperties() {
        if (this._isNativePlatform()) {
            this.clearSuperPropertiesForNative();
            return;
        }
        this.taJs.clearSuperProperties();
    }

    clearSuperPropertiesForNative() {
        var str = {
            appId: this.appId
        };
        if (this._isAndroid()) {
            this.androidApi.clearSuperProperties(JSON.stringify(str));
        } else if (this._isIOS()) {
            this.iosApi.clearSuperProperties(JSON.stringify(str));
        }
    }

    /**
     * Clears a public event attribute.
     * @param {*} propertyName
     * @returns
     */
    unsetSuperProperty(propertyName) {
        if (this._isNativePlatform()) {
            this.unsetSuperPropertyForNative(propertyName);
            return;
        }
        this.taJs.unsetSuperProperty(propertyName);
    }

    unsetSuperPropertyForNative(propertyName) {
        var str = {
            appId: this.appId,
            property: propertyName
        };
        if (this._isAndroid()) {
            this.androidApi.unsetSuperProperty(JSON.stringify(str));
        } else if (this._isIOS()) {
            this.iosApi.unsetSuperProperty(JSON.stringify(str));
        }
    }

    /**
     * Gets the public event properties that have been set.
     * @returns Public event properties that have been set
     */
    getSuperProperties() {
        if (this._isNativePlatform()) {
            return this.getSuperPropertiesForNative();
        }
        return this.taJs.getSuperProperties();
    }

    getSuperPropertiesForNative() {
        var str = {
            appId: this.appId,
        };
        if (this._isAndroid()) {
            return this.androidApi.getSuperProperties(JSON.stringify(str));
        } else if (this._isIOS()) {
            return this.iosApi.getSuperProperties(JSON.stringify(str));
        }
    }

    /**
     * Gets prefabricated properties for all events.
     * @returns
     */
    getPresetProperties() {
        if (this._isNativePlatform()) {
            var properties = JSON.parse(this.getPresetPropertiesForNative());
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
            var zoneOffset = properties['#zone_offset'];
            presetProperties.zoneOffset = _.isUndefined(zoneOffset) ? '' : zoneOffset;
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

    getPresetPropertiesForNative() {
        var str = {
            appId: this.appId,
        };
        if (this._isAndroid()) {
            return this.androidApi.getPresetProperties(JSON.stringify(str));
        } else if (this._isIOS()) {
            return this.iosApi.getPresetProperties(JSON.stringify(str));
        }
    }

    /**
     * Set dynamic public properties. Each event uploaded after that will contain a public event attribute.
     * @param {*} dynamicProperties
     * @returns
     */
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

    /**
     * Record the event duration, call this method to start the timing, stop the timing when the target event is uploaded,
     * and add the attribute #duration to the event properties, in seconds.
     * @param {*} eventName
     * @param {*} time
     * @returns
     */
    timeEvent(eventName, time) {
        if (this._isNativePlatform()) {
            this.timeEventForNative(eventName);
            return;
        }
        this.taJs.timeEvent(eventName, time);
    }

    timeEventForNative(eventName) {
        var str = {
            appId: this.appId,
            eventName: eventName
        };
        if (this._isAndroid()) {
            this.androidApi.timeEvent(JSON.stringify(str));
        } else if (this._isIOS()) {
            this.iosApi.timeEvent(JSON.stringify(str));
        }
    }

    getDeviceId() {
        if (this._isNativePlatform()) {
            return this.getDeviceIdForNative();
        }
        return this.taJs.getDeviceId();
    }

    getDeviceIdForNative() {
        var str = {
            appId: this.appId,
        };
        if (this._isAndroid()) {
            return this.androidApi.getDeviceId(JSON.stringify(str));
        } else if (this._isIOS()) {
            return this.iosApi.getDeviceId(JSON.stringify(str));
        }
    }

    enableTracking(enabled) {
        if (this._isNativePlatform()) {
            if (enabled) {
                this.setTrackStatus('NORMAL');
            } else {
                this.setTrackStatus('PAUSE');
            }
            return;
        }
        this.taJs.enableTracking(enabled);
    }

    optOutTracking() {
        if (this._isNativePlatform()) {
            this.setTrackStatus('STOP');
            return;
        }
        this.taJs.optOutTracking();
    }

    optOutTrackingAndDeleteUser() {
        if (this._isNativePlatform()) {
            return;
        }
        this.taJs.optOutTrackingAndDeleteUser();
    }

    optInTracking() {
        if (this._isNativePlatform()) {
            this.setTrackStatus('NORMAL');
            return;
        }
        this.taJs.optInTracking();
    }

    /**
    * Set the data reporting status
    * PAUSE Suspending Data Reporting
    * STOP Stop data reporting and clear the cache
    * SAVE_ONLY Data is stored, but not reported (support native)
    * NORMAL Reporting Restored Data
    * @param {string} status
    */
    setTrackStatus(status) {
        if (this._isNativePlatform()) {
            this.setTrackStatusForNative(status);
            return;
        }
        this.taJs.setTrackStatus(status);
    }

    setTrackStatusForNative(status) {
        var sta = 'normal';
        switch (status) {
            case 'PAUSE':
                sta = 'pause';
                break;
            case 'STOP':
                sta = 'stop';
                break;
            case 'SAVE_ONLY':
                sta = 'saveOnly';
                break;
            case 'NORMAL':
            default:
                sta = 'normal';
                break;
        }
        var str = {
            appId: this.appId,
            status: sta
        };
        if (this._isAndroid()) {
            this.androidApi.setTrackStatus(JSON.stringify(str));
        } else if (this._isIOS()) {
            this.iosApi.setTrackStatus(JSON.stringify(str));
        }
    }

}

