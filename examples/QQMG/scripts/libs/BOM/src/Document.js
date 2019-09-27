import HTMLElement from './HTMLElement';
import Image from './Image';
import Audio from './Audio';
import Canvas from './Canvas';

export default class Document extends HTMLElement {
    createElement(tagName) {
        switch (tagName) {
            case 'canvas':
                return new Canvas();
            case 'audio':
                return new Audio();
            case 'img':
                return new Image();
            default:
                return new HTMLElement('tagName');
        }
    }
}