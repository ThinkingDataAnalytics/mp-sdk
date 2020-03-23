var egret = window.egret;var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = this && this.__extends || function __extends(t, e) { 
 function r() { 
 this.constructor = t;
}
for (var i in e) e.hasOwnProperty(i) && (t[i] = e[i]);
r.prototype = e.prototype, t.prototype = new r();
};
var Button = (function (_super) {
    __extends(Button, _super);
    function Button(label) {
        var _this = _super.call(this) || this;
        _this.isUp = true;
        _this.drawText(label);
        _this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, _this.touch_begin, _this);
        _this.addEventListener(egret.TouchEvent.TOUCH_END, _this.touch_end, _this);
        _this.addEventListener(egret.TouchEvent.TOUCH_TAP, _this.click, _this);
        _this.draw();
        _this.touchEnabled = true;
        return _this;
    }
    Button.prototype.touch_begin = function (evt) {
        this.isUp = false;
        this.draw();
    };
    Button.prototype.touch_end = function (evt) {
        this.isUp = true;
        this.draw();
    };
    Button.prototype.click = function (evt) {
        this.dispatchEvent(new egret.Event("CHAGE_STAGE"));
    };
    Button.prototype.draw = function () {
        this.graphics.clear();
        this.removeChildren();
        if (this.isUp) {
            this.drawUp();
        }
        else {
            this.drawDown();
        }
        this.addChild(this.textF);
    };
    Button.prototype.drawText = function (label) {
        if (this.textF == null) {
            var text = new egret.TextField();
            text.text = label;
            text.width = (Context.stageWidth - 30) / 2;
            text.height = 35;
            text.size = 22;
            text.verticalAlign = egret.VerticalAlign.MIDDLE;
            text.textAlign = egret.HorizontalAlign.CENTER;
            this.textF = text;
            this.textF.strokeColor = 0x292b2f;
        }
    };
    Button.prototype.drawUp = function () {
        this.graphics.beginFill(0x666666);
        this.graphics.lineStyle(2, 0x282828);
        this.graphics.drawRoundRect(0, 0, (Context.stageWidth - 30) / 2, 35, 15, 15);
        this.graphics.endFill();
        this.graphics.lineStyle(2, 0x909090, 0.5);
        this.graphics.moveTo(5, 2);
        this.graphics.lineTo((Context.stageWidth - 30) / 2 - 5, 2);
        this.graphics.endFill();
        this.graphics.lineStyle(2, 0x676767, 0.7);
        this.graphics.moveTo(5, 37);
        this.graphics.lineTo((Context.stageWidth - 30) / 2 - 5, 37);
        this.graphics.endFill();
        this.textF.stroke = 0;
    };
    Button.prototype.drawDown = function () {
        this.graphics.beginFill(0x3b3b3b);
        this.graphics.lineStyle(2, 0x282828);
        this.graphics.drawRoundRect(0, 0, (Context.stageWidth - 30) / 2, 35, 15, 15);
        this.graphics.endFill();
        this.graphics.lineStyle(2, 0x313131, 0.5);
        this.graphics.moveTo(5, 2);
        this.graphics.lineTo((Context.stageWidth - 30) / 2 - 5, 2);
        this.graphics.endFill();
        this.graphics.lineStyle(2, 0x676767, 0.7);
        this.graphics.moveTo(5, 37);
        this.graphics.lineTo((Context.stageWidth - 30) / 2 - 5, 37);
        this.graphics.endFill();
        this.textF.stroke = 1;
    };
    return Button;
}(egret.Sprite));
__reflect(Button.prototype, "Button");
var Context = (function () {
    function Context() {
    }
    Context.init = function (_stage) {
        Context.stageWidth = _stage.stageWidth;
        Context.stageHeight = _stage.stageHeight;
    };
    Context.stageWidth = 0;
    Context.stageHeight = 0;
    return Context;
}());
__reflect(Context.prototype, "Context");
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
var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        var _this = _super.call(this) || this;
        _this.addEventListener(egret.Event.ADDED_TO_STAGE, _this.addStage, _this);
        return _this;
    }
    Main.prototype.initThinkingSDK = function () {
        var config = {
            appid: 'b2a61feb9e56472c90c5bcb320dfb4ef',
            server_url: 'https://sdk.tga.thinkinggame.cn',
            autoTrack: {
                appShow: true,
                appHide: true,
            }
        };
        if (this.checkPlatform()) {
            this.ta = new ThinkingDataAPI(config);
            this.ta.init();
        }
    };
    Main.prototype.checkPlatform = function () {
        if (typeof egret.Capabilities != "undefined" && (egret.Capabilities.runtimeType == egret.RuntimeType.WXGAME ||
            egret.Capabilities.runtimeType == egret.RuntimeType.BAIDUGAME ||
            egret.Capabilities.runtimeType == egret.RuntimeType.VIVOGAME ||
            egret.Capabilities.runtimeType == egret.RuntimeType.QQGAME ||
            egret.Capabilities.runtimeType == egret.RuntimeType.OPPOGAME)) {
            return true;
        }
        else {
            return false;
        }
    };
    Main.prototype.addStage = function (evt) {
        this.initThinkingSDK();
        Context.init(this.stage);
        Main.menu = new Menu("Thinking SDK Demo");
        this.addChild(Main.menu);
        this.createMenu();
    };
    Main.prototype.createMenu = function () {
        Main.menu.addTestFunc("init", this.init, this);
        Main.menu.addTestFunc("track", this.track, this);
        Main.menu.addTestFunc("time event", this.timeEvent, this);
        Main.menu.addTestFunc("login", this.login, this);
        Main.menu.addTestFunc("logout", this.logout, this);
        Main.menu.addTestFunc("super properties", this.superProperties, this);
        Main.menu.addTestFunc("user properties", this.userProperty, this);
        Main.menu.addTestFunc("identify", this.identify, this);
        Main.menu.addTestFunc("light instance", this.lightInstance, this);
        Main.menu.addTestFunc("dynamic superProperties", this.setDynamicSuperProperties, this);
        Main.menu.addTestFunc("get deviceId", this.getDeviceId, this);
    };
    Main.prototype.init = function () {
        if (this.checkPlatform()) {
            this.ta.init();
        }
    };
    Main.prototype.track = function () {
        if (this.checkPlatform()) {
            this.ta.track('test');
            this.ta.track('test', { 'key': 'value' });
            this.ta.track('test', { 'key': 'value', 'key2': ['1', '2', new Date()] });
            this.ta.track('test', { 'key': 'value' }, new Date("October 13, 1975 11:13:00"));
            this.ta.track('test', { 'key': 'value' }, new Date("October 13, 2020 11:13:00"), function (res) {
                console.log("res.code:" + res.code);
                console.log("res.msg:" + res.msg);
            });
        }
    };
    Main.prototype.timeEvent = function () {
        if (this.checkPlatform()) {
            this.ta.timeEvent("test");
        }
    };
    Main.prototype.login = function () {
        if (this.checkPlatform()) {
            this.ta.login("mg_user");
        }
    };
    Main.prototype.logout = function () {
        if (this.checkPlatform()) {
            this.ta.logout();
        }
    };
    Main.prototype.superProperties = function () {
        if (this.checkPlatform()) {
            this.ta.setSuperProperties({ 'SUPER_STRING': 'super string value',
                'SUPER_INT': 1234,
                'SUPER_DOUBLE': 66.88,
                'SUPER_DATE': new Date(),
                'SUPER_BOOL': true,
                'SUPER_LIST': [1234, 'hello', new Date()] });
            this.ta.unsetSuperProperty('SUPER_STRING');
            this.ta.clearSuperProperties();
        }
    };
    Main.prototype.userProperty = function () {
        if (this.checkPlatform()) {
            this.ta.userSet({ "level": 26, "age": 18 });
            this.ta.userSetOnce({ "cost": -30 });
            this.ta.userAppend({ "USER_LIST": [1, 2, 3] });
            this.ta.userAdd({ "level": 2 });
            this.ta.userUnset("USER_INT");
            this.ta.userDel();
        }
    };
    Main.prototype.identify = function () {
        if (this.checkPlatform()) {
            // identify 等价于 authorizeOpenID
            this.ta.authorizeOpenID("authorizeOpenID");
            this.ta.identify('OpenID');
        }
    };
    Main.prototype.lightInstance = function () {
        if (this.checkPlatform()) {
            // 创建子实例 tt， 子实例默认配置与主实例相同
            this.ta.initInstance('tt');
            this.ta.lightInstance('tt').identify('another_distinct_id');
            this.ta.lightInstance('tt').track('event_from_tt_instance');
            // 创建不同配置的子实例
            var config = {
                appid: 'ANOTHER-APP-ID',
                enablePersistence: true,
            };
            this.ta.initInstance('tt_1', config);
            this.ta.lightInstance('tt_1').track('event_from_tt1_instance');
        }
    };
    Main.prototype.setDynamicSuperProperties = function () {
        // 通过动态公共属性设置 UTC 时间作为事件属性上报
        this.ta.setDynamicSuperProperties(function () {
            var localDate = new Date();
            return {
                utcTime: new Date(localDate.getTime() + (localDate.getTimezoneOffset() * 60000)),
            };
        });
    };
    Main.prototype.getDeviceId = function () {
        var deviceId = this.ta.getDeviceId();
        console.log('deviceId:' + deviceId);
    };
    return Main;
}(egret.DisplayObjectContainer));
__reflect(Main.prototype, "Main");
var Menu = (function (_super) {
    __extends(Menu, _super);
    function Menu(title) {
        var _this = _super.call(this) || this;
        _this.viewNum = 0;
        _this.graphics.lineStyle(2, 0x282828);
        _this.graphics.moveTo(0, 80);
        _this.graphics.lineTo(Context.stageWidth, 80);
        _this.graphics.endFill();
        _this.graphics.lineStyle(2, 0x6a6a6a);
        _this.graphics.moveTo(0, 82);
        _this.graphics.lineTo(Context.stageWidth, 82);
        _this.graphics.endFill();
        _this.drawText(title);
        _this.addChild(_this.textF);
        return _this;
    }
    Menu.prototype.drawText = function (label) {
        if (this.textF == null) {
            var text = new egret.TextField();
            text.text = label;
            text.width = Context.stageWidth;
            text.height = 60;
            text.size = 30;
            text.verticalAlign = egret.VerticalAlign.MIDDLE;
            text.textAlign = egret.HorizontalAlign.LEFT;
            this.textF = text;
            this.textF.strokeColor = 0xB4B4B4;
        }
    };
    Menu.prototype.addTestFunc = function (label, callback, target) {
        var btn = new Button(label);
        btn.x = 48;
        btn.y = 100 + this.viewNum * 47;
        this.addChild(btn);
        btn.addEventListener("CHAGE_STAGE", callback, target);
        this.viewNum++;
    };
    return Menu;
}(egret.Sprite));
__reflect(Menu.prototype, "Menu");

;window.Main = Main;