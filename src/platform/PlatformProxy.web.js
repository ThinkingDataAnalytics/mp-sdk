/* eslint-disable no-undef */
import {
    _,
    logger
} from '../utils';

export default class PlatformProxy {

    constructor() {
        this.config = {persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_mg'};
    }

    static createInstance() {
        return new PlatformProxy();
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
     * @return 包含本地存储值的对象类型
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
     * 设置本地缓存
     * @param {string} name 本地缓存的 key
     * @param {string} value JSON 字符串
     */
    setStorage(name, value) {
        localStorage.setItem(name, value);
    }

    _setSystemProxy(callback) {
        this._sysCallback = callback;
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
     * 异步获取网络类型
     * @param {object} options 成功和结束后的回调函数
     * res.networkType string 网络类型
     */
    getNetworkType(options) {
        options.complete();
    }

    /**
     * 监听网络状态变化事件
     * @param {function} callback 网络状态变化后的回调
     */
    onNetworkStatusChange() {
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

    initAutoTrackInstance() {
    }

    setGlobal(instance, name) {
        window[name] = instance;
    }

    /**
     * 获取系统启动信息，并注册 APP 切前台的回调
     * @TODO
     */
    getAppOptions() {
    }

    /**
     * 展示 toast. 在开启 Debug 模式的时候需要提示用户
     * @param {string} toast 内容
     */
    showToast() {
    }
}
