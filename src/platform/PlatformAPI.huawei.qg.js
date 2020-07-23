import {
    _
} from '../utils';

class CurrentPlatform {
    /**
     * 获取本地缓存数据
     * @param {object} callback 异步获取时的回调函数，参数为对象
     * @return 包含本地存储值的对象类型
     */
    getStorageSync(options) {
        var item = window.localStorage.getItem(options);
        return item;
    }

    /**
     * 设置本地缓存
     * @param {object} options 参数集合，包含：
     *   key       string         本地缓存的 key
     *   data      string         JSON 字符串
     */
    setStorage(options) {
        window.localStorage.setItem(options.key, options.data);
    }

    /**
     * 异步获取系统信息
     * @param {object} options 参数集合
     * @return 包含本系统信息的对象类型
     */
    getSystemInfo(options) {
        // eslint-disable-next-line no-undef
        hbs.getSystemInfo({
            success : function (res) {
                options.success(res);
            },
            fail:function(){
            },
            complete:function() {
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
        // eslint-disable-next-line no-undef
        hbs.getNetworkType({
            success : function (res) {
                options.success(res);
            },
            fail:function(){
            },
            complete:function() {
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
        // eslint-disable-next-line no-undef
        hbs.onNetworkStatusChange((res) => {
            options(res);
        });
    }

    /**
     * 发起网络请求
     * @param {object} options 参数集合
     * @return 网络请求结果
     */
    request(options) {
        var xhr = new XMLHttpRequest();
        if (options.header) {
            for (var key in options.header) {
                xhr.setRequestHeader(key, options.header[key]);
            }
        }
        xhr.open(options.method, options.url);
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
     * 返回系统上下文信息.
     */
    getLaunchOptionsSync() {
        // eslint-disable-next-line no-undef
        return hbs.getLaunchOptionsSync();
    }

    showDebugToast(text) {
        // eslint-disable-next-line no-undef
        hbs.showToast({
            title: text,
            duration: 2000
        });
    }
}

var currentPlatform = new CurrentPlatform();
export default currentPlatform;


