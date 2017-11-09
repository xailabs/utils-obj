// import Immutable from 'immutable';
let Immutable;
export function registerImmutable(value) {
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
    const diff = [];
    if (!a && b) return true;
    if (a && !b) return true;
    if (!a && !b) return null;
    const getValue = (obj, prop) => {
        if (obj === null || obj === undefined) {
            return null;
        } else {
            return typeof obj.get === 'function' ? obj.get(prop) : obj[prop];
        }
    };
    if (!names) {
        const aKeys = Object.keys(a && a.toJS ? a.toJS() : a || {});
        const bKeys = Object.keys(b && b.toJS ? b.toJS() : b || {});
        names = aKeys.concat(bKeys.filter(key => aKeys.indexOf(key) === -1));
    }
    for (let name of names) {
        if (getValue(a, name) !== getValue(b, name) && diff.indexOf(name) === -1) {
            diff.push(name);
        }
    }
    if (diff.length === 0) {
        return null;
    }
    return diff;
}
export default {

    registerImmutable,

    /**
     * @see diff()
     */
    diff,

    /**
     * Returns an array containing all values of an object
     * @param {Object} obj - The object to inspect
     * @return {Array<*>} - The values of all object keys. Order is not safe.
     */
    values(obj) {
        return Object.keys(obj).map(key => obj[key]);
    },


    /**
     * Like `Object.keys`, but allows you to omit certain names.
     * @example Obj.keys(this.props, {not: ['onClick']})
     */
    keys(obj, options) {
        let keys = Object.keys(obj);
        if (options && options.not) {
            keys = keys.filter(key => options.not.indexOf(key) === -1);
        }
        return keys;
    },

    /**
     * Returns an object containing all properties except the ones specified via `{not: [...]}`
     * @example
     * const clean = Obj.rest({a: 'a', b: 'b', c: 'c'}, {not: ['b', 'c']}); // {a: 'a'}
     */
    rest(obj, options) {
        const keys = this.keys(obj, options);
        return keys.reduce((result, key) => {
            result[key] = obj[key];
            return result;
        }, {});
    },


    /**
     * Returns a new object that contains only the specified keys of an original object.
     * If the original object was immutable, the result will be immutable too,
     */
    pick(obj, keys) {
        if (!obj) {
            return null;
        }
        if (!keys || keys.length === 0) {
            // no keys specified. return new object containing everything
            return obj.toJS ? obj.merge({}) : { ...obj };
        }

        if (obj && obj.toJS) {
            // obj is immutable, keys are given
            // see https://github.com/facebook/immutable-js/wiki/Predicates#pick--omit
            if (!Immutable) {
                throw new Error('You must register Immutable.js in order to use pick() with immutable objects and specific keys. Use registerImmutable(require("immutable"))')
            }
            function keyIn(...keys) {
                var keySet = Immutable.Set(keys);
                return function(v, k) {
                    return keySet.has(k);
                };
            }
            return obj.filter(keyIn(...keys));
        }

        // obj is plain object
        return keys.reduce((result, key) => {
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
    pojo(value) {
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
            return value.map(v => this.pojo(v));
        }
        return Object.keys(value).reduce((result, key) => {
            result[key] = this.pojo(value[key]);
            return result;
        }, {});
    }
};