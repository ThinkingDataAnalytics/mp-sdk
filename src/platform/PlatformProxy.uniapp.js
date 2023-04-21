import { logger } from '../utils';
import PlatformProxy from './PlatformProxy';
export default class PlatformProxyUniapp extends PlatformProxy {
    static createInstance() {

        var proxy = new PlatformProxyUniapp(uni, { persistenceName: 'thinkingdata', persistenceNameOld: 'thinkingdata_uniapp' }, { mpPlatform: 'uniapp', mp: true, platform: 'uniapp' });

        // #ifdef  MP-WEIXIN
        proxy = PlatformProxy._createInstance('wechat_mp');
        // #endif

        // #ifdef  MP-ALIPAY
        proxy = PlatformProxy._createInstance('ali_mp');
        // #endif

        // #ifdef  MP-BAIDU
        proxy = PlatformProxy._createInstance('baidu_mp');
        // #endif

        // #ifdef  MP-TOUTIAO
        proxy = PlatformProxy._createInstance('tt_mp');
        // #endif

        // #ifdef  MP-LARK
        proxy = PlatformProxy._createInstance('tt_mp');
        // #endif

        // #ifdef  MP-QQ
        proxy = PlatformProxy._createInstance('qq_mp');
        // #endif

        // #ifdef  MP-KUAISHOU
        proxy = PlatformProxy._createInstance('kuaishou_mp');
        // #endif

        // #ifdef  MP-JD
        proxy = PlatformProxy._createInstance('jd_mp');
        // #endif

        // #ifdef  MP-360
        proxy = PlatformProxy._createInstance('qh360_mp');
        // #endif

        // #ifdef  H5
        proxy = PlatformProxy._createInstance('WEB');
        // #endif

        return proxy;
    }

    initAutoTrackInstance(instance, config) {
        logger.info(instance);
        logger.info(config);
    }

}
