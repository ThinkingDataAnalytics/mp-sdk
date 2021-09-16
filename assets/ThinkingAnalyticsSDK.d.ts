
declare class ThinkingAnalyticsAPI {
    constructor(config:any);
	init(): void;
	track(eventName:string): void;
	track(eventName:string, properties:any): void;
	track(eventName:string, properties:any, time:any): void;
	track(eventName:string, properties:any, time:any, onComplete:any): void;
	track(taEvent:any): void;
	trackUpdate(taEvent:any): void;
	trackFirstEvent(taEvent:any): void;
	trackOverwrite(taEvent:any): void;
	timeEvent(eventName:string): void;
	login(accoundId:string): void;
	logout(): void;
	setSuperProperties(properties:any): void;
	unsetSuperProperty(properties:any): void;
	clearSuperProperties(): void;
	userSet(properties:any): void;
	userSetOnce(properties:any): void;
	userAppend(properties:any): void;
	userAdd(properties:any): void;
	userUnset(property:string): void;
	userDel(): void;
	authorizeOpenID(distinctId:string): void;
	identify(distinctId:string): void;
	initInstance(name:string): ThinkingAnalyticsAPI;
	initInstance(name:string, config:any): ThinkingAnalyticsAPI;
	lightInstance(name:string): any;
	setDynamicSuperProperties(properties: any): void;
	getDeviceId(callback?: any): string;
	getDistinctId(callback?: any): string;
	getAccountId(callback?: any): string;
	getPresetProperties(callback?: any): any;
	enableTracking(enabled:boolean): void;
    optOutTracking(): void;
    optOutTrackingAndDeleteUser(): void;
    optInTracking(): void;
}
