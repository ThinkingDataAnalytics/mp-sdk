import GameInstance from "./GameInstance";
import SoundManage from "./SoundManage";
import Sprite from "./framework/sprite";
import Stage from "./actors/Stage";
import SoundSwitch from "./actors/SoundSwitch";
import Cloud from "./actors/Cloud";
import Building from "./actors/Building.js";
import GameInfo from "./GameInfo.js";

export default class Main {
    constructor() {
        this.animationHandler = null;
        this.restart();
    }

    restart() {
        this.canvas = window.canvas;
        this.ctx = this.canvas.getContext("2d");
        this.gameInstance = new GameInstance();
        this.gameInstance.initGameInstance();
        this.soundManage = new SoundManage();
        this.bindLoop = this.mainLoop.bind(this);
        this.gameInfo = new GameInfo();
        this.building = new Building();

        this.stage = new Stage();

        this.touchStartHandler = this.onTouchStart.bind(this);

        qq.onTouchStart(this.touchStartHandler);

        this.start();
    }

    start() {
        if (this.animationHandler) {
            window.cancelAnimationFrame(this.animationHandler);
        }
        this.animationHandler = window.requestAnimationFrame(
            this.bindLoop,
            this.canvas
        );

        this.soundManage.playBackgroundMusic();

        this.stage.appendChild(
            new Sprite("resources/images/treeBg.png", {
                x: 0,
                y: window.innerHeight - (596 / 750) * window.innerWidth,
                height: (596 / 750) * window.innerWidth,
                width: window.innerWidth,
                zIndex: -50
            })
        );

        this.stage.appendChild(
            new Sprite("resources/images/treeFg.png", {
                x: 0,
                y: window.innerHeight - (172 / 750) * window.innerWidth,
                height: (172 / 750) * window.innerWidth,
                width: window.innerWidth,
                zIndex: -40
            })
        );

        this.stage.appendChild(new SoundSwitch());
        this.stage.appendChild(new Cloud(1));
        this.stage.appendChild(new Cloud(2));
        this.stage.appendChild(new Cloud(3));

        this.stage.appendChild(this.building);
    }

    update() {
        let { gameInstance, stage } = this;

        if (!gameInstance.gameRunning) {
            return;
        }

        stage.update();

        if (
            this.building.moveEnd &&
            !this.stage.isMoving &&
            this.gameInstance.gameRunning
        ) {
            this.building = new Building();
            this.stage.appendChild(this.building);
        }
    }
    render() {
        let { ctx, canvas, gameInstance, stage } = this;
        ctx.clearRect(0, 0, this.canvas.width, canvas.height);

        let waitingToBeRenderedActors = stage
            .getChildrenTraversing()
            .concat(stage);

        waitingToBeRenderedActors.sort((child1, child2) => {
            child1.zIndex = child1.zIndex || 0;
            child2.zIndex = child2.zIndex || 0;
            return child1.zIndex - child2.zIndex;
        });

        waitingToBeRenderedActors.forEach(actor => {
            actor.render(ctx);
        });

        this.gameInfo.renderGameScore(ctx, this.gameInstance.score);

        if (!gameInstance.gameRunning) {
            this.gameInfo.renderGameOver(ctx, this.gameInstance.score);
        }
    }

    onTouchStart({ touches, changedTouches, timeStamp }) {
        let { stage } = this;
        let actors = stage.getChildrenTraversing().concat(stage);

        if (!this.gameInstance.gameRunning) {
            qq.offTouchStart(this.touchStartHandler);
            this.restart();
            return;
        }

        actors.sort((child1, child2) => {
            child1.zIndex = child1.zIndex || 0;
            child2.zIndex = child2.zIndex || 0;
            return child2.zIndex - child1.zIndex;
        });

        for (let i = 0; i < actors.length; ++i) {
            let actor = actors[i];
            if (actor.isTouched(touches) && typeof actor.onTap === "function") {
                actor.onTap.bind(actor)([touches, changedTouches, timeStamp]);
                return;
            }
        }

        if (this.stage.isMoving) {
            return;
        }

        this.building.touchHandler();
    }

    mainLoop() {
        this.gameInstance.frame++;

        this.update();
        this.render();

        this.animationHandler = window.requestAnimationFrame(
            this.bindLoop,
            this.canvas
        );
    }
}
