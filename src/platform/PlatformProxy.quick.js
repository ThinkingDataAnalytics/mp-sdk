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
 * 快应用系统接口
 */
export default class PlatformProxy {

    constructor() {
        this.config = {persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_quick_mp', asyncPersistence: true};
    }

    static createInstance() {
        return new PlatformProxy();
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
     * @param {function} callback 异步获取时的回调函数，参数为对象
     * @return 包含本地存储值的对象类型
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
     * 设置本地缓存
     * @param {string} name 本地缓存的 key
     * @param {string} value JSON 字符串
     */
    setStorage(name, value) {
        storage.set({
            key: name,
            value: value
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
     * 异步获取网络类型
     * @param {object} options 成功和结束后的回调函数
     * res.networkType string 网络类型
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
     * 监听网络状态变化事件
     * @param {function} callback 网络状态变化后的回调
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
     * 初始化生命周期相关实例
     * @param {ThinkingDataAPI} instance SDK 实例, 用于生命周期相关逻辑回调.
     * @param {object} config 自动采集相关配置.
     */
    initAutoTrackInstance() {
        logger.warn('ThinkingAnalytics: Quick App does not support automatic collection. You can contact TA support personnel to collect related events');
    }

    setGlobal(instance, name) {
        globalThis[name] = instance;
    }

    /**
     * 获取系统启动信息，并注册 APP 切前台的回调
     */
    getAppOptions() {
        return {};
    }

    /**
     * 展示 toast. 在开启 Debug 模式的时候需要提示用户
     * @param {string} msg toast 内容
     */
    showToast(msg) {
        prompt.showToast({
            message: msg,
            duration: 2000
        });
    }
}
