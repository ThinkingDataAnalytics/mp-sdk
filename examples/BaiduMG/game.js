require('./src/index');
var TA = require('./thinkingdata.mg.swan.js')

var config = {
    appid: 'b2a61feb9e56472c90c5bcb320dfb4ef',
    // eslint-disable-next-line camelcase
    server_url: 'https://sdk.tga.thinkinggame.cn',
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

