
import router from '@system.router';
// import app from '@system.app';

/* eslint-disable no-undef */
var TAGloble = global.__proto__ || global;
exports.TAGloble = TAGloble;

export class AutoTrackBridge {
    constructor(instance, config) {
        this.taInstance = instance;
        this.config = config || {};
        this.referrer = '直接打开';

        instance.Page = this._initPageExtension();
        TAGloble.TAPage = instance.Page;
        // this._setAutoTrackProperties();
    }

    _initPageExtension() {
        var _that = this;
        return (function (page) {
            const { onShow } = page;
            page.onShow = function (options) {
                _that.onPageShow();
                if (typeof onShow === 'function') {
                    onShow.call(this, options);
                }
            };

            return page;
        });
    }

    // _setAutoTrackProperties() {
    //     var appInfo = app.getInfo();
    //     var props = {
    //         '#scene': appInfo.source.extra.scene,
    //     };
    //
    //     this.taInstance._setAutoTrackProperties(props);
    // }

    onPageShow() {
        if (this.config.pageShow) {
            var path = router.getState().path;
            var prop = {
                '#url_path': path || '系统没有取到值',
                '#referrer': this.referrer,
            };
            this.referrer = path;
            this.taInstance._internalTrack('ta_mp_view', prop);
        }
    }
}
