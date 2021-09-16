/* eslint-disable no-undef */
import {
    _,
    logger,
    slice
} from './utils';

// Utils for checking data format.
import {
    PropertyChecker
} from './PropertyChecker';

// Information for default properties: #lib_name, #lib_version, etc.
// The value of these properties is set in compile process.
import {
    Config
} from './Config';

// senderQueue is  a global queue for events being posted to server.
import senderQueue from './SenderQueue';

// PlatformAPI provides interfaces for storage, network, system information, etc.
import PlatformAPI from './PlatformAPI';

const DEFAULT_CONFIG = {
    name: 'thinkingdata', // 全局变量名称
    // eslint-disable-next-line camelcase
    is_plugin: false, // 是否是插件版本。基础库 < 2.6.4 不允许修改 App 和 Page
    maxRetries: 3, // 当网络出错或者超时时，最大重试次数. v1.3.0+
    sendTimeout: 3000, // 请求超时时间, 单位毫秒
    enablePersistence: true, // 是否使用本地缓存
    asyncPersistence: false, // 是否使用异步存储
    enableLog: true, // 是否打开日志
    strict: false, // 关闭严格数据格式校验。允许可能的问题数据上报
    debugMode: 'none' // Debug 模式
};

/**
 * 异步获取系统信息，初始化预置属性
 *
 * #lib SDK 类型，小程序中值为 MP
 * #lib_version SDK 版本
 * #network_type 上传事件时的网络类型
 * #manufacture 设备制造商
 * #device_model 设备型号，如iPhone 8
 * #screen_width 设备屏幕宽度
 * #screen_height 设备屏幕高度
 * #os 操作系统
 * #os_version 操作系统版本
 * #mp_platform 平台名称
 */
var systemInformation = {
    properties: {
        '#lib': Config.LIB_NAME,
        '#lib_version': Config.LIB_VERSION,
    },
    initDeviceId: function (deviceId) {
        if (_.isString(deviceId)) {
            this.properties['#device_id'] = deviceId;
        }
    },
    getSystemInfo: function (callback) {
        var that = this;
        PlatformAPI.onNetworkStatusChange(function (res) {
            that.properties['#network_type'] = res.networkType;
        });

        PlatformAPI.getNetworkType({
            success(res) {
                that.properties['#network_type'] = res.networkType;
            },
            complete() {
                PlatformAPI.getSystemInfo({
                    success(res) {
                        logger.info(JSON.stringify(res, null, 4));
                        let osInfo = res['system'] ? res['system'].replace(/\s+/g, ' ').split(' ') : [];
                        var data = {
                            '#manufacturer': res['brand'],
                            '#device_model': res['model'],
                            '#screen_width': Number(res['screenWidth']),
                            '#screen_height': Number(res['screenHeight']),
                            '#os': osInfo[0],
                            '#os_version': osInfo[1],
                            '#mp_platform': res['mp_platform'],
                        };
                        _.extend(that.properties, data);
                        _.setMpPlatform(res['mp_platform']);
                    },
                    complete() {
                        callback();
                    }
                });
            },
        });
    },
};

/**
 * 数据缓存的包装类。
 *
 * 本地缓存的 key 值及其对应的属性 key 为:
 * 1. device_id: #device_id
 * 2. distinct_id: #distinct_id
 * 3. account_id: #account_id
 * 4. props: 事件公共属性
 * 5. event_timers: #duration
 *
 */
class ThinkingDataPersistence {
    constructor(config, callback) {
        this.enabled = config.enablePersistence;
        if (this.enabled) {
            if (config.isChildInstance) {
                this.name = config.persistenceName + '_' + config.name;
                this.nameOld = config.persistenceNameOld + '_' + config.name;
            } else {
                this.name = config.persistenceName;
                this.nameOld = config.persistenceNameOld;
            }
            if (config.asyncPersistence) {
                this._state = {};
                PlatformAPI.getStorage(this.name, true, (data) => {
                    if (_.isEmptyObject(data)) {
                        PlatformAPI.getStorage(this.nameOld, true, (dataOld) => {
                            this._state = _.extend2Layers({}, dataOld, this._state);
                            this._init(config, callback);
                            this._save();
                        });
                    } else {
                        this._state = _.extend2Layers({}, data, this._state);
                        this._init(config, callback);
                        this._save();    
                    }
                });
            } else {
                this._state = PlatformAPI.getStorage(this.name) || {};
                if(_.isEmptyObject(this._state)) {
                    this._state = PlatformAPI.getStorage(this.nameOld) || {};
                }
                this._init(config, callback);
            }
        } else {
            this._state = {};
            this._init(config, callback);
        }
    }

    _init(config, callback) {
        if (!this.getDistinctId()) {
            this.setDistinctId(_.UUID());
        }

        if (!config.isChildInstance) {
            if (!this.getDeviceId()) {
                this._setDeviceId(_.UUID());
            }
            systemInformation.initDeviceId(this.getDeviceId());
        }

        // 表明初始化完成，可以进行本地缓存的写操作
        this.initComplete = true;

        if (typeof callback === 'function') {
            callback();
        }

        this._save();
    }

    _save() {
        if (this.enabled && this.initComplete) {
            PlatformAPI.setStorage(this.name, JSON.stringify(this._state));
        }
    }

    _set(name, value) {
        var obj;
        if (typeof name === 'string') {
            obj = {};
            obj[name] = value;
        } else if (typeof name === 'object') {
            obj = name;
        }
        _.each(obj, (value, key) => {
            this._state[key] = value;
        });
        this._save();
    }

    _get(name) {
        return this._state[name];
    }

    setEventTimer(eventName, timestamp) {
        var timers = this._state.event_timers || {};
        timers[eventName] = timestamp;
        this._set('event_timers', timers);
    }

    removeEventTimer(eventName) {
        var timers = this._state.event_timers || {};
        var timestamp = timers[eventName];
        if (!_.isUndefined(timestamp)) {
            delete this._state.event_timers[eventName];
            this._save();
        }
        return timestamp;
    }

    getDeviceId() {
        return this._state.device_id;
    }

    _setDeviceId(deviceId) {
        if (this.getDeviceId()) {
            logger.warn('cannot modify the device id.');
            return;
        }
        this._set('device_id', deviceId);
    }

    getDistinctId() {
        return this._state.distinct_id;
    }

    setDistinctId(distinctId) {
        this._set('distinct_id', distinctId);
    }

    getAccountId() {
        return this._state.account_id;
    }

    setAccountId(accoundId) {
        this._set('account_id', accoundId);
    }

    getSuperProperties() {
        return this._state.props || {};
    }

    setSuperProperties(superProperties, replace) {
        var props = replace ? superProperties : _.extend(this.getSuperProperties(), superProperties);
        this._set('props', props);
    }
}

export default class ThinkingDataAPI {
    constructor(config) {
        var defaultConfig = _.extend({}, DEFAULT_CONFIG, PlatformAPI.getConfig());
        if (_.isObject(config)) {
            this.config = _.extend(defaultConfig, config);
        } else {
            this.config = defaultConfig;
        }
        this._init(this.config);
    }

    // internal init function. it should not be used by users.
    _init(config) {
        this.name = config.name;
        this.appId = config.appId || config.appid;
        var serverUrl = config.serverUrl || config.server_url;
        this.serverUrl = serverUrl + '/sync_xcx';
        this.serverDebugUrl = serverUrl + '/data_debug';
        this.configUrl = serverUrl + '/config';
        this.autoTrackProperties = {};
        // cache commands.
        this._queue = [];

        this.updateConfig(this.configUrl, this.appId);
        if (config.isChildInstance) {
            this._state = {};
        } else {
            logger.enabled = config.enableLog;
            this.instances = []; // 子实例名称
            this._state = {
                getSystemInfo: false,
                initComplete: false,
            };
            systemInformation.getSystemInfo(() => {
                this._updateState({
                    getSystemInfo: true,
                });
            });

            PlatformAPI.setGlobal(this, this.name);
            if (config.autoTrack) {
                this.autoTrack = PlatformAPI.initAutoTrackInstance(this, config);
            } else {
                var launchOptions = PlatformAPI.getAppOptions((options) => {
                    if (options && options.scene) {
                        this._setAutoTrackProperties({
                            '#scene': options.scene,
                        });
                    }

                });
                if (launchOptions.scene) {
                    this._setAutoTrackProperties({
                        '#scene': launchOptions.scene,
                    });
                }
            }
        }

        this.store = new ThinkingDataPersistence(config, () => {
            if (this.config.asyncPersistence && _.isFunction(this.config.persistenceComplete)) {
                this.config.persistenceComplete(this);
            }
            this._updateState();
        });
        this.enabled = _.isBoolean(this.store._get("ta_enabled")) ? this.store._get("ta_enabled") : true;
        this.isOptOut = _.isBoolean(this.store._get("ta_isOptOut")) ? this.store._get("ta_isOptOut") : false;
    }

    updateConfig(configUrl, appId) {
        var headers = _.createExtraHeaders();
        headers['content-type'] = 'application/json';
        var request = PlatformAPI.request({
            url: configUrl + "?appid="+ appId,
            method: 'GET',
            header: headers,
            success: (res) => {
                logger.info("config update success" + "(" + appId + ") :" + JSON.stringify(res.data));                
                this.config.syncBatchSize = res.data["data"]["sync_batch_size"];
                this.config.syncInterval = res.data["data"]["sync_interval"];
                this.config.disableEventList = res.data["data"]["disable_event_list"];
            },
            fail: (res) => {
                logger.info("config update fail" + "(" + appId + ") :" + res.errMsg);
            }
        });
        setTimeout(function () {
            if ((_.isObject(request) || _.isPromise(request)) && _.isFunction(request.abort)) {
                request.abort();
            }
        }, 3000);
    }

    /**
     * 创建新的实例（子实例）。所有可以设置的属性都与主实例独立。
     *
     * @param {string} name 子实例名称
     * @param {object} config 可选 子实例配置信息
     */
    initInstance(name, config) {
        if (this.config.isChildInstance) {
            logger.warn('initInstance() cannot be called on child instance');
            return undefined;
        }

        if (_.isString(name) && name !== this.name && _.isUndefined(this[name])) {
            var instance = new ThinkingDataAPI(_.extend({},
                this.config, {
                    enablePersistence: false,
                    isChildInstance: true,
                    name,
                },
                config));
            this[name] = instance;
            this.instances.push(name);
            this[name]._state = this._state;
            return instance;
        } else {
            logger.warn('initInstance() failed due to the name is invalid: ' + name);
            return undefined;
        }
    }

    /**
     * 用于获取子实例，用于白鹭引擎 t.ds 代码调用
     *
     * @param {string} name 子实例名称
     */
    lightInstance(name) {
        return this[name];
    }

    /**
     * 内部函数，用于设置与生命周期相关的一些预置属性
     *
     * 常见的属性有：
     * - #scene 场景值，在 onLaunch 回调中可获取。也可以根据平台接口主动获取
     * - #url_path 页面路径
     *
     * 在发送事件数据时，优先级为：事件属性 > 动态公共属性 > 公共事件属性 > 自动采集属性 > 其他预置属性
     *
     * @param {object} props 相关预置属性
     */
    _setAutoTrackProperties(props) {
        _.extend(this.autoTrackProperties, props);
    }

    /**
     * 用户主动调用 init()，开始真正的上报。
     *
     * 在调用此函数之前，所有的上报请求将被缓存。当用户完成必要的设置时，调用此函数触发上报.
     */
    init() {
        if (this._state.initComplete) return false;
        this._updateState({
            initComplete: true,
        });
    }

    /**
     * 内部函数，判断是否完成初始化，可以真正发送数据
     *
     * 每个实例有三个异步状态
     * - getSystemInfo 是否获取到系统信息，子实例默认此状态为 true.
     * - initComplete 是否调用了init() 函数，true 则表明用户已经完成必要的初始化设置。子实例此状态默认为 true.
     * - store.initComplete 缓存信息是否已经读取完成
     */
    _isReady() {
        return this._state.getSystemInfo &&
            this._state.initComplete &&
            this.store.initComplete &&
            this.getDeviceId();
    }

    _updateState(state) {
        if (_.isObject(state)) {
            _.extend(this._state, state);
        }
        this._onStateChange();
        _.each(this.instances, (name) => {
            this[name]._onStateChange();
        });
    }

    // 只有系统信息初始化完成，并且用户主动调用init()之后，才会真正的发送数据.
    _onStateChange() {
        if (this._isReady() && this._queue && this._queue.length > 0) {
            _.each(this._queue, (item) => {
                this[item[0]].apply(this, slice.call(item[1]));
            });
            this._queue = [];
        }
    }

    _hasDisabled() {
        var hasDisabled = !this.enabled || this.isOptOut;
        if (hasDisabled) {
            logger.info("ThinkingData is Pause or Stop!");
        }
        return hasDisabled;
    }

    // 发送请求。由于一些平台对网络连接数目的限制，我们使用 senderQueue 发送数据。
    _sendRequest(eventData, time) {
        if (this._hasDisabled()) {
            return;
        }
        if (this.config.disableEventList != null) {
            if (this.config.disableEventList.includes(eventData.eventName)) {
                logger.info("disabled Event : " + eventName);
                return;
            }
        }
        time = _.isDate(time) ? time : new Date();
        var data = {
            data: [{
                '#type': eventData.type,
                '#time': _.formatDate(time),
                '#distinct_id': this.store.getDistinctId()
            }]
        };
        if (this.store.getAccountId()) {
            data.data[0]['#account_id'] = this.store.getAccountId();
        }

        if (eventData.type === 'track' || eventData.type === 'track_update' || eventData.type === 'track_overwrite') {
            data.data[0]['#event_name'] = eventData.eventName;
            if (eventData.type === 'track_update' || eventData.type === 'track_overwrite') {
                data.data[0]['#event_id'] = eventData.extraId;
            } else if (eventData.firstCheckId) {
                data.data[0]['#first_check_id'] = eventData.firstCheckId;
            }

            data.data[0]['properties'] = _.extend(
                {
                    '#zone_offset': 0 - (time.getTimezoneOffset() / 60.0),
                },
                systemInformation.properties,
                this.autoTrackProperties,
                this.store.getSuperProperties(),
                this.dynamicProperties ? this.dynamicProperties() : {}
            );

            var startTimestamp = this.store.removeEventTimer(eventData.eventName);
            if (!_.isUndefined(startTimestamp)) {
                var durationMillisecond = new Date()
                    .getTime() - startTimestamp;
                data.data[0]['properties']['#duration'] = parseFloat((durationMillisecond / 1000)
                    .toFixed(3));
            }
        } else {
            data.data[0]['properties'] = {};
        }

        if (_.isObject(eventData.properties) && !_.isEmptyObject(eventData.properties)) {
            _.extend(data.data[0].properties, eventData.properties);
        }
        _.searchObjDate(data.data[0]);

        if (this.config.maxRetries > 1) {
            data.data[0]['#uuid'] = _.UUIDv4();
        }

        data['#app_id'] = this.appId;
        logger.info(JSON.stringify(data, null, 4));

        var serverUrl = (this.config.debugMode === 'debug' || this.config.debugMode === 'debugOnly') ? this.serverDebugUrl : this.serverUrl;

        senderQueue.enqueue(data, serverUrl, {
            maxRetries: this.config.maxRetries,
            sendTimeout: this.config.sendTimeout,
            callback: eventData.onComplete,
            debugMode: this.config.debugMode,
            deviceId: this.getDeviceId()
        });
    }

    // 是否为参数对象
    _isObjectParams(obj) {
        return _.isObject(obj) && _.isFunction(obj.onComplete);
    }

    /**
     * 发送事件数据. 会对属性值进行校验.
     * @param {string} eventName 必填
     * @param {object} properties 可选
     * @param {date} time 可选
     * @param {function} onComplete 可选, 回调函数
     */
    track(eventName, properties, time, onComplete) {
        if (this._hasDisabled()) {
            return;
        }
        if (this._isObjectParams(eventName)) {
            var options = eventName;
            eventName = options.eventName;
            properties = options.properties;
            time = options.time;
            onComplete = options.onComplete;
        }

        if ((PropertyChecker.event(eventName) && PropertyChecker.properties(properties)) || !this.config.strict) {
            this._internalTrack(eventName, properties, time, onComplete);
        } else if (_.isFunction(onComplete)) {
            onComplete({
                code: -1,
                msg: 'invalid parameters',
            });
        }
    }

    /**
     * 发送可更新事件
     * @param {object} options 参数对象
     *
     * options.eventName: 必须，事件名称
     * options.eventId: 必须，事件 ID, 用以标识可更新事件
     * options.time: 可选，事件时间
     * options.properties: 可选，事件属性
     * options.onComplete: 可选，事件上报回调，参数为 object
     */
    trackUpdate(options) {
        if (this._hasDisabled()) {
            return;
        }
        if (options && options.eventId &&
                ((PropertyChecker.event(options.eventName) && PropertyChecker.properties(options.properties)) || !this.config.strict)) {
            var time = _.isDate(options.time) ? options.time : new Date();
            if (this._isReady()) {
                this._sendRequest({
                    type: 'track_update',
                    eventName: options.eventName,
                    properties: options.properties,
                    onComplete: options.onComplete,
                    extraId: options.eventId
                }, time);
            } else {
                options.time = time;
                this._queue.push(['trackUpdate', [options]]);
            }
        } else {
            logger.warn('Invalide parameter for trackUpdate: you should pass an object contains eventId to trackUpdate()');
            if (_.isFunction(options.onComplete)) {
                options.onComplete({
                    code: -1,
                    msg: 'invalid parameters',
                });
            }
        }
    }

    /**
     * 发送可重写事件
     * @param {object} options 参数对象
     *
     * options.eventName: 必须，事件名称
     * options.eventId: 必须，事件 ID, 用以标识可更新事件
     * options.time: 可选，事件时间
     * options.properties: 可选，事件属性
     * options.onComplete: 可选，事件上报回调，参数为 object
     */
    trackOverwrite(options) {
        if (this._hasDisabled()) {
            return;
        }
        if (options && options.eventId &&
                ((PropertyChecker.event(options.eventName) && PropertyChecker.properties(options.properties)) || !this.config.strict)) {
            var time = _.isDate(options.time) ? options.time : new Date();
            if (this._isReady()) {
                this._sendRequest({
                    type: 'track_overwrite',
                    eventName: options.eventName,
                    properties: options.properties,
                    onComplete: options.onComplete,
                    extraId: options.eventId
                }, time);
            } else {
                options.time = time;
                this._queue.push(['trackOverwrite', [options]]);
            }
        } else {
            logger.warn('Invalide parameter for trackOverwrite: you should pass an object contains eventId to trackOverwrite()');
            if (_.isFunction(options.onComplete)) {
                options.onComplete({
                    code: -1,
                    msg: 'invalid parameters',
                });
            }
        }
    }

    /**
     * 发送首次事件
     * @param {object} options 参数对象
     *
     * options.eventName: 必须，事件名称
     * options.firstCheckId: 可选，用作首次检测标识，默认取随机生成的 #device_id
     * options.time: 可选，事件时间
     * options.properties: 可选，事件属性
     * options.onComplete: 可选，事件上报回调，参数为 object
     */
    trackFirstEvent(options) {
        if (this._hasDisabled()) {
            return;
        }
        if (options && options.eventName &&
                ((PropertyChecker.event(options.eventName) && PropertyChecker.properties(options.properties)) || !this.config.strict)) {
            var time = _.isDate(options.time) ? options.time : new Date();
            if (this._isReady()) {
                this._sendRequest({
                    type: 'track',
                    eventName: options.eventName,
                    properties: options.properties,
                    onComplete: options.onComplete,
                    firstCheckId: options.firstCheckId ? options.firstCheckId : this.getDeviceId()
                }, time);
            } else {
                options.time = time;
                this._queue.push(['trackFirstEvent', [options]]);
            }
        } else {
            logger.warn('Invalide parameter for trackFirstEvent: you should pass an object contains eventName to trackFirstEvent()');
            if (_.isFunction(options.onComplete)) {
                options.onComplete({
                    code: -1,
                    msg: 'invalid parameters',
                });
            }
        }
    }

    // internal function. Do not call this function directly.
    _internalTrack(eventName, properties, time, onComplete) {
        if (this._hasDisabled()) {
            return;
        }
        time = _.isDate(time) ? time : new Date();
        if (this._isReady()) {
            this._sendRequest({
                type: 'track',
                eventName,
                properties,
                onComplete,
            }, time);
        } else {
            this._queue.push(['_internalTrack', [eventName, properties, time, onComplete]]);
        }
    }

    userSet(properties, time, onComplete) {
        if (this._hasDisabled()) {
            return;
        }
        if (this._isObjectParams(properties)) {
            var options = properties;
            properties = options.properties;
            time = options.time;
            onComplete = options.onComplete;
        }

        if (PropertyChecker.propertiesMust(properties) || !this.config.strict) {
            time = _.isDate(time) ? time : new Date();
            if (this._isReady()) {
                this._sendRequest({
                    type: 'user_set',
                    properties,
                    onComplete,
                }, time);

            } else {
                this._queue.push(['userSet', [properties, time, onComplete]]);
            }
        } else {
            logger.warn('calling userSet failed due to invalid arguments');
            if (_.isFunction(onComplete)) {
                onComplete({
                    code: -1,
                    msg: 'invalid parameters',
                });
            }
        }
    }

    userSetOnce(properties, time, onComplete) {
        if (this._hasDisabled()) {
            return;
        }
        if (this._isObjectParams(properties)) {
            var options = properties;
            properties = options.properties;
            time = options.time;
            onComplete = options.onComplete;
        }

        if (PropertyChecker.propertiesMust(properties) || !this.config.strict) {
            time = _.isDate(time) ? time : new Date();
            if (this._isReady()) {
                this._sendRequest({
                    type: 'user_setOnce',
                    properties,
                    onComplete,
                }, time);
            } else {
                this._queue.push(['userSetOnce', [properties, time, onComplete]]);
            }
        } else {
            logger.warn('calling userSetOnce failed due to invalid arguments');
            if (_.isFunction(onComplete)) {
                onComplete({
                    code: -1,
                    msg: 'invalid parameters',
                });
            }
        }
    }

    userUnset(property, time, onComplete) {
        if (this._hasDisabled()) {
            return;
        }
        if (this._isObjectParams(properties)) {
            var options = properties;
            property = options.property;
            time = options.time;
            onComplete = options.onComplete;
        }

        if (PropertyChecker.propertyName(property) || !this.config.strict) {
            time = _.isDate(time) ? time : new Date();
            if (this._isReady()) {
                var properties = {};
                properties[property] = 0;
                this._sendRequest({
                    type: 'user_unset',
                    properties,
                    onComplete,
                }, time);

            } else {
                this._queue.push(['userUnset', [property, onComplete, time]]);
            }
        } else {
            logger.warn('calling userUnset failed due to invalid arguments');
            if (_.isFunction(onComplete)) {
                onComplete({
                    code: -1,
                    msg: 'invalid parameters',
                });
            }
        }
    }

    userDel(time, onComplete) {
        if (this._hasDisabled()) {
            return;
        }
        if (this._isObjectParams(time)) {
            var options = time;
            time = options.time;
            onComplete = options.onComplete;
        }

        time = _.isDate(time) ? time : new Date();
        if (this._isReady()) {
            this._sendRequest({
                type: 'user_del',
                onComplete,
            }, time);
        } else {
            this._queue.push(['userDel', [time, onComplete]]);
        }
    }

    userAdd(properties, time, onComplete) {
        if (this._hasDisabled()) {
            return;
        }
        if (this._isObjectParams(properties)) {
            var options = properties;
            properties = options.properties;
            time = options.time;
            onComplete = options.onComplete;
        }

        if (PropertyChecker.userAddProperties(properties) || !this.config.strict) {
            time = _.isDate(time) ? time : new Date();
            if (this._isReady()) {
                this._sendRequest({
                    type: 'user_add',
                    properties,
                    onComplete,
                }, time);
            } else {
                this._queue.push(['userAdd', [properties, time, onComplete]]);
            }
        } else {
            logger.warn('calling userAdd failed due to invalid arguments');
            if (_.isFunction(onComplete)) {
                onComplete({
                    code: -1,
                    msg: 'invalid parameters',
                });
            }
        }
    }

    userAppend(properties, time, onComplete) {
        if (this._hasDisabled()) {
            return;
        }
        if (this._isObjectParams(properties)) {
            var options = properties;
            properties = options.properties;
            time = options.time;
            onComplete = options.onComplete;
        }

        if (PropertyChecker.userAppendProperties(properties) || !this.config.strict) {
            time = _.isDate(time) ? time : new Date();
            if (this._isReady()) {
                this._sendRequest({
                    type: 'user_append',
                    properties,
                    onComplete,
                }, time);
            } else {
                this._queue.push(['userAppend', [properties, time, onComplete]]);
            }
        } else {
            logger.warn('calling userAppend failed due to invalid arguments');
            if (_.isFunction(onComplete)) {
                onComplete({
                    code: -1,
                    msg: 'invalid parameters',
                });
            }
        }
    }

    authorizeOpenID(id) {
        this.identify(id);
    }

    identify(id) {
        if (this._hasDisabled()) {
            return;
        }
        if (typeof id === 'number') {
            id = String(id);
        } else if (typeof id !== 'string') {
            return false;
        }
        this.store.setDistinctId(id);
    }

    getDistinctId() {
        return this.store.getDistinctId();
    }

    login(accoundId) {
        if (this._hasDisabled()) {
            return;
        }
        if (typeof accoundId === 'number') {
            accoundId = String(accoundId);
        } else if (typeof accoundId !== 'string') {
            return false;
        }
        this.store.setAccountId(accoundId);
    }

    getAccountId() {
        return this.store.getAccountId();
    }

    logout() {
        if (this._hasDisabled()) {
            return;
        }           
        this.store.setAccountId(null);
    }

    setSuperProperties(obj) {
        if (this._hasDisabled()) {
            return;
        }
        if (PropertyChecker.propertiesMust(obj) || !this.config.strict) {
            this.store.setSuperProperties(obj);
        } else {
            logger.warn('setSuperProperties 的参数必须是合法的属性值');
        }
    }

    clearSuperProperties() {
        if (this._hasDisabled()) {
            return;
        }
        this.store.setSuperProperties({}, true);
    }

    unsetSuperProperty(propertyName) {
        if (this._hasDisabled()) {
            return;
        }
        if (_.isString(propertyName)) {
            var superProperties = this.getSuperProperties();
            delete superProperties[propertyName];
            this.store.setSuperProperties(superProperties, true);
        }
    }

    getSuperProperties() {
        return this.store.getSuperProperties();
    }
    getPresetProperties() {
        var properties = systemInformation.properties;
        var presetProperties = {};
        var os = properties['#os'];
        presetProperties.os = _.isUndefined(os) ? '' : os;
        var screenWidth = properties['#screen_width'];
        presetProperties.screenWidth = _.isUndefined(screenWidth) ? 0 : screenWidth;
        var screenHeight = properties['#screen_height'];
        presetProperties.screenHeight = _.isUndefined(screenHeight) ? 0 : screenHeight;
        var networkType = properties['#network_type'];
        presetProperties.networkType = _.isUndefined(networkType) ? '' : networkType;
        var deviceModel = properties['#device_model'];
        presetProperties.deviceModel = _.isUndefined(deviceModel) ? '' : deviceModel;
        var osVersion   = properties['#os_version'];
        presetProperties.osVersion   = _.isUndefined(osVersion) ? '' : osVersion;
        presetProperties.deviceId = this.getDeviceId();
        var zoneOffset = 0 - (new Date().getTimezoneOffset() / 60.0);
        presetProperties.zoneOffset = zoneOffset;
        var manufacturer = properties['#manufacturer'];
        presetProperties.manufacturer   = _.isUndefined(manufacturer) ? '' : manufacturer;
        presetProperties.toEventPresetProperties = function() {
            return {
                '#device_model':presetProperties.deviceModel,
                '#device_id':presetProperties.deviceId,
                '#screen_width':presetProperties.screenWidth,
                '#screen_height':presetProperties.screenHeight,
                '#os':presetProperties.os,
                '#os_version':presetProperties.osVersion,
                '#network_type':presetProperties.networkType,
                '#zone_offset':zoneOffset,
                '#manufacturer':presetProperties.manufacturer
            };
        };
        return presetProperties;
    }

    setDynamicSuperProperties(dynamicProperties) {
        if (this._hasDisabled()) {
            return;
        }
        if (typeof dynamicProperties === 'function') {
            if (PropertyChecker.properties(dynamicProperties()) || !this.config.strict) {
                this.dynamicProperties = dynamicProperties;
            } else {
                logger.warn('动态公共属性必须返回合法的属性值');
            }
        } else {
            logger.warn('setDynamicSuperProperties 的参数必须是 function 类型');
        }
    }

    timeEvent(eventName, time) {
        if (this._hasDisabled()) {
            return;
        }
        time = _.isDate(time) ? time : new Date();
        if (this._isReady()) {
            if (PropertyChecker.event(eventName) || !this.config.strict) {
                this.store.setEventTimer(eventName, time.getTime());
            } else {
                logger.warn('calling timeEvent failed due to invalid eventName: ' + eventName);
            }
        } else {
            this._queue.push(['timeEvent', [eventName, time]]);
        }
    }

    getDeviceId() {
        return systemInformation.properties['#device_id'];
    }

    /**
     * 暂停/开启上报
     * @param {bool} enabled YES：开启上报 NO：暂停上报
     */
    enableTracking(enabled) {
        this.enabled = enabled;
        this.store._set("ta_enabled", enabled);
    }

    /**
     * 停止上报，后续的上报和设置都无效，数据将清空
     */
    optOutTracking() {
        this.isOptOut = true;
        this.store._set("ta_isOptOut", true);
        this.clearSuperProperties();
        this.store.setDistinctId(_.UUID());
        this.store.setAccountId(null);
        this._queue.splice(0, this._queue.length);
    }

    /**
     * 停止上报，后续的上报和设置都无效，数据将清空，并且发送 user_del
     */
    optOutTrackingAndDeleteUser() {
        var time = new Date();
        this._sendRequest({ type: 'user_del'}, time);
        this.optOutTracking();
    }

    /**
     * 允许上报
     */
    optInTracking() {
        this.isOptOut = false;
        this.store._set("ta_isOptOut", false);
    }
}
