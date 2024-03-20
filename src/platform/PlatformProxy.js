/* eslint-disable no-undef */
import {
    _,
    logger
} from '../utils';
import PlatformProxyWeb from './PlatformProxy.web';

// Current platform option, replaced when rollup
import AutoTrackBridgeMP from './AutoTrack.mp';
import AutoTrackBridgeMG from './AutoTrack.mg';

export default class PlatformProxy {
    constructor(api, platformConfig, internalConfig) {
        this.api = api;
        this.config = platformConfig;
        this._config = internalConfig;
    }

    static createInstance() {
        // rollup will replace the following strings with the corresponding platforms when packaging
        return this._createInstance('R_CURRENT_PLATFORM');
    }

    static _createInstance(option) {
        switch (option) {
            // for historical reason, we use different persistence names for different platforms.
            case 'wechat_mp':
                return new PlatformProxy(wx, { persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_wechat' }, { mpPlatform: 'wechat', mp: true, platform: option });
            case 'wechat_mg':
                return new PlatformProxy(wx, { persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_wechat_game' }, { mpPlatform: 'wechat', platform: option });
            case 'qq_mp':
                return new PlatformProxy(qq, { persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_qq' }, { mpPlatform: 'qq', mp: true, platform: option });
            case 'qq_mg':
                return new PlatformProxy(qq, { persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_qq_game' }, { mpPlatform: 'qq', platform: option });
            case 'baidu_mp':
                return new PlatformProxy(swan, { persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_swan' }, { mpPlatform: (res) => { return res['host']; }, mp: true, platform: option });
            case 'baidu_mg':
                return new PlatformProxy(swan, { persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_swan_game' }, { mpPlatform: (res) => { return res['host']; }, platform: option });
            case 'tt_mg':
                return new PlatformProxy(tt, { persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_tt_game' }, { mpPlatform: (res) => { return res['appName']; }, platform: option });
            case 'tt_mp':
                return new PlatformProxy(tt, { persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_tt' }, { mpPlatform: (res) => { return res['appName']; }, mp: true, platform: option });
            case 'ali_mp':
                return new PlatformProxy(my, { persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_ali' }, { mpPlatform: (res) => { return res['app']; }, mp: true, platform: option });
            case 'ali_mg':
                return new PlatformProxy(my, { persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_ali_game' }, { mpPlatform: (res) => { return res['app']; }, platform: option });
            case 'dd_mp':
                return new PlatformProxy(dd, { persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_dd' }, { mpPlatform: 'dingding', mp: true, platform: option });
            case 'bl_mg':
                return new PlatformProxy(bl, { persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_mg' }, { mpPlatform: 'bilibili', platform: option });
            case 'kuaishou_mp':
                return new PlatformProxy(ks, { persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_kuaishou' }, { mpPlatform: 'kuaishou', mp: true, platform: option });
            // case 'qtt_mg':
            //     return new PlatformProxy(qttGame.systemInfo, {persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_qtt'}, {mpPlatform: 'qutoutiao', platform: option });
            // case 'linksure_mg':
            //     return new PlatformProxy(wuji, {persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_linksure'}, {mpPlatform: 'linksure', platform: option });
            case 'qh360_mg':
                return new PlatformProxy(qh, { persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_qh360' }, { mpPlatform: 'qh360', platform: option });
            case 'tb_mp':
                return new PlatformProxy(my, { persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_tb' }, { mpPlatform: 'tb', mp: true, platform: option });
            case 'jd_mp':
                return new PlatformProxy(jd, { persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_jd' }, { mpPlatform: 'jd', mp: true, platform: option });
            case 'qh360_mp':
                return new PlatformProxy(qh, { persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_qh360' }, { mpPlatform: 'qh360', mp: true, platform: option });
            case 'WEB':
                return new PlatformProxyWeb.createInstance();
        }
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
        if (async) {
            this.api.getStorage({
                key: name,
                success(res) {
                    var data = _.isJSONString(res.data) ? JSON.parse(res.data) : {};
                    callback(data);
                },
                fail() {
                    logger.warn('getStorage faild');
                    callback({});
                },
            });
        } else {
            if (this._config.platform === 'dd_mp') {
                let res = this.api.getStorageSync({ key: name });
                if (_.isJSONString(res.data)) {
                    return JSON.parse(res.data);
                } else {
                    return {};
                }
            }
            var data = this.api.getStorageSync(name);
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
        if (this._config.platform === 'ali_mp' || this._config.platform === 'tb_mp' || this._config.platform === 'dd_mp') {
            this.api.setStorageSync({
                key: name,
                data: value,
            });
        } else {
            this.api.setStorageSync(name, value);
        }
    }

    /**
     * Delete data in local cache with key
     * @param {*} name: cache key
     */
    removeStorage(name) {
        if (_.isFunction(this.api.removeStorage)) {
            this.api.removeStorage({
                key: name
            });
        } else if (_.isFunction(this.api.deleteStorage)) {
            this.api.deleteStorage({
                key: name
            });
        }
    }

    _getPlatform() {
        return '';
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
            success(res) {
                if (_.isFunction(platform)) {
                    res['mp_platform'] = platform(res);
                } else {
                    res['mp_platform'] = platform;
                }
                options.success(res);
                if (platform === 'wechat') {
                    //Sometimes the WeChat platform complete will not call back,
                    //you need to call options.complete in the success callback to complete the acquisition of system information
                    options.complete();
                }
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
        if (!_.isFunction(this.api.getNetworkType)) {
            options.success({});
            options.complete();
        } else {
            this.api.getNetworkType({
                success(res) {
                    options.success(res);
                },
                complete() {
                    options.complete();
                }
            });
        }
    }

    /**
     * Listen for network state change
     * @param {function} callback: callback when network state changing
     */
    onNetworkStatusChange(callback) {
        if (!_.isFunction(this.api.onNetworkStatusChange)) {
            callback({});
        } else {
            this.api.onNetworkStatusChange(callback);
        }
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
        if (this._config.platform === 'ali_mp' || this._config.platform === 'dd_mp') {
            let config = _.extend({}, options);
            config.headers = options.header;
            config.success = (res) => {
                res.statusCode = res.status;
                options.success(res);
            };
            config.fail = (res) => {
                res.errMsg = res.errorMessage;
                options.fail(res);
            };
            if (this._config.platform === 'dd_mp') {
                return this.api.httpRequest(config);
            } else {
                return this.api.request(config);
            }
        } else {
            return this.api.request(options);
        }
    }

    /**
     * Initialize the lifecycle monitoring instance
     * @param {ThinkingDataAPI} instance: SDK instance, listen lifecycle of application
     * @param {object} config: auto-tracking events config
     */
    initAutoTrackInstance(instance, config) {
        if (_.isObject(config.autoTrack)) {
            config.autoTrack['isPlugin'] = config.is_plugin;
        }
        if (this._config.mp) {
            return new AutoTrackBridgeMP(instance, config.autoTrack, this.api);
        } else {
            return new AutoTrackBridgeMG(instance, config.autoTrack, this.api);
        }
    }

    setGlobal(instance, name) {
        if (this._config.mp) {
            logger.warn('ThinkingAnalytics: we do not set global name for TA instance when you do not enable auto track.');
        } else {
            if (this._config.platform !== 'ali_mg') {
                GameGlobal[name] = instance;
            }
        }
    }

    /**
     * Get system startup information, and register APP cut-off foreground callback
     * @param {function} callback
     */
    getAppOptions(callback) {
        var options = {};
        try {
            options = this.api.getLaunchOptionsSync();
        } catch (e) {
            logger.warn('Cannot get launch options.');
        }
        if (_.isFunction(callback)) {
            try {
                if (this._config.mp) {
                    this.api.onAppShow(callback);
                } else {
                    this.api.onShow(callback);
                }
            } catch (e) {
                logger.warn('Cannot register onShow callback.');
            }
        }
        return options;
    }

    /**
     * Toast Debug information
     * @param {string} msg: information to display
     */
    showToast(msg) {
        if (_.isFunction(this.api.showToast)) {
            let content = {
                title: msg,
            };
            if (this._config.platform === 'dd_mp' || this._config.platform === 'ali_mp') {
                content.content = msg;
            }
            this.api.showToast(content);
        }
    }
}
