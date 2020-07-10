var app = getApp();

function track(event) {
  app.thinkingdata.track(event);
  //   // 以参数列表的形式传入回调
// app.thinkingdata.track('test', {testkey:123}, new Date(), (res) => {
//     console.log('res [code]:' + res.code + ' [msg]:' + res.msg) 
// });

// // 以参数对象的形式传入回调
// app.thinkingdata.track({
//     eventName: 'test', // 必填
//     properties: {testkey: 123}, // 可选
//     time: new Date(), // 可选
//     onComplete: (res) => { 
//         console.log('res [code]:' + res.code + ' [msg]:' + res.msg) 
//     }, // 必填
// });
}

function login(loginID) {
  app.thinkingdata.login(loginID);
}

function logout() {
  app.thinkingdata.logout();
}

function setSuperProperties(properties) {
  app.thinkingdata.setSuperProperties(properties);
}

function clearSuperProperties() {
  app.thinkingdata.clearSuperProperties();
}

function userSet(properties) {
  app.thinkingdata.userSet(properties);
}

function userSetOnce(properties) {
  app.thinkingdata.userSetOnce(properties);
}

function userAdd(properties) {
  app.thinkingdata.userAdd(properties);
}

function userDel() {
  app.thinkingdata.userDel();
}

function userAppend(properties) {
  app.thinkingdata.userAppend(properties);
}

function authorizeOpenID(authorizeOpenID) {
  app.thinkingdata.authorizeOpenID(authorizeOpenID);
}

function setDynamicSuperProperties(properties) {
  app.thinkingdata.setDynamicSuperProperties(properties);
}

function getDeviceID() {
  return  app.thinkingdata.getDeviceId();
}

module.exports = {
  track,
  login,
  logout,
  setSuperProperties,
  clearSuperProperties,
  userSet,
  userSetOnce,
  userAdd,
  userDel,
  userAppend,
  authorizeOpenID,
  setDynamicSuperProperties,
  getDeviceID
}
