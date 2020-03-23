BASEDIR=$(pwd)
cd 
egret build $BASEDIR/ThinkingAnalyticsSDK/
cd $BASEDIR
mkdir -p ta_egret_sdk
cd ta_egret_sdk
mkdir -p ThinkingAnalyticsSDK
cd ..
cp ThinkingAnalyticsSDK/bin/* ta_egret_sdk/ThinkingAnalyticsSDK
zip -q -r ta_egret_sdk.zip ta_egret_sdk/ThinkingAnalyticsSDK