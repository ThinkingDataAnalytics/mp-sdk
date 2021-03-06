import {
    _,
    logger
} from './utils';

import PlatformAPI from './PlatformAPI';

class HttpTask {
    constructor(data, serverUrl, tryCount, timeout, callback) {
        this.data = data;
        this.serverUrl = serverUrl;
        this.callback = callback;
        this.tryCount = _.isNumber(tryCount) ? tryCount : 1;
        this.timeout = _.isNumber(timeout) ? timeout : 3000;
    }

    run() {
        var headers = _.createExtraHeaders();
        headers['content-type'] = 'application/json';
        // eslint-disable-next-line no-undef
        var request = PlatformAPI.request({
            url: this.serverUrl,
            method: 'POST',
            data: this.data,
            header: headers,
            success: (res) => {
                this.onSuccess(res);
            },
            fail: (res) => {
                this.onFailed(res);
            }
        });
        setTimeout(function () {
            if ((_.isObject(request) || _.isPromise(request)) && _.isFunction(request.abort)) {
                request.abort();
            }
        }, this.timeout);
    }

    onSuccess(res) {
        if (res.statusCode === 200) {
            let msg;
            switch (res.data.code) {
                case 0: msg = 'success'; break;
                case -1: msg = 'invalid data'; break;
                case -2: msg = 'invalid APP ID'; break;
                default: msg = 'Unknown return code';
            }
            this.callback({
                code: res.data.code,
                msg,
            });
        } else {
            this.callback({
                code: -3,
                msg: res.statusCode,
            });
        }
    }

    onFailed(res) {
        if (--this.tryCount > 0) {
            this.run();
        } else {
            this.callback({
                code: -3,
                msg: res.errMsg,
            });
        }
    }
}

class HttpTaskDebug {
    constructor(data, serverDebugUrl, tryCount, timeout, dryrun, deviceId, callback) {
        this.data = data;
        this.serverDebugUrl = serverDebugUrl;
        this.callback = callback;
        this.tryCount = _.isNumber(tryCount) ? tryCount : 1;
        this.timeout = _.isNumber(timeout) ? timeout : 3000;
        this.dryrun = dryrun;
        this.deviceId = deviceId;
    }

    run() {
        var debugData = 'appid=' + this.data['#app_id'] + '&source=client&dryRun=' + this.dryrun + '&deviceId=' + this.deviceId + '&data=' + encodeURIComponent(JSON.stringify(this.data['data'][0]));
        var headers = _.createExtraHeaders();
        headers['content-type'] = 'application/x-www-form-urlencoded';
        // eslint-disable-next-line no-undef
        var request = PlatformAPI.request({
            url: this.serverDebugUrl,
            method: 'POST',
            data: debugData,
            header: headers,
            success: (res) => {
                this.onSuccess(res);
            },
            fail: (res) => {
                this.onFailed(res);
            }
        });
        setTimeout(function () {
            if ((_.isObject(request) || _.isPromise(request)) && _.isFunction(request.abort)) {
                request.abort();
            }
        }, this.timeout);
    }

    onSuccess(res) {
        if (res.statusCode === 200) {
            var msg;
            if (res.data['errorLevel'] === 0) {
                msg = 'Verify data success.';
            } else if (res.data['errorLevel'] === 1) {
                var errorProperties = res.data['errorProperties'];
                var errorStr = '';
                for (var i = 0; i < errorProperties.length ; i++) {
                    var errorReasons = errorProperties[i]['errorReason'];
                    var propertyName = errorProperties[i]['propertyName'];
                    errorStr = errorStr + ' propertyName:' + propertyName + ' errorReasons:' + errorReasons + '\n';
                }
                msg = 'Debug data error. errorLevel:' + res.data['errorLevel'] + ' reason:' + errorStr;
            } else if (res.data['errorLevel'] === 2 || res.data['errorLevel'] === -1) {
                msg = 'Debug data error. errorLevel:' + res.data['errorLevel'] + ' reason:' + res.data['errorReasons'];
            }
            logger.info(msg);

            this.callback({
                code: res.data['errorLevel'],
                msg: msg
            });
        } else {
            this.callback({
                code: -3,
                msg: res.statusCode
            });
        }
    }

    onFailed(res) {
        if (--this.tryCount > 0) {
            this.run();
        } else {
            this.callback({
                code: -3,
                msg: res.errMsg,
            });
        }
    }
}

class SenderQueue {
    constructor() {
        this.items = [];
        this.isRunning = false;
        this.showDebug = false;
    }

    enqueue(data, serverUrl, config) {
        var element;
        var that = this;
        if (config.debugMode === 'debug') {
            element = new HttpTaskDebug(data, serverUrl, config.maxRetries, config.sendTimeout, 0, config.deviceId, (res) => {
                that.isRunning = false;
                if (_.isFunction(config.callback)) {
                    config.callback(res);
                }
                that._runNext();
                if (that.showDebug === false) {
                    if (res.code === 0 || res.code === 1 || res.code === 2) {
                        that.showDebug = true;
                        // eslint-disable-next-line no-undef
                        if (_.isFunction(PlatformAPI.showDebugToast)) {
                            // eslint-disable-next-line no-undef
                            PlatformAPI.showDebugToast('当前为 debug 模式');
                        }
                    }
                }
            });
        } else if (config.debugMode === 'debugOnly') {
            element = new HttpTaskDebug(data, serverUrl, config.maxRetries, config.sendTimeout, 1, config.deviceId, (res) => {
                that.isRunning = false;
                if (_.isFunction(config.callback)) {
                    config.callback(res);
                }
                that._runNext();
                if (that.showDebug === false) {
                    if (res.code === 0 || res.code === 1 || res.code === 2) {
                        that.showDebug = true;
                        // eslint-disable-next-line no-undef
                        if (_.isFunction(PlatformAPI.showDebugToast)) {
                            // eslint-disable-next-line no-undef
                            PlatformAPI.showDebugToast('当前为 debugOnly 模式');
                        }
                    }
                }
            });
        } else {
            element = new HttpTask(JSON.stringify(data), serverUrl, config.maxRetries, config.sendTimeout, (res) => {
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

    _dequeue() {
        return this.items.shift();
    }

    _runNext() {
        if (this.items.length > 0 && !this.isRunning) {
            this.isRunning = true;
            this._dequeue()
                .run();
        }
    }
}


var senderQueue = new SenderQueue();
export default senderQueue;
