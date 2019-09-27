let _soundManage;

export default class SoundManage {
    constructor() {
        if (_soundManage) {
            return _soundManage;
        }

        _soundManage = this;

        this.backgroundAudio = new Audio();
        this.backgroundAudio.loop = true;
        this.backgroundAudio.src = "resources/sounds/bgm.mp3";

        this.touchAudio = new Audio();
        this.touchAudio.src = "resources/sounds/touch.mp3";

        this.downAudio = new Audio();
        this.downAudio.src = "resources/sounds/down.mp3";

        this.overAudio = new Audio();
        this.overAudio.src = "resources/sounds/over.mp3";

        if (!qq.getStorageSync("SOUND_SWITCH")) {
            try {
                qq.setStorageSync("SOUND_SWITCH", "on");
            } catch (e) {
                console.log(e);
            }
        }
    }

    playBackgroundMusic() {
        if (qq.getStorageSync("SOUND_SWITCH") === "on")
            this.backgroundAudio.play();
    }

    pauseBackgroundMusic() {
        this.backgroundAudio.pause();
    }

    playTouchMusic() {
        if (qq.getStorageSync("SOUND_SWITCH") === "on") this.touchAudio.play();
    }

    playDownMusic() {
        if (qq.getStorageSync("SOUND_SWITCH") === "on") this.downAudio.play();
    }

    playOverMusic() {
        if (qq.getStorageSync("SOUND_SWITCH") === "on") this.overAudio.play();
    }
}
