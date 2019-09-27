import Sprite from  './sprite';
import GameInstance from '../gameInstance';

let gameInstance = new GameInstance();

const timer = Symbol('timer');

export default class Animation extends Sprite {
    constructor(src, width, height) {
        super(src, {
            width, height
        });

        this.isPlaying = false;
        this.loop = false;
        this.interval = 1000 / 60;
        this[timer] = null;
        this.currentFrameIndex = -1;
        this.frameLength = 0;
        this.frames = [];
        gameInstance.animations.push(this);
    }
}