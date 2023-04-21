import PlatformProxy from 'R_PLATFORM_PROXY';

export default class PlatformAPI {
    static _getCurrentPlatform() {
        return this.currentPlatform || (this.currentPlatform = PlatformProxy.createInstance());
    }

    /**
     * Get platform specific configuration: persistenceName required
     */
    static getConfig() {
        return this._getCurrentPlatform().getConfig();
    }

    /**
     * Get local cache data
     * @param {string} name: cache key
     * @param {boolean} async: enable asynchronous getting cached
     * @param {function} callback: callback when getting data asynchronously, the parameter is an object
     * @return return cached data, it is an object
     */
    static getStorage(name, async, callback) {
        return this._getCurrentPlatform().getStorage(name, async, callback);
    }

    /**
     * Set local cache data
     * @param {string} name: cache key
     * @param {string} value: JSON string value
     */
    static setStorage(name, value) {
        return this._getCurrentPlatform().setStorage(name, value);
    }

    /**
     * Delete data in local cache with key
     * @param {*} name: cache key
     */
    static removeStorage(name) {
        return this._getCurrentPlatform().removeStorage(name);
    }

    /**
     * Get system information asynchronously
     * @param {object} options: callback when getting completion
     * callback parameter：
        * brand: string, device brand
        * model: string, device model
        * screenWidth: number, screen width, unit px
        * screenHeight: number, screen height, unit px
        * system: string, operating system and version
        * platform: string, client platform
     */
    static getSystemInfo(options) {
        return this._getCurrentPlatform().getSystemInfo(options);
    }

    /**
     * Get network type asynchronously
     * @param {object} options: callback when getting completion
     * res.networkType string: network type
     */
    static getNetworkType(options) {
        return this._getCurrentPlatform().getNetworkType(options);
    }

    /**
     * Listen for network state change
     * @param {function} callback: callback when network state changing
     */
    static onNetworkStatusChange(callback) {
        this._getCurrentPlatform().onNetworkStatusChange(callback);
    }

    /**
     * Make a network request
     * @param {object} options: parameters, including:
     *   url       string         server url
     *   data      string/object  request parameters
     *   method    string         HTTP method
     *   success   function       success callback
     *   fail      function       fail callback
     *   complete  function       complete callback
     */
    static request(options) {
        return this._getCurrentPlatform().request(options);
    }

    /**
     * Initialize the lifecycle monitoring instance
     * @param {ThinkingDataAPI} instance: SDK instance, listen lifecycle of application
     * @param {object} config: auto-tracking events config
     */
    static initAutoTrackInstance(instance, config) {
        return this._getCurrentPlatform().initAutoTrackInstance(instance, config);
    }

    /**
     * Set instance to global
     * @param {object} instance
     * @param {string} name
     */
    static setGlobal(instance, name) {
        if (instance && name) {
            this._getCurrentPlatform().setGlobal(instance, name);
        }
    }

    /**
     * Get system startup information, and register APP cut-off foreground callback
     * @param {function} callback
     */
    static getAppOptions(callback) {
        return this._getCurrentPlatform().getAppOptions(callback);
    }

    /**
     * Toast Debug information
     * @param {string} msg: information to display
     */
    static showDebugToast(msg) {
        this._getCurrentPlatform().showToast(msg);
    }
}
