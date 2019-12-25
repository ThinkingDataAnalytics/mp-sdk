
var TA;
if(cc.sys.platform === cc.sys.VIVO_GAME) {
    TA = require('./thinkingdata.mg.qg.vivo');
} else if(cc.sys.platform === cc.sys.OPPO_GAME) {
    TA = require('./thinkingdata.mg.qg.oppo');
}

if(cc.sys.platform === cc.sys.VIVO_GAME || cc.sys.platform === cc.sys.OPPO_GAME) {
    var config = {
        appid: 'e91da662ba4b4605b60cef0c7da342d0',
        server_url: 'http://sdk.tga.thinkinggame.cn:9080',
        name: 'ta', // 全局变量名称, 默认为 thinkingdata
        autoTrack: {
          appShow: true, // 自动采集 ta_mp_show
          appHide: true, // 自动采集 ta_mp_hide
        },
    };

    var ta = new TA(config);
    ta.init();
    ta.track('test');
}

cc.Class({
    extends: cc.Component,

    properties: {
        trackButton: cc.Button,
        loginButton: cc.Button,
        logoutButton: cc.Button,
        setSuperButton: cc.Button,
        clearSuperButton: cc.Button,
        setUserButton: cc.Button,
        setAuthorizeopenidButton: cc.Button,
        timeEventButton: cc.Button
    },

    onLoad: function () {
        this.trackButton.node.on('click', this.callbackTrack, this);
        this.loginButton.node.on('click', this.callbackLogin, this);
        this.logoutButton.node.on('click', this.callbackLogout, this);
        this.setSuperButton.node.on('click', this.callbackSetSuper, this);
        this.clearSuperButton.node.on('click', this.callbackClearSuper, this);
        this.setUserButton.node.on('click', this.callbackSetUser, this);
        this.setAuthorizeopenidButton.node.on('click', this.callbackSetAuthorizeopenid, this);
        this.timeEventButton.node.on('click', this.callbackTimeEvent, this);
    },

    checkPlatform: function () {
        if(cc.sys.platform === cc.sys.VIVO_GAME || cc.sys.platform === cc.sys.OPPO_GAME || cc.sys.platform === cc.sys.WECHAT_GAME) {
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

    callbackSetSuper: function (button) {
        if(this.checkPlatform()) {
            ta.setSuperProperties({ "superkey": "supervalue", "superkey2": "supervalue2" });
        }
    },

    callbackClearSuper: function (button) {
        if(this.checkPlatform()) {
            ta.clearSuperProperties();
        }
    },

    callbackSetUser: function (button) {
        if(this.checkPlatform()) {
            ta.userSet({"level":26, "age":18});
            ta.userSetOnce({"cost":-30});
            ta.userAdd({"level":2});
            ta.userDel();
        }
    },

    callbackSetAuthorizeopenid: function (button) {
       if(this.checkPlatform()) {
            ta.authorizeOpenID('authorizeOpenID');
       }
    },
    
    // called every frame
    update: function (dt) {
       
    },
});
