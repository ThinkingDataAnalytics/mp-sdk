
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
	/**
     * 暂停/开启上报
     * @param {bool} enabled YES：开启上报 NO：暂停上报
     * @deprecated This method is deprecated, use setTrackStatus() instand.
     */
	enableTracking(enabled:boolean): void;
	/**
     * 停止上报，后续的上报和设置都无效，数据将清空
     * @deprecated This method is deprecated, use setTrackStatus() instand.
     */
    optOutTracking(): void;
	/**
     * 停止上报，后续的上报和设置都无效，数据将清空，并且发送 user_del
     * @deprecated This method is deprecated, use setTrackStatus() instand.
     */
    optOutTrackingAndDeleteUser(): void;
	/**
     * 允许上报
     * @deprecated This method is deprecated, use setTrackStatus() instand.
     */
    optInTracking(): void;
	/**
    * 设置数据上报状态
    * PAUSE 暂停数据上报
    * STOP 停止数据上报，并清除缓存
    * SAVE_ONLY 数据入库，但不上报 (接入Native原生可支持，JS暂不支持此状态，默认等同 NORMAL)
    * NORMAL 恢复数据上报
    * @param {string} status 上报状态
    */
	setTrackStatus(status: string): void;
}
