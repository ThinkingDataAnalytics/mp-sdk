import Element from './Element';
import { notImplementedFunction } from './util/index';
import {
    innerWidth,
    innerHeight
} from './Window';

export default class HTMLElement extends Element {
    className = ''
    childern = []
    style = {
        width: `${innerWidth}px`,
        height: `${innerHeight}px`
    }

    insertBefore = notImplementedFunction;

    innerHTML = ''

    constructor(tagName = '') {
        super();
        this.tagName = tagName.toUpperCase();
    }

    setAttribute(name, value) {
        this[name] = value;
    }

    getAttribute(name) {
        return this[name];
    }

    get clientWidth() {
        console.warn('clientWidth is not implemented.');
        return 0;
        /* const ret = parseInt(this.style.fontSize, 10) * this.innerHTML.length;
        return Number.isNaN(ret) ? 0 : ret; */
    }

    get clientHeight() {
        console.warn('clientHeight is not implemented.');
        return 0;
        /* const ret = parseInt(this.style.fontSize, 10);
        return Number.isNaN(ret) ? 0 : ret; */
    }

    getBoundingClientRect() {
        return {
            top: 0,
            left: 0,
            width: innerWidth,
            height: innerHeight
        };
    }

    focus() {
        console.warn('focus is not implemented.');
    }
}