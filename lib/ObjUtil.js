'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.registerImmutable = registerImmutable;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// import Immutable from 'immutable';
var Immutable = void 0;
function registerImmutable(value) {
    Immutable = value;
}

// taken from NISV client project
// @author jovica.aleksic <jovica.aleksic@xailabs.de>

/**
* Compares two objects and returns an array containing the names of changed properties or null if all values are same.
* Works with immutable objects and plain JS objects. (If a .get() function is found, it will be used to retrieve values)
*
* Can be used for shouldComponentUpdate, e.g. `if (Obj.diff(this.props, nextProps, ['name', 'address'])) { ... }`
* if the same as `if (this.props.name !== nextProps.name || this.props.address !== nextProps.address) { ... }`
*
* @param a {Object} - The first object
* @param b {Object} - The second object
* @param names {Array<String>} - An array of property names to compare or null if nothing was changed
*/
function diff(a, b, names) {
    if (names && !Array.isArray(names)) {
        names = Object.keys(names);
    }
    var diff = [];
    if (!a && b) return true;
    if (a && !b) return true;
    if (!a && !b) return null;
    var getValue = function getValue(obj, prop) {
        if (obj === null || obj === undefined) {
            return null;
        } else {
            return typeof obj.get === 'function' ? obj.get(prop) : obj[prop];
        }
    };
    if (!names) {
        var aKeys = Object.keys(a && a.toJS ? a.toJS() : a || {});
        var bKeys = Object.keys(b && b.toJS ? b.toJS() : b || {});
        names = aKeys.concat(bKeys.filter(function (key) {
            return aKeys.indexOf(key) === -1;
        }));
    }
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = names[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var name = _step.value;

            if (getValue(a, name) !== getValue(b, name) && diff.indexOf(name) === -1) {
                diff.push(name);
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    if (diff.length === 0) {
        return null;
    }
    return diff;
}
exports.default = {

    registerImmutable: registerImmutable,

    /**
     * @see diff()
     */
    diff: diff,

    /**
     * Returns an array containing all values of an object
     * @param {Object} obj - The object to inspect
     * @return {Array<*>} - The values of all object keys. Order is not safe.
     */
    values: function values(obj) {
        return Object.keys(obj).map(function (key) {
            return obj[key];
        });
    },


    /**
     * Like `Object.keys`, but allows you to omit certain names.
     * @example Obj.keys(this.props, {not: ['onClick']})
     */
    keys: function keys(obj, options) {
        var keys = Object.keys(obj);
        if (options && options.not) {
            keys = keys.filter(function (key) {
                return options.not.indexOf(key) === -1;
            });
        }
        return keys;
    },


    /**
     * Returns an object containing all properties except the ones specified via `{not: [...]}`
     * @example
     * const clean = Obj.rest({a: 'a', b: 'b', c: 'c'}, {not: ['b', 'c']}); // {a: 'a'}
     */
    rest: function rest(obj, options) {
        var keys = this.keys(obj, options);
        return keys.reduce(function (result, key) {
            result[key] = obj[key];
            return result;
        }, {});
    },


    /**
     * Returns a new object that contains only the specified keys of an original object.
     * If the original object was immutable, the result will be immutable too,
     */
    pick: function pick(obj, keys) {
        if (!obj) {
            return null;
        }
        if (!keys || keys.length === 0) {
            // no keys specified. return new object containing everything
            return obj.toJS ? obj.merge({}) : _extends({}, obj);
        }

        if (obj && obj.toJS) {
            var keyIn = function keyIn() {
                for (var _len = arguments.length, keys = Array(_len), _key = 0; _key < _len; _key++) {
                    keys[_key] = arguments[_key];
                }

                var keySet = Immutable.Set(keys);
                return function (v, k) {
                    return keySet.has(k);
                };
            };

            // obj is immutable, keys are given
            // see https://github.com/facebook/immutable-js/wiki/Predicates#pick--omit
            if (!Immutable) {
                throw new Error('You must register Immutable.js in order to use pick() with immutable objects and specific keys. Use registerImmutable(require("immutable"))');
            }

            return obj.filter(keyIn.apply(undefined, _toConsumableArray(keys)));
        }

        // obj is plain object
        return keys.reduce(function (result, key) {
            result[key] = obj[key];
            return result;
        }, {});
    },

    /**
     * Deeply converts an immutable or mixed input value to a plain javascript object.
     * If the given object itself was a primitive, `undefined` or `null`, it is returned as-is.
     *
     * @param {any} value - A plain or immutable input value
     * @return {any} - A plain object or a primitive value.
     */
    pojo: function pojo(value) {
        var _this = this;

        if (value === undefined || value === null) {
            return value;
        }
        if (value !== Object(value)) {
            // primitive, e.g. string or number
            return value;
        }
        if (typeof value.toJS === 'function') {
            return value.toJS();
        }
        if (Array.isArray(value)) {
            return value.map(function (v) {
                return _this.pojo(v);
            });
        }
        return Object.keys(value).reduce(function (result, key) {
            result[key] = _this.pojo(value[key]);
            return result;
        }, {});
    }
};