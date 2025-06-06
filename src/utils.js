/* eslint-disable no-undef */
import {
    Config
} from './Config';

var _ = {};

var ArrayProto = Array.prototype,
    ObjProto = Object.prototype,
    slice = ArrayProto.slice,
    nativeToString = ObjProto.toString,
    nativeHasOwnProperty = Object.prototype.hasOwnProperty,
    nativeForEach = ArrayProto.forEach,
    nativeIsArray = Array.isArray,
    breaker = {};
var utmTypes = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];


_.each = function (obj, iterator, context) {
    // eslint-disable-next-line
    if (obj === null || obj === undefined) {
        return false;
    }
    if (nativeForEach && obj.forEach === nativeForEach) {
        obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
        for (var i = 0, l = obj.length; i < l; i++) {
            if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) {
                return false;
            }
        }
    } else {
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
            if (source[prop] !==
                void 0) {
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
                } else {
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
    } catch (x) {
        return false;
    }
};

//alipay request type
_.isPromise = function (obj) {
    return (nativeToString.call(obj) === '[object Promise]') && (obj !== null && obj !== undefined);
};

_.isObject = function (obj) {
    return (nativeToString.call(obj) === '[object Object]') && (obj !== null && obj !== undefined);
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
    return (nativeToString.call(obj) === '[object Number]' && /[\d\.]+/.test(String(obj)));
};

_.isJSONString = function (str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
};
_.decodeURIComponent = function (val) {
    var result = '';
    try {
        result = decodeURIComponent(val);
    } catch (e) {
        result = val;
    }
    return result;
};
_.encodeURIComponent = function (val) {
    var result = '';
    try {
        result = encodeURIComponent(val);
    } catch (e) {
        result = val;
    }
    return result;
};

_.utf8Encode = function (string) {
    string = (string + '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    var utftext = '';
    var start, end;
    var stringl = 0;
    var n;
    start = end = 0;
    stringl = string.length;
    for (n = 0; n < stringl; n++) {
        var c1 = string.charCodeAt(n);
        var enc = null;
        if (c1 < 128) {
            end++;
        } else if ((c1 > 127) && (c1 < 2048)) {
            enc = String.fromCharCode((c1 >> 6) | 192, (c1 & 63) | 128);
        } else {
            enc = String.fromCharCode((c1 >> 12) | 224, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128);
        }
        if (enc !== null) {
            if (end > start) {
                utftext += string.substring(start, end);
            }
            utftext += enc;
            start = end = n + 1;
        }
    }
    if (end > start) {
        utftext += string.substring(start, string.length);
    }
    return utftext;
};

_.base64Encode = function (data) {
    var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var o1, o2, o3, h1, h2, h3, h4, bits;
    var i = 0, ac = 0, enc = '', tmpArr = [];

    if (!data) {
        return data;
    }

    data = _.utf8Encode(data);
    do {
        o1 = data.charCodeAt(i++);
        o2 = data.charCodeAt(i++);
        o3 = data.charCodeAt(i++);
        bits = o1 << 16 | o2 << 8 | o3;
        h1 = bits >> 18 & 0x3f;
        h2 = bits >> 12 & 0x3f;
        h3 = bits >> 6 & 0x3f;
        h4 = bits & 0x3f;
        tmpArr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    } while (i < data.length);

    enc = tmpArr.join('');
    switch (data.length % 3) {
        case 1:
            enc = enc.slice(0, -2) + '==';
            break;
        case 2:
            enc = enc.slice(0, -1) + '=';
            break;
    }
    return enc;
};

_.encodeDates = function (obj) {
    _.each(obj, function (v, k) {
        if (_.isDate(v)) {
            obj[k] = _.formatDate(v);
        } else if (_.isObject(v)) {
            obj[k] = _.encodeDates(v);
        } else if (_.isArray(v)) {
            for (let i = 0; i < v.length; i++) {
                if (_.isDate(v[i])) {
                    obj[k][i] = _.formatDate(v[i]);
                }
            }
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
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' +
        pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()) + '.' + secondPad(d.getMilliseconds());
};

_.formatTimeZone = function (d, i) {
    if (typeof i !== 'number') return d;
    var len = d.getTime();
    var offset = d.getTimezoneOffset() * 60000;
    var utcTime = len + offset;
    return new Date(utcTime + 3600000 * i);
};

_.getTimeZone = function (d, i) {
    if (typeof i === 'number') return i;
    return 0 - (d.getTimezoneOffset() / 60.0);
};

_.searchObjDate = function (o, i) {
    try {
        if (_.isObject(o) || _.isArray(o)) {
            _.each(o, function (a, b) {
                if (_.isObject(a) || _.isArray(a)) {
                    _.searchObjDate(o[b], i);
                } else {
                    if (_.isDate(a)) {
                        o[b] = _.formatDate(_.formatTimeZone(a, i));
                    }
                }
            });
        }
    } catch (err) {
        logger.warn(err);
    }
};

_.UUID = function () {
    var visitTime = (new Date())
        .getTime();
    var uuid = '' + String(Math.random())
        .replace('.', '')
        .slice(1, 11) + '-' + visitTime;
    return uuid;
};

_.UUIDv4 = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            // eslint-disable-next-line eqeqeq
            v = c === 'x' ? r : (r & 0x3 | 0x8);
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
        'TA-Integration-Count': '1',
        'TA-Integration-Extra': _.getMpPlatform()
    };
};

// remove spaces in AppId
_.checkAppId = function (appId) {
    if (!appId) return undefined;
    appId = appId.replace(/\s+/g, '');
    return appId;
};

// remove spaces, pathname (file name), other parameters in URL
_.checkUrl = function (url) {
    if (!url) return undefined;
    url = url.replace(/\s+/g, '');
    url = _.url('basic', url);
    return url;
};

_.url = (function () {
    function _t() {
        return new RegExp(/(.*?)\.?([^.]*?)\.(com|net|org|biz|ws|in|me|co\.uk|co|org\.uk|ltd\.uk|plc\.uk|me\.uk|edu|mil|br\.com|cn\.com|eu\.com|hu\.com|no\.com|qc\.com|sa\.com|se\.com|se\.net|us\.com|uy\.com|ac|co\.ac|gv\.ac|or\.ac|ac\.ac|af|am|as|at|ac\.at|co\.at|gv\.at|or\.at|asn\.au|com\.au|edu\.au|org\.au|net\.au|id\.au|be|ac\.be|adm\.br|adv\.br|am\.br|arq\.br|art\.br|bio\.br|cng\.br|cnt\.br|com\.br|ecn\.br|eng\.br|esp\.br|etc\.br|eti\.br|fm\.br|fot\.br|fst\.br|g12\.br|gov\.br|ind\.br|inf\.br|jor\.br|lel\.br|med\.br|mil\.br|net\.br|nom\.br|ntr\.br|odo\.br|org\.br|ppg\.br|pro\.br|psc\.br|psi\.br|rec\.br|slg\.br|tmp\.br|tur\.br|tv\.br|vet\.br|zlg\.br|br|ab\.ca|bc\.ca|mb\.ca|nb\.ca|nf\.ca|ns\.ca|nt\.ca|on\.ca|pe\.ca|qc\.ca|sk\.ca|yk\.ca|ca|cc|ac\.cn|net\.cn|com\.cn|edu\.cn|gov\.cn|org\.cn|bj\.cn|sh\.cn|tj\.cn|cq\.cn|he\.cn|nm\.cn|ln\.cn|jl\.cn|hl\.cn|js\.cn|zj\.cn|ah\.cn|gd\.cn|gx\.cn|hi\.cn|sc\.cn|gz\.cn|yn\.cn|xz\.cn|sn\.cn|gs\.cn|qh\.cn|nx\.cn|xj\.cn|tw\.cn|hk\.cn|mo\.cn|cn|cx|cz|de|dk|fo|com\.ec|tm\.fr|com\.fr|asso\.fr|presse\.fr|fr|gf|gs|co\.il|net\.il|ac\.il|k12\.il|gov\.il|muni\.il|ac\.in|co\.in|org\.in|ernet\.in|gov\.in|net\.in|res\.in|is|it|ac\.jp|co\.jp|go\.jp|or\.jp|ne\.jp|ac\.kr|co\.kr|go\.kr|ne\.kr|nm\.kr|or\.kr|li|lt|lu|asso\.mc|tm\.mc|com\.mm|org\.mm|net\.mm|edu\.mm|gov\.mm|ms|nl|no|nu|pl|ro|org\.ro|store\.ro|tm\.ro|firm\.ro|www\.ro|arts\.ro|rec\.ro|info\.ro|nom\.ro|nt\.ro|se|si|com\.sg|org\.sg|net\.sg|gov\.sg|sk|st|tf|ac\.th|co\.th|go\.th|mi\.th|net\.th|or\.th|tm|to|com\.tr|edu\.tr|gov\.tr|k12\.tr|net\.tr|org\.tr|com\.tw|org\.tw|net\.tw|ac\.uk|uk\.com|uk\.net|gb\.com|gb\.net|vg|sh|kz|ch|info|ua|gov|name|pro|ie|hk|com\.hk|org\.hk|net\.hk|edu\.hk|us|tk|cd|by|ad|lv|eu\.lv|bz|es|jp|cl|ag|mobi|eu|co\.nz|org\.nz|net\.nz|maori\.nz|iwi\.nz|io|la|md|sc|sg|vc|tw|travel|my|se|tv|pt|com\.pt|edu\.pt|asia|fi|com\.ve|net\.ve|fi|org\.ve|web\.ve|info\.ve|co\.ve|tel|im|gr|ru|net\.ru|org\.ru|hr|com\.hr|ly|xyz)$/);
    }

    function _d(s) {
        return _.decodeURIComponent(s.replace(/\+/g, ' '));
    }

    function _i(arg, str) {
        var sptr = arg.charAt(0);
        var split = str.split(sptr);
        if (sptr === arg) { return split; }
        arg = parseInt(arg.substring(1), 10);
        return split[arg < 0 ? split.length + arg : arg - 1];
    }

    function _f(arg, str) {
        var sptr = arg.charAt(0);
        var split = str.split('&');
        var field = [];
        var params = {};
        var tmp = [];
        var arg2 = arg.substring(1);

        for (var i = 0, ii = split.length; i < ii; i++) {
            field = split[i].match(/(.*?)=(.*)/);
            // TODO: regex should be able to handle this.
            if (!field) {
                field = [split[i], split[i], ''];
            }
            if (field[1].replace(/\s/g, '') !== '') {
                field[2] = _d(field[2] || '');
                // If we have a match just return it right away.
                if (arg2 === field[1]) { return field[2]; }
                // Check for array pattern.
                tmp = field[1].match(/(.*)\[([0-9]+)\]/);
                if (tmp) {
                    params[tmp[1]] = params[tmp[1]] || [];
                    params[tmp[1]][tmp[2]] = field[2];
                } else {
                    params[field[1]] = field[2];
                }
            }
        }
        if (sptr === arg) { return params; }
        return params[arg2];
    }

    return function (arg, url) {
        var _l = {}, tmp;
        if (arg === 'tld?') { return _t(); }
        url = url || window.location.toString();
        if (!arg) { return url; }
        arg = arg.toString();
        if (url.match(/^mailto:([^/].+)/)) {
            tmp = url.match(/^mailto:([^/].+)/);
            _l.protocol = 'mailto';
            _l.email = tmp[1];
        } else {
            // Ignore Hashbangs.
            if (url.match(/(.*?)\/#!(.*)/)) {
                tmp = url.match(/(.*?)\/#!(.*)/);
                url = tmp[1] + tmp[2];
            }
            // Hash.
            if (url.match(/(.*?)#(.*)/)) {
                tmp = url.match(/(.*?)#(.*)/);
                _l.hash = tmp[2];
                url = tmp[1];
            }
            // Return hash parts.
            if (_l.hash && arg.match(/^#/)) { return _f(arg, _l.hash); }
            // Query
            if (url.match(/(.*?)\?(.*)/)) {
                tmp = url.match(/(.*?)\?(.*)/);
                _l.query = tmp[2];
                url = tmp[1];
            }
            // Return query parts.
            if (_l.query && arg.match(/^\?/)) { return _f(arg, _l.query); }
            // Protocol.
            if (url.match(/(.*?):?\/\/(.*)/)) {
                tmp = url.match(/(.*?):?\/\/(.*)/);
                _l.protocol = tmp[1].toLowerCase();
                url = tmp[2];
            }
            // Path.
            if (url.match(/(.*?)(\/.*)/)) {
                tmp = url.match(/(.*?)(\/.*)/);
                _l.path = tmp[2];
                url = tmp[1];
            }
            // Clean up path.
            _l.path = (_l.path || '').replace(/^([^/])/, '/$1').replace(/\/$/, '');
            // Return path parts.
            if (arg.match(/^[-0-9]+$/)) { arg = arg.replace(/^([^/])/, '/$1'); }
            if (arg.match(/^\//)) { return _i(arg, _l.path.substring(1)); }
            // File.
            tmp = _i('/-1', _l.path.substring(1));
            if (tmp && (tmp = tmp.match(/(.*?)\.(.*)/))) {
                _l.file = tmp[0];
                _l.filename = tmp[1];
                _l.fileext = tmp[2];
            }
            // Port.
            if (url.match(/(.*):([0-9]+)$/)) {
                tmp = url.match(/(.*):([0-9]+)$/);
                _l.port = tmp[2];
                url = tmp[1];
            }
            // Auth.
            if (url.match(/(.*?)@(.*)/)) {
                tmp = url.match(/(.*?)@(.*)/);
                _l.auth = tmp[1];
                url = tmp[2];
            }
            // User and pass.
            if (_l.auth) {
                tmp = _l.auth.match(/(.*):(.*)/);

                _l.user = tmp ? tmp[1] : _l.auth;
                _l.pass = tmp ? tmp[2] : undefined;
            }
            // Hostname.
            _l.hostname = url.toLowerCase();
            // Return hostname parts.
            if (arg.charAt(0) === '.') { return _i(arg, _l.hostname); }
            // Domain, tld and sub domain.
            if (_t()) {
                tmp = _l.hostname.match(_t());
                if (tmp) {
                    _l.tld = tmp[3];
                    _l.domain = tmp[2] ? tmp[2] + '.' + tmp[3] : undefined;
                    _l.sub = tmp[1] || undefined;
                }
            }
            // Set port and protocol defaults if not set.
            var portInfo = _l.port ? ':' + _l.port : '';
            _l.protocol = _l.protocol || (window.location.protocol.replace(':', ''));
            // console.log(_l);
            _l.port = _l.port || (_l.protocol === 'https' ? '443' : '80');
            _l.protocol = _l.protocol || (_l.port === '443' ? 'https' : 'http');
            _l.basic = _l.protocol + '://' + _l.hostname + portInfo;
        }
        // Return arg.
        if (arg in _l) { return _l[arg]; }
        // Return everything.
        if (arg === '{}') { return _l; }
        // Default to undefined for no match.
        return '';
    };
})();

_.createString = function (length) {
    var expect = length;
    var str = Math.random().toString(36).substr(2);
    while (str.length < expect) {
        str += Math.random().toString(36).substr(2);
    }
    str = str.substr(0, length);
    return str;
};

_.createAesKey = function () {
    return _.createString(16);
};

_.generateEncryptyData = function (text, secretKey) {

    if (typeof secretKey === 'undefined') {
        return text;
    }

    var pkey = secretKey['publicKey'];
    var v = secretKey['version'];

    if (typeof pkey === 'undefined' || typeof v === 'undefined') {
        return text;
    }

    if (typeof CryptoJS === 'undefined' || typeof JSEncrypt === 'undefined') {
        return text;
    }
    var strKey = _.createAesKey();
    try {
        var key = CryptoJS.enc.Utf8.parse(strKey);
        var data = CryptoJS.enc.Utf8.parse(JSON.stringify(text));
        var padding = _.isUndefined(CryptoJS.pad.Pkcs7) ? CryptoJS.pad.PKCS7 : CryptoJS.pad.Pkcs7;
        var aesStr = CryptoJS.AES.encrypt(data, key, { mode: CryptoJS.mode.ECB, padding: padding }).toString();
        var encrypt = new JSEncrypt();
        encrypt.setPublicKey(pkey);
        var rsaStr = encrypt.encrypt(strKey);
        if (rsaStr === false) {
            logger.warn('Encryption failed, return the original data');
            return text;
        }
        return {
            pkv: v,
            ekey: rsaStr,
            payload: aesStr
        };
    } catch (e) {
        logger.warn('Encryption failed, return the original data: ' + e);
    }
    return text;
};

_.getUtm = function () {
    var params = {};
    _.each(utmTypes, function (kwkey) {
        try {
            var kw = _.getQueryParam(location.href, kwkey);
            if (kw.length) {
                params[kwkey] = kw;
            }
        } catch (e) {
            logger.warn('get utm fail: ' + e);
        }
    });
    return JSON.stringify(params);
};
/* eslint-disable */
_.getQueryParam = function (url, key) {
    key = key.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    url = _.decodeURIComponent(url);
    var regexS = '[\\?&]' + key + '=([^&#]*)',
        regex = new RegExp(regexS),
        results = regex.exec(url);
    if (results === null || (results && typeof results[1] !== 'string' && results[1].length)) {
        return '';
    } else {
        return _.decodeURIComponent(results[1]);
    }
};
/* eslint-enable */

_.getUtmFromQuery = function (query) {
    var params = {};
    _.each(utmTypes, function (kwkey) {
        if (query[kwkey]) {
            params[kwkey] = query[kwkey];
        }
    });
    return JSON.stringify(params);
};

_.indexOf = function (arr, target) {
    var indexof = arr.indexOf;
    if (indexof) {
        return indexof.call(arr, target);
    } else {
        for (var i = 0; i < arr.length; i++) {
            if (target === arr[i]) {
                return i;
            }
        }
        return -1;
    }
};
/* eslint-disable */
_.checkCalibration = function (properties, time, enableCalibrationTime) {
    // if(!enableCalibrationTime){
    //     return properties;
    // }
    // if (properties && properties['#time_calibration']) {
    //     return;
    // }
    // var pro = {};
    // var timeCalibration = 6;
    // if (enableCalibrationTime) {
    //     if (_.isDate(time)) {
    //         timeCalibration = 5;
    //     } else {
    //         timeCalibration = 3;
    //     }
    // }
    // return _.extend(pro,properties,{'#time_calibration':timeCalibration});
    return properties;
};
/* eslint-enable */

_.isClickType = function (type) {
    var mpTaps = {
        tap: 1,
        longpress: 1,
        longtap: 1
    };
    return mpTaps[type];
};

_.getCurrentTimeStamp = function () {
    return Date.now();
};

_.getCurrentDate = function () {
    return new Date(Date.now());
};

var logger = typeof logger === 'object' ? logger : {};
logger.info = function () {
    if (typeof console === 'object' && console.log && logger.enabled) {
        try {
            arguments[0] = '[ThinkingData] Info: ' + arguments[0];
            if (logger.listener) {
                logger.listener(arguments[0]);
            }
            return console.log.apply(console, arguments);
        } catch (e) {
            if (logger.listener) {
                logger.listener(arguments[0]);
            }
            console.log('[ThinkingData] Info: ' + arguments[0]);
        }
    }
};

logger.warn = function () {
    if (typeof console === 'object' && console.log && logger.enabled) {
        try {
            arguments[0] = '[ThinkingData] Warning: ' + arguments[0];
            return console.warn.apply(console, arguments);
        } catch (e) {
            console.warn('[ThinkingData] Warning: ' + arguments[0]);
        }
    }

};

export {
    _,
    logger,
    slice,
};
