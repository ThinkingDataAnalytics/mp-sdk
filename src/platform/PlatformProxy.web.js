/* eslint-disable no-undef */
import {
    _
} from '../utils';

export default class PlatformProxy {

    constructor() {
        this.config = {persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_mg'};
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
        return this.config;
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

    _setSystemProxy(callback) {
        this._sysCallback = callback;
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
        let res = {
            // eslint-disable-next-line
            mp_platform: 'web',
            system: this._getOs(),
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            systemLanguage: navigator.language
        };

        if (this._sysCallback) {
            res = _.extend(res, this._sysCallback(options));
        }

        options.success(res);
        options.complete();
    }

    _getOs() {
        let a = navigator.userAgent;
        if (/Windows/i.test(a)) {
            if (/Phone/.test(a) || /WPDesktop/.test(a)) {
                return 'Windows Phone';
            }
            return 'Windows';
        } else if (/(iPhone|iPad|iPod)/.test(a)) {
            return 'iOS';
        } else if (/Android/.test(a)) {
            return 'Android';
        } else if (/(BlackBerry|PlayBook|BB10)/i.test(a)) {
            return 'BlackBerry';
        } else if (/Mac/i.test(a)) {
            return 'MacOS';
        } else if (/Linux/.test(a)) {
            return 'Linux';
        } else if (/CrOS/.test(a)) {
            return 'ChromeOS';
        } else {
            return '';
        }
    }

    /**
     * Get network type asynchronously
     * @param {object} options: callback when getting completion
     * res.networkType string: network type
     */
    getNetworkType(options) {
        options.complete();
    }

    /**
     * Listen for network state change
     * @param {function} callback: callback when network state changing
     */
    onNetworkStatusChange() {
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

    initAutoTrackInstance(instance, config) {
        this.instance = instance;
        this.autoTrack = config.autoTrack;

        var _that = this;
        _that.onPageShow();
        if (_that.autoTrack.appHide) {
            _that.instance.timeEvent('ta_page_hide');
        }

        if ('onvisibilitychange' in document) {
            document.onvisibilitychange = function () {
                if (document.hidden) {
                    _that.onPageHide(true);
                } else {
                    _that.onPageShow();
                    if (_that.autoTrack.appHide) {
                        _that.instance.timeEvent('ta_page_hide');
                    }
                }
            };
        }
    }

    setGlobal(instance, name) {
        window[name] = instance;
    }

    /**
     * Get system startup information, and register APP cut-off foreground callback
     * @TODO
     */
    getAppOptions() {
    }

    /**
     * Toast Debug information
     * @param {string} msg: information to display
     */
    showToast() {
    }

    onPageShow() {
        if (this.autoTrack.appShow) {
            var properties = {};
            _.extend(properties, this.autoTrack.properties);
            if (_.isFunction(this.autoTrack.callback)) {
                _.extend(properties, this.autoTrack.callback('appShow'));
            }
            this.instance._internalTrack('ta_page_show', properties);
        }
    }

    onPageHide(tryBeacon) {
        if (this.autoTrack.appHide) {
            var properties = {};
            _.extend(properties, this.autoTrack.properties);
            if (_.isFunction(this.autoTrack.callback)) {
                _.extend(properties, this.autoTrack.callback('appHide'));
            }
            this.instance._internalTrack('ta_page_hide', properties, new Date(), null, tryBeacon);
        }
    }
}
