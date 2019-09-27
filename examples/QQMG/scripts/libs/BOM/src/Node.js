import EventTarget from './EventTarget';

export default class Node extends EventTarget {
    constructor() {
        super();
        this.childNodes = [];
    }
    appendChild(node) {
        if (node instanceof Node) {
            this.childNodes.push(node);
        } else {
            throw new TypeError(`Failed to executed 'appendChild' on 'Node': parameter 1 is not of type 'Node'.`);
        }
    }
    cloneNode() {
        // TODO: 看情况是否要移除
        const copiedNode = Object.create(this);
        Object.assign(copiedNode, this);
        return copiedNode;
    }
    removeChild(node) {
        // TODO: 看情况是否要移除
        const index = this.childNodes.findIndex((child) => child === node);
        if (index > -1) {
            return this.childNodes.splice(index, 1);
        }
        return null;
    }
}