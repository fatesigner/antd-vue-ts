/**
 * utils
 */

const Hash = require('object-hash');

const NODE_ENV_ENUM = {
  DEV: 'development',
  PROD: 'production'
};

/**
 * 获取开发模式
 * @returns {string}
 * @constructor
 */
exports.GetNODE_ENV = function () {
  const env = (process.env.NODE_ENV || NODE_ENV_ENUM.DEV).trim();
  for (const v in NODE_ENV_ENUM) {
    if (Object.prototype.hasOwnProperty.call(NODE_ENV_ENUM, v) && env === NODE_ENV_ENUM[v]) {
      return env;
    }
  }
  return NODE_ENV_ENUM.DEV;
};

/**
 * 判断当前是否处于生产模式
 * @param env
 * @returns {boolean}
 * @constructor
 */
exports.IsProd = function (env = null) {
  if (!env) {
    env = exports.GetNODE_ENV();
  }
  return env === NODE_ENV_ENUM.PROD;
};

/**
 * 判断给定的值是否为 undefined
 * @return {boolean}
 */
exports.IsUndefined = function (obj) {
  return Object.prototype.toString.call(obj) === '[object Undefined]';
};

/**
 * 判断给定的值是否为 null
 * @return {boolean}
 */
exports.IsNull = function (obj) {
  return Object.prototype.toString.call(obj) === '[object Null]';
};

/**
 * 判断给定的值是否为 null or undefined
 * @return {boolean}
 */
exports.IsNullOrUndefined = function (obj) {
  return exports.IsNull(obj) || exports.IsUndefined(obj);
};

/**
 * 获取对象指定表达式的值
 * @param obj
 * @param propertyPath {string}
 * @param defaultVal 默认值
 * @returns {boolean}
 * @constructor
 */
exports.GetOwnNestedProperty = function (obj, propertyPath, defaultVal) {
  if (!propertyPath) {
    return defaultVal;
  }

  const properties = propertyPath.split('.');

  let obj_ = obj;

  for (let i = 0; i < properties.length; i++) {
    const prop = properties[i];

    if (!exports.IsNullOrUndefined(obj) && Object.prototype.hasOwnProperty.call(obj_, prop)) {
      obj_ = obj_[prop];
    } else {
      obj_ = undefined;
      break;
    }
  }

  if (exports.IsNullOrUndefined(obj_)) {
    return defaultVal;
  }

  return obj_;
};

/**
 * @return {string}
 */
exports.HashChunk = function (str, seen) {
  let len = 7;
  let hash_ = Hash.sha1(str);
  // 选择 7 位长度，并校验碰撞
  if (seen) {
    while (seen.has(hash_.substr(0, len))) {
      len++;
    }
  }

  hash_ = hash_.substr(0, len);

  if (seen) {
    seen.add(hash_);
  }

  return hash_;
};

/**
 * 判断给定的值是否为数组
 * @return {boolean}
 */
exports.IsArray = function (obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
};
