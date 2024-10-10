/* eslint-disable no-undef */
import {
    _
} from '../utils';

class AutoTrackBridge {
    constructor(instance, config) {

        this.taInstance = instance;
        this.config = config || {};
        // The onShow of VIVO Quick Game is defined as the event of returning to the foreground, so the onshow at startup is added here.
        if (this.config.appShow) {
            this.taInstance._internalTrack('ta_mg_show');
        }

        if (this.config.appHide) {
            this.taInstance.timeEvent('ta_mg_hide');
        }

        qg.onShow(() => {
            if (this.config.appHide) {
                this.taInstance.timeEvent('ta_mg_hide');
            }

            if (this.config.appShow) {
                var properties = {};
                _.extend(properties, this.config.properties);
                if (_.isFunction(this.config.callback)) {
                    _.extend(properties, this.config.callback('appShow'));
                }
                this.taInstance._internalTrack('ta_mg_show');
            }
        });

        qg.onHide(() => {
            if (this.config.appHide) {
                var properties = {};
                _.extend(properties, this.config.properties);
                if (_.isFunction(this.config.callback)) {
                    _.extend(properties, this.config.callback('appHide'));
                }
                this.taInstance._internalTrack('ta_mg_hide');
            }
        });
    }
}

/**
 * vivo mini game interface
 */
export default class PlatformProxy {

    constructor() {
        this.config = {persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_qg_vivo_game', asyncPersistence: true};
    }

    static createInstance() {
        return new PlatformProxy();
    }

    initSdkConfig(config){
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
        // if (!async) logger.warn('TA: invalid storage configuration');
        if (async) {
            qg.getStorage({
                key: name,
                success(res) {
                    var data = _.isJSONString(res) ? JSON.parse(res) : {};
                    callback(data);
                },
                fail() {
                    callback({});
                }
            });
        } else {
            var data = qg.getStorageSync({ key: name });
            if (_.isJSONString(data)) {
                return JSON.parse(data);
            } else {
                return {};
            }
        }
    }

    /**
     * Set local cache data
     * @param {string} name: cache key
     * @param {string} value: JSON string value
     */
    setStorage(name, value) {
        qg.setStorage({
            key: name,
            value: value
        });
    }

    /**
     * Delete data in local cache with key
     * @param {*} name: cache key
     */
    removeStorage(name) {
        qg.deleteStorage({
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
        qg.getSystemInfo({
            success(ret) {
                var deviceInfo = ret;
                var systemArr = [ret['osType'], ret['osVersionName']];
                var system = systemArr.join(' ');
                deviceInfo['brand'] = ret['manufacturer'];
                deviceInfo['system'] = system;
                deviceInfo['mp_platform'] = 'vivo_qg';
                options.success(deviceInfo);
            },
            complete: function () {
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
        qg.getNetworkType({
            success(data) {
                var networkInfo = data;
                networkInfo['networkType'] = data.type;
                options.success(networkInfo);
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
        qg.subscribeNetworkStatus({
            callback(data) {
                var networkInfo = data;
                networkInfo['networkType'] = data.type;
                callback(networkInfo);
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
        return qg.request({
            url: options.url,
            data: options.data,
            method: options.method,
            header: options.header,
            success: function (response) {
                options.success(response);
            },
            fail: function fail(data) {
                options.fail(data);
            }
        });
    }

    /**
     * Initialize the lifecycle monitoring instance
     * @param {ThinkingDataAPI} instance: SDK instance, listen lifecycle of application
     * @param {object} config: auto-tracking events config
     */
    initAutoTrackInstance(instance, config) {
        return new AutoTrackBridge(instance, config.autoTrack);
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
        qg.showToast({
            message: msg,
            duration: 0
        });
    }
}
