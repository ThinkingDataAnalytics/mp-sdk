import PlatformProxy from 'R_PLATFORM_PROXY';

export default class PlatformAPI {
    static _getCurrentPlatform() {
        return this.currentPlatform || (this.currentPlatform = PlatformProxy.createInstance());
    }

    /**
     * 获取平台特定的配置: persistenceName 必须
     */
    static getConfig() {
        return this._getCurrentPlatform().getConfig();
    }

    /**
     * 获取本地缓存数据
     * @param {string} name 本地缓存中指定的 key
     * @param {boolean} async 是否异步获取
     * @param {function} callback 异步获取时的回调函数，参数为对象
     * @return 包含本地存储值的对象类型
     */
    static getStorage(name, async, callback) {
        return this._getCurrentPlatform().getStorage(name, async, callback);
    }

    /**
     * 设置本地缓存
     * @param {string} name 本地缓存的 key
     * @param {string} value JSON 字符串
     */
    static setStorage(name, value) {
        return this._getCurrentPlatform().setStorage(name, value);
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
        return this._getCurrentPlatform().getSystemInfo(options);
    }

    /**
     * 异步获取网络类型
     * @param {object} options 成功和结束后的回调函数
     * res.networkType string 网络类型
     */
    static getNetworkType(options) {
        return this._getCurrentPlatform().getNetworkType(options);
    }

    /**
     * 监听网络状态变化事件
     * @param {function} callback 网络状态变化后的回调
     */
    static onNetworkStatusChange(callback) {
        this._getCurrentPlatform().onNetworkStatusChange(callback);
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
        return this._getCurrentPlatform().request(options);
    }

    /**
     * 初始化生命周期相关实例
     * @param {ThinkingDataAPI} instance SDK 实例, 用于生命周期相关逻辑回调.
     * @param {object} config 自动采集相关配置.
     */
    static initAutoTrackInstance(instance, config) {
        return this._getCurrentPlatform().initAutoTrackInstance(instance, config);
    }

    /**
     * 将 instance 设置为全局变量
     * @param {object} instance
     * @param {string} name
     */
    static setGlobal(instance, name) {
        if (instance && name) {
            this._getCurrentPlatform().setGlobal(instance, name);
        }
    }

    /**
     * 获取系统启动信息，并注册 APP 切前台的回调
     * @param {function} callback APP 切前台的回调函数.
     */
    static getAppOptions(callback) {
        return this._getCurrentPlatform().getAppOptions(callback);
    }

    /**
     * 提示用户 Debug 模式信息
     * @param {string} msg 提示信息
     */
    static showDebugToast(msg) {
        this._getCurrentPlatform().showToast(msg);
    }
}
