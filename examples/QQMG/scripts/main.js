
import DemoScene from 'scene'

export default class Main {
    constructor() {
        this.animationHandler = null;
        this.restart();
    }

    restart() {
        this.canvas = window.canvas;
        this.ctx = this.canvas.getContext("2d");

        this.scene = new DemoScene()
        this.scene.renderDemo(this.ctx)

        this.touchStartHandler = this.onTouchStart.bind(this);

        qq.onTouchStart(this.touchStartHandler);
    }

    onTouchStart({ touches, changedTouches, timeStamp }) {
        let y = touches[0].clientY
        var layoutData = this.scene.layoutData()
        for (let i = 0; i < layoutData.length; i++) {
        if (y > layoutData[i].y && y < layoutData[i].y + this.scene.buttonHeight()) {
            this.buttonClick(i);
            break;
            }
        }
    }

    buttonClick(buttonKey) {
        switch (buttonKey) {
        case 0:
            ta.track("test");
            //   // 以参数列表的形式传入回调
            // ta.track('test', {testkey:123}, new Date(), (res) => {
            //     console.log('res [code]:' + res.code + ' [msg]:' + res.msg) 
            // });

            // // 以参数对象的形式传入回调
            // ta.track({
            //     eventName: 'test', // 必填
            //     properties: {testkey: 123}, // 可选
            //     time: new Date(), // 可选
            //     onComplete: (res) => { 
            //         console.log('res [code]:' + res.code + ' [msg]:' + res.msg) 
            //     }, // 必填
            // });
            break;
        case 1:
            ta.trackUpdate({
                eventName: 'test', // 必填
                properties: {testkey: 234}, // 可选
                eventId:'2', // 必填
                onComplete: (res) => { 
                    console.log('trackUpdate res [code]:' + res.code + ' [msg]:' + res.msg) 
                },
            });
            break;
        case 1:
            ta.trackUpdate({
                eventName: 'test', // 必填
                properties: {testkey: 234}, // 可选
                eventId:'2', // 必填
                onComplete: (res) => { 
                    console.log('trackUpdate res [code]:' + res.code + ' [msg]:' + res.msg) 
                },
            });
            break;
        case 2:
            ta.trackOverwrite({
                eventName: 'test', // 必填
                properties: {testkey: 234}, // 可选
                eventId:'2', // 必填
                onComplete: (res) => { 
                    console.log('trackUpdate res [code]:' + res.code + ' [msg]:' + res.msg) 
                },
            });
            break;
        case 3:
            ta.trackFirstEvent({
                eventName: 'test', // 必填
                properties: {testkey: 234}, // 可选
                firstCheckId:'2', // 必填
                onComplete: (res) => { 
                    console.log('trackUpdate res [code]:' + res.code + ' [msg]:' + res.msg) 
                },
            });
            break;
        case 4:
            ta.login("mg_user");
            break;
        case 5:
            ta.logout();
            break;
        case 6:
            ta.userSet({
            "level": 26,
            "age": 18
            });
            ta.userSetOnce({
            "cost": -30
            });
            ta.userAdd({
            "level": 2
            });
            ta.userDel();
            ta.userAppend({ 'Element': [1, 2] });
            break;
        case 7:
            ta.authorizeOpenID("authorizeOpenID");
            break;
        case 8:
            ta.setDynamicSuperProperties(() => {
            var localDate = new Date();
            return {
                utcTime: new Date(localDate.getTime() + (localDate.getTimezoneOffset() * 60000)),
            };
            });
            break;
        case 9:
            const deviceID = ta.getDeviceId();
            console.log("deviceID:" + deviceID);
        default:
            break;
        }
    }
}
