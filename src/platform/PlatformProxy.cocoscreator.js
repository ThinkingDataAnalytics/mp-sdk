/* eslint-disable no-undef */
import PlatformProxy from './PlatformProxy';
import PlatformProxyVivo from './PlatformProxy.vivo.qg';
import PlatformProxyQg from './PlatformProxy.qg';
import PlatformProxyWeb from './PlatformProxy.web';

export default class PlatformProxyCC {
    static createInstance() {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            return PlatformProxy._createInstance('wechat_mg');
        } else if (cc.sys.platform === cc.sys.BAIDU_GAME) {
            return PlatformProxy._createInstance('baidu_mg');
        } else if (cc.sys.platform === cc.sys.VIVO_GAME) {
            return PlatformProxyVivo.createInstance();
        } else if (cc.sys.platform === cc.sys.QQ_PLAY) {
            return PlatformProxy._createInstance('qq_mg');
        } else if (cc.sys.platform === cc.sys.OPPO_GAME) {
            return PlatformProxyQg._createInstance('oppo');
            /** @TODO config.persistenceName = 'thinkingdata_qg_oppo_game'; */
        } else if (cc.sys.platform === cc.sys.HUAWEI_GAME) {
            return PlatformProxyQg._createInstance('huawei');
        } else if (cc.sys.platform === cc.sys.XIAOMI_GAME) {
            return PlatformProxyQg._createInstance('xiaomi');
        } else if (cc.sys.platform === cc.sys.BYTEDANCE_GAME) {
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
