import ThinkingDataAPI from "./thinkingdata.mg.laya";

export default class DemoUI extends Laya.Scene {
    constructor() {
        super();
        DemoUI.instance = this;
        this.loadScene("Scene.scene");

        this.initSDK();
        this.createUi();
    }

    initSDK() {
        var config = {
            appid: 'e91da662ba4b4605b60cef0c7da342d0',
            server_url: 'https://receiver-ta-dev.thinkingdata.cn',
            autoTrack: {
                appShow: true,
                appHide: true,
            }
        };

        this.ta = new ThinkingDataAPI(config);
        this.ta.init();
    }

    createUi() {
        var track = new Laya.Button("comp/button.png");
        Laya.stage.addChild(track);
        track.width = 100;
        track.height = 40;
        track.pos(200,100);
        track.label = "track";
        track.on(Laya.Event.CLICK, this, this.onTrackClick);

        var login = new Laya.Button("comp/button.png");
        Laya.stage.addChild(login);
        login.width = 100;
        login.height = 40;
        login.pos(200,150);
        login.label = "login";
        login.on(Laya.Event.CLICK, this, this.onLoginClick);


        var logout = new Laya.Button("comp/button.png");
        Laya.stage.addChild(logout);
        logout.width = 100;
        logout.height = 40;
        logout.pos(200,200);
        logout.label = "logout";
        logout.on(Laya.Event.CLICK, this, this.onLogoutClick);

        var setSuperProperties = new Laya.Button("comp/button.png");
        Laya.stage.addChild(setSuperProperties);
        setSuperProperties.width = 100;
        setSuperProperties.height = 40;
        setSuperProperties.pos(200,250);
        setSuperProperties.label = "setSuperProperties";
        setSuperProperties.on(Laya.Event.CLICK, this, this.onSuperPropertiesClick);

        var setUser = new Laya.Button("comp/button.png");
        Laya.stage.addChild(setUser);
        setUser.width = 100;
        setUser.height = 40;
        setUser.pos(200,300);
        setUser.label = "setUser";
        setUser.on(Laya.Event.CLICK, this, this.onUserClick);

        var identify = new Laya.Button("comp/button.png");
        Laya.stage.addChild(identify);
        identify.width = 100;
        identify.height = 40;
        identify.pos(200,350);
        identify.label = "identify";
        identify.on(Laya.Event.CLICK, this, this.onIdentifyClick);

        var timeEvent = new Laya.Button("comp/button.png");
        Laya.stage.addChild(timeEvent);
        timeEvent.width = 100;
        timeEvent.height = 40;
        timeEvent.pos(200,400);
        timeEvent.label = "timeEvent";
        timeEvent.on(Laya.Event.CLICK, this, this.onTimeEventClick);

        var lightInstance = new Laya.Button("comp/button.png");
        Laya.stage.addChild(lightInstance);
        lightInstance.width = 100;
        lightInstance.height = 40;
        lightInstance.pos(200,450);
        lightInstance.label = "lightInstance";
        lightInstance.on(Laya.Event.CLICK, this, this.onLightInstanceClick);

        var dynamicSuper = new Laya.Button("comp/button.png");
        Laya.stage.addChild(dynamicSuper);
        dynamicSuper.width = 100;
        dynamicSuper.height = 40;
        dynamicSuper.pos(200,500);
        dynamicSuper.label = "dynamicSuper";
        dynamicSuper.on(Laya.Event.CLICK, this, this.onDynamicSuperClick);

        var deviceID = new Laya.Button("comp/button.png");
        Laya.stage.addChild(deviceID);
        deviceID.width = 100;
        deviceID.height = 40;
        deviceID.pos(200,550);
        deviceID.label = "deviceID";
        deviceID.on(Laya.Event.CLICK, this, this.onDeviceIDClick);

        var trackUpdate = new Laya.Button("comp/button.png");
        Laya.stage.addChild(trackUpdate);
        trackUpdate.width = 100;
        trackUpdate.height = 40;
        trackUpdate.pos(200,600);
        trackUpdate.label = "trackUpdate";
        trackUpdate.on(Laya.Event.CLICK, this, this.onTrackUpdate);
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

    onTrackUpdate(e) {
        if(this.checkPlatform()) {
            this.ta.trackUpdate({
                eventName: 'test', // 必填
                properties: {testkey: 234}, // 可选
                eventId:'2', // 必填
                onComplete: (res) => { 
                    console.log('trackUpdate res [code]:' + res.code + ' [msg]:' + res.msg) 
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
            this.ta.userSet({"level": 26, "age": 18});
            this.ta.userSetOnce({ "cost": -30 });
            this.ta.userAppend({"USER_LIST": [1, 2, 3]});
            this.ta.userAdd({"level": 2});
            this.ta.userUnset("USER_INT");
            this.ta.userDel();
        }
    }

    onIdentifyClick(e) {
        if(this.checkPlatform()) {
            // identify 等价于 authorizeOpenID
            this.ta.authorizeOpenID("authorizeOpenID");
            this.ta.identify('OpenID');
       }
    }

    onTimeEventClick(e) {
        if(this.checkPlatform()) {
            this.ta.timeEvent('test');
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