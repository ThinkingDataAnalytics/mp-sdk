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

  // // 以参数列表的形式传入回调
  // thinkingdata.track('test', {testkey:123}, new Date(), (res) => {
  //     console.log('res [code]:' + res.code + ' [msg]:' + res.msg) 
  // })
  
  // // 以参数对象的形式传入回调
  // thinkingdata.track({
  //   eventName: 'test', // 必填
  //   properties: {testkey: 123}, // 可选
  //   time: new Date(), // 可选
  //   onComplete: (res) => { 
  //     console.log('res [code]:' + res.code + ' [msg]:' + res.msg) 
  //   }, // 必填
  // })
}

function trackUpdate() {
  thinkingdata.trackUpdate({
    eventName: 'test', // 必填
    properties: {testkey: 234}, // 可选
    eventId:'2', // 必填
    onComplete: (res) => { 
      console.log('trackUpdate res [code]:' + res.code + ' [msg]:' + res.msg) 
    },
  })
}

function trackOverwrite() {
  thinkingdata.trackOverwrite({
    eventName: 'test', // 必填
    properties: {testkey: 345}, // 可选
    eventId:'4', // 必填
    onComplete: (res) => { 
      console.log('trackOverwrite res [code]:' + res.code + ' [msg]:' + res.msg) 
    },
  })
}

function trackFirstEvent() {
  thinkingdata.trackFirstEvent({
    eventName: 'test', // 必填
    properties: {testkey: 123}, // 可选
    firstCheckId:'3', // 必填
    onComplete: (res) => { 
      console.log('trackFirstEvent res [code]:' + res.code + ' [msg]:' + res.msg) 
    },
  })
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

function userAppend(properties) {
  thinkingdata.userAppend(properties)
}

function authorizeOpenID(authorizeOpenID) {
  thinkingdata.authorizeOpenID(authorizeOpenID)
}

function setDynamicSuperProperties(dynamicProperties) {
  thinkingdata.setDynamicSuperProperties(dynamicProperties);
}

function getDeviceID() {
  return  thinkingdata.getDeviceId();
}

module.exports = {
  init,
  track,
  trackUpdate,
  trackFirstEvent,
  trackOverwrite,
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
  TAPage,
  setDynamicSuperProperties,
  getDeviceID
}
