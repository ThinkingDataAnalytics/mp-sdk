class CurrentPlatform {

    getStorage(options) {
        // eslint-disable-next-line no-undef
        qg.getStorage({
            key: options.key,
            success: function (ret) {
                var data = {};
                data.data = ret;
                options.success(data);
            },
            fail: function () {
                options.fail({});
            }
        });
    }

    setStorage(options) {
        // eslint-disable-next-line no-undef
        qg.setStorage({
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
        // eslint-disable-next-line no-undef
        qg.getSystemInfo({
            success: function (ret) {
                var deviceInfo = ret;
                var systemArr = [ret['osType'], ret['osVersionName']];
                var system = systemArr.join(' ');
                deviceInfo['brand'] = ret['manufacturer'];
                deviceInfo['system'] = system;
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
        // eslint-disable-next-line no-undef
        qg.getNetworkType({
            success: function (data) {
                var networkInfo = data;
                networkInfo['networkType'] = data.type;
                options.success(networkInfo);
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
        qg.subscribeNetworkStatus({
            callback: function (data) {
                var networkInfo = data;
                networkInfo['networkType'] = data.type;
                options(networkInfo);
            }
        });
    }

    /**
     * 发起网络请求
     * @param {object} options 参数集合
     * @return 网络请求结果
     */
    request(options) {
        // eslint-disable-next-line no-undef
        return qg.request({
            url: options.url,
            data: options.data,
            method: options.method,
            header: options.header,
            success: function (response) {
                options.success(response);
            },
            fail: function fail(data) {
                options.fail(data);
            }
        });
    }

    showDebugToast(text) {
        // eslint-disable-next-line no-undef
        qg.showToast({
            message: text,
            duration: 0
        });
    }
}

var currentPlatform = new CurrentPlatform();
export default currentPlatform;

