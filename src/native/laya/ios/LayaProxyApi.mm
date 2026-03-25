//
//  LayaProxyApi.m
//  NewProject-mobile
//
//  Created by huangdiao on 2021/7/20.
//

#import "LayaProxyApi.h"
#import <ThinkingSDK/ThinkingSDK.h>
#import <conchRuntime.h>

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
static NSString *sDefaultAppId;

@implementation LayaProxyApi
+ (void)setCustomerLibInfoWithLibName:(NSString *)libName libVersion:(NSString *) libVersion {
    [TDAnalytics setCustomerLibInfoWithLibName:libName libVersion:libVersion];
}
+ (TDAutoTrackEventType)currentAutoTrack:(NSString *)appId {
    TDAutoTrackEventType type = TDAutoTrackEventTypeNone;
    if (appId != nil && appId.length > 0) {
        type = [[self.autoTracks objectForKey:appId] intValue];
    }
    else {
        type = [[self.autoTracks objectForKey:sDefaultAppId] intValue];
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
        NSUInteger version = [[secretKey smValueForKey:@"version"] unsignedIntegerValue];
        NSString *publicKey = [secretKey smValueForKey:@"publicKey"];
        [tdConfig enableEncryptWithVersion:version publicKey:publicKey];
    }
    [self _sharedInstance:tdConfig];
}
+ (void)_sharedInstance:(TDConfig *)config {
    [TDAnalytics startAnalyticsWithConfig:config];
    if (sDefaultAppId == nil) {
        NSString *appId = config.appid;
        sDefaultAppId = appId;
    }
}
+ (void)startThinkingAnalytics:(NSString *)appId {
    TDAutoTrackEventType type = [self currentAutoTrack:appId];
    
    [TDAnalytics enableAutoTrack:type callback:^NSDictionary * _Nonnull(TDAutoTrackEventType eventType, NSDictionary * _Nonnull properties) {
        NSDictionary *propertiesDic = [NSDictionary dictionary];
        if (self.configs != nil) {
            NSDictionary *autoTrack = [self.configs smValueForKey:@"autoTrack"];
            if ([autoTrack smValueForKey:@"properties"] != nil) {
                propertiesDic = [autoTrack smValueForKey:@"properties"];
            }
        }
        return propertiesDic;
    } withAppId:appId];
}
+ (void)track:(NSString *)eventName appId:(NSString *)appId {
    [TDAnalytics track:eventName withAppId:appId];
}
+ (void)track:(NSString *)eventName properties:(NSString *)properties appId:(NSString *)appId {
    [TDAnalytics track:eventName properties:properties.jsonDictionary withAppId:appId];
}
+ (void)track:(NSString *)eventName properties:(NSString *)properties time:(NSString *)time appId:(NSString *)appId {
    if (eventName == nil) {
        return;
    }
    NSDate *date = [self taDateFromString:time];
    if (date == nil) {
        date = [NSDate date];
    }
    NSTimeZone *timeZone = [NSTimeZone localTimeZone];
    [TDAnalytics track:eventName properties:properties.jsonDictionary time:date timeZone:timeZone withAppId:appId];
}
+ (void)trackUpdate:(NSString *)options appId:(NSString *)appId {
    NSDictionary *jsonDic = options.jsonDictionary;
    NSString *eventName = [jsonDic smValueForKey:@"eventName"];
    NSString *eventId = [jsonDic smValueForKey:@"eventId"];
    TDUpdateEventModel *eventModel = [[TDUpdateEventModel alloc] initWithEventName:eventName eventID:eventId];
    if ([jsonDic smValueForKey:@"time"]) {
        NSDate *date = [self taDateFromString:[jsonDic smValueForKey:@"time"]];
        [eventModel configTime:date timeZone:[NSTimeZone localTimeZone]];
    }
    if ([jsonDic smValueForKey:@"properties"]) {
        eventModel.properties = [jsonDic smValueForKey:@"properties"];
    }
    [TDAnalytics trackWithEventModel:eventModel];
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
        NSDate *date = [self taDateFromString:[jsonDic smValueForKey:@"time"]];
        [eventModel configTime:date timeZone:[NSTimeZone localTimeZone]];
    }
    if ([jsonDic smValueForKey:@"properties"]) {
        eventModel.properties = [jsonDic smValueForKey:@"properties"];
    }
    [TDAnalytics trackWithEventModel:eventModel withAppId:appId];
}
+ (void)trackOverwrite:(NSString *)options appId:(NSString *)appId {
    NSDictionary *jsonDic = options.jsonDictionary;
    NSString *eventName = [jsonDic smValueForKey:@"eventName"];
    NSString *eventId = [jsonDic smValueForKey:@"eventId"];
    TDOverwriteEventModel *eventModel = [[TDOverwriteEventModel alloc] initWithEventName:eventName eventID:eventId];
    if ([jsonDic smValueForKey:@"time"]) {
        NSDate *date = [self taDateFromString:[jsonDic smValueForKey:@"time"]];
        [eventModel configTime:date timeZone:[NSTimeZone localTimeZone]];
    }
    if ([jsonDic smValueForKey:@"properties"]) {
        eventModel.properties = [jsonDic smValueForKey:@"properties"];
    }
    [TDAnalytics trackWithEventModel:eventModel withAppId:appId];
}
+ (void)timeEvent:(NSString *)eventName appId:(NSString *)appId {
    [TDAnalytics timeEvent:eventName withAppId:appId];
}
+ (void)login:(NSString *)accountId appId:(NSString *)appId {
    [TDAnalytics login:accountId withAppId:appId];
}
+ (void)logout:(NSString *)appId  {
    [TDAnalytics logoutWithAppId:appId];
}
+ (void)setSuperProperties:(NSString *)properties appId:(NSString *)appId {
    [TDAnalytics setSuperProperties:properties.jsonDictionary withAppId:appId];
}
+ (void)unsetSuperProperty:(NSString *)property appId:(NSString *)appId {
    [TDAnalytics unsetSuperProperty:property withAppId:appId];
}
+ (void)clearSuperProperties:(NSString *)appId  {
    [TDAnalytics clearSuperPropertiesWithAppId:appId];
}
+ (void)userSet:(NSString *)properties appId:(NSString *)appId {
    [TDAnalytics userSet:properties.jsonDictionary withAppId:appId];
}
+ (void)userSetOnce:(NSString *)properties appId:(NSString *)appId {
    [TDAnalytics userSetOnce:properties.jsonDictionary withAppId:appId];
}
+ (void)userAppend:(NSString *)properties appId:(NSString *)appId {
    [TDAnalytics userAppend:properties.jsonDictionary withAppId:appId];
}
+ (void)userUniqAppend:(NSString *)properties appId:(NSString *)appId {
    [TDAnalytics userUniqAppend:properties.jsonDictionary withAppId:appId];
}
+ (void)userAdd:(NSString *)properties appId:(NSString *)appId {
    [TDAnalytics userAdd:properties.jsonDictionary withAppId:appId];
}
+ (void)userUnset:(NSString *)property appId:(NSString *)appId {
    [TDAnalytics userUnset:property withAppId:appId];
}
+ (void)userDel:(NSString *)appId  {
    [TDAnalytics userDeleteWithAppId:appId];
}
+ (void)flush:(NSString *)appId  {
    [TDAnalytics flushWithAppId:appId];
}
+ (void)identify:(NSString *)distinctId appId:(NSString *)appId {
    [TDAnalytics setDistinctId:distinctId withAppId:appId];
}
+ (void)initWithConfig:(NSString *)config {
    [self sharedInstance:config];
}
+ (void)lightInstance:(NSString *)appId {
    NSString *ret = [TDAnalytics lightInstanceIdWithAppId:appId];
    [[conchRuntime GetIOSConchRuntime] callbackToJSWithClass:self.class methodName:@"lightInstance:" ret:ret];
}
+ (void)setDynamicSuperProperties:(NSString *)callFromNative appId:(NSString *)appId {
    [TDAnalytics setDynamicSuperProperties:^NSDictionary<NSString *,id> * _Nonnull{
        [[conchRuntime GetIOSConchRuntime] callbackToJSWithClass:self.class methodName:@"setDynamicSuperProperties:appId:" ret:@"dynamic_call_back"];
        return @{};
    } withAppId:appId];
}
+ (void)getDeviceId:(NSString *)appId  {    
    NSString *ret = [TDAnalytics getDeviceId];
    [[conchRuntime GetIOSConchRuntime] callbackToJSWithClass:self.class methodName:@"getDeviceId:" ret:ret];
}
+ (void)getDistinctId:(NSString *)appId {
    NSString *ret = [TDAnalytics getDistinctIdWithAppId:appId];
    [[conchRuntime GetIOSConchRuntime] callbackToJSWithClass:self.class methodName:@"getDistinctId:" ret:ret];
}
+ (void)getAccountId:(NSString *)appId {
    NSString *ret = @"";
    [[conchRuntime GetIOSConchRuntime] callbackToJSWithClass:self.class methodName:@"getAccountId:" ret:ret?:@""];
}
+ (void)getSuperProperties:(NSString *)appId {
    NSString *ret = @"{}";
    NSDictionary *jsonDict = [TDAnalytics getSuperPropertiesWithAppId:appId];
    if ([NSJSONSerialization isValidJSONObject:jsonDict]) {
        NSError *error = nil;
        NSData *jsonData = [NSJSONSerialization dataWithJSONObject:jsonDict options:NSJSONWritingPrettyPrinted error:&error];
        if (error == nil) {
            ret = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
        }
    }
    [[conchRuntime GetIOSConchRuntime] callbackToJSWithClass:self.class methodName:@"getSuperProperties:" ret:ret];
}
+ (void)getPresetProperties:(NSString *)appId {
    NSString *ret = @"{}";
    TDPresetProperties *presetProperties = [TDAnalytics getPresetPropertiesWithAppId:appId];
    NSDictionary *jsonDict = [presetProperties toEventPresetProperties];
    if ([NSJSONSerialization isValidJSONObject:jsonDict]) {
        NSError *error = nil;
        NSData *jsonData = [NSJSONSerialization dataWithJSONObject:jsonDict options:NSJSONWritingPrettyPrinted error:&error];
        if (error == nil) {
            ret = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
        }
    }
    [[conchRuntime GetIOSConchRuntime] callbackToJSWithClass:self.class methodName:@"getPresetProperties:" ret:ret];
}

+ (void)setTrackStatus:(NSString *)status appId:(NSString *)appId {
    TDTrackStatus oc_status = TDTrackStatusNormal;
    if ([status isEqualToString:@"PAUSE"]) {
        oc_status = TDTrackStatusPause;
    } else if ([status isEqualToString:@"STOP"]) {
        oc_status = TDTrackStatusStop;
    } else if ([status isEqualToString:@"SAVE_ONLY"]) {
        oc_status = TDTrackStatusSaveOnly;
    } else {
        oc_status = TDTrackStatusNormal;
    }
    [TDAnalytics setSDKStatus:oc_status withAppId:appId];
}

+ (NSDate *)taDateFromString:(NSString *)time {
    static NSString *kDateFormat = @"yyyy-MM-dd HH:mm:ss.SSS";
    NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
    dateFormatter.dateFormat = kDateFormat;
    NSDate *dateTime = [dateFormatter dateFromString:time];
    return dateTime;
}

@end
