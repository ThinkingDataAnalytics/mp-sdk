
cc.Class({
    extends: cc.Component,

    properties: {
        trackButton: cc.Button,
        loginButton: cc.Button,
        logoutButton: cc.Button,
        setSuperButton: cc.Button,
        setUserButton: cc.Button,
        identifyButton: cc.Button,
        timeEventButton: cc.Button,
        lightInstanceButton: cc.Button,
        dynamicSuperButton: cc.Button,
        deviceIDButton: cc.Button
    },

    // use this for initialization
    onLoad: function () {
        this.configSDK();

        this.trackButton.node.on('click', this.callbackTrack, this);
        this.loginButton.node.on('click', this.callbackLogin, this);
        this.logoutButton.node.on('click', this.callbackLogout, this);
        this.setSuperButton.node.on('click', this.callbackSuper, this);
        this.setUserButton.node.on('click', this.callbackSetUser, this);
        this.identifyButton.node.on('click', this.callbackIdentify, this);
        this.timeEventButton.node.on('click', this.callbackTimeEvent, this);
        this.lightInstanceButton.node.on('click', this.callbackLightInstance, this);
        this.dynamicSuperButton.node.on('click', this.callbackSetDynamicSuperProperties, this);
        this.deviceIDButton.node.on('click', this.callbackGetDeviceId, this);
    },

    configSDK: function () {
        if(this.checkPlatform()) {
            var config = {
                appid: 'e91da662ba4b4605b60cef0c7da342d0',
                server_url: 'https://receiver-ta-dev.thinkingdata.cn',
                cocosCreator: true,
                autoTrack: {
                  appShow: true,
                  appHide: true,
                },
                // debugMode:'debug'
            };

            window.ta = new ThinkingDataAPI(config);
            cc.log(window.ta);
            ta.init();
        }
    },

    checkPlatform: function () {
        if (cc.sys.platform === cc.sys.WECHAT_GAME || cc.sys.platform === cc.sys.BAIDU_GAME || cc.sys.platform === cc.sys.VIVO_GAME || cc.sys.platform === cc.sys.OPPO_GAME || cc.sys.platform === cc.sys.HUAWEI_GAME) {
            return true;
        } else {
            return false;
        }
    },

    callbackTimeEvent: function (button) {
        if(this.checkPlatform()) {
            ta.timeEvent('test');
        }
    },

    callbackTrack: function (button) {
        if(this.checkPlatform()) {
            ta.track('test'); 
            ta.track('test', {'key': 'value'});
            ta.track('test', {'key': 'value', 'key2': ['1', '2', new Date()]});
            ta.track('test', {'key': 'value'}, new Date("October 13, 1975 11:13:00"));
            ta.track('test', {'key': 'value'}, new Date("October 13, 2020 11:13:00"), (res) => {
                console.log("res.code:" + res.code);
                console.log("res.msg:" + res.msg);
            });
            ta.track({
                eventName: 'test', 
                properties: {'key': 'value'}, 
                time: new Date("October 6, 2020 11:13:00"), 
                onComplete: (res) => { 
                    console.log("res2.code:" + res.code);
                    console.log("res2.msg:" + res.msg);
                }, 
            });

            ta.trackUpdate({
              eventName: 'test', // 必填
              properties: {testkey: 1234}, // 可选
              eventId:'2', // 必填
              onComplete: (res) => { 
                console.log('trackUpdate res [code]:' + res.code + ' [msg]:' + res.msg) 
              },
            });

            ta.trackOverwrite({
              eventName: 'test', // 必填
              properties: {testkey: 2345}, // 可选
              eventId:'2', // 必填
              onComplete: (res) => { 
                console.log('trackOverwrite res [code]:' + res.code + ' [msg]:' + res.msg) 
              },
            });

            ta.trackFirstEvent({
              eventName: 'test', // 必填
              properties: {testkey: 123}, // 可选
              firstCheckId:'3', // 必填
              onComplete: (res) => { 
                console.log('trackFirstEvent res [code]:' + res.code + ' [msg]:' + res.msg) 
              },
            });   
        }
    },

    callbackLogin: function (button) {
        if(this.checkPlatform()) {
            ta.login('qg_user');
        }
    },

    callbackLogout: function (button) {
        if(this.checkPlatform()) {
            ta.logout();
        }
    },

    callbackSuper: function (button) {
        if(this.checkPlatform()) {
            ta.setSuperProperties({'SUPER_STRING': 'super string value',
                                   'SUPER_INT': 1234,
                                   'SUPER_DOUBLE': 66.88,
                                   'SUPER_DATE': new Date(),
                                   'SUPER_BOOL': true,
                                   'SUPER_LIST': [1234, 'hello', new Date()]});
            ta.unsetSuperProperty('SUPER_STRING');
            ta.clearSuperProperties();
        }
    },

    callbackSetUser: function (button) {
        if(this.checkPlatform()) {
            ta.userSet({"level": 26, "age": 18});
            ta.userSetOnce({ "cost": -30 });
            ta.userAppend({"USER_LIST": [1, 2, 3]});
            ta.userAdd({"level": 2});
            ta.userUnset("USER_INT");
            ta.userDel();
        }
    },

    callbackIdentify: function (button) {
       if(this.checkPlatform()) {
            // identify 等价于 authorizeOpenID
            ta.authorizeOpenID("authorizeOpenID");
            ta.identify('OpenID');
       }
    },

    callbackLightInstance: function (button) {
       if(this.checkPlatform()) {
            // 创建子实例 tt， 子实例默认配置与主实例相同
            ta.initInstance('tt');

            // 为子实例设置访客 ID
            ta.tt.identify('another_distinct_id');

            // 通过子实例上传事件
            ta.tt.track('event_from_tt_instance');

            // 创建不同配置的子实例
            var config = {
                appid: 'ANOTHER-APP-ID',
                enablePersistence: true, // 为子实例开启本地缓存
            };

            ta.initInstance('tt_1', config);
            ta.tt_1.track('event_from_tt_instance');
       }
    },

    callbackSetDynamicSuperProperties: function (button) {
        if(this.checkPlatform()) {
            // 通过动态公共属性设置 UTC 时间作为事件属性上报
            ta.setDynamicSuperProperties(() => {
                var localDate = new Date();
                return {
                    utcTime: new Date(localDate.getTime() + (localDate.getTimezoneOffset() * 60000)),
                };
            });
        }
    },

    callbackGetDeviceId: function (button) {
        if(this.checkPlatform()) {
            var deviceId = ta.getDeviceId();
            console.log('deviceId:' + deviceId);
        }
    },

    // called every frame
    update: function (dt) {

    },
});
