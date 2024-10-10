/* eslint-disable no-undef */
import PlatformProxy from './PlatformProxy';
import PlatformProxyVivo from './PlatformProxy.vivo.qg';
import PlatformProxyQg from './PlatformProxy.qg';
import PlatformProxyWeb from './PlatformProxy.web';
import { _ } from '../utils';

export default class PlatformProxyCC {
    static createInstance() {
        var CCPlatform = Object.freeze({
            'WECHAT_GAME': 104,
            'QQ_PLAY': 105,
            'BAIDU_GAME': 107,
            'VIVO_GAME': 108,
            'OPPO_GAME': 109,
            'HUAWEI_GAME': 110,
            'XIAOMI_GAME': 111,
            'BYTEDANCE_GAME': 117,
            'QTT_GAME': 116,
            'LINKSURE': 119,
            'ALI_GAME': 113,

            'WECHAT_MINI_GAME': 'WECHAT_GAME',
            'BAIDU_MINI_GAME': 'BAIDU_MINI_GAME',
            'XIAOMI_QUICK_GAME': 'XIAOMI_QUICK_GAME',
            'OPPO_MINI_GAME': 'OPPO_MINI_GAME',
            'VIVO_MINI_GAME': 'VIVO_MINI_GAME',
            'HUAWEI_QUICK_GAME': 'HUAWEI_QUICK_GAME',
            'BYTEDANCE_MINI_GAME': 'BYTEDANCE_MINI_GAME',
            'QTT_MINI_GAME': 'QTT_MINI_GAME',
            'LINKSURE_MINI_GAME': 'LINKSURE_MINI_GAME',
            'ALIPAY_MINI_GAME': 'ALIPAY_MINI_GAME'
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
        } else if (cc.sys.platform === CCPlatform.ALI_GAME || cc.sys.platform === CCPlatform.ALIPAY_MINI_GAME) {
            return PlatformProxy._createInstance('ali_mg');
        } else {
            let platform = PlatformProxyWeb.createInstance();

            platform._sysCallback = function () {
                return {
                    system: cc.sys.os.replace(' ', '') + ' ' + cc.sys.osVersion,
                };
            };

            platform.getNetworkType = function (options) {
                var network = {};
                switch (cc.sys.getNetworkType()) {
                    case cc.sys.NetworkType.LAN:
                        network['networkType'] = 'WIFI'; break;
                    case cc.sys.NetworkType.WWAN:
                        network['networkType'] = 'WWAN'; break;
                    default:
                        network['networkType'] = 'NONE'; break;
                }
                options.success(network);
                options.complete();
            };
            platform.getSystemInfo = function (options) {
                let res = {
                    // eslint-disable-next-line
                    mp_platform: cc.sys.platform.toString(),
                    system: platform._getOs(),
                    screenWidth: window.screen.width,
                    screenHeight: window.screen.height,
                    // systemLanguage: cc.sys.language,
                };
                if (platform._sysCallback) {
                    res = _.extend(res, platform._sysCallback(options));
                }
                options.success(res);
                options.complete();
            };
            return platform;
        }
    }
}
