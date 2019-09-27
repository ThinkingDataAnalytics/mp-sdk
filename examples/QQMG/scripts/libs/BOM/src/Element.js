import Node from './Node';

export default class Element extends Node {
    className = ''

    constructor() {
        super();
        this.children = [];
    }
}