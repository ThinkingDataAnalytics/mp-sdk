var TA = require('./utils/thinkingdata.tt.js');
var conf = {
    appid: 'e91da662ba4b4605b60cef0c7da342d0',
    server_url: 'https://receiver-ta-dev.thinkingdata.cn',
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
