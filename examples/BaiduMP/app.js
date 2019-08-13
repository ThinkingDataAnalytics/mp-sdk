var TA = require('./thinkingdata.swan.js');
var config = {
    appid: 'b2a61feb9e56472c90c5bcb320dfb4ef',
    // eslint-disable-next-line camelcase
    server_url: 'https://sdk.tga.thinkinggame.cn',
    autoTrack: {
       appLaunch: true,
       appShow: true,
       appHide: true,
       pageShow: true,
       pageShare: true
    }
};

var ta = new TA(config)

App({
    onLaunch(options) {
        this.thinkingdata.init()
    }
});
