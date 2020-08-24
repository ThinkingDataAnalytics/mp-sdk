'use strict';
function _typeof(obj) {
    "@babel/helpers - typeof";
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function (obj) {
            return typeof obj;
        };
    }
    else {
        _typeof = function (obj) {
            return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        };
    }
    return _typeof(obj);
}
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor)
            descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps)
        _defineProperties(Constructor.prototype, protoProps);
    if (staticProps)
        _defineProperties(Constructor, staticProps);
    return Constructor;
}
/* eslint-disable no-undef */
var Config = {
    LIB_VERSION: '1.7.0',
    LIB_NAME: 'MG',
    PERSISTENCE_NAME: 'R_PERSISTENCE_NAME',
    PERSISTENCE_ASYNC: false
};
var _ = {};
var ArrayProto = Array.prototype, ObjProto = Object.prototype, slice = ArrayProto.slice, nativeToString = ObjProto.toString, nativeHasOwnProperty = Object.prototype.hasOwnProperty, nativeForEach = ArrayProto.forEach, nativeIsArray = Array.isArray, breaker = {};
_.each = function (obj, iterator, context) {
    // eslint-disable-next-line
    if (obj == null) {
        return false;
    }
    if (nativeForEach && obj.forEach === nativeForEach) {
        obj.forEach(iterator, context);
    }
    else if (obj.length === +obj.length) {
        for (var i = 0, l = obj.length; i < l; i++) {
            if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) {
                return false;
            }
        }
    }
    else {
        for (var key in obj) {
            if (nativeHasOwnProperty.call(obj, key)) {
                if (iterator.call(context, obj[key], key, obj) === breaker) {
                    return false;
                }
            }
        }
    }
};
_.extend = function (obj) {
    _.each(slice.call(arguments, 1), function (source) {
        for (var prop in source) {
            if (source[prop] !== void 0) {
                obj[prop] = source[prop];
            }
        }
    });
    return obj;
};
_.extend2Layers = function (obj) {
    _.each(slice.call(arguments, 1), function (source) {
        for (var prop in source) {
            if (source[prop] !== void 0) {
                if (_.isObject(source[prop]) && _.isObject(obj[prop])) {
                    _.extend(obj[prop], source[prop]);
                }
                else {
                    obj[prop] = source[prop];
                }
            }
        }
    });
    return obj;
};
_.isArray = nativeIsArray || function (obj) {
    return nativeToString.call(obj) === '[object Array]';
};
_.isFunction = function (f) {
    try {
        return typeof f === 'function';
    }
    catch (x) {
        return false;
    }
}; //alipay request 类型
_.isPromise = function (obj) {
    return nativeToString.call(obj) === '[object Promise]' && obj !== null;
};
_.isObject = function (obj) {
    return nativeToString.call(obj) === '[object Object]' && obj !== null;
};
_.isEmptyObject = function (obj) {
    if (_.isObject(obj)) {
        for (var key in obj) {
            if (nativeHasOwnProperty.call(obj, key)) {
                return false;
            }
        }
        return true;
    }
    return false;
};
_.isUndefined = function (obj) {
    return obj === void 0;
};
_.isString = function (obj) {
    return nativeToString.call(obj) === '[object String]';
};
_.isDate = function (obj) {
    return nativeToString.call(obj) === '[object Date]';
};
_.isBoolean = function (obj) {
    return nativeToString.call(obj) === '[object Boolean]';
};
_.isNumber = function (obj) {
    // eslint-disable-next-line no-useless-escape
    return nativeToString.call(obj) === '[object Number]' && /[\d\.]+/.test(String(obj));
};
_.isJSONString = function (str) {
    try {
        JSON.parse(str);
    }
    catch (e) {
        return false;
    }
    return true;
};
_.decodeURIComponent = function (val) {
    var result = '';
    try {
        result = decodeURIComponent(val);
    }
    catch (e) {
        result = val;
    }
    return result;
};
_.encodeDates = function (obj) {
    _.each(obj, function (v, k) {
        if (_.isDate(v)) {
            obj[k] = _.formatDate(v);
        }
        else if (_.isObject(v)) {
            obj[k] = _.encodeDates(v);
        }
    });
    return obj;
};
_.formatDate = function (d) {
    function pad(n) {
        return n < 10 ? '0' + n : n;
    }
    function secondPad(n) {
        if (n < 100 && n > 9)
            return '0' + n;
        else if (n < 10)
            return '00' + n;
        else
            return n;
    }
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()) + '.' + secondPad(d.getMilliseconds());
};
_.searchObjDate = function (o) {
    try {
        if (_.isObject(o) || _.isArray(o)) {
            _.each(o, function (a, b) {
                if (_.isObject(a) || _.isArray(a)) {
                    _.searchObjDate(o[b]);
                }
                else {
                    if (_.isDate(a)) {
                        o[b] = _.formatDate(a);
                    }
                }
            });
        }
    }
    catch (err) {
        logger.warn(err);
    }
};
_.UUID = function () {
    var visitTime = new Date().getTime();
    var uuid = '' + String(Math.random()).replace('.', '').slice(1, 11) + '-' + visitTime;
    return uuid;
};
_.UUIDv4 = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, 
        // eslint-disable-next-line eqeqeq
        v = c == 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16);
    });
};
_.setMpPlatform = function (mpPlatform) {
    _.mpPlatform = mpPlatform;
};
_.getMpPlatform = function () {
    return _.mpPlatform;
};
_.createExtraHeaders = function () {
    return {
        'TA-Integration-Type': Config.LIB_NAME,
        'TA-Integration-Version': Config.LIB_VERSION,
        'TA-Integration-Count': 1,
        'TA-Integration-Extra': _.getMpPlatform()
    };
};
var logger = _typeof(logger) === 'object' ? logger : {};
logger.info = function () {
    if ((typeof console === "undefined" ? "undefined" : _typeof(console)) === 'object' && console.log && logger.enabled) {
        try {
            return console.log.apply(console, arguments);
        }
        catch (e) {
            console.log(arguments[0]);
        }
    }
};
logger.warn = function () {
    if ((typeof console === "undefined" ? "undefined" : _typeof(console)) === 'object' && console.log && logger.enabled) {
        try {
            return console.warn.apply(console, arguments);
        }
        catch (e) {
            console.warn(arguments[0]);
        }
    }
};
/** @const */
var KEY_NAME_MATCH_REGEX = /^[a-zA-Z][a-zA-Z0-9_]{0,49}$/;
var PropertyChecker = function () {
    function PropertyChecker() {
        _classCallCheck(this, PropertyChecker);
    }
    _createClass(PropertyChecker, null, [{
            key: "stripProperties",
            value: function stripProperties(prop) {
                if (!_.isObject(prop)) {
                    return prop;
                }
                _.each(prop, function (v, k) {
                    if (!(_.isString(v) || _.isNumber(v) || _.isDate(v) || _.isBoolean(v) || _.isArray(v))) {
                        logger.warn('您的数据-', k, v, '-格式不满足要求，可能无法正确入库');
                    }
                });
                return prop;
            }
        }, {
            key: "_checkPropertiesKey",
            value: function _checkPropertiesKey(obj) {
                var flag = true;
                _.each(obj, function (content, key) {
                    if (!KEY_NAME_MATCH_REGEX.test(key)) {
                        logger.warn('不合法的 KEY 值: ' + key);
                        flag = false;
                    }
                });
                return flag;
            }
        }, {
            key: "event",
            value: function event(s) {
                if (!_.isString(s) || !KEY_NAME_MATCH_REGEX.test(s)) {
                    logger.warn('请检查参数格式, eventName 必须是英文字母开头, 包含字母和数字和下划线的不超过50个字符的字符串: ' + s);
                    return false;
                }
                else {
                    return true;
                }
            }
        }, {
            key: "propertyName",
            value: function propertyName(s) {
                if (!_.isString(s) || !KEY_NAME_MATCH_REGEX.test(s)) {
                    logger.warn('请检查参数格式, propertyName 必须是英文字母开头, 包含字母和数字和下划线的不超过50个字符的字符串: ' + s);
                    return false;
                }
                else {
                    return true;
                }
            }
        }, {
            key: "properties",
            value: function properties(p) {
                this.stripProperties(p);
                if (p) {
                    if (_.isObject(p)) {
                        if (this._checkPropertiesKey(p)) {
                            return true;
                        }
                        else {
                            logger.warn('请检查参数格式, properties 的 key 只能以字母开头，包含数字、字母和下划线 _，长度最大为50个字符');
                            return false;
                        }
                    }
                    else {
                        logger.warn('properties 可以没有，但有的话必须是对象');
                        return false;
                    }
                }
                else {
                    return true;
                }
            }
        }, {
            key: "propertiesMust",
            value: function propertiesMust(p) {
                this.stripProperties(p);
                if (p === undefined || !_.isObject(p) || _.isEmptyObject(p)) {
                    logger.warn('properties必须是对象且有值');
                    return false;
                }
                else {
                    if (this._checkPropertiesKey(p)) {
                        return true;
                    }
                    else {
                        logger.warn('请检查参数格式, properties 的 key 只能以字母开头，包含数字、字母和下划线 _，长度最大为50个字符');
                        return false;
                    }
                }
            }
        }, {
            key: "userId",
            value: function userId(id) {
                if (_.isString(id) && /^.{1,64}$/.test(id)) {
                    return true;
                }
                else {
                    logger.warn('用户 id 必须是不能为空，且小于 64 位的字符串');
                    return false;
                }
            }
        }, {
            key: "userAddProperties",
            value: function userAddProperties(p) {
                if (!this.propertiesMust(p))
                    return false;
                for (var i in p) {
                    if (!_.isNumber(p[i])) {
                        logger.warn('userAdd 的属性需要为数值类型');
                        return false;
                    }
                }
                return true;
            }
        }, {
            key: "userAppendProperties",
            value: function userAppendProperties(p) {
                if (!this.propertiesMust(p))
                    return false;
                for (var i in p) {
                    if (!_.isArray(p[i])) {
                        logger.warn('userAppend 的属性需要为 Array 类型');
                        return false;
                    }
                }
                return true;
            }
        }]);
    return PropertyChecker;
}();
/* eslint-disable no-undef */
var AutoTrackBridge = function AutoTrackBridge(instance, config, currentPlatform) {
    var _this = this;
    _classCallCheck(this, AutoTrackBridge);
    this.taInstance = instance;
    GameGlobal[this.taInstance.name] = instance;
    this.config = config || {};
    var options = currentPlatform.getLaunchOptionsSync();
    if (options && options.scene) {
        this.taInstance._setAutoTrackProperties({
            '#scene': options.scene
        });
    }
    currentPlatform.onShow(function (options) {
        if (_this.config.appHide) {
            _this.taInstance.timeEvent('ta_mg_hide');
        }
        if (options && options.scene) {
            _this.taInstance._setAutoTrackProperties({
                '#scene': options.scene
            });
        }
        if (_this.config.appShow) {
            _this.taInstance._internalTrack('ta_mg_show');
        }
    });
    currentPlatform.onHide(function () {
        if (_this.config.appHide) {
            _this.taInstance._internalTrack('ta_mg_hide');
        }
    });
};
/* eslint-disable no-undef */
var AutoTrackBridgeVivo = function AutoTrackBridgeVivo(instance, config) {
    var _this = this;
    _classCallCheck(this, AutoTrackBridgeVivo);
    this.taInstance = instance;
    this.config = config || {}; // VIVO 快游戏 的 onShow 定义为回到前台的事件， 所以此处添加启动时的onshow。
    if (this.config.appShow) {
        this.taInstance._internalTrack('ta_mg_show');
    }
    if (this.config.appHide) {
        this.taInstance.timeEvent('ta_mg_hide');
    }
    qg.onShow(function () {
        if (_this.config.appHide) {
            _this.taInstance.timeEvent('ta_mg_hide');
        }
        if (_this.config.appShow) {
            _this.taInstance._internalTrack('ta_mg_show');
        }
    });
    qg.onHide(function () {
        if (_this.config.appHide) {
            _this.taInstance._internalTrack('ta_mg_hide');
        }
    });
};
/* eslint-disable no-undef */
var AutoTrackBridgeOppo = function AutoTrackBridgeOppo(instance, config) {
    var _this = this;
    _classCallCheck(this, AutoTrackBridgeOppo);
    this.taInstance = instance;
    this.config = config || {}; // OPPO 快游戏 的 onShow 定义为回到前台的事件， 所以此处添加启动时的onshow。
    if (this.config.appShow) {
        this.taInstance._internalTrack('ta_mg_show');
    }
    if (this.config.appHide) {
        this.taInstance.timeEvent('ta_mg_hide');
    }
    qg.onShow(function () {
        if (_this.config.appHide) {
            _this.taInstance.timeEvent('ta_mg_hide');
        }
        if (_this.config.appShow) {
            _this.taInstance._internalTrack('ta_mg_show');
        }
    });
    qg.onHide(function () {
        if (_this.config.appHide) {
            _this.taInstance._internalTrack('ta_mg_hide');
        }
    });
};
var CurrentPlatformVivo = function () {
    function CurrentPlatformVivo() {
        _classCallCheck(this, CurrentPlatformVivo);
    }
    _createClass(CurrentPlatformVivo, [{
            key: "getStorage",
            value: function getStorage(options) {
                // eslint-disable-next-line no-undef
                qg.getStorage({
                    key: options.key,
                    success: function success(ret) {
                        var data = {};
                        data.data = ret;
                        options.success(data);
                    },
                    fail: function fail() {
                        options.fail({});
                    }
                });
            }
        }, {
            key: "setStorage",
            value: function setStorage(options) {
                // eslint-disable-next-line no-undef
                qg.setStorage({
                    key: options.key,
                    value: options.data
                });
            }
            /**
             * 异步获取系统信息
             * @param {object} options 参数集合
             * @return 包含本系统信息的对象类型
             */
        }, {
            key: "getSystemInfo",
            value: function getSystemInfo(options) {
                // eslint-disable-next-line no-undef
                qg.getSystemInfo({
                    success: function success(ret) {
                        var deviceInfo = ret;
                        var systemArr = [ret['osType'], ret['osVersionName']];
                        var system = systemArr.join(' ');
                        deviceInfo['brand'] = ret['manufacturer'];
                        deviceInfo['system'] = system;
                        options.success(deviceInfo);
                    },
                    complete: function complete() {
                        options.complete();
                    }
                });
            }
            /**
             * 异步获取网络类型
             * @param {object} options 参数集合
             * @return {object}.networkType string 网络类型
             */
        }, {
            key: "getNetworkType",
            value: function getNetworkType(options) {
                // eslint-disable-next-line no-undef
                qg.getNetworkType({
                    success: function success(data) {
                        var networkInfo = data;
                        networkInfo['networkType'] = data.type;
                        options.success(networkInfo);
                    },
                    complete: function complete() {
                        options.complete();
                    }
                });
            }
            /**
             * 监听网络状态变化事件
             * @param {function} options 参数集合，网络状态变化后的回调
             * @return {object}.networkType string 网络类型
             */
        }, {
            key: "onNetworkStatusChange",
            value: function onNetworkStatusChange(options) {
                // eslint-disable-next-line no-undef
                qg.subscribeNetworkStatus({
                    callback: function callback(data) {
                        var networkInfo = data;
                        networkInfo['networkType'] = data.type;
                        options(networkInfo);
                    }
                });
            }
            /**
             * 发起网络请求
             * @param {object} options 参数集合
             * @return 网络请求结果
             */
        }, {
            key: "request",
            value: function request(options) {
                // eslint-disable-next-line no-undef
                return qg.request({
                    url: options.url,
                    data: options.data,
                    method: options.method,
                    header: options.header,
                    success: function success(response) {
                        options.success(response);
                    },
                    fail: function fail(data) {
                        options.fail(data);
                    }
                });
            }
        }, {
            key: "showDebugToast",
            value: function showDebugToast(text) {
                // eslint-disable-next-line no-undef
                qg.showToast({
                    message: text,
                    duration: 0
                });
            }
        }]);
    return CurrentPlatformVivo;
}();
var currentPlatformVivo = new CurrentPlatformVivo();
var CurrentPlatformOppo = function () {
    function CurrentPlatformOppo() {
        _classCallCheck(this, CurrentPlatformOppo);
    }
    _createClass(CurrentPlatformOppo, [{
            key: "getStorageSync",
            /**
             * 获取本地缓存数据
             * @param {object} callback 异步获取时的回调函数，参数为对象
             * @return 包含本地存储值的对象类型
             */
            value: function getStorageSync(options) {
                return localStorage.getItem(options);
            }
            /**
             * 设置本地缓存
             * @param {object} options 参数集合，包含：
             *   key       string         本地缓存的 key
             *   data      string         JSON 字符串
             */
        }, {
            key: "setStorage",
            value: function setStorage(options) {
                localStorage.setItem(options.key, options.data);
            }
            /**
             * 异步获取系统信息
             * @param {object} options 参数集合
             * @return 包含本系统信息的对象类型
             */
        }, {
            key: "getSystemInfo",
            value: function getSystemInfo(options) {
                // eslint-disable-next-line no-undef
                qg.getSystemInfo({
                    success: function success(ret) {
                        options.success(ret);
                    },
                    complete: function complete() {
                        options.complete();
                    }
                });
            }
            /**
             * 异步获取网络类型
             * @param {object} options 参数集合
             * @return {object}.networkType string 网络类型
             */
        }, {
            key: "getNetworkType",
            value: function getNetworkType(options) {
                // eslint-disable-next-line no-undef
                qg.getNetworkType({
                    success: function success(data) {
                        options.success(data);
                    },
                    complete: function complete() {
                        options.complete();
                    }
                });
            }
            /**
             * 监听网络状态变化事件
             * @param {function} options 参数集合，网络状态变化后的回调
             * @return {object}.networkType string 网络类型
             */
        }, {
            key: "onNetworkStatusChange",
            value: function onNetworkStatusChange(options) {
                // eslint-disable-next-line no-undef
                qg.onNetworkStatusChange({
                    callback: function callback(data) {
                        options(data);
                    }
                });
            }
            /**
             * 发起网络请求
             * @param {object} options 参数集合
             * @return 网络请求结果
             */
        }, {
            key: "request",
            value: function request(options) {
                var xhr = new XMLHttpRequest();
                if (options.header) {
                    for (var key in options.header) {
                        xhr.setRequestHeader(key, options.header[key]);
                    }
                }
                xhr.open(options.method, options.url);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        var res = {};
                        res['statusCode'] = 200;
                        if (_.isJSONString(xhr.responseText)) {
                            res['data'] = JSON.parse(xhr.responseText);
                        }
                        options.success(res);
                    }
                };
                xhr.ontimeout = function () {
                    var res = {};
                    res.errMsg = 'timeout';
                    options.fail(res);
                };
                xhr.send(options.data);
                return xhr;
            }
            /**
             * 返回系统上下文信息.
             */
        }, {
            key: "getLaunchOptionsSync",
            value: function getLaunchOptionsSync() {
                // eslint-disable-next-line no-undef
                return qg.getLaunchOptionsSync();
            }
        }, {
            key: "showDebugToast",
            value: function showDebugToast(text) {
                // eslint-disable-next-line no-undef
                qg.showToast({
                    title: text,
                    icon: 'none',
                    duration: 2000
                });
            }
        }]);
    return CurrentPlatformOppo;
}();
var currentPlatformOppo = new CurrentPlatformOppo();
var currentPlatform;
var PlatformAPI = function () {
    function PlatformAPI() {
        _classCallCheck(this, PlatformAPI);
    }
    _createClass(PlatformAPI, null, [{
            key: "init",
            value: function init(config) {
                if (egret.Capabilities.runtimeType === egret.RuntimeType.WXGAME) {
                    currentPlatform = wx;
                    config.persistenceName = 'thinkingdata_wechat_game';
                    config.asyncPersistence = false;
                }
                else if (egret.Capabilities.runtimeType === egret.RuntimeType.BAIDUGAME) {
                    currentPlatform = swan;
                    config.persistenceName = 'thinkingdata_swan_game';
                    config.asyncPersistence = false;
                }
                else if (egret.Capabilities.runtimeType === egret.RuntimeType.VIVOGAME) {
                    currentPlatform = currentPlatformVivo;
                    config.persistenceName = 'thinkingdata_qg_vivo_game';
                    config.asyncPersistence = true;
                }
                else if (egret.Capabilities.runtimeType === egret.RuntimeType.OPPOGAME) {
                    currentPlatform = currentPlatformOppo;
                    config.persistenceName = 'thinkingdata_qg_oppo_game';
                    config.asyncPersistence = false;
                }
                else if (egret.Capabilities.runtimeType === egret.RuntimeType.QQGAME) {
                    currentPlatform = qq;
                    config.persistenceName = 'thinkingdata_qq_game';
                    config.asyncPersistence = false;
                }
            }
            /**
             * 获取本地缓存数据
             * @param {string} name 本地缓存中指定的 key
             * @param {boolean} async 是否异步获取
             * @param {function} callback 异步获取时的回调函数，参数为对象
             * @return 包含本地存储值的对象类型
             */
        }, {
            key: "getStorage",
            value: function getStorage(name, async, callback) {
                if (async) {
                    currentPlatform.getStorage({
                        key: name,
                        success: function success(res) {
                            var data = _.isJSONString(res.data) ? JSON.parse(res.data) : {};
                            callback(data);
                        },
                        fail: function fail() {
                            logger.warn('getStorage faild');
                            callback({});
                        }
                    });
                }
                else {
                    var data = currentPlatform.getStorageSync(name);
                    if (_.isJSONString(data)) {
                        return JSON.parse(data);
                    }
                    else {
                        return {};
                    }
                }
            }
            /**
             * 设置本地缓存
             * @param {string} name 本地缓存的 key
             * @param {string} value JSON 字符串
             */
        }, {
            key: "setStorage",
            value: function setStorage(name, value) {
                currentPlatform.setStorage({
                    key: name,
                    data: value
                });
            }
            /**
             * 异步获取系统信息
             * @param {object} options 成功和结束后的回调函数
             * 当成功获取系统信息后，res 参数包含：
             *   brand         string  设备品牌
             *   model         string  设备型号
             *   screenWidth   number  屏幕宽度，单位px
             *   screenHeight  number  屏幕高度，单位px
             *   system        string  操作系统及版本
             *   platform      string  客户端平台
             */
        }, {
            key: "getSystemInfo",
            value: function getSystemInfo(options) {
                currentPlatform.getSystemInfo({
                    success: function success(res) {
                        if (egret.Capabilities.runtimeType === egret.RuntimeType.WXGAME) {
                            res['mp_platform'] = 'wechat';
                        }
                        else if (egret.Capabilities.runtimeType === egret.RuntimeType.BAIDUGAME) {
                            res['mp_platform'] = res['host'];
                        }
                        else if (egret.Capabilities.runtimeType === egret.RuntimeType.VIVOGAME) {
                            res['mp_platform'] = 'vivo_qg';
                        }
                        else if (egret.Capabilities.runtimeType === egret.RuntimeType.QQGAME) {
                            res['mp_platform'] = 'qq';
                        }
                        else if (egret.Capabilities.runtimeType === egret.RuntimeType.OPPOGAME) {
                            res['mp_platform'] = 'oppo_qg';
                        }
                        options.success(res);
                    },
                    complete: function complete() {
                        options.complete();
                    }
                });
            }
            /**
             * 异步获取网络类型
             * @param {object} options 成功和结束后的回调函数
             * res.networkType string 网络类型
             */
        }, {
            key: "getNetworkType",
            value: function getNetworkType(options) {
                currentPlatform.getNetworkType({
                    success: function success(res) {
                        options.success(res);
                    },
                    complete: function complete() {
                        options.complete();
                    }
                });
            }
            /**
             * 监听网络状态变化事件
             * @param {function} callback 网络状态变化后的回调
             */
        }, {
            key: "onNetworkStatusChange",
            value: function onNetworkStatusChange(callback) {
                currentPlatform.onNetworkStatusChange(callback);
            }
            /**
             * 发起网络请求
             * @param {object} options 参数集合，包含：
             *   url       string         服务器接口地址
             *   data      string/object  请求的参数
             *   method    string         HTTP 请求方法
             *   success   function       请求成功的回调函数
             *   fail      function       请求失败的回调函数
             *   complete  function       请求结束的回调函数
             */
        }, {
            key: "request",
            value: function request(options) {
                return currentPlatform.request(options);
            }
            /**
             * 初始化生命周期相关实例
             * @param {ThinkingDataAPI} instance SDK 实例, 用于生命周期相关逻辑回调.
             * @param {object} config 自动采集相关配置.
             */
        }, {
            key: "initAutoTrackInstance",
            value: function initAutoTrackInstance(instance, config) {
                if (_.isObject(config.autoTrack)) {
                    config.autoTrack['isPlugin'] = config.is_plugin;
                }
                if (egret.Capabilities.runtimeType === egret.RuntimeType.WXGAME || egret.Capabilities.runtimeType === egret.RuntimeType.BAIDUGAME || egret.Capabilities.runtimeType === egret.RuntimeType.QQGAME) {
                    return new AutoTrackBridge(instance, config.autoTrack, currentPlatform);
                }
                else if (egret.Capabilities.runtimeType === egret.RuntimeType.VIVOGAME) {
                    return new AutoTrackBridgeVivo(instance, config.autoTrack, currentPlatform);
                }
                else if (egret.Capabilities.runtimeType === egret.RuntimeType.OPPOGAME) {
                    return new AutoTrackBridgeOppo(instance, config.autoTrack, currentPlatform);
                }
            }
            /**
             * 获取系统启动信息，并注册 APP 切前台的回调
             * @param {function} callback APP 切前台的回调函数.
             */
        }, {
            key: "getAppOptions",
            value: function getAppOptions(callback) {
                var options = {};
                try {
                    options = currentPlatform.getLaunchOptionsSync();
                }
                catch (e) {
                    logger.warn('Cannot get launch options.');
                }
                if (_.isFunction(callback) && _.isFunction(currentPlatform.onShow)) {
                    try {
                        currentPlatform.onShow(callback);
                    }
                    catch (e) {
                        logger.warn('Cannot register onAppShow callback.');
                    }
                }
                return options;
            }
        }, {
            key: "showDebugToast",
            value: function showDebugToast(text) {
                if (egret.Capabilities.runtimeType === egret.RuntimeType.WXGAME) {
                    wx.showToast({
                        title: text,
                        icon: 'none',
                        duration: 2000
                    });
                }
                else if (egret.Capabilities.runtimeType === egret.RuntimeType.BAIDUGAME) {
                    swan.showToast({
                        title: text,
                        icon: 'none',
                        duration: 2000
                    });
                }
                else if (egret.Capabilities.runtimeType === egret.RuntimeType.QQGAME) {
                    qq.showToast({
                        title: text,
                        icon: 'none',
                        duration: 2000
                    });
                }
                else if (egret.Capabilities.runtimeType === egret.RuntimeType.OPPOGAME) {
                    qg.showToast({
                        title: text,
                        icon: 'none',
                        duration: 2000
                    });
                }
                else if (egret.Capabilities.runtimeType === egret.RuntimeType.VIVOGAME) {
                    qg.showToast({
                        message: text,
                        duration: 0
                    });
                }
            }
        }]);
    return PlatformAPI;
}();
var HttpTask = function () {
    function HttpTask(data, serverUrl, tryCount, timeout, callback) {
        _classCallCheck(this, HttpTask);
        this.data = data;
        this.serverUrl = serverUrl;
        this.callback = callback;
        this.tryCount = _.isNumber(tryCount) ? tryCount : 1;
        this.timeout = _.isNumber(timeout) ? timeout : 3000;
    }
    _createClass(HttpTask, [{
            key: "run",
            value: function run() {
                var _this = this;
                var headers = _.createExtraHeaders();
                headers['content-type'] = 'application/json'; // eslint-disable-next-line no-undef
                var request = PlatformAPI.request({
                    url: this.serverUrl,
                    method: 'POST',
                    data: this.data,
                    header: headers,
                    success: function success(res) {
                        _this.onSuccess(res);
                    },
                    fail: function fail(res) {
                        _this.onFailed(res);
                    }
                });
                setTimeout(function () {
                    if ((_.isObject(request) || _.isPromise(request)) && _.isFunction(request.abort)) {
                        request.abort();
                    }
                }, this.timeout);
            }
        }, {
            key: "onSuccess",
            value: function onSuccess(res) {
                if (res.statusCode === 200) {
                    var msg;
                    switch (res.data.code) {
                        case 0:
                            msg = 'success';
                            break;
                        case -1:
                            msg = 'invalid data';
                            break;
                        case -2:
                            msg = 'invalid APP ID';
                            break;
                        default:
                            msg = 'Unknown return code';
                    }
                    this.callback({
                        code: res.data.code,
                        msg: msg
                    });
                }
                else {
                    this.callback({
                        code: -3,
                        msg: res.statusCode
                    });
                }
            }
        }, {
            key: "onFailed",
            value: function onFailed(res) {
                if (--this.tryCount > 0) {
                    this.run();
                }
                else {
                    this.callback({
                        code: -3,
                        msg: res.errMsg
                    });
                }
            }
        }]);
    return HttpTask;
}();
var HttpTaskDebug = function () {
    function HttpTaskDebug(data, serverDebugUrl, tryCount, timeout, dryrun, deviceId, callback) {
        _classCallCheck(this, HttpTaskDebug);
        this.data = data;
        this.serverDebugUrl = serverDebugUrl;
        this.callback = callback;
        this.tryCount = _.isNumber(tryCount) ? tryCount : 1;
        this.timeout = _.isNumber(timeout) ? timeout : 3000;
        this.dryrun = dryrun;
        this.deviceId = deviceId;
    }
    _createClass(HttpTaskDebug, [{
            key: "run",
            value: function run() {
                var _this2 = this;
                var debugData = 'appid=' + this.data['#app_id'] + '&source=client&dryRun=' + this.dryrun + '&deviceId=' + this.deviceId + '&data=' + encodeURIComponent(JSON.stringify(this.data['data'][0]));
                var headers = _.createExtraHeaders();
                headers['content-type'] = 'application/x-www-form-urlencoded'; // eslint-disable-next-line no-undef
                var request = PlatformAPI.request({
                    url: this.serverDebugUrl,
                    method: 'POST',
                    data: debugData,
                    header: headers,
                    success: function success(res) {
                        _this2.onSuccess(res);
                    },
                    fail: function fail(res) {
                        _this2.onFailed(res);
                    }
                });
                setTimeout(function () {
                    if ((_.isObject(request) || _.isPromise(request)) && _.isFunction(request.abort)) {
                        request.abort();
                    }
                }, this.timeout);
            }
        }, {
            key: "onSuccess",
            value: function onSuccess(res) {
                if (res.statusCode === 200) {
                    var msg;
                    if (res.data['errorLevel'] === 0) {
                        msg = 'Verify data success.';
                    }
                    else if (res.data['errorLevel'] === 1) {
                        var errorProperties = res.data['errorProperties'];
                        var errorStr = '';
                        for (var i = 0; i < errorProperties.length; i++) {
                            var errorReasons = errorProperties[i]['errorReason'];
                            var propertyName = errorProperties[i]['propertyName'];
                            errorStr = errorStr + ' propertyName:' + propertyName + ' errorReasons:' + errorReasons + '\n';
                        }
                        msg = 'Debug data error. errorLevel:' + res.data['errorLevel'] + ' reason:' + errorStr;
                    }
                    else if (res.data['errorLevel'] === 2 || res.data['errorLevel'] === -1) {
                        msg = 'Debug data error. errorLevel:' + res.data['errorLevel'] + ' reason:' + res.data['errorReasons'];
                    }
                    logger.info(msg);
                    this.callback({
                        code: res.data['errorLevel'],
                        msg: msg
                    });
                }
                else {
                    this.callback({
                        code: -3,
                        msg: res.statusCode
                    });
                }
            }
        }, {
            key: "onFailed",
            value: function onFailed(res) {
                if (--this.tryCount > 0) {
                    this.run();
                }
                else {
                    this.callback({
                        code: -3,
                        msg: res.errMsg
                    });
                }
            }
        }]);
    return HttpTaskDebug;
}();
var SenderQueue = function () {
    function SenderQueue() {
        _classCallCheck(this, SenderQueue);
        this.items = [];
        this.isRunning = false;
        this.showDebug = false;
    }
    _createClass(SenderQueue, [{
            key: "enqueue",
            value: function enqueue(data, serverUrl, config) {
                var element;
                var that = this;
                if (config.debugMode === 'debug') {
                    element = new HttpTaskDebug(data, serverUrl, config.maxRetries, config.sendTimeout, 0, config.deviceId, function (res) {
                        that.isRunning = false;
                        if (_.isFunction(config.callback)) {
                            config.callback(res);
                        }
                        that._runNext();
                        if (that.showDebug === false) {
                            if (res.code === 0 || res.code === 1 || res.code === 2) {
                                that.showDebug = true; // eslint-disable-next-line no-undef
                                if (_.isFunction(PlatformAPI.showDebugToast)) {
                                    // eslint-disable-next-line no-undef
                                    PlatformAPI.showDebugToast('当前为 debug 模式');
                                }
                            }
                        }
                    });
                }
                else if (config.debugMode === 'debugOnly') {
                    element = new HttpTaskDebug(data, serverUrl, config.maxRetries, config.sendTimeout, 1, config.deviceId, function (res) {
                        that.isRunning = false;
                        if (_.isFunction(config.callback)) {
                            config.callback(res);
                        }
                        that._runNext();
                        if (that.showDebug === false) {
                            if (res.code === 0 || res.code === 1 || res.code === 2) {
                                that.showDebug = true; // eslint-disable-next-line no-undef
                                if (_.isFunction(PlatformAPI.showDebugToast)) {
                                    // eslint-disable-next-line no-undef
                                    PlatformAPI.showDebugToast('当前为 debugOnly 模式');
                                }
                            }
                        }
                    });
                }
                else {
                    element = new HttpTask(JSON.stringify(data), serverUrl, config.maxRetries, config.sendTimeout, function (res) {
                        that.isRunning = false;
                        if (_.isFunction(config.callback)) {
                            config.callback(res);
                        }
                        that._runNext();
                    });
                }
                this.items.push(element);
                this._runNext();
            }
        }, {
            key: "_dequeue",
            value: function _dequeue() {
                return this.items.shift();
            }
        }, {
            key: "_runNext",
            value: function _runNext() {
                if (this.items.length > 0 && !this.isRunning) {
                    this.isRunning = true;
                    this._dequeue().run();
                }
            }
        }]);
    return SenderQueue;
}();
var senderQueue = new SenderQueue();
var DEFAULT_CONFIG = {
    name: 'thinkingdata',
    // 全局变量名称
    // eslint-disable-next-line camelcase
    is_plugin: false,
    // 是否是插件版本。基础库 < 2.6.4 不允许修改 App 和 Page
    maxRetries: 3,
    // 当网络出错或者超时时，最大重试次数. v1.3.0+
    sendTimeout: 3000,
    // 请求超时时间, 单位毫秒
    enablePersistence: true,
    // 是否使用本地缓存
    asyncPersistence: Config.PERSISTENCE_ASYNC,
    // 是否使用异步存储
    enableLog: true,
    // 是否打开日志
    strict: false,
    // 关闭严格数据格式校验。允许可能的问题数据上报
    debugMode: 'none' // Debug 模式
};
/**
 * 异步获取系统信息，初始化预置属性
 *
 * #lib SDK 类型，小程序中值为 MP
 * #lib_version SDK 版本
 * #network_type 上传事件时的网络类型
 * #manufacture 设备制造商
 * #device_model 设备型号，如iPhone 8
 * #screen_width 设备屏幕宽度
 * #screen_height 设备屏幕高度
 * #os 操作系统
 * #os_version 操作系统版本
 * #mp_platform 平台名称
 */
var systemInformation = {
    properties: {
        '#lib': Config.LIB_NAME,
        '#lib_version': Config.LIB_VERSION
    },
    initDeviceId: function initDeviceId(deviceId) {
        if (_.isString(deviceId)) {
            this.properties['#device_id'] = deviceId;
        }
    },
    getSystemInfo: function getSystemInfo(callback) {
        var that = this;
        PlatformAPI.onNetworkStatusChange(function (res) {
            that.properties['#network_type'] = res.networkType;
        });
        PlatformAPI.getNetworkType({
            success: function success(res) {
                that.properties['#network_type'] = res.networkType;
            },
            complete: function complete() {
                PlatformAPI.getSystemInfo({
                    success: function success(res) {
                        //logger.info(JSON.stringify(res, null, 4));
                        var data = {
                            '#manufacturer': res['brand'],
                            '#device_model': res['model'],
                            '#screen_width': Number(res['screenWidth']),
                            '#screen_height': Number(res['screenHeight']),
                            '#os': res['system'].split(' ')[0],
                            '#os_version': res['system'].split(' ')[1],
                            '#mp_platform': res['mp_platform']
                        };
                        _.extend(that.properties, data);
                        _.setMpPlatform(res['mp_platform']);
                    },
                    complete: function complete() {
                        callback();
                    }
                });
            }
        });
    }
};
/**
 * 数据缓存的包装类。
 *
 * 本地缓存的 key 值及其对应的属性 key 为:
 * 1. device_id: #device_id
 * 2. distinct_id: #distinct_id
 * 3. account_id: #account_id
 * 4. props: 事件公共属性
 * 5. event_timers: #duration
 *
 */
var ThinkingDataPersistence = function () {
    function ThinkingDataPersistence(config, callback) {
        var _this = this;
        _classCallCheck(this, ThinkingDataPersistence);
        this.enabled = config.enablePersistence;
        if (this.enabled) {
            if (config.isChildInstance) {
                this.name = config.persistenceName + '_' + config.name;
            }
            else {
                this.name = config.persistenceName;
            }
            if (config.asyncPersistence) {
                this._state = {};
                PlatformAPI.getStorage(this.name, true, function (data) {
                    _this._state = _.extend2Layers({}, data, _this._state);
                    _this._init(config, callback);
                    _this._save();
                });
            }
            else {
                this._state = PlatformAPI.getStorage(this.name) || {};
                this._init(config, callback);
            }
        }
        else {
            this._state = {};
            this._init(config, callback);
        }
    }
    _createClass(ThinkingDataPersistence, [{
            key: "_init",
            value: function _init(config, callback) {
                if (!this.getDistinctId()) {
                    this.setDistinctId(_.UUID());
                }
                if (!config.isChildInstance) {
                    if (!this.getDeviceId()) {
                        this._setDeviceId(_.UUID());
                    }
                    systemInformation.initDeviceId(this.getDeviceId());
                } // 表明初始化完成，可以进行本地缓存的写操作
                this.initComplete = true;
                if (typeof callback === 'function') {
                    callback();
                }
                this._save();
            }
        }, {
            key: "_save",
            value: function _save() {
                if (this.enabled && this.initComplete) {
                    PlatformAPI.setStorage(this.name, JSON.stringify(this._state));
                }
            }
        }, {
            key: "_set",
            value: function _set(name, value) {
                var _this2 = this;
                var obj;
                if (typeof name === 'string') {
                    obj = {};
                    obj[name] = value;
                }
                else if (_typeof(name) === 'object') {
                    obj = name;
                }
                _.each(obj, function (value, key) {
                    _this2._state[key] = value;
                });
                this._save();
            }
        }, {
            key: "setEventTimer",
            value: function setEventTimer(eventName, timestamp) {
                var timers = this._state.event_timers || {};
                timers[eventName] = timestamp;
                this._set('event_timers', timers);
            }
        }, {
            key: "removeEventTimer",
            value: function removeEventTimer(eventName) {
                var timers = this._state.event_timers || {};
                var timestamp = timers[eventName];
                if (!_.isUndefined(timestamp)) {
                    delete this._state.event_timers[eventName];
                    this._save();
                }
                return timestamp;
            }
        }, {
            key: "getDeviceId",
            value: function getDeviceId() {
                return this._state.device_id;
            }
        }, {
            key: "_setDeviceId",
            value: function _setDeviceId(deviceId) {
                if (this.getDeviceId()) {
                    logger.warn('cannot modify the device id.');
                    return;
                }
                this._set('device_id', deviceId);
            }
        }, {
            key: "getDistinctId",
            value: function getDistinctId() {
                return this._state.distinct_id;
            }
        }, {
            key: "setDistinctId",
            value: function setDistinctId(distinctId) {
                this._set('distinct_id', distinctId);
            }
        }, {
            key: "getAccountId",
            value: function getAccountId() {
                return this._state.account_id;
            }
        }, {
            key: "setAccountId",
            value: function setAccountId(accoundId) {
                this._set('account_id', accoundId);
            }
        }, {
            key: "getSuperProperties",
            value: function getSuperProperties() {
                return this._state.props || {};
            }
        }, {
            key: "setSuperProperties",
            value: function setSuperProperties(superProperties, replace) {
                var props = replace ? superProperties : _.extend(this.getSuperProperties(), superProperties);
                this._set('props', props);
            }
        }]);
    return ThinkingDataPersistence;
}();
var ThinkingDataAPI = function () {
    function ThinkingDataAPI(config) {
        _classCallCheck(this, ThinkingDataAPI);
        if (_.isObject(config)) {
            this.config = _.extend({}, DEFAULT_CONFIG, config);
        }
        else {
            this.config = DEFAULT_CONFIG;
        }
        PlatformAPI.init(this.config);
        this._init(this.config);
    } // internal init function. it should not be used by users.
    _createClass(ThinkingDataAPI, [{
            key: "_init",
            value: function _init(config) {
                var _this3 = this;
                this.name = config.name;
                this.appId = config.appid || config.appId;
                this.serverUrl = config.server_url + '/sync_xcx';
                this.serverDebugUrl = config.server_url + '/data_debug';
                this.autoTrackProperties = {}; // cache commands.
                this._queue = [];
                if (config.isChildInstance) {
                    this._state = {};
                }
                else {
                    logger.enabled = config.enableLog;
                    this.instances = []; // 子实例名称
                    this._state = {
                        getSystemInfo: false,
                        initComplete: false
                    };
                    systemInformation.getSystemInfo(function () {
                        _this3._updateState({
                            getSystemInfo: true
                        });
                    });
                    if (config.autoTrack) {
                        this.autoTrack = PlatformAPI.initAutoTrackInstance(this, config);
                    }
                    else {
                        var launchOptions = PlatformAPI.getAppOptions(function (options) {
                            if (options && options.scene) {
                                _this3._setAutoTrackProperties({
                                    '#scene': options.scene
                                });
                            }
                        });
                        if (launchOptions.scene) {
                            this._setAutoTrackProperties({
                                '#scene': launchOptions.scene
                            });
                        }
                    }
                }
                this.store = new ThinkingDataPersistence(config, function () {
                    if (_this3.config.asyncPersistence && _.isFunction(_this3.config.persistenceComplete)) {
                        _this3.config.persistenceComplete(_this3);
                    }
                    _this3._updateState();
                });
            }
            /**
             * 创建新的实例（子实例）。所有可以设置的属性都与主实例独立。
             *
             * @param {string} name 子实例名称
             * @param {object} config 可选 子实例配置信息
             */
        }, {
            key: "initInstance",
            value: function initInstance(name, config) {
                if (this.config.isChildInstance) {
                    logger.warn('initInstance() cannot be called on child instance');
                    return;
                }
                if (_.isString(name) && name !== this.name && _.isUndefined(this[name])) {
                    var instance = new ThinkingDataAPI(_.extend({}, this.config, {
                        enablePersistence: false,
                        isChildInstance: true,
                        name: name
                    }, config));
                    this[name] = instance;
                    this.instances.push(name);
                    this[name]._state = this._state;
                }
                else {
                    logger.warn('initInstance() failed due to the name is invalid: ' + name);
                }
            }
            /**
             * 用于获取子实例，用于白鹭引擎 t.ds 代码调用
             *
             * @param {string} name 子实例名称
             */
        }, {
            key: "lightInstance",
            value: function lightInstance(name) {
                return this[name];
            }
            /**
             * 内部函数，用于设置与生命周期相关的一些预置属性
             *
             * 常见的属性有：
             * - #scene 场景值，在 onLaunch 回调中可获取。也可以根据平台接口主动获取
             * - #url_path 页面路径
             *
             * 在发送事件数据时，优先级为：事件属性 > 动态公共属性 > 公共事件属性 > 自动采集属性 > 其他预置属性
             *
             * @param {object} props 相关预置属性
             */
        }, {
            key: "_setAutoTrackProperties",
            value: function _setAutoTrackProperties(props) {
                _.extend(this.autoTrackProperties, props);
            }
            /**
             * 用户主动调用 init()，开始真正的上报。
             *
             * 在调用此函数之前，所有的上报请求将被缓存。当用户完成必要的设置时，调用此函数触发上报.
             */
        }, {
            key: "init",
            value: function init() {
                if (this._state.initComplete)
                    return false;
                this._updateState({
                    initComplete: true
                });
            }
            /**
             * 内部函数，判断是否完成初始化，可以真正发送数据
             *
             * 每个实例有三个异步状态
             * - getSystemInfo 是否获取到系统信息，子实例默认此状态为 true.
             * - initComplete 是否调用了init() 函数，true 则表明用户已经完成必要的初始化设置。子实例此状态默认为 true.
             * - store.initComplete 缓存信息是否已经读取完成
             */
        }, {
            key: "_isReady",
            value: function _isReady() {
                return this._state.getSystemInfo && this._state.initComplete && this.store.initComplete && this.getDeviceId();
            }
        }, {
            key: "_updateState",
            value: function _updateState(state) {
                var _this4 = this;
                if (_.isObject(state)) {
                    _.extend(this._state, state);
                }
                this._onStateChange();
                _.each(this.instances, function (name) {
                    _this4[name]._onStateChange();
                });
            } // 只有系统信息初始化完成，并且用户主动调用init()之后，才会真正的发送数据.
        }, {
            key: "_onStateChange",
            value: function _onStateChange() {
                var _this5 = this;
                if (this._isReady() && this._queue && this._queue.length > 0) {
                    _.each(this._queue, function (item) {
                        _this5[item[0]].apply(_this5, slice.call(item[1]));
                    });
                    this._queue = [];
                }
            } // 发送请求。由于一些平台对网络连接数目的限制，我们使用 senderQueue 发送数据。
        }, {
            key: "_sendRequest",
            value: function _sendRequest(eventData, time) {
                time = _.isDate(time) ? time : new Date();
                var data = {
                    data: [{
                            '#type': eventData.type,
                            '#time': _.formatDate(time),
                            '#distinct_id': this.store.getDistinctId()
                        }]
                };
                if (this.store.getAccountId()) {
                    data.data[0]['#account_id'] = this.store.getAccountId();
                }
                if (eventData.type === 'track' || eventData.type === 'track_update' || eventData.type === 'track_overwrite') {
                    data.data[0]['#event_name'] = eventData.eventName;
                    if (eventData.type === 'track_update' || eventData.type === 'track_overwrite') {
                        data.data[0]['#event_id'] = eventData.extraId;
                    }
                    else if (eventData.firstCheckId) {
                        data.data[0]['#first_check_id'] = eventData.firstCheckId;
                    }
                    data.data[0]['properties'] = _.extend({
                        '#zone_offset': 0 - time.getTimezoneOffset() / 60.0
                    }, systemInformation.properties, this.autoTrackProperties, this.store.getSuperProperties(), this.dynamicProperties ? this.dynamicProperties() : {});
                    var startTimestamp = this.store.removeEventTimer(eventData.eventName);
                    if (!_.isUndefined(startTimestamp)) {
                        var durationMillisecond = new Date().getTime() - startTimestamp;
                        data.data[0]['properties']['#duration'] = parseFloat((durationMillisecond / 1000).toFixed(3));
                    }
                }
                else {
                    data.data[0]['properties'] = {};
                }
                if (_.isObject(eventData.properties) && !_.isEmptyObject(eventData.properties)) {
                    _.extend(data.data[0].properties, eventData.properties);
                }
                _.searchObjDate(data.data[0]);
                if (this.config.maxRetries > 1) {
                    data.data[0]['#uuid'] = _.UUIDv4();
                }
                data['#app_id'] = this.appId;
                logger.info(JSON.stringify(data, null, 4));
                var serverUrl = this.config.debugMode === 'debug' || this.config.debugMode === 'debugOnly' ? this.serverDebugUrl : this.serverUrl;
                senderQueue.enqueue(data, serverUrl, {
                    maxRetries: this.config.maxRetries,
                    sendTimeout: this.config.sendTimeout,
                    callback: eventData.onComplete,
                    debugMode: this.config.debugMode,
                    deviceId: this.getDeviceId()
                });
            } // 是否为参数对象
        }, {
            key: "_isObjectParams",
            value: function _isObjectParams(obj) {
                return _.isObject(obj) && _.isFunction(obj.onComplete);
            }
            /**
             * 发送事件数据. 会对属性值进行校验.
             * @param {string} eventName 必填
             * @param {object} properties 可选
             * @param {date} time 可选
             * @param {function} onComplete 可选, 回调函数
             */
        }, {
            key: "track",
            value: function track(eventName, properties, time, onComplete) {
                if (this._isObjectParams(eventName)) {
                    var options = eventName;
                    eventName = options.eventName;
                    properties = options.properties;
                    time = options.time;
                    onComplete = options.onComplete;
                }
                if (PropertyChecker.event(eventName) && PropertyChecker.properties(properties) || !this.config.strict) {
                    this._internalTrack(eventName, properties, time, onComplete);
                }
                else if (_.isFunction(onComplete)) {
                    onComplete({
                        code: -1,
                        msg: 'invalid parameters'
                    });
                }
            }
        }, {
            key: "trackUpdate",
            value: function trackUpdate(options) {
                if (PropertyChecker.event(options.eventName) && PropertyChecker.properties(options.properties) || !this.config.strict) {
                    var time = _.isDate(options.time) ? options.time : new Date();
                    if (this._isReady()) {
                        this._sendRequest({
                            type: 'track_update',
                            eventName: options.eventName,
                            properties: options.properties,
                            onComplete: options.onComplete,
                            extraId: options.eventId
                        }, time);
                    }
                    else {
                        this._queue.push(['trackUpdate', [{
                                    eventName: options.eventName,
                                    properties: options.properties,
                                    time: options.time,
                                    onComplete: options.onComplete,
                                    eventId: options.eventId
                                }]]);
                    }
                }
                else if (_.isFunction(options.onComplete)) {
                    options.onComplete({
                        code: -1,
                        msg: 'invalid parameters'
                    });
                }
            }
        }, {
            key: "trackOverwrite",
            value: function trackOverwrite(options) {
                if (PropertyChecker.event(options.eventName) && PropertyChecker.properties(options.properties) || !this.config.strict) {
                    var time = _.isDate(options.time) ? options.time : new Date();
                    if (this._isReady()) {
                        this._sendRequest({
                            type: 'track_overwrite',
                            eventName: options.eventName,
                            properties: options.properties,
                            onComplete: options.onComplete,
                            extraId: options.eventId
                        }, time);
                    }
                    else {
                        this._queue.push(['trackOverwrite', [{
                                    eventName: options.eventName,
                                    properties: options.properties,
                                    time: options.time,
                                    onComplete: options.onComplete,
                                    eventId: options.eventId
                                }]]);
                    }
                }
                else if (_.isFunction(options.onComplete)) {
                    options.onComplete({
                        code: -1,
                        msg: 'invalid parameters'
                    });
                }
            }
        }, {
            key: "trackFirstEvent",
            value: function trackFirstEvent(options) {
                if (PropertyChecker.event(options.eventName) && PropertyChecker.properties(options.properties) || !this.config.strict) {
                    var time = _.isDate(options.time) ? options.time : new Date();
                    if (this._isReady()) {
                        this._sendRequest({
                            type: 'track',
                            eventName: options.eventName,
                            properties: options.properties,
                            onComplete: options.onComplete,
                            firstCheckId: options.firstCheckId ? options.firstCheckId : this.getDeviceId()
                        }, time);
                    }
                    else {
                        this._queue.push(['trackFirstEvent', [{
                                    eventName: options.eventName,
                                    properties: options.properties,
                                    time: options.time,
                                    onComplete: options.onComplete,
                                    firstCheckId: options.firstCheckId
                                }]]);
                    }
                }
                else if (_.isFunction(options.onComplete)) {
                    options.onComplete({
                        code: -1,
                        msg: 'invalid parameters'
                    });
                }
            } // internal function. Do not call this function directly.
        }, {
            key: "_internalTrack",
            value: function _internalTrack(eventName, properties, time, onComplete) {
                time = _.isDate(time) ? time : new Date();
                if (this._isReady()) {
                    this._sendRequest({
                        type: 'track',
                        eventName: eventName,
                        properties: properties,
                        onComplete: onComplete
                    }, time);
                }
                else {
                    this._queue.push(['_internalTrack', [eventName, properties, time, onComplete]]);
                }
            }
        }, {
            key: "userSet",
            value: function userSet(properties, time, onComplete) {
                if (this._isObjectParams(properties)) {
                    var options = properties;
                    properties = options.properties;
                    time = options.time;
                    onComplete = options.onComplete;
                }
                if (PropertyChecker.propertiesMust(properties) || !this.config.strict) {
                    time = _.isDate(time) ? time : new Date();
                    if (this._isReady()) {
                        this._sendRequest({
                            type: 'user_set',
                            properties: properties,
                            onComplete: onComplete
                        }, time);
                    }
                    else {
                        this._queue.push(['userSet', [properties, time, onComplete]]);
                    }
                }
                else {
                    logger.warn('calling userSet failed due to invalid arguments');
                    if (_.isFunction(onComplete)) {
                        onComplete({
                            code: -1,
                            msg: 'invalid parameters'
                        });
                    }
                }
            }
        }, {
            key: "userSetOnce",
            value: function userSetOnce(properties, time, onComplete) {
                if (this._isObjectParams(properties)) {
                    var options = properties;
                    properties = options.properties;
                    time = options.time;
                    onComplete = options.onComplete;
                }
                if (PropertyChecker.propertiesMust(properties) || !this.config.strict) {
                    time = _.isDate(time) ? time : new Date();
                    if (this._isReady()) {
                        this._sendRequest({
                            type: 'user_setOnce',
                            properties: properties,
                            onComplete: onComplete
                        }, time);
                    }
                    else {
                        this._queue.push(['userSetOnce', [properties, time, onComplete]]);
                    }
                }
                else {
                    logger.warn('calling userSetOnce failed due to invalid arguments');
                    if (_.isFunction(onComplete)) {
                        onComplete({
                            code: -1,
                            msg: 'invalid parameters'
                        });
                    }
                }
            }
        }, {
            key: "userUnset",
            value: function userUnset(property, onComplete, time) {
                if (this._isObjectParams(properties)) {
                    var options = properties;
                    property = options.property;
                    time = options.time;
                    onComplete = options.onComplete;
                }
                if (PropertyChecker.propertyName(property) || !this.config.strict) {
                    time = _.isDate(time) ? time : new Date();
                    if (this._isReady()) {
                        var properties = {};
                        properties[property] = 0;
                        this._sendRequest({
                            type: 'user_unset',
                            properties: properties,
                            onComplete: onComplete
                        }, time);
                    }
                    else {
                        this._queue.push(['userUnset', [property, onComplete, time]]);
                    }
                }
                else {
                    logger.warn('calling userUnset failed due to invalid arguments');
                    if (_.isFunction(onComplete)) {
                        onComplete({
                            code: -1,
                            msg: 'invalid parameters'
                        });
                    }
                }
            }
        }, {
            key: "userDel",
            value: function userDel(time, onComplete) {
                if (this._isObjectParams(time)) {
                    var options = time;
                    time = options.time;
                    onComplete = options.onComplete;
                }
                time = _.isDate(time) ? time : new Date();
                if (this._isReady()) {
                    this._sendRequest({
                        type: 'user_del',
                        onComplete: onComplete
                    }, time);
                }
                else {
                    this._queue.push(['userDel', [time, onComplete]]);
                }
            }
        }, {
            key: "userAdd",
            value: function userAdd(properties, time, onComplete) {
                if (this._isObjectParams(properties)) {
                    var options = properties;
                    properties = options.properties;
                    time = options.time;
                    onComplete = options.onComplete;
                }
                if (PropertyChecker.userAddProperties(properties) || !this.config.strict) {
                    time = _.isDate(time) ? time : new Date();
                    if (this._isReady()) {
                        this._sendRequest({
                            type: 'user_add',
                            properties: properties,
                            onComplete: onComplete
                        }, time);
                    }
                    else {
                        this._queue.push(['userAdd', [properties, time, onComplete]]);
                    }
                }
                else {
                    logger.warn('calling userAdd failed due to invalid arguments');
                    if (_.isFunction(onComplete)) {
                        onComplete({
                            code: -1,
                            msg: 'invalid parameters'
                        });
                    }
                }
            }
        }, {
            key: "userAppend",
            value: function userAppend(properties, time, onComplete) {
                if (this._isObjectParams(properties)) {
                    var options = properties;
                    properties = options.properties;
                    time = options.time;
                    onComplete = options.onComplete;
                }
                if (PropertyChecker.userAppendProperties(properties) || !this.config.strict) {
                    time = _.isDate(time) ? time : new Date();
                    if (this._isReady()) {
                        this._sendRequest({
                            type: 'user_append',
                            properties: properties,
                            onComplete: onComplete
                        }, time);
                    }
                    else {
                        this._queue.push(['userAppend', [properties, time, onComplete]]);
                    }
                }
                else {
                    logger.warn('calling userAppend failed due to invalid arguments');
                    if (_.isFunction(onComplete)) {
                        onComplete({
                            code: -1,
                            msg: 'invalid parameters'
                        });
                    }
                }
            }
        }, {
            key: "authorizeOpenID",
            value: function authorizeOpenID(id) {
                this.identify(id);
            }
        }, {
            key: "identify",
            value: function identify(id) {
                if (typeof id === 'number') {
                    id = String(id);
                }
                else if (typeof id !== 'string') {
                    return false;
                }
                this.store.setDistinctId(id);
            }
        }, {
            key: "getDistinctId",
            value: function getDistinctId() {
                return this.store.getDistinctId();
            }
        }, {
            key: "login",
            value: function login(accoundId) {
                if (typeof accoundId === 'number') {
                    accoundId = String(accoundId);
                }
                else if (typeof accoundId !== 'string') {
                    return false;
                }
                this.store.setAccountId(accoundId);
            }
        }, {
            key: "getAccountId",
            value: function getAccountId() {
                return this.store.getAccountId();
            }
        }, {
            key: "logout",
            value: function logout() {
                this.store.setAccountId(null);
            }
        }, {
            key: "setSuperProperties",
            value: function setSuperProperties(obj) {
                if (PropertyChecker.propertiesMust(obj) || !this.config.strict) {
                    this.store.setSuperProperties(obj);
                }
                else {
                    logger.warn('setSuperProperties 的参数必须是合法的属性值');
                }
            }
        }, {
            key: "clearSuperProperties",
            value: function clearSuperProperties() {
                this.store.setSuperProperties({}, true);
            }
        }, {
            key: "unsetSuperProperty",
            value: function unsetSuperProperty(propertyName) {
                if (_.isString(propertyName)) {
                    var superProperties = this.getSuperProperties();
                    delete superProperties[propertyName];
                    this.store.setSuperProperties(superProperties, true);
                }
            }
        }, {
            key: "getSuperProperties",
            value: function getSuperProperties() {
                return this.store.getSuperProperties();
            }
        }, {
            key: "setDynamicSuperProperties",
            value: function setDynamicSuperProperties(dynamicProperties) {
                if (typeof dynamicProperties === 'function') {
                    if (PropertyChecker.properties(dynamicProperties()) || !this.config.strict) {
                        this.dynamicProperties = dynamicProperties;
                    }
                    else {
                        logger.warn('动态公共属性必须返回合法的属性值');
                    }
                }
                else {
                    logger.warn('setDynamicSuperProperties 的参数必须是 function 类型');
                }
            }
        }, {
            key: "timeEvent",
            value: function timeEvent(eventName, time) {
                time = _.isDate(time) ? time : new Date();
                if (this._isReady()) {
                    if (PropertyChecker.event(eventName) || !this.config.strict) {
                        this.store.setEventTimer(eventName, time.getTime());
                    }
                    else {
                        logger.warn('calling timeEvent failed due to invalid eventName: ' + eventName);
                    }
                }
                else {
                    this._queue.push(['timeEvent', [eventName, time]]);
                }
            }
        }, {
            key: "getDeviceId",
            value: function getDeviceId() {
                return systemInformation.properties['#device_id'];
            }
        }]);
    return ThinkingDataAPI;
}();
window['ThinkingDataAPI'] = ThinkingDataAPI;
