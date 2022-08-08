package com.companyname;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TimeZone;
import java.util.UUID;

import android.app.Activity;
import android.content.Context;


import org.egret.egretnativeandroid.EgretNativeAndroid;
import org.egret.runtime.launcherInterface.INativePlayer;
import org.json.JSONException;
import org.json.JSONObject;

import cn.thinkingdata.android.TDFirstEvent;
import cn.thinkingdata.android.TDPresetProperties;
import cn.thinkingdata.android.TDUpdatableEvent;
import cn.thinkingdata.android.TDOverWritableEvent;
import cn.thinkingdata.android.ThinkingAnalyticsSDK;
import cn.thinkingdata.android.TDConfig;


public class EgretProxyApi {

    private interface IRuntimeInterface {
        public void callback(String message);
    }

    public static void registExternalInterface (final EgretNativeAndroid nativeAndroid, final Activity mMainActivity) {
//        EgretProxyApi.eMainActivity = mMainActivity;
//        nativeAndroid.setExternalInterface("sendToNative", new INativePlayer.INativeInterface() {
//            @Override
//            public void callback(String message) {
//            }
//        });
        nativeAndroid.setExternalInterface("track", new INativePlayer.INativeInterface() {
            @Override
            public void callback(String message) {
                JSONObject object = stringToJSONObject(message);
                track(object.optString("eventName"),
                        object.optString("properties"),
                        object.optString("time"),
                        object.optString("appId"));
            }
        });
        nativeAndroid.setExternalInterface("trackUpdate", new INativePlayer.INativeInterface() {
            @Override
            public void callback(String message) {
                JSONObject object = stringToJSONObject(message);
                trackUpdate(object.optString("taEvent"),
                        object.optString("appId"));
            }
        });
        nativeAndroid.setExternalInterface("trackFirstEvent", new INativePlayer.INativeInterface() {
            @Override
            public void callback(String message) {
                JSONObject object = stringToJSONObject(message);
                trackFirstEvent(object.optString("taEvent"),
                        object.optString("appId"));
            }
        });
        nativeAndroid.setExternalInterface("trackOverwrite", new INativePlayer.INativeInterface() {
            @Override
            public void callback(String message) {
                JSONObject object = stringToJSONObject(message);
                trackOverwrite(object.optString("taEvent"),
                        object.optString("appId"));
            }
        });
        nativeAndroid.setExternalInterface("timeEvent", new INativePlayer.INativeInterface() {
            @Override
            public void callback(String message) {
                JSONObject object = stringToJSONObject(message);
                timeEvent(object.optString("eventName"),
                        object.optString("appId"));
            }
        });
        nativeAndroid.setExternalInterface("login", new INativePlayer.INativeInterface() {
            @Override
            public void callback(String message) {
                JSONObject object = stringToJSONObject(message);
                login(object.optString("accoundId"),
                        object.optString("appId"));
            }
        });
        nativeAndroid.setExternalInterface("logout", new INativePlayer.INativeInterface() {
            @Override
            public void callback(String message) {
                JSONObject object = stringToJSONObject(message);
                logout(object.optString("appId"));
            }
        });
        nativeAndroid.setExternalInterface("setSuperProperties", new INativePlayer.INativeInterface() {
            @Override
            public void callback(String message) {
                JSONObject object = stringToJSONObject(message);
                setSuperProperties(object.optString("properties"),
                        object.optString("appId"));
            }
        });
        nativeAndroid.setExternalInterface("getSuperProperties", new INativePlayer.INativeInterface() {
            @Override
            public void callback(String message) {
                JSONObject object = stringToJSONObject(message);
                String ret = getSuperProperties(object.optString("appId"));
                nativeAndroid.callExternalInterface("getSuperProperties", ret);
            }
        });
        nativeAndroid.setExternalInterface("unsetSuperProperty", new INativePlayer.INativeInterface() {
            @Override
            public void callback(String message) {
                JSONObject object = stringToJSONObject(message);
                unsetSuperProperty(object.optString("property"),
                        object.optString("appId"));
            }
        });
        nativeAndroid.setExternalInterface("clearSuperProperties", new INativePlayer.INativeInterface() {
            @Override
            public void callback(String message) {
                JSONObject object = stringToJSONObject(message);
                clearSuperProperties(object.optString("appId"));
            }
        });
        nativeAndroid.setExternalInterface("userSet", new INativePlayer.INativeInterface() {
            @Override
            public void callback(String message) {
                JSONObject object = stringToJSONObject(message);
                userSet(object.optString("properties"),
                        object.optString("appId"));
            }
        });
        nativeAndroid.setExternalInterface("userSetOnce", new INativePlayer.INativeInterface() {
            @Override
            public void callback(String message) {
                JSONObject object = stringToJSONObject(message);
                userSetOnce(object.optString("properties"),
                        object.optString("appId"));
            }
        });
        nativeAndroid.setExternalInterface("userAppend", new INativePlayer.INativeInterface() {
            @Override
            public void callback(String message) {
                JSONObject object = stringToJSONObject(message);
                userAppend(object.optString("properties"),
                        object.optString("appId"));
            }
        });
        nativeAndroid.setExternalInterface("userAdd", new INativePlayer.INativeInterface() {
            @Override
            public void callback(String message) {
                JSONObject object = stringToJSONObject(message);
                userAdd(object.optString("properties"),
                        object.optString("appId"));
            }
        });
        nativeAndroid.setExternalInterface("userUnset", new INativePlayer.INativeInterface() {
            @Override
            public void callback(String message) {
                JSONObject object = stringToJSONObject(message);
                userUnset(object.optString("property"),
                        object.optString("appId"));
            }
        });
        nativeAndroid.setExternalInterface("userDel", new INativePlayer.INativeInterface() {
            @Override
            public void callback(String message) {
                JSONObject object = stringToJSONObject(message);
                userDel(object.optString("appId"));
            }
        });
        nativeAndroid.setExternalInterface("identify", new INativePlayer.INativeInterface() {
            @Override
            public void callback(String message) {
                JSONObject object = stringToJSONObject(message);
                identify(object.optString("distinctId"),
                        object.optString("appId"));
            }
        });
        nativeAndroid.setExternalInterface("initInstanceConfig", new INativePlayer.INativeInterface() {
            @Override
            public void callback(String message) {
                System.out.println("initInstanceConfig  " + message);
                JSONObject object = stringToJSONObject(message);
                initInstanceConfig(object.optString("name"),
                        object.optString("config"),
                        mMainActivity);
            }
        });
        nativeAndroid.setExternalInterface("initInstanceAppId", new INativePlayer.INativeInterface() {
            @Override
            public void callback(String message) {
                JSONObject object = stringToJSONObject(message);
                initInstanceAppId(object.optString("name"),
                        object.optString("appId"));
            }
        });
        nativeAndroid.setExternalInterface("lightInstance", new INativePlayer.INativeInterface() {
            @Override
            public void callback(String message) {
                JSONObject object = stringToJSONObject(message);
                lightInstance(object.optString("name"),
                        object.optString("appId"));
            }
        });
        nativeAndroid.setExternalInterface("startThinkingAnalytics", new INativePlayer.INativeInterface() {
            @Override
            public void callback(String message) {
                JSONObject object = stringToJSONObject(message);
                startThinkingAnalytics(object.optString("appId"));
            }
        });
        nativeAndroid.setExternalInterface("setDynamicSuperProperties", new INativePlayer.INativeInterface() {
            @Override
            public void callback(String message) {
                JSONObject object = stringToJSONObject(message);
                setDynamicSuperProperties(object.optString("dynamicProperties"),
                        object.optString("appId"));
            }
        });
        nativeAndroid.setExternalInterface("getDeviceId", new INativePlayer.INativeInterface() {
            @Override
            public void callback(String message) {
                JSONObject object = stringToJSONObject(message);
                String ret = getDeviceId(object.optString("appId"));
                nativeAndroid.callExternalInterface("getDeviceId", ret);
            }
        });
        nativeAndroid.setExternalInterface("getDistinctId", new INativePlayer.INativeInterface() {
            @Override
            public void callback(String message) {
                JSONObject object = stringToJSONObject(message);
                String ret = getDistinctId(object.optString("appId"));
                nativeAndroid.callExternalInterface("getDistinctId", ret);
            }
        });
        nativeAndroid.setExternalInterface("getAccountId", new INativePlayer.INativeInterface() {
            @Override
            public void callback(String message) {
                JSONObject object = stringToJSONObject(message);
                String ret = getAccountId(object.optString("appId"));
                nativeAndroid.callExternalInterface("getAccountId", ret);
            }
        });
        nativeAndroid.setExternalInterface("getPresetProperties", new INativePlayer.INativeInterface() {
            @Override
            public void callback(String message) {
                JSONObject object = stringToJSONObject(message);
                String ret = getPresetProperties(object.optString("appId"));
                nativeAndroid.callExternalInterface("getPresetProperties", ret);
            }
        });
        nativeAndroid.setExternalInterface("enableTracking", new INativePlayer.INativeInterface() {
            @Override
            public void callback(String message) {
                JSONObject object = stringToJSONObject(message);
                enableTracking(object.optString("enabled"),
                        object.optString("appId"));
            }
        });
        nativeAndroid.setExternalInterface("optOutTracking", new INativePlayer.INativeInterface() {
            @Override
            public void callback(String message) {
                JSONObject object = stringToJSONObject(message);
                optOutTracking(object.optString("appId"));
            }
        });
        nativeAndroid.setExternalInterface("optOutTrackingAndDeleteUser", new INativePlayer.INativeInterface() {
            @Override
            public void callback(String message) {
                JSONObject object = stringToJSONObject(message);
                optOutTrackingAndDeleteUser(object.optString("appId"));
            }
        });
        nativeAndroid.setExternalInterface("optInTracking", new INativePlayer.INativeInterface() {
            @Override
            public void callback(String message) {
                JSONObject object = stringToJSONObject(message);
                optInTracking(object.optString("appId"));
            }
        });
    }

    private static final ArrayList<String> sAppIds = new ArrayList<String>();
    private static final Map<String, ThinkingAnalyticsSDK> sInstances = new HashMap<String, ThinkingAnalyticsSDK>();
    private static final Map<String, List<ThinkingAnalyticsSDK.AutoTrackEventType>> sAutoTracks = new HashMap<>();
    private static final Map<String, String> sAccountIds = new HashMap<>();

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

    private static void sharedInstance (String appId, String serverUrl, Activity mMainActivity) {
        TDConfig tdConfig = TDConfig.getInstance(mMainActivity, appId, serverUrl);
        _sharedInstance(appId, tdConfig);
    }

    private static void sharedInstance (String config, Activity mMainActivity) {
        JSONObject configDic = stringToJSONObject(config);
        String appId = configDic.optString("appId");
        String serverUrl = configDic.optString("serverUrl");
        String debugMode = configDic.optString("debugMode");
        boolean enableLog = configDic.optBoolean("enableLog");
        TDConfig tdConfig = TDConfig.getInstance(mMainActivity, appId, serverUrl);
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
            instance = ThinkingAnalyticsSDK.sharedInstance(config);
            sInstances.put(appId, instance);
            sAppIds.add(appId);
        }
    }

    public static void startThinkingAnalytics (String appId) {
        List<ThinkingAnalyticsSDK.AutoTrackEventType> eventTypeList = currentAutoTrack(appId);
        if (eventTypeList != null) {
            currentInstance(appId).enableAutoTrack(eventTypeList);
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

    public static void initInstanceConfig(String name, String config, Activity mMainActivity) {
        sharedInstance(config, mMainActivity);
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
        // TODO: setDynamicSuperPropertiesTracker
        currentInstance(appId).setDynamicSuperPropertiesTracker(new ThinkingAnalyticsSDK.DynamicSuperPropertiesTracker() {
            @Override
            public JSONObject getDynamicSuperProperties() {
                JSONObject dynamicSuperProperties = new JSONObject();
                String pattern = "yyyy-MM-dd HH:mm:ss.SSS";
                SimpleDateFormat sDateFormat = new SimpleDateFormat(pattern, Locale.CHINA);
                String timeString = sDateFormat.format(new Date());
                String dynamicTime = "dynamicTime";
                try {
                    dynamicSuperProperties.put(dynamicTime, timeString);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                return dynamicSuperProperties;
            }
        });
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
        } else  {
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
