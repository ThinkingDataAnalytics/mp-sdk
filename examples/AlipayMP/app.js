var TA = require('./utils/thinkingdata.my')

var config = {
    appid: 'e91da662ba4b4605b60cef0c7da342d0',
    server_url: 'https://receiver-ta-dev.thinkingdata.cn',
    autoTrack: {
       appLaunch: true,
       appShow: true,
       appHide: true,
       pageShow: true,
       pageShare: true
    }
};

var ta = new TA(config);

App({
  onLaunch(options) {
    // 第一次打开
    // options.query == {number:1}
    this.thinkingdata = ta
    ta.identify('alitestid');
    ta.init();

    ta.track('test_event');

    // 子实例
    ta.initInstance('tt',{enablePersistence:true});
    ta.tt.track('testt')

    console.info('App onLaunch');
  },
  onShow(options) {
    // 从后台被 scheme 重新打开
    // options.query == {number:1}
  },
});
