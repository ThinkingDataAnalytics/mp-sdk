/* eslint-disable no-undef */
import replace from 'rollup-plugin-replace';
import babel from 'rollup-plugin-babel';
import {terser} from 'rollup-plugin-terser';

const BUILD_CONFIG = {};
if (process.env.BUILD) {
  BUILD_CONFIG[process.env.BUILD] = true;
} else {
  BUILD_CONFIG.ALL = true;
}

const platforms = [];
var addConfig = function(output, libName, currentPlatform, isQg) {

  let platformProxy = isQg ? 'PlatformProxy.qg.js' : 'PlatformProxy.js';
  platforms.push({
    input: 'src/ThinkingDataAPI.js',
    output: {
      file: output,
      name: 'thinkingdata',
      format: 'cjs'
    },
    plugins: [
      replace({
        include: ['src/Config.js', 'src/PlatformAPI.js', 'src/platform/' + platformProxy],
        R_VERSION: process.env.npm_package_version,
        R_LIB_NAME: libName,
        R_PLATFORM_PROXY: './platform/' + platformProxy,
        R_CURRENT_PLATFORM: currentPlatform
      }),
      babel({
        exclude: 'node_modules/**'
      })
    ]
  });
};

if (BUILD_CONFIG.WECHAT_MP || BUILD_CONFIG.ALL) {
  addConfig('build/thinkingdata.wx.js', 'MP', 'wechat_mp');
}

if (BUILD_CONFIG.WECHAT_MG || BUILD_CONFIG.ALL) {
  addConfig('build/thinkingdata.mg.wx.js', 'MG', 'wechat_mg');
}

if (BUILD_CONFIG.QUICK_APP || BUILD_CONFIG.ALL) {
  platforms.push({
    input: 'src/ThinkingDataAPI.js',
    output: {
      file: 'build/thinkingdata.quick.js',
      name: 'thinkingdata',
      format: 'cjs'
    },
    plugins: [
      replace({
        include: ['src/Config.js', 'src/PlatformAPI.js'],
        R_VERSION: process.env.npm_package_version,
        R_LIB_NAME: 'MP',
        R_PLATFORM_PROXY: './platform/PlatformProxy.quick.js',
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
  addConfig('build/thinkingdata.my.js', 'MP', 'ali_mp');
}

if (BUILD_CONFIG.DINGDING_MP || BUILD_CONFIG.ALL) {
  addConfig('build/thinkingdata.dd.js', 'MP', 'dd_mp');
}

if (BUILD_CONFIG.TOUTIAO_MP || BUILD_CONFIG.ALL) {
  platforms.push({
    input: 'src/ThinkingDataAPI.js',
    output: {
      file: 'build/thinkingdata.tt.js',
      name: 'thinkingdata',
      format: 'cjs'
    },
    plugins: [
      replace({
        include: ['src/Config.js', 'src/PlatformAPI.js', 'src/platform/PlatformProxy.js', 'src/platform/AutoTrack.mp.js',],
        R_VERSION: process.env.npm_package_version,
        R_LIB_NAME: 'MP',
        R_PLATFORM_PROXY: './platform/PlatformProxy',
        'currentPage.route': 'currentPage.__route__', // 字节跳动小程序没有公开的route接口
        R_CURRENT_PLATFORM: 'tt_mp'
      }),
      babel({
        exclude: 'node_modules/**'
      })
    ]
  });
}

if (BUILD_CONFIG.TOUTIAO_MG || BUILD_CONFIG.ALL) {
  addConfig('build/thinkingdata.mg.tt.js', 'MG', 'tt_mg');
}

if (BUILD_CONFIG.BAIDU_MP || BUILD_CONFIG.ALL) {
  addConfig('build/thinkingdata.swan.js', 'MP', 'baidu_mp');
}

if (BUILD_CONFIG.BAIDU_MG || BUILD_CONFIG.ALL) {
  addConfig('build/thinkingdata.mg.swan.js', 'MG', 'baidu_mg');
}

if (BUILD_CONFIG.QQ_MG || BUILD_CONFIG.ALL) {
  addConfig('build/thinkingdata.mg.qq.js', 'MG', 'qq_mg');
}

if (BUILD_CONFIG.BILIBILI_MG || BUILD_CONFIG.ALL) {
  addConfig('build/thinkingdata.mg.bl.js', 'MG', 'bl_mg');
}

if (BUILD_CONFIG.OPPO_MG || BUILD_CONFIG.ALL) {
  addConfig('build/thinkingdata.mg.oppo.js', 'MG', 'oppo', true);
}

if (BUILD_CONFIG.HUAWEI_MG || BUILD_CONFIG.ALL) {
  addConfig('build/thinkingdata.mg.huawei.js', 'MG', 'huawei', true);
}

if (BUILD_CONFIG.MZ || BUILD_CONFIG.ALL) {
  addConfig('build/thinkingdata.mg.mz.js', 'MG', 'mz', true);
}

if (BUILD_CONFIG.VIVO_MG || BUILD_CONFIG.ALL) {
  platforms.push({
    input: 'src/ThinkingDataAPI.js',
    output: {
      file: 'build/thinkingdata.mg.vivo.js',
      name: 'thinkingdata',
      format: 'es'
    },
    plugins: [
      replace({
        include: ['src/Config.js', 'src/PlatformAPI.js'],
        R_VERSION: process.env.npm_package_version,
        R_LIB_NAME: 'MG',
        R_PLATFORM_PROXY: './platform/PlatformProxy.vivo.qg',
      }),
      babel({
        exclude: 'node_modules/**'
      })
    ]
  });
}

// 游戏引擎打包配置
var addEngineConfig = function(name, js) {
  let finalInput = 'src/loader-global.js';
  let format = 'cjs';
  let outputSuffix = name;
  
  if (name === 'laya') {
    if (js) {
      finalInput = 'src/ThinkingDataAPI.js';
      format = 'es';
    } else {
      outputSuffix = 'layats';
    }
  }

  platforms.push({
    input: finalInput,
    output: {
      file: 'build/thinkingdata.mg.' + outputSuffix + '.js',
      name: 'thinkingdata',
      format: format
    },
    plugins: [
      replace({
        include: ['src/Config.js', 'src/PlatformAPI.js'],
        R_VERSION: process.env.npm_package_version,
        R_LIB_NAME: 'MG',
        R_PLATFORM_PROXY: './platform/PlatformProxy.' + name + '.js',
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

export default platforms;
