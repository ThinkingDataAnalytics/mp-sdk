/* eslint-disable no-undef */
import {
    _
} from '../utils';

export default class AutoTrackBridge {
    constructor(instance, config, currentPlatform) {

        this.taInstance = instance;
        this.config = config.autoTrack || {};
        this.disablePresetList = config.disablePresetProperties || [];

        var options = currentPlatform.getLaunchOptionsSync();
        this._onLaunch(options);
        this._onShow(options);

        this.startTracked = true;

        currentPlatform.onShow((options) => {
            this._onShow(options);
        });

        currentPlatform.onHide(() => {
            this.startTracked = false;
            if (this.config.appHide) {
                var properties = {};
                _.extend(properties, this.config.properties);
                if (_.isFunction(this.config.callback)) {
                    _.extend(properties, this.config.callback('appHide'));
                }
                this.taInstance._internalTrack('ta_mg_hide', properties);
                this.taInstance.flush();
            }
        });
    }

    _onLaunch(options){
        if (!this.disablePresetList.includes('#scene')) {
            if (options && options.scene) {
                this.taInstance._setAutoTrackProperties({
                    '#scene': options.scene,
                });
            }
        }
        if (this.config.appLaunch) {
            var properties = {};
            _.extend(properties, this.config.properties);
            if (_.isFunction(this.config.callback)) {
                _.extend(properties, this.config.callback('appLaunch'));
            }
            if (!this.disablePresetList.includes('#start_reason')) {
                if (options) {
                    properties['#start_reason'] = JSON.stringify(options);
                }
            }
            this.taInstance._internalTrack('ta_mg_launch', properties);
        }
    }

    _onShow(options) {
        if (this.startTracked) return;

        if (this.config.appHide) {
            this.taInstance.timeEvent('ta_mg_hide');
        }

        if (this.config.appShow) {
            var properties = {};
            _.extend(properties, this.config.properties);
            if (_.isFunction(this.config.callback)) {
                _.extend(properties, this.config.callback('appShow'));
            }
            if (!this.disablePresetList.includes('#start_reason')) {
                if (options) {
                    properties['#start_reason'] = JSON.stringify(options);
                }
            }
            this.taInstance._internalTrack('ta_mg_show', properties);
        }
    }
}
