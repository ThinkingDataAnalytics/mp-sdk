/* eslint-disable no-undef */
import {
    _
} from '../utils';

class AutoTrackBridge {
    constructor(instance, config, api) {

        this.taInstance = instance;
        this.config = config || {};

        // 快游戏 的 onShow 定义为回到前台的事件， 所以此处添加启动时的onshow。
        if (this.config.appShow) {
            this.taInstance._internalTrack('ta_mg_show');
        }

        if (this.config.appHide) {
            this.taInstance.timeEvent('ta_mg_hide');
        }

        api.onShow(() => {
            if (this.config.appHide) {
                this.taInstance.timeEvent('ta_mg_hide');
            }

            if (this.config.appShow) {
                this.taInstance._internalTrack('ta_mg_show');
            }
        });

        api.onHide(() => {
            if (this.config.appHide) {
                this.taInstance._internalTrack('ta_mg_hide');
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
                return new PlatformProxy(qg, {persistenceName: 'thinkingdata_qg_oppo_game'}, {mpPlatform: 'oppo_qg'});
            case 'huawei':
                return new PlatformProxy(hbs, {persistenceName: 'thinkingdata_qg_huawei_game'}, {mpPlatform: 'huawei_qg'});
            case 'mz':
                return new PlatformProxy(qg, {persistenceName: 'thinkingdata_qg_mz_game'}, {mpPlatform: 'mz'});
            case 'xiaomi':
                return new PlatformProxy(qg, {persistenceName: 'thinkingdata_qg'}, {mpPlatform: 'xiaomi'});
        }
    }

    /**
     * 返回特定平台的特殊配置，如缓存名称，缓存配置等
     */
    getConfig() {
        return this.config || {};
    }

    /**
     * 获取本地缓存数据
     * @param {string} name 本地缓存中指定的 key
     * @param {boolean} async 是否异步获取
     * @return 包含本地存储值的对象类型
     */
    getStorage(name, async) {
        if (async) logger.warn('TA: invalid storage configuration');
        var data =  localStorage.getItem(name);
        if (_.isJSONString(data)) {
            return JSON.parse(data);
        } else {
            return {};
        }
    }

    /**
     * 设置本地缓存
     * @param {string} name 本地缓存的 key
     * @param {string} value JSON 字符串
     */
    setStorage(name, value) {
        localStorage.setItem(name, value);
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
     * 异步获取网络类型
     * @param {object} options 成功和结束后的回调函数
     * res.networkType string 网络类型
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
     * 监听网络状态变化事件
     * @param {function} callback 网络状态变化后的回调
     */
    onNetworkStatusChange(callback) {
        this.api.onNetworkStatusChange({
            callback: function (data) {
                callback(data);
            }
        });
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
        var xhr = new XMLHttpRequest();
        xhr.open(options.method, options.url);
        if (options.header) {
            for (var key in options.header) {
                xhr.setRequestHeader(key, options.header[key]);
            }
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var res = {};
                res['statusCode'] = 200;
                if (_.isJSONString(xhr.responseText)) {
                    res['data'] = JSON.parse(xhr.responseText);
                }
                options.success(res);
            }
        };
        xhr.ontimeout = function() {
            var res = {};
            res.errMsg = 'timeout';
            options.fail(res);
        };
        xhr.send(options.data);
        return xhr;
    }

    /**
     * 初始化生命周期相关实例
     * @param {ThinkingDataAPI} instance SDK 实例, 用于生命周期相关逻辑回调.
     * @param {object} config 自动采集相关配置.
     */
    initAutoTrackInstance(instance, config) {
        return new AutoTrackBridge(instance, config.autoTrack, this.api);
    }

    setGlobal(instance, name) {
        globalThis[name] = instance;
    }

    /**
     * 获取系统启动信息，并注册 APP 切前台的回调
     * @TODO
     */
    getAppOptions() {
        return this.api.getLaunchOptionsSync();
    }

    /**
     * 展示 toast. 在开启 Debug 模式的时候需要提示用户
     * @param {string} toast 内容
     */
    showToast(msg) {
        this.api.showToast({
            title: msg,
            icon: 'none',
            duration: 2000
        });
    }
}
