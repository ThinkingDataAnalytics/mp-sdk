/* eslint-disable no-undef */
// import cloud from '@tbmp/mp-cloud-sdk';
const Cloud = require('@tbmp/mp-cloud-sdk');
var cloud = new Cloud.Cloud();
import '../regenerator-runtime/runtime';
import {
    _
} from '../utils';
export default class PlatformProxy {

    constructor() {
        this.config = { persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_tt_game' };
    }

    static createInstance() {
        return new PlatformProxy();
    }

    initSdkConfig(config) {
        this.initConfig = config;
        cloud.init({
            env: this.initConfig.cloudEnv
        });
    }

    getConfig() {
        return this.config || {};
    }

    /**
     * Get local cache data
     * @param {string} name: cache key
     * @param {boolean} async: enable asynchronous getting cached
     * @param {function} callback: callback when getting data asynchronously, the parameter is an object
     * @return return cached data, it is an object
     */
    getStorage(name, async, callback) {
        // if (!async) logger.warn('TA: invalid storage configuration');
        if (async) {
            my.getStorage({
                key: name,
                success(res) {
                    var data = _.isJSONString(res) ? JSON.parse(res) : {};
                    callback(data);
                },
                fail() {
                    callback({});
                }
            });
        } else {
            var data = my.getStorageSync({ key: name });
            if (_.isObject(data)) {
                return data.data ? JSON.parse(data.data) : {};
            } else {
                return {};
            }
        }
    }

    /**
     * Set local cache data
     * @param {string} name: cache key
     * @param {string} value: JSON string value
     */
    setStorage(name, value) {
        try {
            my.setStorageSync({
                key: name,
                data: value,
            });
        } catch (e) { }
    }

    /**
     * Delete data in local cache with key
     * @param {*} name: cache key
     */
    removeStorage(name) {
        try {
            my.removeStorage({
                key: name
            });
        } catch (e) { }
    }

    getSystemInfo(options) {
        my.getSystemInfo({
            success(res) {
                res.system = res.system + ' ' + res.version;
                res.systemLanguage = res.language;
                res.mp_platform = 'tb';
                options.success(res);
            },
            complete() {
                options.complete();
            }
        });
    }

    getNetworkType(options) {
        my.getNetworkType({
            success(res) {
                options.success(res);
            },
            complete() {
                options.complete();
            }
        });
    }

    onNetworkStatusChange(callback) {
        my.onNetworkStatusChange(callback);
    }

    async request(options) {
        try {
            var postConfig = {};
            postConfig.path = this.getUrlPath(options.url);
            postConfig.method = options.method;
            postConfig.headers = options.header;
            postConfig.exts = {
                cloudAppId: this.initConfig.cloudAppId,
                // timeout: 3000,
                domain: this.initConfig.serverUrl
            }
            if (options.method === 'GET') {
                postConfig.params = {
                    appid: this.initConfig.appId
                };
            } else if (options.method === 'POST') {
                postConfig.body = options.data;
            }
            let result = await cloud.application.httpRequest(postConfig);
            if (result) {
                options.success(JSON.parse(result));
            } else {
                options.fail({
                    errMsg: 'error'
                })
            }
        } catch (error) {
            options.fail({
                errMsg: error
            })
        }
    }

    getUrlPath(url) {
        if (url.includes('sync_xcx')) {
            return '/sync_xcx';
        } else if (url.includes('data_debug')) {
            return '/data_debug';
        } else if (url.includes('config')) {
            return '/config'
        }
    }

    initAutoTrackInstance(instance, config) {

    }

    setGlobal(instance, name) {

    }

    getAppOptions() {
        return {};
    }

    showToast(msg) {
        my.showToast({
            content: msg,
            duration: 3000
        });
    }

    setGlobalData(_data) {
    }

}