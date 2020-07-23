import ThinkingDataAPI from "./thinkingdata.mg.laya";

export default class DemoUI extends Laya.Scene {
    constructor() {
        super();
        DemoUI.instance = this;
        this.loadScene("Scene.scene");

        this.initSDK();
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