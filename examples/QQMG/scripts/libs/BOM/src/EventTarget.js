const _eventsList = new WeakMap();

export default class EventTarget {
    constructor() {
        _eventsList.set(this, {});
    }

    addEventListener(type, listener, params = {}) {
        let useCapture;
        let options;
        if (typeof params === 'boolean') {
            useCapture = params;
        }
        if (typeof params === 'object') {
            options = params;
        }

        let events = _eventsList.get(this);

        if (!events) {
            events = {};
            _eventsList.set(this, events);
        }

        if (!events[type]) {
            events[type] = [];
        }

        events[type].push(listener);

        if (typeof useCapture === 'boolean' ||
            typeof options.capture === 'boolean') {
            console.warn('useCapture or options.capture is not implemented.');
        }

        if (typeof options.once === 'boolean') {
            console.warn('EventTarget.addEventListener: options.once is not implemented.');
        }

        if (typeof options.passive === 'boolean') {
            console.warn('EventTarget.addEventListener: options.passive is not implemented.');
        }
    }

    removeEventListener(type, listener) {
        const listeners = _eventsList.get(this)[type];

        if (listeners && listeners.length > 0) {
            for (let i = listeners.length; i--; i > 0) {
                if (listeners[i] === listener) {
                    listeners.splice(i, 1);
                    break;
                }
            }
        }
    }

    dispatchEvent(event = {}) {
        const listeners = _eventsList.get(this)[event.type];

        if (listeners) {
            for (let i = 0; i < listeners.length; i++) {
                listeners[i](event);
            }
        }
    }
}