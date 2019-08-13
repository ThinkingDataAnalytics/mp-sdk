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
            success: () => {
                this.onSuccess();
            },
            fail: () => {
                this.onFailed();
            }
        });
        setTimeout(function () {
            if (_.isObject(request) && _.isFunction(request.abort)) {
                request.abort();
            }
        }, this.timeout);
    }

    onSuccess() {
        this.callback();
    }

    onFailed() {
        if (--this.tryCount > 0) {
            this.run();
        } else {
            this.callback();
        }
    }
}

class SenderQueue {
    constructor() {
        this.items = [];
        this.isRunning = false;
    }

    enqueue(data, serverUrl, config) {
        var element = new HttpTask(JSON.stringify(data), serverUrl, config.maxRetries, config.sendTimeout, () => {
            this.isRunning = false;
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
