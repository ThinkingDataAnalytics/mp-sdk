
var app = getApp();

Page({
  onLoad(query) {
    // 页面加载
    console.info(`Page onLoad with query: ${JSON.stringify(query)}`);
  },
  onReady() {
    // 页面加载完成
  },
  onShow() {
    // 页面显示
  },
  onHide() {
    // 页面隐藏
  },
  onUnload() {
    // 页面被关闭
  },
  onTitleClick() {
    // 标题被点击
  },
  onPullDownRefresh() {
    // 页面被下拉
  },
  onReachBottom() {
    // 页面被拉到底部
  },
  onShareAppMessage() {
    // 返回自定义分享信息
    return {
      title: 'My App',
      desc: 'My App description',
      path: 'pages/index/index',
    };
  },
  track(event) {
    var date = new Date();
    date.setHours(10);
    getApp().thinkingdata.track("test_event", {prop_int: 5, prop_string: 'hello test', prop_date:date});

    //   // 以参数列表的形式传入回调
    // getApp().thinkingdata.track('test', {testkey:123}, new Date(), (res) => {
    //     console.log('res [code]:' + res.code + ' [msg]:' + res.msg) 
    // });

    // // 以参数对象的形式传入回调
    // getApp().thinkingdata.track({
    //     eventName: 'test', // 必填
    //     properties: {testkey: 123}, // 可选
    //     time: new Date(), // 可选
    //     onComplete: (res) => { 
    //         console.log('res [code]:' + res.code + ' [msg]:' + res.msg) 
    //     }, // 必填
    // });
  },
  login() {
    getApp().thinkingdata.login("my_user");
  },
  logout() {
    getApp().thinkingdata.logout();
  },
  superProperties() {
    getApp().thinkingdata.setSuperProperties({ "super_prop_string": "supervalue", "super_prop_int": 567 });
  },
  clearProperties() {
    getApp().thinkingdata.clearSuperProperties();
  },
  userSet() {
    getApp().thinkingdata.userSet({"level":26, "age":18});
    getApp().thinkingdata.userSetOnce({"cost":-30});
    getApp().thinkingdata.userAdd({"level":2});
    getApp().thinkingdata.userDel();
  },
  authorizeOpenID() {
    getApp().thinkingdata.authorizeOpenID('myOpenID');
  },
});
