import { TDAnalytics, TDConfig, TDMode, TDAutoTrackEventType, TDNetworkType } from '@thinkingdata/analytics';

function setCustomerLibInfo(param: string): void {
  try {
    let obj = JSON.parse(param)
    TDAnalytics.setCustomerLibInfo(obj['lib'], obj['version'])
  } catch (e) {
  }
}

function initWithConfig(param: string): void {
  try {
    let obj = JSON.parse(param)
    if (obj['enableLog'] === true) {
      TDAnalytics.enableLog(true)
    }
    let config = new TDConfig()
    config.appId = obj['appId']
    config.serverUrl = obj['serverUrl']
    TDAnalytics.initWithConfig(globalThis.appContext, config)
  } catch (e) {
  }
}

function track(param: string): void {
  try {
    let obj = JSON.parse(param)
    TDAnalytics.track({
      eventName: obj['eventName'],
      properties: obj['properties']
    }, obj['appId'])
  } catch (e) {
  }
}

function trackUpdate(param: string): void {
  try {
    let obj = JSON.parse(param)
    TDAnalytics.trackUpdate({
      eventName: obj['event']['eventName'],
      properties: obj['event']['properties'],
      eventId: obj['event']['eventId']
    }, obj['appId'])
  } catch (e) {
  }
}

function trackFirst(param: string): void {
  try {
    let obj = JSON.parse(param)
    TDAnalytics.trackFirst({
      eventName: obj['event']['eventName'],
      properties: obj['event']['properties'],
      firstCheckId: obj['event']['firstCheckId']
    }, obj['appId'])
  } catch (e) {
  }
}

function trackOverwrite(param: string): void {
  try {
    let obj = JSON.parse(param)
    TDAnalytics.trackOverwrite({
      eventName: obj['event']['eventName'],
      properties: obj['event']['properties'],
      eventId: obj['event']['eventId']
    }, obj['appId'])
  } catch (e) {
  }
}

function timeEvent(param: string): void {
  try {
    let obj = JSON.parse(param)
    TDAnalytics.timeEvent(obj['eventName'], obj['appId'])
  } catch (e) {
  }
}

function login(param: string): void {
  try {
    let obj = JSON.parse(param)
    TDAnalytics.login(obj['accountId'], obj['appId'])
  } catch (e) {
  }
}

function logout(param: string): void {
  TDAnalytics.logout(param)
}

function setSuperProperties(param: string): void {
  try {
    let obj = JSON.parse(param)
    TDAnalytics.setSuperProperties(obj['properties'], obj['appId'])
  } catch (e) {
  }
}

function getSuperProperties(param: string): string {
  return TDAnalytics.getSuperProperties(param)
}

function unsetSuperProperty(param: string): void {
  try {
    let obj = JSON.parse(param)
    TDAnalytics.unsetSuperProperty(obj['property'], obj['appId'])
  } catch (e) {
  }
}

function clearSuperProperties(param: string): void {
  TDAnalytics.clearSuperProperties(param)
}

function userSet(param: string): void {
  try {
    let obj = JSON.parse(param)
    TDAnalytics.userSet({
      properties: obj['properties'],
    }, obj['appId'])
  } catch (e) {
  }
}

function userSetOnce(param: string): void {
  try {
    let obj = JSON.parse(param)
    TDAnalytics.userSetOnce({
      properties: obj['properties'],
    }, obj['appId'])
  } catch (e) {
  }
}

function userAppend(param: string): void {
  try {
    let obj = JSON.parse(param)
    TDAnalytics.userAppend({
      properties: obj['properties'],
    }, obj['appId'])
  } catch (e) {
  }
}

function userUniqAppend(param: string): void {
  try {
    let obj = JSON.parse(param)
    TDAnalytics.userUniqAppend({
      properties: obj['properties'],
    }, obj['appId'])
  } catch (e) {
  }
}

function userAdd(param: string): void {
  try {
    let obj = JSON.parse(param)
    TDAnalytics.userAdd({
      properties: obj['properties'],
    }, obj['appId'])
  } catch (e) {
  }
}

function userUnset(param: string): void {
  try {
    let obj = JSON.parse(param)
    TDAnalytics.userUnset({
      property: obj['property'],
    }, obj['appId'])
  } catch (e) {
  }
}

function userDel(param: string): void {
  TDAnalytics.userDelete({}, param)
}

function flush(param: string): void {
  TDAnalytics.flush(param)
}

function setDistinctId(param: string): void {
  try {
    let obj = JSON.parse(param)
    TDAnalytics.setDistinctId(obj['distinctId'], obj['appId'])
  } catch (e) {
  }
}

function getDeviceId(param: string): string {
  return TDAnalytics.getDeviceId(param)
}

function getDistinctId(param: string): string {
  return TDAnalytics.getDistinctId(param)
}

function getAccountId(param: string): string {
  return TDAnalytics.getAccountId(param)
}

function getPresetProperties(param: string) {
  return TDAnalytics.getPresetProperties(param)
}


export {
  setCustomerLibInfo,
  initWithConfig,
  track,
  trackUpdate,
  trackFirst,
  trackOverwrite,
  timeEvent,
  login,
  logout,
  setSuperProperties,
  getSuperProperties,
  unsetSuperProperty,
  clearSuperProperties,
  userSet,
  userSetOnce,
  userAppend,
  userUniqAppend,
  userAdd,
  userUnset,
  userDel,
  flush,
  setDistinctId,
  getDeviceId,
  getDistinctId,
  getAccountId,
  getPresetProperties
}