//
//  EgretProxyApi.m
//  NewProject-mobile
//
//  Created by huangdiao on 2021/7/20.
//

#import "EgretProxyApi.h"
#import <ThinkingSDK/ThinkingAnalyticsSDK.h>

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
            NSLog(@"Json 解析错误：%@, Json=%@", error.description, self);
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

static NSMutableArray *sAppIds;
static NSMutableDictionary *sInstances;
static NSMutableDictionary *sAutoTracks;
static NSMutableDictionary *sAccountIds;
static NSString *sConfig;

@implementation EgretProxyApi

+ (void)registExternalInterface:(EgretNativeIOS *)native {
    __block EgretNativeIOS* __support = native;
    [native setExternalInterface:@"TaNativeSupport" Callback:^(NSString* message) {
        [__support callExternalInterface:@"TaNativeSupport" Value:@"ture"];
    }];
    
    [native setExternalInterface:@"track" Callback:^(NSString* message) {
        NSDictionary *pamars = message.jsonDictionary;
        NSString *eventName = [pamars smValueForKey:@"eventName"];
        NSString *properties = [pamars smValueForKey:@"properties"];
        NSString *time = [pamars smValueForKey:@"time"];
        NSString *appId = [pamars smValueForKey:@"appId"];
        [self track:eventName properties:properties time:time appId:appId];
    }];
    [native setExternalInterface:@"trackUpdate" Callback:^(NSString* message) {
        NSDictionary *pamars = message.jsonDictionary;
        NSString *taEvent = [pamars smValueForKey:@"taEvent"];
        NSString *appId = [pamars smValueForKey:@"appId"];
        [self trackUpdate:taEvent appId:appId];
    }];
    [native setExternalInterface:@"trackFirstEvent" Callback:^(NSString* message) {
        NSDictionary *pamars = message.jsonDictionary;
        NSString *taEvent = [pamars smValueForKey:@"taEvent"];
        NSString *appId = [pamars smValueForKey:@"appId"];
        [self trackFirstEvent:taEvent appId:appId];
    }];
    [native setExternalInterface:@"trackOverwrite" Callback:^(NSString* message) {
        NSDictionary *pamars = message.jsonDictionary;
        NSString *taEvent = [pamars smValueForKey:@"taEvent"];
        NSString *appId = [pamars smValueForKey:@"appId"];
        [self trackOverwrite:taEvent appId:appId];
    }];
    [native setExternalInterface:@"timeEvent" Callback:^(NSString* message) {
        NSDictionary *pamars = message.jsonDictionary;
        NSString *eventName = [pamars smValueForKey:@"eventName"];
        NSString *appId = [pamars smValueForKey:@"appId"];
        [self timeEvent:eventName appId:appId];
    }];
    [native setExternalInterface:@"login" Callback:^(NSString* message) {
        NSDictionary *pamars = message.jsonDictionary;
        NSString *accoundId = [pamars smValueForKey:@"accoundId"];
        NSString *appId = [pamars smValueForKey:@"appId"];
        [self login:accoundId appId:appId];
    }];
    [native setExternalInterface:@"logout" Callback:^(NSString* message) {
        NSDictionary *pamars = message.jsonDictionary;
        NSString *appId = [pamars smValueForKey:@"appId"];
        [self logout:appId];
    }];
    [native setExternalInterface:@"setSuperProperties" Callback:^(NSString* message) {
        NSDictionary *pamars = message.jsonDictionary;
        NSString *properties = [pamars smValueForKey:@"properties"];
        NSString *appId = [pamars smValueForKey:@"appId"];
        [self setSuperProperties:properties appId:appId];
    }];
    [native setExternalInterface:@"getSuperProperties" Callback:^(NSString* message) {
        NSDictionary *pamars = message.jsonDictionary;
        NSString *appId = [pamars smValueForKey:@"appId"];
        NSString *properties = [self getSuperProperties:appId];
        [__support callExternalInterface:@"getSuperProperties" Value:properties];
    }];
    [native setExternalInterface:@"unsetSuperProperty" Callback:^(NSString* message) {
        NSDictionary *pamars = message.jsonDictionary;
        NSString *property = [pamars smValueForKey:@"property"];
        NSString *appId = [pamars smValueForKey:@"appId"];
        [self unsetSuperProperty:property appId:appId];
    }];
    [native setExternalInterface:@"clearSuperProperties" Callback:^(NSString* message) {
        NSDictionary *pamars = message.jsonDictionary;
        NSString *appId = [pamars smValueForKey:@"appId"];
        [self clearSuperProperties:appId];
    }];
    [native setExternalInterface:@"userSet" Callback:^(NSString* message) {
        NSDictionary *pamars = message.jsonDictionary;
        NSString *properties = [pamars smValueForKey:@"properties"];
        NSString *appId = [pamars smValueForKey:@"appId"];
        [self userSet:properties appId:appId];
    }];
    [native setExternalInterface:@"userSetOnce" Callback:^(NSString* message) {
        NSDictionary *pamars = message.jsonDictionary;
        NSString *properties = [pamars smValueForKey:@"properties"];
        NSString *appId = [pamars smValueForKey:@"appId"];
        [self userSetOnce:properties appId:appId];
    }];
    [native setExternalInterface:@"userAppend" Callback:^(NSString* message) {
        NSDictionary *pamars = message.jsonDictionary;
        NSString *properties = [pamars smValueForKey:@"properties"];
        NSString *appId = [pamars smValueForKey:@"appId"];
        [self userAppend:properties appId:appId];
    }];
    [native setExternalInterface:@"userAdd" Callback:^(NSString* message) {
        NSDictionary *pamars = message.jsonDictionary;
        NSString *properties = [pamars smValueForKey:@"properties"];
        NSString *appId = [pamars smValueForKey:@"appId"];
        [self userAdd:properties appId:appId];
    }];
    [native setExternalInterface:@"userUnset" Callback:^(NSString* message) {
        NSDictionary *pamars = message.jsonDictionary;
        NSString *property = [pamars smValueForKey:@"property"];
        NSString *appId = [pamars smValueForKey:@"appId"];
        [self userUnset:property appId:appId];
    }];
    [native setExternalInterface:@"userDel" Callback:^(NSString* message) {
        NSDictionary *pamars = message.jsonDictionary;
        NSString *appId = [pamars smValueForKey:@"appId"];
        [self userDel:appId];
    }];
    [native setExternalInterface:@"identify" Callback:^(NSString* message) {
        NSDictionary *pamars = message.jsonDictionary;
        NSString *distinctId = [pamars smValueForKey:@"distinctId"];
        NSString *appId = [pamars smValueForKey:@"appId"];
        [self identify:distinctId appId:appId];
    }];
    [native setExternalInterface:@"initInstanceConfig" Callback:^(NSString* message) {
        NSDictionary *pamars = message.jsonDictionary;
        NSString *name = [pamars smValueForKey:@"name"];
        NSString *config = [pamars smValueForKey:@"config"];
        [self initInstance:name config:config];
    }];
    [native setExternalInterface:@"initInstanceAppId" Callback:^(NSString* message) {
        NSDictionary *pamars = message.jsonDictionary;
        NSString *name = [pamars smValueForKey:@"name"];
        NSString *appId = [pamars smValueForKey:@"appId"];
        [self initInstance:name appId:appId];
    }];
    [native setExternalInterface:@"lightInstance" Callback:^(NSString* message) {
        NSDictionary *pamars = message.jsonDictionary;
        NSString *name = [pamars smValueForKey:@"name"];
        NSString *appId = [pamars smValueForKey:@"appId"];
        NSString *ret = [self lightInstance:name appId:appId];
        [__support callExternalInterface:@"lightInstance" Value:ret];
    }];
    [native setExternalInterface:@"startThinkingAnalytics" Callback:^(NSString* message) {
        NSDictionary *pamars = message.jsonDictionary;
        NSString *appId = [pamars smValueForKey:@"appId"];
        [self startThinkingAnalytics:appId];
    }];
    [native setExternalInterface:@"setDynamicSuperProperties" Callback:^(NSString* message) {
        NSDictionary *pamars = message.jsonDictionary;
        NSString *dynamicProperties = [pamars smValueForKey:@"dynamicProperties"];
        NSString *appId = [pamars smValueForKey:@"appId"];
        [self setDynamicSuperProperties:dynamicProperties appId:appId];
    }];
    [native setExternalInterface:@"getDeviceId" Callback:^(NSString* message) {
        NSDictionary *pamars = message.jsonDictionary;
        NSString *appId = [pamars smValueForKey:@"appId"];
        NSString *ret = [self getDeviceId:appId];
        [__support callExternalInterface:@"getDeviceId" Value:ret];
    }];
    [native setExternalInterface:@"getDistinctId" Callback:^(NSString* message) {
        NSDictionary *pamars = message.jsonDictionary;
        NSString *appId = [pamars smValueForKey:@"appId"];
        NSString *ret = [self getDistinctId:appId];
        [__support callExternalInterface:@"getDistinctId" Value:ret];
    }];
    [native setExternalInterface:@"getAccountId" Callback:^(NSString* message) {
        NSDictionary *pamars = message.jsonDictionary;
        NSString *appId = [pamars smValueForKey:@"appId"];
        NSString *ret = [self getAccountId:appId];
        [__support callExternalInterface:@"getAccountId" Value:ret];
    }];
    [native setExternalInterface:@"getPresetProperties" Callback:^(NSString* message) {
        NSDictionary *pamars = message.jsonDictionary;
        NSString *appId = [pamars smValueForKey:@"appId"];
        NSString *ret = [self getPresetProperties:appId];
        [__support callExternalInterface:@"getPresetProperties" Value:ret];
    }];
    [native setExternalInterface:@"enableTracking" Callback:^(NSString* message) {
        NSDictionary *pamars = message.jsonDictionary;
        NSString *enabled = [pamars smValueForKey:@"enabled"];
        NSString *appId = [pamars smValueForKey:@"appId"];
        [self enableTracking:enabled appId:appId];
    }];
    [native setExternalInterface:@"optOutTracking" Callback:^(NSString* message) {
        NSDictionary *pamars = message.jsonDictionary;
        NSString *appId = [pamars smValueForKey:@"appId"];
        [self optOutTracking:appId];
    }];
    [native setExternalInterface:@"optOutTrackingAndDeleteUser" Callback:^(NSString* message) {
        NSDictionary *pamars = message.jsonDictionary;
        NSString *appId = [pamars smValueForKey:@"appId"];
        [self optOutTrackingAndDeleteUser:appId];
    }];
    [native setExternalInterface:@"optInTracking" Callback:^(NSString* message) {
        NSDictionary *pamars = message.jsonDictionary;
        NSString *appId = [pamars smValueForKey:@"appId"];
        [self optInTracking:appId];
    }];
}

+ (NSString*)currentAppId:(NSString*)appId {
    NSString *token = @"";
    if (([appId isKindOfClass:[NSNull class]] || appId == nil || appId.length == 0) && sAppIds.count > 0)
    {
        token = self.appIds[0];
    } else if (appId.length > 0){
        token = appId;
    }
    return token;
}
+ (ThinkingAnalyticsSDK *)currentInstance:(NSString *)appid {
    ThinkingAnalyticsSDK *instance;
    NSString *token = [self currentAppId:appid];
    if (token.length > 0) {
        instance = [self.instances objectForKey:token];
    }
    if (instance == nil) {
        NSLog(@"Instance does not exist");
    }
    return  instance;
}
+ (ThinkingAnalyticsAutoTrackEventType)currentAutoTrack:(NSString *)appid {
    ThinkingAnalyticsAutoTrackEventType type = ThinkingAnalyticsEventTypeNone;
    NSString *token = [self currentAppId:appid];
    if (token.length > 0) {
        type = [[self.autoTracks objectForKey:token] intValue];
    }
    if (type == ThinkingAnalyticsEventTypeNone) {
        NSLog(@"Auto Track type is None");
    }
    return  type;
}
+ (BOOL)isInit {
    return self.appIds.count > 0;
}
+ (NSMutableArray* )appIds {
    if(sAppIds == nil) {
        sAppIds = [NSMutableArray new];
    }
    return  sAppIds;
}
+ (NSMutableDictionary *)instances {
    if(sInstances == nil) {
        sInstances = [NSMutableDictionary new];
    }
    return sInstances;
}
+ (NSMutableDictionary *)autoTracks {
    if(sAutoTracks == nil) {
        sAutoTracks = [NSMutableDictionary new];
    }
    return sAutoTracks;
}
+ (NSMutableDictionary *)accountIds {
    if(sAccountIds == nil) {
        sAccountIds = [NSMutableDictionary new];
    }
    return sAccountIds;
}
+ (void)sharedInstance:(NSString *)appId server:(NSString *)serverUrl {
    TDConfig *tdConfig = [TDConfig defaultTDConfig];
    tdConfig.appid = appId;
    tdConfig.configureURL = serverUrl;
    [self _sharedInstance:tdConfig];
}
+ (void)sharedInstance:(NSString *)config {
    NSDictionary *configDic = config.jsonDictionary;
    NSString *appId = [configDic smValueForKey:@"appId"];
    NSString *serverUrl = [configDic smValueForKey:@"serverUrl"];
    NSString *debugMode = [configDic smValueForKey:@"debugMode"];
    NSString *enableLog = [configDic smValueForKey:@"enableLog"];
    TDConfig *tdConfig = [TDConfig defaultTDConfig];
    tdConfig.appid = appId;
    tdConfig.configureURL = serverUrl;
    if ([debugMode isEqualToString:@"debug"]) {
        tdConfig.debugMode = ThinkingAnalyticsDebug;
    } else if ([debugMode isEqualToString:@"debugOnly"]) {
        tdConfig.debugMode = ThinkingAnalyticsDebugOn;
    } else {
        tdConfig.debugMode = ThinkingAnalyticsDebugOff;
    }
    if ([enableLog boolValue]) {
        [ThinkingAnalyticsSDK setLogLevel:TDLoggingLevelDebug];
    } else {
        [ThinkingAnalyticsSDK setLogLevel:TDLoggingLevelNone];
    }
    NSDictionary *autoTrack = [configDic smValueForKey:@"autoTrack"];
    if (autoTrack != nil) {
        ThinkingAnalyticsAutoTrackEventType type = ThinkingAnalyticsEventTypeNone;
        if ([autoTrack smValueForKey:@"appShow"] != nil && [[autoTrack smValueForKey:@"appShow"] boolValue]) {
            type = type | ThinkingAnalyticsEventTypeAppStart;
        }
        if ([autoTrack smValueForKey:@"appHide"] != nil && [[autoTrack smValueForKey:@"appHide"] boolValue]) {
            type = type | ThinkingAnalyticsEventTypeAppEnd;
        }
        if ([autoTrack smValueForKey:@"appClick"] != nil && [[autoTrack smValueForKey:@"appClick"] boolValue]) {
            type = type | ThinkingAnalyticsEventTypeAppClick;
        }
        if ([autoTrack smValueForKey:@"appView"] != nil && [[autoTrack smValueForKey:@"appView"] boolValue]) {
            type = type | ThinkingAnalyticsEventTypeAppViewScreen;
        }
        if ([autoTrack smValueForKey:@"appCrash"] != nil && [[autoTrack smValueForKey:@"appCrash"] boolValue]) {
            type = type | ThinkingAnalyticsEventTypeAppViewCrash;
        }
        if ([autoTrack smValueForKey:@"appInstall"] != nil && [[autoTrack smValueForKey:@"appInstall"] boolValue]) {
            type = type | ThinkingAnalyticsEventTypeAppInstall;
        }
        [self.autoTracks setValue:@(type) forKey:appId];
    }
    [self _sharedInstance:tdConfig];
}
+ (void)_sharedInstance:(TDConfig *)config {
    NSString *appId = config.appid;
    ThinkingAnalyticsSDK *instance = self.instances[appId];
    if (instance == nil) {
        instance = [ThinkingAnalyticsSDK startWithConfig:config];
        [self.instances setValue:instance forKey:appId];
        [self.appIds addObject:appId];
    }
}
+ (void)startThinkingAnalytics:(NSString *)appId {
    ThinkingAnalyticsAutoTrackEventType type = [self currentAutoTrack:appId];
    [[self currentInstance:appId] enableAutoTrack:type];
}
+ (void)track:(NSString *)eventName appId:(NSString *)appId {
    [[self currentInstance:appId] track:eventName];
}
+ (void)track:(NSString *)eventName properties:(NSString *)properties appId:(NSString *)appId {
    [[self currentInstance:appId] track:eventName properties:properties.jsonDictionary];
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
    [[self currentInstance:appId] track:eventName properties:properties.jsonDictionary time:date timeZone:timeZone];
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
    [[self currentInstance:appId] trackWithEventModel:eventModel];
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
    [[self currentInstance:appId] trackWithEventModel:eventModel];
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
    [[self currentInstance:appId] trackWithEventModel:eventModel];
}
+ (void)timeEvent:(NSString *)eventName appId:(NSString *)appId {
    [[self currentInstance:appId] timeEvent:eventName];
}
+ (void)login:(NSString *)accoundId appId:(NSString *)appId {
    [[self accountIds] setObject:accoundId forKey:[self currentAppId:appId]];
    [[self currentInstance:appId] login:accoundId];
}
+ (void)logout:(NSString *)appId  {
    [[self accountIds] removeObjectForKey:[self currentAppId:appId]];
    [[self currentInstance:appId] logout];
}
+ (void)setSuperProperties:(NSString *)properties appId:(NSString *)appId {
    [[self currentInstance:appId] setSuperProperties:properties.jsonDictionary];
}
+ (void)unsetSuperProperty:(NSString *)property appId:(NSString *)appId {
    [[self currentInstance:appId] unsetSuperProperty:property];
}
+ (void)clearSuperProperties:(NSString *)appId  {
    [[self currentInstance:appId] clearSuperProperties];
}
+ (void)userSet:(NSString *)properties appId:(NSString *)appId {
    [[self currentInstance:appId] user_set:properties.jsonDictionary];
}
+ (void)userSetOnce:(NSString *)properties appId:(NSString *)appId {
    [[self currentInstance:appId] user_setOnce:properties.jsonDictionary];
}
+ (void)userAppend:(NSString *)properties appId:(NSString *)appId {
    [[self currentInstance:appId] user_append:properties.jsonDictionary];
}
+ (void)userAdd:(NSString *)properties appId:(NSString *)appId {
    [[self currentInstance:appId] user_add:properties.jsonDictionary];
}
+ (void)userUnset:(NSString *)property appId:(NSString *)appId {
    [[self currentInstance:appId] user_unset:property];
}
+ (void)userDel:(NSString *)appId  {
    [[self currentInstance:appId] user_delete];
}
+ (void)authorizeOpenID:(NSString *)distinctId appId:(NSString *)appId {
    [[self currentInstance:appId] identify:distinctId];
}
+ (void)identify:(NSString *)distinctId appId:(NSString *)appId {
    [[self currentInstance:appId] identify:distinctId];
}
+ (void)initInstance:(NSString *)name appId:(NSString *)appId {
    self.instances[name] = [self currentInstance:appId];
}
+ (void)initInstance:(NSString *)name config:(NSString *)config {
    [self sharedInstance:config];
    NSDictionary *configDic = config.jsonDictionary;
    NSString *appId = [configDic smValueForKey:@"appId"];
    self.instances[name] = [self currentInstance:appId];
}
+ (NSString *)lightInstance:(NSString *)name appId:(NSString *)appId {
    NSString *ret = @"";
    if([self currentInstance:appId] != nil) {
        ThinkingAnalyticsSDK *lightInstance = [[self currentInstance:appId] createLightInstance];
        NSString *uuid = [NSUUID UUID].UUIDString;
        self.instances[uuid] = lightInstance;
        ret = uuid;
    }
    return ret;
}
+ (void)setDynamicSuperProperties:(NSString *)callFromNative appId:(NSString *)appId {
    [[self currentInstance:appId] registerDynamicSuperProperties:^NSDictionary<NSString *, id> *(){
        return @{};
    }];
}
+ (NSString *)getDeviceId:(NSString *)appId  {
    NSString *ret = [[self currentInstance:appId] getDeviceId];
    return ret;
}
+ (NSString *)getDistinctId:(NSString *)appId {
    NSString *ret = [[self currentInstance:appId] getDistinctId];
    return ret;
}
+ (NSString *)getAccountId:(NSString *)appId {
    NSString *ret = [[self accountIds] objectForKey:[self currentAppId:appId]];
    if (ret == nil || ret.length<0) {
        ret = [[self currentInstance:appId] valueForKey:@"accountId"];
    }
    return ret?:@"";
}
+ (NSString *)getSuperProperties:(NSString *)appId {
    NSString *ret = @"{}";
    NSDictionary *jsonDict = [[self currentInstance:appId] currentSuperProperties];
    if ([NSJSONSerialization isValidJSONObject:jsonDict]) {
        NSError *error = nil;
        NSData *jsonData = [NSJSONSerialization dataWithJSONObject:jsonDict options:NSJSONWritingPrettyPrinted error:&error];
        if (error == nil) {
            ret = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
        }
    }
    return ret;
}
+ (NSString *)getPresetProperties:(NSString *)appId {
    NSString *ret = @"{}";
    TDPresetProperties *presetProperties = [[self currentInstance:appId] getPresetProperties];
    NSDictionary *jsonDict = [presetProperties toEventPresetProperties];
    if ([NSJSONSerialization isValidJSONObject:jsonDict]) {
        NSError *error = nil;
        NSData *jsonData = [NSJSONSerialization dataWithJSONObject:jsonDict options:NSJSONWritingPrettyPrinted error:&error];
        if (error == nil) {
            ret = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
        }
    }
    return ret;
}
+ (void)enableTracking:(NSString *)enabled appId:(NSString *)appId {
    [[self currentInstance:appId] enableTracking:enabled.boolValue];
}
+ (void)optOutTracking:(NSString *)appId {
    [[self currentInstance:appId] optOutTracking];
}
+ (void)optOutTrackingAndDeleteUser:(NSString *)appId {
    [[self currentInstance:appId] optOutTrackingAndDeleteUser];
}
+ (void)optInTracking:(NSString *)appId {
    [[self currentInstance:appId] optInTracking];
}

+ (NSDate *)taDateFromString:(NSString *)time {
    static NSString *kDateFormat = @"yyyy-MM-dd HH:mm:ss.SSS";
    NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
    dateFormatter.dateFormat = kDateFormat;
    NSDate *dateTime = [dateFormatter dateFromString:time];
    return dateTime;
}

@end
