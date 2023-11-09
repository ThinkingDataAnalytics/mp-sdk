/* eslint-disable no-undef */
import replace from 'rollup-plugin-replace';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';

const BUILD_CONFIG = {};
if (process.env.BUILD) {
  BUILD_CONFIG[process.env.BUILD] = true;
} else {
  BUILD_CONFIG.ALL = true;
}

const platforms = [];
var addConfig = function (output, libName, currentPlatform, isQg) {

  let platformProxy = isQg ? 'PlatformProxy.qg.js' : 'PlatformProxy.js';
  platforms.push({
    // input: 'src/ThinkingDataAPI.js',
    input: 'src/TDAnalytics.js',
    output: {
      file: output,
      name: 'thinkingdata',
      format: 'cjs'
    },
    plugins: [
      replace({
        include: ['src/Config.js', 'src/PlatformAPI.js', 'src/platform/' + platformProxy, 'src/TDAnalytics.js'],
        R_VERSION: process.env.npm_package_version,
        R_LIB_NAME: libName,
        R_PLATFORM_PROXY: './platform/' + platformProxy,
        R_CURRENT_PLATFORM: currentPlatform,
        R_PLATFORM_IMPORT: './ThinkingDataAPI'
      }),
      babel({
        exclude: 'node_modules/**'
      })
    ]
  });
};

if (BUILD_CONFIG.WECHAT_MP || BUILD_CONFIG.ALL) {
  addConfig('build/tdanalytics.wx.js', 'MP', 'wechat_mp');
}


if (BUILD_CONFIG.WECHAT_MG || BUILD_CONFIG.ALL) {
  addConfig('build/tdanalytics.mg.wx.js', 'MG', 'wechat_mg');
}

if (BUILD_CONFIG.KUAISHOU_MP || BUILD_CONFIG.ALL) {
  addConfig('build/tdanalytics.ks.js', 'MP', 'kuaishou_mp');
}
if (BUILD_CONFIG.QUICK_APP || BUILD_CONFIG.ALL) {
  platforms.push({
    input: 'src/ThinkingDataAPI.js',
    output: {
      file: 'build/tdanalytics.quick.js',
      name: 'thinkingdata',
      format: 'cjs'
    },
    plugins: [
      replace({
        include: ['src/Config.js', 'src/PlatformAPI.js', 'src/TDAnalytics.js'],
        R_VERSION: process.env.npm_package_version,
        R_LIB_NAME: 'MP',
        R_PLATFORM_PROXY: './platform/PlatformProxy.quick.js',
        R_PLATFORM_IMPORT: './ThinkingDataAPI'
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

if (BUILD_CONFIG.ALIPAY_MP || BUILD_CONFIG.ALL) {
  addConfig('build/tdanalytics.my.js', 'MP', 'ali_mp');
}

if (BUILD_CONFIG.DINGDING_MP || BUILD_CONFIG.ALL) {
  addConfig('build/tdanalytics.dd.js', 'MP', 'dd_mp');
}

if (BUILD_CONFIG.TOUTIAO_MP || BUILD_CONFIG.ALL) {
  platforms.push({
    input: 'src/ThinkingDataAPI.js',
    output: {
      file: 'build/tdanalytics.tt.js',
      name: 'thinkingdata',
      format: 'cjs'
    },
    plugins: [
      replace({
        include: ['src/Config.js', 'src/PlatformAPI.js', 'src/platform/PlatformProxy.js', 'src/platform/AutoTrack.mp.js', 'src/TDAnalytics.js'],
        R_VERSION: process.env.npm_package_version,
        R_LIB_NAME: 'MP',
        R_PLATFORM_PROXY: './platform/PlatformProxy',
        'currentPage.route': 'currentPage.__route__', // 字节跳动小程序没有公开的route接口
        R_CURRENT_PLATFORM: 'tt_mp',
        R_PLATFORM_IMPORT: './ThinkingDataAPI'
      }),
      babel({
        exclude: 'node_modules/**'
      })
    ]
  });
}

if (BUILD_CONFIG.TOUTIAO_MG || BUILD_CONFIG.ALL) {
  addConfig('build/tdanalytics.mg.tt.js', 'MG', 'tt_mg');
}

if (BUILD_CONFIG.BAIDU_MP || BUILD_CONFIG.ALL) {
  addConfig('build/tdanalytics.swan.js', 'MP', 'baidu_mp');
}

if (BUILD_CONFIG.BAIDU_MG || BUILD_CONFIG.ALL) {
  addConfig('build/tdanalytics.mg.swan.js', 'MG', 'baidu_mg');
}

if (BUILD_CONFIG.QQ_MP || BUILD_CONFIG.ALL) {
  addConfig('build/tdanalytics.qq.js', 'MP', 'qq_mp');
}

if (BUILD_CONFIG.JD_MP || BUILD_CONFIG.ALL) {
  addConfig('build/tdanalytics.jd.js', 'MP', 'jd_mp');
}

if (BUILD_CONFIG.QH_MP || BUILD_CONFIG.ALL) {
  addConfig('build/tdanalytics.qh.js', 'MP', 'qh360_mp');
}

if (BUILD_CONFIG.QQ_MG || BUILD_CONFIG.ALL) {
  addConfig('build/tdanalytics.mg.qq.js', 'MG', 'qq_mg');
}

if (BUILD_CONFIG.BILIBILI_MG || BUILD_CONFIG.ALL) {
  addConfig('build/tdanalytics.mg.bl.js', 'MG', 'bl_mg');
}

if (BUILD_CONFIG.OPPO_MG || BUILD_CONFIG.ALL) {
  addConfig('build/tdanalytics.mg.oppo.js', 'MG', 'oppo', true);
}

if (BUILD_CONFIG.HUAWEI_MG || BUILD_CONFIG.ALL) {
  addConfig('build/tdanalytics.mg.huawei.js', 'MG', 'huawei', true);
}
if (BUILD_CONFIG.XIAOMI_MG || BUILD_CONFIG.ALL) {
  addConfig('build/tdanalytics.mg.xiaomi.js', 'MG', 'xiaomi', true);
}
if (BUILD_CONFIG.MZ || BUILD_CONFIG.ALL) {
  addConfig('build/tdanalytics.mg.mz.js', 'MG', 'mz', true);
}

if (BUILD_CONFIG.WEB) {
  addConfig('build/tdanalytics.web.js', 'WEB', 'WEB');
}

if (BUILD_CONFIG.VIVO_MG || BUILD_CONFIG.ALL) {
  platforms.push({
    // input: 'src/ThinkingDataAPI.js',
    input: 'src/TDAnalytics.js',
    output: {
      file: 'build/tdanalytics.mg.vivo.js',
      name: 'thinkingdata',
      format: 'es'
    },
    plugins: [
      replace({
        include: ['src/Config.js', 'src/PlatformAPI.js', 'src/TDAnalytics.js'],
        R_VERSION: process.env.npm_package_version,
        R_LIB_NAME: 'MG',
        R_PLATFORM_PROXY: './platform/PlatformProxy.vivo.qg',
        R_PLATFORM_IMPORT: './ThinkingDataAPI'
      }),
      babel({
        exclude: 'node_modules/**'
      })
    ]
  });
}

// 游戏引擎打包配置
var addEngineConfig = function (name, js) {
  let finalInput = 'src/loader-global.js';
  let format = 'cjs';
  let outputSuffix = name;
  let engineInput = 'src/loader-global.js';

  if (name === 'laya') {
    if (js) {
      // finalInput = 'src/ThinkingDataAPI.laya.js';
      finalInput = 'src/TDAnalytics.laya.js';
      format = 'es';
    } else {
      // finalInput = 'src/ThinkingDataAPI.laya.js';
      finalInput = 'src/TDAnalytics.laya.js';
      outputSuffix = 'layats';
    }
    engineInput = './ThinkingDataAPI.laya.js';
  }
  else if (name === 'cocoscreator') {
    // finalInput = 'src/ThinkingDataAPI.cc.js';
    finalInput = 'src/TDAnalytics.cc.js';
    engineInput = './ThinkingDataAPI.cc.js';
  }
  else if (name === 'egret') {
    // finalInput = 'src/ThinkingDataAPI.egret.js';
    finalInput = 'src/TDAnalytics.egret.js';
    engineInput = './ThinkingDataAPI.egret.js';
  }

  platforms.push({
    input: finalInput,
    output: {
      file: 'build/tdanalytics.mg.' + outputSuffix + '.js',
      name: 'thinkingdata',
      format: format
    },
    plugins: [
      replace({
        include: ['src/Config.js', 'src/PlatformAPI.js', 'src/TDAnalytics.js'],
        R_VERSION: process.env.npm_package_version,
        R_LIB_NAME: 'MG',
        R_PLATFORM_PROXY: './platform/PlatformProxy.' + name + '.js',
        R_PLATFORM_IMPORT: engineInput
      }),
      babel({
        exclude: 'node_modules/**'
      }),
    ]
  });
}

if (BUILD_CONFIG.EGRET_MG || BUILD_CONFIG.ALL) {
  addEngineConfig('egret');
}

if (BUILD_CONFIG.LAYA_MG || BUILD_CONFIG.ALL) {
  // LAYA TypeScrit Project
  addEngineConfig('laya');

  // LAYA JavaScrit Project
  addEngineConfig('laya', true);
}

if (BUILD_CONFIG.COMPRESS) {
  platforms.push({
    input: process.env.SRC,
    output: {
      file: process.env.DST,
      name: 'thinkingdata',
    },
    plugins: [
      terser()
    ]
  });
}

if (BUILD_CONFIG.COCOSCREATOR_MG || BUILD_CONFIG.ALL) {
  addEngineConfig('cocoscreator');
}

var addUniConfig = function (name) {
  let finalInput = 'src/loader-global.js';
  let format = 'cjs';

  if (name === 'uniapp') {
    // finalInput = 'src/ThinkingDataAPI.uniapp.js';
    finalInput = 'src/TDAnalytics.js';
    format = 'cjs';
  }

  platforms.push({
    input: finalInput,
    output: {
      file: 'build/tdanalytics.' + name + '.js',
      name: 'tdanalytics',
      format: format
    },
    plugins: [
      replace({
        include: ['src/Config.js', 'src/PlatformAPI.js','src/TDAnalytics.js'],
        R_VERSION: '2.0.0',
        R_LIB_NAME: name,
        R_PLATFORM_PROXY: './platform/PlatformProxy.' + name + '.js',
        R_PLATFORM_IMPORT: './ThinkingDataAPI.uniapp'
      }),
      babel({
        exclude: 'node_modules/**'
      }),
    ]
  });
}

if (BUILD_CONFIG.UNI_APP || BUILD_CONFIG.ALL) {
  addUniConfig('uniapp');
}

export default platforms;
