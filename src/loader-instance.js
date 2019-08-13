/* eslint-disable no-undef */
// Try to load default config from thinkingdata_conf.js. This file is optional for v1.3.0+
var config = {};
try {
    config = require('thinkingdata_conf.js');
} catch (e) {
    console.error('thinkingdata_conf.js could not be loaded.');
}

import {ThinkingDataAPI} from './ThinkingDataAPI';

var ta = new ThinkingDataAPI(config);

module.exports = ta;
