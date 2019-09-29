var TA = require('./utils/thinkingdata.my')

var config = {
    appid: 'b2a61feb9e56472c90c5bcb320dfb4ef',
    // eslint-disable-next-line camelcase
    server_url: 'https://sdk.tga.thinkinggame.cn',
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
