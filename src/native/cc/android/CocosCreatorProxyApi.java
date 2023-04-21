package com.cocos.game;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TimeZone;
import java.util.UUID;
import java.lang.reflect.Method;
import java.lang.reflect.InvocationTargetException;

import android.annotation.TargetApi;
import android.app.Activity;
import android.content.Context;
import android.os.Build;
import android.os.Looper;

import org.json.JSONException;
import org.json.JSONObject;

import cn.thinkingdata.android.TDFirstEvent;
import cn.thinkingdata.android.TDPresetProperties;
import cn.thinkingdata.android.TDUpdatableEvent;
import cn.thinkingdata.android.TDOverWritableEvent;
import cn.thinkingdata.android.ThinkingAnalyticsSDK;
import cn.thinkingdata.android.TDConfig;
import cn.thinkingdata.android.encrypt.TDSecreteKey;

public class CocosCreatorProxyApi {

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

    @TargetApi(Build.VERSION_CODES.KITKAT)
    public static Context getCocosContext() {
        Class<?> sdkWrapper = null;
        Class<?> cocos2dxActivity = null;
        try {
            sdkWrapper = Class.forName("com.cocos.service.SDKWrapper");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
        if (sdkWrapper == null) {
            try {
                cocos2dxActivity = Class.forName("org.cocos2dx.lib.Cocos2dxActivity");
            } catch (ClassNotFoundException e) {
                e.printStackTrace();
            }
            if (cocos2dxActivity == null) {
                return null;
            } else {
                try {
                    Method methodGetContext = cocos2dxActivity.getMethod("getContext");
                    return (Context) methodGetContext.invoke(null);
                } catch (NoSuchMethodException | IllegalAccessException | InvocationTargetException e) {
                    e.printStackTrace();
                }
            }
        } else {
            try {
                Method methodShared = sdkWrapper.getMethod("shared");
                Object instance = methodShared.invoke(null);
                if (instance != null) {
                    Method methodGetActivity = sdkWrapper.getMethod("getActivity");
                    return (Activity) methodGetActivity.invoke(instance);
                }
            } catch (NoSuchMethodException | IllegalAccessException | InvocationTargetException e) {
                e.printStackTrace();
            }
        }
        return null;
    }

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
        Context mAppContext = getCocosContext();
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
        Context mAppContext = getCocosContext();
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
        boolean enableEncrypt = configDic.optBoolean("enableEncrypt");
        if (enableEncrypt) {
            tdConfig.enableEncrypt(enableEncrypt);
            JSONObject secretKey = configDic.optJSONObject("secretKey");
            tdConfig.setSecretKey(new TDSecreteKey(secretKey.optString("publicKey"), secretKey.optInt("version"), "AES", "RSA"));
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

    public static void userUniqAppend(String properties, String appId) {
        currentInstance(appId).user_uniqAppend(stringToJSONObject(properties));
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

    public static void flush(String appId) {
        currentInstance(appId).flush();
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

    public static String lightInstance (String name, String appId) {
        if(currentInstance(appId) != null) {
            ThinkingAnalyticsSDK lightInstance = currentInstance(appId).createLightInstance();
            String uuid = UUID.randomUUID().toString();
            sInstances.put(uuid, lightInstance);
            return uuid;
        } else {
            return "";
        }
    }

    public static void setDynamicSuperProperties (String callFromNative, String appId) {
        // JS is passed to Java as a custom properties
//        currentInstance(appId).setDynamicSuperPropertiesTracker(new ThinkingAnalyticsSDK.DynamicSuperPropertiesTracker() {
//            @Override
//            public JSONObject getDynamicSuperProperties() {
//                try {
//                    String ret = evalString(callFromNative+"()");
//                    JSONObject dynamicSuperProperties = new JSONObject(ret);
//                    return dynamicSuperProperties;
//                } catch (JSONException e) {
//                    e.printStackTrace();
//                    return new JSONObject();
//                }
//            }
//        });
    }

    public static String getDeviceId (String appId)  {
        return currentInstance(appId).getDeviceId();
    }

    public static String getDistinctId (String appId) {
        return currentInstance(appId).getDistinctId();
    }

    public static String getAccountId (String appId) {
        if (sAccountIds.containsKey(currentAppId(appId))) {
            return sAccountIds.get(currentAppId(appId));
        }
        else {
            return "";
        }
    }

    public static String getSuperProperties (String appId) {
        JSONObject jsonDict = currentInstance(appId).getSuperProperties();
        return jsonDict.toString();
    }

    public static String getPresetProperties (String appId) {
        TDPresetProperties presetProperties = currentInstance(appId).getPresetProperties();
        JSONObject jsonDict = presetProperties.toEventPresetProperties();
        return jsonDict.toString();
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

    public static void setTrackStatus (String status, String appId) {
        ThinkingAnalyticsSDK.TATrackStatus java_status = ThinkingAnalyticsSDK.TATrackStatus.NORMAL;
        switch(status) {
            case "PAUSE":
                java_status = ThinkingAnalyticsSDK.TATrackStatus.PAUSE;
                break;
            case "STOP":
                java_status = ThinkingAnalyticsSDK.TATrackStatus.STOP;
                break;
            case "SAVE_ONLY":
                java_status = ThinkingAnalyticsSDK.TATrackStatus.SAVE_ONLY;
                break;
            case "NORMAL":
            default:
                java_status = ThinkingAnalyticsSDK.TATrackStatus.NORMAL;
                break;
        }
        currentInstance(appId).setTrackStatus(java_status);
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
