// import './js/libs/weapp-adapter'
// import './js/libs/symbol'
import './scripts/libs/BOM/index';
import './scripts/libs/symbol/index';
import Main from './scripts/main';
var TA = require('./scripts/thinkingdata.mg.qq.js');

var config = {
    appid: 'e91da662ba4b4605b60cef0c7da342d0',
    server_url: 'https://receiver-ta-dev.thinkingdata.cn',
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

let main = new Main();