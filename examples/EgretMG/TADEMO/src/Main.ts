//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

class Main extends egret.DisplayObjectContainer {
    public static menu: any;
    private ta: ThinkingDataAPI;

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.addStage, this);
    }

    private initThinkingSDK(): void {
        var config = {
            appid: 'e91da662ba4b4605b60cef0c7da342d0',
            server_url: 'https://receiver-ta-dev.thinkingdata.cn',
            autoTrack: {
                appShow: true,
                appHide: true,
            }
        };

        if (this.checkPlatform()) {
            this.ta = new ThinkingDataAPI(config);
            this.ta.init();
        }
    }

    private checkPlatform(): boolean {
        if (typeof egret.Capabilities != "undefined" && (
        egret.Capabilities.runtimeType == egret.RuntimeType.WXGAME ||
        egret.Capabilities.runtimeType == egret.RuntimeType.BAIDUGAME ||
        egret.Capabilities.runtimeType == egret.RuntimeType.VIVOGAME ||
        egret.Capabilities.runtimeType == egret.RuntimeType.QQGAME ||
        egret.Capabilities.runtimeType == egret.RuntimeType.OPPOGAME)) {
            return true;
        } else {
            return false;
        }
    }

    private addStage(evt: egret.Event): void {
        this.initThinkingSDK();

        Context.init(this.stage);
        Main.menu = new Menu("Thinking SDK Demo")
        this.addChild(Main.menu);
        this.createMenu();
    }

    private createMenu(): void {
        Main.menu.addTestFunc("init", this.init, this);
        Main.menu.addTestFunc("track", this.track, this);
        Main.menu.addTestFunc("trackUpdate", this.trackUpdate, this);
        Main.menu.addTestFunc("trackOverwrite", this.trackOverwrite, this);
        Main.menu.addTestFunc("trackFirstEvent", this.trackFirstEvent, this);
        Main.menu.addTestFunc("time event", this.timeEvent, this);
        Main.menu.addTestFunc("login", this.login, this);
        Main.menu.addTestFunc("logout", this.logout, this);
        Main.menu.addTestFunc("super properties", this.superProperties, this);
        Main.menu.addTestFunc("user properties", this.userProperty, this);
        Main.menu.addTestFunc("identify", this.identify, this);
        Main.menu.addTestFunc("light instance", this.lightInstance, this);
        Main.menu.addTestFunc("dynamic superProperties", this.setDynamicSuperProperties, this);
        Main.menu.addTestFunc("get deviceId", this.getDeviceId, this);
    }

    private init() {
        if (this.checkPlatform()) {
            this.ta.init();
        }
    }

    private track() {
        if (this.checkPlatform()) {
            this.ta.track('test');
            this.ta.track('test', {'key':'value'});
            this.ta.track('test', {'key':'value', 'key2':['1', '2', new Date()]});
            this.ta.track('test', {'key':'value'}, new Date("October 13, 1975 11:13:00"));
            this.ta.track('test', {'key':'value'}, new Date("October 13, 2020 11:13:00"), (res) => {
                console.log("res.code:" + res.code);
                console.log("res.msg:" + res.msg);
            });

            // 以参数对象的形式传入回调
            this.ta.track({
                eventName: 'test', // 必填
                properties: {testkey: 123}, // 可选
                time: new Date(), // 可选
                onComplete: (res) => {  
                    console.log("res.code:" + res.code);
                    console.log("res.msg:" + res.msg); 
                }, // 必填
            });
        }
    }

    private trackUpdate() {
        if (this.checkPlatform()) {
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

    private trackOverwrite(){
        if (this.checkPlatform()) {
            this.ta.trackOverwrite({
                eventName: 'test', // 必填
                properties: {testkey: 345}, // 可选
                eventId:'4', // 必填
                onComplete: (res) => { 
                    console.log('trackOverwrite res [code]:' + res.code + ' [msg]:' + res.msg) 
                },
            });
        }
    }

    private trackFirstEvent(){
        if (this.checkPlatform()) {
            this.ta.trackFirstEvent({
                eventName: 'test', // 必填
                properties: {testkey: 123}, // 可选
                firstCheckId:'3', // 必填
                onComplete: (res) => { 
                    console.log('trackFirstEvent res [code]:' + res.code + ' [msg]:' + res.msg) 
                },
            });
        }
    }

    private timeEvent() {
        if (this.checkPlatform()) {
            this.ta.timeEvent("test");
        }
    }

    private login() {
        if (this.checkPlatform()) {
            this.ta.login("mg_user");
        }
    }

    private logout() {
        if (this.checkPlatform()) {
            this.ta.logout();
        }
    }

    private superProperties() {
        if (this.checkPlatform()) {
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

    private userProperty() {
        if (this.checkPlatform()) {
            this.ta.userSet({ "level": 26, "age": 18 });
            this.ta.userSetOnce({ "cost": -30 });
            this.ta.userAppend({"USER_LIST": [1, 2, 3]});
            this.ta.userAdd({ "level": 2 });
            this.ta.userUnset("USER_INT");
            this.ta.userDel();
        }
    }

    private identify() {
        if (this.checkPlatform()) {
            // identify 等价于 authorizeOpenID
            this.ta.authorizeOpenID("authorizeOpenID");
            this.ta.identify('OpenID');
        }
    }

    private lightInstance() {
        if (this.checkPlatform()) {
            // 创建子实例 tt， 子实例默认配置与主实例相同
            this.ta.initInstance('tt');

            this.ta.lightInstance('tt').identify('another_distinct_id');
            this.ta.lightInstance('tt').track('event_from_tt_instance');

            // 创建不同配置的子实例
            var config = {
                appid: 'ANOTHER-APP-ID',
                enablePersistence: true, // 为子实例开启本地缓存
            };

            this.ta.initInstance('tt_1', config);
            this.ta.lightInstance('tt_1').track('event_from_tt1_instance');
        }
    }

    private setDynamicSuperProperties() {
        // 通过动态公共属性设置 UTC 时间作为事件属性上报
        this.ta.setDynamicSuperProperties(() => {
            var localDate = new Date();
            return {
                utcTime: new Date(localDate.getTime() + (localDate.getTimezoneOffset() * 60000)),
            };
        });
    }

    private getDeviceId() {
        var deviceId = this.ta.getDeviceId();
        console.log('deviceId:' + deviceId);
    }
}