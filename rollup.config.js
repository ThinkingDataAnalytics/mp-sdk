/* eslint-disable no-undef */
import replace from 'rollup-plugin-replace';
import babel from 'rollup-plugin-babel';

const BUILD_CONFIG = {
    WECHAT_MP: true, // 微信小程序
    WECHAT_MG: true, // 微信小游戏
    QUICK_APP: true, // 快应用
    ALIPAY_MP: true, // 支付宝小程序
    TOUTIAO_MP: true, // 字节跳动小程序
    TOUTIAO_MG: true, // 字节跳动小游戏
    BAIDU_MP: true, // 百度小程序
    BAIDU_MG: true, // 百度小游戏
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
                include: ['src/Config.js', 'src/platform/PlatformAPI.js'],
                R_VERSION: process.env.npm_package_version,
                R_LIB_NAME: 'MP',
                R_PERSISTENCE_NAME: 'thinkingdata_wechat',
                R_IMPORT_CURRENT_PLATFORM: 'var currentPlatform = wx;',
                R_IMPORT_AUTO_TRACK_BRIDGE: 'import {AutoTrackBridge} from \'./AutoTrack.mp\'',
                R_PERSISTENCE_ASYNC: false,
                R_MP_PLATFORM: '\'wechat\'',
                R_ON_SHOW: 'onAppShow',
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
                include: ['src/Config.js', 'src/platform/PlatformAPI.js'],
                R_VERSION: process.env.npm_package_version,
                R_LIB_NAME: 'MG',
                R_PERSISTENCE_NAME: 'thinkingdata_wechat_game',
                R_IMPORT_CURRENT_PLATFORM: 'var currentPlatform = wx;',
                R_IMPORT_AUTO_TRACK_BRIDGE: 'import {AutoTrackBridge} from \'./AutoTrack.mg\'',
                R_PERSISTENCE_ASYNC: false,
                R_MP_PLATFORM: '\'wechat\'',
                R_ON_SHOW: 'onShow',
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
                include: ['src/Config.js', 'src/platform/*'],
                R_VERSION: process.env.npm_package_version,
                R_LIB_NAME: 'MP',
                R_PERSISTENCE_NAME: 'thinkingdata_quick_mp',
                R_IMPORT_CURRENT_PLATFORM: 'import currentPlatform from \'./PlatformAPI.quick\';',
                R_IMPORT_AUTO_TRACK_BRIDGE: 'import {AutoTrackBridge} from \'./AutoTrack.quick\'',
                R_PERSISTENCE_ASYNC: true,
                R_MP_PLATFORM: '\'quickapp\'',
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
            '@system.router'
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
                include: ['src/Config.js', 'src/platform/PlatformAPI.js'],
                R_VERSION: process.env.npm_package_version,
                R_LIB_NAME: 'MP',
                R_PERSISTENCE_NAME: 'thinkingdata_ali',
                R_IMPORT_CURRENT_PLATFORM: 'var currentPlatform = my;',
                R_IMPORT_AUTO_TRACK_BRIDGE: 'import {AutoTrackBridge} from \'./AutoTrack.mp\'',
                R_PERSISTENCE_ASYNC: false,
                R_MP_PLATFORM: 'res[\'app\']',
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
                include: ['src/Config.js', 'src/platform/PlatformAPI.js', 'src/platform/AutoTrack.mp.js'],
                R_VERSION: process.env.npm_package_version,
                R_LIB_NAME: 'MP',
                R_PERSISTENCE_NAME: 'thinkingdata_tt',
                R_IMPORT_CURRENT_PLATFORM: 'var currentPlatform = tt;',
                R_IMPORT_AUTO_TRACK_BRIDGE: 'import {AutoTrackBridge} from \'./AutoTrack.mp\'',
                R_PERSISTENCE_ASYNC: false,
                R_MP_PLATFORM: 'res[\'appName\']',
                'currentPage.route': 'currentPage.__route__', // 字节跳动小程序没有公开的route接口
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
                include: ['src/Config.js', 'src/platform/PlatformAPI.js'],
                R_VERSION: process.env.npm_package_version,
                R_LIB_NAME: 'MG',
                R_PERSISTENCE_NAME: 'thinkingdata_tt_game',
                R_IMPORT_CURRENT_PLATFORM: 'var currentPlatform = tt;',
                R_IMPORT_AUTO_TRACK_BRIDGE: 'import {AutoTrackBridge} from \'./AutoTrack.mg\'',
                R_PERSISTENCE_ASYNC: false,
                R_MP_PLATFORM: 'res[\'appName\']',
                R_ON_SHOW: 'onShow',
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
                include: ['src/Config.js', 'src/platform/PlatformAPI.js'],
                R_VERSION: process.env.npm_package_version,
                R_LIB_NAME: 'MP',
                R_PERSISTENCE_NAME: 'thinkingdata_swan',
                R_IMPORT_CURRENT_PLATFORM: 'var currentPlatform = swan;',
                R_IMPORT_AUTO_TRACK_BRIDGE: 'import {AutoTrackBridge} from \'./AutoTrack.mp\'',
                R_PERSISTENCE_ASYNC: false,
                R_ON_SHOW: 'onAppShow',
                R_MP_PLATFORM: 'res[\'host\']',
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
                include: ['src/Config.js', 'src/platform/PlatformAPI.js'],
                R_VERSION: process.env.npm_package_version,
                R_LIB_NAME: 'MG',
                R_PERSISTENCE_NAME: 'thinkingdata_swan_game',
                R_IMPORT_CURRENT_PLATFORM: 'var currentPlatform = swan;',
                R_IMPORT_AUTO_TRACK_BRIDGE: 'import {AutoTrackBridge} from \'./AutoTrack.mg\'',
                R_PERSISTENCE_ASYNC: false,
                R_MP_PLATFORM: 'res[\'host\']',
                R_ON_SHOW: 'onShow',
            }),
            babel({
                exclude: 'node_modules/**'
            })
        ]
    });
}

export default platforms;