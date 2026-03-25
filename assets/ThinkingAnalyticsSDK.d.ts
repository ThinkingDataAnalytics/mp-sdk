
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
	userUniqAppend(properties:any): void;
	userAdd(properties:any): void;
	userUnset(property:string): void;
	userDel(): void;
	flush(): void;
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
	getSuperProperties(callback?: any): any;
	/**
     * Pause/Resume reporting event data
     * @param {bool} enabled:true is Resume, false is Pause
     * @deprecated This method is deprecated, use setTrackStatus() instand.
     */
	enableTracking(enabled:boolean): void;
	/**
     * Stop reporting event data, and cache data will be cleared
     * @deprecated This method is deprecated, use setTrackStatus() instand.
     */
    optOutTracking(): void;
	/**
     * Stop reporting event data, and cache data will be cleared, and flush a user_del
     * @deprecated This method is deprecated, use setTrackStatus() instand.
     */
    optOutTrackingAndDeleteUser(): void;
	/**
     * Allow reporting event data
     * @deprecated This method is deprecated, use setTrackStatus() instand.
     */
    optInTracking(): void;
	/**
    * Set status for events reporting
    * PAUSE, pause events reporting
    * STOP, stop events reporting, and cache data will be cleared
    * SAVE_ONLY, event data stores in the cache, but not be reported (native support, js equal to NORMAL)
    * NORMAL, resume event reporting
    * @param {string} status, events reporting status
    */
	setTrackStatus(status: string): void;
}
