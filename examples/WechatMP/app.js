//app.js
var TA = require('./utils/thinkingdata.wx.js');
var config = {
  appid: 'b2a61feb9e56472c90c5bcb320dfb4ef',
  // eslint-disable-next-line camelcase
  server_url: 'https://sdk.tga.thinkinggame.cn',
  autoTrack: {
    appLaunch: true, // 自动采集 ta_mp_launch
    appShow: true, // 自动采集 ta_mp_show
    appHide: true, // 自动采集 ta_mp_hide
    pageShow: true, // 自动采集 ta_mp_view
    pageShare: true, // 自动采集 ta_mp_share
  },
  name: 'ta', // 全局变量名称, 默认为 thinkingdata

}
var ta = new TA(config);

console.log(wx.getLaunchOptionsSync());

App({
  onLaunch: function () {
    ta.login('peng');
    ta.init();
    ta.track('test', { a: 1 });


    this.thinkingdata = ta;
  },
})

