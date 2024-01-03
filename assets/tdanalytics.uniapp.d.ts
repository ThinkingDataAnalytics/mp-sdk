declare class TDAnalytics {
	static init(config:any): void;

	static track(options:any, appId?:string): void;
	static trackFirst(options:any, appId?:string): void;
	static trackUpdate(options:any, appId?:string): void;
	static trackOverwrite(options:any, appId?:string): void;
	static timeEvent(options:any, appId?:string): void;

	static userSet(options:any, appId?:string): void;
	static userSetOnce(options:any, appId?:string): void;
	static userUnset(options:any, appId?:string): void;
	static userAdd(options:any, appId?:string): void;
	static userAppend(options:any, appId?:string): void;
	static userUniqAppend(options:any, appId?:string): void;
	static userDelete(options?:any, appId?:string): void;

	static setSuperProperties(properties:any, appId?:string): void;
	static unsetSuperProperty(property:string, appId?:string): void;
	static clearSuperProperties(appId?:string): void;
	static getSuperProperties(appId?:string): any;

	static setDynamicSuperProperties(dynamicProperties: any, appId?: string): void;
	static getPresetProperties(appId?: string): any;

	static login(accoundId:string, appId?: string): void;
	static logout(appId?: string): void;
	static getAccountId(appId?: string): string;

	static setDistinctId(distinctId:string, appId?: string): void;
	static getDistinctId(appId?: string): string;

	static lightInstance(appId?: string): any;

	static getDeviceId(appId?: string): string;

	static flush(appId?: string): void;
	static setTrackStatus(status: string, appId?: string): void;

	static getSDKVersion(): string;

    static ThinkingDataAPI(): any;
}
export default TDAnalytics