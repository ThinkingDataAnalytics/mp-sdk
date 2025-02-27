/* eslint-disable no-undef */
import {
    _,
    logger,
} from '../utils';

// const DEFAULT_SHARE_DEPTH = 1;

const mpHooks = {
    data: 1,
    onLoad: 1,
    onShow: 1,
    onReady: 1,
    onPullDownRefresh: 1,
    onShareAppMessage: 1,
    onShareTimeline: 1,
    onReachBottom: 1,
    onPageScroll: 1,
    onResize: 1,
    onTabItemTap: 1,
    onHide: 1,
    onUnload: 1,
    onAddToFavorites: 1
};

export default class AutoTrackBridge {
    constructor(instance, config) {
        this.taInstance = instance;
        this.config = config.autoTrack || {};
        this.disablePresetList = config.disablePresetProperties || [];
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
                onUnload,
                onAddToFavorites
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
            page.onUnload= function() {
                _that.onPageUnload();
                if (typeof onUnload === 'function') {
                    onUnload.call(this);
                }
            };
            page.onAddToFavorites = function(){
                _that.onPageAddToFavorites();
                if (typeof onAddToFavorites === 'function') {
                    onAddToFavorites.call(this);
                }
            };
            _that._handleClickProxy(page);
            return Page(page);
        });
    }

    _handleClickProxy(option){
        if (this.config.mpClick) {
            var methods = [];
            for (var m in option) {
                if (typeof option[m] === 'function' && !mpHooks[m]) {
                    methods.push(m);
                }
            }
            for (var i = 0; i < methods.length; i++) {
                this.clickMethodProxy(option, methods[i]);
            }
        }
    }

    clickMethodProxy(option, method){
        var _that = this;
        var oldFunc = option[method];
        option[method] = function() {
            var res = oldFunc.call(this, arguments);
            var args = arguments[0];
            if(_.isObject(args)){
                _that._trackClickEvent(args);
            }
            return res;
        };
    }

    _trackClickEvent(events){
        var currentTarget = events.currentTarget || {};
        var target = events.target || {};
        if (target.id && currentTarget.id && target.id !== currentTarget.id) {
            return;
        }
        var prop = {};
        var type = events['type'];
        if (type && _.isClickType(type)) {
            var dataset = currentTarget.dataset || {};
            if(!this.disablePresetList.includes('#element_id')){
                prop['#element_id'] = currentTarget.id;
            }
            if(!this.disablePresetList.includes('#element_type')){
                prop['#element_type'] = dataset['type'];
            }
            if(!this.disablePresetList.includes('#element_content')){
                prop['#element_content'] = dataset['content'];
            }
            if(!this.disablePresetList.includes('#element_name')){
                prop['#element_name'] = dataset['name'];
            }
            if(!this.disablePresetList.includes('#url_path')){
                prop['$url_path'] = this._getCurrentPath();
            }
            _.extend(prop, this.config.properties);
            if (_.isFunction(this.config.callback)) {
                _.extend(prop, this.config.callback('mpClick'));
            }
            this.taInstance._internalTrack('ta_mp_click', prop);
        }
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
            if (!this.disablePresetList.includes('#url_path')) {
                if (options && options.path) {
                    prop['#url_path'] = this._getPath(options.path);
                }
            }
            if (options) {
                if (!this.disablePresetList.includes('#utm')) {
                    if (options.query) {
                        prop['#utm'] = _.getUtmFromQuery(options.query);
                    }
                }
                if (!this.disablePresetList.includes('#start_reason')) {
                    prop['#start_reason'] =JSON.stringify(options);
                }
            }
            _.extend(prop, this.config.properties);
            if (_.isFunction(this.config.callback)) {
                _.extend(prop, this.config.callback('appLaunch'));
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
            if (!this.disablePresetList.includes('#url_path')) {
                if (options && options.path) {
                    prop['#url_path'] = this._getPath(options.path);
                }
            }
            if (options) {
                if (!this.disablePresetList.includes('#utm')) {
                    if (options.query) {
                        prop['#utm'] = _.getUtmFromQuery(options.query);
                    }
                }
                if (!this.disablePresetList.includes('#start_reason')) {
                    prop['#start_reason'] = JSON.stringify(options);
                }
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
            var prop = {};
            if (!this.disablePresetList.includes('#url_path')) {
                prop['#url_path'] = this._getCurrentPath();
            }
            _.extend(prop, this.config.properties);
            if (_.isFunction(this.config.callback)) {
                _.extend(prop, this.config.callback('appHide'));
            }
            this.taInstance._internalTrack('ta_mp_hide', prop);
            this.taInstance.flush();
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
        var props = {};
        if (!this.disablePresetList.includes('#scene')) {
            props['#scene'] = options.scene;
        }
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

    // _getShareDepth() {
    //     var shareInfo = this.shareInfo || {};
    //     if ((shareInfo.a && shareInfo.a === this.taInstance.getAccountId()) || (shareInfo.i && shareInfo.i === this.taInstance.getDistinctId())) {
    //         return shareInfo.d;
    //     } else if (shareInfo.d) {
    //         return shareInfo.d + 1;
    //     } else {
    //         return DEFAULT_SHARE_DEPTH;
    //     }
    // }

    _getPath(path) {
        return path = 'string' === typeof path ? path.replace(/^\//, '') : 'Abnormal values';
    }

    _generateShareInfo() {
        return JSON.stringify({
            distinctId: this.taInstance.getDistinctId(),
        });
    }

    onPageShare(result) {
        var ret = _.isObject(result) ? result : {};
        if (this.config.pageShare) {
            var prop = {};
            if (!this.disablePresetList.includes('#url_path')) {
                prop['#url_path'] = this._getCurrentPath();
            }
            _.extend(prop, this.config.properties);
            if (_.isFunction(this.config.callback)) {
                _.extend(prop, this.config.callback('pageShare'));
            }
            this.taInstance._internalTrack('ta_mp_share', prop);
            if (_.isUndefined(ret.path) || ret.path === '') {
                ret.path = this._getCurrentPath();
            }
            if (_.isString(ret.path)) {
                if (-1 === ret.path.indexOf('?')) {
                    ret.path = ret.path + '?';
                } else if ('&' !== ret.path.slice(-1)) {
                    ret.path = ret.path + '&';
                }
                ret.path = ret.path + 'tdshare=' + encodeURIComponent(this._generateShareInfo());
            }
        }
        return ret;
    }

    onPageShow() {
        if (this.config.pageLeave) {
            this.taInstance.timeEvent('ta_page_leave');
        }
        if (this.config.pageShow) {
            var path = this._getCurrentPath();
            var prop = {};
            if (!this.disablePresetList.includes('#url_path')) {
                prop['#url_path'] = path || 'The system did not get a value';
            }
            if (!this.disablePresetList.includes('#referrer')) {
                prop['#referrer'] = this.referrer;
            }
            _.extend(prop, this.config.properties);
            if (_.isFunction(this.config.callback)) {
                _.extend(prop, this.config.callback('pageShow'));
            }
            this.referrer = path;
            this.taInstance._internalTrack('ta_mp_view', prop);
        }
    }

    onPageUnload(){
        if (this.config.pageLeave) {
            var path = this._getCurrentPath();
            var prop = {};
            if (!this.disablePresetList.includes('#url_path')) {
                prop['#url_path'] = path || 'The system did not get a value';
            }
            _.extend(prop, this.config.properties);
            if (_.isFunction(this.config.callback)) {
                _.extend(prop, this.config.callback('pageLeave'));
            }
            this.taInstance._internalTrack('ta_page_leave', prop);
        }
    }

    onPageAddToFavorites(){
        if(this.config.mpFavorite){
            var path = this._getCurrentPath();
            var prop = {};
            if (!this.disablePresetList.includes('#url_path')) {
                prop['#url_path'] = path || 'The system did not get a value';
            }
            _.extend(prop, this.config.properties);
            if (_.isFunction(this.config.callback)) {
                _.extend(prop, this.config.callback('mpFavorite'));
            }
            this.taInstance._internalTrack('ta_add_favorite', prop);
        }
    }
}
