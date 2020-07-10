
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

            //   // 以参数列表的形式传入回调
            // api.track('test', {testkey:123}, new Date(), (res) => {
            //     console.log('res [code]:' + res.code + ' [msg]:' + res.msg) 
            // });

            // // 以参数对象的形式传入回调
            // api.track({
            //     eventName: 'test', // 必填
            //     properties: {testkey: 123}, // 可选
            //     time: new Date(), // 可选
            //     onComplete: (res) => { 
            //         console.log('res [code]:' + res.code + ' [msg]:' + res.msg) 
            //     }, // 必填
            // });

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
            api.userAppend({ 'Element': [1, 2] });
            break;
        case 4:
            api.authorizeOpenID("authorizeOpenID");
            break;
        case 5:
            api.setDynamicSuperProperties(() => {
                var localDate = new Date();
                return {
                    utcTime: new Date(localDate.getTime() + (localDate.getTimezoneOffset() * 60000)),
                };
            });
            break;
        case 6:
            const deviceID = api.getDeviceId();
            console.log("deviceID:" + deviceID);
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