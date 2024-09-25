/* eslint-disable no-undef */
import fetch from '@system.fetch';
import device from '@system.device';
import network from '@system.network';
import storage from '@system.storage';
import prompt from '@system.prompt';

import {
    _,
    logger
} from '../utils';

/**
 * Quick application interface
 */
export default class PlatformProxy {

    constructor() {
        this.config = {persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_quick_mp', asyncPersistence: true};
    }

    static createInstance() {
        return new PlatformProxy();
    }

    initConfig(config){
        this.initConfig = config;
    }

    /**
     * Get platform specific configuration: persistenceName required
     */
    getConfig() {
        return this.config || {};
    }

    /**
     * Get local cache data
     * @param {string} name: cache key
     * @param {boolean} async: enable asynchronous getting cached
     * @param {function} callback: callback when getting data asynchronously, the parameter is an object
     * @return return cached data, it is an object
     */
    getStorage(name, async, callback) {
        if (!async) logger.warn('ThinkingAnalytics: invalid storage configuration');
        storage.get({
            key: name,
            success: function(ret) {
                var data = _.isJSONString(ret) ? JSON.parse(ret) : {};
                callback(data);
            },
            fail: function() {
                logger.warn('ThinkingAnalytics: getStorage faild');
                callback({});
            }
        });
    }

    /**
     * Set local cache data
     * @param {string} name: cache key
     * @param {string} value: JSON string value
     */
    setStorage(name, value) {
        storage.set({
            key: name,
            value: value
        });
    }

    /**
     * Delete data in local cache with key
     * @param {*} name: cache key
     */
    removeStorage(name) {
        storage.delete({
            key: name
        });
    }

    /**
     * Get system information asynchronously
     * @param {object} options: callback when getting completion
     * callback parameter：
        * brand: string, device brand
        * model: string, device model
        * screenWidth: number, screen width, unit px
        * screenHeight: number, screen height, unit px
        * system: string, operating system and version
        * platform: string, client platform
     */
    getSystemInfo(options) {
        device.getInfo({
            success(ret) {
                var deviceInfo = ret;
                var systemArr = [ret['osType'], ret['osVersionName']];
                var system = systemArr.join(' ');
                deviceInfo['system'] = system;
                deviceInfo['screenWidth'] = ret['screenWidth'] / (ret['screenDensity']>0 ? ret['screenDensity'] : 1);
                deviceInfo['screenHeight'] = ret['screenHeight'] / (ret['screenDensity']>0 ? ret['screenDensity'] : 1);
                deviceInfo['mp_platform'] = 'quickapp';
                options.success(deviceInfo);
            },
            complete() {
                options.complete();
            }
        });
    }

    /**
     * Get network type asynchronously
     * @param {object} options: callback when getting completion
     * res.networkType string: network type
     */
    getNetworkType(options) {
        network.getType({
            success(data) {
                options.success({
                    networkType: data.type
                });
            },
            complete() {
                options.complete();
            }
        });
    }

    /**
     * Listen for network state change
     * @param {function} callback: callback when network state changing
     */
    onNetworkStatusChange(callback) {
        network.subscribe({
            callback(data) {
                callback({
                    networkType: data.type
                });
            }
        });
    }

    /**
     * Make a network request
     * @param {object} options: parameters, including:
     *   url       string         server url
     *   data      string/object  request parameters
     *   method    string         HTTP method
     *   success   function       success callback
     *   fail      function       fail callback
     *   complete  function       complete callback
     */
    request(options) {
        return fetch.fetch({
            url: options.url,
            data: options.data,
            method: options.method,
            header: options.header,
            success: function (response) {
                var res = {};
                res['statusCode'] = response.code;
                if (_.isJSONString(response.data)) {
                    res['data'] = JSON.parse(response.data);
                }
                options.success(res);
            },
            fail: function fail(data) {
                var res = {};
                res['errMsg'] = data['message'];
                options.fail(res);
            }
        });
    }


    /**
     * Initialize the lifecycle monitoring instance
     * @param {ThinkingDataAPI} instance: SDK instance, listen lifecycle of application
     * @param {object} config: auto-tracking events config
     */
    initAutoTrackInstance() {
        logger.warn('ThinkingAnalytics: Quick App does not support automatic collection. You can contact TA support personnel to collect related events');
    }

    setGlobal(instance, name) {
        globalThis[name] = instance;
    }

    /**
     * Get system startup information, and register APP cut-off foreground callback
     */
    getAppOptions() {
        return {};
    }

    /**
     * Toast Debug information
     * @param {string} msg: information to display
     */
    showToast(msg) {
        prompt.showToast({
            message: msg,
            duration: 2000
        });
    }
}
