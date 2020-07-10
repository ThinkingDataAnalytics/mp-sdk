//index.js

const api = require('../../API/ThinkingAnalyticsAPI.js')
const app = getApp()

//var Page = app.thinkingdata.Page;

Page({
  onShareAppMessage(object){
    console.log('shared');
  },
  track() {
    api.track("test");
  },
  login() {
    api.login("mini_user");
  },
  logout() {
    api.logout();
  },
  superProperties() {
    api.setSuperProperties({ "superkey": "supervalue", "superkey2": "supervalue2" });
  },
  clearProperties() {
    api.clearSuperProperties();
  },
  userSet() {
    api.userSet({"level":26, "age":18});
    api.userSetOnce({"cost":-30});
    api.userAdd({"level":2});
    api.userDel();
    api.userAppend({ 'Elements': [1, 2] });
  },
  authorizeOpenID() {
    api.authorizeOpenID('authorizeOpenID');
  },
  setDynamicSuperProperties() {
    api.setDynamicSuperProperties(() => {
      var localDate = new Date();
      return {
          utcTime: new Date(localDate.getTime() + (localDate.getTimezoneOffset() * 60000)),
      };
    });
  },
  getDeviceID(){
    const deviceID = api.getDeviceID();
    console.log("deviceID:" + deviceID);
  },
  onLoad: function(options) {
  }
})
