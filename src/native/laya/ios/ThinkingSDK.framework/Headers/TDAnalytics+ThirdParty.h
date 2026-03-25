//
//  TDAnalytics+ThirdParty.h
//  ThinkingSDK
//
//  Created by 杨雄 on 2023/8/17.
//

#import <ThinkingSDK/TDAnalytics.h>

NS_ASSUME_NONNULL_BEGIN

@interface TDAnalytics (ThirdParty)

#if TARGET_OS_IOS

+ (void)enableThirdPartySharing:(TDThirdPartyType)type API_UNAVAILABLE(macos);
+ (void)enableThirdPartySharing:(TDThirdPartyType)type properties:(NSDictionary<NSString *, NSObject *> *)properties API_UNAVAILABLE(macos);

+ (void)enableThirdPartySharing:(TDThirdPartyType)type withAppId:(NSString *)appId API_UNAVAILABLE(macos);
+ (void)enableThirdPartySharing:(TDThirdPartyType)type properties:(NSDictionary<NSString *, NSObject *> *)properties withAppId:(NSString *)appId API_UNAVAILABLE(macos);

#endif

@end

NS_ASSUME_NONNULL_END
