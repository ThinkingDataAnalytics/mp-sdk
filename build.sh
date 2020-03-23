#!/bin/bash
./node_modules/.bin/rollup -c
mkdir -p release
uglifyjs build/thinkingdata.wx.js -c -m -o release/thinkingdata.wx.min.js
uglifyjs build/thinkingdata.mg.wx.js -c -m -o release/thinkingdata.mg.wx.min.js
uglifyjs build/thinkingdata.quick.js -c -m -o release/thinkingdata.quick.min.js
uglifyjs build/thinkingdata.my.js -c -m -o release/thinkingdata.my.min.js
uglifyjs build/thinkingdata.tt.js -c -m -o release/thinkingdata.tt.min.js
uglifyjs build/thinkingdata.mg.tt.js -c -m -o release/thinkingdata.mg.tt.min.js
uglifyjs build/thinkingdata.swan.js -c -m -o release/thinkingdata.swan.min.js
uglifyjs build/thinkingdata.mg.swan.js -c -m -o release/thinkingdata.mg.swan.min.js
uglifyjs build/thinkingdata.mg.qq.js -c -m -o release/thinkingdata.mg.qq.min.js
uglifyjs build/thinkingdata.mg.qg.oppo.js -c -m -o release/thinkingdata.mg.qg.oppo.min.js
uglifyjs build/thinkingdata.mg.qg.vivo.js -c -m -o release/thinkingdata.mg.qg.vivo.min.js
mv build/thinkingdata.mg.laya.min.js release/thinkingdata.mg.laya.min.js
uglifyjs build/thinkingdata.mg.cocoscreator.js -c -m -o release/thinkingdata.mg.cocoscreator.min.js


# egret build
cp build/thinkingdata.mg.egret.js egret/ThinkingAnalyticsSDK/src
BASEDIR=$(pwd)
cd 
egret build $BASEDIR/egret/ThinkingAnalyticsSDK/
cd $BASEDIR/build
mkdir -p ta_egret_sdk
cd ta_egret_sdk
mkdir -p ThinkingAnalyticsSDK
cd ../..
cp egret/ThinkingAnalyticsSDK/bin/* build/ta_egret_sdk/ThinkingAnalyticsSDK
cp -r build/ta_egret_sdk release/
zip -q -r release/ta_egret_sdk.zip release/ta_egret_sdk


# zip CocosCreator SDK
zip -q -r release/ta_cocoscreator_sdk.zip release/thinkingdata.mg.cocoscreator.min.js 

# zip Laya SDK
zip -q -r release/ta_laya_sdk.zip release/thinkingdata.mg.laya.min.js

# copy to examples
cp build/thinkingdata.wx.js examples/WechatMP/utils/
cp build/thinkingdata.mg.wx.js examples/WechatMG/js/utils/
cp build/thinkingdata.quick.js examples/QuickApp/src/utils/
cp build/thinkingdata.my.js examples/AlipayMP/utils/
cp build/thinkingdata.tt.js examples/ToutiaoMP/utils/
cp build/thinkingdata.mg.tt.js examples/ToutiaoMG/API/
cp build/thinkingdata.swan.js examples/BaiduMP/
cp build/thinkingdata.mg.swan.js examples/BaiduMG/
cp build/thinkingdata.mg.qq.js examples/QQMG/scripts/
cp build/ta_egret_sdk/ThinkingAnalyticsSDK/* examples/EgretMG/libsrc/ThinkingAnalyticsSDK
cp build/thinkingdata.mg.cocoscreator.js examples/CocosCreatorMG/assets/Script/


# 编译 egret proj
cd examples/EgretMG/TADEMO
egret build -e
egret build --target wxgame
egret build --target vivogame
egret build --target baidugame
egret build --target qqgame
egret build --target oppogame
cd ../TADEMO_vivogame
npm run build
cd ../TADEMO_oppogame
quickgame pack
# cd ..
# adb push TADEMO_oppogame/dist/com.application.demo.rpk sdcard/games
		