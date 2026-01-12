
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
// #ifdef APP-PLUS
import { initTDSDK,enableAutoTrackNative,setCustomerLibInfo,trackNative,trackUpdateNative,trackOverwriteNative,trackFirstNative,userSetNative,
    userSetOnceNative,userUnsetNative,userDelNative,userAddNative,userAppendNative,userUniqAppendNative,flushNative,setDistinctIdNative,
    getDistinctIdNative,loginNative,logoutNative,getAccountIdNative,setSuperPropertiesNative,clearSuperPropertiesNative,unsetSuperPropertyNatice,
    getSuperPropertiesNative,getPresetPropertiesNative,timeEventNative,getDeviceIdNative,setTrackStatusNative} from '@/uni_modules/td-analytics';
// #endif

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
        return false;
    }

    _isAndroid() {
        return true;
    }

    _init(config) {
        this.name = config.name;
        this.appId = config.appId || config.appid;
        if (this._isNativePlatform()) {
            setCustomerLibInfo(Config.LIB_NAME,Config.LIB_VERSION);
            initTDSDK(this.config);
        }else{
            this.taJs = new ThinkingDataAPI(config);
        }
    }

    /**
     * SDK initialization
     * @returns sdk instance
     */
    init() {
        if (this._isNativePlatform()) {
            if(this.config.autoTrack){
                enableAutoTrackNative(this.config.autoTrack,this.appId);
            }
            return;
        }
        this.taJs.init();
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

    /**
     * track a event
     * @param {*} eventName event name
     * @param {*} properties  event properties
     * @param {*} time event time
     * @param {*} onComplete callback
     */
    track(eventName, properties, time, onComplete) {
        if (this._isNativePlatform()) {
            if (_.isUndefined(properties)) properties = {};
            properties = _.extend(properties,
                this.dynamicProperties ? this.dynamicProperties() : {}
            );
            properties = _.encodeDates(properties);
            trackNative(eventName,properties,this.appId);
            return;
        }
        this.taJs.track(eventName, properties, time, onComplete);
    }

    _internalTrack(eventName, properties){
        if (this._isNativePlatform()) {
            if (_.isUndefined(properties)) properties = {};
            properties = _.extend(properties,
                this.dynamicProperties ? this.dynamicProperties() : {}
            );
            properties = _.encodeDates(properties);
            trackNative(eventName,properties,this.appId);
            return;
        }
        this.taJs._internalTrack(eventName, properties);
    }

    /**
     * You can implement the requirement to modify event data in a specific scenario through updatable events.
     * Updatable events need to specify an ID that identifies the event and pass it in when the updatable event object is created.
     * @param {*} options
     */
    trackUpdate(options) {
        if (this._isNativePlatform()) {
            var properties = _.extend(!_.isUndefined(options.properties) ? options.properties : {},
                this.dynamicProperties ? this.dynamicProperties() : {}
            );
            properties = _.encodeDates(properties);
            trackUpdateNative(options.eventName,properties,options.eventId ? options.eventId : '',this.appId);
            return;
        }
        this.taJs.trackUpdate(options);
    }

    /**
     * Rewritable events will completely cover historical data with the latest data,
     * which is equivalent to deleting the previous data and storing the latest data in effect.
     * @param {*} options
     */
    trackOverwrite(options) {
        if (this._isNativePlatform()) {
            var properties = _.extend(!_.isUndefined(options.properties) ? options.properties : {},
                this.dynamicProperties ? this.dynamicProperties() : {}
            );
            properties = _.encodeDates(properties);
            trackOverwriteNative(options.eventName,properties,options.eventId ? options.eventId : '',this.appId);
            return;
        }
        this.taJs.trackOverwrite(options);
    }

    /**
     * The first event refers to the ID of a device or other dimension, which will only be recorded once.
     * @param {*} options
     */
    trackFirstEvent(options) {
        if (this._isNativePlatform()) {
            var properties = _.extend(!_.isUndefined(options.properties) ? options.properties : {},
                this.dynamicProperties ? this.dynamicProperties() : {}
            );
            properties = _.encodeDates(properties);
            trackFirstNative(options.eventName,properties,options.firstCheckId ? options.firstCheckId:'',this.appId);
            return;
        }
        this.taJs.trackFirstEvent(options);
    }

    /**
     * Sets the user property, replacing the original value with the new value if the property already exists.
     * @param {*} properties user properties
     * @param {*} time track time
     * @param {*} onComplete callback
     */
    userSet(properties, time, onComplete) {
        if (this._isNativePlatform()) {
            properties = _.encodeDates(properties);
            userSetNative(properties,this.appId);
            return;
        }
        this.taJs.userSet(properties, time, onComplete);
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
            properties = _.encodeDates(properties);
            userSetOnceNative(properties,this.appId);
            return;
        }
        this.taJs.userSetOnce(properties, time, onComplete);
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
            userUnsetNative(property,this.appId);
            return;
        }
        this.taJs.userUnset(property, time, onComplete);
    }

    /**
     * Delete the user attributes,This operation is not reversible and should be performed with caution.
     * @param {*} time
     * @param {*} onComplete
     * @returns
     */
    userDel(time, onComplete) {
        if (this._isNativePlatform()) {
            userDelNative(this.appId);
            return;
        }
        this.taJs.userDel(time, onComplete);
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
            properties = _.encodeDates(properties);
            userAddNative(properties,this.appId);
            return;
        }
        this.taJs.userAdd(properties, time, onComplete);
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
            properties = _.encodeDates(properties);
            userAppendNative(properties,this.appId);
            return;
        }
        this.taJs.userAppend(properties, time, onComplete);
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
            properties = _.encodeDates(properties);
            userUniqAppendNative(properties,this.appId);
            return;
        }
        this.taJs.userUniqAppend(properties, time, onComplete);
    }

    /**
     * Empty the cache queue. When this api is called, the data in the current cache queue will attempt to be reported.
     * If the report succeeds, local cache data will be deleted.
     * @returns
     */
    flush() {
        if (this._isNativePlatform()) {
            flushNative(this.appId);
            return;
        }
        this.taJs.flush();
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
            setDistinctIdNative(id,this.appId);
            return;
        }
        this.taJs.identify(id);
    }

    /**
     * Get a visitor ID: The #distinct_id value in the reported data.
     * @returns distinct ID
     */
    getDistinctId() {
        if (this._isNativePlatform()) {
            return getDistinctIdNative(this.appId);
        }
        return this.taJs.getDistinctId();
    }

    /**
     * Set the account ID. Each setting overrides the previous value. Login events will not be uploaded.
     * @param {*} accoundId
     * @returns
     */
    login(accoundId) {
        if (this._isNativePlatform()) {
            loginNative(accoundId,this.appId);
            return;
        }
        this.taJs.login(accoundId);
    }

    getAccountId() {
        if (this._isNativePlatform()) {
            return getAccountIdNative(this.appId);
        }
        return this.taJs.getAccountId();
    }

    /**
     * Clearing the account ID will not upload user logout events.
     * @returns
     */
    logout() {
        if (this._isNativePlatform()) {
            logoutNative(this.appId);
            return;
        }
        this.taJs.logout();
    }

    /**
     * Set the public event attribute, which will be included in every event uploaded after that.
     * The public event properties are saved without setting them each time.
     * @param {*} properties
     * @returns
     */
    setSuperProperties(properties) {
        if (this._isNativePlatform()) {
            properties = _.encodeDates(properties);
            setSuperPropertiesNative(properties,this.appId);
            return;
        }
        this.taJs.setSuperProperties(properties);
    }

    /**
     * Clear all public event attributes.
     * @returns
     */
    clearSuperProperties() {
        if (this._isNativePlatform()) {
            clearSuperPropertiesNative(this.appId);
            return;
        }
        this.taJs.clearSuperProperties();
    }

    /**
     * Clears a public event attribute.
     * @param {*} propertyName
     * @returns
     */
    unsetSuperProperty(propertyName) {
        if (this._isNativePlatform()) {
            unsetSuperPropertyNatice(propertyName,this.appId);
            return;
        }
        this.taJs.unsetSuperProperty(propertyName);
    }

    /**
     * Gets the public event properties that have been set.
     * @returns Public event properties that have been set
     */
    getSuperProperties() {
        if (this._isNativePlatform()) {
            return getSuperPropertiesNative(this.appId);
        }
        return this.taJs.getSuperProperties();
    }

    /**
     * Gets prefabricated properties for all events.
     * @returns
     */
    getPresetProperties() {
        if (this._isNativePlatform()) {
            var properties = getPresetPropertiesNative(this.appId);
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
            presetProperties.deviceId = properties['#device_id'];
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
            timeEventNative(eventName,this.appId);
            return;
        }
        this.taJs.timeEvent(eventName, time);
    }

    getDeviceId() {
        if (this._isNativePlatform()) {
            return getDeviceIdNative();
        }
        return this.taJs.getDeviceId();
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
            setTrackStatusNative(status,this.appId);
            return;
        }
        this.taJs.setTrackStatus(status);
    }

}

