package demo;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TimeZone;
import java.util.UUID;

import android.content.Context;


import org.json.JSONException;
import org.json.JSONObject;
import android.os.Looper;

import cn.thinkingdata.android.TDFirstEvent;
import cn.thinkingdata.android.TDPresetProperties;
import cn.thinkingdata.android.TDUpdatableEvent;
import cn.thinkingdata.android.TDOverWritableEvent;
import cn.thinkingdata.android.ThinkingAnalyticsSDK;
import cn.thinkingdata.android.TDConfig;
import layaair.game.browser.ExportJavaFunction;


public class LayaProxyApi {

    public static void hello (String msg) {
        System.out.println (msg);
    }

    public static int sum (int a, int b) {
        return a + b;
    }

    public static int sum (int a) {
        return a + 2;
    }

    private static final ArrayList<String> sAppIds = new ArrayList<String>();
    private static final Map<String, ThinkingAnalyticsSDK> sInstances = new HashMap<String, ThinkingAnalyticsSDK>();
    private static final Map<String, List<ThinkingAnalyticsSDK.AutoTrackEventType>> sAutoTracks = new HashMap<>();
    private static final Map<String, String> sAccountIds = new HashMap<>();
    private static String sConfig = null;

    public static void setCustomerLibInfo(String libName, String libVersion) {
        ThinkingAnalyticsSDK.setCustomerLibInfo(libName, libVersion);
    }

    private static String currentAppId (String appId) {
        String token = null;
        if ((appId == null || appId.length() == 0) && sAppIds.size() > 0)
        {
            token = sAppIds.get(0);
        }
        else if (appId != null && appId.length() > 0){
            token = appId;
        }
        return token;
    }

    private static ThinkingAnalyticsSDK currentInstance (String appId) {
        System.out.println("currentInstance(appId) = " + appId);
        ThinkingAnalyticsSDK instance = null;
        String token = currentAppId(appId);
        if (token != null && token.length() > 0) {
            instance = sInstances.get(token);
        }
        if (instance == null) {
            System.out.println ("Instance does not exist");
        }
        return  instance;
    }

    private static List<ThinkingAnalyticsSDK.AutoTrackEventType> currentAutoTrack (String appId) {
        List<ThinkingAnalyticsSDK.AutoTrackEventType> type = null;
        String token = currentAppId(appId);
        if (token != null && token.length() > 0) {
            type = sAutoTracks.get(token);
        }
        if (type == null) {
            System.out.println ("Auto Track type is None");
        }
        return type;
    }

    private static boolean isInit () {
        return sAppIds.size() > 0;
    }

    private static void sharedInstance (String appId, String serverUrl) {
        Context mAppContext = JSBridge.mMainActivity;
        TDConfig tdConfig = TDConfig.getInstance(mAppContext, appId, serverUrl);
        _sharedInstance(appId, tdConfig);
    }

    private static void sharedInstance (String config) {
        sConfig = config;
        JSONObject configDic = stringToJSONObject(config);
        String appId = configDic.optString("appId");
        String serverUrl = configDic.optString("serverUrl");
        String debugMode = configDic.optString("debugMode");
        boolean enableLog = configDic.optBoolean("enableLog");
        Context mAppContext = JSBridge.mMainActivity;
        TDConfig tdConfig = TDConfig.getInstance(mAppContext, appId, serverUrl);
        if (debugMode != null) {
            if (debugMode.equals("debug")) {
                tdConfig.setMode(TDConfig.ModeEnum.DEBUG);
            }
            else if (debugMode.equals("debugOnly")) {
                tdConfig.setMode(TDConfig.ModeEnum.DEBUG_ONLY);
            }
            else {
                tdConfig.setMode(TDConfig.ModeEnum.NORMAL);
            }
        }
        ThinkingAnalyticsSDK.enableTrackLog(enableLog);
        JSONObject autoTrack = configDic.optJSONObject("autoTrack");
        if (autoTrack != null) {
            List<ThinkingAnalyticsSDK.AutoTrackEventType> eventTypeList = new ArrayList<>();
            if (autoTrack.optBoolean("appShow")) {
                eventTypeList.add(ThinkingAnalyticsSDK.AutoTrackEventType.APP_START);
            }
            if (autoTrack.optBoolean("appHide")) {
                eventTypeList.add(ThinkingAnalyticsSDK.AutoTrackEventType.APP_END);
            }
            if (autoTrack.optBoolean("appClick")) {
                eventTypeList.add(ThinkingAnalyticsSDK.AutoTrackEventType.APP_CLICK);
            }
            if (autoTrack.optBoolean("appView")) {
                eventTypeList.add(ThinkingAnalyticsSDK.AutoTrackEventType.APP_VIEW_SCREEN);
            }
            if (autoTrack.optBoolean("appCrash")) {
                eventTypeList.add(ThinkingAnalyticsSDK.AutoTrackEventType.APP_CRASH);
            }
            if (autoTrack.optBoolean("appInstall")) {
                eventTypeList.add(ThinkingAnalyticsSDK.AutoTrackEventType.APP_INSTALL);
            }
            sAutoTracks.put(appId, eventTypeList);
        }
        _sharedInstance(appId, tdConfig);
    }

    private static void _sharedInstance (String appId, TDConfig config) {
        ThinkingAnalyticsSDK instance = sInstances.get(appId);
        if (instance == null) {
            if (null == Looper.myLooper()) {
                Looper.prepare();
            }
            instance = ThinkingAnalyticsSDK.sharedInstance(config);
            sInstances.put(appId, instance);
            sAppIds.add(appId);
        }
    }

    public static void startThinkingAnalytics (String appId) {
        List<ThinkingAnalyticsSDK.AutoTrackEventType> eventTypeList = currentAutoTrack(appId);
        if (eventTypeList != null) {
            currentInstance(appId).enableAutoTrack(eventTypeList, new ThinkingAnalyticsSDK.AutoTrackEventListener() {
                @Override
                public JSONObject eventCallback(ThinkingAnalyticsSDK.AutoTrackEventType eventType, JSONObject properties) {

                    JSONObject _properties = null;
                    try {
                        JSONObject config = new JSONObject(sConfig);
                        _properties = config.optJSONObject("autoTrack").optJSONObject("properties");
                    } catch (JSONException e) {
                        e.printStackTrace();
                        _properties = new JSONObject();
                    }
                    return _properties;
                }
            });
        }
    }
    public static void track (String eventName, String properties, String time, String appId) {
        if (eventName == null) {
            return;
        }
        Date date = ccDateFromString(time);
        if (date == null) {
            date = new Date();
        }
        TimeZone timeZone = TimeZone.getDefault();
        currentInstance(appId).track(eventName, stringToJSONObject(properties), date, timeZone);
    }

    public static void trackUpdate (String options, String appId) {
        JSONObject jsonDic = stringToJSONObject(options);
        String eventName = jsonDic.optString("eventName");
        String eventId = jsonDic.optString("eventId");
        String time = jsonDic.optString("time");
        JSONObject properties = jsonDic.optJSONObject("properties");
        TDUpdatableEvent eventModel = new TDUpdatableEvent(eventName, properties, eventId);
        if (time != null && time.length() > 0) {
            Date date = ccDateFromString(time);
            eventModel.setEventTime(date, TimeZone.getDefault());
        }
        currentInstance(appId).track(eventModel);
    }

    public static void trackFirstEvent (String options, String appId) {
        JSONObject jsonDic = stringToJSONObject(options);
        String eventName = jsonDic.optString("eventName");
        String firstCheckId = jsonDic.optString("firstCheckId");
        String time = jsonDic.optString("time");
        JSONObject properties = jsonDic.optJSONObject("properties");
        TDFirstEvent eventModel = new TDFirstEvent(eventName, properties);
        eventModel.setFirstCheckId(firstCheckId);
        if (time != null && time.length() > 0) {
            Date date = ccDateFromString(time);
            eventModel.setEventTime(date, TimeZone.getDefault());
        }
        currentInstance(appId).track(eventModel);
    }

    public static void trackOverwrite (String options, String appId) {
        JSONObject jsonDic = stringToJSONObject(options);
        String eventName = jsonDic.optString("eventName");
        String eventId = jsonDic.optString("eventId");
        String time = jsonDic.optString("time");
        JSONObject properties = jsonDic.optJSONObject("properties");
        TDOverWritableEvent eventModel = new TDOverWritableEvent(eventName, properties, eventId);
        if (time != null && time.length() > 0) {
            Date date = ccDateFromString(time);
            eventModel.setEventTime(date, TimeZone.getDefault());
        }
        currentInstance(appId).track(eventModel);
    }

    public static void timeEvent (String eventName,String appId) {
        currentInstance(appId).timeEvent(eventName);
    }

    public static void login (String accoundId, String appId) {
        sAccountIds.put(currentAppId(appId), accoundId);
        currentInstance(appId).login(accoundId);
    }

    public static void logout (String appId)  {
        sAccountIds.remove(currentAppId(appId));
        currentInstance(appId).logout();
    }

    public static void setSuperProperties (String properties, String appId) {
        currentInstance(appId).setSuperProperties(stringToJSONObject(properties));
    }

    public static void unsetSuperProperty(String property, String appId) {
        currentInstance(appId).unsetSuperProperty(property);
    }

    public static void clearSuperProperties(String appId) {
        currentInstance(appId).clearSuperProperties();
    }

    public static void userSet(String properties, String appId) {
        currentInstance(appId).user_set(stringToJSONObject(properties));
    }

    public static void userSetOnce(String properties, String appId) {
        currentInstance(appId).user_setOnce(stringToJSONObject(properties));
    }

    public static void userAppend(String properties, String appId) {
        currentInstance(appId).user_append(stringToJSONObject(properties));
    }

    public static void userAdd(String properties, String appId) {
        currentInstance(appId).user_add(stringToJSONObject(properties));
    }

    public static void userUnset(String property, String appId) {
        currentInstance(appId).user_unset(property);
    }

    public static void userDel(String appId)  {
        currentInstance(appId).user_delete();
    }

    public static void authorizeOpenID(String distinctId, String appId) {
        currentInstance(appId).identify(distinctId);
    }

    public static void identify(String distinctId, String appId) {
        currentInstance(appId).identify(distinctId);
    }

    public static void initInstanceAppId (String name, String appId) {
        sInstances.put(name, currentInstance(appId));
    }

    public static void initInstanceConfig (String name, String config) {
        sharedInstance(config);
        JSONObject configDic = stringToJSONObject(config);
        String appId = configDic.optString("appId", null);
        sInstances.put(name, currentInstance(appId));
    }

    public static void lightInstance (String name, String appId) {
        final String __instanceId;
        if(currentInstance(appId) != null) {
            ThinkingAnalyticsSDK lightInstance = currentInstance(appId).createLightInstance();
            String uuid = UUID.randomUUID().toString();
            sInstances.put(uuid, lightInstance);
            __instanceId = uuid;
        } else {
            __instanceId = "";
        }
        JSBridge.m_Handler.post(
                new Runnable() {
                    public void run() {
                        //ui thread update ui
                        ExportJavaFunction.CallBackToJS(LayaProxyApi.class,"lightInstance", __instanceId);
                    }
                });
    }

    public static void setDynamicSuperProperties (String callFromNative, String appId) {
        // JS层直接按照自定义属性传入Java层
        // currentInstance(appId).setDynamicSuperPropertiesTracker(new ThinkingAnalyticsSDK.DynamicSuperPropertiesTracker() {
        //     @Override
        //     public JSONObject getDynamicSuperProperties() {
        //         JSONObject dynamicSuperProperties = new JSONObject();
        //         String pattern = "yyyy-MM-dd HH:mm:ss.SSS";
        //         SimpleDateFormat sDateFormat = new SimpleDateFormat(pattern, Locale.CHINA);
        //         String timeString = sDateFormat.format(new Date());
        //         String dynamicTime = "dynamicTime";
        //         try {
        //             dynamicSuperProperties.put(dynamicTime, timeString);
        //         } catch (JSONException e) {
        //             e.printStackTrace();
        //         }
        //         return dynamicSuperProperties;
        //     }
        // });
    }

    public static void getDeviceId (String appId)  {
        final String __deviceId = currentInstance(appId).getDeviceId();
        System.out.println("[Android log] __deviceId 1 = " + __deviceId);
        JSBridge.m_Handler.post(
                new Runnable() {
//                    System.out.println("[Android log] __deviceId 2 = " + __deviceId);
//                    System.out.println("[Android log] __deviceId 3 = " + __deviceId);
                    public void run() {
                        System.out.println("[Android log] __deviceId 4 = " + __deviceId);
                        //ui thread update ui
                        ExportJavaFunction.CallBackToJS(LayaProxyApi.class,"getDeviceId", __deviceId);
                        System.out.println("[Android log] __deviceId 5 = " + __deviceId);
                    }
                });
    }

    public static void getDistinctId (String appId) {
        final String __distinctId = currentInstance(appId).getDistinctId();
        JSBridge.m_Handler.post(
                new Runnable() {
                    public void run() {
                        //ui thread update ui
                        ExportJavaFunction.CallBackToJS(LayaProxyApi.class,"getDistinctId", __distinctId);
                    }
                });
    }

    public static void getAccountId (String appId) {
        final String __accountId;
        if (sAccountIds.containsKey(currentAppId(appId))) {
            __accountId = sAccountIds.get(currentAppId(appId));
        } else  {
            __accountId = "";
        }
        JSBridge.m_Handler.post(
                new Runnable() {
                    public void run() {
                        //ui thread update ui
                        ExportJavaFunction.CallBackToJS(LayaProxyApi.class,"getAccountId", __accountId);
                    }
                });
    }

    public static void getSuperProperties (String appId) {
        JSONObject jsonDict = currentInstance(appId).getSuperProperties();
        final String __properties = jsonDict.toString();
        JSBridge.m_Handler.post(
                new Runnable() {
                    public void run() {
                        //ui thread update ui
                        ExportJavaFunction.CallBackToJS(LayaProxyApi.class,"getSuperProperties", __properties);
                    }
                });
    }

    public static void getPresetProperties (String appId) {
        TDPresetProperties presetProperties = currentInstance(appId).getPresetProperties();
        JSONObject jsonDict = presetProperties.toEventPresetProperties();
        final String __properties = jsonDict.toString();
        JSBridge.m_Handler.post(
                new Runnable() {
                    public void run() {
                        //ui thread update ui
                        ExportJavaFunction.CallBackToJS(LayaProxyApi.class,"getPresetProperties", __properties);
                    }
                });
    }

    public static void enableTracking (String enabled, String appId) {
        currentInstance(appId).enableTracking(Boolean.parseBoolean(enabled));
    }

    public static void optOutTracking (String appId) {
        currentInstance(appId).optOutTracking();
    }

    public static void optOutTrackingAndDeleteUser (String appId) {
        currentInstance(appId).optOutTrackingAndDeleteUser();
    }

    public static void optInTracking (String appId) {
        currentInstance(appId).optInTracking();
    }



    private static Date ccDateFromString (String str) {
        if (str != null && str.length() > 0) {
            try {
                String pattern = "yyyy-MM-dd HH:mm:ss.SSS";
                SimpleDateFormat formatter = new SimpleDateFormat(pattern, Locale.CHINA);
                return formatter.parse(str);
            }
            catch (Exception e) {
                e.printStackTrace();
                return new Date();
            }
        }
        else  {
            return new Date();
        }
    }

    private static JSONObject stringToJSONObject (String str) {
        if (str != null && str.length() > 0) {
            try {
                return new JSONObject(str);
            }
            catch (JSONException e) {
                e.printStackTrace();
                return new JSONObject();
            }
        }
        else  {
            return new JSONObject();
        }

    }

}
