
import Pool from './framework/pool';

let _gameInstance;


export default class GameInstance {
    constructor() {
        if (_gameInstance) {
            return _gameInstance;
        }

        _gameInstance = this;

        this.pool = new Pool();

        this.initGameInstance();
    }

    initGameInstance() {
        this.frame = 0;
        this.score = 0;
        this.cards = [];
        this.bottomHeight = window.innerHeight - 20;  // 基底高度
        this.moveDistance = 0;  // 画面视角移动的距离
        this.buildings = [];
        this.animations = [];
        this.gameRunning = true;
    }

    removeCard(card) {
        card.visible = false;
        this.pool.recycle('cards', card);
    }
}