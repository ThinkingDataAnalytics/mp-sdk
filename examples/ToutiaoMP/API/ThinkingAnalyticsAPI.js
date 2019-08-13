var app = getApp();

function track(event) {
  app.thinkingdata.track(event);
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

function authorizeOpenID(authorizeOpenID) {
  app.thinkingdata.authorizeOpenID(authorizeOpenID);
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
  authorizeOpenID
}
