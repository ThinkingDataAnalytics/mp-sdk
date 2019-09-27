// import './js/libs/weapp-adapter'
// import './js/libs/symbol'
import './scripts/libs/BOM/index';
import './scripts/libs/symbol/index';
import Main from './scripts/main';
var TA = require('./scripts/thinkingdata.mg.qq.js');

var config = {
    appid: 'YOU-APP-ID',
    server_url: 'https://sdk.tga.thinkinggame.cn',
    autoTrack: {
       appShow: true, // 自动采集 ta_mg_show
       appHide: true, // 自动采集 ta_mg_hide
    },
    name: 'ta', // 全局变量名称, 默认为 thinkingdata
};

// 创建 TA 实例，如果开启自动采集，则TA实例将自动创建，可不是调用以下初始化代码，直接使用SDK实例
GameGlobal.ta = new TA(config);
ta.init();
ta.track('test');

let main = new Main();