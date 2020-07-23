require('./src/index');
var TA = require('./thinkingdata.mg.swan.js')

var config = {
    appid: 'e91da662ba4b4605b60cef0c7da342d0',
    server_url: 'https://receiver-ta-dev.thinkingdata.cn',
    sendTimeout: 3000,
    maxRetries: 1,
    /*autoTrack: {
       appShow: true,
       appHide: true,
    },*/
    name: 'api',
};

GameGlobal.api = new TA(config);

api.init();

