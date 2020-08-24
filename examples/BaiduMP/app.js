var TA = require('./thinkingdata.swan.js');
var config = {
    appid: 'e91da662ba4b4605b60cef0c7da342d0',
    server_url: 'https://receiver-ta-dev.thinkingdata.cn',
    autoTrack: {
       appLaunch: true,
       appShow: true,
       appHide: true,
       pageShow: true,
       pageShare: true
    },
    // debugMode: 'debug'
};

var ta = new TA(config)

App({
    onLaunch(options) {
        this.thinkingdata = ta
        this.thinkingdata.init()
    }
});
