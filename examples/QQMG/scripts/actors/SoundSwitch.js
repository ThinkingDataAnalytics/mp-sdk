import Sprite from "../framework/sprite";
import SoundManage from "../SoundManage";

const _soundManage = new SoundManage();
const SOUND_SWITCH_TOP = 80;

export default class Stage extends Sprite {
    constructor() {
        super("resources/images/soundOn.png", {
            height: 45,
            width: 45,
            x: window.innerWidth - 60,
            y: SOUND_SWITCH_TOP,
            zIndex: 10000
        });

        let switchConfig = qq.getStorageSync("SOUND_SWITCH") || "on";
        this._soundOn = switchConfig === "on";

        if (this._soundOn) {
            this.img.src = "resources/images/soundOn.png";
        } else {
            this.img.src = "resources/images/soundOff.png";
        }
    }
    onTap() {
        this._soundOn = !this._soundOn;
        if (this._soundOn) {
            this._soundOn = true;
            this.img.src = "resources/images/soundOn.png";
            qq.setStorageSync("SOUND_SWITCH", "on");
            _soundManage.playBackgroundMusic();
        } else {
            this._soundOn = false;
            this.img.src = "resources/images/soundOff.png";
            qq.setStorageSync("SOUND_SWITCH", "off");
            _soundManage.pauseBackgroundMusic();
        }
    }
    update() {
        if (this.parent) {
            this.y = SOUND_SWITCH_TOP - this.parent.y;
        }
    }
}
