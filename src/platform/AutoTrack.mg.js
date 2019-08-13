/* eslint-disable no-undef */

export class AutoTrackBridge {
    constructor(instance, config, currentPlatform) {

        this.taInstance = instance;
        GameGlobal[this.taInstance.name] = instance;
        this.config = config || {};

        var options = currentPlatform.getLaunchOptionsSync();
        if (options && options.scene) {
            this.taInstance._setAutoTrackProperties({
                '#scene': options.scene,
            });
        }

        currentPlatform.onShow((options) => {
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
        });

        currentPlatform.onHide(() => {
            if (this.config.appHide) {
                this.taInstance._internalTrack('ta_mg_hide');
            }
        });
    }
}
