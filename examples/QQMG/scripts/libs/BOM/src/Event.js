import { notImplementedFunction } from './util/index';

export default class Event {
    cancelBubble = false
    cancelable = false
    target = null
    timestampe = Date.now()
    preventDefault = notImplementedFunction
    stopPropagation = notImplementedFunction

    constructor(type) {
        this.type = type;
    }
}