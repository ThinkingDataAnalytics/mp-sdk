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
    name: 'thinkingdata', // global name
    // eslint-disable-next-line camelcase
    is_plugin: false, // if is it plugin. Basic library < 2.6.4 does not allow modification of App and Page
    maxRetries: 3, // number of retries for data reporting requests. v1.3.0+
    sendTimeout: 3000, // request timeout, Ms
    enablePersistence: true, // enable local storage
    asyncPersistence: false, // enable asynchronous storage
    enableLog: true, // enable printing logs
    strict: false, // disable strict data format checking, allow possible problem data to be reported
    debugMode: 'none', // Debug mode (none/debug/debugOnly)
    enableCalibrationTime: false
};

/**
 * Get system information asynchronously and initialize preset properties
 *
 * #lib: SDK type,
 * #lib_version: SDK version
 * #network_type: current network type
 * #manufacture: device manufactory
 * #device_model: device mode, e.g iPhone 8
 * #screen_width: device screen width
 * #screen_height: device screen height
 * #os: device os name
 * #os_version: device os version
 * #mp_platform: current platform name
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
                            '#system_language': res['systemLanguage'],
                            //'#utm': _.getUtm()
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
 * Data cache management class
 *
 * Keys :
 * 1. device_id: #device_id
 * 2. distinct_id: #distinct_id
 * 3. account_id: #account_id
 * 4. props: super properties
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
                if (_.isEmptyObject(this._state)) {
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

        // Mark sdk initialization is complete, you can write to the local cache
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

var dataStoragePrefix = 'tampsdk_';
var tabStoragePrefix = 'tab_tampsdk_';

class BatchConsumer {
    constructor(config, ta) {
        this.config = config;
        this.ta = ta;
        this.timer = null;
        this.batchConfig = _.extend({
            'size': 5, //event batch size
            'interval': 5000, //interval to send data in milliseconds
            'storageLimit': 200 // event cache maximum limit
        }, this.config.batchConfig);
        if (this.batchConfig.size < 1) {
            this.batchConfig.size = 1;
        }
        if (this.batchConfig.size > 30) {
            this.batchConfig.size = 30;
        }
        this.tabKey = tabStoragePrefix + this.config.appId;
        this.storageLimit = this.batchConfig['storageLimit'];
    }

    batchInterval() {
        var self = this;
        self.timer = setTimeout(function () {
            self.recycle();
            self.send();
            clearTimeout(self.timer);
            self.batchInterval();
        }, this.batchConfig.interval);
    }

    add(data) {
        var d = data;
        //if enable batch send, modify time_calibration to 5
        // if (d['properties']['#time_calibration'] === 3) {
        //     d['properties']['#time_calibration'] = 5;
        // }
        var dataKey = dataStoragePrefix + this.config.appId + '_' + String(_.UUID());
        var tabStorage = PlatformAPI.getStorage(this.tabKey);
        if (!_.isArray(tabStorage)) {
            tabStorage = [];
        }
        // if (tabStorage === null) {
        //     tabStorage = [];
        // }
        if (tabStorage.length <= this.storageLimit) {
            //If the data in the cache does not reach the maximum number, save
            tabStorage.push(dataKey);
            PlatformAPI.setStorage(this.tabKey, JSON.stringify(tabStorage));
            PlatformAPI.setStorage(dataKey, JSON.stringify(d));
        } else {
            //Delete 20 items first, then save
            var deleteDatas = tabStorage.splice(0, 20);
            console.log('deleted events data:' + deleteDatas);
            tabStorage.push(dataKey);
            PlatformAPI.setStorage(this.tabKey, JSON.stringify(tabStorage));
            PlatformAPI.setStorage(dataKey, JSON.stringify(d));
            var postData = {};
            var dList = [];
            for (var i = 0; i < deleteDatas.length; i++) {
                var item = PlatformAPI.getStorage(deleteDatas[i]);
                dList.push(item);
            }
            postData['data'] = dList;
            postData['#app_id'] = this.config['appId'];
            this.request(postData, deleteDatas);
        }
    }

    flush() {
        clearTimeout(this.timer);
        this.send();
        this.batchInterval();
    }

    send() {
        var tabStorage = PlatformAPI.getStorage(this.tabKey);
        if (tabStorage) {
            if (tabStorage.length) {
                var postData = {};
                var data = [];
                var tabList = [];
                var len = tabStorage.length < this.batchConfig.size ? tabStorage.length : this.batchConfig.size;
                for (var i = 0; i < len; i++) {
                    var d = PlatformAPI.getStorage(tabStorage[i]);
                    data.push(d);
                    tabList.push(tabStorage[i]);
                }
                postData['data'] = data;
                postData['#app_id'] = this.config['appId'];
                this.request(postData, tabList);
            }
        }
    }

    request(data, dataKeys) {
        var self = this;
        logger.info('flush data: ' + JSON.stringify(data));
        senderQueue.enqueue(data, this.ta.serverUrl, {
            maxRetries: this.config.maxRetries,
            sendTimeout: this.config.sendTimeout,
            callback: function (res) {
                self.remove(dataKeys);
            },
            debugMode: this.config.debugMode,
            deviceId: this.ta.getDeviceId()
        });
    }

    remove(dataKeys) {
        var tabStorage = PlatformAPI.getStorage(this.tabKey);
        if (tabStorage) {
            for (var i = 0; i < dataKeys.length; i++) {
                var idx = _.indexOf(tabStorage, dataKeys[i]);
                if (idx > -1) {
                    tabStorage.splice(idx, 1);
                }
                PlatformAPI.removeStorage(dataKeys[i]);
            }
            PlatformAPI.setStorage(this.tabKey, JSON.stringify(tabStorage));
        }
    }

    recycle() {
        //localStorage is for web
        // var tabStorage = PlatformAPI.getStorage(this.tabKey);
        // if (tabStorage) {
        //     if (tabStorage.length === 0) {
        //         for (var i = 0; i < localStorage.length; i++) {
        //             var key = localStorage.key(i);
        //             if (key.indexOf(dataStoragePrefix + this.config['appId']) === 0) {
        //                 tabStorage.push(key);
        //             }
        //         }
        //         if (tabStorage.length > 0) {
        //             PlatformAPI.setStorage(this.tabKey, JSON.stringify(tabStorage));
        //         }
        //     }
        // }
    }
}

export default class ThinkingDataAPI {
    constructor(config) {
        config.appId = config.appId ? _.checkAppId(config.appId) : _.checkAppId(config.appid);
        config.serverUrl = config.serverUrl ? _.checkUrl(config.serverUrl) : _.checkUrl(config.server_url);
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
            this.instances = [];
            this._state = {
                getSystemInfo: false,
                initComplete: false,
            };
            // systemInformation.getSystemInfo(() => {
            //     this._updateState({
            //         getSystemInfo: true,
            //     });
            // });

            PlatformAPI.setGlobal(this, this.name);
        }

        this.store = new ThinkingDataPersistence(config, () => {
            if (this.config.asyncPersistence && _.isFunction(this.config.persistenceComplete)) {
                this.config.persistenceComplete(this);
            }
            this._updateState();
        });
        this.enabled = _.isBoolean(this.store._get('ta_enabled')) ? this.store._get('ta_enabled') : true;
        this.isOptOut = _.isBoolean(this.store._get('ta_isOptOut')) ? this.store._get('ta_isOptOut') : false;

        if (!config.isChildInstance && config.autoTrack) {
            this.autoTrack = PlatformAPI.initAutoTrackInstance(this, config);
        }

        //Enable batch reporting of data
        if (this.config.enableBatch !== undefined && this.config.enableBatch !== false) {
            this.batchConsumer = new BatchConsumer(this.config, this);
            this.batchConsumer.batchInterval();
        }
    }

    initSystemInfo() {
        if (!this.config.isChildInstance) {
            systemInformation.getSystemInfo(() => {
                this._updateState({
                    getSystemInfo: true,
                });
            });
        }
    }

    updateConfig(configUrl, appId) {
        var headers = _.createExtraHeaders();
        headers['content-type'] = 'application/json';
        var request = PlatformAPI.request({
            url: configUrl + '?appid=' + appId,
            method: 'GET',
            header: headers,
            success: (res) => {
                if (!_.isUndefined(res) && !_.isUndefined(res.data)) {
                    logger.info('config update success' + '(' + appId + ') :' + JSON.stringify(res.data));
                    if (!_.isUndefined(res.data['data'])) {
                        this.config.syncBatchSize = res.data['data']['sync_batch_size'];
                        this.config.syncInterval = res.data['data']['sync_interval'];
                        this.config.disableEventList = res.data['data']['disable_event_list'];
                        if (!_.isUndefined(res.data['data']['secret_key'])) {
                            var secretKey = res.data['data']['secret_key'];
                            this.config.secretKey = {
                                publicKey: secretKey['key'],
                                version: secretKey['version'],
                            };
                        }
                    }
                }
            },
            fail: (res) => {
                logger.info('config update fail' + '(' + appId + ') :' + res.errMsg);
            }
        });
        setTimeout(function () {
            if ((_.isObject(request) || _.isPromise(request)) && _.isFunction(request.abort)) {
                request.abort();
            }
        }, 3000);
    }

    /**
     * Create a new instance (sub-instance).
     * All properties that can be set are independent of the main instance.
     *
     * @param {string} name: sub-instance name
     * @param {object} config: optional, config of sub-instance
     */
    initInstance(name, config) {
        if (this.config.isChildInstance) {
            logger.warn('initInstance() cannot be called on child instance');
            return undefined;
        }

        if (_.isString(name) && name !== this.name && _.isUndefined(this[name])) {
            var instance = new ThinkingDataAPI(_.extend({},
                this.config, {enablePersistence: false,isChildInstance: true,name,},
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
     * Get sub-instance with name
     *
     * @param {string} name: sub-instance name
     */
    lightInstance(name) {
        return this[name];
    }

    /**
     * Internal function, used to set some preset properties related to the life cycle
     *
     * Common attributes are:
     * - #scene Scene value, available in onLaunch callback. It can also be actively obtained according to the platform interface
     * - #url_path page path
     *
     * When sending event data, the priority is:
     * Event Properties > Dynamic Public Properties > Common Event Properties > Automatic Collection Properties > Other Preset Properties
     *
     * @param {object} props, event properties
     */
    _setAutoTrackProperties(props) {
        _.extend(this.autoTrackProperties, props);
    }

    /**
     * After calling init(), the data starts to be reported
     *
     * Before calling this function, all reporting requests will be cached. When the user completes the necessary settings, call this function to trigger reporting.
     */
    init() {
        this.initSystemInfo();
        if (this._state.initComplete) return false;
        this._updateState({
            initComplete: true,
        });
        logger.info('Thinking Analytics SDK initialized successfully with mode: '+this.config.debugMode+', APP ID : '+this.config.appId+', server url: '+this.config.serverUrl+', libversion: '+Config.LIB_VERSION);
    }

    /**
     * Internal function, to judge whether the initialization is completed, and the data can be actually sent
     *
     * Each instance has three asynchronous states
     * - getSystemInfo Whether has obtained system information, the sub-instance defaults to true.
     * - initComplete Whether the init() function is called, true means that the user has completed the necessary initialization settings. Child instances this state defaults to true.
     * - store.initComplete Whether the cache information has been read
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

    // Only after the system information initialization is completed and the user actively calls init(), will the data be actually sent.
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
            logger.info('ThinkingData is Pause or Stop!');
        }
        return hasDisabled;
    }

    // send request. Due to the limitations of some platforms on the number of network connections, we use senderQueue to send data.
    _sendRequest(eventData, time, tryBeacon) {
        if (this._hasDisabled()) {
            return;
        }
        if (!_.isUndefined(this.config.disableEventList)) {
            if (this.config.disableEventList.includes(eventData.eventName)) {
                logger.info('disabled Event : ' + eventData.eventName);
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
                var duration = parseFloat((durationMillisecond / 1000)
                    .toFixed(3));
                if (duration > 86400) {
                    duration = 86400;
                } else if (duration < 0) {
                    duration = 0;
                }
                data.data[0]['properties']['#duration'] = duration;
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

        if (_.isBoolean(this.config.enableEncrypt) && this.config.enableEncrypt === true) {
            data.data[0] = _.generateEncryptyData(data.data[0], this.config.secretKey);
        }

        if (this.batchConsumer && this.config.debugMode === 'none' && !tryBeacon) {
            this.batchConsumer.add(data.data[0]);
            if (_.isFunction(eventData.onComplete)) {
                eventData.onComplete({
                    code: 0,
                    msg: 'success'
                });
            }
            return;
        }

        if (tryBeacon) {
            var formData = new FormData();
            if (this.config.debugMode === 'debug' || this.config.debugMode === 'debugOnly') {
                formData.append('source', 'client');
                formData.append('appid', this.appId);
                formData.append('dryRun', this.config.debugMode === 'debugOnly' ? 1 : 0);
                formData.append('deviceId', this.getDeviceId());
                formData.append('data', JSON.stringify(data.data[0]));
            } else {
                var base64Data = _.base64Encode(JSON.stringify(data));
                formData.append('data', base64Data);
            }
            navigator.sendBeacon(serverUrl, formData);
            if (_.isFunction(eventData.onComplete)) {
                eventData.onComplete({ 'statusCode': 200 });
            }
        } else {
            senderQueue.enqueue(data, serverUrl, {
                maxRetries: this.config.maxRetries,
                sendTimeout: this.config.sendTimeout,
                callback: eventData.onComplete,
                debugMode: this.config.debugMode,
                deviceId: this.getDeviceId()
            });
        }
    }

    // Is it a parameter object
    _isObjectParams(obj) {
        return _.isObject(obj) && _.isFunction(obj.onComplete);
    }

    /**
     * Track a narmal Event.
     * @param {string} eventName: event name, required
     * @param {object} properties: event properties, optional
     * @param {date} time: event time, optional
     * @param {function} onComplete: callback, optional
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
     * Track a updatable Event
     * @param {object} options: event infomations
     *
     * options.eventName: event name, required
     * options.eventId: event ID, to mark the event, required
     * options.time: event time, optional
     * options.properties: event properties, optional
     * options.onComplete: callback, optional
     */
    trackUpdate(options) {
        if (this._hasDisabled()) {
            return;
        }
        if (options && options.eventId &&
            ((PropertyChecker.event(options.eventName) && PropertyChecker.properties(options.properties)) || !this.config.strict)) {
            if (this._isReady()) {
                var property = _.checkCalibration(options.properties, options.time, this.config.enableCalibrationTime);
                var time = _.isDate(options.time) ? options.time : new Date();
                this._sendRequest({
                    type: 'track_update',
                    eventName: options.eventName,
                    properties: property,
                    onComplete: options.onComplete,
                    extraId: options.eventId
                }, time);
            } else {
                //options.time = time;
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
     * Track a overwritable Event
     * @param {object} options event infomations
     *
     * options.eventName: event name, required
     * options.eventId: event ID, to mark the event, required
     * options.time: event time, optional
     * options.properties: event properties, optional
     * options.onComplete: callback, optional
     */
    trackOverwrite(options) {
        if (this._hasDisabled()) {
            return;
        }
        if (options && options.eventId &&
            ((PropertyChecker.event(options.eventName) && PropertyChecker.properties(options.properties)) || !this.config.strict)) {
            if (this._isReady()) {
                var property = _.checkCalibration(options.properties, options.time, this.config.enableCalibrationTime);
                var time = _.isDate(options.time) ? options.time : new Date();
                this._sendRequest({
                    type: 'track_overwrite',
                    eventName: options.eventName,
                    properties: property,
                    onComplete: options.onComplete,
                    extraId: options.eventId
                }, time);
            } else {
                //options.time = time;
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
     * Track a first Event
     * @param {object} options event infomations
     *
     * options.eventName: event name, required
     * options.firstCheckId: event ID, to mark the event, default is #device_id, required
     * options.time: event time, optional
     * options.properties: event properties, optional
     * options.onComplete: callback, optional
     */
    trackFirstEvent(options) {
        if (this._hasDisabled()) {
            return;
        }
        if (options && options.eventName &&
            ((PropertyChecker.event(options.eventName) && PropertyChecker.properties(options.properties)) || !this.config.strict)) {
            if (this._isReady()) {
                var property = _.checkCalibration(options.properties, options.time, this.config.enableCalibrationTime);
                var time = _.isDate(options.time) ? options.time : new Date();
                this._sendRequest({
                    type: 'track',
                    eventName: options.eventName,
                    properties: property,
                    onComplete: options.onComplete,
                    firstCheckId: options.firstCheckId ? options.firstCheckId : this.getDeviceId()
                }, time);
            } else {
                //options.time = time;
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
    _internalTrack(eventName, properties, time, onComplete, tryBeacon) {
        if (this._hasDisabled()) {
            return;
        }
        var property = _.checkCalibration(properties, time, this.config.enableCalibrationTime);
        time = _.isDate(time) ? time : new Date();
        if (this._isReady()) {
            this._sendRequest({
                type: 'track',
                eventName,
                properties : property,
                onComplete,
            }, time, tryBeacon);
        } else {
            this._queue.push(['_internalTrack', [eventName, properties, time, onComplete]]);
        }
    }

    /**
     * Sets the user property, replacing the original value with the new value if the property already exists.
     * @param {*} properties event properties, optional
     * @param {*} time event time, optional
     * @param {*} onComplete callback, optional
     * @returns
     */
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
    /**
     * Sets a single user attribute, ignoring the new attribute value if the attribute already exists.
     * @param {*} properties event properties, optional
     * @param {*} time event time, optional
     * @param {*} onComplete callback, optional
     * @returns
     */
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

    /**
     * Reset user properties.
     * @param {*} property event property, optional
     * @param {*} time  event time, optional
     * @param {*} onComplete callback, optional
     * @returns
     */
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

    /**
     * Delete the user attributes,This operation is not reversible and should be performed with caution.
     * @param {*} time event time, optional
     * @param {*} onComplete callback, optional
     * @returns
     */
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

    /**
     * Adds the numeric type user attributes.
     * @param {*} properties event properties, optional
     * @param {*} time event time, optional
     * @param {*} onComplete callback, optional
     * @returns
     */
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

    /**
     * Append a user attribute of the List type.
     * @param {*} properties event properties, optional
     * @param {*} time event time, optional
     * @param {*} onComplete callback, optional
     * @returns
     */
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

    /**
     * The element appended to the library needs to be done to remove the processing,and then import.
     * @param {*} properties event properties, optional
     * @param {*} time event time, optional
     * @param {*} onComplete callback, optional
     * @returns
     */
    userUniqAppend(properties, time, onComplete) {
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
                    type: 'user_uniq_append',
                    properties,
                    onComplete,
                }, time);
            } else {
                this._queue.push(['userUniqAppend', [properties, time, onComplete]]);
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

    /**
     * Empty the cache queue. When this api is called, the data in the current cache queue will attempt to be reported.
     * If the report succeeds, local cache data will be deleted.
     */
    flush() {
        if (this.batchConsumer && this.config.debugMode === 'none') {
            this.batchConsumer.flush();
        }
    }

    authorizeOpenID(id) {
        this.identify(id);
    }

    /**
     * Set the distinct ID to replace the default UUID distinct ID.
     * @param {*} id distinct ID
     * @returns
     */
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

    /**
     * Get a visitor ID: The #distinct_id value in the reported data.
     * @returns distinct ID
     */
    getDistinctId() {
        return this.store.getDistinctId();
    }

    /**
     * Set the account ID. Each setting overrides the previous value. Login events will not be uploaded.
     * @param {*} accoundId
     * @returns
     */
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

    /**
     * Clearing the account ID will not upload user logout events.
     * @returns
     */
    logout() {
        if (this._hasDisabled()) {
            return;
        }
        this.store.setAccountId(null);
    }

    /**
     * Set the public event attribute, which will be included in every event uploaded after that. The public event properties are saved without setting them each time.
     * @param {*} obj public event attribute
     * @returns
     */
    setSuperProperties(obj) {
        if (this._hasDisabled()) {
            return;
        }
        if (PropertyChecker.propertiesMust(obj) || !this.config.strict) {
            this.store.setSuperProperties(obj);
        } else {
            logger.warn('setSuperProperties parameter must be a valid property value');
        }
    }

    /**
     * Clear all public event attributes.
     * @returns
     */
    clearSuperProperties() {
        if (this._hasDisabled()) {
            return;
        }
        this.store.setSuperProperties({}, true);
    }

    /**
     * Clears a public event attribute.
     * @param {*} propertyName Public event attribute key to clear
     * @returns
     */
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

    /**
     * Gets the public event properties that have been set.
     * @returns Public event properties that have been set
     */
    getSuperProperties() {
        return this.store.getSuperProperties();
    }
    /**
     * Gets prefabricated properties for all events.
     * @returns
     */
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
        var osVersion = properties['#os_version'];
        presetProperties.osVersion = _.isUndefined(osVersion) ? '' : osVersion;
        presetProperties.deviceId = this.getDeviceId();
        var zoneOffset = 0 - (new Date().getTimezoneOffset() / 60.0);
        presetProperties.zoneOffset = zoneOffset;
        var manufacturer = properties['#manufacturer'];
        presetProperties.manufacturer = _.isUndefined(manufacturer) ? '' : manufacturer;
        presetProperties.toEventPresetProperties = function () {
            return {
                '#device_model': presetProperties.deviceModel,
                '#device_id': presetProperties.deviceId,
                '#screen_width': presetProperties.screenWidth,
                '#screen_height': presetProperties.screenHeight,
                '#os': presetProperties.os,
                '#os_version': presetProperties.osVersion,
                '#network_type': presetProperties.networkType,
                '#zone_offset': zoneOffset,
                '#manufacturer': presetProperties.manufacturer
            };
        };
        return presetProperties;
    }

    /**
     * Set dynamic public properties. Each event uploaded after that will contain a public event attribute.
     * @param {*} dynamicProperties Dynamic public attribute interface
     * @returns
     */
    setDynamicSuperProperties(dynamicProperties) {
        if (this._hasDisabled()) {
            return;
        }
        if (typeof dynamicProperties === 'function') {
            if (PropertyChecker.properties(dynamicProperties()) || !this.config.strict) {
                this.dynamicProperties = dynamicProperties;
            } else {
                logger.warn('A dynamic public property must return a valid property value');
            }
        } else {
            logger.warn('setDynamicSuperProperties parameter must be a function type');
        }
    }

    /**
     * Record the event duration, call this method to start the timing, stop the timing when the target event is uploaded, and add the attribute #duration to the event properties, in seconds.
     * @param {*} eventName target event name
     * @param {*} time
     * @returns
     */
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
     * Pause/Resume reporting event data
     * @param {bool} enabled:true is Resume, false is Pause
     * @deprecated This method is deprecated, use setTrackStatus() instand.
     */
    enableTracking(enabled) {
        this.enabled = enabled;
        this.store._set('ta_enabled', enabled);
    }

    /**
     * Stop reporting event data, and cache data will be cleared
     * @deprecated This method is deprecated, use setTrackStatus() instand.
     */
    optOutTracking() {
        this.store.setSuperProperties({}, true);
        this.store.setDistinctId(_.UUID());
        this.store.setAccountId(null);
        this._queue.splice(0, this._queue.length);
        this.isOptOut = true;
        this.store._set('ta_isOptOut', true);
    }

    /**
     * Stop reporting event data, and cache data will be cleared, and flush a user_del
     * @deprecated This method is deprecated, use setTrackStatus() instand.
     */
    optOutTrackingAndDeleteUser() {
        var time = new Date();
        this._sendRequest({ type: 'user_del' }, time);
        this.optOutTracking();
    }

    /**
     * Allow reporting event data
     * @deprecated This method is deprecated, use setTrackStatus() instand.
     */
    optInTracking() {
        this.isOptOut = false;
        this.store._set('ta_isOptOut', false);
    }

    /**
    * Set status for events reporting
    * PAUSE, pause events reporting
    * STOP, stop events reporting, and cache data will be cleared
    * SAVE_ONLY, event data stores in the cache, but not be reported (native support, js equal to NORMAL)
    * NORMAL, resume event reporting
    * @param {string} status, events reporting status
    */
    setTrackStatus(status) {
        switch (status) {
            case 'PAUSE':
                this.eventSaveOnly = false;
                this.optInTracking();
                this.enableTracking(false);
                break;
            case 'STOP':
                this.eventSaveOnly = false;
                // this.enableTracking(false);
                this.optOutTracking(true);
                break;
            case 'SAVE_ONLY':
            // this.eventSaveOnly = true;
            // this.enableTracking(false);
            // this.optInTracking();
                break;
            case 'NORMAL':
            default:
                this.eventSaveOnly = false;
                this.optInTracking();
                this.enableTracking(true);
                break;
        }
        logger.info('switch track status:'+status);
    }
}
