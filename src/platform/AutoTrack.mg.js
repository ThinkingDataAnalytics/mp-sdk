/* eslint-disable no-undef */

export default class AutoTrackBridge {
    constructor(instance, config, currentPlatform) {

        this.taInstance = instance;
        this.config = config || {};

        var options = currentPlatform.getLaunchOptionsSync();
        this._onShow(options);

        this.startTracked = true;

        currentPlatform.onShow((options) => {
            this._onShow(options);
        });

        currentPlatform.onHide(() => {
            this.startTracked = false;
            if (this.config.appHide) {
                this.taInstance._internalTrack('ta_mg_hide');
            }
        });
    }

    _onShow(options) {
        if (this.startTracked) return;

        if (this.config.appHide) {
            this.taInstance.timeEvent('ta_mg_hide');
        }

        if (options && options.scene) {
            this.taInstance._setAutoTrackProperties({
                '#scene': options.scene,
            });
        }

        if (this.config.appShow) {
            this.taInstance._internalTrack('ta_mg_show');
        }
    }
}
