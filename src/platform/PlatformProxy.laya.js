/* eslint-disable no-undef */

import PlatformProxy from './PlatformProxy';
import PlatformProxyVivo from './PlatformProxy.vivo.qg';
import PlatformProxyQg from './PlatformProxy.qg';
import PlatformProxyWeb from './PlatformProxy.web';

export default class PlatformProxyLaya {
    static createInstance() {
        if (Laya.Browser.onMiniGame) {
            return PlatformProxy._createInstance('wechat_mg');
        } else if (Laya.Browser.onBDMiniGame) {
            return PlatformProxy._createInstance('baidu_mg');
        } else if (Laya.Browser.onVVMiniGame) {
            return PlatformProxyVivo.createInstance();
        } else if (Laya.Browser.onQQMiniGame) {
            return PlatformProxy._createInstance('qq_mg');
        } else if (Laya.Browser.onQGMiniGame) {
            return PlatformProxyQg._createInstance('oppo');
            /** @TODO config.persistenceName = 'thinkingdata_qg_oppo_game'; */
        } else if (Laya.Browser.onHWMiniGame) {
            return PlatformProxyQg._createInstance('huawei');
        } else if (Laya.Browser.onKGMiniGame) {
            return PlatformProxyQg._createInstance('xiaomi');
        } else if (Laya.Browser.onTTMiniGame) {
            return PlatformProxy._createInstance('tt_mg');
        } else if (Laya.Browser.onBLMiniGame) {
            return PlatformProxy._createInstance('bl_mg');
        } else if (Laya.Browser.onAlipayMiniGame) {
            return PlatformProxy._createInstance('ali_mp');
        } else if (Laya.Browser.onTBMiniGame) {
            return PlatformProxy._createInstance('tb_mp');
        } else {
            return PlatformProxyWeb.createInstance();
        }
    }
}
