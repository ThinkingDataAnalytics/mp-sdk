

const screenWidth  = window.innerWidth
const screenHeight = window.innerHeight

let buttonData = ["TRACK TEST_EVENT", "LOGIN", "LOGOUT", "SET USER_PROPERTIES", "SET AUTHORIZEOPENID"];
let layoutData = [];

let startX = 10;
let startY = 90;
let preOffsetY = 7;
let buttonWidth = screenWidth - startX * 2;
let buttonHeight = 40;

export default class demoScene
{
  constructor() {
    this.layout()
  }

  layout() {
    for (let i = 0; i < buttonData.length; i++) {
      let x = startX;
      let y = startY + i * (preOffsetY + buttonHeight);
      layoutData[i] = {"x":x, "y":y};
    }
  }

  layoutData() {
    return layoutData
  }

  buttonHeight() {
    return buttonHeight
  }

  renderDemo(context) {
    context.fillStyle = "#F8F8F8";
    context.fillRect(0, 0, screenWidth, screenHeight);
   
    let titleX = 20;
    let titleY = 40; 
    context.font = "20px Arial";
    context.fillStyle = "#000000";
    context.fillText("ThinkingDEMO", titleX, titleY);

    for (let i = 0; i < buttonData.length; i++ ) {
      context.fillStyle = "#ffffff";
      context.fillRect(layoutData[i]["x"], layoutData[i]["y"], buttonWidth, buttonHeight);

      context.font = "12px Arial";
      context.fillStyle = "#000000";
      context.fillText(buttonData[i], startX + 5, layoutData[i]["y"] + 25);
    }
  }
}
