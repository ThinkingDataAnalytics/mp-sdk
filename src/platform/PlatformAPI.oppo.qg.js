class CurrentPlatform {
    /**
     * 获取本地缓存数据
     * @param {object} callback 异步获取时的回调函数，参数为对象
     * @return 包含本地存储值的对象类型
     */
    getStorageSync(options) {
        return localStorage.getItem(options);
    }

    /**
     * 设置本地缓存
     * @param {object} options 参数集合，包含：
     *   key       string         本地缓存的 key
     *   data      string         JSON 字符串
     */
    setStorage(options) {
        localStorage.setItem(options.key, options.data);
    }

    /**
     * 异步获取系统信息
     * @param {object} options 参数集合
     * @return 包含本系统信息的对象类型
     */
    getSystemInfo(options) {
        // eslint-disable-next-line no-undef
        qg.getSystemInfo({
            success: function (ret) {
                options.success(ret);
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
        // eslint-disable-next-line no-undef
        qg.getNetworkType({
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
     * @param {function} options 参数集合，网络状态变化后的回调
     * @return {object}.networkType string 网络类型
     */
    onNetworkStatusChange(options) {
        // eslint-disable-next-line no-undef
        qg.onNetworkStatusChange({
            callback: function (data) {
                options(data);
            }
        });
    }

    /**
     * 发起网络请求
     * @param {object} options 参数集合
     * @return 网络请求结果
     */
    request(options) {
        var xhr = new XMLHttpRequest();
        xhr.setRequestHeader('content-type', 'application/json');
        xhr.open(options.method, options.url);
        xhr.send(options.data);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                options.success(xhr.responseText);
            }
            else {
                options.fail(xhr.statusText);
            }
        };
        return xhr;
    }

    /**
     * 返回系统上下文信息.
     */
    getLaunchOptionsSync() {
        // eslint-disable-next-line no-undef
        return qg.getLaunchOptionsSync();
    }
}

var currentPlatform = new CurrentPlatform();
export default currentPlatform;

