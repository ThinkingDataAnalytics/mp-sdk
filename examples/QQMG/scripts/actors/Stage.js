import Sprite from '../framework/sprite';

const MOVE_DOWN_SPEED = 1;

export default class Stage extends Sprite {
    constructor() {
        super('', {
            height: window.innerHeight,
            width: window.innerWidth,
            zIndex: -10000
        });
        this.down = true;
        this.top = 0;

        this.isMoving = false;
        this.moveDistance = 0;
        this.haveMoved = 0;
    }

    update() {
        if (this.top >= 0.5) {
            this.down = false;
        }
        if (this.top <= 0) {
            this.down = true;
        }
        if (this.down) {
            this.top += 0.01;
        } else {
            this.top -= 0.01;
        }
        if (this.top > 0.5) this.top = 0.5;
        if (this.top < 0) this.top = 0;

        if (this.isMoving) {
            this.moveDown();
        }

        this.children.forEach(child => {
            if (typeof child.update === 'function') {
                child.update();
            }
        });
    }
    render(ctx) {
        let grd = ctx.createLinearGradient(0, 0, 0, this.height);
        grd.addColorStop(this.top, '#D37B3F');
        grd.addColorStop(1, '#78C1CD');

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, this.width, this.height);
    }

    moveDown() {
        if (this.haveMoved + MOVE_DOWN_SPEED >= this.moveDistance) {
            // 结束平移
            this.y += (this.moveDistance - this.haveMoved);
            this.isMoving = false;
            this.haveMoved = 0;
        } else {
            this.y += MOVE_DOWN_SPEED;
            this.haveMoved += MOVE_DOWN_SPEED;
        }
    }
}