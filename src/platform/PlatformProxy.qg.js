/* eslint-disable no-undef */
import {
    _
} from '../utils';

class AutoTrackBridge {
    constructor(instance, config, api) {

        this.taInstance = instance;
        this.config = config || {};

        // The onShow of the quick game is defined as the event of returning to the foreground, so the onshow at startup is added here.
        if (this.config.appShow) {
            var properties = {};
            _.extend(properties, this.config.properties);
            if (_.isFunction(this.config.callback)) {
                _.extend(properties, this.config.callback('appShow'));
            }
            this.taInstance._internalTrack('ta_mg_show', properties);
        }

        if (this.config.appHide) {
            this.taInstance.timeEvent('ta_mg_hide');
        }

        api.onShow(() => {
            if (this.config.appHide) {
                this.taInstance.timeEvent('ta_mg_hide');
            }

            if (this.config.appShow) {
                var properties = {};
                _.extend(properties, this.config.properties);
                if (_.isFunction(this.config.callback)) {
                    _.extend(properties, this.config.callback('appShow'));
                }
                this.taInstance._internalTrack('ta_mg_show', properties);
            }
        });

        api.onHide(() => {
            if (this.config.appHide) {
                var properties = {};
                _.extend(properties, this.config.properties);
                if (_.isFunction(this.config.callback)) {
                    _.extend(properties, this.config.callback('appHide'));
                }
                this.taInstance._internalTrack('ta_mg_hide', properties);
            }
        });
    }
}

export default class PlatformProxy {

    constructor(api, platformConfig, internalConfig) {
        this.api = api;
        this.config = platformConfig;
        this._config = internalConfig;
    }

    static createInstance() {
        return this._createInstance('R_CURRENT_PLATFORM');
    }

    static _createInstance(option) {
        switch(option) {
            case 'oppo':
                return new PlatformProxy(qg, {persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_qg_oppo_game'}, {mpPlatform: 'oppo_qg'});
            case 'huawei':
                return new PlatformProxy(hbs, {persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_qg_huawei_game'}, {mpPlatform: 'huawei_qg'});
            case 'mz':
                return new PlatformProxy(qg, {persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_qg_mz_game'}, {mpPlatform: 'mz'});
            case 'xiaomi':
                return new PlatformProxy(qg, {persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_qg'}, {mpPlatform: 'xiaomi'});
        }
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
        // if (async) logger.warn('TA: invalid storage configuration');
        var data =  localStorage.getItem(name);
        if (async) {
            if (_.isJSONString(data)) {
                callback(JSON.parse(data));
            } else {
                callback({});
            }
        } else {
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
        localStorage.setItem(name, value);
    }

    /**
     * Delete data in local cache with key
     * @param {*} name: cache key
     */
    removeStorage(name) {
        localStorage.removeItem(name);
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
        var platform = this._config.mpPlatform;
        this.api.getSystemInfo({
            success: function (res) {
                res['mp_platform'] = platform;
                options.success(res);
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
        this.api.getNetworkType({
            success: function (data) {
                options.success(data);
            },
            complete: function () {
                options.complete();
            }
        });
    }

    /**
     * Listen for network state change
     * @param {function} callback: callback when network state changing
     */
    onNetworkStatusChange(callback) {
        this.api.onNetworkStatusChange({
            callback: function (data) {
                callback(data);
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
        var res = {};
        var xhr = new XMLHttpRequest();
        xhr.open(options.method, options.url);
        if (options.header) {
            for (var key in options.header) {
                xhr.setRequestHeader(key, options.header[key]);
            }
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                res['statusCode'] = 200;
                if (_.isJSONString(xhr.responseText)) {
                    res['data'] = JSON.parse(xhr.responseText);
                }
                options.success(res);
            }else if(xhr.status !== 200){
                res.errMsg = 'network error';
                options.fail(res);
            }
        };
        xhr.ontimeout = function() {
            res.errMsg = 'timeout';
            options.fail(res);
        };
        xhr.send(options.data);
        return xhr;
    }

    /**
     * Initialize the lifecycle monitoring instance
     * @param {ThinkingDataAPI} instance: SDK instance, listen lifecycle of application
     * @param {object} config: auto-tracking events config
     */
    initAutoTrackInstance(instance, config) {
        return new AutoTrackBridge(instance, config.autoTrack, this.api);
    }

    setGlobal(instance, name) {
        globalThis[name] = instance;
    }

    /**
     * Get system startup information, and register APP cut-off foreground callback
     * @TODO
     */
    getAppOptions() {
        return this.api.getLaunchOptionsSync();
    }

    /**
     * Toast Debug information
     * @param {string} msg: information to display
     */
    showToast(msg) {
        this.api.showToast({
            title: msg,
            icon: 'none',
            duration: 2000
        });
    }
}
