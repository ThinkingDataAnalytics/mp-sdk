import Sprite from '../framework/sprite.js';
import GameInstance from '../GameInstance.js';
import SoundManager from '../SoundManage.js';

let soundManager = new SoundManager();

const screenWidth   = window.innerWidth;
const screenHeight  = window.innerHeight;

const BUILDING_IMG_SRC = 'resources/images/f1.png';
const BUILDING_WIDTH   = 150;
const BUILDING_HEIGHt  = 60;

const MAX_WIDTH = 200;
const MIN_WIDTH = 80;

const MOVE_SPEED = 500 / 60;
const CHANGE_WIDTH_SPEED = BUILDING_WIDTH / 100;
const CHANGE_HEIGHT_SPEED = BUILDING_HEIGHt / 100;

const THRESHOLD_VALUE = 0.03 // 判定建筑大小的容错阈值

let gameInstance = new GameInstance();

export default class Building extends Sprite {
    constructor() {
        super(BUILDING_IMG_SRC, {
            width: BUILDING_WIDTH,
            height: BUILDING_HEIGHt,
            x: screenWidth / 2 - BUILDING_WIDTH / 2,
            y: 50 - gameInstance.moveDistance
        });

        this.isMoving = false;
        this.moveEnd = false;
        this.getBigger = true;
    }

    touchHandler(e) {
        if (!this.isMoving) {
            soundManager.playTouchMusic();
            this.isMoving = true;
        }
    }

    move() {
        if (this.y + MOVE_SPEED + this.height > gameInstance.bottomHeight) {
            // 落到下一个建筑物上就停止
            this.y = gameInstance.bottomHeight - this.height;
            soundManager.playDownMusic();
            if (gameInstance.buildings.length > 0 && this.width > (1 + THRESHOLD_VALUE) * gameInstance.buildings[gameInstance.buildings.length - 1].width) {
                // 游戏结束
                gameInstance.gameRunning = false;
                soundManager.playOverMusic();
            } else {
                // 游戏继续
                gameInstance.bottomHeight -= this.height;
                gameInstance.buildings.push(this);
                gameInstance.score++;

                // 如果堆叠的建筑物过高需要将舞台向下平移
                if (gameInstance.moveDistance + gameInstance.bottomHeight < 400) {
                    this.parent.isMoving = true;
                    this.parent.moveDistance = 400 - (gameInstance.moveDistance + gameInstance.bottomHeight);
                    gameInstance.moveDistance += this.parent.moveDistance;
                }
            }

            this.isMoving = false;
            this.moveEnd = true;

        } else {
            this.y += MOVE_SPEED;
        }
    }

    changeWidth() {
        if (this.width > MAX_WIDTH) {
            this.getBigger = false;
        }
        if (this.width < MIN_WIDTH) {
            this.getBigger = true;
        }

        if (this.getBigger) {
            this.width += CHANGE_WIDTH_SPEED;
            this.height += CHANGE_HEIGHT_SPEED;
            this.x -= CHANGE_WIDTH_SPEED / 2;
            this.y -= CHANGE_HEIGHT_SPEED / 2;
        } else {
            this.width -= CHANGE_WIDTH_SPEED;
            this.height -= CHANGE_HEIGHT_SPEED;
            this.x += CHANGE_WIDTH_SPEED / 2;
            this.y += CHANGE_HEIGHT_SPEED / 2;
        }

        if (this.width < 0) this.width = 0;
        if (this.height < 0) this.height = 0;
    }

    update() {
        if (this.isMoving) {
            this.move();
        } else if (!this.moveEnd) {
            this.changeWidth();
        }
    }
}
