/* eslint-disable no-undef */
import replace from 'rollup-plugin-replace';
import babel from 'rollup-plugin-babel';
import {terser} from 'rollup-plugin-terser';

const BUILD_CONFIG = {
    WECHAT_MP: true, // 微信小程序
    WECHAT_MG: true, // 微信小游戏
    QUICK_APP: true, // 快应用
    ALIPAY_MP: true, // 支付宝小程序
    TOUTIAO_MP: true, // 字节跳动小程序
    TOUTIAO_MG: true, // 字节跳动小游戏
    BAIDU_MP: true, // 百度小程序
    BAIDU_MG: true, // 百度小游戏
    QQ_MG: true, // QQ 小游戏
    OPPO_MG: true, // OPPO 快游戏
    VIVO_MG: true, // VIVO 快游戏
    EGRET_MG: true, // Egret 白鹭引擎
    LAYA_MG: true, // Laya 引擎
    COCOSCREATOR_MG: true, // CocosCreator 引擎
};

const platforms = [];

if (BUILD_CONFIG.WECHAT_MP) {
    platforms.push({
        input: 'src/loader-module.js',
        output: {
            file: 'build/thinkingdata.wx.js',
            name: 'thinkingdata',
            format: 'cjs'
        },
        plugins: [
            replace({
                include: ['src/Config.js', 'src/platform/PlatformAPI.js', 'src/ThinkingDataAPI.js', 'src/SenderQueue.js'],
                R_VERSION: process.env.npm_package_version,
                R_LIB_NAME: 'MP',
                R_PERSISTENCE_NAME: 'thinkingdata_wechat',
                R_IMPORT_CURRENT_PLATFORM: 'var currentPlatform = wx;',
                R_IMPORT_AUTO_TRACK_BRIDGE: 'import {AutoTrackBridge} from \'./AutoTrack.mp\'',
                R_PERSISTENCE_ASYNC: false,
                R_MP_PLATFORM: '\'wechat\'',
                R_ON_SHOW: 'onAppShow',
                R_IMPORT_PLATFORMAPI: 'import {PlatformAPI} from \'./platform/PlatformAPI\';',
            }),
            babel({
                exclude: 'node_modules/**'
            })
        ]
    });
}

if (BUILD_CONFIG.WECHAT_MG) {
    platforms.push({
        input: 'src/loader-module.js',
        output: {
            file: 'build/thinkingdata.mg.wx.js',
            name: 'thinkingdata',
            format: 'cjs'
        },
        plugins: [
            replace({
                include: ['src/Config.js', 'src/platform/PlatformAPI.js', 'src/ThinkingDataAPI.js', 'src/SenderQueue.js'],
                R_VERSION: process.env.npm_package_version,
                R_LIB_NAME: 'MG',
                R_PERSISTENCE_NAME: 'thinkingdata_wechat_game',
                R_IMPORT_CURRENT_PLATFORM: 'var currentPlatform = wx;',
                R_IMPORT_AUTO_TRACK_BRIDGE: 'import {AutoTrackBridge} from \'./AutoTrack.mg\'',
                R_PERSISTENCE_ASYNC: false,
                R_MP_PLATFORM: '\'wechat\'',
                R_ON_SHOW: 'onShow',
                R_IMPORT_PLATFORMAPI: 'import {PlatformAPI} from \'./platform/PlatformAPI\';',
            }),
            babel({
                exclude: 'node_modules/**'
            })
        ]
    });
}

if (BUILD_CONFIG.QUICK_APP) {

    const banner = '/* eslint-disable no-console */      \n' +
                   '/* eslint-disable indent */          \n' +
                   '/* eslint-disable quotes */          \n' +
                   '/* eslint-disable semi */            \n' +
                   '/* eslint-disable no-func-assign */  \n';

    platforms.push({
        input: 'src/ThinkingDataAPI.js',
        output: {
            banner: banner,
            file: 'build/thinkingdata.quick.js',
            name: 'thinkingdata',
            format: 'cjs'
        },
        plugins: [
            replace({
                include: ['src/Config.js', 'src/platform/*', 'src/ThinkingDataAPI.js', 'src/SenderQueue.js'],
                R_VERSION: process.env.npm_package_version,
                R_LIB_NAME: 'MP',
                R_PERSISTENCE_NAME: 'thinkingdata_quick_mp',
                R_IMPORT_CURRENT_PLATFORM: 'import currentPlatform from \'./PlatformAPI.quick\';',
                R_IMPORT_AUTO_TRACK_BRIDGE: 'import {AutoTrackBridge} from \'./AutoTrack.quick\'',
                R_PERSISTENCE_ASYNC: true,
                R_MP_PLATFORM: '\'quickapp\'',
                R_IMPORT_PLATFORMAPI: 'import {PlatformAPI} from \'./platform/PlatformAPI\';',
            }),
            babel({
                exclude: 'node_modules/**'
            })
        ],
        external: [
            '@system.fetch',
            '@system.device',
            '@system.network',
            '@system.storage',
            '@system.router',
            '@system.prompt'
        ]
    });
}

if (BUILD_CONFIG.ALIPAY_MP) {
    platforms.push({
        input: 'src/loader-module.js',
        output: {
            file: 'build/thinkingdata.my.js',
            name: 'thinkingdata',
            format: 'cjs'
        },
        plugins: [
            replace({
                include: ['src/Config.js'],
                R_VERSION: process.env.npm_package_version,
                R_LIB_NAME: 'MP',
                R_PERSISTENCE_NAME: 'thinkingdata_ali',
                R_PERSISTENCE_ASYNC: false,
            }),
            replace({
                include: ['src/ThinkingDataAPI.js', 'src/SenderQueue.js'],
                R_IMPORT_PLATFORMAPI: 'import {PlatformAPI} from \'./platform/PlatformAPI.my\';',
            }),
            replace({
                include: ['src/SenderQueue.js'],
                'res.statusCode': 'res.status',
                'res.errMsg': 'res.errorMessage',
            }),
            babel({
                exclude: 'node_modules/**'
            })
        ],
    });
}

if (BUILD_CONFIG.TOUTIAO_MP) {
    platforms.push({
        input: 'src/loader-module.js',
        output: {
            file: 'build/thinkingdata.tt.js',
            name: 'thinkingdata',
            format: 'cjs'
        },
        plugins: [
            replace({
                include: ['src/Config.js', 'src/platform/PlatformAPI.js', 'src/platform/AutoTrack.mp.js', 'src/ThinkingDataAPI.js', 'src/SenderQueue.js'],
                R_VERSION: process.env.npm_package_version,
                R_LIB_NAME: 'MP',
                R_PERSISTENCE_NAME: 'thinkingdata_tt',
                R_IMPORT_CURRENT_PLATFORM: 'var currentPlatform = tt;',
                R_IMPORT_AUTO_TRACK_BRIDGE: 'import {AutoTrackBridge} from \'./AutoTrack.mp\'',
                R_PERSISTENCE_ASYNC: false,
                R_MP_PLATFORM: 'res[\'appName\']',
                'currentPage.route': 'currentPage.__route__', // 字节跳动小程序没有公开的route接口
                R_IMPORT_PLATFORMAPI: 'import {PlatformAPI} from \'./platform/PlatformAPI\';',
            }),
            babel({
                exclude: 'node_modules/**'
            })
        ]
    });
}

if (BUILD_CONFIG.TOUTIAO_MG) {
    platforms.push({
        input: 'src/loader-module.js',
        output: {
            file: 'build/thinkingdata.mg.tt.js',
            name: 'thinkingdata',
            format: 'cjs'
        },
        plugins: [
            replace({
                include: ['src/Config.js', 'src/platform/PlatformAPI.js', 'src/ThinkingDataAPI.js', 'src/SenderQueue.js'],
                R_VERSION: process.env.npm_package_version,
                R_LIB_NAME: 'MG',
                R_PERSISTENCE_NAME: 'thinkingdata_tt_game',
                R_IMPORT_CURRENT_PLATFORM: 'var currentPlatform = tt;',
                R_IMPORT_AUTO_TRACK_BRIDGE: 'import {AutoTrackBridge} from \'./AutoTrack.mg\'',
                R_PERSISTENCE_ASYNC: false,
                R_MP_PLATFORM: 'res[\'appName\']',
                R_ON_SHOW: 'onShow',
                R_IMPORT_PLATFORMAPI: 'import {PlatformAPI} from \'./platform/PlatformAPI\';',
            }),
            babel({
                exclude: 'node_modules/**'
            })
        ]
    });
}

if (BUILD_CONFIG.BAIDU_MP) {
    platforms.push({
        input: 'src/loader-module.js',
        output: {
            file: 'build/thinkingdata.swan.js',
            name: 'thinkingdata',
            format: 'cjs'
        },
        plugins: [
            replace({
                include: ['src/Config.js', 'src/platform/PlatformAPI.js', 'src/ThinkingDataAPI.js', 'src/SenderQueue.js'],
                R_VERSION: process.env.npm_package_version,
                R_LIB_NAME: 'MP',
                R_PERSISTENCE_NAME: 'thinkingdata_swan',
                R_IMPORT_CURRENT_PLATFORM: 'var currentPlatform = swan;',
                R_IMPORT_AUTO_TRACK_BRIDGE: 'import {AutoTrackBridge} from \'./AutoTrack.mp\'',
                R_PERSISTENCE_ASYNC: false,
                R_ON_SHOW: 'onAppShow',
                R_MP_PLATFORM: 'res[\'host\']',
                R_IMPORT_PLATFORMAPI: 'import {PlatformAPI} from \'./platform/PlatformAPI\';',
            }),
            babel({
                exclude: 'node_modules/**'
            })
        ]
    });
}

if (BUILD_CONFIG.BAIDU_MG) {
    platforms.push({
        input: 'src/loader-module.js',
        output: {
            file: 'build/thinkingdata.mg.swan.js',
            name: 'thinkingdata',
            format: 'cjs'
        },
        plugins: [
            replace({
                include: ['src/Config.js', 'src/platform/PlatformAPI.js', 'src/ThinkingDataAPI.js', 'src/SenderQueue.js'],
                R_VERSION: process.env.npm_package_version,
                R_LIB_NAME: 'MG',
                R_PERSISTENCE_NAME: 'thinkingdata_swan_game',
                R_IMPORT_CURRENT_PLATFORM: 'var currentPlatform = swan;',
                R_IMPORT_AUTO_TRACK_BRIDGE: 'import {AutoTrackBridge} from \'./AutoTrack.mg\'',
                R_PERSISTENCE_ASYNC: false,
                R_MP_PLATFORM: 'res[\'host\']',
                R_ON_SHOW: 'onShow',
                R_IMPORT_PLATFORMAPI: 'import {PlatformAPI} from \'./platform/PlatformAPI\';'
            }),
            babel({
                exclude: 'node_modules/**'
            })
        ]
    });
}

if (BUILD_CONFIG.QQ_MG) {
    platforms.push({
        input: 'src/loader-module.js',
        output: {
            file: 'build/thinkingdata.mg.qq.js',
            name: 'thinkingdata',
            format: 'cjs'
        },
        plugins: [
            replace({
                include: ['src/Config.js', 'src/platform/PlatformAPI.js', 'src/ThinkingDataAPI.js', 'src/SenderQueue.js'],
                R_VERSION: process.env.npm_package_version,
                R_LIB_NAME: 'MG',
                R_PERSISTENCE_NAME: 'thinkingdata_qq_game',
                R_IMPORT_CURRENT_PLATFORM: 'var currentPlatform = qq;',
                R_IMPORT_AUTO_TRACK_BRIDGE: 'import {AutoTrackBridge} from \'./AutoTrack.mg\'',
                R_PERSISTENCE_ASYNC: false,
                R_MP_PLATFORM: '\'qq\'',
                R_ON_SHOW: 'onShow',
                R_IMPORT_PLATFORMAPI: 'import {PlatformAPI} from \'./platform/PlatformAPI\';',
            }),
            babel({
                exclude: 'node_modules/**'
            })
        ]
    });
}

if (BUILD_CONFIG.OPPO_MG) {
    platforms.push({
        input: 'src/loader-module.js',
        output: {
            file: 'build/thinkingdata.mg.qg.oppo.js',
            name: 'thinkingdata',
            format: 'cjs'
        },
        plugins: [
            replace({
                include: ['src/Config.js', 'src/platform/PlatformAPI.js', 'src/ThinkingDataAPI.js', 'src/SenderQueue.js'],
                R_VERSION: process.env.npm_package_version,
                R_LIB_NAME: 'MG',
                R_PERSISTENCE_NAME: 'thinkingdata_qg_game',
                R_IMPORT_CURRENT_PLATFORM: 'import currentPlatform from \'./PlatformAPI.oppo.qg\';',
                R_IMPORT_AUTO_TRACK_BRIDGE: 'import {AutoTrackBridge} from \'./AutoTrack.oppo.qg\'',
                R_PERSISTENCE_ASYNC: false,
                R_MP_PLATFORM: '\'oppo_qg\'',
                R_ON_SHOW: 'onShow',
                R_IMPORT_PLATFORMAPI: 'import {PlatformAPI} from \'./platform/PlatformAPI\';',
            }),
            babel({
                exclude: 'node_modules/**'
            })
        ]
    });
}

if (BUILD_CONFIG.VIVO_MG) {
    platforms.push({
        input: 'src/loader-module.js',
        output: {
            file: 'build/thinkingdata.mg.qg.vivo.js',
            name: 'thinkingdata',
            format: 'cjs'
        },
        plugins: [
            replace({
                include: ['src/Config.js', 'src/platform/PlatformAPI.js', 'src/ThinkingDataAPI.js', 'src/SenderQueue.js'],
                R_VERSION: process.env.npm_package_version,
                R_LIB_NAME: 'MG',
                R_PERSISTENCE_NAME: 'thinkingdata_qg_vivo_game',
                R_IMPORT_CURRENT_PLATFORM: 'import currentPlatform from \'./PlatformAPI.vivo.qg\';',
                R_IMPORT_AUTO_TRACK_BRIDGE: 'import {AutoTrackBridge} from \'./AutoTrack.vivo.qg\'',
                R_PERSISTENCE_ASYNC: true,
                R_MP_PLATFORM: '\'vivo_qg\'',
                R_ON_SHOW: 'onShow',
                R_IMPORT_PLATFORMAPI: 'import {PlatformAPI} from \'./platform/PlatformAPI\';',
            }),
            babel({
                exclude: 'node_modules/**'
            })
        ]
    });
}

if (BUILD_CONFIG.EGRET_MG) {
    platforms.push({
        input: 'src/loader-module-egret.js',
        output: {
            file: 'build/thinkingdata.mg.egret.js',
            name: 'thinkingdata',
            format: 'cjs'
        },
        plugins: [
            replace({
                include: ['src/Config.js'],
                R_VERSION: process.env.npm_package_version,
                R_LIB_NAME: 'MG',
                R_PERSISTENCE_ASYNC: false, 
            }),
            replace({
                include: ['src/ThinkingDataAPI.js', 'src/SenderQueue.js'],
                R_IMPORT_PLATFORMAPI: 'import {PlatformAPI} from \'./platform/PlatformAPI.egret\';',
            }),
            babel({
                exclude: 'node_modules/**'
            })
        ]
    });
}

if (BUILD_CONFIG.LAYA_MG) {
    // 未压缩
    platforms.push({
        input: 'src/loader-module-laya.js',
        output: {
            file: 'build/thinkingdata.mg.laya.js',
            name: 'thinkingdata',
            format: 'es'
        },
        plugins: [
            replace({
                include: ['src/Config.js'],
                R_VERSION: process.env.npm_package_version,
                R_LIB_NAME: 'MG',
                R_PERSISTENCE_ASYNC: false, 
            }),
            replace({
                include: ['src/ThinkingDataAPI.js', 'src/SenderQueue.js'],
                R_IMPORT_PLATFORMAPI: 'import {PlatformAPI} from \'./platform/PlatformAPI.laya\';',
            }),
            babel({
                exclude: 'node_modules/**'
            })
        ]
    });

    platforms.push({
        input: 'src/loader-module-laya.js',
        output: {
            file: 'build/thinkingdata.mg.laya.min.js',
            name: 'thinkingdata',
            format: 'es',
        },
        plugins: [
            replace({
                include: ['src/Config.js'],
                R_VERSION: process.env.npm_package_version,
                R_LIB_NAME: 'MG',
                R_PERSISTENCE_ASYNC: false, 
            }),
            replace({
                include: ['src/ThinkingDataAPI.js', 'src/SenderQueue.js'],
                R_IMPORT_PLATFORMAPI: 'import {PlatformAPI} from \'./platform/PlatformAPI.laya\';',
            }),
            babel({
                exclude: 'node_modules/**'
            }),
            terser()
        ]
    });
}

if (BUILD_CONFIG.COCOSCREATOR_MG) {
    platforms.push({
        input: 'src/loader-module-egret.js',
        output: {
            file: 'build/thinkingdata.mg.cocoscreator.js',
            name: 'thinkingdata',
            format: 'cjs'
        },
        plugins: [
            replace({
                include: ['src/Config.js'],
                R_VERSION: process.env.npm_package_version,
                R_LIB_NAME: 'MG',
                R_PERSISTENCE_ASYNC: false, 
            }),
            replace({
                include: ['src/ThinkingDataAPI.js', 'src/SenderQueue.js'],
                R_IMPORT_PLATFORMAPI: 'import {PlatformAPI} from \'./platform/PlatformAPI.cocoscreator\';',
            }),
            babel({
                exclude: 'node_modules/**'
            })
        ]
    });
}

export default platforms;
