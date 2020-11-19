/* eslint-disable no-undef */
import PlatformProxy from './PlatformProxy';
import PlatformProxyVivo from './PlatformProxy.vivo.qg';
import PlatformProxyQg from './PlatformProxy.qg';
import PlatformProxyWeb from './PlatformProxy.web';

export default class PlatformProxyEgret {
    static createInstance() {
        if (egret.Capabilities.runtimeType === egret.RuntimeType.WXGAME) {
            return PlatformProxy._createInstance('wechat_mg');
        } else if (egret.Capabilities.runtimeType === egret.RuntimeType.BAIDUGAME) {
            return PlatformProxy._createInstance('baidu_mg');
        } else if (egret.Capabilities.runtimeType === egret.RuntimeType.QQGAME) {
            return PlatformProxy._createInstance('qq_mg');
        } else if (egret.Capabilities.runtimeType === egret.RuntimeType.VIVOGAME) {
            return PlatformProxyVivo.createInstance();
        } else if (egret.Capabilities.runtimeType === egret.RuntimeType.OPPOGAME) {
            return PlatformProxyQg._createInstance('oppo');
            /** @TODO config.persistenceName = 'thinkingdata_qg_oppo_game'; */
        } else if (egret.Capabilities.runtimeType === egret.RuntimeType.QGAME) {
            return PlatformProxyQg._createInstance('xiaomi');
        } else if (egret.Capabilities.runtimeType === egret.RuntimeType.FASTGAME) {
            return PlatformProxyQg._createInstance('huawei');
        } else {
            let platform = PlatformProxyWeb.createInstance();

            platform._sysCallback = function() {
                return {
                    system: egret.Capabilities.os.replace(/\s*/g, ''),
                    // eslint-disable-next-line
                    mp_platform: egret.Capabilities.runtimeType,
                };
            };
            return platform;
        }
    }
}
