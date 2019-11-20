/* eslint-disable no-undef */

export class AutoTrackBridge {
    constructor(instance, config) {

        this.taInstance = instance;
        this.config = config || {};

        // OPPO 快游戏 的 onShow 定义为回到前台的事件， 所以此处添加启动时的onshow。
        if (this.config.appShow) {
            this.taInstance._internalTrack('ta_mg_show');
        }

        qg.onShow(() => {
            if (this.config.appHide) {
                this.taInstance.timeEvent('ta_mg_hide');
            }

            if (this.config.appShow) {
                this.taInstance._internalTrack('ta_mg_show');
            }
        });

        qg.onHide(() => {
            if (this.config.appHide) {
                this.taInstance._internalTrack('ta_mg_hide');
            }
        });
    }
}
