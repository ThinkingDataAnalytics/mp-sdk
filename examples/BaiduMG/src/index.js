
import DemoScene from './scene.js'

let canvas = swan.createCanvas();
let ctx = canvas.getContext('2d');
var scene = new DemoScene()


start()


function start() {
    scene.renderDemo(ctx)
}

swan.onTouchStart(touchEventHandler);

function touchEventHandler(e) {
    let pos = getMousePos(e.touches[0]);
    let y = pos.y;
    var layoutData = scene.layoutData()
    for (let i = 0; i < layoutData.length; i++) {
        if (y > layoutData[i].y && y < layoutData[i].y + scene.buttonHeight()) {
            buttonClick(i);
            break;
        }
    }
}

function buttonClick(buttonKey) {
    switch (buttonKey) {
        case 0:
            api.track("test");
            break;
        case 1:
            api.login("mg_user");
            break;
        case 2:
            api.logout();
            break;
        case 3:
            api.userSet({ "level": 26, "age": 18 });
            api.userSetOnce({ "cost": -30 });
            api.userAdd({ "level": 2 });
            api.userDel();
            break;
        case 4:
            api.authorizeOpenID("authorizeOpenID");
            break;
        default:
            break;
    }
}

function getMousePos(evt) {
    return {
        x: evt.clientX,
        y: evt.clientY
    };
}