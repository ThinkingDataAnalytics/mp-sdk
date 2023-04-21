/* eslint-disable no-undef */
import {
    _,
    logger,
} from '../utils';

//const DEFAULT_SHARE_DEPTH = 1;

export default class AutoTrackBridge {
    constructor(instance, config) {
        this.taInstance = instance;
        this.config = config || {};
        this.referrer = 'Directly open';
        if (this.config.isPlugin) {
            instance.App = function () {
                App.apply(this, arguments);
            };
            inension(instance.Page);
        } else {
            const originalApp = App;
            App = this._initAppExtention(originalApp);

            const originalPage = Page;
            Page = this._initPageExtension(originalPage);

        }
    }

    _initPageExtension(Page) {
        var _that = this;
        return (function (page) {
            const {
                onShow,
                onShareAppMessage,
            } = page;

            page.onShow = function (options) {
                _that.onPageShow();
                if (typeof onShow === 'function') {
                    onShow.call(this, options);
                }
            };

            if (typeof onShareAppMessage === 'function') {
                page.onShareAppMessage = function (object) {
                    var ret = onShareAppMessage.call(this, object);

                    return _that.onPageShare(ret);
                };
            }
            return Page(page);
        });
    }

    _initAppExtention(App) {
        var _that = this;
        return (function (app) {
            const {
                onLaunch,
                onShow,
                onHide,
            } = app;
            app.onLaunch = function (options) {
                _that.onAppLaunch(options, this);
                if (typeof onLaunch === 'function') {
                    onLaunch.call(this, options);
                }
            };

            app.onShow = function (options) {
                _that.onAppShow(options);
                if (typeof onShow === 'function') {
                    onShow.call(this, options);
                }
            };

            app.onHide = function () {
                _that.onAppHide();
                if (typeof onHide === 'function') {
                    onHide.call(this);
                }
            };

            return App(app);
        });
    }

    onAppLaunch(options, app) {
        this._setAutoTrackProperties(options);
        if (!_.isUndefined(app)) {
            app[this.taInstance.name] = this.taInstance;
        }

        if (this.config.appLaunch) {
            var prop = {};
            if (options && options.path) {
                prop['#url_path'] = this._getPath(options.path);
            }
            if (options && options.query) {
                prop['#utm'] = _.getUtmFromQuery(options.query);
            }
            this.taInstance._internalTrack('ta_mp_launch', prop);
        }
    }

    onAppShow(options) {
        if (this.config.appHide) {
            this.taInstance.timeEvent('ta_mp_hide');
        }

        this._setAutoTrackProperties(options);

        if (this.config.appShow) {
            var prop = {};
            if (options && options.path) {
                prop['#url_path'] = this._getPath(options.path);
            }
            if (options && options.query) {
                prop['#utm'] = _.getUtmFromQuery(options.query);
            }
            _.extend(prop, this.config.properties);
            if (_.isFunction(this.config.callback)) {
                _.extend(prop, this.config.callback('appShow'));
            }
            this.taInstance._internalTrack('ta_mp_show', prop);
        }
    }

    onAppHide() {
        if (this.config.appHide) {
            var prop = {
                '#url_path': this._getCurrentPath(),
            };
            _.extend(prop, this.config.properties);
            if (_.isFunction(this.config.callback)) {
                _.extend(prop, this.config.callback('appHide'));
            }
            this.taInstance._internalTrack('ta_mp_hide', prop);
        }
    }

    _getCurrentPath() {
        var url = 'Not to get';
        try {
            // eslint-disable-next-line no-undef
            var pages = getCurrentPages();
            var currentPage = pages[pages.length - 1];
            url = currentPage.route; // Modify carefully, the ByteDance applet needs to replace this line of code. If you need to modify, please modify rollup.config.js synchronously
        } catch (e) {
            logger.info(e);
        }
        return url;
    }

    _setAutoTrackProperties(options) {
        var props = {
            '#scene': options.scene,
        };

        /*
        if (options && _.isObject(options.query) && options.query.tashare) {
            var shareInfo = _.decodeURIComponent(options.query.tashare);
            if (_.isJSONString(shareInfo)) {
                this.shareInfo = JSON.parse(shareInfo);
                props['#share_depth'] = _.isNumber(this.shareInfo.d) ? this.shareInfo.d : DEFAULT_SHARE_DEPTH;
            }
        }
        */

        this.taInstance._setAutoTrackProperties(props);
    }

    /*
    _getShareDepth() {
        var shareInfo = this.shareInfo || {};
        if ((shareInfo.a && shareInfo.a === this.taInstance.getAccountId()) || (shareInfo.i && shareInfo.i === this.taInstance.getDistinctId())) {
            return shareInfo.d;
        } else if (shareInfo.d) {
            return shareInfo.d + 1;
        } else {
            return DEFAULT_SHARE_DEPTH;
        }
    }
    */
    _getPath(path) {
        return path = 'string' === typeof path ? path.replace(/^\//, '') : 'Abnormal values';
    }

    /*
    _generateShareInfo() {

        return JSON.stringify({
            i: this.taInstance.getDistinctId(),
            a: this.taInstance.getAccountId(),
            p: this._getCurrentPath(),
            d: this._getShareDepth(),
        });
    }*/

    onPageShare(result) {

        if (this.config.pageShare) {
            this.taInstance._internalTrack('ta_mp_share', {
                '#url_path': this._getCurrentPath(),
            });
        }

        var ret = _.isObject(result) ? result : {};
        /*
        if (this.config.allow_share_info) {
            if (_.isUndefined(ret.path) || ret.path === '') {
                ret.path = this._getCurrentPath();
            }

            if (_.isString(ret.path)) {
                if (-1 === ret.path.indexOf('?')) {
                    ret.path = ret.path + '?';
                } else if ('&' !== ret.path.slice(-1)) {
                    ret.path = ret.path + '&';
                }
                ret.path = ret.path + 'tashare=' + encodeURIComponent(this._generateShareInfo());
            }
        }*/
        return ret;
    }

    onPageShow() {
        if (this.config.pageShow) {
            var path = this._getCurrentPath();
            var prop = {
                '#url_path': path || 'The system did not get a value',
                '#referrer': this.referrer,
            };
            this.referrer = path;
            this.taInstance._internalTrack('ta_mp_view', prop);
        }
    }
}
