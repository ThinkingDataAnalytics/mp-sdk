//
//  CocosCreatorProxyApi.m
//  NewProject-mobile
//
//  Created by huangdiao on 2021/7/20.
//

#import "CocosCreatorProxyApi.h"
#import <ThinkingSDK/ThinkingSDK.h>

#if __has_include("cocos/bindings/jswrapper/SeApi.h")
#include "cocos/bindings/jswrapper/SeApi.h"
#endif
#if __has_include("cocos/scripting/js-bindings/jswrapper/SeApi.h")
#include "cocos/scripting/js-bindings/jswrapper/SeApi.h"
#endif
using namespace std;

#define IsNullOrEmpty(s) (s == nil || s.length == 0) ? YES : NO

@interface NSString (JSON)
- (NSDictionary *)jsonDictionary;
@end
@implementation NSString (JSON)
- (NSDictionary *)jsonDictionary {
    if (self == nil) {
        return @{};
    } else {
        NSData *data = [self dataUsingEncoding:NSUTF8StringEncoding];
        NSError *error = nil;
        NSDictionary *json = [NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingMutableContainers error:&error];
        if (error == nil) {
            return json;
        } else {
            #ifdef DEBUG
            NSLog(@"Json parse error：%@, Json=%@", error.description, self);
            #endif
            return @{};
        }
    }
}
@end

@interface NSDictionary (SafeMode)
- (id)smValueForKey:(NSString *)key;
@end
@implementation NSDictionary (SafeMode)
- (id)smValueForKey:(NSString *)key {
    if (key!=nil) {
        return [self valueForKey:key];
    } else {
        return nil;
    }
}
@end

static NSMutableDictionary *sAutoTracks;
static NSMutableDictionary *sConfig;

@implementation CocosCreatorProxyApi
+ (void)setCustomerLibInfoWithLibName:(NSString *)libName libVersion:(NSString *) libVersion {
    [TDAnalytics setCustomerLibInfoWithLibName:libName libVersion:libVersion];
}
+ (TDAutoTrackEventType)currentAutoTrack:(NSString *)appid {
    TDAutoTrackEventType type = TDAutoTrackEventTypeNone;
    if (IsNullOrEmpty(appid)) {
        type = [[[self.autoTracks allValues] firstObject] intValue];
    } else {
        type = [[self.autoTracks objectForKey:appid] intValue];
    }
    if (type == TDAutoTrackEventTypeNone) {
        NSLog(@"Auto Track type is None");
    }
    return  type;
}
+ (NSMutableDictionary *)autoTracks {
    if(sAutoTracks == nil) {
        sAutoTracks = [NSMutableDictionary new];
    }
    return sAutoTracks;
}
+ (NSMutableDictionary *)configs {
    if(sConfig == nil) {
        sConfig = [NSMutableDictionary new];
    }
    return sConfig;
}
+ (void)sharedInstance:(NSString *)config {
    NSDictionary *configDic = config.jsonDictionary;
    [self.configs addEntriesFromDictionary:configDic];
    NSString *appId = [configDic smValueForKey:@"appId"];
    NSString *serverUrl = [configDic smValueForKey:@"serverUrl"];
    NSString *debugMode = [configDic smValueForKey:@"debugMode"];
    NSString *enableLog = [configDic smValueForKey:@"enableLog"];
    TDConfig *tdConfig = [[TDConfig alloc] initWithAppId:appId serverUrl:serverUrl];
    if ([debugMode isEqualToString:@"debug"]) {
        tdConfig.mode = TDModeDebug;
    } else if ([debugMode isEqualToString:@"debugOnly"]) {
        tdConfig.mode = TDModeDebugOnly;
    } else {
        tdConfig.mode = TDModeNormal;
    }
    [TDAnalytics enableLog:[enableLog boolValue]];
    NSDictionary *autoTrack = [configDic smValueForKey:@"autoTrack"];
    if (autoTrack != nil) {
        TDAutoTrackEventType type = TDAutoTrackEventTypeNone;
        if ([autoTrack smValueForKey:@"appShow"] != nil && [[autoTrack smValueForKey:@"appShow"] boolValue]) {
            type = type | TDAutoTrackEventTypeAppStart;
        }
        if ([autoTrack smValueForKey:@"appHide"] != nil && [[autoTrack smValueForKey:@"appHide"] boolValue]) {
            type = type | TDAutoTrackEventTypeAppEnd;
        }
        if ([autoTrack smValueForKey:@"appClick"] != nil && [[autoTrack smValueForKey:@"appClick"] boolValue]) {
            type = type | TDAutoTrackEventTypeAppClick;
        }
        if ([autoTrack smValueForKey:@"appView"] != nil && [[autoTrack smValueForKey:@"appView"] boolValue]) {
            type = type | TDAutoTrackEventTypeAppViewScreen;
        }
        if ([autoTrack smValueForKey:@"appCrash"] != nil && [[autoTrack smValueForKey:@"appCrash"] boolValue]) {
            type = type | TDAutoTrackEventTypeAppViewCrash;
        }
        if ([autoTrack smValueForKey:@"appInstall"] != nil && [[autoTrack smValueForKey:@"appInstall"] boolValue]) {
            type = type | TDAutoTrackEventTypeAppInstall;
        }
        [self.autoTracks setValue:@(type) forKey:appId];
    }
    BOOL enableEncrypt = [[configDic smValueForKey:@"enableEncrypt"] boolValue];
    if (enableEncrypt == YES) {
        NSDictionary *secretKey = [configDic smValueForKey:@"secretKey"];
        NSUInteger version = [[secretKey smValueForKey:@"version"] intValue];
        NSString *publicKey = [secretKey smValueForKey:@"publicKey"];
        [tdConfig enableEncryptWithVersion:version publicKey:publicKey];
    }
    [TDAnalytics startAnalyticsWithConfig:tdConfig];
}
+ (void)startThinkingAnalytics:(NSString *)appId {
    TDAutoTrackEventType type = [self currentAutoTrack:appId];
    NSDictionary *(^_Nullable callback)(TDAutoTrackEventType eventType, NSDictionary *properties) = ^NSDictionary * _Nonnull(TDAutoTrackEventType eventType, NSDictionary * _Nonnull properties) {
        NSDictionary *propertiesDic = [NSDictionary dictionary];
        if (self.configs != nil) {
            NSDictionary *autoTrack = [self.configs smValueForKey:@"autoTrack"];
            if ([autoTrack smValueForKey:@"properties"] != nil) {
                propertiesDic = [autoTrack smValueForKey:@"properties"];
            }
        }
         if (eventType == TDAutoTrackEventTypeAppStart) {
             const char *cstr = [CocosCreatorProxyApi callJSMethod:[@"__autoTrackCallback" UTF8String] msg:"appShow"];
             NSString *callbackProperties = [[NSString alloc] initWithCString:cstr encoding:NSUTF8StringEncoding];
             NSMutableDictionary *result = [NSMutableDictionary dictionaryWithDictionary:propertiesDic];
             [result addEntriesFromDictionary:callbackProperties.jsonDictionary];
             return result;
         }
         if (eventType == TDAutoTrackEventTypeAppEnd) {
             const char *cstr = [CocosCreatorProxyApi callJSMethod:[@"__autoTrackCallback" UTF8String] msg:"appHide"];
             NSString *callbackProperties = [[NSString alloc] initWithCString:cstr encoding:NSUTF8StringEncoding];
             NSMutableDictionary *result = [NSMutableDictionary dictionaryWithDictionary:propertiesDic];
             [result addEntriesFromDictionary:callbackProperties.jsonDictionary];
             return result;
         }
        return propertiesDic;
    };
    if (IsNullOrEmpty(appId)) {
        [TDAnalytics enableAutoTrack:type callback:callback];
    } else {
        [TDAnalytics enableAutoTrack:type callback:callback withAppId:appId];
    }
}
+ (void)track:(NSString *)eventName appId:(NSString *)appId {
    if (IsNullOrEmpty(appId)) {
        [TDAnalytics track:eventName];
    } else {
        [TDAnalytics track:eventName withAppId:appId];
    }
}
+ (void)track:(NSString *)eventName properties:(NSString *)properties appId:(NSString *)appId {
    if (IsNullOrEmpty(appId)) {
        [TDAnalytics track:eventName properties:properties.jsonDictionary];
    } else {
        [TDAnalytics track:eventName properties:properties.jsonDictionary withAppId:appId];
    }
}
+ (void)track:(NSString *)eventName properties:(NSString *)properties time:(NSString *)time appId:(NSString *)appId {
    if (eventName == nil) {
        return;
    }
    NSDate *date = [self ccDateFromString:time];
    if (date == nil) {
        date = [NSDate date];
    }
    NSTimeZone *timeZone = [NSTimeZone localTimeZone];
    if (IsNullOrEmpty(appId)) {
        [TDAnalytics track:eventName properties:properties.jsonDictionary time:date timeZone:timeZone];
    } else {
        [TDAnalytics track:eventName properties:properties.jsonDictionary time:date timeZone:timeZone withAppId:appId];
    }
}
+ (void)trackUpdate:(NSString *)options appId:(NSString *)appId {
    NSDictionary *jsonDic = options.jsonDictionary;
    NSString *eventName = [jsonDic smValueForKey:@"eventName"];
    NSString *eventId = [jsonDic smValueForKey:@"eventId"];
    TDUpdateEventModel *eventModel = [[TDUpdateEventModel alloc] initWithEventName:eventName eventID:eventId];
    if ([jsonDic smValueForKey:@"time"]) {
        NSDate *date = [self ccDateFromString:[jsonDic smValueForKey:@"time"]];
        [eventModel configTime:date timeZone:[NSTimeZone localTimeZone]];
    }
    if ([jsonDic smValueForKey:@"properties"]) {
        eventModel.properties = [jsonDic smValueForKey:@"properties"];
    }
    if (IsNullOrEmpty(appId)) {
        [TDAnalytics trackWithEventModel:eventModel];
    } else {
        [TDAnalytics trackWithEventModel:eventModel withAppId:appId];
    }
}
+ (void)trackFirstEvent:(NSString *)options appId:(NSString *)appId {
    NSDictionary *jsonDic = options.jsonDictionary;
    NSString *eventName = [jsonDic smValueForKey:@"eventName"];
    NSString *firstCheckId = [jsonDic smValueForKey:@"firstCheckId"];
    TDFirstEventModel *eventModel = nil;
    if (firstCheckId != nil) {
        eventModel = [[TDFirstEventModel alloc] initWithEventName:eventName firstCheckID:firstCheckId];
    } else {
        eventModel = [[TDFirstEventModel alloc] initWithEventName:eventName];
    }
    if ([jsonDic smValueForKey:@"time"]) {
        NSDate *date = [self ccDateFromString:[jsonDic smValueForKey:@"time"]];
        [eventModel configTime:date timeZone:[NSTimeZone localTimeZone]];
    }
    if ([jsonDic smValueForKey:@"properties"]) {
        eventModel.properties = [jsonDic smValueForKey:@"properties"];
    }
    if (IsNullOrEmpty(appId)) {
        [TDAnalytics trackWithEventModel:eventModel];
    } else {
        [TDAnalytics trackWithEventModel:eventModel withAppId:appId];
    }
}
+ (void)trackOverwrite:(NSString *)options appId:(NSString *)appId {
    NSDictionary *jsonDic = options.jsonDictionary;
    NSString *eventName = [jsonDic smValueForKey:@"eventName"];
    NSString *firstCheckId = [jsonDic smValueForKey:@"firstCheckId"];
    NSString *eventId = [jsonDic smValueForKey:@"eventId"];
    TDOverwriteEventModel *eventModel = [[TDOverwriteEventModel alloc] initWithEventName:eventName eventID:eventId];
    if ([jsonDic smValueForKey:@"time"]) {
        NSDate *date = [self ccDateFromString:[jsonDic smValueForKey:@"time"]];
        [eventModel configTime:date timeZone:[NSTimeZone localTimeZone]];
    }
    if ([jsonDic smValueForKey:@"properties"]) {
        eventModel.properties = [jsonDic smValueForKey:@"properties"];
    }
    if (IsNullOrEmpty(appId)) {
        [TDAnalytics trackWithEventModel:eventModel];
    } else {
        [TDAnalytics trackWithEventModel:eventModel withAppId:appId];
    }
}
+ (void)timeEvent:(NSString *)eventName appId:(NSString *)appId {
    if (IsNullOrEmpty(appId)) {
        [TDAnalytics timeEvent:eventName];
    } else {
        [TDAnalytics timeEvent:eventName withAppId:appId];
    }
}
+ (void)login:(NSString *)accoundId appId:(NSString *)appId {
    if (IsNullOrEmpty(appId)) {
        [TDAnalytics login:accoundId];
    } else {
        [TDAnalytics login:accoundId withAppId:appId];
    }
}
+ (void)logout:(NSString *)appId  {
    if (IsNullOrEmpty(appId)) {
        [TDAnalytics logout];
    } else {
        [TDAnalytics logoutWithAppId:appId];
    }
}
+ (void)setSuperProperties:(NSString *)properties appId:(NSString *)appId {
    if (IsNullOrEmpty(appId)) {
        [TDAnalytics setSuperProperties:properties.jsonDictionary];
    } else {
        [TDAnalytics setSuperProperties:properties.jsonDictionary withAppId:appId];
    }
}
+ (void)unsetSuperProperty:(NSString *)property appId:(NSString *)appId {
    if (IsNullOrEmpty(appId)) {
        [TDAnalytics unsetSuperProperty:property];
    } else {
        [TDAnalytics unsetSuperProperty:property withAppId:appId];
    }
}
+ (void)clearSuperProperties:(NSString *)appId  {
    if (IsNullOrEmpty(appId)) {
        [TDAnalytics clearSuperProperties];
    } else {
        [TDAnalytics clearSuperPropertiesWithAppId:appId];
    }
}
+ (void)userSet:(NSString *)properties appId:(NSString *)appId {
    if (IsNullOrEmpty(appId)) {
        [TDAnalytics userSet:properties.jsonDictionary];
    } else {
        [TDAnalytics userSet:properties.jsonDictionary withAppId:appId];
    }
}
+ (void)userSetOnce:(NSString *)properties appId:(NSString *)appId {
    if (IsNullOrEmpty(appId)) {
        [TDAnalytics userSetOnce:properties.jsonDictionary];
    } else {
        [TDAnalytics userSetOnce:properties.jsonDictionary withAppId:appId];
    }
}
+ (void)userAppend:(NSString *)properties appId:(NSString *)appId {
    if (IsNullOrEmpty(appId)) {
        [TDAnalytics userAppend:properties.jsonDictionary];
    } else {
        [TDAnalytics userAppend:properties.jsonDictionary withAppId:appId];
    }
}
+ (void)userUniqAppend:(NSString *)properties appId:(NSString *)appId {
    if (IsNullOrEmpty(appId)) {
        [TDAnalytics userUniqAppend:properties.jsonDictionary];
    } else {
        [TDAnalytics userUniqAppend:properties.jsonDictionary withAppId:appId];
    }
}
+ (void)userAdd:(NSString *)properties appId:(NSString *)appId {
    if (IsNullOrEmpty(appId)) {
        [TDAnalytics userAdd:properties.jsonDictionary];
    } else {
        [TDAnalytics userAdd:properties.jsonDictionary withAppId:appId];
    }
}
+ (void)userUnset:(NSString *)property appId:(NSString *)appId {
    if (IsNullOrEmpty(appId)) {
        [TDAnalytics userUnset:property];
    } else {
        [TDAnalytics userUnset:property withAppId:appId];
    }
}
+ (void)userDel:(NSString *)appId  {
    if (IsNullOrEmpty(appId)) {
        [TDAnalytics userDelete];
    } else {
        [TDAnalytics userDeleteWithAppId:appId];
    }
}
+ (void)flush:(NSString *)appId  {
    if (IsNullOrEmpty(appId)) {
        [TDAnalytics flush];
    } else {
        [TDAnalytics flushWithAppId:appId];
    }
}
+ (void)identify:(NSString *)distinctId appId:(NSString *)appId {
    if (IsNullOrEmpty(appId)) {
        [TDAnalytics setDistinctId:distinctId];
    } else {
        [TDAnalytics setDistinctId:distinctId withAppId:appId];
    }
}
+ (void)initWithConfig:(NSString *)config {
    [self sharedInstance:config];
}
+ (NSString *)lightInstance:(NSString *)appId {
#warning 验证结果
    if (IsNullOrEmpty(appId)) {
        return [TDAnalytics lightInstanceIdWithAppId:appId];
    } else {
        return [TDAnalytics lightInstanceIdWithAppId:appId];
    }
}
+ (void)setDynamicSuperProperties:(NSString *)callFromNative appId:(NSString *)appId {
    NSDictionary<NSString *, id> *(^propertiesHandler)(void) = ^NSDictionary<NSString *,id> * _Nonnull{
        const char *cstr = [CocosCreatorProxyApi callJSMethod:[callFromNative UTF8String]];
        NSString *dynamicProperties = [[NSString alloc] initWithCString:cstr encoding:NSUTF8StringEncoding];
        return dynamicProperties.jsonDictionary;
    };
    if (IsNullOrEmpty(appId)) {
        [TDAnalytics setDynamicSuperProperties:propertiesHandler];
    } else {
        [TDAnalytics setDynamicSuperProperties:propertiesHandler withAppId:appId];
    }
}
+ (NSString *)getDeviceId:(NSString *)appId  {
    return [TDAnalytics getDeviceId];
}
+ (NSString *)getDistinctId:(NSString *)appId {
    if (IsNullOrEmpty(appId)) {
        return [TDAnalytics getDistinctId];
    } else {
        return [TDAnalytics getDistinctIdWithAppId:appId];
    }
}
+ (NSString *)getAccountId:(NSString *)appId {
#warning Get Account Id is not support on iOS
    return @"";
}
+ (NSString *)getSuperProperties:(NSString *)appId {
    NSDictionary *jsonDict = nil;
    if (IsNullOrEmpty(appId)) {
        jsonDict = [TDAnalytics getSuperProperties];
    } else {
        jsonDict = [TDAnalytics getSuperPropertiesWithAppId:appId];
    }
    if ([NSJSONSerialization isValidJSONObject:jsonDict]) {
        NSError *error = nil;
        NSData *jsonData = [NSJSONSerialization dataWithJSONObject:jsonDict options:NSJSONWritingPrettyPrinted error:&error];
        if (error == nil) {
            return [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
        }
    }
    return @"{}";
}
+ (NSString *)getPresetProperties:(NSString *)appId {
    TDPresetProperties *presetProperties = nil;
    if (IsNullOrEmpty(appId)) {
        presetProperties = [TDAnalytics getPresetProperties];
    } else {
        presetProperties = [TDAnalytics getPresetPropertiesWithAppId:appId];
    }
    NSDictionary *jsonDict = [presetProperties toEventPresetProperties];
    if ([NSJSONSerialization isValidJSONObject:jsonDict]) {
        NSError *error = nil;
        NSData *jsonData = [NSJSONSerialization dataWithJSONObject:jsonDict options:NSJSONWritingPrettyPrinted error:&error];
        if (error == nil) {
            return [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
        }
    }
    return @"{}";
}
+ (void)enableTracking:(NSString *)enabled appId:(NSString *)appId {
    if (IsNullOrEmpty(appId)) {
        if (enabled.boolValue) {
            [TDAnalytics setSDKStatus:TDTrackStatusNormal];
        } else {
            [TDAnalytics setSDKStatus:TDTrackStatusPause];
        }
    } else {
        if (enabled.boolValue) {
            [TDAnalytics setSDKStatus:TDTrackStatusNormal withAppId:appId];
        } else {
            [TDAnalytics setSDKStatus:TDTrackStatusPause withAppId:appId];
        }
    }
}
+ (void)optOutTracking:(NSString *)appId {
    if (IsNullOrEmpty(appId)) {
        [TDAnalytics setSDKStatus:TDTrackStatusStop];
    } else {
        [TDAnalytics setSDKStatus:TDTrackStatusStop withAppId:appId];
    }
}
+ (void)optOutTrackingAndDeleteUser:(NSString *)appId {
    if (IsNullOrEmpty(appId)) {
        [TDAnalytics setSDKStatus:TDTrackStatusStop];
        [TDAnalytics userDelete];
    } else {
        [TDAnalytics setSDKStatus:TDTrackStatusStop withAppId:appId];
        [TDAnalytics userDeleteWithAppId:appId];
    }
}
+ (void)optInTracking:(NSString *)appId {
    if (IsNullOrEmpty(appId)) {
        [TDAnalytics setSDKStatus:TDTrackStatusNormal];
    } else {
        [TDAnalytics setSDKStatus:TDTrackStatusNormal withAppId:appId];
    }
}
+ (void)setTrackStatus:(NSString *)status appId:(NSString *)appId {
    TDTrackStatus tdStatus = TDTrackStatusNormal;
    if ([status isEqualToString:@"PAUSE"]) {
        tdStatus = TDTrackStatusPause;
    } else if ([status isEqualToString:@"STOP"]) {
        tdStatus = TDTrackStatusStop;
    } else if ([status isEqualToString:@"SAVE_ONLY"]) {
        tdStatus = TDTrackStatusSaveOnly;
    } else {
        tdStatus = TDTrackStatusNormal;
    }
    if (IsNullOrEmpty(appId)) {
        [TDAnalytics setSDKStatus:tdStatus];
    } else {
        [TDAnalytics setSDKStatus:tdStatus withAppId:appId];
    }
}

+ (NSDate *)ccDateFromString:(NSString *)time {
    static NSString *kDateFormat = @"yyyy-MM-dd HH:mm:ss.SSS";
    NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
    dateFormatter.dateFormat = kDateFormat;
    NSDate *dateTime = [dateFormatter dateFromString:time];
    return dateTime;
}
+ (const char *)callJSMethod:(const char *)selector {
    return [self callJSMethod:selector msg:"msg from oc"];
}
+ (const char *)callJSMethod:(const char *)selector msg:(const char *)msg {
    std::string s = "window.";
    s += selector;
    s += "('";
    s += msg;
    s += "')";
    se::Value *ret = new se::Value();
    BOOL result = se::ScriptEngine::getInstance()->evalString(s.c_str(), strlen(s.c_str()), ret);
    if (result) {
        const char *cstr = ret->toString().c_str();
        NSLog(@"jsCallStr succeed! ret = %s", ret->toString().c_str());
        return cstr;
    } else {
        NSLog(@"jsCallStr failed!");
        return "";
    }
}

@end
