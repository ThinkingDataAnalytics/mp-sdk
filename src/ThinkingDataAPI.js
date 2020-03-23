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
R_IMPORT_PLATFORMAPI;


const DEFAULT_CONFIG = {
    name: 'thinkingdata', // 全局变量名称
    // eslint-disable-next-line camelcase
    is_plugin: false, // 是否是插件版本。基础库 < 2.6.4 不允许修改 App 和 Page
    maxRetries: 3, // 当网络出错或者超时时，最大重试次数. v1.3.0+
    sendTimeout: 3000, // 请求超时时间, 单位毫秒
    enablePersistence: true, // 是否使用本地缓存
    asyncPersistence: Config.PERSISTENCE_ASYNC, // 是否使用异步存储
    enableLog: true, // 是否打开日志
    strict: false, // 关闭严格数据格式校验。允许可能的问题数据上报
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
                        //logger.info(JSON.stringify(res, null, 4));
                        var data = {
                            '#manufacturer': res['brand'],
                            '#device_model': res['model'],
                            '#screen_width': Number(res['screenWidth']),
                            '#screen_height': Number(res['screenHeight']),
                            '#os': res['system'].split(' ')[0],
                            '#os_version': res['system'].split(' ')[1],
                            '#mp_platform': res['mp_platform'],
                        };
                        _.extend(that.properties, data);
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
            } else {
                this.name = config.persistenceName;
            }
            if (config.asyncPersistence) {
                this._state = {};
                PlatformAPI.getStorage(this.name, true, (data) => {
                    this._state = _.extend2Layers({}, data, this._state);
                    this._init(config, callback);
                    this._save();
                });
            } else {
                this._state = PlatformAPI.getStorage(this.name) || {};
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

export class ThinkingDataAPI {
    constructor(config) {
        if (_.isObject(config)) {
            this.config = _.extend({}, DEFAULT_CONFIG, config);
        } else {
            this.config = DEFAULT_CONFIG;
        }
        PlatformAPI.init(this.config);
        this._init(this.config);
    }

    // internal init function. it should not be used by users.
    _init(config) {
        this.name = config.name;
        this.appId = config.appid || config.appId;
        this.serverUrl = config.server_url + '/sync_xcx';
        this.autoTrackProperties = {};
        // cache commands.
        this._queue = [];

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
            return;
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
        } else {
            logger.warn('initInstance() failed due to the name is invalid: ' + name);
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


    // 发送请求。由于一些平台对网络连接数目的限制，我们使用 senderQueue 发送数据。
    _sendRequest(eventData, time) {
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

        if (eventData.type === 'track') {
            data.data[0]['#event_name'] = eventData.eventName;
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

        senderQueue.enqueue(data, this.serverUrl, {
            maxRetries: this.config.maxRetries,
            sendTimeout: this.config.sendTimeout,
            callback: eventData.onComplete,
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

    // internal function. Do not call this function directly.
    _internalTrack(eventName, properties, time, onComplete) {
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

    userUnset(property, onComplete, time) {
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
        this.store.setAccountId(null);
    }

    setSuperProperties(obj) {
        if (PropertyChecker.propertiesMust(obj) || !this.config.strict) {
            this.store.setSuperProperties(obj);
        } else {
            logger.warn('setSuperProperties 的参数必须是合法的属性值');
        }
    }

    clearSuperProperties() {
        this.store.setSuperProperties({}, true);
    }

    unsetSuperProperty(propertyName) {
        if (_.isString(propertyName)) {
            var superProperties = this.getSuperProperties();
            delete superProperties[propertyName];
            this.store.setSuperProperties(superProperties, true);
        }
    }

    getSuperProperties() {
        return this.store.getSuperProperties();
    }

    setDynamicSuperProperties(dynamicProperties) {
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
}
