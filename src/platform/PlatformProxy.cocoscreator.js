/* eslint-disable no-undef */
import PlatformProxy from './PlatformProxy';
import PlatformProxyVivo from './PlatformProxy.vivo.qg';
import PlatformProxyQg from './PlatformProxy.qg';
import PlatformProxyWeb from './PlatformProxy.web';

export default class PlatformProxyCC {
    static createInstance() {
        var CCPlatform = Object.freeze({
            "WECHAT_GAME" : 104,
            "QQ_PLAY" :  105,
            "BAIDU_GAME" : 107,
            "VIVO_GAME" : 108,
            "OPPO_GAME" : 109,
            "HUAWEI_GAME" : 110,
            "XIAOMI_GAME" : 111,
            "BYTEDANCE_GAME" : 117,

            "WECHAT_MINI_GAME" : 'WECHAT_GAME',
            "BAIDU_MINI_GAME" : 'BAIDU_MINI_GAME',
            "XIAOMI_QUICK_GAME" : 'XIAOMI_QUICK_GAME',
            "OPPO_MINI_GAME" : 'OPPO_MINI_GAME',
            "VIVO_MINI_GAME" : 'VIVO_MINI_GAME',
            "HUAWEI_QUICK_GAME" : 'HUAWEI_QUICK_GAME',
            "BYTEDANCE_MINI_GAME" : 'BYTEDANCE_MINI_GAME'
        });
        if (cc.sys.platform === CCPlatform.WECHAT_GAME || cc.sys.platform === CCPlatform.WECHAT_MINI_GAME) {
            return PlatformProxy._createInstance('wechat_mg');
        } else if (cc.sys.platform === CCPlatform.BAIDU_GAME || cc.sys.platform === CCPlatform.BAIDU_MIN_GAME) {
            return PlatformProxy._createInstance('baidu_mg');
        } else if (cc.sys.platform === CCPlatform.VIVO_GAME || cc.sys.platform === CCPlatform.VIVO_MINI_GAME) {
            return PlatformProxyVivo.createInstance();
        } else if (cc.sys.platform === CCPlatform.QQ_PLAY) {
            return PlatformProxy._createInstance('qq_mg');
        } else if (cc.sys.platform === CCPlatform.OPPO_GAME || cc.sys.platform === CCPlatform.OPPO_MINI_GAME) {
            return PlatformProxyQg._createInstance('oppo');
            /** @TODO config.persistenceName = 'thinkingdata_qg_oppo_game'; */
        } else if (cc.sys.platform === CCPlatform.HUAWEI_GAME || cc.sys.platform === CCPlatform.HUAWEI_QUICK_GAME) {
            return PlatformProxyQg._createInstance('huawei');
        } else if (cc.sys.platform === CCPlatform.XIAOMI_GAME || cc.sys.platform === CCPlatform.XIAOMI_QUICK_GAME) {
            return PlatformProxyQg._createInstance('xiaomi');
        } else if (cc.sys.platform === CCPlatform.BYTEDANCE_GAME || cc.sys.platform === CCPlatform.BYTEDANCE_MINI_GAME) {
            return PlatformProxy._createInstance('tt_mg');
        //} else if (cc.sys.isBrowser) {
        } else {
            let platform = PlatformProxyWeb.createInstance();

            platform._sysCallback = function() {
                return {
                    system: cc.sys.os + ' ' + cc.sys.osVersion,
                };
            };
            return platform;
        }
    }
}
