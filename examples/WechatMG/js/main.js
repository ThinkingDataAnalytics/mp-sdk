import DemoScene from 'scene'
var TA = require('utils/thinkingdata.mg.wx.js');

let ctx = canvas.getContext('2d')

export default class Main {
  constructor() {
    this.initSDK()
    this.start()
  }

  //初始化SDK
  initSDK() {
    var config = {
      appid: 'b2a61feb9e56472c90c5bcb320dfb4ef',
      // eslint-disable-next-line camelcase
      server_url: 'https://sdk.tga.thinkinggame.cn',
      sendTimeout: 3000,
      maxRetries: 1,
      autoTrack: {
        appShow: true,
        appHide: true,
      },
      name: 'ta',
    };

    GameGlobal.ta = new TA(config);
    ta.init();
  }

  start() {
    this.scene = new DemoScene()
    this.scene.renderDemo(ctx)

    this.touchHandler = this.touchEventHandler.bind(this)
    canvas.addEventListener('touchstart', this.touchHandler)
  }

  touchEventHandler(e) {
    let y = e.touches[0].clientY
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
        ta.login("mg_user");
        break;
      case 2:
        ta.logout();
        break;
      case 3:
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
        break;
      case 4:
        ta.authorizeOpenID("authorizeOpenID");
        break;
      default:
        break;
    }
  }
}