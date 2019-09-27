import Sprite from '../framework/sprite';
import SoundManage from '../SoundManage';

const _soundManage = new SoundManage();
const SOUND_SWITCH_TOP = 60;

export default class Cloud extends Sprite {
    constructor(cloudStyle) {
        let imagePath;
        let styles;
        switch (cloudStyle) {
            case 1:
                imagePath = 'resources/images/cloud1.png';
                styles = {
                    height: 82,
                    width: 200,
                    zIndex: -5001
                };
                break;
            case 2:
                imagePath = 'resources/images/cloud2.png';
                styles = {
                    height: 78,
                    width: 188,
                    zIndex: -5002
                };
                break;
            case 3:
                imagePath = 'resources/images/cloud3.png';
                styles = {
                    height: 80,
                    width: 261,
                    zIndex: -5003
                };
                break;
        }
        styles.x = 0;
        styles.height /= 2;
        styles.width /= 2;
        styles.x = styles.width * -1 - 200 * Math.random();
        styles.y = (window.innerHeight * 0.1) + (Math.random() * window.innerHeight * 0.5);

        super(imagePath, styles);

        this.moveSpeed = 0.5 + Math.random();
    }
    update() {
        this.x += this.moveSpeed;
        if (this.x > window.innerWidth) {
            this.x = this.width * -1;
            this.y = (window.innerHeight * 0.1) + (Math.random() * window.innerHeight * 0.5);
            this.moveSpeed = 0.5 + Math.random();
        }
    }
    beforeRender(ctx) {
        ctx.globalAlpha = 0.8;
    }
    afterRender(ctx) {
        ctx.globalAlpha = 1;
    }
}