// console.log('开发字节跳动小游戏过程中可以参考以下文档:')
// console.log('https://developer.toutiao.com/docs/game/');

require('./src/index');
var TA = require('./API/thinkingdata.mg.tt.js')

var config = {
    appid: 'e91da662ba4b4605b60cef0c7da342d0',
    server_url: 'https://receiver-ta-dev.thinkingdata.cn',
    sendTimeout: 3000,
    maxRetries: 1,
    /*autoTrack: {
       appShow: true,
       appHide: true,
    },*/
    name: 'ta',
};

GameGlobal.ta = new TA(config);

ta.init();
