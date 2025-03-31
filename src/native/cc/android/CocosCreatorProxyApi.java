package com.cocos.game;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.TimeZone;
import java.lang.reflect.Method;
import java.lang.reflect.InvocationTargetException;

import android.annotation.TargetApi;
import android.app.Activity;
import android.content.Context;
import android.os.Build;
import android.os.Looper;

//import com.cocos.lib.CocosJavascriptJavaBridge;

import org.json.JSONException;
import org.json.JSONObject;

import cn.thinkingdata.analytics.TDAnalytics;
import cn.thinkingdata.analytics.TDAnalyticsAPI;
import cn.thinkingdata.analytics.TDConfig;
import cn.thinkingdata.analytics.TDPresetProperties;
import cn.thinkingdata.analytics.encrypt.TDSecreteKey;
import cn.thinkingdata.analytics.model.TDFirstEventModel;
import cn.thinkingdata.analytics.model.TDOverWritableEventModel;
import cn.thinkingdata.analytics.model.TDUpdatableEventModel;

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

    private static final Map<String, Integer> sAutoTracks = new HashMap<>();
    private static String sConfig = null;

    private static String sDefaultAppId = null;
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
        TDAnalytics.setCustomerLibInfo(libName, libVersion);
    }

    private static int currentAutoTrack (String appId) {
        Integer type;
        if (appId != null && appId.length() > 0) {
            type = sAutoTracks.get(appId);
        }
        else {
            type = sAutoTracks.get(sDefaultAppId);
        }
        return type == null ? 0 : type;
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
        TDAnalytics.enableLog(enableLog);
        JSONObject autoTrack = configDic.optJSONObject("autoTrack");
        if (autoTrack != null) {
            int eventTypeList = 0;
            if (autoTrack.optBoolean("appShow")) {
                eventTypeList = eventTypeList | TDAnalytics.TDAutoTrackEventType.APP_START;
            }
            if (autoTrack.optBoolean("appHide")) {
                eventTypeList = eventTypeList | TDAnalytics.TDAutoTrackEventType.APP_END;
            }
            if (autoTrack.optBoolean("appClick")) {
                eventTypeList = eventTypeList | TDAnalytics.TDAutoTrackEventType.APP_CLICK;
            }
            if (autoTrack.optBoolean("appView")) {
                eventTypeList = eventTypeList | TDAnalytics.TDAutoTrackEventType.APP_VIEW_SCREEN;
            }
            if (autoTrack.optBoolean("appCrash")) {
                eventTypeList = eventTypeList | TDAnalytics.TDAutoTrackEventType.APP_CRASH;
            }
            if (autoTrack.optBoolean("appInstall")) {
                eventTypeList = eventTypeList | TDAnalytics.TDAutoTrackEventType.APP_INSTALL;
            }
            sAutoTracks.put(appId, eventTypeList);
        }
        boolean enableEncrypt = configDic.optBoolean("enableEncrypt");
        tdConfig.enableEncrypt(enableEncrypt);
        if (enableEncrypt) {
            JSONObject secretKey = configDic.optJSONObject("secretKey");
            tdConfig.setSecretKey(new TDSecreteKey(secretKey.optString("publicKey"), secretKey.optInt("version"), "AES", "RSA"));
        }
        _sharedInstance(appId, tdConfig);
    }

    private static void _sharedInstance (String appId, TDConfig config) {
        if (null == Looper.myLooper()) {
            Looper.prepare();
        }
        TDAnalytics.init(config);
        if (sDefaultAppId == null) {
            sDefaultAppId = appId;
        }
    }

    public static void startThinkingAnalytics (String appId) {
        int eventType = currentAutoTrack(appId);
        if (eventType != 0) {
            TDAnalytics.enableAutoTrack(eventType, new TDAnalytics.TDAutoTrackEventHandler() {
                @Override
                public JSONObject getAutoTrackEventProperties(int i, JSONObject jsonObject) {
                    JSONObject _properties = null;
                    try {
                        JSONObject config = new JSONObject(sConfig);
                        JSONObject autoTrackJson = config.optJSONObject("autoTrack");
                        if(autoTrackJson != null) {
                            _properties = autoTrackJson.optJSONObject("properties");
                        }
                    } catch (JSONException e) {
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
        TDAnalyticsAPI.track(eventName, stringToJSONObject(properties), date, timeZone, appId);
    }

    public static void trackUpdate (String options, String appId) {
        JSONObject jsonDic = stringToJSONObject(options);
        String eventName = jsonDic.optString("eventName");
        String eventId = jsonDic.optString("eventId");
        String time = jsonDic.optString("time");
        JSONObject properties = jsonDic.optJSONObject("properties");
        TDUpdatableEventModel eventModel = new TDUpdatableEventModel(eventName, properties, eventId);
        if (time != null && time.length() > 0) {
            Date date = ccDateFromString(time);
            eventModel.setEventTime(date, TimeZone.getDefault());
        }
        TDAnalyticsAPI.track(eventModel, appId);
    }

    public static void trackFirstEvent (String options, String appId) {
        JSONObject jsonDic = stringToJSONObject(options);
        String eventName = jsonDic.optString("eventName");
        String firstCheckId = jsonDic.optString("firstCheckId");
        String time = jsonDic.optString("time");
        JSONObject properties = jsonDic.optJSONObject("properties");
        TDFirstEventModel eventModel = new TDFirstEventModel(eventName, properties);
        eventModel.setFirstCheckId(firstCheckId);
        if (time != null && time.length() > 0) {
            Date date = ccDateFromString(time);
            eventModel.setEventTime(date, TimeZone.getDefault());
        }
        TDAnalyticsAPI.track(eventModel, appId);
    }

    public static void trackOverwrite (String options, String appId) {
        JSONObject jsonDic = stringToJSONObject(options);
        String eventName = jsonDic.optString("eventName");
        String eventId = jsonDic.optString("eventId");
        String time = jsonDic.optString("time");
        JSONObject properties = jsonDic.optJSONObject("properties");
        TDOverWritableEventModel eventModel = new TDOverWritableEventModel(eventName, properties, eventId);
        if (time != null && time.length() > 0) {
            Date date = ccDateFromString(time);
            eventModel.setEventTime(date, TimeZone.getDefault());
        }
        TDAnalyticsAPI.track(eventModel, appId);
    }

    public static void timeEvent (String eventName,String appId) {
        TDAnalyticsAPI.timeEvent(eventName, appId);
    }

    public static void login (String accountId, String appId) {
        TDAnalyticsAPI.login(accountId, appId);
    }

    public static void logout (String appId)  {
        TDAnalyticsAPI.logout(appId);
    }

    public static void setSuperProperties (String properties, String appId) {
        TDAnalyticsAPI.setSuperProperties(stringToJSONObject(properties), appId);
    }

    public static void unsetSuperProperty(String property, String appId) {
        TDAnalyticsAPI.unsetSuperProperty(property, appId);
    }

    public static void clearSuperProperties(String appId) {
        TDAnalyticsAPI.clearSuperProperties(appId);
    }

    public static void userSet(String properties, String appId) {
        TDAnalyticsAPI.userSet(stringToJSONObject(properties), appId);
    }

    public static void userSetOnce(String properties, String appId) {
        TDAnalyticsAPI.userSetOnce(stringToJSONObject(properties), appId);
    }

    public static void userAppend(String properties, String appId) {
        TDAnalyticsAPI.userAppend(stringToJSONObject(properties), appId);
    }

    public static void userUniqAppend(String properties, String appId) {
        TDAnalyticsAPI.userUniqAppend(stringToJSONObject(properties), appId);
    }
    
    public static void userAdd(String properties, String appId) {
        TDAnalyticsAPI.userAdd(stringToJSONObject(properties), appId);
    }

    public static void userUnset(String property, String appId) {
        TDAnalyticsAPI.userUnset(property, appId);
    }

    public static void userDel(String appId)  {
        TDAnalyticsAPI.userDelete(appId);
    }

    public static void flush(String appId) {
        TDAnalyticsAPI.flush(appId);
    }

    public static void identify(String distinctId, String appId) {
        TDAnalyticsAPI.setDistinctId(distinctId, appId);
    }

    public static void initWithConfig (String config) {
        sharedInstance(config);
    }

    public static String lightInstance (String appId) {
        return TDAnalyticsAPI.lightInstance(appId);
    }

    public static void setDynamicSuperProperties (String callFromNative, String appId) {
        // JS is passed to Java as a custom properties
//        TDAnalytics.setDynamicSuperProperties(new TDAnalytics.TDDynamicSuperPropertiesHandler() {
//            @Override
//            public JSONObject getDynamicSuperProperties() {
//                try {
//                    String ret = CocosJavascriptJavaBridge.evalString(callFromNative+"()");
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
        return TDAnalyticsAPI.getDeviceId(appId);
    }

    public static String getDistinctId (String appId) {
        return TDAnalyticsAPI.getDistinctId(appId);
    }

    public static String getAccountId (String appId) {
        return "";
    }

    public static String getSuperProperties (String appId) {
        JSONObject jsonDict = TDAnalyticsAPI.getSuperProperties(appId);
        return jsonDict.toString();
    }

    public static String getPresetProperties (String appId) {
        TDPresetProperties presetProperties = TDAnalyticsAPI.getPresetProperties(appId);
        JSONObject jsonDict = presetProperties.toEventPresetProperties();
        return jsonDict.toString();
    }

    public static void setTrackStatus (String status, String appId) {
        TDAnalytics.TDTrackStatus java_status;
        switch(status) {
            case "PAUSE":
                java_status = TDAnalytics.TDTrackStatus.PAUSE;
                break;
            case "STOP":
                java_status = TDAnalytics.TDTrackStatus.STOP;
                break;
            case "SAVE_ONLY":
                java_status = TDAnalytics.TDTrackStatus.SAVE_ONLY;
                break;
            case "NORMAL":
            default:
                java_status = TDAnalytics.TDTrackStatus.NORMAL;
                break;
        }
        TDAnalyticsAPI.setTrackStatus(java_status, appId);
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
