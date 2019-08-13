// console.log('开发字节跳动小游戏过程中可以参考以下文档:')
// console.log('https://developer.toutiao.com/docs/game/');

require('./src/index');
var TA = require('./API/thinkingdata.mg.tt.js')

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
    name: 'ta',
};

GameGlobal.ta = new TA(config);

ta.init();
