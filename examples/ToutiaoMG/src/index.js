
import DemoScene from './scene.js'

let canvas = tt.createCanvas();
let ctx = canvas.getContext('2d');
var scene = new DemoScene()


start()

function start() {
  scene.renderDemo(ctx)
}

tt.onTouchStart(touchEventHandler);

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
      ta.track("test");
      break;
    case 1:
      ta.login("mg_user");
      break;
    case 2:
      ta.logout();
      break;
    case 3:
      ta.userSet({ "level": 26, "age": 18 });
      ta.userSetOnce({ "cost": -30 });
      ta.userAdd({ "level": 2 });
      ta.userDel();
      break;
    case 4:
      ta.authorizeOpenID("authorizeOpenID");
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