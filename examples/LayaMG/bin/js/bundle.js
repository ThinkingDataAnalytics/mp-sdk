(function () {
    'use strict';

    function e(t){return (e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(t)}function t(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function n(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i);}}function i(e,t,i){return t&&n(e.prototype,t),i&&n(e,i),e}var s={},r=Array.prototype,a=Object.prototype,o=r.slice,c=a.toString,u=Object.prototype.hasOwnProperty,p=r.forEach,l=Array.isArray,f={};s.each=function(e,t,n){if(null==e)return !1;if(p&&e.forEach===p)e.forEach(t,n);else if(e.length===+e.length){for(var i=0,s=e.length;i<s;i++)if(i in e&&t.call(n,e[i],i,e)===f)return !1}else for(var r in e)if(u.call(e,r)&&t.call(n,e[r],r,e)===f)return !1},s.extend=function(e){return s.each(o.call(arguments,1),(function(t){for(var n in t)void 0!==t[n]&&(e[n]=t[n]);})),e},s.extend2Layers=function(e){return s.each(o.call(arguments,1),(function(t){for(var n in t)void 0!==t[n]&&(s.isObject(t[n])&&s.isObject(e[n])?s.extend(e[n],t[n]):e[n]=t[n]);})),e},s.isArray=l||function(e){return "[object Array]"===c.call(e)},s.isFunction=function(e){try{return "function"==typeof e}catch(e){return !1}},s.isPromise=function(e){return "[object Promise]"===c.call(e)&&null!==e},s.isObject=function(e){return "[object Object]"===c.call(e)&&null!==e},s.isEmptyObject=function(e){if(s.isObject(e)){for(var t in e)if(u.call(e,t))return !1;return !0}return !1},s.isUndefined=function(e){return void 0===e},s.isString=function(e){return "[object String]"===c.call(e)},s.isDate=function(e){return "[object Date]"===c.call(e)},s.isBoolean=function(e){return "[object Boolean]"===c.call(e)},s.isNumber=function(e){return "[object Number]"===c.call(e)&&/[\d\.]+/.test(String(e))},s.isJSONString=function(e){try{JSON.parse(e);}catch(e){return !1}return !0},s.decodeURIComponent=function(e){var t="";try{t=decodeURIComponent(e);}catch(n){t=e;}return t},s.encodeDates=function(e){return s.each(e,(function(t,n){s.isDate(t)?e[n]=s.formatDate(t):s.isObject(t)&&(e[n]=s.encodeDates(t));})),e},s.formatDate=function(e){function t(e){return e<10?"0"+e:e}return e.getFullYear()+"-"+t(e.getMonth()+1)+"-"+t(e.getDate())+" "+t(e.getHours())+":"+t(e.getMinutes())+":"+t(e.getSeconds())+"."+((n=e.getMilliseconds())<100&&n>9?"0"+n:n<10?"00"+n:n);var n;},s.searchObjDate=function(e){try{(s.isObject(e)||s.isArray(e))&&s.each(e,(function(t,n){s.isObject(t)||s.isArray(t)?s.searchObjDate(e[n]):s.isDate(t)&&(e[n]=s.formatDate(t));}));}catch(e){h.warn(e);}},s.UUID=function(){var e=(new Date).getTime();return String(Math.random()).replace(".","").slice(1,11)+"-"+e},s.UUIDv4=function(){return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,(function(e){var t=16*Math.random()|0;return ("x"==e?t:3&t|8).toString(16)}))};var h="object"===e(h)?h:{};h.info=function(){if("object"===("undefined"==typeof console?"undefined":e(console))&&console.log&&h.enabled)try{return console.log.apply(console,arguments)}catch(e){console.log(arguments[0]);}},h.warn=function(){if("object"===("undefined"==typeof console?"undefined":e(console))&&console.log&&h.enabled)try{return console.warn.apply(console,arguments)}catch(e){console.warn(arguments[0]);}};var d,m=/^[a-zA-Z][a-zA-Z0-9_]{0,49}$/,y=function(){function e(){t(this,e);}return i(e,null,[{key:"stripProperties",value:function(e){return s.isObject(e)?(s.each(e,(function(e,t){s.isString(e)||s.isNumber(e)||s.isDate(e)||s.isBoolean(e)||s.isArray(e)||h.warn("您的数据-",t,e,"-格式不满足要求，可能无法正确入库");})),e):e}},{key:"_checkPropertiesKey",value:function(e){var t=!0;return s.each(e,(function(e,n){m.test(n)||(h.warn("不合法的 KEY 值: "+n),t=!1);})),t}},{key:"event",value:function(e){return !(!s.isString(e)||!m.test(e))||(h.warn("请检查参数格式, eventName 必须是英文字母开头, 包含字母和数字和下划线的不超过50个字符的字符串: "+e),!1)}},{key:"propertyName",value:function(e){return !(!s.isString(e)||!m.test(e))||(h.warn("请检查参数格式, propertyName 必须是英文字母开头, 包含字母和数字和下划线的不超过50个字符的字符串: "+e),!1)}},{key:"properties",value:function(e){return this.stripProperties(e),!e||(s.isObject(e)?!!this._checkPropertiesKey(e)||(h.warn("请检查参数格式, properties 的 key 只能以字母开头，包含数字、字母和下划线 _，长度最大为50个字符"),!1):(h.warn("properties 可以没有，但有的话必须是对象"),!1))}},{key:"propertiesMust",value:function(e){return this.stripProperties(e),void 0===e||!s.isObject(e)||s.isEmptyObject(e)?(h.warn("properties必须是对象且有值"),!1):!!this._checkPropertiesKey(e)||(h.warn("请检查参数格式, properties 的 key 只能以字母开头，包含数字、字母和下划线 _，长度最大为50个字符"),!1)}},{key:"userId",value:function(e){return !(!s.isString(e)||!/^.{1,64}$/.test(e))||(h.warn("用户 id 必须是不能为空，且小于 64 位的字符串"),!1)}},{key:"userAddProperties",value:function(e){if(!this.propertiesMust(e))return !1;for(var t in e)if(!s.isNumber(e[t]))return h.warn("userAdd 的属性需要为数值类型"),!1;return !0}},{key:"userAppendProperties",value:function(e){if(!this.propertiesMust(e))return !1;for(var t in e)if(!s.isArray(e[t]))return h.warn("userAppend 的属性需要为 Array 类型"),!1;return !0}}]),e}(),g="1.5.1",v="MG",_=!1,k=function e(n,i,s){var r=this;t(this,e),this.taInstance=n,GameGlobal[this.taInstance.name]=n,this.config=i||{};var a=s.getLaunchOptionsSync();a&&a.scene&&this.taInstance._setAutoTrackProperties({"#scene":a.scene}),s.onShow((function(e){r.config.appHide&&r.taInstance.timeEvent("ta_mg_hide"),e&&e.scene&&r.taInstance._setAutoTrackProperties({"#scene":e.scene}),r.config.appShow&&r.taInstance._internalTrack("ta_mg_show");})),s.onHide((function(){r.config.appHide&&r.taInstance._internalTrack("ta_mg_hide");}));},S=function e(n,i){var s=this;t(this,e),this.taInstance=n,this.config=i||{},this.config.appShow&&this.taInstance._internalTrack("ta_mg_show"),this.config.appHide&&this.taInstance.timeEvent("ta_mg_hide"),qg.onShow((function(){s.config.appHide&&s.taInstance.timeEvent("ta_mg_hide"),s.config.appShow&&s.taInstance._internalTrack("ta_mg_show");})),qg.onHide((function(){s.config.appHide&&s.taInstance._internalTrack("ta_mg_hide");}));},w=function e(n,i){var s=this;t(this,e),this.taInstance=n,this.config=i||{},this.config.appShow&&this.taInstance._internalTrack("ta_mg_show"),this.config.appHide&&this.taInstance.timeEvent("ta_mg_hide"),qg.onShow((function(){s.config.appHide&&s.taInstance.timeEvent("ta_mg_hide"),s.config.appShow&&s.taInstance._internalTrack("ta_mg_show");})),qg.onHide((function(){s.config.appHide&&s.taInstance._internalTrack("ta_mg_hide");}));},b=new(function(){function e(){t(this,e);}return i(e,[{key:"getStorage",value:function(e){qg.getStorage({key:e.key,success:function(t){var n={};n.data=t,e.success(n);},fail:function(){e.fail({});}});}},{key:"setStorage",value:function(e){qg.setStorage({key:e.key,value:e.data});}},{key:"getSystemInfo",value:function(e){qg.getSystemInfo({success:function(t){var n=t,i=[t.osType,t.osVersionName].join(" ");n.brand=t.manufacturer,n.system=i,e.success(n);},complete:function(){e.complete();}});}},{key:"getNetworkType",value:function(e){qg.getNetworkType({success:function(t){var n=t;n.networkType=t.type,e.success(n);},complete:function(){e.complete();}});}},{key:"onNetworkStatusChange",value:function(e){qg.subscribeNetworkStatus({callback:function(t){var n=t;n.networkType=t.type,e(n);}});}},{key:"request",value:function(e){return qg.request({url:e.url,data:e.data,method:e.method,header:{"content-type":"application/json"},success:function(t){e.success(t);},fail:function(t){e.fail(t);}})}}]),e}()),I=new(function(){function e(){t(this,e);}return i(e,[{key:"getStorageSync",value:function(e){return localStorage.getItem(e)}},{key:"setStorage",value:function(e){localStorage.setItem(e.key,e.data);}},{key:"getSystemInfo",value:function(e){qg.getSystemInfo({success:function(t){e.success(t);},complete:function(){e.complete();}});}},{key:"getNetworkType",value:function(e){qg.getNetworkType({success:function(t){e.success(t);},complete:function(){e.complete();}});}},{key:"onNetworkStatusChange",value:function(e){qg.onNetworkStatusChange({callback:function(t){e(t);}});}},{key:"request",value:function(e){var t=new XMLHttpRequest;return t.setRequestHeader("content-type","application/json"),t.open(e.method,e.url),t.onreadystatechange=function(){if(4===t.readyState&&200===t.status){var n={statusCode:200};s.isJSONString(t.responseText)&&(n.data=JSON.parse(t.responseText)),e.success(n);}},t.ontimeout=function(){var t={errMsg:"timeout"};e.fail(t);},t.send(e.data),t}},{key:"getLaunchOptionsSync",value:function(){return qg.getLaunchOptionsSync()}}]),e}()),D=function(){function e(){t(this,e);}return i(e,null,[{key:"init",value:function(e){Laya.Browser.onMiniGame?(d=wx,e.persistenceName="thinkingdata_wechat_game",e.asyncPersistence=!1):Laya.Browser.onBDMiniGame?(d=swan,e.persistenceName="thinkingdata_swan_game",e.asyncPersistence=!1):Laya.Browser.onVVMiniGame?(d=b,e.persistenceName="thinkingdata_qg_vivo_game",e.asyncPersistence=!0):Laya.Browser.onQQMiniGame?(d=qq,e.persistenceName="thinkingdata_qq_game",e.asyncPersistence=!1):Laya.Browser.onQGMiniGame&&(d=I,e.persistenceName="thinkingdata_qg_oppo_game",e.asyncPersistence=!1);}},{key:"getStorage",value:function(e,t,n){if(!t){var i=d.getStorageSync(e);return s.isJSONString(i)?JSON.parse(i):{}}d.getStorage({key:e,success:function(e){var t=s.isJSONString(e.data)?JSON.parse(e.data):{};n(t);},fail:function(){h.warn("getStorage faild"),n({});}});}},{key:"setStorage",value:function(e,t){d.setStorage({key:e,data:t});}},{key:"getSystemInfo",value:function(e){d.getSystemInfo({success:function(t){Laya.Browser.onMiniGame?t.mp_platform="wechat":Laya.Browser.onBDMiniGame?t.mp_platform=t.host:Laya.Browser.onVVMiniGame?t.mp_platform="vivo_qg":Laya.Browser.onQQMiniGame?t.mp_platform="qq":Laya.Browser.onQGMiniGame&&(t.mp_platform="oppo_qg"),e.success(t);},complete:function(){e.complete();}});}},{key:"getNetworkType",value:function(e){d.getNetworkType({success:function(t){e.success(t);},complete:function(){e.complete();}});}},{key:"onNetworkStatusChange",value:function(e){d.onNetworkStatusChange(e);}},{key:"request",value:function(e){return d.request(e)}},{key:"initAutoTrackInstance",value:function(e,t){return s.isObject(t.autoTrack)&&(t.autoTrack.isPlugin=t.is_plugin),Laya.Browser.onMiniGame||Laya.Browser.onBDMiniGame||Laya.Browser.onQQMiniGame?new k(e,t.autoTrack,d):Laya.Browser.onVVMiniGame?new S(e,t.autoTrack,d):Laya.Browser.onQGMiniGame?new w(e,t.autoTrack,d):void 0}},{key:"getAppOptions",value:function(e){var t={};try{t=d.getLaunchOptionsSync();}catch(e){h.warn("Cannot get launch options.");}if(s.isFunction(e)&&s.isFunction(d.onShow))try{d.onShow(e);}catch(e){h.warn("Cannot register onAppShow callback.");}return t}}]),e}(),P=function(){function e(n,i,r,a,o){t(this,e),this.data=n,this.serverUrl=i,this.callback=o,this.tryCount=s.isNumber(r)?r:1,this.timeout=s.isNumber(a)?a:3e3;}return i(e,[{key:"run",value:function(){var e=this,t=D.request({url:this.serverUrl,method:"POST",data:this.data,success:function(t){e.onSuccess(t);},fail:function(t){e.onFailed(t);}});setTimeout((function(){(s.isObject(t)||s.isPromise(t))&&s.isFunction(t.abort)&&t.abort();}),this.timeout);}},{key:"onSuccess",value:function(e){if(200===e.statusCode){var t;switch(e.data.code){case 0:t="success";break;case-1:t="invalid data";break;case-2:t="invalid APP ID";break;default:t="Unknown return code";}this.callback({code:e.data.code,msg:t});}else this.callback({code:-3,msg:e.statusCode});}},{key:"onFailed",value:function(e){--this.tryCount>0?this.run():this.callback({code:-3,msg:e.errMsg});}}]),e}(),x=new(function(){function e(){t(this,e),this.items=[],this.isRunning=!1;}return i(e,[{key:"enqueue",value:function(e,t,n){var i=this,r=new P(JSON.stringify(e),t,n.maxRetries,n.sendTimeout,(function(e){i.isRunning=!1,s.isFunction(n.callback)&&n.callback(e),i._runNext();}));this.items.push(r),this._runNext();}},{key:"_dequeue",value:function(){return this.items.shift()}},{key:"_runNext",value:function(){this.items.length>0&&!this.isRunning&&(this.isRunning=!0,this._dequeue().run());}}]),e}()),O={name:"thinkingdata",is_plugin:!1,maxRetries:3,sendTimeout:3e3,enablePersistence:!0,asyncPersistence:_,enableLog:!0,strict:!1},q={properties:{"#lib":v,"#lib_version":g},initDeviceId:function(e){s.isString(e)&&(this.properties["#device_id"]=e);},getSystemInfo:function(e){var t=this;D.onNetworkStatusChange((function(e){t.properties["#network_type"]=e.networkType;})),D.getNetworkType({success:function(e){t.properties["#network_type"]=e.networkType;},complete:function(){D.getSystemInfo({success:function(e){var n={"#manufacturer":e.brand,"#device_model":e.model,"#screen_width":Number(e.screenWidth),"#screen_height":Number(e.screenHeight),"#os":e.system.split(" ")[0],"#os_version":e.system.split(" ")[1],"#mp_platform":e.mp_platform};s.extend(t.properties,n);},complete:function(){e();}});}});}},T=function(){function n(e,i){var r=this;t(this,n),this.enabled=e.enablePersistence,this.enabled?(e.isChildInstance?this.name=e.persistenceName+"_"+e.name:this.name=e.persistenceName,e.asyncPersistence?(this._state={},D.getStorage(this.name,!0,(function(t){r._state=s.extend2Layers({},t,r._state),r._init(e,i),r._save();}))):(this._state=D.getStorage(this.name)||{},this._init(e,i))):(this._state={},this._init(e,i));}return i(n,[{key:"_init",value:function(e,t){this.getDistinctId()||this.setDistinctId(s.UUID()),e.isChildInstance||(this.getDeviceId()||this._setDeviceId(s.UUID()),q.initDeviceId(this.getDeviceId())),this.initComplete=!0,"function"==typeof t&&t(),this._save();}},{key:"_save",value:function(){this.enabled&&this.initComplete&&D.setStorage(this.name,JSON.stringify(this._state));}},{key:"_set",value:function(t,n){var i,r=this;"string"==typeof t?(i={})[t]=n:"object"===e(t)&&(i=t),s.each(i,(function(e,t){r._state[t]=e;})),this._save();}},{key:"setEventTimer",value:function(e,t){var n=this._state.event_timers||{};n[e]=t,this._set("event_timers",n);}},{key:"removeEventTimer",value:function(e){var t=(this._state.event_timers||{})[e];return s.isUndefined(t)||(delete this._state.event_timers[e],this._save()),t}},{key:"getDeviceId",value:function(){return this._state.device_id}},{key:"_setDeviceId",value:function(e){this.getDeviceId()?h.warn("cannot modify the device id."):this._set("device_id",e);}},{key:"getDistinctId",value:function(){return this._state.distinct_id}},{key:"setDistinctId",value:function(e){this._set("distinct_id",e);}},{key:"getAccountId",value:function(){return this._state.account_id}},{key:"setAccountId",value:function(e){this._set("account_id",e);}},{key:"getSuperProperties",value:function(){return this._state.props||{}}},{key:"setSuperProperties",value:function(e,t){var n=t?e:s.extend(this.getSuperProperties(),e);this._set("props",n);}}]),n}(),N=function(){function e(n){t(this,e),s.isObject(n)?this.config=s.extend({},O,n):this.config=O,D.init(this.config),this._init(this.config);}return i(e,[{key:"_init",value:function(e){var t=this;if(this.name=e.name,this.appId=e.appid||e.appId,this.serverUrl=e.server_url+"/sync_xcx",this.autoTrackProperties={},this._queue=[],e.isChildInstance)this._state={};else if(h.enabled=e.enableLog,this.instances=[],this._state={getSystemInfo:!1,initComplete:!1},q.getSystemInfo((function(){t._updateState({getSystemInfo:!0});})),e.autoTrack)this.autoTrack=D.initAutoTrackInstance(this,e);else{var n=D.getAppOptions((function(e){e&&e.scene&&t._setAutoTrackProperties({"#scene":e.scene});}));n.scene&&this._setAutoTrackProperties({"#scene":n.scene});}this.store=new T(e,(function(){t.config.asyncPersistence&&s.isFunction(t.config.persistenceComplete)&&t.config.persistenceComplete(t),t._updateState();}));}},{key:"initInstance",value:function(t,n){if(this.config.isChildInstance)h.warn("initInstance() cannot be called on child instance");else if(s.isString(t)&&t!==this.name&&s.isUndefined(this[t])){var i=new e(s.extend({},this.config,{enablePersistence:!1,isChildInstance:!0,name:t},n));this[t]=i,this.instances.push(t),this[t]._state=this._state;}else h.warn("initInstance() failed due to the name is invalid: "+t);}},{key:"lightInstance",value:function(e){return this[e]}},{key:"_setAutoTrackProperties",value:function(e){s.extend(this.autoTrackProperties,e);}},{key:"init",value:function(){if(this._state.initComplete)return !1;this._updateState({initComplete:!0});}},{key:"_isReady",value:function(){return this._state.getSystemInfo&&this._state.initComplete&&this.store.initComplete&&this.getDeviceId()}},{key:"_updateState",value:function(e){var t=this;s.isObject(e)&&s.extend(this._state,e),this._onStateChange(),s.each(this.instances,(function(e){t[e]._onStateChange();}));}},{key:"_onStateChange",value:function(){var e=this;this._isReady()&&this._queue&&this._queue.length>0&&(s.each(this._queue,(function(t){e[t[0]].apply(e,o.call(t[1]));})),this._queue=[]);}},{key:"_sendRequest",value:function(e,t){t=s.isDate(t)?t:new Date;var n={data:[{"#type":e.type,"#time":s.formatDate(t),"#distinct_id":this.store.getDistinctId()}]};if(this.store.getAccountId()&&(n.data[0]["#account_id"]=this.store.getAccountId()),"track"===e.type){n.data[0]["#event_name"]=e.eventName,n.data[0].properties=s.extend({"#zone_offset":0-t.getTimezoneOffset()/60},q.properties,this.autoTrackProperties,this.store.getSuperProperties(),this.dynamicProperties?this.dynamicProperties():{});var i=this.store.removeEventTimer(e.eventName);if(!s.isUndefined(i)){var r=(new Date).getTime()-i;n.data[0].properties["#duration"]=parseFloat((r/1e3).toFixed(3));}}else n.data[0].properties={};s.isObject(e.properties)&&!s.isEmptyObject(e.properties)&&s.extend(n.data[0].properties,e.properties),s.searchObjDate(n.data[0]),this.config.maxRetries>1&&(n.data[0]["#uuid"]=s.UUIDv4()),n["#app_id"]=this.appId,h.info(JSON.stringify(n,null,4)),x.enqueue(n,this.serverUrl,{maxRetries:this.config.maxRetries,sendTimeout:this.config.sendTimeout,callback:e.onComplete});}},{key:"_isObjectParams",value:function(e){return s.isObject(e)&&s.isFunction(e.onComplete)}},{key:"track",value:function(e,t,n,i){if(this._isObjectParams(e)){var r=e;e=r.eventName,t=r.properties,n=r.time,i=r.onComplete;}y.event(e)&&y.properties(t)||!this.config.strict?this._internalTrack(e,t,n,i):s.isFunction(i)&&i({code:-1,msg:"invalid parameters"});}},{key:"_internalTrack",value:function(e,t,n,i){n=s.isDate(n)?n:new Date,this._isReady()?this._sendRequest({type:"track",eventName:e,properties:t,onComplete:i},n):this._queue.push(["_internalTrack",[e,t,n,i]]);}},{key:"userSet",value:function(e,t,n){if(this._isObjectParams(e)){var i=e;e=i.properties,t=i.time,n=i.onComplete;}y.propertiesMust(e)||!this.config.strict?(t=s.isDate(t)?t:new Date,this._isReady()?this._sendRequest({type:"user_set",properties:e,onComplete:n},t):this._queue.push(["userSet",[e,t,n]])):(h.warn("calling userSet failed due to invalid arguments"),s.isFunction(n)&&n({code:-1,msg:"invalid parameters"}));}},{key:"userSetOnce",value:function(e,t,n){if(this._isObjectParams(e)){var i=e;e=i.properties,t=i.time,n=i.onComplete;}y.propertiesMust(e)||!this.config.strict?(t=s.isDate(t)?t:new Date,this._isReady()?this._sendRequest({type:"user_setOnce",properties:e,onComplete:n},t):this._queue.push(["userSetOnce",[e,t,n]])):(h.warn("calling userSetOnce failed due to invalid arguments"),s.isFunction(n)&&n({code:-1,msg:"invalid parameters"}));}},{key:"userUnset",value:function(e,t,n){if(this._isObjectParams(r)){var i=r;e=i.property,n=i.time,t=i.onComplete;}if(y.propertyName(e)||!this.config.strict)if(n=s.isDate(n)?n:new Date,this._isReady()){var r={};r[e]=0,this._sendRequest({type:"user_unset",properties:r,onComplete:t},n);}else this._queue.push(["userUnset",[e,t,n]]);else h.warn("calling userUnset failed due to invalid arguments"),s.isFunction(t)&&t({code:-1,msg:"invalid parameters"});}},{key:"userDel",value:function(e,t){if(this._isObjectParams(e)){var n=e;e=n.time,t=n.onComplete;}e=s.isDate(e)?e:new Date,this._isReady()?this._sendRequest({type:"user_del",onComplete:t},e):this._queue.push(["userDel",[e,t]]);}},{key:"userAdd",value:function(e,t,n){if(this._isObjectParams(e)){var i=e;e=i.properties,t=i.time,n=i.onComplete;}y.userAddProperties(e)||!this.config.strict?(t=s.isDate(t)?t:new Date,this._isReady()?this._sendRequest({type:"user_add",properties:e,onComplete:n},t):this._queue.push(["userAdd",[e,t,n]])):(h.warn("calling userAdd failed due to invalid arguments"),s.isFunction(n)&&n({code:-1,msg:"invalid parameters"}));}},{key:"userAppend",value:function(e,t,n){if(this._isObjectParams(e)){var i=e;e=i.properties,t=i.time,n=i.onComplete;}y.userAppendProperties(e)||!this.config.strict?(t=s.isDate(t)?t:new Date,this._isReady()?this._sendRequest({type:"user_append",properties:e,onComplete:n},t):this._queue.push(["userAppend",[e,t,n]])):(h.warn("calling userAppend failed due to invalid arguments"),s.isFunction(n)&&n({code:-1,msg:"invalid parameters"}));}},{key:"authorizeOpenID",value:function(e){this.identify(e);}},{key:"identify",value:function(e){if("number"==typeof e)e=String(e);else if("string"!=typeof e)return !1;this.store.setDistinctId(e);}},{key:"getDistinctId",value:function(){return this.store.getDistinctId()}},{key:"login",value:function(e){if("number"==typeof e)e=String(e);else if("string"!=typeof e)return !1;this.store.setAccountId(e);}},{key:"getAccountId",value:function(){return this.store.getAccountId()}},{key:"logout",value:function(){this.store.setAccountId(null);}},{key:"setSuperProperties",value:function(e){y.propertiesMust(e)||!this.config.strict?this.store.setSuperProperties(e):h.warn("setSuperProperties 的参数必须是合法的属性值");}},{key:"clearSuperProperties",value:function(){this.store.setSuperProperties({},!0);}},{key:"unsetSuperProperty",value:function(e){if(s.isString(e)){var t=this.getSuperProperties();delete t[e],this.store.setSuperProperties(t,!0);}}},{key:"getSuperProperties",value:function(){return this.store.getSuperProperties()}},{key:"setDynamicSuperProperties",value:function(e){"function"==typeof e?y.properties(e())||!this.config.strict?this.dynamicProperties=e:h.warn("动态公共属性必须返回合法的属性值"):h.warn("setDynamicSuperProperties 的参数必须是 function 类型");}},{key:"timeEvent",value:function(e,t){t=s.isDate(t)?t:new Date,this._isReady()?y.event(e)||!this.config.strict?this.store.setEventTimer(e,t.getTime()):h.warn("calling timeEvent failed due to invalid eventName: "+e):this._queue.push(["timeEvent",[e,t]]);}},{key:"getDeviceId",value:function(){return q.properties["#device_id"]}}]),e}();

    class DemoUI extends Laya.Scene {
        constructor() {
            super();
            //设置单例的引用方式，方便其他类引用
            DemoUI.instance = this;
            //加载场景文件
            this.loadScene("Scene.scene");

            this.initSDK();
        }

        initSDK() {
            var config = {
                appid: 'YOUR_APPID',
                server_url: 'YOUR_SERVER_URL',
                autoTrack: {
                    appShow: true,
                    appHide: true,
                }
            };

            this.ta = new N(config);
            this.ta.init();
            this.ta.track('test');
        }

        onEnable() {
            this.track.on(Laya.Event.CLICK, this, this.onTrackClick);
            this.login.on(Laya.Event.CLICK, this, this.onLoginClick);
            this.logout.on(Laya.Event.CLICK, this, this.onLogoutClick);
            this.setSuperProperties.on(Laya.Event.CLICK, this, this.onSuperPropertiesClick);
            this.setUser.on(Laya.Event.CLICK, this, this.onUserClick);
            this.identify.on(Laya.Event.CLICK, this, this.onIdentifyClick);
            this.timeEvent.on(Laya.Event.CLICK, this, this.onTimeEventClick);
            this.lightInstance.on(Laya.Event.CLICK, this, this.onLightInstanceClick);
            this.dynamicSuper.on(Laya.Event.CLICK, this, this.onDynamicSuperClick);
            this.deviceID.on(Laya.Event.CLICK, this, this.onDeviceIDClick);
        }

        checkPlatform() {
            if (Laya.Browser.onMiniGame || Laya.Browser.onBDMiniGame || Laya.Browser.onVVMiniGame || Laya.Browser.onQQMiniGame || Laya.Browser.onQGMiniGame) {
                return true;
            } else {
                return false;
            }
        }

        onTrackClick(e) {
            if(this.checkPlatform()) {
                this.ta.track('test'); 
                this.ta.track('test', {'key': 'value'});
                this.ta.track('test', {'key': 'value', 'key2': ['1', '2', new Date()]});
                this.ta.track('test', {'key': 'value'}, new Date("October 13, 1975 11:13:00"));
                this.ta.track('test', {'key': 'value'}, new Date("October 13, 2020 11:13:00"), (res) => {
                    console.log("res.code:" + res.code);
                    console.log("res.msg:" + res.msg);
                });
                this.ta.track({
                    eventName: 'test', 
                    properties: {'key': 'value'}, 
                    time: new Date("October 6, 2020 11:13:00"), 
                    onComplete: (res) => { 
                        console.log("res2.code:" + res.code);
                        console.log("res2.msg:" + res.msg);
                    }, 
                });
            }
        }

        onLoginClick(e) {
            if(this.checkPlatform()) {
                this.ta.login('qg_user');
            }
        }

        onLogoutClick(e) {
            if(this.checkPlatform()) {
                this.ta.logout();
            }
        }

        onSuperPropertiesClick(e) {
            if(this.checkPlatform()) {
                this.ta.setSuperProperties({'SUPER_STRING': 'super string value',
                                       'SUPER_INT': 1234,
                                       'SUPER_DOUBLE': 66.88,
                                       'SUPER_DATE': new Date(),
                                       'SUPER_BOOL': true,
                                       'SUPER_LIST': [1234, 'hello', new Date()]});
                this.ta.unsetSuperProperty('SUPER_STRING');
                this.ta.clearSuperProperties();
            }
        }

        onUserClick(e) {
            if(this.checkPlatform()) {
                ta.userSet({"level": 26, "age": 18});
                ta.userSetOnce({ "cost": -30 });
                ta.userAppend({"USER_LIST": [1, 2, 3]});
                ta.userAdd({"level": 2});
                ta.userUnset("USER_INT");
                ta.userDel();
            }
        }

        onIdentifyClick(e) {
            if(this.checkPlatform()) {
                // identify 等价于 authorizeOpenID
                ta.authorizeOpenID("authorizeOpenID");
                ta.identify('OpenID');
           }
        }

        onTimeEventClick(e) {
            if(this.checkPlatform()) {
                ta.timeEvent('test');
            }
        }

        onLightInstanceClick(e) {
            if(this.checkPlatform()) {
                // 创建子实例 tt， 子实例默认配置与主实例相同
                this.ta.initInstance('tt');

                // 为子实例设置访客 ID
                this.ta.tt.identify('another_distinct_id');

                // 通过子实例上传事件
                this.ta.tt.track('event_from_tt_instance');

                // 创建不同配置的子实例
                var config = {
                    appid: 'ANOTHER-APP-ID',
                    enablePersistence: true, // 为子实例开启本地缓存
                };

                this.ta.initInstance('tt_1', config);
                this.ta.tt_1.track('event_from_tt_instance');
           }
        }

        onDynamicSuperClick(e) {
            if(this.checkPlatform()) {
                // 通过动态公共属性设置 UTC 时间作为事件属性上报
                this.ta.setDynamicSuperProperties(() => {
                    var localDate = new Date();
                    return {
                        utcTime: new Date(localDate.getTime() + (localDate.getTimezoneOffset() * 60000)),
                    };
                });
            }
        }

        onDeviceIDClick(e) {
            if(this.checkPlatform()) {
                var deviceId = this.ta.getDeviceId();
                console.log('deviceId:' + deviceId);
            }
        }
    }

    /**This class is automatically generated by LayaAirIDE, please do not make any modifications. */

    class GameConfig {
        static init() {
            //注册Script或者Runtime引用
            let reg = Laya.ClassUtils.regClass;
    		reg("DemoUI.js",DemoUI);
        }
    }
    GameConfig.width = 640;
    GameConfig.height = 1136;
    GameConfig.scaleMode ="fixedwidth";
    GameConfig.screenMode = "none";
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "Scene.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;

    GameConfig.init();

    class Main {
    	constructor() {
    		//根据IDE设置初始化引擎		
    		if (window["Laya3D"]) Laya3D.init(GameConfig.width, GameConfig.height);
    		else Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
    		Laya["Physics"] && Laya["Physics"].enable();
    		Laya["DebugPanel"] && Laya["DebugPanel"].enable();
    		Laya.stage.scaleMode = GameConfig.scaleMode;
    		Laya.stage.screenMode = GameConfig.screenMode;
    		Laya.stage.alignV = GameConfig.alignV;
    		Laya.stage.alignH = GameConfig.alignH;
    		//兼容微信不支持加载scene后缀场景
    		Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;

    		//打开调试面板（通过IDE设置调试模式，或者url地址增加debug=true参数，均可打开调试面板）
    		if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true") Laya.enableDebugPanel();
    		if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"]) Laya["PhysicsDebugDraw"].enable();
    		if (GameConfig.stat) Laya.Stat.show();
    		Laya.alertGlobalError = true;

    		//激活资源版本控制，version.json由IDE发布功能自动生成，如果没有也不影响后续流程
    		Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
    	}

    	onVersionLoaded() {
    		//激活大小图映射，加载小图的时候，如果发现小图在大图合集里面，则优先加载大图合集，而不是小图
    		Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
    	}

    	onConfigLoaded() {
    		//加载IDE指定的场景
    		GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
    	}
    }
    //激活启动类
    new Main();

}());
