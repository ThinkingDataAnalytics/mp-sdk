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
            if (_.isArray(v)) {
                var temp = [];
                _.each(v, function (arrv) {
                    if (_.isString(arrv)) {
                        temp.push(arrv);
                    } else {
                        logger.warn('您的数据-', k, v, '的数组里的值必须是字符串,已经将其删除');
                    }
                });
                if (temp.length !== 0) {
                    prop[k] = temp;
                } else {
                    delete prop[k];
                    logger.info('已经删除空的数组');
                }
            }
            if (!(_.isString(v) || _.isNumber(v) || _.isDate(v) || _.isBoolean(v))) {
                logger.warn('您的数据-', k, v, '-格式不满足要求，我们已经将其删除');
                delete prop[k];
            }
        });
        return prop;
    }

    static _checkPropertiesKey(obj) {
        var flag = true;
        _.each(obj, (content, key) => {
            if (!KEY_NAME_MATCH_REGEX.test(key)) {
                logger.info('不合法的 KEY 值: ' + key);
                flag = false;
            }
        });
        return flag;
    }
    static event(s) {
        if (!_.isString(s) || !KEY_NAME_MATCH_REGEX.test(s)) {
            logger.warn('请检查参数格式, eventName 必须是英文字母开头, 包含字母和数字和下划线的不超过50个字符的字符串: ' + s);
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
                    logger.warn('请检查参数格式, properties 的 key 只能以字母开头，包含数字、字母和下划线 _，长度最大为50个字符');
                    return false;
                }
            } else {
                logger.info('properties 可以没有，但有的话必须是对象');
                return false;
            }
        } else {
            return true;
        }
    }
    static propertiesMust(p) {
        this.stripProperties(p);
        if (p === undefined || !_.isObject(p) || _.isEmptyObject(p)) {
            logger.warn('properties必须是对象且有值');
            return false;
        } else {
            if (this._checkPropertiesKey(p)) {
                return true;
            } else {
                logger.warn('请检查参数格式, properties 的 key 只能以字母开头，包含数字、字母和下划线 _，长度最大为50个字符');
                return false;
            }
        }
    }
    static userId(id) {
        if (_.isString(id) && /^.{1,255}$/.test(id)) {
            return true;
        } else {
            logger.info('用户 id 必须是不能为空，且小于 255 位的字符串');
            return false;
        }
    }

    static userAddProperties(p) {
        if (!this.propertiesMust(p)) return false;
        for (var i in p) {
            if (!_.isNumber(p[i])) {
                return false;
            }
        }
        return true;
    }
}
