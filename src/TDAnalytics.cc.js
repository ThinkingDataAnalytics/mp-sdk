import ThinkingDataAPIForNative from './ThinkingDataAPI.cc';
import PlatformAPI from './PlatformAPI';
import { Config } from './Config';
import {
    _
} from './utils';
/**
 * TDAnalytics, ThinkingData Analytics SDK for Mini Game & App.
 * @example
 * //引入SDK
 * var TDAnalytics = require('./thinkingdata.wx.min.js');
 * //初始化SDK
 * var config = {
 *   appId: 'your-app-id', // 项目的 App ID
 *   serverUrl: 'https://your.serverurl.com' // 数据上报地址
 * };
 * TDAnalytics.init(config);
 * //用户登录
 * TDAnalytics.login('thinker');
 * //设置事件公共属性
 * var superProperties = {
 *     channel : 'td', //字符串
 *     age : 1,//数字
 *     isSuccess : true,//布尔
 *     birthday :  new Date(),//日期
 *     array : [ 'value' ],//数组
 *     row : { key : 'value' },//对象
 *     array_rows : [ { key : 'value' } ]//对象组
 * };
 * TDAnalytics.setSuperProperties(superProperties);
 * //上报事件
 * var eventProperties = {
 *     product_name: '钻石'
 * };
 * TDAnalytics.track({
 *     eventName: 'product_buy', // 事件名称
 *     properties: eventProperties //事件属性
 * });
 * //上报用户属性
 * var userProperties = {
 *     username: 'tiki'
 * };
 * TDAnalytics.userSet({
 *     properties: userProperties
 * });
 */

class TDAnalytics {

    // constructor(){

    // }

    static _shareInstance(appId) {
        if (this._instanceMaps[appId] !== undefined) {
            return this._instanceMaps[appId];
        }
        else if (this._defaultInstance !== undefined) {
            return this._defaultInstance;
        }
        else {
            return undefined;
        }
    }
    //初始化
    /**
     * Create a new instance.
     * All properties that can be set are independent of the main instance.
     *
     * @param {Object} config
     * @param {String} config.appId Project App ID
     * @param {String} config.serverUrl Project Server Url
     * @param {Object} config.autoTrack Auto-tracking Events
     * @param {Boolean} config.autoTrack.appShow Auto Track App Show Events
     * @param {Boolean} config.autoTrack.appHide Auto Track App Hide Events
     * @param {Boolean} config.enableLog Enable Log Printing
     */
    static init(config,beforeInit) {
        try {
            if (this._instanceMaps && this._instanceMaps[config.appId]) return;
            var td = new ThinkingDataAPIForNative(config);
            if (td !== undefined) {
                if (this._defaultInstance === undefined) {
                    this._defaultInstance = td;
                    this._instanceMaps = {};
                }
                this._instanceMaps[config.appId] = td;
                if(_.isFunction(beforeInit)){
                    beforeInit();
                }
                td.init();
            }
        } catch (e) {
            console.log('TDAnalytics SDK initialize fail with reason = ' + e);
        }
    }

    //轻实例
    /**
     * Get sub-instance with name
     *
     * @param {String} appId Project App ID
     * @returns {String} Sub-instance token
     */
    static lightInstance(appId) {
        return this._shareInstance(appId).lightInstance();
    }

    //事件
    //普通事件
    /**
     * Track a narmal Event.
     * @param {Object} options
     * @param {String} options.eventName Event name, required
     * @param {Object} options.properties Event properties, optional
     * @param {Date} options.time Event time, optional
     * @param {Function} options.onComplete Callback, optional
     * @param {String} appId Project App ID
     */
    static track(options = {}, appId = '') {
        this._shareInstance(appId).track(options.eventName, options.properties, options.time, options.onComplete);
    }

    static trackInternal(options = {}, appId = '') {
        this._shareInstance(appId).trackInternal(options);
    }

    /**
     * Track a first Event
     * @param {Object} options event infomations
     *
     * @param {String} options.eventName Event name, required
     * @param {String} options.firstCheckId Event ID, to mark the event, default is #device_id, required
     * @param {Date} options.time Event time, optional
     * @param {Object} options.properties Event properties, optional
     * @param {Function} options.onComplete Callback, optional
     * @param {String} appId Project App ID, optional
     */
    static trackFirst(options = {}, appId = '') {
        this._shareInstance(appId).trackFirstEvent(options);
    }

    /**
     * Track a updatable Event
     * @param {Object} options event infomations
     *
     * @param {String} options.eventName Event name, required
     * @param {String} options.eventId Event ID, to mark the event, required
     * @param {Date} options.time Event time, optional
     * @param {Object} options.properties Event properties, optional
     * @param {Function} options.onComplete Callback, optional
     * @param {String} appId Project App ID, optional
     */
    static trackUpdate(options = {}, appId = '') {
        this._shareInstance(appId).trackUpdate(options);
    }

    /**
     * Track a overwritable Event
     * @param {Object} options event infomations
     *
     * @param {String} options.eventName Event name, required
     * @param {String} options.eventId Event ID, to mark the event, required
     * @param {Date} options.time Event time, optional
     * @param {Object} options.properties Event properties, optional
     * @param {Function} options.onComplete Callback, optional
     * @param {String} appId Project App ID, optional
     */
    static trackOverwrite(options = {}, appId = '') {
        this._shareInstance(appId).trackOverwrite(options);
    }

    /**
     * Record the event duration, call this method to start the timing, stop the timing when the target event is uploaded, and add the attribute #duration to the event properties, in seconds.
     * @param {Object} options
     * @param {String} options.eventName Event name
     * @param {Date} options.time Event time
     * @param {String} appId Project App ID
     */
    static timeEvent(options = {}, appId = '') {
        this._shareInstance(appId).timeEvent(options.eventName, options.time);
    }

    /**
     *
     */
    // static enableAutoTrack(eventType, properties, appid) {

    // }


    /**
     * Sets the user property, replacing the original value with the new value if the property already exists.
     * @param {Object} options
     * @param {Object} options.properties Event properties, optional
     * @param {Date} options.time Event time, optional
     * @param {Function} options.onComplete Callback, optional
     * @param {String} appId Project App ID
     */
    static userSet(options = {}, appId = '') {
        this._shareInstance(appId).userSet(options.properties, options.time, options.onComplete);
    }

    /**
     * Sets a single user attribute, ignoring the new attribute value if the attribute already exists.
     * @param {Object} options
     * @param {Object} options.properties Event properties, optional
     * @param {Date} options.time Event time, optional
     * @param {Function} options.onComplete Callback, optional
     * @param {String} appId Project App ID
     */
    static userSetOnce(options = {}, appId = '') {
        this._shareInstance(appId).userSetOnce(options.properties, options.time, options.onComplete);
    }

    /**
     * Reset user properties.
     * @param {Object} options
     * @param {String} options.property Event property, optional
     * @param {Date} options.time Event time, optional
     * @param {Function} options.onComplete Callback, optional
     * @param {String} appId Project App ID
     */
    static userUnset(options = {}, appId = '') {
        this._shareInstance(appId).userUnset(options.property, options.time, options.onComplete);
    }

    /**
     * Adds the numeric type user attributes.
     * @param {Object} options
     * @param {Object} options.properties Event properties, optional
     * @param {Date} options.time Event time, optional
     * @param {Function} options.onComplete Callback, optional
     * @param {String} appId Project App ID
     */
    static userAdd(options = {}, appId = '') {
        this._shareInstance(appId).userAdd(options.properties, options.time, options.onComplete);
    }

    /**
     * Append a user attribute of the List type.
     * @param {Object} options
     * @param {Object} options.properties Event properties, optional
     * @param {Date} options.time Event time, optional
     * @param {Function} options.onComplete Callback, optional
     * @param {String} appId Project App ID
     */
    static userAppend(options = {}, appId = '') {
        this._shareInstance(appId).userAppend(options.properties, options.time, options.onComplete);
    }

    /**
     * The element appended to the library needs to be done to remove the processing,and then import.
     * @param {Object} options
     * @param {Object} options.properties Event properties, optional
     * @param {Date} options.time Event time, optional
     * @param {Function} options.onComplete Callback, optional
     * @param {String} appId Project App ID
     */
    static userUniqAppend(options = {}, appId = '') {
        this._shareInstance(appId).userUniqAppend(options.properties, options.time, options.onComplete);
    }

    /**
     * Delete the user attributes,This operation is not reversible and should be performed with caution.
     * @param {Object} options
     * @param {Date} options.time Event time, optional
     * @param {Function} options.onComplete Callback, optional
     * @param {String} appId Project App ID
     */
    static userDelete(options = {}, appId = '') {
        this._shareInstance(appId).userDel(options.time, options.onComplete);
    }

    /**
     * Set the public event attribute, which will be included in every event uploaded after that. The public event properties are saved without setting them each time.
     * @param {Object} properties Public event attribute
     * @param {String} appId Project App ID
     */
    static setSuperProperties(properties, appId = '') {
        this._shareInstance(appId).setSuperProperties(properties);
    }

    /**
     * Clears a public event attribute.
     * @param {String} property Public event attribute key to clear
     * @param {String} appId Project App ID
     */
    static unsetSuperProperty(property, appId = '') {
        this._shareInstance(appId).unsetSuperProperty(property);
    }

    /**
     * Clear all public event attributes.
     * @param {String} appId Project App ID
     */
    static clearSuperProperties(appId) {
        this._shareInstance(appId).clearSuperProperties();
    }

    /**
     * Gets the public event properties that have been set.
     * @param {String} appId Project App ID
     * @returns {Object} Public event properties that have been set
     */
    static getSuperProperties(appId) {
        return this._shareInstance(appId).getSuperProperties();
    }

    /**
     * Set dynamic public properties. Each event uploaded after that will contain a public event attribute.
     * @param {Function} dynamicProperties Dynamic public attribute interface
     * @param {String} appId Project App ID
     */
    static setDynamicSuperProperties(dynamicProperties, appId = '') {
        this._shareInstance(appId).setDynamicSuperProperties(dynamicProperties);
    }

    static registerAnalyticsObserver(analyticsObserver, appId = '') {
        this._shareInstance(appId).registerAnalyticsObserver(analyticsObserver);
    }

    /**
     * Gets prefabricated properties for all events.
     * @param {String} appId Project App ID
     * @returns {Object} preset properties
     */
    static getPresetProperties(appId) {
        return this._shareInstance(appId).getPresetProperties();
    }

    /**
     * Set the account ID. Each setting overrides the previous value. Login events will not be uploaded.
     * @param {String} accountId Login user account ID
     * @param {String} appId Project App ID
     */
    static login(accountId, appId = '') {
        this._shareInstance(appId).login(accountId);
    }

    /**
     * Clearing the account ID will not upload user logout events.
     * @param {String} appId Project App ID
     */
    static logout(appId) {
        this._shareInstance(appId).logout();
    }

    /**
     * Set the distinct ID to replace the default UUID distinct ID.
     * @param {String} distinctId Distinct ID
     * @param {String} appId Project App ID
     */
    static setDistinctId(distinctId, appId = '') {
        this._shareInstance(appId).identify(distinctId);
    }

    /**
     * Get a visitor ID The #distinct_id value in the reported data.
     * @param {String} appId Project App ID
     * @returns {String} distinct ID
     */
    static getDistinctId(appId) {
        return this._shareInstance(appId).getDistinctId();
    }

    /**
     * Get a account ID The #account_id value in the reported data.
     * @param {String} appId Project App ID
     * @returns {String} accoount ID
     */
    static getAccountId(appId) {
        return this._shareInstance(appId).getAccountId();
    }

    /**
     * Get sdk version
     * @returns {String} sdk version
     */
    static getSDKVersion() {
        return Config.LIB_VERSION;
    }

    /**
     * Get device ID
     * @param {String} appId Project App ID
     * @returns {String} Current Device ID
     */
    static getDeviceId(appId) {
        return this._shareInstance(appId).getDeviceId();
    }

    /**
     * Empty the cache queue. When this api is called, the data in the current cache queue will attempt to be reported.
     * If the report succeeds, local cache data will be deleted.
     * @param {String} appId Project App ID
     */
    static flush(appId) {
        this._shareInstance(appId).flush();
    }

    /**
    * Set status for events reporting
    * PAUSE, pause events reporting
    * STOP, stop events reporting, and cache data will be cleared
    * SAVE_ONLY, event data stores in the cache, but not be reported (native support, js equal to NORMAL)
    * NORMAL, resume event reporting
    * @param {String} status Events reporting status
    * @param {String} appId Project App ID
    */
    static setTrackStatus(status, appId = '') {
        this._shareInstance(appId).setTrackStatus(status);
    }

    /**
     * Get old api ThinkingDataAPI
     * @returns {Function} ThinkingDataAPI, old api
     */
    static ThinkingDataAPI() {
        return ThinkingDataAPIForNative;
    }
}
PlatformAPI.setGlobalData(TDAnalytics);
export default TDAnalytics;
window['TDAnalytics'] = TDAnalytics;
