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

cp build/thinkingdata.wx.js examples/WechatMP/utils/
cp build/thinkingdata.mg.wx.js examples/WechatMG/js/utils/
cp build/thinkingdata.quick.js examples/QuickApp/src/utils/
cp build/thinkingdata.my.js examples/AlipayMP/utils/
cp build/thinkingdata.tt.js examples/ToutiaoMP/utils/
cp build/thinkingdata.mg.tt.js examples/ToutiaoMG/API/
cp build/thinkingdata.swan.js examples/BaiduMP/
cp build/thinkingdata.mg.swan.js examples/BaiduMG/
cp build/thinkingdata.mg.qq.js examples/QQMG/scripts/
cp build/thinkingdata.mg.qg.oppo.js examples/QUICKMG/assets/Script/
cp build/thinkingdata.mg.qg.vivo.js examples/QUICKMG/assets/Script/
