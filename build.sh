# !/bin/bash

function buildMPMG()
{
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
	uglifyjs build/thinkingdata.mg.qg.huawei.js -c -m -o release/thinkingdata.mg.qg.huawei.min.js
	uglifyjs build/thinkingdata.dd.js -c -m -o release/thinkingdata.dd.min.js
	mv build/thinkingdata.mg.laya.min.js release/thinkingdata.mg.laya.min.js
	uglifyjs build/thinkingdata.mg.cocoscreator.js -c -m -o release/thinkingdata.mg.cocoscreator.min.js
}

function copyToDemo()
{
	cp build/thinkingdata.wx.js examples/WechatMP/utils/
	cp build/thinkingdata.mg.wx.js examples/WechatMG/js/utils/
	cp build/thinkingdata.quick.js examples/QuickApp/src/utils/
	cp build/thinkingdata.my.js examples/AlipayMP/utils/
	cp build/thinkingdata.tt.js examples/ToutiaoMP/utils/
	cp build/thinkingdata.mg.tt.js examples/ToutiaoMG/API/
	cp build/thinkingdata.swan.js examples/BaiduMP/
	cp build/thinkingdata.mg.swan.js examples/BaiduMG/
	cp build/thinkingdata.mg.qq.js examples/QQMG/scripts/
}

function zipCocosCreatorSDK()
{
	cd release
	zip -q -r ta_cocoscreator_sdk.zip thinkingdata.mg.cocoscreator.min.js 
	cd ..
}

function zipLayaSDK()
{
	cd release
	zip -q -r ta_laya_sdk.zip thinkingdata.mg.laya.min.js
	cd ..
}

function copyCocosCreaterToDemo()
{
	cp build/thinkingdata.mg.cocoscreator.js examples/CocosCreatorMG/assets/Script/
}

function copyLayaToDemo()
{
	cp build/thinkingdata.mg.laya.js examples/LayaMG/src/
}

buildMPMG
copyToDemo

zipCocosCreatorSDK
copyCocosCreaterToDemo

zipLayaSDK
copyLayaToDemo