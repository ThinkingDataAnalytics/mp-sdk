var TA = require('./utils/thinkingdata.tt.js');
var conf = {
    appid: 'b2a61feb9e56472c90c5bcb320dfb4ef',
    // eslint-disable-next-line camelcase
    server_url: 'https://sdk.tga.thinkinggame.cn',
    //max_string_length: 100,
    //is_plugin: true,
    //name:'ta',
    /*autoTrack:  {
      appLaunch: true,
      appShow: true,
      appHide: true,
      pageShow: true,
      pageShare: true,
      allow_share_info: true,
    },*/
    //name: 'ta',
};

var ta = new TA(conf)

App({
  onLaunch: function () {
    this.thinkingdata = ta;
    this.thinkingdata.init();
  }
})
