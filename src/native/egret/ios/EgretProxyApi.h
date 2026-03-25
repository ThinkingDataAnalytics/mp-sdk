//
//  EgretProxyApi.h
//  NewProject-mobile
//
//  Created by huangdiao on 2021/7/20.
//

#import <Foundation/Foundation.h>
#import <EgretNativeIOS.h>

NS_ASSUME_NONNULL_BEGIN

@interface EgretProxyApi : NSObject

//@property (class, nonatomic, copy) EgretNativeIOS* nativeProxy;

+ (void)registExternalInterface:(EgretNativeIOS *)native;

@end

NS_ASSUME_NONNULL_END
