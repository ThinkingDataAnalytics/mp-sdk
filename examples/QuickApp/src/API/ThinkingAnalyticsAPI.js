import {TAGloble} from '../utils/thinkingdata.quick.js'
var thinkingdata = TAGloble.thinkingdata

function TAPage() {
  return TAGloble.TAPage
}

function init() {
  thinkingdata.init()
}

function track(event) {
  thinkingdata.track(event)
}

function login(loginID) {
  thinkingdata.login(loginID)
}

function logout() {
  thinkingdata.logout()
}

function setSuperProperties(properties) {
  thinkingdata.setSuperProperties(properties)
}

function clearSuperProperties() {
  thinkingdata.clearSuperProperties()
}

function userSet(properties) {
  thinkingdata.userSet(properties)
}

function userSetOnce(properties) {
  thinkingdata.userSetOnce(properties)
}

function userAdd(properties) {
  thinkingdata.userAdd(properties)
}

function userDel() {
  thinkingdata.userDel()
}

function authorizeOpenID(authorizeOpenID) {
  thinkingdata.authorizeOpenID(authorizeOpenID)
}

module.exports = {
  init,
  track,
  login,
  logout,
  setSuperProperties,
  clearSuperProperties,
  userSet,
  userSetOnce,
  userAdd,
  userDel,
  authorizeOpenID,
  TAPage
}
