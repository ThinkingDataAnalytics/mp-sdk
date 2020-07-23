import fetch from '@system.fetch';
import device from '@system.device';
import network from '@system.network';
import storage from '@system.storage';
import prompt from '@system.prompt';

import {
    _
} from '../utils';

class CurrentPlatform {
    /**
     * 获取本地缓存数据
     * @param {object} callback 异步获取时的回调函数，参数为对象
     * @return 包含本地存储值的对象类型
     */
    getStorage(options) {
        storage.get({
            key: options.key,
            success: function(ret) {
                var data = {};
                data.data = ret;
                options.success(data);
            },
            fail: function() {
                options.fail({});
            }
        });
    }

    /**
     * 设置本地缓存
     * @param {object} options 参数集合，包含：
     *   key       string         本地缓存的 key
     *   data      string         JSON 字符串
     */
    setStorage(options) {
        storage.set({
            key: options.key,
            value: options.data
        });
    }

    /**
     * 异步获取系统信息
     * @param {object} options 参数集合
     * @return 包含本系统信息的对象类型
     */
    getSystemInfo(options) {
        device.getInfo({
            success: function (ret) {
                var deviceInfo = ret;
                var systemArr = [ret['osType'], ret['osVersionName']];
                var system = systemArr.join(' ');
                deviceInfo['system'] = system;
                deviceInfo['screenWidth'] = ret['screenWidth'] / (ret['screenDensity']>0 ? ret['screenDensity'] : 1);
                deviceInfo['screenHeight'] = ret['screenHeight'] / (ret['screenDensity']>0 ? ret['screenDensity'] : 1);
                options.success(deviceInfo);
            },
            complete: function () {
                options.complete();
            }
        });
    }

    /**
     * 异步获取网络类型
     * @param {object} options 参数集合
     * @return {object}.networkType string 网络类型
     */
    getNetworkType(options) {
        network.getType({
            success: function (data) {
                var networkType = {};
                networkType.networkType = data.type;
                options.success(networkType);
            },
            complete: function () {
                options.complete();
            }
        });
    }

    /**
     * 监听网络状态变化事件
     * @param {function} options 参数集合，网络状态变化后的回调
     * @return {object}.networkType string 网络类型
     */
    onNetworkStatusChange(options) {
        network.subscribe({
            callback: function (data) {
                var networkType = {};
                networkType.networkType = data.type;
                options(networkType);
            }
        });
    }

    /**
     * 发起网络请求
     * @param {object} options 参数集合
     * @return 网络请求结果
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

    showDebugToast(text) {
        prompt.showToast({
            message: text.title,
            duration: 0
        });
    }
}

var currentPlatform = new CurrentPlatform();
export default currentPlatform;

