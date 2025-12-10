/* global uni */
import {_,logger} from '../utils';
export default class PlatformProxyUniapp {

    constructor(api, platformConfig, internalConfig) {
        this.api = api;
        this.config = platformConfig;
        this._config = internalConfig;
    }

    static createInstance() {
        return new PlatformProxyUniapp(uni, { persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_uniapp' }, { mpPlatform: 'uniapp', mp: true, platform: 'uniapp' });
    }

    getConfig() {
        return this.config;
    }

    initSdkConfig(_config) {

    }

    getStorage(name, async, callback) {
        if (async) {
            this.api.getStorage({
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
            try {
                let data = this.api.getStorageSync(name);
                if (_.isJSONString(data)) {
                    return JSON.parse(data);
                } else {
                    return {};
                }
            } catch (e) {
                return {};
            }
        }

    }

    setStorage(name, value) {
        try {
            this.api.setStorageSync(name, value);
        } catch (e) {
            // eslint-disable-next-line no-empty
        }
    }

    removeStorage(name) {
        try {
            this.api.removeStorage({
                key: name
            });
        } catch (e) {
            // eslint-disable-next-line no-empty
        }
    }

    getSystemInfo(options) {
        this.api.getSystemInfo({
            success(res) {
                res['mp_platform'] = res['uniPlatform'];
                options.success(res);
            },
            complete() {
                options.complete();
            }
        });
    }

    getNetworkType(options) {
        this.api.getNetworkType({
            success(res) {
                options.success(res);
            },
            complete() {
                options.complete();
            }
        });
    }

    onNetworkStatusChange(callback) {
        this.api.onNetworkStatusChange(callback);
    }

    request(options) {
        return this.api.request(options);
    }

    initAutoTrackInstance(instance, _config) {
        this.isFistLaunch = true;
        this.autoConfig = _config.autoTrack || {};
        this.disablePresetList = _config.disablePresetProperties || [];
        let launchOptions = this.api.getLaunchOptionsSync();
        this._onLaunch(launchOptions,instance);
        this._onShow(launchOptions,instance,true);
        this.api.onAppShow((options) => {
            this._onShow(options,instance);
        });
        this.api.onAppHide(() => {
            this._onHide(instance);
        });
    }

    _onLaunch(options,taInstance){
        if (this.autoConfig.appLaunch) {
            var properties = {};
            _.extend(properties, this.autoConfig.properties);
            if (_.isFunction(this.autoConfig.callback)) {
                _.extend(properties, this.autoConfig.callback('appLaunch'));
            }
            if (!this.disablePresetList.includes('#start_reason')) {
                if (options) {
                    properties['#start_reason'] = JSON.stringify(options);
                }
            }
            taInstance._internalTrack('ta_mp_launch', properties);
        }
    }

    _onShow(options,taInstance,isAutoShow){
        if (!isAutoShow && this.isFistLaunch) return;
        if (this.autoConfig.appHide) {
            taInstance.timeEvent('ta_mp_hide');
        }
        if (this.autoConfig.appShow) {
            var properties = {};
            _.extend(properties, this.autoConfig.properties);
            if (_.isFunction(this.autoConfig.callback)) {
                _.extend(properties, this.autoConfig.callback('appShow'));
            }
            if (!this.disablePresetList.includes('#start_reason')) {
                if (options) {
                    properties['#start_reason'] = JSON.stringify(options);
                }
            }
            taInstance._internalTrack('ta_mp_show', properties);
        }
    }

    _onHide(taInstance){
        this.isFistLaunch = false;
        if (this.autoConfig.appHide) {
            var properties = {};
            _.extend(properties, this.autoConfig.properties);
            if (_.isFunction(this.autoConfig.callback)) {
                _.extend(properties, this.autoConfig.callback('appHide'));
            }
            taInstance._internalTrack('ta_mp_hide', properties);
            taInstance.flush();
        }
    }

    getAppOptions(callback) {
        var options = {};
        try {
            options = this.api.getLaunchOptionsSync();
        } catch (e) {
            logger.warn('Cannot get launch options.');
        }
        return options;
    }

    showToast(_msg) {
    }

    setGlobal(_instance, _name) {

    }

    setGlobalData(_data) {
        
    }

}
