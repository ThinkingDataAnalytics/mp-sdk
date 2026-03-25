import {
    _,
    logger,
} from './utils';

/** @const */
var KEY_NAME_MATCH_REGEX = /^[a-zA-Z][a-zA-Z0-9_]{0,49}$/;

export class PropertyChecker {
    static stripProperties(prop) {
        if (!_.isObject(prop)) {
            return prop;
        }
        _.each(prop, function (v, k) {
            if (!(_.isString(v) || _.isNumber(v) || _.isDate(v) || _.isBoolean(v) || _.isArray(v) || _.isObject(v))) {
                logger.warn('Your data -', k, v, '- format does not meet requirements and may not be stored correctly. Attribute values only support String, Number, Date, Boolean, Array, Object');
            }
        });
        return prop;
    }

    static _checkPropertiesKey(obj) {
        var flag = true;
        _.each(obj, (content, key) => {
            if (!KEY_NAME_MATCH_REGEX.test(key)) {
                logger.warn('Invalid KEY: ' + key);
                flag = false;
            }
        });
        return flag;
    }
    static event(s) {
        if (!_.isString(s) || !KEY_NAME_MATCH_REGEX.test(s)) {
            logger.warn('Check the parameter format. The eventName must start with an English letter and contain no more than 50 characters including letters, digits, and underscores: ' + s);
            return false;
        } else {
            return true;
        }
    }

    static propertyName(s) {
        if (!_.isString(s) || !KEY_NAME_MATCH_REGEX.test(s)) {
            logger.warn('Check the parameter format. PropertyName must start with a letter and contain letters, digits, and underscores (_). The value is a string of no more than 50 characters: ' + s);
            return false;
        } else {
            return true;
        }
    }
    static properties(p) {
        this.stripProperties(p);
        if (p) {
            if (_.isObject(p)) {
                if (this._checkPropertiesKey(p)) {
                    return true;
                } else {
                    logger.warn('Check the parameter format. The properties key must start with a letter, contain digits, letters, and underscores (_), and contain a maximum of 50 characters');
                    return false;
                }
            } else {
                logger.warn('properties can be none, but it must be an object');
                return false;
            }
        } else {
            return true;
        }
    }
    static propertiesMust(p) {
        this.stripProperties(p);
        if (p === undefined || !_.isObject(p) || _.isEmptyObject(p)) {
            logger.warn('properties must be an object with a value');
            return false;
        } else {
            if (this._checkPropertiesKey(p)) {
                return true;
            } else {
                logger.warn('Check the parameter format. The properties key must start with a letter, contain digits, letters, and underscores (_), and contain a maximum of 50 characters');
                return false;
            }
        }
    }
    static userId(id) {
        if (_.isString(id) && /^.{1,64}$/.test(id)) {
            return true;
        } else {
            logger.warn('The user ID must be a string of less than 64 characters and cannot be null');
            return false;
        }
    }

    static userAddProperties(p) {
        if (!this.propertiesMust(p)) return false;
        for (var i in p) {
            if (!_.isNumber(p[i])) {
                logger.warn('The attributes of userAdd need to be Number');
                return false;
            }
        }
        return true;
    }

    static userAppendProperties(p) {
        if (!this.propertiesMust(p)) return false;
        for (var i in p) {
            if (!_.isArray(p[i])) {
                logger.warn('The attribute of userAppend must be Array');
                return false;
            }
        }
        return true;
    }
}
