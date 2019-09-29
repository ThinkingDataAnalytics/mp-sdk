import {
    _
} from './utils';
import {
    PlatformAPI
} from './platform/PlatformAPI';

class HttpTask {
    constructor(data, serverUrl, tryCount, timeout, callback) {
        this.data = data;
        this.serverUrl = serverUrl;
        this.callback = callback;
        this.tryCount = _.isNumber(tryCount) ? tryCount : 1;
        this.timeout = _.isNumber(timeout) ? timeout : 3000;
    }

    run() {
        // eslint-disable-next-line no-undef
        var request = PlatformAPI.request({
            url: this.serverUrl,
            method: 'POST',
            data: this.data,
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

class SenderQueue {
    constructor() {
        this.items = [];
        this.isRunning = false;
    }

    enqueue(data, serverUrl, config) {
        var element = new HttpTask(JSON.stringify(data), serverUrl, config.maxRetries, config.sendTimeout, (res) => {
            this.isRunning = false;
            if (_.isFunction(config.callback)) {
                config.callback(res);
            }
            this._runNext();
        });
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
