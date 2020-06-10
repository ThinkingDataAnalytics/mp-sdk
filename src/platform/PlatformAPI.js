/* eslint-disable no-undef */
import {
    _,
    logger
} from '../utils';

import {
    Config
} from '../Config';

R_IMPORT_CURRENT_PLATFORM;
R_IMPORT_AUTO_TRACK_BRIDGE;

class PlatformAPI {
    static init(config) {
        config.persistenceName = Config.PERSISTENCE_NAME;
    }

    /**
     * 获取本地缓存数据
     * @param {string} name 本地缓存中指定的 key
     * @param {boolean} async 是否异步获取
     * @param {function} callback 异步获取时的回调函数，参数为对象
     * @return 包含本地存储值的对象类型
     */
    static getStorage(name, async, callback) {
        if (async) {
            currentPlatform.getStorage({
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
            var data = currentPlatform.getStorageSync(name);
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
    static setStorage(name, value) {
        currentPlatform.setStorage({
            key: name,
            data: value,
        });
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
    static getSystemInfo(options) {
        currentPlatform.getSystemInfo({
            success(res) {
                res['mp_platform'] = R_MP_PLATFORM;
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
    static getNetworkType(options) {
        currentPlatform.getNetworkType({
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
    static onNetworkStatusChange(callback) {
        currentPlatform.onNetworkStatusChange(callback);
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
    static request(options) {
        return currentPlatform.request(options);
    }

    /**
     * 初始化生命周期相关实例
     * @param {ThinkingDataAPI} instance SDK 实例, 用于生命周期相关逻辑回调.
     * @param {object} config 自动采集相关配置.
     */
    static initAutoTrackInstance(instance, config) {
        if (_.isObject(config.autoTrack)) {
            config.autoTrack['isPlugin'] = config.is_plugin;
        }
        return new AutoTrackBridge(instance, config.autoTrack, currentPlatform);
    }

    /**
     * 获取系统启动信息，并注册 APP 切前台的回调
     * @param {function} callback APP 切前台的回调函数.
     */
    static getAppOptions(callback) {
        var options = {};
        try {
            options = currentPlatform.getLaunchOptionsSync();
        } catch (e) {
            logger.warn('Cannot get launch options.');
        }
        if (_.isFunction(callback) && _.isFunction(currentPlatform.R_ON_SHOW)) {
            try {
                currentPlatform.R_ON_SHOW(callback);
            } catch (e) {
                logger.warn('Cannot register onAppShow callback.');
            }
        }
        return options;
    }

    static showDebugToast(text) {
        if (_.isFunction(currentPlatform.showToast)) {
            currentPlatform.showToast({
                title: text,
                icon: 'none',
                duration: 2000
            });
        }
    }
}

export {
    PlatformAPI
};
