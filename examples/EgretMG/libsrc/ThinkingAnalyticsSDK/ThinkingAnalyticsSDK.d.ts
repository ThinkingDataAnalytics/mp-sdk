
declare class ThinkingDataAPI {
    constructor(config:any);
	init(): void;
	track(eventName:string): void;
	track(eventName:string, properties:any): void;
	track(eventName:string, properties:any, time:any): void;
	track(eventName:string, properties:any, time:any, onComplete:any): void;
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
	initInstance(name:string): void;
	initInstance(name:string, config:any): void;
	lightInstance(name:string): any;
	setDynamicSuperProperties(properties: any): void;
	getDeviceId(): string;
}
