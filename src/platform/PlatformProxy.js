/* eslint-disable no-undef */
import {
    _,
    logger
} from '../utils';
import PlatformProxyWeb from './PlatformProxy.web';

// 当前平台选项，打包时替换
import AutoTrackBridgeMP from './AutoTrack.mp';
import AutoTrackBridgeMG from './AutoTrack.mg';

export default class PlatformProxy {
    constructor(api, platformConfig, internalConfig) {
        this.api = api;
        this.config = platformConfig;
        this._config = internalConfig;
    }

    static createInstance() {
        // rollup 会在打包时替换下面的字符串到对应的平台
        return this._createInstance('R_CURRENT_PLATFORM');
    }

    static _createInstance(option) {
        switch(option) {
            // for historical reason, we use different persistence names for different platforms.
            case 'wechat_mp':
                return new PlatformProxy(wx, {persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_wechat'}, {mpPlatform: 'wechat', mp: true, platform: option });
            case 'wechat_mg':
                return new PlatformProxy(wx, {persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_wechat_game'}, {mpPlatform: 'wechat', platform: option});
            case 'qq_mg':
                return new PlatformProxy(qq, {persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_qq_game'}, {mpPlatform: 'qq', platform: option});
            case 'baidu_mp':
                return new PlatformProxy(swan, {persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_swan'}, {mpPlatform: (res) => {return res['host'];}, mp: true, platform: option});
            case 'baidu_mg':
                return new PlatformProxy(swan, {persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_swan_game'}, {mpPlatform: (res) => {return res['host'];}, platform: option});
            case 'tt_mg':
                return new PlatformProxy(tt, {persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_tt_game'}, {mpPlatform: (res) => {return res['appName'];}, platform: option});
            case 'tt_mp':
                return new PlatformProxy(tt, {persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_tt'}, {mpPlatform: (res) => {return res['appName'];}, mp: true, platform: option});
            case 'ali_mp':
                return new PlatformProxy(my, {persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_ali'}, {mpPlatform: (res) => {return res['app'];}, mp: true, platform: option});
            case 'dd_mp':
                return new PlatformProxy(dd, {persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_dd'}, {mpPlatform: 'dingding', mp: true, platform: option});
            case 'bl_mg':
                return new PlatformProxy(bl, {persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_mg'}, {mpPlatform: 'bilibili', platform: option});
            case 'kuaishou_mp':
                return new PlatformProxy(ks, {persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_kuaishou'}, {mpPlatform: 'kuaishou', mp: true, platform: option });
            case 'WEB':
                return new PlatformProxyWeb.createInstance();
    
        }
    }

    /**
     * 返回特定平台的特殊配置，如缓存名称，缓存配置等
     */
    getConfig() {
        return this.config;
    }

    /**
     * 获取本地缓存数据
     * @param {string} name 本地缓存中指定的 key
     * @param {boolean} async 是否异步获取
     * @param {function} callback 异步获取时的回调函数，参数为对象
     * @return 包含本地存储值的对象类型
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
     * 设置本地缓存
     * @param {string} name 本地缓存的 key
     * @param {string} value JSON 字符串
     */
    setStorage(name, value) {
        this.api.setStorage({
            key: name,
            data: value,
        });
    }

    _getPlatform() {
        return '';
    }

    /**
     * 异步获取系统信息
     * @param {object} options 成功和结束后的回调函数
     * 当成功获取系统信息后，res 参数包含：
     *   brand         string  设备品牌
     *   model         string  设备型号
     *   screenWidth   number  屏幕宽度，单位px
     *   screenHeight  number  屏幕高度，单位px
     *   system        string  操作系统及版本
     *   platform      string  客户端平台
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
            },
            complete() {
                options.complete();
            }
        });
    }

    /**
     * 异步获取网络类型
     * @param {object} options 成功和结束后的回调函数
     * res.networkType string 网络类型
     */
    getNetworkType(options) {
        this.api.getNetworkType({
            success(res) {
                options.success(res);
            },
            complete() {
                options.complete();
            }
        });
    }

    /**
     * 监听网络状态变化事件
     * @param {function} callback 网络状态变化后的回调
     */
    onNetworkStatusChange(callback) {
        this.api.onNetworkStatusChange(callback);
    }

    /**
     * 发起网络请求
     * @param {object} options 参数集合，包含：
     *   url       string         服务器接口地址
     *   data      string/object  请求的参数
     *   method    string         HTTP 请求方法
     *   success   function       请求成功的回调函数
     *   fail      function       请求失败的回调函数
     *   complete  function       请求结束的回调函数
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
     * 初始化生命周期相关实例
     * @param {ThinkingDataAPI} instance SDK 实例, 用于生命周期相关逻辑回调.
     * @param {object} config 自动采集相关配置.
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
            GameGlobal[name] = instance;
        }
    }

    /**
     * 获取系统启动信息，并注册 APP 切前台的回调
     * @param {function} callback APP 切前台的回调函数.
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
     * 展示 toast. 在开启 Debug 模式的时候需要提示用户
     * @param {string} toast 内容
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
