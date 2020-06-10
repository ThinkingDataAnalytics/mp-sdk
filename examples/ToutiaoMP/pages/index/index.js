
const api = require('../../API/ThinkingAnalyticsAPI.js')
const app = getApp()

Page({
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
    api.userAppend({ 'Element': [1, 2] });

  },
  authorizeOpenID() {
    api.authorizeOpenID('authorizeOpenID');
  }
})
