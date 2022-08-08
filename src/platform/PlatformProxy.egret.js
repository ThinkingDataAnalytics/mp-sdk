/* eslint-disable no-undef */
import {
    _
} from '../utils';
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
        } else if (egret.Capabilities.runtimeType === egret.RuntimeType.QHGAME) {
            return PlatformProxy._createInstance('qh360_mg');
        } else if (egret.Capabilities.runtimeType === egret.RuntimeType.TTGAME) {
            return PlatformProxy._createInstance('tt_mg');
        } else if (egret.Capabilities.runtimeType === egret.RuntimeType.MYGAME) {
            return PlatformProxy._createInstance('ali_mp');
        } else if (egret.Capabilities.runtimeType === egret.RuntimeType.TBCREATIVEAPP) {
            return PlatformProxy._createInstance('tb_mp');
        } else {
            let platform = PlatformProxyWeb.createInstance();

            platform._sysCallback = function() {
                return {
                    system: egret.Capabilities.os.replace(/\s*/g, ''),
                    // eslint-disable-next-line
                    mp_platform: egret.Capabilities.runtimeType,
                };
            };

            platform.request = function (options) {
                var res = {};
                let httpMethod = options.method === 'GET' ? egret.HttpMethod.GET : egret.HttpMethod.POST;
                let request = new egret.HttpRequest();
                request.timeout = 10000;
                request.responseType = egret.HttpResponseType.TEXT;
                request.open(options.url, httpMethod);
                if (options.header) {
                    for (var key in options.header) {
                        request.setRequestHeader(key, options.header[key]);
                    }
                }
                request.send(options.data);
                request.addEventListener(egret.Event.COMPLETE, function(event){
                    res['statusCode'] = 200;
                    var response = event.currentTarget.response;
                    if (_.isJSONString(response)) {
                        res['data'] = JSON.parse(response);
                    }
                    options.success(res);
                }, platform);
                request.addEventListener(egret.IOErrorEvent.IO_ERROR, function(event){
                    res.errMsg = 'network error';
                    options.fail(res);
                },platform);
                return request;
            };
            return platform;
        }
    }
}
