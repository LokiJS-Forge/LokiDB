(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("@lokidb/loki", [], factory);
	else if(typeof exports === 'object')
		exports["@lokidb/loki"] = factory();
	else
		{ root["@lokidb/loki"] = factory(); root["Loki"] = root["@lokidb/loki"].default; }
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 8);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ComparatorMap; });
/* unused harmony export CreateJavascriptComparator */
/* unused harmony export CreateAbstractJavascriptComparator */
/* unused harmony export CreateAbstractDateJavascriptComparator */
/* unused harmony export CreateLokiComparator */
/* harmony import */ var _operator_packages__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/**
 * This file contains LokiOperatorPackages, RangedIndex and Comparator interfaces, as well as
 * global map object instances for registered LokiOperatorPackages, RangedIndex implementations, and Comparator functions
 */

/** Map/Register of named ILokiComparer functions returning -1, 0, 1 for lt/eq/gt assertions for two passed parameters */
let ComparatorMap = {
    "js": CreateJavascriptComparator(),
    "abstract-js": CreateAbstractJavascriptComparator(),
    "abstract-date": CreateAbstractDateJavascriptComparator(),
    "loki": CreateLokiComparator()
};
/** Typescript-friendly factory for strongly typed 'js' comparators */
function CreateJavascriptComparator() {
    return (val, val2) => {
        if (val === val2)
            return 0;
        if (val < val2)
            return -1;
        return 1;
    };
}
/** Typescript-friendly factory for strongly typed 'abstract js' comparators */
function CreateAbstractJavascriptComparator() {
    return (val, val2) => {
        if (val == val2)
            return 0;
        if (val < val2)
            return -1;
        return 1;
    };
}
/**
 * Comparator which attempts to deal with deal with dates at comparator level.
 * Should work for dates in any of the object, string, and number formats
 */
function CreateAbstractDateJavascriptComparator() {
    return (val, val2) => {
        let v1 = (new Date(val).toISOString());
        let v2 = (new Date(val2).toISOString());
        if (v1 == v2)
            return 0;
        if (v1 < v2)
            return -1;
        return 1;
    };
}
/** Typescript-friendly factory for strongly typed 'loki' comparators */
function CreateLokiComparator() {
    return (val, val2) => {
        if (Object(_operator_packages__WEBPACK_IMPORTED_MODULE_0__[/* aeqHelper */ "b"])(val, val2))
            return 0;
        if (Object(_operator_packages__WEBPACK_IMPORTED_MODULE_0__[/* ltHelper */ "c"])(val, val2, false))
            return -1;
        return 1;
    };
}


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return PLUGINS; });
function getGlobal() {
    let glob;
    (function (global) {
        glob = global;
    })(global !== undefined && global || this);
    return glob;
}
function create() {
    const global = getGlobal();
    const sym = Symbol.for("LOKI");
    if (global[sym] === undefined) {
        global[sym] = {};
    }
    return global[sym];
}
/**
 * @hidden
 */
const PLUGINS = create();

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(7)))

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return aeqHelper; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return ltHelper; });
/* unused harmony export gtHelper */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return sortHelper; });
/* unused harmony export LokiOperatorPackage */
/* unused harmony export LokiAbstractOperatorPackage */
/* unused harmony export ComparatorOperatorPackage */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return LokiOperatorPackageMap; });
/**
 * Helper function for determining 'loki' abstract equality which is a little more abstract than ==
 *     aeqHelper(5, '5') === true
 *     aeqHelper(5.0, '5') === true
 *     aeqHelper(new Date("1/1/2011"), new Date("1/1/2011")) === true
 *     aeqHelper({a:1}, {z:4}) === true (all objects sorted equally)
 *     aeqHelper([1, 2, 3], [1, 3]) === false
 *     aeqHelper([1, 2, 3], [1, 2, 3]) === true
 *     aeqHelper(undefined, null) === true
 * @param {any} prop1
 * @param {any} prop2
 * @returns {boolean}
 * @hidden
 */
function aeqHelper(prop1, prop2) {
    if (prop1 === prop2)
        return true;
    // 'falsy' and Boolean handling
    if (!prop1 || !prop2 || prop1 === true || prop2 === true || prop1 !== prop1 || prop2 !== prop2) {
        let t1;
        let t2;
        // dates and NaN conditions (typed dates before serialization)
        switch (prop1) {
            case undefined:
                t1 = 1;
                break;
            case null:
                t1 = 1;
                break;
            case false:
                t1 = 3;
                break;
            case true:
                t1 = 4;
                break;
            case "":
                t1 = 5;
                break;
            default:
                t1 = (prop1 === prop1) ? 9 : 0;
                break;
        }
        switch (prop2) {
            case undefined:
                t2 = 1;
                break;
            case null:
                t2 = 1;
                break;
            case false:
                t2 = 3;
                break;
            case true:
                t2 = 4;
                break;
            case "":
                t2 = 5;
                break;
            default:
                t2 = (prop2 === prop2) ? 9 : 0;
                break;
        }
        // one or both is edge case
        if (t1 !== 9 || t2 !== 9) {
            return (t1 === t2);
        }
    }
    // Handle 'Number-like' comparisons
    let cv1 = Number(prop1);
    let cv2 = Number(prop2);
    // if one or both are 'number-like'...
    if (cv1 === cv1 || cv2 === cv2) {
        return (cv1 === cv2);
    }
    // not strict equal nor less than nor gt so must be mixed types, convert to string and use that to compare
    cv1 = prop1.toString();
    cv2 = prop2.toString();
    return (cv1 == cv2);
}
/**
 * Helper function for determining 'less-than' conditions for ops, sorting, and binary indices.
 *     In the future we might want $lt and $gt ops to use their own functionality/helper.
 *     Since binary indices on a property might need to index [12, NaN, new Date(), Infinity], we
 *     need this function (as well as gtHelper) to always ensure one value is LT, GT, or EQ to another.
 * @hidden
 */
function ltHelper(prop1, prop2, equal) {
    // if one of the params is falsy or strictly true or not equal to itself
    // 0, 0.0, "", NaN, null, undefined, not defined, false, true
    if (!prop1 || !prop2 || prop1 === true || prop2 === true || prop1 !== prop1 || prop2 !== prop2) {
        let t1;
        let t2;
        switch (prop1) {
            case undefined:
                t1 = 1;
                break;
            case null:
                t1 = 1;
                break;
            case false:
                t1 = 3;
                break;
            case true:
                t1 = 4;
                break;
            case "":
                t1 = 5;
                break;
            // if strict equal probably 0 so sort higher, otherwise probably NaN so sort lower than even null
            default:
                t1 = (prop1 === prop1) ? 9 : 0;
                break;
        }
        switch (prop2) {
            case undefined:
                t2 = 1;
                break;
            case null:
                t2 = 1;
                break;
            case false:
                t2 = 3;
                break;
            case true:
                t2 = 4;
                break;
            case "":
                t2 = 5;
                break;
            default:
                t2 = (prop2 === prop2) ? 9 : 0;
                break;
        }
        // one or both is edge case
        if (t1 !== 9 || t2 !== 9) {
            return (t1 === t2) ? equal : (t1 < t2);
        }
    }
    // if both are numbers (string encoded or not), compare as numbers
    let cv1 = Number(prop1);
    let cv2 = Number(prop2);
    if (cv1 === cv1 && cv2 === cv2) {
        if (cv1 < cv2)
            return true;
        if (cv1 > cv2)
            return false;
        return equal;
    }
    if (cv1 === cv1 && cv2 !== cv2) {
        return true;
    }
    if (cv2 === cv2 && cv1 !== cv1) {
        return false;
    }
    if (prop1 < prop2)
        return true;
    if (prop1 > prop2)
        return false;
    if (prop1 == prop2)
        return equal;
    // not strict equal nor less than nor gt so must be mixed types, convert to string and use that to compare
    cv1 = prop1.toString();
    cv2 = prop2.toString();
    if (cv1 < cv2) {
        return true;
    }
    if (cv1 == cv2) {
        return equal;
    }
    return false;
}
/**
 * @hidden
 * @param {any} prop1
 * @param {any} prop2
 * @param {boolean} equal
 * @returns {boolean}
 */
function gtHelper(prop1, prop2, equal) {
    // 'falsy' and Boolean handling
    if (!prop1 || !prop2 || prop1 === true || prop2 === true || prop1 !== prop1 || prop2 !== prop2) {
        let t1;
        let t2;
        switch (prop1) {
            case undefined:
                t1 = 1;
                break;
            case null:
                t1 = 1;
                break;
            case false:
                t1 = 3;
                break;
            case true:
                t1 = 4;
                break;
            case "":
                t1 = 5;
                break;
            // NaN 0
            default:
                t1 = (prop1 === prop1) ? 9 : 0;
                break;
        }
        switch (prop2) {
            case undefined:
                t2 = 1;
                break;
            case null:
                t2 = 1;
                break;
            case false:
                t2 = 3;
                break;
            case true:
                t2 = 4;
                break;
            case "":
                t2 = 5;
                break;
            default:
                t2 = (prop2 === prop2) ? 9 : 0;
                break;
        }
        // one or both is edge case
        if (t1 !== 9 || t2 !== 9) {
            return (t1 === t2) ? equal : (t1 > t2);
        }
    }
    // if both are numbers (string encoded or not), compare as numbers
    let cv1 = Number(prop1);
    let cv2 = Number(prop2);
    if (cv1 === cv1 && cv2 === cv2) {
        if (cv1 > cv2)
            return true;
        if (cv1 < cv2)
            return false;
        return equal;
    }
    if (cv1 === cv1 && cv2 !== cv2) {
        return false;
    }
    if (cv2 === cv2 && cv1 !== cv1) {
        return true;
    }
    if (prop1 > prop2)
        return true;
    if (prop1 < prop2)
        return false;
    if (prop1 == prop2)
        return equal;
    // not strict equal nor less than nor gt so must be dates or mixed types
    // convert to string and use that to compare
    cv1 = prop1.toString();
    cv2 = prop2.toString();
    if (cv1 > cv2) {
        return true;
    }
    if (cv1 == cv2) {
        return equal;
    }
    return false;
}
/**
 * @param {any} prop1
 * @param {any} prop2
 * @param {boolean} descending
 * @returns {number}
 * @hidden
 */
function sortHelper(prop1, prop2, descending) {
    if (aeqHelper(prop1, prop2)) {
        return 0;
    }
    if (ltHelper(prop1, prop2, false)) {
        return descending ? 1 : -1;
    }
    if (gtHelper(prop1, prop2, false)) {
        return descending ? -1 : 1;
    }
    // not lt, not gt so implied equality-- date compatible
    return 0;
}
/**
 * Default implementation of LokiOperatorPackage, using fastest javascript comparison operators.
 */
class LokiOperatorPackage {
    // comparison operators
    // a is the value in the collection
    // b is the query value
    $eq(a, b) {
        return a === b;
    }
    $ne(a, b) {
        return a !== b;
    }
    $gt(a, b) {
        return a > b;
    }
    $gte(a, b) {
        return a >= b;
    }
    $lt(a, b) {
        return a < b;
    }
    $lte(a, b) {
        return a <= b;
    }
    $between(a, range) {
        if (a === undefined || a === null)
            return false;
        return a >= range[0] && a <= range[1];
    }
    $in(a, b) {
        return b.indexOf(a) !== -1;
    }
    $nin(a, b) {
        return b.indexOf(a) === -1;
    }
    $keyin(a, b) {
        return a in b;
    }
    $nkeyin(a, b) {
        return !(a in b);
    }
    $definedin(a, b) {
        return b[a] !== undefined;
    }
    $undefinedin(a, b) {
        return b[a] === undefined;
    }
    $regex(a, b) {
        return b.test(a);
    }
    $containsNone(a, b) {
        return !this.$containsAny(a, b);
    }
    $containsAny(a, b) {
        const checkFn = this.containsCheckFn(a);
        if (checkFn !== null) {
            return (Array.isArray(b)) ? (b.some(checkFn)) : (checkFn(b));
        }
        return false;
    }
    $contains(a, b) {
        const checkFn = this.containsCheckFn(a);
        if (checkFn !== null) {
            return (Array.isArray(b)) ? (b.every(checkFn)) : (checkFn(b));
        }
        return false;
    }
    $type(a, b) {
        let type = typeof a;
        if (type === "object") {
            if (Array.isArray(a)) {
                type = "array";
            }
            else if (a instanceof Date) {
                type = "date";
            }
        }
        return (typeof b !== "object") ? (type === b) : this.doQueryOp(type, b);
    }
    $finite(a, b) {
        return (b === isFinite(a));
    }
    $size(a, b) {
        if (Array.isArray(a)) {
            return (typeof b !== "object") ? (a.length === b) : this.doQueryOp(a.length, b);
        }
        return false;
    }
    $len(a, b) {
        if (typeof a === "string") {
            return (typeof b !== "object") ? (a.length === b) : this.doQueryOp(a.length, b);
        }
        return false;
    }
    $where(a, b) {
        return b(a) === true;
    }
    // field-level logical operators
    // a is the value in the collection
    // b is the nested query operation (for '$not')
    //   or an array of nested query operations (for '$and' and '$or')
    $not(a, b) {
        return !this.doQueryOp(a, b);
    }
    $and(a, b) {
        for (let idx = 0, len = b.length; idx < len; idx++) {
            if (!this.doQueryOp(a, b[idx])) {
                return false;
            }
        }
        return true;
    }
    $or(a, b) {
        for (let idx = 0, len = b.length; idx < len; idx++) {
            if (this.doQueryOp(a, b[idx])) {
                return true;
            }
        }
        return false;
    }
    doQueryOp(val, op) {
        for (let p in op) {
            if (Object.hasOwnProperty.call(op, p)) {
                return this[p](val, op[p]);
            }
        }
        return false;
    }
    containsCheckFn(a) {
        if (typeof a === "string" || Array.isArray(a)) {
            return (b) => a.indexOf(b) !== -1;
        }
        else if (typeof a === "object" && a !== null) {
            return (b) => Object.hasOwnProperty.call(a, b);
        }
        return null;
    }
}
/**
 * LokiOperatorPackage which utilizes abstract 'loki' comparisons for basic relational equality op implementations.
 */
class LokiAbstractOperatorPackage extends LokiOperatorPackage {
    constructor() {
        super();
    }
    $eq(a, b) {
        return aeqHelper(a, b);
    }
    $ne(a, b) {
        return !aeqHelper(a, b);
    }
    $gt(a, b) {
        return gtHelper(a, b, false);
    }
    $gte(a, b) {
        return gtHelper(a, b, true);
    }
    $lt(a, b) {
        return ltHelper(a, b, false);
    }
    $lte(a, b) {
        return ltHelper(a, b, true);
    }
    $between(a, range) {
        if (a === undefined || a === null)
            return false;
        return gtHelper(a, range[0], true) && ltHelper(a, range[1], true);
    }
}
/**
 * LokiOperatorPackage which utilizes provided comparator for basic relational equality op implementations.
 */
class ComparatorOperatorPackage extends LokiOperatorPackage {
    constructor(comparator) {
        super();
        this.comparator = comparator;
    }
    $eq(a, b) {
        return this.comparator(a, b) === 0;
    }
    $ne(a, b) {
        return this.comparator(a, b) !== 0;
    }
    $gt(a, b) {
        return this.comparator(a, b) === 1;
    }
    $gte(a, b) {
        return this.comparator(a, b) > -1;
    }
    $lt(a, b) {
        return this.comparator(a, b) === -1;
    }
    $lte(a, b) {
        return this.comparator(a, b) < 1;
    }
    $between(a, range) {
        if (a === undefined || a === null)
            return false;
        return this.comparator(a, range[0]) > -1 && this.comparator(a, range[1]) < 1;
    }
}
/**
 * Map/Register of named LokiOperatorPackages which implement all unindexed query ops within 'find' query objects
 */
let LokiOperatorPackageMap = {
    "js": new LokiOperatorPackage(),
    "loki": new LokiAbstractOperatorPackage()
};


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

// EXTERNAL MODULE: ./packages/loki/src/event_emitter.ts
var event_emitter = __webpack_require__(5);

// CONCATENATED MODULE: ./packages/loki/src/unique_index.ts
class UniqueIndex {
    /**
     * Constructs an unique index object.
     * @param {string} propertyField - the property field to index
     */
    constructor(propertyField) {
        this._field = propertyField;
        this._lokiMap = {};
        this._valMap = {};
    }
    /**
     * Sets a document's unique index.
     * @param {number} id loki id to associate with value
     * @param {*} value  value to associate with id
     */
    set(id, value) {
        // unique index should not include null/undefined values
        if (value !== null && value !== undefined) {
            if (value in this._lokiMap) {
                throw new Error("Duplicate key for property " + this._field + ": " + value);
            }
            if (id in this._valMap) {
                throw new Error("Duplicate key for property $loki : " + id);
            }
            this._lokiMap[value] = id;
            this._valMap[id] = value;
        }
    }
    /**
     * Returns the $loki id of an unique value.
     * @param {*} value the value to retrieve a loki id match for
     */
    get(value) {
        return this._lokiMap[value];
    }
    /**
     * Updates a document's unique index.
     * @param {number} id (loki) id of document to update the value to
     * @param {*} value value to associate with loki id
     */
    update(id, value) {
        // if the value has not changed, do nothing
        if (value === this._valMap[id]) {
            return;
        }
        // the value must have changed, so check if new value already exists
        if (value in this._lokiMap) {
            throw new Error("Duplicate key for property " + this._field + ": " + value);
        }
        this.remove(id);
        this.set(id, value);
    }
    /**
     * Removes an unique index.
     * @param {number} id (loki) id to remove from index
     */
    remove(id) {
        if (!(id in this._valMap)) {
            throw new Error("Key is not in unique index: " + this._field);
        }
        let oldValue = this._valMap[id];
        delete this._lokiMap[oldValue];
        delete this._valMap[id];
    }
    /**
     * Clears the unique index.
     */
    clear() {
        this._lokiMap = {};
        this._valMap = {};
    }
}

// CONCATENATED MODULE: ./packages/loki/src/clone.ts
function add(copy, key, value) {
    if (copy instanceof Array) {
        copy.push(value);
        return copy[copy.length - 1];
    }
    else if (copy instanceof Object) {
        copy[key] = value;
        return copy[key];
    }
}
function walk(target, copy) {
    for (let key in target) {
        let obj = target[key];
        if (obj instanceof Date) {
            let value = new Date(obj.getTime());
            add(copy, key, value);
        }
        else if (obj instanceof Function) {
            let value = obj;
            add(copy, key, value);
        }
        else if (obj instanceof Array) {
            let value = [];
            let last = add(copy, key, value);
            walk(obj, last);
        }
        else if (obj instanceof Object) {
            let value = {};
            let last = add(copy, key, value);
            walk(obj, last);
        }
        else {
            let value = obj;
            add(copy, key, value);
        }
    }
}
// Deep copy from Simeon Velichkov.
/**
 * @param target
 * @returns {any}
 */
function deepCopy(target) {
    if (/number|string|boolean/.test(typeof target)) {
        return target;
    }
    else if (target instanceof Date) {
        return new Date(target.getTime());
    }
    const copy = (target instanceof Array) ? [] : {};
    walk(target, copy);
    return copy;
}
/**
 * @hidden
 */
function clone(data, method = "parse-stringify") {
    if (data === null || data === undefined) {
        return null;
    }
    let cloned;
    switch (method) {
        case "parse-stringify":
            cloned = JSON.parse(JSON.stringify(data));
            break;
        case "deep":
            cloned = deepCopy(data);
            break;
        case "shallow":
            cloned = Object.create(data.constructor.prototype);
            Object.assign(cloned, data);
            break;
        case "shallow-recurse":
            // shallow clone top level properties
            cloned = clone(data, "shallow");
            const keys = Object.keys(data);
            // for each of the top level properties which are object literals, recursively shallow copy
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (typeof data[key] === "object" && data[key].constructor.name === "Object") {
                    cloned[key] = clone(data[key], "shallow-recurse");
                }
            }
            break;
        default:
            break;
    }
    return cloned;
}

// EXTERNAL MODULE: ./packages/loki/src/operator_packages.ts
var operator_packages = __webpack_require__(2);

// EXTERNAL MODULE: ./packages/loki/src/comparators.ts
var comparators = __webpack_require__(0);

// CONCATENATED MODULE: ./packages/loki/src/result_set.ts




// used to recursively scan hierarchical transform step object for param substitution
function resolveTransformObject(subObj, params, depth = 0) {
    if (++depth >= 10) {
        return subObj;
    }
    for (const prop in subObj) {
        if (typeof subObj[prop] === "string" && subObj[prop].indexOf("[%lktxp]") === 0) {
            const pname = subObj[prop].substring(8);
            if (params[pname] !== undefined) {
                subObj[prop] = params[pname];
            }
        }
        else if (typeof subObj[prop] === "object") {
            subObj[prop] = resolveTransformObject(subObj[prop], params, depth);
        }
    }
    return subObj;
}
// top level utility to resolve an entire (single) transform (array of steps) for parameter substitution
function resolveTransformParams(transform, params) {
    if (params === undefined) {
        return transform;
    }
    // iterate all steps in the transform array
    const resolvedTransform = [];
    for (let idx = 0; idx < transform.length; idx++) {
        // clone transform so our scan/replace can operate directly on cloned transform
        const clonedStep = clone(transform[idx], "shallow-recurse");
        resolvedTransform.push(resolveTransformObject(clonedStep, params));
    }
    return resolvedTransform;
}
/**
 * @hidden
 */
// if an op is registered in this object, our 'calculateRange' can use it with our binary indices.
// if the op is registered to a function, we will run that function/op as a 2nd pass filter on results.
// those 2nd pass filter functions should be similar to LokiOps functions, accepting 2 vals to compare.
const indexedOps = {
    $eq: true,
    $dteq: true,
    $gt: true,
    $gte: true,
    $lt: true,
    $lte: true,
    $in: true,
    $between: true
};
/**
 * ResultSet class allowing chainable queries.  Intended to be instanced internally.
 *    Collection.find(), Collection.where(), and Collection.chain() instantiate this.
 *
 * @example
 *    mycollection.chain()
 *      .find({ 'doors' : 4 })
 *      .where(function(obj) { return obj.name === 'Toyota' })
 *      .data();
 *
 * @param <TData> - the data type
 * @param <TNested> - nested properties of data type
 */
class result_set_ResultSet {
    /**
     * Constructor.
     * @param {Collection} collection - the collection which this ResultSet will query against
     */
    constructor(collection) {
        this._filteredRows = [];
        this._filterInitialized = false;
        // Holds the scoring result of the last full-text search.
        this._scoring = null;
        // retain reference to collection we are querying against
        this._collection = collection;
    }
    /**
     * Reset the ResultSet to its initial state.
     * @returns {ResultSet} Reference to this ResultSet, for future chain operations.
     */
    reset() {
        if (this._filteredRows.length > 0) {
            this._filteredRows = [];
        }
        this._filterInitialized = false;
        return this;
    }
    /**
     * Override of toJSON to avoid circular references
     */
    toJSON() {
        const copy = this.copy();
        copy._collection = null;
        return copy;
    }
    /**
     * Allows you to limit the number of documents passed to next chain operation.
     * A ResultSet copy() is made to avoid altering original ResultSet.
     * @param {int} qty - The number of documents to return.
     * @returns {ResultSet} Returns a copy of the ResultSet, limited by qty, for subsequent chain ops.
     */
    limit(qty) {
        // if this has no filters applied, we need to populate filteredRows first
        if (!this._filterInitialized && this._filteredRows.length === 0) {
            this._filteredRows = this._collection._prepareFullDocIndex();
        }
        this._filteredRows = this._filteredRows.slice(0, qty);
        this._filterInitialized = true;
        return this;
    }
    /**
     * Used for skipping 'pos' number of documents in the ResultSet.
     * @param {int} pos - Number of documents to skip; all preceding documents are filtered out.
     * @returns {ResultSet} Returns a copy of the ResultSet, containing docs starting at 'pos' for subsequent chain ops.
     */
    offset(pos) {
        // if this has no filters applied, we need to populate filteredRows first
        if (!this._filterInitialized && this._filteredRows.length === 0) {
            this._filteredRows = this._collection._prepareFullDocIndex();
        }
        this._filteredRows = this._filteredRows.slice(pos);
        this._filterInitialized = true;
        return this;
    }
    /**
     * To support reuse of ResultSet in branched query situations.
     * @returns {ResultSet} Returns a copy of the ResultSet (set) but the underlying document references will be the same.
     */
    copy() {
        const result = new result_set_ResultSet(this._collection);
        result._filteredRows = this._filteredRows.slice();
        result._filterInitialized = this._filterInitialized;
        return result;
    }
    /**
     * Executes a named collection transform or raw array of transform steps against the ResultSet.
     * @param {(string|array)} transform - name of collection transform or raw transform array
     * @param {object} [parameters=] - object property hash of parameters, if the transform requires them.
     * @returns {ResultSet} either (this) ResultSet or a clone of of this ResultSet (depending on steps)
     */
    transform(transform, parameters) {
        // if transform is name, then do lookup first
        if (typeof transform === "string") {
            transform = this._collection._transforms[transform];
        }
        if (parameters !== undefined) {
            transform = resolveTransformParams(transform, parameters);
        }
        let rs = this;
        for (let idx = 0; idx < transform.length; idx++) {
            const step = transform[idx];
            switch (step.type) {
                case "find":
                    rs.find(step.value);
                    break;
                case "where":
                    rs.where(step.value);
                    break;
                case "simplesort":
                    rs.simplesort(step.property, step.options);
                    break;
                case "compoundsort":
                    rs.compoundsort(step.value);
                    break;
                case "sort":
                    rs.sort(step.value);
                    break;
                case "sortByScoring":
                    rs.sortByScoring(step.desc);
                    break;
                case "limit":
                    rs = rs.limit(step.value);
                    break; // limit makes copy so update reference
                case "offset":
                    rs = rs.offset(step.value);
                    break; // offset makes copy so update reference
                case "map":
                    rs = rs.map(step.value, step.dataOptions);
                    break;
                case "eqJoin":
                    rs = rs.eqJoin(step.joinData, step.leftJoinKey, step.rightJoinKey, step.mapFun, step.dataOptions);
                    break;
                // following cases break chain by returning array data so make any of these last in transform steps
                case "mapReduce":
                    rs = rs.mapReduce(step.mapFunction, step.reduceFunction);
                    break;
                // following cases update documents in current filtered ResultSet (use carefully)
                case "update":
                    rs.update(step.value);
                    break;
                case "remove":
                    rs.remove();
                    break;
                default:
                    break;
            }
        }
        return rs;
    }
    /**
     * User supplied compare function is provided two documents to compare. (chainable)
     * @example
     *    rslt.sort(function(obj1, obj2) {
       *      if (obj1.name === obj2.name) return 0;
       *      if (obj1.name > obj2.name) return 1;
       *      if (obj1.name < obj2.name) return -1;
       *    });
     * @param {function} comparefun - A javascript compare function used for sorting.
     * @returns {ResultSet} Reference to this ResultSet, sorted, for future chain operations.
     */
    sort(comparefun) {
        // if this has no filters applied, just we need to populate filteredRows first
        if (!this._filterInitialized && this._filteredRows.length === 0) {
            this._filteredRows = this._collection._prepareFullDocIndex();
        }
        const data = this._collection._data;
        const wrappedComparer = (a, b) => comparefun(data[a], data[b]);
        this._filteredRows.sort(wrappedComparer);
        return this;
    }
    /**
     * Simpler, loose evaluation for user to sort based on a property name. (chainable).
     * Sorting based on the same lt/gt helper functions used for binary indices.
     * @param {string} propname - name of property to sort by.
     * @param {boolean|object=} options - boolean for sort descending or options object
     * @param {boolean} [options.desc=false] - whether to sort descending
     * @param {string} [options.sortComparator] override default with name of comparator registered in ComparatorMap
     * @returns {ResultSet} Reference to this ResultSet, sorted, for future chain operations.
     */
    simplesort(propname, options = { desc: false }) {
        if (typeof options === "boolean") {
            options = {
                desc: options
            };
        }
        if (!this._filterInitialized && this._collection._rangedIndexes.hasOwnProperty(propname)) {
            let sortedIds = this._collection._rangedIndexes[propname].index.rangeRequest();
            let dataPositions = [];
            // until we refactor resultset to store $loki ids in filteredrows,
            // we need to convert $loki ids to data array positions
            for (let id of sortedIds) {
                dataPositions.push(this._collection.get(id, true)[1]);
            }
            this._filteredRows = options.desc ? dataPositions.reverse() : dataPositions;
            this._filterInitialized = true;
            return this;
        }
        // if this has no filters applied, just we need to populate filteredRows first
        if (!this._filterInitialized && this._filteredRows.length === 0) {
            this._filteredRows = this._collection._prepareFullDocIndex();
        }
        const data = this._collection._data;
        let comparator = (options.sortComparator) ?
            comparators["a" /* ComparatorMap */][options.sortComparator] :
            comparators["a" /* ComparatorMap */][this._collection._unindexedSortComparator];
        const wrappedComparer = (a, b) => {
            return comparator(data[a][propname], data[b][propname]);
        };
        this._filteredRows.sort(wrappedComparer);
        if (options.desc) {
            this._filteredRows.reverse();
        }
        return this;
    }
    /**
     * Allows sorting a ResultSet based on multiple columns.
     * @example
     * // to sort by age and then name (both ascending)
     * rs.compoundsort(['age', 'name']);
     * // to sort by age (ascending) and then by name (descending)
     * rs.compoundsort(['age', ['name', true]);
     * @param {array} properties - array of property names or subarray of [propertyname, isdesc] used evaluate sort order
     * @returns {ResultSet} Reference to this ResultSet, sorted, for future chain operations.
     */
    compoundsort(properties) {
        if (properties.length === 0) {
            throw new Error("Invalid call to compoundsort, need at least one property");
        }
        if (properties.length === 1) {
            const prop = properties[0];
            if (typeof prop === "string") {
                return this.simplesort(prop, false);
            }
            else {
                return this.simplesort(prop[0], prop[1]);
            }
        }
        // unify the structure of 'properties' to avoid checking it repeatedly while sorting
        for (let i = 0, len = properties.length; i < len; i++) {
            const prop = properties[i];
            if (typeof prop === "string") {
                properties[i] = [prop, false];
            }
        }
        // if this has no filters applied, just we need to populate filteredRows first
        if (!this._filterInitialized && this._filteredRows.length === 0) {
            this._filteredRows = this._collection._prepareFullDocIndex();
        }
        const data = this._collection._data;
        const wrappedComparer = (a, b) => this._compoundeval(properties, data[a], data[b]);
        this._filteredRows.sort(wrappedComparer);
        return this;
    }
    /**
     * Helper function for compoundsort(), performing individual object comparisons
     * @param {Array} properties - array of property names, in order, by which to evaluate sort order
     * @param {object} obj1 - first object to compare
     * @param {object} obj2 - second object to compare
     * @returns {number} 0, -1, or 1 to designate if identical (sortwise) or which should be first
     */
    _compoundeval(properties, obj1, obj2) {
        for (let i = 0, len = properties.length; i < len; i++) {
            const prop = properties[i];
            const field = prop[0];
            const res = Object(operator_packages["d" /* sortHelper */])(obj1[field], obj2[field], prop[1]);
            if (res !== 0) {
                return res;
            }
        }
        return 0;
    }
    /**
     * Sorts the ResultSet based on the last full-text-search scoring.
     * @param {boolean} [ascending=false] - sort ascending
     * @returns {ResultSet}
     */
    sortByScoring(ascending = false) {
        if (this._scoring === null) {
            throw new Error("No scoring available");
        }
        if (ascending) {
            this._filteredRows.sort((a, b) => this._scoring[a].score - this._scoring[b].score);
        }
        else {
            this._filteredRows.sort((a, b) => this._scoring[b].score - this._scoring[a].score);
        }
        return this;
    }
    /**
     * Returns the scoring of the last full-text-search.
     * @returns {ScoreResult[]}
     */
    getScoring() {
        if (this._scoring === null) {
            throw new Error("No scoring available");
        }
        const scoring = [];
        for (let i = 0; i < this._filteredRows.length; i++) {
            scoring.push(this._scoring[this._filteredRows[i]]);
        }
        return scoring;
    }
    /**
     * Oversee the operation of OR'ed query expressions.
     * OR'ed expression evaluation runs each expression individually against the full collection,
     * and finally does a set OR on each expression's results.
     * Each evaluation can utilize a binary index to prevent multiple linear array scans.
     * @param {array} expressionArray - array of expressions
     * @returns {ResultSet} this ResultSet for further chain ops.
     */
    findOr(expressionArray) {
        const docset = [];
        const idxset = [];
        const origCount = this.count();
        // If filter is already initialized, then we query against only those items already in filter.
        // This means no index utilization for fields, so hopefully its filtered to a smallish filteredRows.
        for (let ei = 0, elen = expressionArray.length; ei < elen; ei++) {
            // we need to branch existing query to run each filter separately and combine results
            const fr = this.copy().find(expressionArray[ei])._filteredRows;
            const frlen = fr.length;
            // if the find operation did not reduce the initial set, then the initial set is the actual result
            if (frlen === origCount) {
                return this;
            }
            // add any document 'hits'
            for (let fri = 0; fri < frlen; fri++) {
                const idx = fr[fri];
                if (idxset[idx] === undefined) {
                    idxset[idx] = true;
                    docset.push(idx);
                }
            }
        }
        this._filteredRows = docset;
        this._filterInitialized = true;
        return this;
    }
    $or(expressionArray) {
        return this.findOr(expressionArray);
    }
    /**
     * Oversee the operation of AND'ed query expressions.
     * AND'ed expression evaluation runs each expression progressively against the full collection,
     * internally utilizing existing chained ResultSet functionality.
     * Only the first filter can utilize a binary index.
     * @param {array} expressionArray - array of expressions
     * @returns {ResultSet} this ResultSet for further chain ops.
     */
    findAnd(expressionArray) {
        // we have already implementing method chaining in this (our ResultSet class)
        // so lets just progressively apply user supplied and filters
        for (let i = 0, len = expressionArray.length; i < len; i++) {
            if (this.count() === 0) {
                return this;
            }
            this.find(expressionArray[i]);
        }
        return this;
    }
    $and(expressionArray) {
        return this.findAnd(expressionArray);
    }
    /**
     * Used for querying via a mongo-style query object.
     *
     * @param {object} query - A mongo-style query object used for filtering current results.
     * @param {boolean} firstOnly - (Optional) Used by collection.findOne() - flag if this was invoked via findOne()
     * @returns {ResultSet} this ResultSet for further chain ops.
     */
    find(query, firstOnly = false) {
        if (this._collection._data.length === 0) {
            this._filteredRows = [];
            this._filterInitialized = true;
            return this;
        }
        const queryObject = query || "getAll";
        let property;
        let queryObjectOp;
        let value;
        if (typeof queryObject === "object") {
            let filters = [];
            for (let p in queryObject) {
                let obj = {};
                obj[p] = queryObject[p];
                filters.push(obj);
                if (queryObject[p] !== undefined) {
                    property = p;
                    queryObjectOp = queryObject[p];
                }
            }
            // if more than one expression in single query object,
            // convert implicit $and to explicit $and
            if (filters.length > 1) {
                return this.find({ "$and": filters }, firstOnly);
            }
        }
        // apply no filters if they want all
        if (!property || queryObject === "getAll") {
            if (firstOnly) {
                this._filteredRows = (this._collection._data.length > 0) ? [0] : [];
                this._filterInitialized = true;
            }
            return this;
        }
        // injecting $and and $or expression tree evaluation here.
        if (property === "$and" || property === "$or") {
            this[property](queryObjectOp);
            // for chained find with firstOnly,
            if (firstOnly && this._filteredRows.length > 1) {
                this._filteredRows = this._filteredRows.slice(0, 1);
            }
            return this;
        }
        // see if query object is in shorthand mode (assuming eq operator)
        let operator = "";
        if (queryObjectOp === null || (typeof queryObjectOp !== "object" || queryObjectOp instanceof Date)) {
            operator = "$eq";
            value = queryObjectOp;
        }
        else if (typeof queryObjectOp === "object") {
            for (let key in queryObjectOp) {
                if (queryObjectOp[key] !== undefined) {
                    operator = key;
                    value = queryObjectOp[key];
                    break;
                }
            }
        }
        else {
            throw new Error("Do not know what you want to do.");
        }
        // for regex ops, precompile
        if (operator === "$regex") {
            if (Array.isArray(value)) {
                value = new RegExp(value[0], value[1]);
            }
            else if (!(value instanceof RegExp)) {
                value = new RegExp(value);
            }
        }
        // if an index exists for the property being queried against, use it
        // for now only enabling where it is the first filter applied and prop is indexed
        const doIndexCheck = !this._filterInitialized;
        let searchByIndex = false;
        if (doIndexCheck && this._collection._rangedIndexes[property] && indexedOps[operator]) {
            searchByIndex = true;
        }
        // the comparison function
        const operatorPackage = operator_packages["a" /* LokiOperatorPackageMap */][this._collection._defaultLokiOperatorPackage];
        // "shortcut" for collection data
        const data = this._collection._data;
        // Query executed differently depending on :
        //    - whether the property being queried has an index defined
        //    - if chained, we handle first pass differently for initial filteredRows[] population
        //
        // For performance reasons, each case has its own if block to minimize in-loop calculations
        let result = [];
        // If the filteredRows[] is already initialized, use it
        if (this._filterInitialized) {
            let filter = this._filteredRows;
            if (property === "$fts") {
                this._scoring = this._collection._fullTextSearch.search(queryObject.$fts);
                let keys = Object.keys(this._scoring);
                for (let i = 0; i < keys.length; i++) {
                    if (filter.indexOf(+keys[i]) !== -1) {
                        result.push(+keys[i]);
                    }
                }
            }
            else if (this._collection._constraints.unique[property] !== undefined && operator === "$eq") {
                // convert back to position for filtered rows (until we refactor filteredrows to store $loki instead of data pos)
                const id = this._collection._constraints.unique[property].get(value);
                if (id !== undefined) {
                    const row = this._collection.get(id, true)[1];
                    if (filter.indexOf(row) !== -1) {
                        result.push(row);
                    }
                }
            }
            else {
                for (let i = 0; i < filter.length; i++) {
                    let rowIdx = filter[i];
                    // calling operator as method property of operator package preserves 'this'
                    if (operatorPackage[operator](data[rowIdx][property], value)) {
                        result.push(rowIdx);
                    }
                }
            }
            this._filteredRows = result;
            this._filterInitialized = true; // next time work against filteredRows[]
            return this;
        }
        this._filteredRows = result;
        this._filterInitialized = true; // next time work against filteredRows[]
        if (property === "$fts") {
            this._scoring = this._collection._fullTextSearch.search(queryObject.$fts);
            let keys = Object.keys(this._scoring);
            for (let i = 0; i < keys.length; i++) {
                result.push(+keys[i]);
            }
            return this;
        }
        // Use unique constraint for search.
        if (this._collection._constraints.unique[property] !== undefined && operator === "$eq") {
            // convert back to position for filtered rows (until we refactor filteredrows to store $loki instead of data pos)
            const id = this._collection._constraints.unique[property].get(value);
            if (id !== undefined) {
                result.push(this._collection.get(id, true)[1]);
            }
            return this;
        }
        // if not searching by index
        if (!searchByIndex) {
            // determine comparator to use for ops
            for (let i = 0; i < data.length; i++) {
                // calling operator as method property of operator package preserves 'this'
                if (operatorPackage[operator](data[i][property], value)) {
                    result.push(i);
                    if (firstOnly) {
                        return this;
                    }
                }
            }
            return this;
        }
        // If we have a rangedIndex defined, use that and bail
        if (this._collection._rangedIndexes[property]) {
            if (operator === "$in") {
                let ri = this._collection._rangedIndexes[property];
                // iterate each $in array value
                for (let val of value) {
                    // request matches where val eq current iterated val
                    let idResult = ri.index.rangeRequest({ op: "$eq", val: val });
                    // for each result in match
                    for (let id of idResult) {
                        // convert $loki id to data position and add to result (filteredrows)
                        result.push(this._collection.get(id, true)[1]);
                    }
                }
                return this;
            }
            if (operator === "$between") {
                let idResult = this._collection._rangedIndexes[property].index.rangeRequest({
                    op: operator,
                    val: value[0],
                    high: value[1]
                });
                // for now we will have to 'shim' the binary tree index's $loki ids back
                // into data array indices, ideally i would like to repurpose filteredrows to use loki ids
                for (let id of idResult) {
                    result.push(this._collection.get(id, true)[1]);
                }
                return this;
            }
            let idResult = this._collection._rangedIndexes[property].index.rangeRequest({
                op: operator,
                val: value
            });
            // if our op requires 'second pass'
            if (indexedOps[operator] !== true) {
                for (let id of idResult) {
                    let pos = this._collection.get(id, true)[1];
                    if (indexedOps[operator](data[pos][property], value)) {
                        result.push(pos);
                    }
                }
            }
            else {
                // for now we will have to 'shim' the binary tree index's $loki ids back
                // into data array indices, ideally i would like to repurpose filteredrows to use loki ids
                for (let id of idResult) {
                    result.push(this._collection.get(id, true)[1]);
                }
            }
        }
        return this;
    }
    /**
     * Used for filtering via a javascript filter function.
     * @param {function} fun - A javascript function used for filtering current results by.
     * @returns {ResultSet} this ResultSet for further chain ops.
     */
    where(fun) {
        let viewFunction;
        let result = [];
        if ("function" === typeof fun) {
            viewFunction = fun;
        }
        else {
            throw new TypeError("Argument is not a stored view or a function");
        }
        // If the filteredRows[] is already initialized, use it
        if (this._filterInitialized) {
            let j = this._filteredRows.length;
            while (j--) {
                if (viewFunction(this._collection._data[this._filteredRows[j]]) === true) {
                    result.push(this._filteredRows[j]);
                }
            }
            this._filteredRows = result;
            return this;
        }
        // otherwise this is initial chained op, work against data, push into filteredRows[]
        else {
            let k = this._collection._data.length;
            while (k--) {
                if (viewFunction(this._collection._data[k]) === true) {
                    result.push(k);
                }
            }
            this._filteredRows = result;
            this._filterInitialized = true;
            return this;
        }
    }
    /**
     * Returns the number of documents in the ResultSet.
     * @returns {number} The number of documents in the ResultSet.
     */
    count() {
        if (this._filterInitialized) {
            return this._filteredRows.length;
        }
        return this._collection.count();
    }
    /**
     * Terminates the chain and returns array of filtered documents
     * @param {object} options
     * @param {boolean} [options.forceClones] - Allows forcing the return of cloned objects even when
     *        the collection is not configured for clone object.
     * @param {string} [options.forceCloneMethod] - Allows overriding the default or collection specified cloning method.
     *        Possible values 'parse-stringify', 'deep', and 'shallow' and
     * @param {boolean} [options.removeMeta] - will force clones and strip $loki and meta properties from documents
     *
     * @returns {Array} Array of documents in the ResultSet
     */
    data(options = {}) {
        let forceClones;
        let forceCloneMethod;
        let removeMeta;
        ({
            forceClones = false,
            forceCloneMethod = this._collection._cloneMethod,
            removeMeta = false
        } = options);
        let result = [];
        let data = this._collection._data;
        let obj;
        let method;
        // if user opts to strip meta, then force clones and use 'shallow' if 'force' options are not present
        if (removeMeta && !forceClones) {
            forceClones = true;
            forceCloneMethod = "shallow";
        }
        // if collection has delta changes active, then force clones and use CloneMethod.DEEP for effective change tracking of nested objects
        if (!this._collection._disableDeltaChangesApi) {
            forceClones = true;
            forceCloneMethod = "deep";
        }
        // if this has no filters applied, just return collection.data
        if (!this._filterInitialized) {
            if (this._filteredRows.length === 0) {
                // determine whether we need to clone objects or not
                if (this._collection._cloneObjects || forceClones) {
                    method = forceCloneMethod;
                    for (let i = 0; i < data.length; i++) {
                        obj = this._collection._defineNestedProperties(clone(data[i], method));
                        if (removeMeta) {
                            delete obj.$loki;
                            delete obj.meta;
                        }
                        result.push(obj);
                    }
                    return result;
                }
                // otherwise we are not cloning so return sliced array with same object references
                else {
                    return data.slice();
                }
            }
            else {
                // filteredRows must have been set manually, so use it
                this._filterInitialized = true;
            }
        }
        const fr = this._filteredRows;
        if (this._collection._cloneObjects || forceClones) {
            method = forceCloneMethod;
            for (let i = 0; i < fr.length; i++) {
                obj = this._collection._defineNestedProperties(clone(data[fr[i]], method));
                if (removeMeta) {
                    delete obj.$loki;
                    delete obj.meta;
                }
                result.push(obj);
            }
        }
        else {
            for (let i = 0; i < fr.length; i++) {
                result.push(data[fr[i]]);
            }
        }
        return result;
    }
    /**
     * Used to run an update operation on all documents currently in the ResultSet.
     * @param {function} updateFunction - User supplied updateFunction(obj) will be executed for each document object.
     * @returns {ResultSet} this ResultSet for further chain ops.
     */
    update(updateFunction) {
        // if this has no filters applied, we need to populate filteredRows first
        if (!this._filterInitialized && this._filteredRows.length === 0) {
            this._filteredRows = this._collection._prepareFullDocIndex();
        }
        const len = this._filteredRows.length;
        const rcd = this._collection._data;
        // pass in each document object currently in ResultSet to user supplied updateFunction
        for (let idx = 0; idx < len; idx++) {
            // if we have cloning option specified or are doing differential delta changes, clone object first
            if (this._collection._cloneObjects || !this._collection._disableDeltaChangesApi) {
                const obj = clone(rcd[this._filteredRows[idx]], this._collection._cloneMethod);
                updateFunction(obj);
                this._collection.update(obj);
            }
            else {
                // no need to clone, so just perform update on collection data object instance
                updateFunction(rcd[this._filteredRows[idx]]);
                this._collection.update(rcd[this._filteredRows[idx]]);
            }
        }
        return this;
    }
    /**
     * Removes all document objects which are currently in ResultSet from collection (as well as ResultSet)
     * @returns {ResultSet} this (empty) ResultSet for further chain ops.
     */
    remove() {
        // if this has no filters applied, we need to populate filteredRows first
        if (!this._filterInitialized && this._filteredRows.length === 0) {
            this._filteredRows = this._collection._prepareFullDocIndex();
        }
        this._collection.remove(this.data());
        this._filteredRows = [];
        return this;
    }
    /**
     * data transformation via user supplied functions
     *
     * @param {function} mapFunction - this function accepts a single document for you to transform and return
     * @param {function} reduceFunction - this function accepts many (array of map outputs) and returns single value
     * @returns {value} The output of your reduceFunction
     */
    mapReduce(mapFunction, reduceFunction) {
        try {
            return reduceFunction(this.data().map(mapFunction));
        }
        catch (err) {
            throw err;
        }
    }
    /**
     * Left joining two sets of data. Join keys can be defined or calculated properties
     * eqJoin expects the right join key values to be unique.  Otherwise left data will be joined on the last joinData object with that key
     * @param {Array|ResultSet|Collection} joinData - Data array to join to.
     * @param {(string|function)} leftJoinKey - Property name in this result set to join on or a function to produce a value to join on
     * @param {(string|function)} rightJoinKey - Property name in the joinData to join on or a function to produce a value to join on
     * @param {function} [mapFun=] - a function that receives each matching pair and maps them into output objects - function(left,right){return joinedObject}
     * @param {object} [dataOptions=] - optional options to apply to data() calls for left and right sides
     * @param {boolean} dataOptions.removeMeta - allows removing meta before calling mapFun
     * @param {boolean} dataOptions.forceClones - forcing the return of cloned objects to your map object
     * @param {string} dataOptions.forceCloneMethod - allows overriding the default or collection specified cloning method
     * @returns {ResultSet} A ResultSet with data in the format [{left: leftObj, right: rightObj}]
     */
    eqJoin(joinData, leftJoinKey, rightJoinKey, mapFun, dataOptions) {
        let rightData = [];
        let rightDataLength;
        let key;
        let result = [];
        let leftKeyisFunction = typeof leftJoinKey === "function";
        let rightKeyisFunction = typeof rightJoinKey === "function";
        let joinMap = {};
        //get the left data
        let leftData = this.data(dataOptions);
        let leftDataLength = leftData.length;
        //get the right data
        if (joinData instanceof collection_Collection) {
            rightData = joinData.chain().data(dataOptions);
        }
        else if (joinData instanceof result_set_ResultSet) {
            rightData = joinData.data(dataOptions);
        }
        else if (Array.isArray(joinData)) {
            rightData = joinData;
        }
        else {
            throw new TypeError("joinData needs to be an array or result set");
        }
        rightDataLength = rightData.length;
        //construct a lookup table
        for (let i = 0; i < rightDataLength; i++) {
            key = rightKeyisFunction
                ? rightJoinKey(rightData[i])
                : rightData[i][rightJoinKey];
            joinMap[key] = rightData[i];
        }
        if (!mapFun) {
            mapFun = (left, right) => ({
                left,
                right
            });
        }
        //Run map function over each object in the ResultSet
        for (let j = 0; j < leftDataLength; j++) {
            key = leftKeyisFunction
                ? leftJoinKey(leftData[j])
                : leftData[j][leftJoinKey];
            result.push(mapFun(leftData[j], joinMap[key] || {}));
        }
        //return a new ResultSet with no filters
        this._collection = new collection_Collection("joinData");
        this._collection.insert(result);
        this._filteredRows = [];
        this._filterInitialized = false;
        return this;
    }
    /**
     * Applies a map function into a new collection for further chaining.
     * @param {function} mapFun - javascript map function
     * @param {object} [dataOptions=] - options to data() before input to your map function
     * @param {boolean} dataOptions.removeMeta - allows removing meta before calling mapFun
     * @param {boolean} dataOptions.forceClones - forcing the return of cloned objects to your map object
     * @param {string} dataOptions.forceCloneMethod - Allows overriding the default or collection specified cloning method
     * @return {ResultSet}
     */
    map(mapFun, dataOptions) {
        const data = this.data(dataOptions).map(mapFun);
        //return return a new ResultSet with no filters
        this._collection = new collection_Collection("mappedData");
        this._collection.insert(data);
        this._filteredRows = [];
        this._filterInitialized = false;
        return this;
    }
}

// CONCATENATED MODULE: ./packages/loki/src/dynamic_view.ts


/**
 * DynamicView class is a versatile 'live' view class which can have filters and sorts applied.
 *    Collection.addDynamicView(name) instantiates this DynamicView object and notifies it
 *    whenever documents are add/updated/removed so it can remain up-to-date. (chainable)
 *
 * @example
 * let mydv = mycollection.addDynamicView('test');  // default is non-persistent
 * mydv.applyFind({ 'doors' : 4 });
 * mydv.applyWhere(function(obj) { return obj.name === 'Toyota'; });
 * let results = mydv.data();
 *
 * @extends LokiEventEmitter

 * @see {@link Collection#addDynamicView} to construct instances of DynamicView
 *
 * @param <TData> - the data type
 * @param <TNested> - nested properties of data type
 */
class dynamic_view_DynamicView extends event_emitter["a" /* LokiEventEmitter */] {
    /**
     * Constructor.
     * @param {Collection} collection - a reference to the collection to work agains
     * @param {string} name - the name of this dynamic view
     * @param {object} options - the options
     * @param {boolean} [options.persistent=false] - indicates if view is to main internal results array in 'resultdata'
     * @param {string} [options.sortPriority="passive"] - the sort priority
     * @param {number} [options.minRebuildInterval=1] - minimum rebuild interval (need clarification to docs here)
     */
    constructor(collection, name, options = {}) {
        super();
        this._rebuildPending = false;
        this._resultData = [];
        this._resultDirty = false;
        this._cachedResultSet = null;
        // keep ordered filter pipeline
        this._filterPipeline = [];
        // sorting member variables
        // we only support one active search, applied using applySort() or applySimpleSort()
        this._sortFunction = null;
        this._sortCriteria = null;
        this._sortCriteriaSimple = null;
        this._sortByScoring = null;
        this._sortDirty = false;
        ({
            persistent: this._persistent = false,
            // 'passive' will defer the sort phase until they call data(). (most efficient overall)
            // 'active' will sort async whenever next idle. (prioritizes read speeds)
            sortPriority: this._sortPriority = "passive",
            minRebuildInterval: this._minRebuildInterval = 1
        } = options);
        this._collection = collection;
        this.name = name;
        this._resultSet = new result_set_ResultSet(collection);
        // for now just have 1 event for when we finally rebuilt lazy view
        // once we refactor transactions, i will tie in certain transactional events
        this._events = {
            "rebuild": []
        };
    }
    /**
     * Internally used immediately after deserialization (loading)
     *    This will clear out and reapply filterPipeline ops, recreating the view.
     *    Since where filters do not persist correctly, this method allows
     *    restoring the view to state where user can re-apply those where filters.
     *
     * @param removeWhereFilters
     * @returns {DynamicView} This dynamic view for further chained ops.
     * @fires DynamicView.rebuild
     */
    _rematerialize({ removeWhereFilters = false }) {
        this._resultData = [];
        this._resultDirty = true;
        this._resultSet = new result_set_ResultSet(this._collection);
        if (this._sortFunction || this._sortCriteria || this._sortCriteriaSimple || this._sortByScoring !== null) {
            this._sortDirty = true;
        }
        if (removeWhereFilters) {
            // for each view see if it had any where filters applied... since they don't
            // serialize those functions lets remove those invalid filters
            let fpi = this._filterPipeline.length;
            while (fpi--) {
                if (this._filterPipeline[fpi].type === "where") {
                    if (fpi !== this._filterPipeline.length - 1) {
                        this._filterPipeline[fpi] = this._filterPipeline[this._filterPipeline.length - 1];
                    }
                    this._filterPipeline.length--;
                }
            }
        }
        // back up old filter pipeline, clear filter pipeline, and reapply pipeline ops
        const ofp = this._filterPipeline;
        this._filterPipeline = [];
        // now re-apply 'find' filterPipeline ops
        for (let idx = 0; idx < ofp.length; idx++) {
            this.applyFind(ofp[idx].val);
        }
        // during creation of unit tests, i will remove this forced refresh and leave lazy
        this.data();
        // emit rebuild event in case user wants to be notified
        this.emit("rebuild", this);
        return this;
    }
    /**
     * Makes a copy of the internal ResultSet for branched queries.
     * Unlike this dynamic view, the branched ResultSet will not be 'live' updated,
     * so your branched query should be immediately resolved and not held for future evaluation.
     * @param {(string|array=)} transform - Optional name of collection transform, or an array of transform steps
     * @param {object} parameters - optional parameters (if optional transform requires them)
     * @returns {ResultSet} A copy of the internal ResultSet for branched queries.
     */
    branchResultSet(transform, parameters) {
        const rs = this._resultSet.copy();
        if (transform === undefined) {
            return rs;
        }
        return rs.transform(transform, parameters);
    }
    /**
     * Override of toJSON to avoid circular references.
     */
    toJSON() {
        return {
            name: this.name,
            _persistent: this._persistent,
            _sortPriority: this._sortPriority,
            _minRebuildInterval: this._minRebuildInterval,
            _resultSet: this._resultSet,
            _filterPipeline: this._filterPipeline,
            _sortCriteria: this._sortCriteria,
            _sortCriteriaSimple: this._sortCriteriaSimple,
            _sortByScoring: this._sortByScoring,
            _sortDirty: this._sortDirty,
        };
    }
    static fromJSONObject(collection, obj) {
        let dv = new dynamic_view_DynamicView(collection, obj.name);
        dv._resultDirty = true;
        dv._filterPipeline = obj._filterPipeline;
        dv._resultData = [];
        dv._sortCriteria = obj._sortCriteria;
        dv._sortCriteriaSimple = obj._sortCriteriaSimple;
        dv._sortByScoring = obj._sortByScoring;
        dv._sortDirty = obj._sortDirty;
        dv._resultSet._filteredRows = obj._resultSet._filteredRows;
        dv._resultSet._filterInitialized = obj._resultSet._filterInitialized;
        dv._rematerialize({
            removeWhereFilters: true
        });
        return dv;
    }
    /**
     * Used to clear pipeline and reset dynamic view to initial state.
     * Existing options should be retained.
     * @param {boolean} queueSortPhase - (default: false) if true we will async rebuild view (maybe set default to true in future?)
     */
    removeFilters({ queueSortPhase = false } = {}) {
        this._rebuildPending = false;
        this._resultSet.reset();
        this._resultData = [];
        this._resultDirty = true;
        this._cachedResultSet = null;
        // keep ordered filter pipeline
        this._filterPipeline = [];
        // sorting member variables
        // we only support one active search, applied using applySort() or applySimpleSort()
        this._sortFunction = null;
        this._sortCriteria = null;
        this._sortCriteriaSimple = null;
        this._sortByScoring = null;
        this._sortDirty = false;
        if (queueSortPhase === true) {
            this._queueSortPhase();
        }
    }
    /**
     * Used to apply a sort to the dynamic view
     * @example
     * dv.applySort(function(obj1, obj2) {
       *   if (obj1.name === obj2.name) return 0;
       *   if (obj1.name > obj2.name) return 1;
       *   if (obj1.name < obj2.name) return -1;
       * });
     * @param {function} comparefun - a javascript compare function used for sorting
     * @returns {DynamicView} this DynamicView object, for further chain ops.
     */
    applySort(comparefun) {
        this._sortFunction = comparefun;
        this._sortCriteria = null;
        this._sortCriteriaSimple = null;
        this._sortByScoring = null;
        this._queueSortPhase();
        return this;
    }
    /**
     * Used to specify a property used for view translation.
     * @param {string} field - the field name
     * @param {boolean|object=} options - boolean for sort descending or options object
     * @param {boolean} [options.desc=false] - whether we should sort descending.
     * @param {boolean} [options.disableIndexIntersect=false] - whether we should explicity not use array intersection.
     * @param {boolean} [options.forceIndexIntersect=false] - force array intersection (if binary index exists).
     * @param {boolean} [options.useJavascriptSorting=false] - whether results are sorted via basic javascript sort.
     * @returns {DynamicView} this DynamicView object, for further chain ops.
     * @example
     * dv.applySimpleSort("name");
     */
    applySimpleSort(field, options = false) {
        this._sortCriteriaSimple = { field, options };
        this._sortFunction = null;
        this._sortCriteria = null;
        this._sortByScoring = null;
        this._queueSortPhase();
        return this;
    }
    /**
     * Allows sorting a ResultSet based on multiple columns.
     * @param {Array} criteria - array of property names or subarray of [propertyname, isdesc] used evaluate sort order
     * @returns {DynamicView} Reference to this DynamicView, sorted, for future chain operations.
     * @example
     * // to sort by age and then name (both ascending)
     * dv.applySortCriteria(['age', 'name']);
     * // to sort by age (ascending) and then by name (descending)
     * dv.applySortCriteria(['age', ['name', true]]);
     * // to sort by age (descending) and then by name (descending)
     * dv.applySortCriteria([['age', true], ['name', true]]);
     */
    applySortCriteria(criteria) {
        this._sortCriteria = criteria;
        this._sortCriteriaSimple = null;
        this._sortFunction = null;
        this._sortByScoring = null;
        this._queueSortPhase();
        return this;
    }
    /**
     * Used to apply a sort by the latest full-text-search scoring.
     * @param {boolean} [ascending=false] - sort ascending
     */
    applySortByScoring(ascending = false) {
        this._sortFunction = null;
        this._sortCriteria = null;
        this._sortCriteriaSimple = null;
        this._sortByScoring = ascending;
        this._queueSortPhase();
        return this;
    }
    /**
     * Returns the scoring of the last full-text-search.
     * @returns {ScoreResult[]}
     */
    getScoring() {
        return this._resultSet.getScoring();
    }
    /**
     * Marks the beginning of a transaction.
     * @returns {DynamicView} this DynamicView object, for further chain ops.
     */
    startTransaction() {
        this._cachedResultSet = this._resultSet.copy();
        return this;
    }
    /**
     * Commits a transaction.
     * @returns {DynamicView} this DynamicView object, for further chain ops.
     */
    commit() {
        this._cachedResultSet = null;
        return this;
    }
    /**
     * Rolls back a transaction.
     * @returns {DynamicView} this DynamicView object, for further chain ops.
     */
    rollback() {
        this._resultSet = this._cachedResultSet;
        if (this._persistent) {
            // for now just rebuild the persistent dynamic view data in this worst case scenario
            // (a persistent view utilizing transactions which get rolled back), we already know the filter so not too bad.
            this._resultData = this._resultSet.data();
            this.emit("rebuild", this);
        }
        return this;
    }
    /**
     * Find the index of a filter in the pipeline, by that filter's ID.
     * @param {(string|number)} uid - The unique ID of the filter.
     * @returns {number}: index of the referenced filter in the pipeline; -1 if not found.
     */
    _indexOfFilterWithId(uid) {
        if (typeof uid === "string" || typeof uid === "number") {
            for (let idx = 0, len = this._filterPipeline.length; idx < len; idx++) {
                if (uid === this._filterPipeline[idx].uid) {
                    return idx;
                }
            }
        }
        return -1;
    }
    /**
     * Add the filter object to the end of view's filter pipeline and apply the filter to the ResultSet.
     * @param {object} filter - The filter object. Refer to applyFilter() for extra details.
     */
    _addFilter(filter) {
        this._filterPipeline.push(filter);
        this._resultSet[filter.type](filter.val);
    }
    /**
     * Reapply all the filters in the current pipeline.
     *
     * @returns {DynamicView} this DynamicView object, for further chain ops.
     */
    reapplyFilters() {
        this._resultSet.reset();
        this._cachedResultSet = null;
        if (this._persistent) {
            this._resultData = [];
            this._resultDirty = true;
        }
        const filters = this._filterPipeline;
        this._filterPipeline = [];
        for (let idx = 0, len = filters.length; idx < len; idx++) {
            this._addFilter(filters[idx]);
        }
        if (this._sortFunction || this._sortCriteria || this._sortCriteriaSimple || this._sortByScoring !== null) {
            this._queueSortPhase();
        }
        else {
            this._queueRebuildEvent();
        }
        return this;
    }
    /**
     * Adds or updates a filter in the DynamicView filter pipeline
     * @param {object} filter - A filter object to add to the pipeline.
     *    The object is in the format { 'type': filter_type, 'val', filter_param, 'uid', optional_filter_id }
     * @returns {DynamicView} this DynamicView object, for further chain ops.
     */
    applyFilter(filter) {
        const idx = this._indexOfFilterWithId(filter.uid);
        if (idx >= 0) {
            this._filterPipeline[idx] = filter;
            return this.reapplyFilters();
        }
        this._cachedResultSet = null;
        if (this._persistent) {
            this._resultData = [];
            this._resultDirty = true;
        }
        this._addFilter(filter);
        if (this._sortFunction || this._sortCriteria || this._sortCriteriaSimple || this._sortByScoring !== null) {
            this._queueSortPhase();
        }
        else {
            this._queueRebuildEvent();
        }
        return this;
    }
    /**
     * applyFind() - Adds or updates a mongo-style query option in the DynamicView filter pipeline
     *
     * @param {object} query - A mongo-style query object to apply to pipeline
     * @param {(string|number)} uid - Optional: The unique ID of this filter, to reference it in the future.
     * @returns {DynamicView} this DynamicView object, for further chain ops.
     */
    applyFind(query, uid = "") {
        this.applyFilter({
            type: "find",
            val: query,
            uid
        });
        return this;
    }
    /**
     * Adds or updates a javascript filter function in the DynamicView filter pipeline
     * @param {function} fun - A javascript filter function to apply to pipeline
     * @param {(string|number)} uid - Optional: The unique ID of this filter, to reference it in the future.
     * @returns {DynamicView} this DynamicView object, for further chain ops.
     */
    applyWhere(fun, uid) {
        this.applyFilter({
            type: "where",
            val: fun,
            uid
        });
        return this;
    }
    /**
     * Remove the specified filter from the DynamicView filter pipeline
     * @param {(string|number)} uid - The unique ID of the filter to be removed.
     * @returns {DynamicView} this DynamicView object, for further chain ops.
     */
    removeFilter(uid) {
        const idx = this._indexOfFilterWithId(uid);
        if (idx < 0) {
            throw new Error("Dynamic view does not contain a filter with ID: " + uid);
        }
        this._filterPipeline.splice(idx, 1);
        this.reapplyFilters();
        return this;
    }
    /**
     * Returns the number of documents representing the current DynamicView contents.
     * @returns {number} The number of documents representing the current DynamicView contents.
     */
    count() {
        // in order to be accurate we will pay the minimum cost (and not alter dv state management)
        // recurring ResultSet data resolutions should know internally its already up to date.
        // for persistent data this will not update resultdata nor fire rebuild event.
        if (this._resultDirty) {
            this._resultData = this._resultSet.data();
        }
        return this._resultSet.count();
    }
    /**
     * Resolves and pending filtering and sorting, then returns document array as result.
     * @param {object} options - optional parameters to pass to ResultSet.data() if non-persistent
     * @param {boolean} [options.forceClones] - Allows forcing the return of cloned objects even when
     *        the collection is not configured for clone object.
     * @param {string} [options.forceCloneMethod] - Allows overriding the default or collection specified cloning method.
     *        Possible values include 'parse-stringify', 'jquery-extend-deep', 'shallow', 'shallow-assign'
     * @param {boolean} [options.removeMeta] - will force clones and strip $loki and meta properties from documents
     *
     * @returns {Array} An array of documents representing the current DynamicView contents.
     */
    data(options = {}) {
        // using final sort phase as 'catch all' for a few use cases which require full rebuild
        if (this._sortDirty || this._resultDirty) {
            this._performSortPhase({
                suppressRebuildEvent: true
            });
        }
        return (this._persistent) ? (this._resultData) : (this._resultSet.data(options));
    }
    /**
     * When the view is not sorted we may still wish to be notified of rebuild events.
     * This event will throttle and queue a single rebuild event when batches of updates affect the view.
     */
    _queueRebuildEvent() {
        if (this._rebuildPending) {
            return;
        }
        this._rebuildPending = true;
        setTimeout(() => {
            if (this._rebuildPending) {
                this._rebuildPending = false;
                this.emit("rebuild", this);
            }
        }, this._minRebuildInterval);
    }
    /**
     * If the view is sorted we will throttle sorting to either :
     * (1) passive - when the user calls data(), or
     * (2) active - once they stop updating and yield js thread control
     */
    _queueSortPhase() {
        // already queued? exit without queuing again
        if (this._sortDirty) {
            return;
        }
        this._sortDirty = true;
        if (this._sortPriority === "active") {
            // active sorting... once they are done and yield js thread, run async performSortPhase()
            setTimeout(() => {
                this._performSortPhase();
            }, this._minRebuildInterval);
        }
        else {
            // must be passive sorting... since not calling performSortPhase (until data call), lets use queueRebuildEvent to
            // potentially notify user that data has changed.
            this._queueRebuildEvent();
        }
    }
    /**
     * Invoked synchronously or asynchronously to perform final sort phase (if needed)
     */
    _performSortPhase(options = {}) {
        // async call to this may have been pre-empted by synchronous call to data before async could fire
        if (!this._sortDirty && !this._resultDirty) {
            return;
        }
        if (this._sortDirty) {
            if (this._sortFunction) {
                this._resultSet.sort(this._sortFunction);
            }
            else if (this._sortCriteria) {
                this._resultSet.compoundsort(this._sortCriteria);
            }
            else if (this._sortCriteriaSimple) {
                this._resultSet.simplesort(this._sortCriteriaSimple.field, this._sortCriteriaSimple.options);
            }
            else if (this._sortByScoring !== null) {
                this._resultSet.sortByScoring(this._sortByScoring);
            }
            this._sortDirty = false;
        }
        if (this._persistent) {
            // persistent view, rebuild local resultdata array
            this._resultData = this._resultSet.data();
            this._resultDirty = false;
        }
        if (!options.suppressRebuildEvent) {
            this.emit("rebuild", this);
        }
    }
    /**
     * (Re)evaluating document inclusion.
     * Called by : collection.insert() and collection.update().
     * @param {int} objIndex - index of document to (re)run through filter pipeline.
     * @param {boolean} isNew - true if the document was just added to the collection.
     * @hidden
     */
    _evaluateDocument(objIndex, isNew) {
        // if no filter applied yet, the result 'set' should remain 'everything'
        if (!this._resultSet._filterInitialized) {
            if (this._persistent) {
                this._resultData = this._resultSet.data();
            }
            // need to re-sort to sort new document
            if (this._sortFunction || this._sortCriteria || this._sortCriteriaSimple) {
                this._queueSortPhase();
            }
            else {
                this._queueRebuildEvent();
            }
            return;
        }
        const ofr = this._resultSet._filteredRows;
        const oldPos = (isNew) ? (-1) : (ofr.indexOf(+objIndex));
        const oldlen = ofr.length;
        // creating a 1-element ResultSet to run filter chain ops on to see if that doc passes filters;
        // mostly efficient algorithm, slight stack overhead price (this function is called on inserts and updates)
        const evalResultSet = new result_set_ResultSet(this._collection);
        evalResultSet._filteredRows = [objIndex];
        evalResultSet._filterInitialized = true;
        let filter;
        for (let idx = 0, len = this._filterPipeline.length; idx < len; idx++) {
            filter = this._filterPipeline[idx];
            evalResultSet[filter.type](filter.val);
        }
        // not a true position, but -1 if not pass our filter(s), 0 if passed filter(s)
        const newPos = (evalResultSet._filteredRows.length === 0) ? -1 : 0;
        // wasn't in old, shouldn't be now... do nothing
        if (oldPos === -1 && newPos === -1)
            return;
        // wasn't in ResultSet, should be now... add
        if (oldPos === -1 && newPos !== -1) {
            ofr.push(objIndex);
            if (this._persistent) {
                this._resultData.push(this._collection._data[objIndex]);
            }
            // need to re-sort to sort new document
            if (this._sortFunction || this._sortCriteria || this._sortCriteriaSimple) {
                this._queueSortPhase();
            }
            else {
                this._queueRebuildEvent();
            }
            return;
        }
        // was in ResultSet, shouldn't be now... delete
        if (oldPos !== -1 && newPos === -1) {
            if (oldPos < oldlen - 1) {
                ofr.splice(oldPos, 1);
                if (this._persistent) {
                    this._resultData.splice(oldPos, 1);
                }
            }
            else {
                ofr.length = oldlen - 1;
                if (this._persistent) {
                    this._resultData.length = oldlen - 1;
                }
            }
            // in case changes to data altered a sort column
            if (this._sortFunction || this._sortCriteria || this._sortCriteriaSimple) {
                this._queueSortPhase();
            }
            else {
                this._queueRebuildEvent();
            }
            return;
        }
        // was in ResultSet, should still be now... (update persistent only?)
        if (oldPos !== -1 && newPos !== -1) {
            if (this._persistent) {
                // in case document changed, replace persistent view data with the latest collection._data document
                this._resultData[oldPos] = this._collection._data[objIndex];
            }
            // in case changes to data altered a sort column
            if (this._sortFunction || this._sortCriteria || this._sortCriteriaSimple) {
                this._queueSortPhase();
            }
            else {
                this._queueRebuildEvent();
            }
        }
    }
    /**
     * Internal function called on collection.delete().
     * @hidden
     */
    _removeDocument(objIndex) {
        // if no filter applied yet, the result 'set' should remain 'everything'
        if (!this._resultSet._filterInitialized) {
            if (this._persistent) {
                this._resultData = this._resultSet.data();
            }
            // in case changes to data altered a sort column
            if (this._sortFunction || this._sortCriteria || this._sortCriteriaSimple) {
                this._queueSortPhase();
            }
            else {
                this._queueRebuildEvent();
            }
            return;
        }
        const ofr = this._resultSet._filteredRows;
        const oldPos = ofr.indexOf(+objIndex);
        let oldlen = ofr.length;
        if (oldPos !== -1) {
            // if not last row in resultdata, swap last to hole and truncate last row
            if (oldPos < oldlen - 1) {
                ofr[oldPos] = ofr[oldlen - 1];
                ofr.length = oldlen - 1;
                if (this._persistent) {
                    this._resultData[oldPos] = this._resultData[oldlen - 1];
                    this._resultData.length = oldlen - 1;
                }
            }
            // last row, so just truncate last row
            else {
                ofr.length = oldlen - 1;
                if (this._persistent) {
                    this._resultData.length = oldlen - 1;
                }
            }
            // in case changes to data altered a sort column
            if (this._sortFunction || this._sortCriteria || this._sortCriteriaSimple) {
                this._queueSortPhase();
            }
            else {
                this._queueRebuildEvent();
            }
        }
        // since we are using filteredRows to store data array positions
        // if they remove a document (whether in our view or not),
        // we need to adjust array positions -1 for all document array references after that position
        oldlen = ofr.length;
        for (let idx = 0; idx < oldlen; idx++) {
            if (ofr[idx] > objIndex) {
                ofr[idx]--;
            }
        }
    }
    /**
     * Data transformation via user supplied functions
     * @param {function} mapFunction - this function accepts a single document for you to transform and return
     * @param {function} reduceFunction - this function accepts many (array of map outputs) and returns single value
     * @returns The output of your reduceFunction
     */
    mapReduce(mapFunction, reduceFunction) {
        try {
            return reduceFunction(this.data().map(mapFunction));
        }
        catch (err) {
            throw err;
        }
    }
}

// EXTERNAL MODULE: ./packages/loki/src/ranged_indexes.ts + 1 modules
var ranged_indexes = __webpack_require__(4);

// EXTERNAL MODULE: ./packages/common/plugin.ts
var common_plugin = __webpack_require__(1);

// CONCATENATED MODULE: ./packages/loki/src/collection.ts
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return collection_Collection; });








function average(array) {
    return (array.reduce((a, b) => a + b, 0)) / array.length;
}
function standardDeviation(values) {
    const avg = average(values);
    const squareDiffs = values.map((value) => {
        const diff = value - avg;
        return diff * diff;
    });
    const avgSquareDiff = average(squareDiffs);
    return Math.sqrt(avgSquareDiff);
}
/**
 * Returns an array with the value of a nested property of an object.
 * Returns an array of values if the nested property is across child arrays.
 * @param {object} obj - the object
 * @param {string[]} path - the path of the nested property
 * @param {any[]} array - the result array
 * @param {number} pathIdx - the current path idx
 * @returns {boolean} true if nested property is across child arrays, otherwise false
 */
function getNestedPropertyValue(obj, path, array, pathIdx = 0) {
    if (obj === undefined) {
        return false;
    }
    if (pathIdx + 1 === path.length) {
        array.push(obj[path[pathIdx]]);
        return false;
    }
    const curr = obj[path[pathIdx]];
    if (Array.isArray(curr)) {
        for (let i = 0; i < curr.length; i++) {
            getNestedPropertyValue(curr[i], path, array, pathIdx + 1);
        }
        return true;
    }
    else {
        return getNestedPropertyValue(curr, path, array, pathIdx + 1);
    }
}
/**
 * Collection class that handles documents of same type
 * @extends LokiEventEmitter
 * @param <TData> - the data type
 * @param <TNested> - nested properties of data type
 */
class collection_Collection extends event_emitter["a" /* LokiEventEmitter */] {
    /**
     * @param {string} name - collection name
     * @param {(object)} [options={}] - a configuration object
     * @param {string[]} [options.unique=[]] - array of property names to define unique constraints for
     * @param {string[]} [options.exact=[]] - array of property names to define exact constraints for
     * @param {RangedIndexOptions} [options.rangedIndexes] - configuration object for ranged indexes
     * @param {boolean} [options.asyncListeners=false] - whether listeners are invoked asynchronously
     * @param {boolean} [options.disableMeta=false] - set to true to disable meta property on documents
     * @param {boolean} [options.disableChangesApi=true] - set to false to enable Changes API
     * @param {boolean} [options.disableDeltaChangesApi=true] - set to false to enable Delta Changes API (requires Changes API, forces cloning)
     * @param {boolean} [options.clone=false] - specify whether inserts and queries clone to/from user
     * @param {boolean} [options.serializableIndexes=true] - converts date values on binary indexed property values are serializable
     * @param {string} [options.cloneMethod="deep"] - the clone method
     * @param {number} [options.transactional=false] - ?
     * @param {number} [options.ttl=] - age of document (in ms.) before document is considered aged/stale.
     * @param {number} [options.ttlInterval=] - time interval for clearing out 'aged' documents; not set by default
     * @param {string} [options.unindexedSortComparator="js"] "js", "abstract", "abstract-date", "loki" or other registered comparator name
     * @param {string} [options.defaultLokiOperatorPackage="js"] "js", "loki", "comparator" (or user defined) query ops package
     * @param {FullTextSearch.FieldOptions} [options.fullTextSearch=] - the full-text search options
     * @see {@link Loki#addCollection} for normal creation of collections
     */
    constructor(name, options = {}) {
        super();
        // the data held by the collection
        this._data = [];
        // index of id
        this._idIndex = [];
        // user defined indexes
        this._rangedIndexes = {};
        // loki obj map
        this._lokimap = {};
        // default comparator name to use for unindexed sorting
        this._unindexedSortComparator = "js";
        // default LokiOperatorPackage ('default' uses fastest 'javascript' comparisons)
        this._defaultLokiOperatorPackage = "js";
        /**
         * Unique constraints contain duplicate object references, so they are not persisted.
         * We will keep track of properties which have unique constraints applied here, and regenerate on load.
         */
        this._constraints = { unique: {} };
        /**
         * Transforms will be used to store frequently used query chains as a series of steps which itself can be stored along
         * with the database.
         */
        this._transforms = {};
        /**
         * In autosave scenarios we will use collection level dirty flags to determine whether save is needed.
         * currently, if any collection is dirty we will autosave the whole database if autosave is configured.
         * Defaulting to true since this is called from addCollection and adding a collection should trigger save.
         */
        this._dirty = true;
        // private holder for cached data
        this._cached = null;
        /**
         * Name of path of used nested properties.
         */
        this._nestedProperties = [];
        /**
         * Option to activate a cleaner daemon - clears "aged" documents at set intervals.
         */
        this._ttl = {
            age: null,
            ttlInterval: null,
            daemon: null
        };
        // currentMaxId - change manually at your own peril!
        this._maxId = 0;
        this._dynamicViews = [];
        /**
         * Changes are tracked by collection and aggregated by the db.
         */
        this._changes = [];
        /**
         * stages: a map of uniquely identified 'stages', which hold copies of objects to be
         * manipulated without affecting the data in the original collection
         */
        this._stages = {};
        this._commitLog = [];
        // Consistency checks.
        if (options && options.disableMeta === true) {
            if (options.disableChangesApi === false) {
                throw new Error("disableMeta option cannot be passed as true when disableChangesApi is passed as false");
            }
            if (options.disableDeltaChangesApi === false) {
                throw new Error("disableMeta option cannot be passed as true when disableDeltaChangesApi is passed as false");
            }
            if (typeof options.ttl === "number" && options.ttl > 0) {
                throw new Error("disableMeta option cannot be passed as true when ttl is enabled");
            }
        }
        // the name of the collection
        this.name = name;
        /* OPTIONS */
        this._unindexedSortComparator = options.unindexedSortComparator || "js";
        this._defaultLokiOperatorPackage = options.defaultLokiOperatorPackage || "js";
        // exact match and unique constraints
        if (options.unique !== undefined) {
            if (!Array.isArray(options.unique)) {
                options.unique = [options.unique];
            }
            options.unique.forEach((prop) => {
                this._constraints.unique[prop] = new UniqueIndex(prop);
            });
        }
        // Full text search
        if (common_plugin["a" /* PLUGINS */]["FullTextSearch"] !== undefined) {
            this._fullTextSearch = options.fullTextSearch !== undefined
                ? new (common_plugin["a" /* PLUGINS */]["FullTextSearch"])(options.fullTextSearch) : null;
        }
        else {
            this._fullTextSearch = null;
        }
        // .
        this._transactional = options.transactional !== undefined ? options.transactional : false;
        // .
        this._cloneObjects = options.clone !== undefined ? options.clone : false;
        // .
        this._asyncListeners = options.asyncListeners !== undefined ? options.asyncListeners : false;
        // .
        this._disableMeta = options.disableMeta !== undefined ? options.disableMeta : false;
        // .
        this._disableChangesApi = options.disableChangesApi !== undefined ? options.disableChangesApi : true;
        // .
        this._disableDeltaChangesApi = options.disableDeltaChangesApi !== undefined ? options.disableDeltaChangesApi : true;
        // .
        this._cloneMethod = options.cloneMethod !== undefined ? options.cloneMethod : "deep";
        if (this._disableChangesApi) {
            this._disableDeltaChangesApi = true;
        }
        // .
        this._serializableIndexes = options.serializableIndexes !== undefined ? options.serializableIndexes : true;
        // .
        if (options.nestedProperties != undefined) {
            for (let i = 0; i < options.nestedProperties.length; i++) {
                const nestedProperty = options.nestedProperties[i];
                if (typeof nestedProperty === "string") {
                    this._nestedProperties.push({ name: nestedProperty, path: nestedProperty.split(".") });
                }
                else {
                    this._nestedProperties.push(nestedProperty);
                }
            }
        }
        this.setTTL(options.ttl || -1, options.ttlInterval);
        // events
        this._events = {
            "insert": [],
            "update": [],
            "pre-insert": [],
            "pre-update": [],
            "close": [],
            "flushbuffer": [],
            "error": [],
            "delete": [],
            "warning": []
        };
        // initialize the id index
        this._ensureId();
        let rangedIndexes = options.rangedIndexes || {};
        for (let ri in rangedIndexes) {
            // Todo: any way to type annotate this as typesafe generic?
            this.ensureRangedIndex(ri, rangedIndexes[ri].indexTypeName, rangedIndexes[ri].comparatorName);
        }
        this.setChangesApi(this._disableChangesApi, this._disableDeltaChangesApi);
        // for de-serialization purposes
        this.flushChanges();
    }
    toJSON() {
        return {
            name: this.name,
            unindexedSortComparator: this._unindexedSortComparator,
            defaultLokiOperatorPackage: this._defaultLokiOperatorPackage,
            _dynamicViews: this._dynamicViews,
            uniqueNames: Object.keys(this._constraints.unique),
            transforms: this._transforms,
            rangedIndexes: this._rangedIndexes,
            _data: this._data,
            idIndex: this._idIndex,
            maxId: this._maxId,
            _dirty: this._dirty,
            _nestedProperties: this._nestedProperties,
            transactional: this._transactional,
            asyncListeners: this._asyncListeners,
            disableMeta: this._disableMeta,
            disableChangesApi: this._disableChangesApi,
            disableDeltaChangesApi: this._disableDeltaChangesApi,
            cloneObjects: this._cloneObjects,
            cloneMethod: this._cloneMethod,
            changes: this._changes,
            _fullTextSearch: this._fullTextSearch
        };
    }
    static fromJSONObject(obj, options) {
        // instantiate collection with options needed by constructor
        let coll = new collection_Collection(obj.name, {
            disableChangesApi: obj.disableChangesApi,
            disableDeltaChangesApi: obj.disableDeltaChangesApi,
            unindexedSortComparator: obj.unindexedSortComparator,
            defaultLokiOperatorPackage: obj.defaultLokiOperatorPackage
        });
        coll._transactional = obj.transactional;
        coll._asyncListeners = obj.asyncListeners;
        coll._disableMeta = obj.disableMeta;
        coll._disableChangesApi = obj.disableChangesApi;
        coll._cloneObjects = obj.cloneObjects;
        coll._cloneMethod = obj.cloneMethod || "deep";
        coll._changes = obj.changes;
        coll._nestedProperties = obj._nestedProperties;
        coll._rangedIndexes = obj.rangedIndexes || {};
        coll._dirty = (options && options.retainDirtyFlags === true) ? obj._dirty : false;
        function makeLoader(coll) {
            const collOptions = options[coll.name];
            if (collOptions.proto) {
                const inflater = collOptions.inflate || ((src, dest) => {
                    for (let prop in src) {
                        dest[prop] = src[prop];
                    }
                });
                return (data) => {
                    const collObj = new (collOptions.proto)();
                    inflater(data, collObj);
                    return collObj;
                };
            }
            return collOptions.inflate;
        }
        // load each element individually
        if (options && options[obj.name] !== undefined) {
            let loader = makeLoader(obj);
            for (let j = 0; j < obj._data.length; j++) {
                coll._data[j] = coll._defineNestedProperties(loader(obj._data[j]));
                // regenerate lokimap
                coll._lokimap[coll._data[j].$loki] = coll._data[j];
            }
        }
        else {
            for (let j = 0; j < obj._data.length; j++) {
                coll._data[j] = coll._defineNestedProperties(obj._data[j]);
                // regenerate lokimap
                coll._lokimap[coll._data[j].$loki] = coll._data[j];
            }
        }
        coll._maxId = (obj.maxId === undefined) ? 0 : obj.maxId;
        coll._idIndex = obj.idIndex;
        if (obj.transforms !== undefined) {
            coll._transforms = obj.transforms;
        }
        // inflate rangedindexes
        for (let ri in obj.rangedIndexes) {
            // shortcut reference to serialized meta
            let sri = obj.rangedIndexes[ri];
            // lookup index factory function in map based on index type name
            let rif = ranged_indexes["a" /* RangedIndexFactoryMap */][sri.indexTypeName];
            // lookup comparator function in map based on comparator name
            let ricmp = comparators["a" /* ComparatorMap */][sri.comparatorName];
            // using index type (from meta), index factory and comparator... create instance of ranged index
            let rii = rif(ri, ricmp);
            // now ask new index instance to inflate from plain object
            rii.restore(sri.index);
            // attach class instance to our collection's ranged index's (index) instance property
            coll._rangedIndexes[ri].index = rii;
        }
        coll._ensureId();
        // regenerate unique indexes
        if (obj.uniqueNames !== undefined) {
            for (let j = 0; j < obj.uniqueNames.length; j++) {
                coll.ensureUniqueIndex(obj.uniqueNames[j]);
            }
        }
        // in case they are loading a database created before we added dynamic views, handle undefined
        if (obj._dynamicViews !== undefined) {
            // reinflate DynamicViews and attached ResultSets
            for (let idx = 0; idx < obj._dynamicViews.length; idx++) {
                coll._dynamicViews.push(dynamic_view_DynamicView.fromJSONObject(coll, obj._dynamicViews[idx]));
            }
        }
        if (obj._fullTextSearch) {
            coll._fullTextSearch = common_plugin["a" /* PLUGINS */]["FullTextSearch"].fromJSONObject(obj._fullTextSearch, options.fullTextSearch);
        }
        return coll;
    }
    /**
     * Adds a named collection transform to the collection
     * @param {string} name - name to associate with transform
     * @param {array} transform - an array of transformation 'step' objects to save into the collection
     */
    addTransform(name, transform) {
        if (this._transforms[name] !== undefined) {
            throw new Error("a transform by that name already exists");
        }
        this._transforms[name] = transform;
    }
    /**
     * Retrieves a named transform from the collection.
     * @param {string} name - name of the transform to lookup.
     */
    getTransform(name) {
        return this._transforms[name];
    }
    /**
     * Updates a named collection transform to the collection
     * @param {string} name - name to associate with transform
     * @param {object} transform - a transformation object to save into collection
     */
    setTransform(name, transform) {
        this._transforms[name] = transform;
    }
    /**
     * Removes a named collection transform from the collection
     * @param {string} name - name of collection transform to remove
     */
    removeTransform(name) {
        delete this._transforms[name];
    }
    /*----------------------------+
     | TTL                        |
     +----------------------------*/
    setTTL(age, interval) {
        if (age < 0) {
            clearInterval(this._ttl.daemon);
        }
        else {
            this._ttl.age = age;
            this._ttl.ttlInterval = interval;
            this._ttl.daemon = setInterval(() => {
                const now = Date.now();
                const toRemove = this.chain().where((member) => {
                    const timestamp = member.meta.updated || member.meta.created;
                    const diff = now - timestamp;
                    return this._ttl.age < diff;
                });
                toRemove.remove();
            }, interval);
        }
    }
    /*----------------------------+
     | INDEXING                   |
     +----------------------------*/
    /**
     * Create a row filter that covers all documents in the collection.
     */
    _prepareFullDocIndex() {
        const indexes = new Array(this._data.length);
        for (let i = 0; i < indexes.length; i++) {
            indexes[i] = i;
        }
        return indexes;
    }
    /**
     * Ensure rangedIndex of a field.
     * @param field
     * @param indexTypeName
     * @param comparatorName
     */
    ensureIndex(field, indexTypeName, comparatorName) {
        this.ensureRangedIndex(field, indexTypeName, comparatorName);
    }
    /**
     * Ensure rangedIndex of a field.
     * @param field Property to create an index on (need to look into contraining on keyof T)
     * @param indexTypeName Name of IndexType factory within (global?) hashmap to create IRangedIndex from
     * @param comparatorName Name of Comparator within (global?) hashmap
     */
    ensureRangedIndex(field, indexTypeName, comparatorName) {
        indexTypeName = indexTypeName || "avl";
        comparatorName = comparatorName || "loki";
        if (!ranged_indexes["a" /* RangedIndexFactoryMap */][indexTypeName]) {
            throw new Error("ensureRangedIndex: Unknown range index type");
        }
        if (!comparators["a" /* ComparatorMap */][comparatorName]) {
            throw new Error("ensureRangedIndex: Unknown comparator");
        }
        let rif = ranged_indexes["a" /* RangedIndexFactoryMap */][indexTypeName];
        let comparator = comparators["a" /* ComparatorMap */][comparatorName];
        this._rangedIndexes[field] = {
            index: rif(field, comparator),
            indexTypeName: indexTypeName,
            comparatorName: comparatorName
        };
        let rii = this._rangedIndexes[field].index;
        for (let i = 0; i < this._data.length; i++) {
            rii.insert(this._data[i].$loki, this._data[i][field]);
        }
    }
    ensureUniqueIndex(field) {
        let index = new UniqueIndex(field);
        // if index already existed, (re)loading it will likely cause collisions, rebuild always
        this._constraints.unique[field] = index;
        for (let i = 0; i < this._data.length; i++) {
            index.set(this._data[i].$loki, this._data[i][field]);
        }
        return index;
    }
    /**
     * Quickly determine number of documents in collection (or query)
     * @param {object} query - (optional) query object to count results of
     * @returns {number} number of documents in the collection
     */
    count(query) {
        if (!query) {
            return this._data.length;
        }
        return this.chain().find(query)._filteredRows.length;
    }
    /**
     * Rebuild idIndex
     */
    _ensureId() {
        this._idIndex = [];
        for (let i = 0; i < this._data.length; i++) {
            this._idIndex.push(this._data[i].$loki);
        }
    }
    /**
     * Add a dynamic view to the collection
     * @param {string} name - name of dynamic view to add
     * @param {object} options - (optional) options to configure dynamic view with
     * @param {boolean} [options.persistent=false] - indicates if view is to main internal results array in 'resultdata'
     * @param {string} [options.sortPriority=SortPriority.PASSIVE] - the sort priority
     * @param {number} options.minRebuildInterval - minimum rebuild interval (need clarification to docs here)
     * @returns {DynamicView} reference to the dynamic view added
     **/
    addDynamicView(name, options) {
        const dv = new dynamic_view_DynamicView(this, name, options);
        this._dynamicViews.push(dv);
        return dv;
    }
    /**
     * Remove a dynamic view from the collection
     * @param {string} name - name of dynamic view to remove
     **/
    removeDynamicView(name) {
        for (let idx = 0; idx < this._dynamicViews.length; idx++) {
            if (this._dynamicViews[idx].name === name) {
                this._dynamicViews.splice(idx, 1);
            }
        }
    }
    /**
     * Look up dynamic view reference from within the collection
     * @param {string} name - name of dynamic view to retrieve reference of
     * @returns {DynamicView} A reference to the dynamic view with that name
     **/
    getDynamicView(name) {
        for (let idx = 0; idx < this._dynamicViews.length; idx++) {
            if (this._dynamicViews[idx].name === name) {
                return this._dynamicViews[idx];
            }
        }
        return null;
    }
    /**
     * Applies a 'mongo-like' find query object and passes all results to an update function.
     * @param {object} filterObject - the 'mongo-like' query object
     * @param {function} updateFunction - the update function
     */
    findAndUpdate(filterObject, updateFunction) {
        this.chain().find(filterObject).update(updateFunction);
    }
    /**
     * Applies a 'mongo-like' find query object removes all documents which match that filter.
     * @param {object} filterObject - 'mongo-like' query object
     */
    findAndRemove(filterObject) {
        this.chain().find(filterObject).remove();
    }
    insert(doc) {
        if (!Array.isArray(doc)) {
            return this.insertOne(doc);
        }
        // holder to the clone of the object inserted if collections is set to clone objects
        let obj;
        let results = [];
        this.emit("pre-insert", doc);
        for (let i = 0; i < doc.length; i++) {
            obj = this.insertOne(doc[i], true);
            if (!obj) {
                return undefined;
            }
            results.push(obj);
        }
        // at the 'batch' level, if clone option is true then emitted docs are clones
        this.emit("insert", results);
        // if clone option is set, clone return values
        results = this._cloneObjects ? clone(results, this._cloneMethod) : results;
        return results.length === 1 ? results[0] : results;
    }
    /**
     * Adds a single object, ensures it has meta properties, clone it if necessary, etc.
     * @param {object} doc - the document to be inserted
     * @param {boolean} bulkInsert - quiet pre-insert and insert event emits
     * @returns {object} document or 'undefined' if there was a problem inserting it
     */
    insertOne(doc, bulkInsert = false) {
        let err = null;
        let returnObj;
        if (typeof doc !== "object") {
            err = new TypeError("Document needs to be an object");
        }
        else if (doc === null) {
            err = new TypeError("Object cannot be null");
        }
        if (err !== null) {
            this.emit("error", err);
            throw err;
        }
        // if configured to clone, do so now... otherwise just use same obj reference
        const obj = this._defineNestedProperties(this._cloneObjects ? clone(doc, this._cloneMethod) : doc);
        if (!this._disableMeta && obj.meta === undefined) {
            obj.meta = {
                version: 0,
                revision: 0,
                created: 0
            };
        }
        // both 'pre-insert' and 'insert' events are passed internal data reference even when cloning
        // insert needs internal reference because that is where loki itself listens to add meta
        if (!bulkInsert) {
            this.emit("pre-insert", obj);
        }
        if (!this._add(obj)) {
            return undefined;
        }
        // update meta and store changes if ChangesAPI is enabled
        // (moved from "insert" event listener to allow internal reference to be used)
        if (this._disableChangesApi) {
            this._insertMeta(obj);
        }
        else {
            this._insertMetaWithChange(obj);
        }
        // if cloning is enabled, emit insert event with clone of new object
        returnObj = this._cloneObjects ? clone(obj, this._cloneMethod) : obj;
        if (!bulkInsert) {
            this.emit("insert", returnObj);
        }
        return returnObj;
    }
    /**
     * Refers nested properties of an object to the root of it.
     * @param {T} data - the object
     * @returns {T & TNested} the object with nested properties
     * @hidden
     */
    _defineNestedProperties(data) {
        for (let i = 0; i < this._nestedProperties.length; i++) {
            const name = this._nestedProperties[i].name;
            const path = this._nestedProperties[i].path;
            Object.defineProperty(data, name, {
                get() {
                    // Get the value of the nested property.
                    const array = [];
                    if (getNestedPropertyValue(this, path, array)) {
                        return array;
                    }
                    else {
                        return array[0];
                    }
                },
                set(val) {
                    // Set the value of the nested property.
                    path.slice(0, path.length - 1).reduce((obj, part) => (obj && obj[part]) ? obj[part] : null, this)[path[path.length - 1]] = val;
                },
                enumerable: false,
                configurable: true
            });
        }
        return data;
    }
    /**
     * Empties the collection.
     * @param {boolean} [removeIndices=false] - remove indices
     */
    clear({ removeIndices: removeIndices = false } = {}) {
        this._data = [];
        this._idIndex = [];
        this._cached = null;
        this._maxId = 0;
        this._dynamicViews = [];
        this._dirty = true;
        // if removing indices entirely
        if (removeIndices === true) {
            this._rangedIndexes = {};
            this._constraints = {
                unique: {}
            };
        }
        // clear indices but leave definitions in place
        else {
            // re-instance ranged indexes
            for (let ri in this._rangedIndexes) {
                this.ensureRangedIndex(ri, this._rangedIndexes[ri].indexTypeName, this._rangedIndexes[ri].comparatorName);
            }
            // clear entire unique indices definition
            const uniqueNames = Object.keys(this._constraints.unique);
            for (let i = 0; i < uniqueNames.length; i++) {
                this._constraints.unique[uniqueNames[i]].clear();
            }
        }
        if (this._fullTextSearch !== null) {
            this._fullTextSearch.clear();
        }
    }
    /**
     * Updates an object and notifies collection that the document has changed.
     * @param {object} doc - document to update within the collection
     */
    update(doc) {
        if (Array.isArray(doc)) {
            for (let i = 0; i < doc.length; i++) {
                this.update(doc[i]);
            }
            return;
        }
        // Verify object is a properly formed document.
        if (doc.$loki === undefined) {
            throw new Error("Trying to update unsynced document. Please save the document first by using insert() or addMany()");
        }
        try {
            this.startTransaction();
            const arr = this.get(doc.$loki, true);
            if (!arr) {
                throw new Error("Trying to update a document not in collection.");
            }
            // ref to existing obj
            let oldInternal = arr[0]; // -internal- obj ref
            let position = arr[1]; // position in data array
            // ref to new internal obj
            // if configured to clone, do so now... otherwise just use same obj reference
            let newInternal = this._defineNestedProperties(this._cloneObjects || !this._disableDeltaChangesApi ? clone(doc, this._cloneMethod) : doc);
            this.emit("pre-update", doc);
            Object.keys(this._constraints.unique).forEach((key) => {
                this._constraints.unique[key].update(newInternal.$loki, newInternal[key]);
            });
            // operate the update
            this._data[position] = newInternal;
            this._lokimap[doc.$loki] = newInternal;
            // now that we can efficiently determine the data[] position of newly added document,
            // submit it for all registered DynamicViews to evaluate for inclusion/exclusion
            for (let idx = 0; idx < this._dynamicViews.length; idx++) {
                this._dynamicViews[idx]._evaluateDocument(position, false);
            }
            // Notify all ranged indexes of (possible) value update
            for (let ri in this._rangedIndexes) {
                this._rangedIndexes[ri].index.update(doc.$loki, doc[ri]);
            }
            this._idIndex[position] = newInternal.$loki;
            // FullTextSearch.
            if (this._fullTextSearch !== null) {
                this._fullTextSearch.updateDocument(doc, position);
            }
            this.commit();
            this._dirty = true; // for autosave scenarios
            // update meta and store changes if ChangesAPI is enabled
            if (this._disableChangesApi) {
                this._updateMeta(newInternal);
            }
            else {
                this._updateMetaWithChange(newInternal, oldInternal);
            }
            let returnObj = newInternal;
            // if cloning is enabled, emit 'update' event and return with clone of new object
            if (this._cloneObjects) {
                returnObj = clone(newInternal, this._cloneMethod);
            }
            this.emit("update", returnObj, oldInternal);
        }
        catch (err) {
            this.rollback();
            this.emit("error", err);
            throw (err); // re-throw error so user does not think it succeeded
        }
    }
    /**
     * Add object to collection
     */
    _add(obj) {
        // if parameter isn't object exit with throw
        if ("object" !== typeof obj) {
            throw new TypeError("Object being added needs to be an object");
        }
        // if object you are adding already has id column it is either already in the collection
        // or the object is carrying its own 'id' property.  If it also has a meta property,
        // then this is already in collection so throw error, otherwise rename to originalId and continue adding.
        if (obj["$loki"] !== undefined) {
            throw new Error("Document is already in collection, please use update()");
        }
        /*
         * try adding object to collection
         */
        try {
            this.startTransaction();
            this._maxId++;
            if (isNaN(this._maxId)) {
                this._maxId = (this._data[this._data.length - 1].$loki + 1);
            }
            const newDoc = obj;
            newDoc.$loki = this._maxId;
            if (!this._disableMeta) {
                newDoc.meta.version = 0;
            }
            const constrUnique = this._constraints.unique;
            for (const key in constrUnique) {
                if (constrUnique[key] !== undefined) {
                    constrUnique[key].set(newDoc.$loki, newDoc[key]);
                }
            }
            // add new obj id to idIndex
            this._idIndex.push(newDoc.$loki);
            // update lokimap
            this._lokimap[newDoc.$loki] = newDoc;
            // add the object
            this._data.push(newDoc);
            const addedPos = this._data.length - 1;
            // now that we can efficiently determine the data[] position of newly added document,
            // submit it for all registered DynamicViews to evaluate for inclusion/exclusion
            const dvlen = this._dynamicViews.length;
            for (let i = 0; i < dvlen; i++) {
                this._dynamicViews[i]._evaluateDocument(addedPos, true);
            }
            // add id/val kvp to ranged index
            for (let ri in this._rangedIndexes) {
                // ensure Dates are converted to unix epoch time if serializableIndexes is true
                if (this._serializableIndexes && newDoc[ri] instanceof Date) {
                    newDoc[ri] = newDoc[ri].getTime();
                }
                this._rangedIndexes[ri].index.insert(obj["$loki"], obj[ri]);
            }
            // FullTextSearch.
            if (this._fullTextSearch !== null) {
                this._fullTextSearch.addDocument(newDoc, addedPos);
            }
            this.commit();
            this._dirty = true; // for autosave scenarios
            return (this._cloneObjects) ? (clone(newDoc, this._cloneMethod)) : (newDoc);
        }
        catch (err) {
            this.rollback();
            this.emit("error", err);
            throw (err); // re-throw error so user does not think it succeeded
        }
    }
    /**
     * Applies a filter function and passes all results to an update function.
     * @param {function} filterFunction - the filter function
     * @param {function} updateFunction - the update function
     */
    updateWhere(filterFunction, updateFunction) {
        const results = this.where(filterFunction);
        try {
            for (let i = 0; i < results.length; i++) {
                this.update(updateFunction(results[i]));
            }
        }
        catch (err) {
            this.rollback();
            throw err;
        }
    }
    /**
     * Remove all documents matching supplied filter function.
     * @param {function} filterFunction - the filter function
     */
    removeWhere(filterFunction) {
        this.remove(this._data.filter(filterFunction));
    }
    removeDataOnly() {
        this.remove(this._data.slice());
    }
    /**
     * Remove a document from the collection
     * @param {number|object} doc - document to remove from collection
     */
    remove(doc) {
        if (typeof doc === "number") {
            doc = this.get(doc);
        }
        if (Array.isArray(doc)) {
            let k = 0;
            const len = doc.length;
            for (k; k < len; k++) {
                this.remove(doc[k]);
            }
            return;
        }
        if (doc.$loki === undefined) {
            throw new Error("Object is not a document stored in the collection");
        }
        try {
            this.startTransaction();
            const arr = this.get(doc.$loki, true);
            const position = arr[1];
            // already converted but let's narrow to make typescript happy
            let aDoc = (typeof doc === "number") ? this.get(doc) : doc;
            Object.keys(this._constraints.unique).forEach((key) => {
                if (key in aDoc) {
                    this._constraints.unique[key].remove(aDoc.$loki);
                }
            });
            // now that we can efficiently determine the data[] position of newly added document,
            // submit it for all registered DynamicViews to remove
            for (let idx = 0; idx < this._dynamicViews.length; idx++) {
                this._dynamicViews[idx]._removeDocument(position);
            }
            this._data.splice(position, 1);
            // remove id from idIndex
            this._idIndex.splice(position, 1);
            // remove from lokimap
            delete this._lokimap[doc.$loki];
            // remove id/val kvp from binary tree index
            for (let ri in this._rangedIndexes) {
                this._rangedIndexes[ri].index.remove(doc.$loki);
            }
            // FullTextSearch.
            if (this._fullTextSearch !== null) {
                this._fullTextSearch.removeDocument(doc, position);
            }
            this.commit();
            this._dirty = true; // for autosave scenarios
            if (!this._disableChangesApi) {
                this._createChange(this.name, "R", arr[0]);
            }
            this.emit("delete", arr[0]);
            delete doc.$loki;
            delete doc.meta;
        }
        catch (err) {
            this.rollback();
            this.emit("error", err);
            throw err;
        }
    }
    /*------------+
     | Change API |
     +------------*/
    /**
     * Returns all changes.
     * @returns {Collection.Change[]}
     */
    getChanges() {
        return this._changes;
    }
    /**
     * Enables/disables changes api.
     * @param {boolean} disableChangesApi
     * @param {boolean} disableDeltaChangesApi
     */
    setChangesApi(disableChangesApi, disableDeltaChangesApi = true) {
        this._disableChangesApi = disableChangesApi;
        this._disableDeltaChangesApi = disableChangesApi ? true : disableDeltaChangesApi;
    }
    /**
     * Clears all the changes.
     */
    flushChanges() {
        this._changes = [];
    }
    _getObjectDelta(oldObject, newObject) {
        const propertyNames = newObject !== null && typeof newObject === "object" ? Object.keys(newObject) : null;
        if (propertyNames && propertyNames.length && ["string", "boolean", "number"].indexOf(typeof (newObject)) < 0) {
            const delta = {};
            for (let i = 0; i < propertyNames.length; i++) {
                const propertyName = propertyNames[i];
                if (newObject.hasOwnProperty(propertyName)) {
                    if (!oldObject.hasOwnProperty(propertyName) || this._constraints.unique[propertyName] !== undefined
                        || propertyName === "$loki" || propertyName === "meta") {
                        delta[propertyName] = newObject[propertyName];
                    }
                    else {
                        const propertyDelta = this._getObjectDelta(oldObject[propertyName], newObject[propertyName]);
                        if (propertyDelta !== undefined && propertyDelta !== {}) {
                            delta[propertyName] = propertyDelta;
                        }
                    }
                }
            }
            return Object.keys(delta).length === 0 ? undefined : delta;
        }
        else {
            return oldObject === newObject ? undefined : newObject;
        }
    }
    /**
     * Compare changed object (which is a forced clone) with existing object and return the delta
     */
    _getChangeDelta(obj, old) {
        if (old) {
            return this._getObjectDelta(old, obj);
        }
        else {
            return JSON.parse(JSON.stringify(obj));
        }
    }
    /**
     * Creates a clone of the current status of an object and associates operation and collection name,
     * so the parent db can aggregate and generate a changes object for the entire db
     */
    _createChange(name, op, obj, old) {
        this._changes.push({
            name,
            operation: op,
            obj: op === "U" && !this._disableDeltaChangesApi
                ? this._getChangeDelta(obj, old)
                : JSON.parse(JSON.stringify(obj))
        });
    }
    _createInsertChange(obj) {
        this._createChange(this.name, "I", obj);
    }
    _createUpdateChange(obj, old) {
        this._createChange(this.name, "U", obj, old);
    }
    _insertMetaWithChange(obj) {
        this._insertMeta(obj);
        this._createInsertChange(obj);
    }
    _updateMetaWithChange(obj, old) {
        this._updateMeta(obj);
        this._createUpdateChange(obj, old);
    }
    _insertMeta(obj) {
        if (this._disableMeta) {
            return;
        }
        if (!obj.meta) {
            obj.meta = {
                version: 0,
                revision: 0,
                created: 0
            };
        }
        obj.meta.created = (new Date()).getTime();
        obj.meta.revision = 0;
    }
    _updateMeta(obj) {
        if (this._disableMeta) {
            return;
        }
        obj.meta.updated = (new Date()).getTime();
        obj.meta.revision += 1;
    }
    get(id, returnPosition = false) {
        if (!returnPosition) {
            let doc = this._lokimap[id];
            if (doc === undefined)
                return null;
            return doc;
        }
        const data = this._idIndex;
        let max = data.length - 1;
        let min = 0;
        let mid = (min + max) >> 1;
        id = typeof id === "number" ? id : parseInt(id, 10);
        if (isNaN(id)) {
            throw new TypeError("Passed id is not an integer");
        }
        while (data[min] < data[max]) {
            mid = (min + max) >> 1;
            if (data[mid] < id) {
                min = mid + 1;
            }
            else {
                max = mid;
            }
        }
        if (max === min && data[min] === id) {
            if (returnPosition) {
                return [this._data[min], min];
            }
            return this._data[min];
        }
        return null;
    }
    /**
     * Retrieve doc by Unique index
     * @param {string} field - name of uniquely indexed property to use when doing lookup
     * @param {any} value - unique value to search for
     * @returns {object} document matching the value passed
     */
    by(field, value) {
        // for least amount of overhead, we will directly
        // access index rather than use find codepath
        let lokiId = this._constraints.unique[field].get(value);
        if (!this._cloneObjects) {
            return this._lokimap[lokiId];
        }
        else {
            return clone(this._lokimap[lokiId], this._cloneMethod);
        }
    }
    /**
     * Find one object by index property, by property equal to value
     * @param {object} query - query object used to perform search with
     * @returns {(object|null)} First matching document, or null if none
     */
    findOne(query) {
        query = query || {};
        // Instantiate ResultSet and exec find op passing firstOnly = true param
        const result = this.chain().find(query, true).data();
        if (Array.isArray(result) && result.length === 0) {
            return null;
        }
        else {
            if (!this._cloneObjects) {
                return result[0];
            }
            else {
                return clone(result[0], this._cloneMethod);
            }
        }
    }
    /**
     * Chain method, used for beginning a series of chained find() and/or view() operations
     * on a collection.
     *
     * @param {array} transform - Ordered array of transform step objects similar to chain
     * @param {object} parameters - Object containing properties representing parameters to substitute
     * @returns {ResultSet} (this) ResultSet, or data array if any map or join functions where called
     */
    chain(transform, parameters) {
        const rs = new result_set_ResultSet(this);
        if (transform === undefined) {
            return rs;
        }
        return rs.transform(transform, parameters);
    }
    /**
     * Find method, api is similar to mongodb.
     * for more complex queries use [chain()]{@link Collection#chain} or [where()]{@link Collection#where}.
     * @example {@tutorial Query Examples}
     * @param {object} query - 'mongo-like' query object
     * @returns {array} Array of matching documents
     */
    find(query) {
        return this.chain().find(query).data();
    }
    /**
     * Find object by unindexed field by property equal to value,
     * simply iterates and returns the first element matching the query
     */
    findOneUnindexed(prop, value) {
        let i = this._data.length;
        let doc;
        while (i--) {
            if (this._data[i][prop] === value) {
                doc = this._data[i];
                return doc;
            }
        }
        return null;
    }
    /**
     * Transaction methods
     */
    /**
     * start the transation
     */
    startTransaction() {
        if (this._transactional) {
            // backup any ranged indexes
            let rib = {};
            for (let ri in this._rangedIndexes) {
                rib[ri].indexTypeName = this._rangedIndexes[ri].indexTypeName;
                rib[ri].comparatorName = this._rangedIndexes[ri].comparatorName;
                rib[ri].index = this._rangedIndexes[ri].index.backup();
            }
            this._cached = {
                index: this._idIndex,
                data: clone(this._data, this._cloneMethod),
                rangedIndexes: rib,
            };
            // propagate startTransaction to dynamic views
            for (let idx = 0; idx < this._dynamicViews.length; idx++) {
                this._dynamicViews[idx].startTransaction();
            }
        }
    }
    /**
     * Commit the transaction.
     */
    commit() {
        if (this._transactional) {
            this._cached = null;
            // propagate commit to dynamic views
            for (let idx = 0; idx < this._dynamicViews.length; idx++) {
                this._dynamicViews[idx].commit();
            }
        }
    }
    /**
     * Rollback the transaction.
     */
    rollback() {
        if (this._transactional) {
            if (this._cached !== null) {
                this._idIndex = this._cached.index;
                this._data = this._cached.data;
                for (let i = 0; i < this._data.length; i++) {
                    this._data[i] = this._defineNestedProperties(this._data[i]);
                }
                // restore ranged indexes
                for (let ri in this._cached.rangedIndexes) {
                    // shortcut reference to serialized meta
                    let sri = this._cached.rangedIndexes[ri];
                    // lookup index factory function in map based on index type name
                    let rif = ranged_indexes["a" /* RangedIndexFactoryMap */][sri.indexTypeName];
                    // lookup comparator function in map based on comparator name
                    let ricmp = comparators["a" /* ComparatorMap */][sri.comparatorName];
                    // using index type (from meta), index factory and comparator... create instance of ranged index
                    let rii = rif(ri, ricmp);
                    // now ask new index instance to inflate from plain object
                    rii.restore(sri.index);
                    // attach class instance to our collection's ranged index's (index) instance property
                    this._rangedIndexes[ri].index = rii;
                }
                // propagate rollback to dynamic views
                for (let idx = 0; idx < this._dynamicViews.length; idx++) {
                    this._dynamicViews[idx].rollback();
                }
            }
        }
    }
    /**
     * Query the collection by supplying a javascript filter function.
     * @example
     * let results = coll.where(function(obj) {
       *   return obj.legs === 8;
       * });
     * @param {function} fun - filter function to run against all collection docs
     * @returns {array} all documents which pass your filter function
     */
    where(fun) {
        return this.chain().where(fun).data();
    }
    /**
     * Map Reduce operation
     * @param {function} mapFunction - function to use as map function
     * @param {function} reduceFunction - function to use as reduce function
     * @returns {data} The result of your mapReduce operation
     */
    mapReduce(mapFunction, reduceFunction) {
        return reduceFunction(this._data.map(mapFunction));
    }
    /**
     * Join two collections on specified properties
     * @param {array} joinData - array of documents to 'join' to this collection
     * @param {string} leftJoinProp - property name in collection
     * @param {string} rightJoinProp - property name in joinData
     * @param {function} mapFun - (Optional) map function to use
     * @param dataOptions - options to data() before input to your map function
     * @param [dataOptions.removeMeta] - allows removing meta before calling mapFun
     * @param [dataOptions.forceClones] - forcing the return of cloned objects to your map object
     * @param [dataOptions.forceCloneMethod] - allows overriding the default or collection specified cloning method
     * @returns {ResultSet} Result of the mapping operation
     */
    eqJoin(joinData, leftJoinProp, rightJoinProp, mapFun, dataOptions) {
        return new result_set_ResultSet(this).eqJoin(joinData, leftJoinProp, rightJoinProp, mapFun, dataOptions);
    }
    /* ------ STAGING API -------- */
    /**
     * (Staging API) create a stage and/or retrieve it
     */
    getStage(name) {
        if (!this._stages[name]) {
            this._stages[name] = {};
        }
        return this._stages[name];
    }
    /**
     * a collection of objects recording the changes applied through a commmitStage
     */
    /**
     * (Staging API) create a copy of an object and insert it into a stage
     */
    stage(stageName, obj) {
        const copy = JSON.parse(JSON.stringify(obj));
        this.getStage(stageName)[obj.$loki] = copy;
        return copy;
    }
    /**
     * (Staging API) re-attach all objects to the original collection, so indexes and views can be rebuilt
     * then create a message to be inserted in the commitlog
     * @param {string} stageName - name of stage
     * @param {string} message
     */
    commitStage(stageName, message) {
        const stage = this.getStage(stageName);
        const timestamp = new Date().getTime();
        for (const prop in stage) {
            this.update(stage[prop]);
            this._commitLog.push({
                timestamp,
                message,
                data: JSON.parse(JSON.stringify(stage[prop]))
            });
        }
        this._stages[stageName] = {};
    }
    /**
     * Returns all values of a field.
     * @param {string} field - the field name
     * @return {any}: the array of values
     */
    extract(field) {
        const result = [];
        for (let i = 0; i < this._data.length; i++) {
            result.push(this._data[i][field]);
        }
        return result;
    }
    /**
     * Finds the minimum value of a field.
     * @param {string} field - the field name
     * @return {number} the minimum value
     */
    min(field) {
        return Math.min.apply(null, this.extractNumerical(field));
    }
    /**
     * Finds the maximum value of a field.
     * @param {string} field - the field name
     * @return {number} the maximum value
     */
    max(field) {
        return Math.max.apply(null, this.extractNumerical(field));
    }
    /**
     * Finds the minimum value and its index of a field.
     * @param {string} field - the field name
     * @return {object} - index and value
     */
    minRecord(field) {
        const result = {
            index: 0,
            value: 0
        };
        if (this._data.length === 0) {
            result.index = null;
            result.value = null;
            return result;
        }
        result.index = this._data[0].$loki;
        result.value = parseFloat(this._data[0][field]);
        for (let i = 1; i < this._data.length; i++) {
            const val = parseFloat(this._data[i][field]);
            if (result.value > val) {
                result.value = val;
                result.index = this._data[i].$loki;
            }
        }
        return result;
    }
    /**
     * Finds the maximum value and its index of a field.
     * @param {string} field - the field name
     * @return {object} - index and value
     */
    maxRecord(field) {
        const result = {
            index: 0,
            value: 0
        };
        if (this._data.length === 0) {
            result.index = null;
            result.value = null;
            return result;
        }
        result.index = this._data[0].$loki;
        result.value = parseFloat(this._data[0][field]);
        for (let i = 1; i < this._data.length; i++) {
            const val = parseFloat(this._data[i][field]);
            if (result.value < val) {
                result.value = val;
                result.index = this._data[i].$loki;
            }
        }
        return result;
    }
    /**
     * Returns all values of a field as numbers (if possible).
     * @param {string} field - the field name
     * @return {number[]} - the number array
     */
    extractNumerical(field) {
        return this.extract(field).map(parseFloat).filter(Number).filter((n) => !(isNaN(n)));
    }
    /**
     * Calculates the average numerical value of a field
     * @param {string} field - the field name
     * @returns {number} average of property in all docs in the collection
     */
    avg(field) {
        return average(this.extractNumerical(field));
    }
    /**
     * Calculate the standard deviation of a field.
     * @param {string} field - the field name
     * @return {number} the standard deviation
     */
    stdDev(field) {
        return standardDeviation(this.extractNumerical(field));
    }
    /**
     * Calculates the mode of a field.
     * @param {string} field - the field name
     * @return {number} the mode
     */
    mode(field) {
        const dict = {};
        const data = this.extractNumerical(field);
        let mode = data[0];
        let maxCount = -Infinity;
        for (let i = 0; i < data.length; i++) {
            const el = data[i];
            if (dict[el]) {
                dict[el]++;
            }
            else {
                dict[el] = 1;
            }
            if (dict[el] > maxCount) {
                mode = el;
                maxCount = dict[el];
            }
        }
        return mode;
    }
    /**
     * Calculates the median of a field.
     * @param {string} field - the field name
     * @return {number} the median
     */
    median(field) {
        const values = this.extractNumerical(field);
        values.sort((a, b) => a - b);
        const half = Math.floor(values.length / 2);
        if (values.length % 2) {
            return values[half];
        }
        else {
            return (values[half - 1] + values[half]) / 2.0;
        }
    }
}


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

// CONCATENATED MODULE: ./packages/loki/src/avl_index.ts
/**
 * LokiDB AVL Balanced Binary Tree Index implementation.
 * To support duplicates, we use siblings (array) in tree nodes.
 * Basic AVL components guided by William Fiset tutorials at :
 * https://github.com/williamfiset/data-structures/blob/master/com/williamfiset/datastructures/balancedtree/AVLTreeRecursive.java
 * https://www.youtube.com/watch?v=g4y2h70D6Nk&list=PLDV1Zeh2NRsD06x59fxczdWLhDDszUHKt
 */
class AvlTreeIndex {
    /**
     * Initializes index with property name and a comparer function.
     */
    constructor(name, comparator) {
        this.nodes = {};
        this.apex = null;
        this.name = name;
        this.comparator = comparator;
    }
    backup() {
        let result = new AvlTreeIndex(this.name, this.comparator);
        result.nodes = JSON.parse(JSON.stringify(this.nodes));
        result.apex = this.apex;
        return result;
    }
    restore(tree) {
        this.name = tree.name;
        this.comparator = tree.comparator;
        this.nodes = JSON.parse(JSON.stringify(tree.nodes));
        this.apex = tree.apex;
    }
    /**
     * Used for inserting a new value into the BinaryTreeIndex
     * @param id Unique Id (such as $loki) to associate with value
     * @param val Value to be indexed and inserted into binary tree
     */
    insert(id, val) {
        if (id <= 0) {
            throw new Error("avl index ids are required to be numbers greater than zero");
        }
        let node = this.nodes[id] = {
            id: id,
            value: val,
            parent: null,
            balance: 0,
            height: 0,
            left: null,
            right: null,
            siblings: []
        };
        if (!this.apex) {
            this.apex = id;
            return;
        }
        this.insertNode(this.nodes[this.apex], node);
    }
    /**
     * Recursively inserts a treenode and re-balances if needed.
     * @param current
     * @param node
     */
    insertNode(current, node) {
        switch (this.comparator(node.value, current.value)) {
            case 0:
                // eq
                current.siblings.push(node.id);
                node.parent = current.id;
                break;
            case 1:
                // gt
                if (current.right) {
                    this.insertNode(this.nodes[current.right], node);
                    this.updateBalance(current);
                }
                else {
                    current.right = node.id;
                    node.parent = current.id;
                    this.updateBalance(current);
                }
                break;
            case -1:
                // lt
                if (current.left) {
                    this.insertNode(this.nodes[current.left], node);
                    this.updateBalance(current);
                }
                else {
                    current.left = node.id;
                    node.parent = current.id;
                    this.updateBalance(current);
                }
                break;
            default: throw new Error("Invalid comparator result");
        }
        if (current.balance < -1) {
            if (current.left === null) {
                throw new Error("insertNode.balance() : left child should not be null");
            }
            if (this.nodes[current.left].balance <= 0) {
                this.leftLeftCase(current);
            }
            else {
                this.leftRightCase(current);
            }
        }
        if (current.balance > 1) {
            if (current.right === null) {
                throw new Error("insertNode.balance() : right child should not be null");
            }
            if (this.nodes[current.right].balance >= 0) {
                this.rightRightCase(current);
            }
            else {
                this.rightLeftCase(current);
            }
        }
        return current.height;
    }
    /**
     * Updates height and balance (calculation) for tree node
     * @param node
     */
    updateBalance(node) {
        let hl = node.left ? this.nodes[node.left].height : -1;
        let hr = node.right ? this.nodes[node.right].height : -1;
        //node.height = 1 + Math.max(hl, hr);
        node.height = (hl > hr) ? 1 + hl : 1 + hr;
        node.balance = hr - hl;
    }
    /**
     * Balance the 'double left-heavy' condition
     * @param node
     */
    leftLeftCase(node) {
        return this.rotateRight(node);
    }
    /**
     * Balance the '(parent) left heavy, (child) right heavy' condition
     * @param node
     */
    leftRightCase(node) {
        if (!node.left) {
            throw new Error("leftRightCase: left child not set");
        }
        node.left = this.rotateLeft(this.nodes[node.left]).id;
        return this.rotateRight(node);
    }
    /**
     * Balance the 'double right-heavy' condition
     * @param node
     */
    rightRightCase(node) {
        return this.rotateLeft(node);
    }
    /**
     * Balance the '(parent) right heavy, (child) left heavy' condition
     * @param node
     */
    rightLeftCase(node) {
        if (!node.right) {
            throw new Error("rightLeftCase: right child not set");
        }
        node.right = this.rotateRight(this.nodes[node.right]).id;
        return this.rotateLeft(node);
    }
    /**
     * Left rotation of node. Swaps right child into current location.
     * @param node
     */
    rotateLeft(node) {
        if (!node.right) {
            throw new Error("rotateLeft: right child was unavailable.");
        }
        let parent = (node.parent) ? this.nodes[node.parent] : null;
        let right = this.nodes[node.right];
        // assume rights (old) left branch as our (new) right branch
        node.right = right.left;
        if (node.right) {
            this.nodes[node.right].parent = node.id;
        }
        // right will be new parent to node and assume old node's parent
        right.left = node.id;
        right.parent = node.parent;
        node.parent = right.id;
        // remap parent child pointer to right
        if (parent) {
            if (parent.left === node.id) {
                parent.left = right.id;
            }
            else if (parent.right === node.id) {
                parent.right = right.id;
            }
            else {
                throw new Error("rotateLeft() : attempt to remap parent back to child failed... not found");
            }
        }
        else {
            if (this.apex !== node.id) {
                throw new Error("rightRotate expecting parentless node to be apex");
            }
            this.apex = right.id;
        }
        // recalculate height and balance for swapped nodes
        this.updateBalance(node);
        this.updateBalance(right);
        return right;
    }
    /**
     * Right rotation of node. Swaps left child into current location.
     * @param node
     */
    rotateRight(node) {
        if (!node.left) {
            throw new Error("rotateRight : left child unavailable");
        }
        let parent = (node.parent) ? this.nodes[node.parent] : null;
        let left = this.nodes[node.left];
        // assume left's (old) right branch as our (new) left branch
        node.left = left.right;
        if (left.right) {
            this.nodes[left.right].parent = node.id;
        }
        // 'node' will be right child of left
        left.right = node.id;
        left.parent = node.parent;
        node.parent = left.id;
        if (parent) {
            if (parent.left === node.id) {
                parent.left = left.id;
            }
            else {
                parent.right = left.id;
            }
        }
        else {
            if (this.apex !== node.id) {
                throw new Error("rightRotate expecting parentless node to be apex");
            }
            this.apex = left.id;
        }
        // recalculate height and balance for swapped nodes
        this.updateBalance(node);
        this.updateBalance(left);
        return left;
    }
    /**
     * Diagnostic method for examining tree contents and structure
     * @param node
     */
    getValuesAsTree(node) {
        if (this.apex === null)
            return null;
        node = node || this.nodes[this.apex];
        return {
            id: node.id,
            val: node.value,
            siblings: node.siblings,
            balance: node.balance,
            height: node.height,
            left: node.left ? this.getValuesAsTree(this.nodes[node.left]) : null,
            right: node.right ? this.getValuesAsTree(this.nodes[node.right]) : null,
        };
    }
    /**
     * Updates a value, possibly relocating it, within binary tree
     * @param id Unique Id (such as $loki) to associate with value
     * @param val New value to be indexed within binary tree
     */
    update(id, val) {
        let node = this.nodes[id];
        let cmp = this.comparator(node.value, val);
        // if the value did not change, or changed to value considered equal to itself, return.
        if (cmp === 0)
            return;
        this.remove(id);
        this.insert(id, val);
    }
    /**
     * Removes a value from the binary tree index
     * @param id
     */
    remove(id) {
        if (!this.apex) {
            throw new Error("remove() : attempting remove when tree has no apex");
        }
        this.removeNode(this.nodes[this.apex], id);
    }
    /**
     * Recursive node removal and rebalancer
     * @param node
     * @param val
     */
    removeNode(node, id) {
        if (!this.nodes[id]) {
            throw new Error("removeNode: attempting to remove a node which is not in hashmap");
        }
        let val = this.nodes[id].value;
        switch (this.comparator(val, node.value)) {
            case 0:
                // eq - handle siblings if present
                if (node.siblings.length > 0) {
                    // if node to remove is alpha sibling...
                    if (node.id === id) {
                        // get first sibling as replacement
                        let alphaSiblingId = node.siblings.shift();
                        let alphaSibling = this.nodes[alphaSiblingId];
                        // remap all properties but id and value from node onto alphasibling
                        alphaSibling.parent = node.parent;
                        this.updateChildLink(node.parent, id, alphaSiblingId);
                        if (node.left) {
                            this.nodes[node.left].parent = alphaSiblingId;
                        }
                        if (node.right) {
                            this.nodes[node.right].parent = alphaSiblingId;
                        }
                        alphaSibling.left = node.left;
                        alphaSibling.right = node.right;
                        alphaSibling.siblings = node.siblings;
                        alphaSibling.height = node.height;
                        alphaSibling.balance = node.balance;
                        if (this.apex === id) {
                            this.apex = alphaSiblingId;
                        }
                        // parent all remaining siblings alphaSibling (new parent)
                        for (let si of alphaSibling.siblings) {
                            this.nodes[si].parent = alphaSiblingId;
                        }
                        // delete old node from nodes and return
                        delete this.nodes[id];
                        return;
                    }
                    // else we are inner sibling
                    else {
                        let idx = node.siblings.indexOf(id);
                        if (idx === -1) {
                            throw new Error("Unable to remove sibling from parented sibling");
                        }
                        node.siblings.splice(idx, 1);
                        delete this.nodes[id];
                        return;
                    }
                }
                // else we have no siblings, node will be removed
                else {
                    // if node to delete has no children
                    if (!node.left && !node.right) {
                        // if we have a parent, remove us from either left or right child link
                        this.updateChildLink(node.parent, node.id, null);
                        delete this.nodes[id];
                        if (id === this.apex) {
                            this.apex = null;
                        }
                        return;
                    }
                    // if node to delete has only one child we can do simple copy/replace
                    if (!node.left || !node.right) {
                        if (node.left) {
                            this.promoteChild(node, this.nodes[node.left]);
                            if (this.apex === id) {
                                this.apex = node.left;
                            }
                        }
                        if (node.right) {
                            this.promoteChild(node, this.nodes[node.right]);
                            if (this.apex === id) {
                                this.apex = node.right;
                            }
                        }
                        return;
                    }
                    // node to delete has two children, need swap with inorder successor
                    // use find inorder successor by default
                    this.promoteSuccessor(node);
                    return;
                }
            case 1:
                // gt - search right branch
                if (!node.right) {
                    throw new Error("removeNode: Unable to find value in tree");
                }
                this.removeNode(this.nodes[node.right], id);
                break;
            case -1:
                // lt - search left branch
                if (!node.left) {
                    throw new Error("removeNode: Unable to find value in tree");
                }
                this.removeNode(this.nodes[node.left], id);
                break;
        }
        this.updateBalance(node);
        if (node.balance < -1) {
            if (node.left === null) {
                throw new Error("insertNode.balance() : left child should not be null");
            }
            if (this.nodes[node.left].balance <= 0) {
                this.leftLeftCase(node);
            }
            else {
                this.leftRightCase(node);
            }
        }
        if (node.balance > 1) {
            if (node.right === null) {
                throw new Error("insertNode.balance() : right child should not be null");
            }
            if (this.nodes[node.right].balance >= 0) {
                this.rightRightCase(node);
            }
            else {
                this.rightLeftCase(node);
            }
        }
    }
    /**
     * Utility method for updating a parent's child link when it changes
     * @param parentId
     * @param oldChildId
     * @param newChildId
     */
    updateChildLink(parentId, oldChildId, newChildId) {
        if (parentId === null)
            return;
        let parent = this.nodes[parentId];
        if (parent.left === oldChildId) {
            parent.left = newChildId;
        }
        else if (parent.right === oldChildId) {
            parent.right = newChildId;
        }
    }
    /**
     * When removing a parent with only child, this does simple remap of child to grandParent.
     * @param grandParent New parent of 'child'.
     * @param parent Node being removed.
     * @param child Node to reparent to grandParent.
     */
    promoteChild(parent, child) {
        let gpId = parent.parent;
        if (gpId) {
            let gp = this.nodes[gpId];
            if (gp.left === parent.id) {
                gp.left = child.id;
            }
            else if (gp.right === parent.id) {
                gp.right = child.id;
            }
        }
        // remap (grand) child's parent pointer to grandparent (new parent) or null if new apex
        child.parent = gpId;
        // remove parent from bst hashmap
        delete this.nodes[parent.id];
        return;
    }
    /**
     * Finds a successor to a node and replaces that node with it.
     * @param node
     */
    promoteSuccessor(node) {
        let oldId = node.id;
        // assume successor/right branch (for now)
        if (!node.right || !node.left) {
            throw new Error("promoteSuccessor() : node to replace does not have two children");
        }
        let successor = null;
        let glsId;
        let glsValue;
        let glsSiblings;
        // if tree is already left heavy,
        // let's replace with predecessor (greatest val in left branch)
        if (node.balance < 0) {
            let lchild = this.nodes[node.left];
            successor = this.findGreaterLeaf(lchild);
            glsId = successor.id;
            glsValue = successor.value;
            glsSiblings = successor.siblings;
            successor.siblings = [];
            this.removeNode(lchild, glsId);
        }
        // otherwise the tree is either balanced or right heavy,
        // so let's use sucessor (least value in right branch)
        else {
            let rchild = this.nodes[node.right];
            successor = this.findLesserLeaf(rchild);
            glsId = successor.id;
            glsValue = successor.value;
            glsSiblings = successor.siblings;
            // dont leave any siblings when we (temporarily) 'remove' or they will assume ownership of old node
            successor.siblings = [];
            this.removeNode(rchild, glsId);
        }
        // update any parent pointers to node being replaced
        if (node.parent) {
            let p = this.nodes[node.parent];
            if (p.left === oldId)
                p.left = glsId;
            if (p.right === oldId)
                p.right = glsId;
        }
        // update any child points to node being replaced
        if (node.left)
            this.nodes[node.left].parent = glsId;
        if (node.right)
            this.nodes[node.right].parent = glsId;
        // update (reuse) node instance id and value with that of successor
        node.id = glsId;
        node.value = glsValue;
        node.siblings = glsSiblings;
        // update hashmap
        this.nodes[glsId] = node;
        delete this.nodes[oldId];
        // if old was apex, update apex to point to successor
        if (this.apex === oldId)
            this.apex = glsId;
        this.updateBalance(node);
    }
    /**
     * Utility method for finding In-Order predecessor to the provided node
     * @param node Parent node to find leaf node of greatest 'value'
    */
    findGreaterLeaf(node) {
        if (!node.right) {
            return node;
        }
        let result = this.findGreaterLeaf(this.nodes[node.right]);
        return result ? result : node;
    }
    /**
     * Utility method for finding In-Order successor to the provided node
     * @param node Parent Node to find leaf node of least 'value'
     */
    findLesserLeaf(node) {
        if (!node.left) {
            return node;
        }
        let result = this.findLesserLeaf(this.nodes[node.left]);
        return result ? result : node;
    }
    /**
     *  Interface method to support ranged queries.  Results sorted by index property.
     * @param range Options for ranged request.
     */
    rangeRequest(range) {
        if (!this.apex)
            return [];
        // if requesting all id's sorted by their value
        if (!range) {
            return this.collateIds(this.nodes[this.apex]);
        }
        if (range.op === "$eq") {
            let match = this.locate(this.nodes[this.apex], range.val);
            if (match === null) {
                return [];
            }
            if (match.siblings.length) {
                return [match.id, ...match.siblings];
            }
            return [match.id];
        }
        let result = this.collateRequest(this.nodes[this.apex], range);
        return result;
    }
    /**
     * Implements ranged request operations.
     * @param node
     * @param range
     */
    collateRequest(node, range) {
        let result = [];
        if (range.op === "$eq") {
            // we use locate instead for $eq range requests
            throw new Error("collateRequest does not support $eq range request");
        }
        let cmp1 = this.comparator(node.value, range.val);
        let cmp2 = 0;
        if (range.op === "$between") {
            if (range.high === null || range.high === undefined) {
                throw new Error("collateRequest: $between request missing high range value");
            }
            cmp2 = this.comparator(node.value, range.high);
        }
        if (node.left) {
            switch (range.op) {
                case "$lt":
                case "$lte":
                    result = this.collateRequest(this.nodes[node.left], range);
                    break;
                case "$gt":
                case "$gte":
                    // if the current node is still greater than compare value,
                    // it's possible left child will be too
                    if (cmp1 === 1) {
                        result = this.collateRequest(this.nodes[node.left], range);
                    }
                    break;
                case "$between":
                    // only pursue left path if current node greater than (low) range val
                    if (cmp1 === 1) {
                        result = this.collateRequest(this.nodes[node.left], range);
                    }
                    break;
                default: break;
            }
        }
        if (!range) {
            result.push(node.id);
            result.push(...node.siblings);
        }
        else {
            switch (range.op) {
                case "$lt":
                    if (cmp1 === -1) {
                        result.push(node.id);
                        result.push(...node.siblings);
                    }
                    break;
                case "$lte":
                    if (cmp1 === -1 || cmp1 === 0) {
                        result.push(node.id);
                        result.push(...node.siblings);
                    }
                    break;
                case "$gt":
                    if (cmp1 === 1) {
                        result.push(node.id);
                        result.push(...node.siblings);
                    }
                    break;
                case "$gte":
                    if (cmp1 === 1 || cmp1 === 0) {
                        result.push(node.id);
                        result.push(...node.siblings);
                    }
                    break;
                case "$between":
                    if (cmp1 >= 0 && cmp2 <= 0) {
                        result.push(node.id);
                        result.push(...node.siblings);
                    }
                    break;
                default: break;
            }
        }
        if (node.right) {
            if (!range) {
                result.push(...this.collateRequest(this.nodes[node.right], range));
            }
            else {
                switch (range.op) {
                    case "$lt":
                    case "$lte":
                        // if the current node is still less than compare value,
                        // it's possible right child will be too
                        if (cmp1 === -1) {
                            result.push(...this.collateRequest(this.nodes[node.right], range));
                        }
                        break;
                    case "$gt":
                    case "$gte":
                        result.push(...this.collateRequest(this.nodes[node.right], range));
                        break;
                    case "$between":
                        // only pursue right path if current node less than (high) range val
                        if (cmp2 === -1) {
                            result.push(...this.collateRequest(this.nodes[node.right], range));
                        }
                        break;
                    default: break;
                }
            }
        }
        return result;
    }
    /**
     * Used on a branch node to return an array of id within that branch, sorted by their value
     * @param node
     */
    collateIds(node) {
        let result = [];
        // debug diagnostic
        if (!node) {
            return [];
        }
        if (node.left) {
            result = this.collateIds(this.nodes[node.left]);
        }
        result.push(node.id);
        result.push(...node.siblings);
        if (node.right) {
            result.push(...this.collateIds(this.nodes[node.right]));
        }
        return result;
    }
    /**
     * Traverses tree to a node matching the provided value.
     * @param node
     * @param val
     */
    /*
    private locate(node: TreeNode<T>, val: any): TreeNode<T> {
       switch (this.comparator.compare(val, node.value)) {
          case 0: return node;
          case 1:
             if (!node.right) {
                return null;
             }
  
             return this.locate(this.nodes[node.right], val);
          case -1:
             if (!node.left) {
                return null;
             }
  
             return this.locate(this.nodes[node.left], val);
       }
    }
    */
    /**
     * Inline/Non-recusive 'single value' ($eq) lookup.
     * Traverses tree to a node matching the provided value.
     * @param node
     * @param val
     */
    locate(node, val) {
        while (node !== null) {
            switch (this.comparator(val, node.value)) {
                case 0: return node;
                case 1:
                    if (!node.right) {
                        return null;
                    }
                    node = this.nodes[node.right];
                    break;
                case -1:
                    if (!node.left) {
                        return null;
                    }
                    node = this.nodes[node.left];
                    break;
            }
        }
        return null;
    }
    /**
     * Index integrity check (IRangedIndex interface function)
     */
    validateIndex() {
        // handle null apex condition and verify empty tree and nodes
        if (!this.apex) {
            if (Object.keys(this.nodes).length !== 0) {
                return false;
            }
            return true;
        }
        // ensure apex has no parent
        if (this.nodes[this.apex].parent !== null) {
            return false;
        }
        // high level verification - retrieve all node ids ordered by their values
        let result = this.collateIds(this.nodes[this.apex]);
        let nc = Object.keys(this.nodes).length;
        // verify the inorder traversal returned same number of elements as nodes hashmap
        if (result.length !== nc) {
            return false;
        }
        // if only one result
        if (result.length === 1) {
            if (this.nodes[result[0]].parent !== null)
                return false;
            if (this.nodes[result[0]].left !== null)
                return false;
            if (this.nodes[result[0]].right !== null)
                return false;
            return true;
        }
        // iterate results and ensure next value is greater or equal to current
        for (let i = 0; i < result.length - 1; i++) {
            if (this.comparator(this.nodes[result[i]].value, this.nodes[result[i + 1]].value) === 1) {
                return false;
            }
        }
        return this.validateNode(this.nodes[this.apex]);
    }
    /**
     * Recursive Node validation routine
     * @param node
     */
    validateNode(node) {
        // should never have parent or child pointers reference self
        if ([node.parent, node.left, node.right].indexOf(node.id) !== -1) {
            return false;
        }
        // validate height and balance
        let hl = (node.left) ? this.nodes[node.left].height : -1;
        let hr = (node.right) ? this.nodes[node.right].height : -1;
        let eh = 1 + Math.max(hl, hr);
        if (node.height !== eh) {
            return false;
        }
        if (node.balance !== hr - hl) {
            return false;
        }
        // verify any siblings parent back to self
        if (node.siblings.length > 0) {
            for (let sid of node.siblings) {
                if (this.nodes[sid].parent !== node.id)
                    return false;
            }
        }
        // if there is a left child, verify it parents to self and recurse it
        if (node.left) {
            if (this.nodes[node.left].parent !== node.id) {
                return false;
            }
            if (!this.validateNode(this.nodes[node.left])) {
                return false;
            }
        }
        // if there is a right child, verify it parents to self and recurse it
        if (node.right) {
            if (this.nodes[node.right].parent !== node.id) {
                return false;
            }
            if (!this.validateNode(this.nodes[node.right])) {
                return false;
            }
        }
        return true;
    }
}

// CONCATENATED MODULE: ./packages/loki/src/ranged_indexes.ts
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return RangedIndexFactoryMap; });

/** Map/Register of named factory functions returning IRangedIndex instances */
let RangedIndexFactoryMap = {
    "avl": (name, comparator) => { return new AvlTreeIndex(name, comparator); }
};


/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return LokiEventEmitter; });
/**
 * LokiEventEmitter is a minimalist version of EventEmitter. It enables any
 * constructor that inherits EventEmitter to emit events and trigger
 * listeners that have been added to the event through the on(event, callback) method
 *
 * @constructor LokiEventEmitter
 */
class LokiEventEmitter {
    constructor() {
        /**
         * A map, with each property being an array of callbacks.
         */
        this._events = {};
        /**
         * Determines whether or not the callbacks associated with each event should happen in an async fashion or not.
         * Default is false, which means events are synchronous
         */
        this._asyncListeners = false;
    }
    /**
     * Adds a listener to the queue of callbacks associated to an event
     * @param {string|string[]} eventName - the name(s) of the event(s) to listen to
     * @param {function} listener - callback function of listener to attach
     * @returns {int} the index of the callback in the array of listeners for a particular event
     */
    on(eventName, listener) {
        let event;
        if (Array.isArray(eventName)) {
            eventName.forEach((currentEventName) => {
                this.on(currentEventName, listener);
            });
            return listener;
        }
        event = this._events[eventName];
        if (!event) {
            event = this._events[eventName] = [];
        }
        event.push(listener);
        return listener;
    }
    /**
     * Emits a particular event
     * with the option of passing optional parameters which are going to be processed by the callback
     * provided signatures match (i.e. if passing emit(event, arg0, arg1) the listener should take two parameters)
     * @param {string} eventName - the name of the event
     * @param {object} data - optional object passed with the event
     */
    emit(eventName, ...data) {
        if (eventName && this._events[eventName]) {
            this._events[eventName].forEach((listener) => {
                if (this._asyncListeners) {
                    setTimeout(() => {
                        listener(...data);
                    }, 1);
                }
                else {
                    listener(...data);
                }
            });
        }
    }
    /**
     * Alias of EventEmitter.on().
     */
    addListener(eventName, listener) {
        return this.on(eventName, listener);
    }
    /**
     * Removes the listener at position 'index' from the event 'eventName'
     * @param {string|string[]} eventName - the name(s) of the event(s) which the listener is attached to
     * @param {function} listener - the listener callback function to remove from emitter
     */
    removeListener(eventName, listener) {
        if (Array.isArray(eventName)) {
            eventName.forEach((currentEventName) => {
                this.removeListener(currentEventName, listener);
            });
        }
        if (this._events[eventName]) {
            const listeners = this._events[eventName];
            listeners.splice(listeners.indexOf(listener), 1);
        }
    }
}


/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Loki; });
/* harmony import */ var _event_emitter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);
/* harmony import */ var _collection__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
/* harmony import */ var _common_plugin__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1);
/* harmony import */ var _comparators__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(0);
/* harmony import */ var _ranged_indexes__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(4);
/* harmony import */ var _operator_packages__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(2);






function getENV() {
    if (global !== undefined && (global["android"] || global["NSObject"])) {
        return "NATIVESCRIPT";
    }
    const isNode = global !== undefined && ({}).toString.call(global.process) === "[object process]";
    if (isNode) {
        if (global["window"]) {
            return "NODEJS"; //node-webkit
        }
        else {
            return "NODEJS";
        }
    }
    if (document !== undefined) {
        if (document.URL.indexOf("http://") === -1 && document.URL.indexOf("https://") === -1) {
            return "CORDOVA";
        }
        return "BROWSER";
    }
    const isBrowser = window !== undefined && ({}).toString.call(window) === "[object Window]";
    if (isBrowser) {
        return "BROWSER";
    }
    throw SyntaxError("Unknown environment...");
}
class Loki extends _event_emitter__WEBPACK_IMPORTED_MODULE_0__[/* LokiEventEmitter */ "a"] {
    /**
     * Constructs the main database class.
     * @param {string} filename - name of the file to be saved to
     * @param {object} [options={}] - options
     * @param {Loki.Environment} [options.env] - the javascript environment
     * @param {Loki.SerializationMethod} [options.serializationMethod=NORMAL] - the serialization method
     * @param {string} [options.destructureDelimiter="$<\n"] - string delimiter used for destructured serialization
     * @param {IComparatorMap} [options.comparatorMap] allows injecting or overriding registered comparators
     * @param {IRangedIndexFactoryMap} [options.rangedIndexFactoryMap] allows injecting or overriding registered ranged index factories
     * @param {ILokiOperatorPackageMap} [options.lokiOperatorPackageMap] allows injecting or overriding registered loki operator packages
     */
    constructor(filename = "loki.db", options = {}) {
        super();
        // persist version of code which created the database to the database.
        // could use for upgrade scenarios
        this.databaseVersion = 1.5; // TODO
        this.engineVersion = 1.5;
        // persistenceMethod could be 'fs', 'localStorage', or 'adapter'
        // this is optional option param, otherwise environment detection will be used
        // if user passes their own adapter we will force this method to 'adapter' later, so no need to pass method option.
        this._persistenceMethod = null;
        // retain reference to optional (non-serializable) persistenceAdapter 'instance'
        this._persistenceAdapter = null;
        // flags used to throttle saves
        this._throttledSaves = true;
        this._throttledSaveRunning = null;
        this._throttledSavePending = null;
        // autosave support (disabled by default)
        this._autosave = false;
        this._autosaveInterval = 5000;
        this._autosaveRunning = false;
        this._autosaveHandler = Promise.resolve();
        this.filename = filename;
        this._collections = [];
        ({
            serializationMethod: this._serializationMethod = "normal",
            destructureDelimiter: this._destructureDelimiter = "$<\n",
            env: this._env = getENV()
        } = options);
        this._events = {
            "init": [],
            "loaded": [],
            "flushChanges": [],
            "close": [],
            "changes": [],
            "warning": []
        };
        // allow users to inject their own comparators
        if (options.comparatorMap) {
            for (let c in options.comparatorMap) {
                _comparators__WEBPACK_IMPORTED_MODULE_3__[/* ComparatorMap */ "a"][c] = options.comparatorMap[c];
            }
        }
        // allow users to register their own rangedIndex factory functions
        if (options.rangedIndexFactoryMap) {
            for (let rif in options.rangedIndexFactoryMap) {
                _ranged_indexes__WEBPACK_IMPORTED_MODULE_4__[/* RangedIndexFactoryMap */ "a"][rif] = options.rangedIndexFactoryMap[rif];
            }
        }
        // allow users to register their own LokiOperatorPackages or inject functionality within existing ones
        if (options.lokiOperatorPackageMap) {
            for (let lop in options.lokiOperatorPackageMap) {
                _operator_packages__WEBPACK_IMPORTED_MODULE_5__[/* LokiOperatorPackageMap */ "a"][lop] = options.lokiOperatorPackageMap[lop];
            }
        }
        this.on("init", this.clearChanges);
    }
    /**
     * configures options related to database persistence.
     *
     * @param {Loki.PersistenceOptions} [options={}] - options
     * @param {adapter} [options.adapter=auto] - an instance of a loki persistence adapter
     * @param {boolean} [options.autosave=false] - enables autosave
     * @param {int} [options.autosaveInterval=5000] - time interval (in milliseconds) between saves (if dirty)
     * @param {boolean} [options.autoload=false] - enables autoload on loki instantiation
     * @param {object} options.inflate - options that are passed to loadDatabase if autoload enabled
     * @param {boolean} [options.throttledSaves=true] - if true, it batches multiple calls to to saveDatabase reducing number of
     *   disk I/O operations and guaranteeing proper serialization of the calls. Default value is true.
     * @param {Loki.PersistenceMethod} options.persistenceMethod - a persistence method which should be used (FS_STORAGE, LOCAL_STORAGE...)
     * @returns {Promise} a Promise that resolves after initialization and (if enabled) autoloading the database
     */
    initializePersistence(options = {}) {
        let loaded = this._autosaveDisable();
        ({
            autosave: this._autosave = false,
            autosaveInterval: this._autosaveInterval = 5000,
            persistenceMethod: this._persistenceMethod,
            // TODO
            //inflate: this.options.inflate,
            throttledSaves: this._throttledSaves = true
        } = options);
        const DEFAULT_PERSISTENCE = {
            "NODEJS": ["fs-storage"],
            "BROWSER": ["local-storage", "indexed-storage"],
            "CORDOVA": ["local-storage", "indexed-storage"],
            "MEMORY": ["memory-storage"]
        };
        const PERSISTENCE_METHODS = {
            "fs-storage": _common_plugin__WEBPACK_IMPORTED_MODULE_2__[/* PLUGINS */ "a"]["FSStorage"],
            "local-storage": _common_plugin__WEBPACK_IMPORTED_MODULE_2__[/* PLUGINS */ "a"]["LocalStorage"],
            "indexed-storage": _common_plugin__WEBPACK_IMPORTED_MODULE_2__[/* PLUGINS */ "a"]["IndexedStorage"],
            "memory-storage": _common_plugin__WEBPACK_IMPORTED_MODULE_2__[/* PLUGINS */ "a"]["MemoryStorage"]
        };
        // process the options
        if (this._persistenceMethod !== undefined) {
            // check if the specified persistence method is known
            if (typeof (PERSISTENCE_METHODS[this._persistenceMethod]) === "function") {
                this._persistenceAdapter = new (PERSISTENCE_METHODS[this._persistenceMethod]);
            }
            else {
                throw Error("Unknown persistence method.");
            }
        }
        // if user passes adapter, set persistence mode to adapter and retain persistence adapter instance
        if (options.adapter !== undefined) {
            this._persistenceMethod = "adapter";
            this._persistenceAdapter = options.adapter;
        }
        // if by now there is no adapter specified by user nor derived from persistenceMethod: use sensible defaults
        if (this._persistenceAdapter === null) {
            let possiblePersistenceMethods = DEFAULT_PERSISTENCE[this._env];
            if (possiblePersistenceMethods) {
                for (let i = 0; i < possiblePersistenceMethods.length; i++) {
                    if (PERSISTENCE_METHODS[possiblePersistenceMethods[i]]) {
                        this._persistenceMethod = possiblePersistenceMethods[i];
                        this._persistenceAdapter = new (PERSISTENCE_METHODS[possiblePersistenceMethods[i]]);
                        break;
                    }
                }
            }
        }
        // if they want to load database on loki instantiation, now is a good time to load... after adapter set and before
        // possible autosave initiation
        if (options.autoload) {
            loaded = loaded.then(() => this._loadDatabase(options.inflate, true));
        }
        return loaded.then(() => {
            this._autosaveEnable();
        });
    }
    /**
     * Copies 'this' database into a new Loki instance. Object references are shared to make lightweight.
     * @param {object} options - options
     * @param {boolean} options.removeNonSerializable - nulls properties not safe for serialization.
     */
    copy(options = {}) {
        const databaseCopy = new Loki(this.filename, { env: this._env });
        // currently inverting and letting loadJSONObject do most of the work
        databaseCopy.loadJSONObject(this, {
            retainDirtyFlags: true
        });
        // since our toJSON is not invoked for reference database adapters, this will let us mimic
        if (options.removeNonSerializable) {
            databaseCopy._persistenceAdapter = null;
            for (let idx = 0; idx < databaseCopy._collections.length; idx++) {
                databaseCopy._collections[idx]._constraints = null;
                databaseCopy._collections[idx]._ttl = null;
            }
        }
        return databaseCopy;
    }
    /**
     * Adds a collection to the database.
     * @param {string} name - name of collection to add
     * @param {object} [options={}] - options to configure collection with.
     * @param {array} [options.unique=[]] - array of property names to define unique constraints for
     * @param {array} [options.exact=[]] - array of property names to define exact constraints for
     * @param {array} [options.indices=[]] - array property names to define binary indexes for
     * @param {boolean} [options.asyncListeners=false] - whether listeners are called asynchronously
     * @param {boolean} [options.disableMeta=false] - set to true to disable meta property on documents
     * @param {boolean} [options.disableChangesApi=true] - set to false to enable Changes Api
     * @param {boolean} [options.disableDeltaChangesApi=true] - set to false to enable Delta Changes API (requires Changes API, forces cloning)
     * @param {boolean} [options.clone=false] - specify whether inserts and queries clone to/from user
     * @param {string} [options.cloneMethod=CloneMethod.DEEP] - the clone method
     * @param {number} [options.ttl=] - age of document (in ms.) before document is considered aged/stale
     * @param {number} [options.ttlInterval=] - time interval for clearing out 'aged' documents; not set by default
     * @returns {Collection} a reference to the collection which was just added
     */
    addCollection(name, options = {}) {
        // Return an existing collection if a collection with the same name already exists.
        for (let i = 0; i < this._collections.length; i++) {
            if (this._collections[i].name === name) {
                return this._collections[i];
            }
        }
        // Create a new collection otherwise.
        const collection = new _collection__WEBPACK_IMPORTED_MODULE_1__[/* Collection */ "a"](name, options);
        this._collections.push(collection);
        return collection;
    }
    loadCollection(collection) {
        if (!collection.name) {
            throw new Error("Collection must have a name property to be loaded");
        }
        this._collections.push(collection);
    }
    /**
     * Retrieves reference to a collection by name.
     * @param {string} name - name of collection to look up
     * @returns {Collection} Reference to collection in database by that name, or null if not found
     */
    getCollection(name) {
        for (let i = 0; i < this._collections.length; i++) {
            if (this._collections[i].name === name) {
                return this._collections[i];
            }
        }
        // no such collection
        this.emit("warning", "collection " + name + " not found");
        return null;
    }
    /**
     * Renames an existing loki collection
     * @param {string} oldName - name of collection to rename
     * @param {string} newName - new name of collection
     * @returns {Collection} reference to the newly renamed collection
     */
    renameCollection(oldName, newName) {
        const c = this.getCollection(oldName);
        if (c) {
            c.name = newName;
        }
        return c;
    }
    listCollections() {
        const colls = [];
        for (let i = 0; i < this._collections.length; i++) {
            colls.push({
                name: this._collections[i].name,
                count: this._collections[i].count()
            });
        }
        return colls;
    }
    /**
     * Removes a collection from the database.
     * @param {string} collectionName - name of collection to remove
     */
    removeCollection(collectionName) {
        for (let i = 0; i < this._collections.length; i++) {
            if (this._collections[i].name === collectionName) {
                const tmpcol = new _collection__WEBPACK_IMPORTED_MODULE_1__[/* Collection */ "a"](collectionName, {});
                const curcol = this._collections[i];
                for (const prop in curcol) {
                    if (curcol[prop] !== undefined && tmpcol[prop] !== undefined) {
                        curcol[prop] = tmpcol[prop];
                    }
                }
                this._collections.splice(i, 1);
                return;
            }
        }
    }
    /**
     * Serialize database to a string which can be loaded via {@link Loki#loadJSON}
     *
     * @returns {string} Stringified representation of the loki database.
     */
    serialize(options = {}) {
        if (options.serializationMethod === undefined) {
            options.serializationMethod = this._serializationMethod;
        }
        switch (options.serializationMethod) {
            case "normal":
                return JSON.stringify(this);
            case "pretty":
                return JSON.stringify(this, null, 2);
            case "destructured":
                return this.serializeDestructured(); // use default options
            default:
                return JSON.stringify(this);
        }
    }
    // alias of serialize
    toJSON() {
        return {
            _env: this._env,
            _serializationMethod: this._serializationMethod,
            _autosave: this._autosave,
            _autosaveInterval: this._autosaveInterval,
            _collections: this._collections,
            databaseVersion: this.databaseVersion,
            engineVersion: this.engineVersion,
            filename: this.filename,
            _persistenceAdapter: this._persistenceAdapter,
            _persistenceMethod: this._persistenceMethod,
            _throttledSaves: this._throttledSaves
        };
    }
    /**
     * Database level destructured JSON serialization routine to allow alternate serialization methods.
     * Internally, Loki supports destructuring via loki "serializationMethod' option and
     * the optional LokiPartitioningAdapter class. It is also available if you wish to do
     * your own structured persistence or data exchange.
     *
     * @param {object} options - output format options for use externally to loki
     * @param {boolean} [options.partitioned=false] - whether db and each collection are separate
     * @param {int} options.partition - can be used to only output an individual collection or db (-1)
     * @param {boolean} [options.delimited=true] - whether subitems are delimited or subarrays
     * @param {string} options.delimiter - override default delimiter
     *
     * @returns {string|Array} A custom, restructured aggregation of independent serializations.
     */
    serializeDestructured(options = {}) {
        if (options.partitioned === undefined) {
            options.partitioned = false;
        }
        if (options.delimited === undefined) {
            options.delimited = true;
        }
        if (options.delimiter === undefined) {
            options.delimiter = this._destructureDelimiter;
        }
        // 'partitioned' along with 'partition' of 0 or greater is a request for single collection serialization
        if (options.partitioned === true && options.partition !== undefined && options.partition >= 0) {
            return this.serializeCollection({
                delimited: options.delimited,
                delimiter: options.delimiter,
                collectionIndex: options.partition
            });
        }
        // not just an individual collection, so we will need to serialize db container via shallow copy
        let dbcopy = new Loki(this.filename);
        dbcopy.loadJSONObject(this);
        for (let idx = 0; idx < dbcopy._collections.length; idx++) {
            dbcopy._collections[idx]._data = [];
        }
        // if we -only- wanted the db container portion, return it now
        if (options.partitioned === true && options.partition === -1) {
            // since we are deconstructing, override serializationMethod to normal for here
            return dbcopy.serialize({
                serializationMethod: "normal"
            });
        }
        // at this point we must be deconstructing the entire database
        // start by pushing db serialization into first array element
        const reconstruct = [];
        reconstruct.push(dbcopy.serialize({
            serializationMethod: "normal"
        }));
        dbcopy = null;
        // push collection data into subsequent elements
        for (let idx = 0; idx < this._collections.length; idx++) {
            let result = this.serializeCollection({
                delimited: options.delimited,
                delimiter: options.delimiter,
                collectionIndex: idx
            });
            // NDA : Non-Delimited Array : one iterable concatenated array with empty string collection partitions
            if (options.partitioned === false && options.delimited === false) {
                if (!Array.isArray(result)) {
                    throw new Error("a nondelimited, non partitioned collection serialization did not return an expected array");
                }
                // Array.concat would probably duplicate memory overhead for copying strings.
                // Instead copy each individually, and clear old value after each copy.
                // Hopefully this will allow g.c. to reduce memory pressure, if needed.
                for (let sidx = 0; sidx < result.length; sidx++) {
                    reconstruct.push(result[sidx]);
                    result[sidx] = null;
                }
                reconstruct.push("");
            }
            else {
                reconstruct.push(result);
            }
        }
        // Reconstruct / present results according to four combinations : D, DA, NDA, NDAA
        if (options.partitioned) {
            // DA : Delimited Array of strings [0] db [1] collection [n] collection { partitioned: true, delimited: true }
            // useful for simple future adaptations of existing persistence adapters to save collections separately
            if (options.delimited) {
                return reconstruct;
            }
            // NDAA : Non-Delimited Array with subArrays. db at [0] and collection subarrays at [n] { partitioned: true, delimited : false }
            // This format might be the most versatile for 'rolling your own' partitioned sync or save.
            // Memory overhead can be reduced by specifying a specific partition, but at this code path they did not, so its all.
            else {
                return reconstruct;
            }
        }
        else {
            // D : one big Delimited string { partitioned: false, delimited : true }
            // This is the method Loki will use internally if 'destructured'.
            // Little memory overhead improvements but does not require multiple asynchronous adapter call scheduling
            if (options.delimited) {
                // indicate no more collections
                reconstruct.push("");
                return reconstruct.join(options.delimiter);
            }
            // NDA : Non-Delimited Array : one iterable array with empty string collection partitions { partitioned: false, delimited: false }
            // This format might be best candidate for custom synchronous syncs or saves
            else {
                // indicate no more collections
                reconstruct.push("");
                return reconstruct;
            }
        }
    }
    /**
     * Collection level utility method to serialize a collection in a 'destructured' format
     *
     * @param {object} options - used to determine output of method
     * @param {int} options.delimited - whether to return single delimited string or an array
     * @param {string} options.delimiter - (optional) if delimited, this is delimiter to use
     * @param {int} options.collectionIndex -  specify which collection to serialize data for
     *
     * @returns {string|array} A custom, restructured aggregation of independent serializations for a single collection.
     */
    serializeCollection(options = {}) {
        if (options.delimited === undefined) {
            options.delimited = true;
        }
        if (options.collectionIndex === undefined) {
            throw new Error("serializeCollection called without 'collectionIndex' option");
        }
        const doccount = this._collections[options.collectionIndex].count();
        let resultlines = [];
        for (let docidx = 0; docidx < doccount; docidx++) {
            resultlines.push(JSON.stringify(this._collections[options.collectionIndex]._data[docidx]));
        }
        // D and DA
        if (options.delimited) {
            // indicate no more documents in collection (via empty delimited string)
            resultlines.push("");
            return resultlines.join(options.delimiter);
        }
        else {
            // NDAA and NDA
            return resultlines;
        }
    }
    /**
     * Database level destructured JSON deserialization routine to minimize memory overhead.
     * Internally, Loki supports destructuring via loki "serializationMethod' option and
     * the optional LokiPartitioningAdapter class. It is also available if you wish to do
     * your own structured persistence or data exchange.
     *
     * @param {string|array} destructuredSource - destructured json or array to deserialize from
     * @param {object} options - source format options
     * @param {boolean} [options.partitioned=false] - whether db and each collection are separate
     * @param {int} options.partition - can be used to deserialize only a single partition
     * @param {boolean} [options.delimited=true] - whether subitems are delimited or subarrays
     * @param {string} options.delimiter - override default delimiter
     *
     * @returns {object|array} An object representation of the deserialized database, not yet applied to 'this' db or document array
     */
    deserializeDestructured(destructuredSource, options = {}) {
        if (options.partitioned === undefined) {
            options.partitioned = false;
        }
        if (options.delimited === undefined) {
            options.delimited = true;
        }
        if (options.delimiter === undefined) {
            options.delimiter = this._destructureDelimiter;
        }
        // Partitioned
        // DA : Delimited Array of strings [0] db [1] collection [n] collection { partitioned: true, delimited: true }
        // NDAA : Non-Delimited Array with subArrays. db at [0] and collection subarrays at [n] { partitioned: true, delimited : false }
        // -or- single partition
        if (options.partitioned) {
            // handle single partition
            if (options.partition !== undefined) {
                // db only
                if (options.partition === -1) {
                    return JSON.parse(destructuredSource[0]);
                }
                // single collection, return doc array
                return this.deserializeCollection(destructuredSource[options.partition + 1], options);
            }
            // Otherwise we are restoring an entire partitioned db
            const cdb = JSON.parse(destructuredSource[0]);
            const collCount = cdb._collections.length;
            for (let collIndex = 0; collIndex < collCount; collIndex++) {
                // attach each collection docarray to container collection data, add 1 to collection array index since db is at 0
                cdb._collections[collIndex]._data = this.deserializeCollection(destructuredSource[collIndex + 1], options);
            }
            return cdb;
        }
        // Non-Partitioned
        // D : one big Delimited string { partitioned: false, delimited : true }
        // NDA : Non-Delimited Array : one iterable array with empty string collection partitions { partitioned: false, delimited: false }
        let workarray = [];
        // D
        if (options.delimited) {
            workarray = destructuredSource.split(options.delimiter);
            destructuredSource = null; // lower memory pressure
            if (workarray.length === 0) {
                return null;
            }
        }
        // NDA
        else {
            workarray = destructuredSource;
        }
        // first line is database and collection shells
        const cdb = JSON.parse(workarray[0]);
        const collCount = cdb._collections.length;
        workarray[0] = null;
        let collIndex = 0;
        let lineIndex = 1;
        let done = false;
        while (!done) {
            // empty string indicates either end of collection or end of file
            if (workarray[lineIndex] === "") {
                // if no more collections to load into, we are done
                if (++collIndex > collCount) {
                    done = true;
                }
            }
            else {
                cdb._collections[collIndex]._data.push(JSON.parse(workarray[lineIndex]));
            }
            // lower memory pressure and advance iterator
            workarray[lineIndex++] = null;
        }
        return cdb;
    }
    /**
     * Collection level utility function to deserializes a destructured collection.
     *
     * @param {string|string[]} destructuredSource - destructured representation of collection to inflate
     * @param {object} options - used to describe format of destructuredSource input
     * @param {int} [options.delimited=false] - whether source is delimited string or an array
     * @param {string} options.delimiter - if delimited, this is delimiter to use (if other than default)
     *
     * @returns {Array} an array of documents to attach to collection.data.
     */
    deserializeCollection(destructuredSource, options = {}) {
        if (options.partitioned === undefined) {
            options.partitioned = false;
        }
        if (options.delimited === undefined) {
            options.delimited = true;
        }
        if (options.delimiter === undefined) {
            options.delimiter = this._destructureDelimiter;
        }
        let workarray = [];
        if (options.delimited) {
            workarray = destructuredSource.split(options.delimiter);
            workarray.pop();
        }
        else {
            workarray = destructuredSource;
        }
        for (let idx = 0; idx < workarray.length; idx++) {
            workarray[idx] = JSON.parse(workarray[idx]);
        }
        return workarray;
    }
    /**
     * Inflates a loki database from a serialized JSON string
     *
     * @param {string} serializedDb - a serialized loki database string
     * @param {object} options - apply or override collection level settings
     * @param {boolean} options.retainDirtyFlags - whether collection dirty flags will be preserved
     */
    loadJSON(serializedDb, options) {
        let dbObject;
        if (serializedDb.length === 0) {
            dbObject = {};
        }
        else {
            // using option defined in instantiated db not what was in serialized db
            switch (this._serializationMethod) {
                case "normal":
                case "pretty":
                    dbObject = JSON.parse(serializedDb);
                    break;
                case "destructured":
                    dbObject = this.deserializeDestructured(serializedDb);
                    break;
                default:
                    dbObject = JSON.parse(serializedDb);
                    break;
            }
        }
        this.loadJSONObject(dbObject, options);
    }
    loadJSONObject(dbObject, options = {}) {
        const len = dbObject._collections ? dbObject._collections.length : 0;
        this.filename = dbObject.filename;
        this._collections = [];
        for (let i = 0; i < len; ++i) {
            this._collections.push(_collection__WEBPACK_IMPORTED_MODULE_1__[/* Collection */ "a"].fromJSONObject(dbObject._collections[i], options));
        }
    }
    /**
     * Emits the close event. In autosave scenarios, if the database is dirty, this will save and disable timer.
     * Does not actually destroy the db.
     *
     * @returns {Promise} a Promise that resolves after closing the database succeeded
     */
    close() {
        // for autosave scenarios, we will let close perform final save (if dirty)
        // For web use, you might call from window.onbeforeunload to shutdown database, saving pending changes
        if (this._autosave) {
            return this._autosaveDisable()
                .then(() => {
                if (this._autosaveDirty()) {
                    return this.saveDatabase();
                }
                return Promise.resolve();
            });
        }
        return Promise.resolve().then(() => {
            this.emit("close");
        });
    }
    /**-------------------------+
     | Changes API               |
     +--------------------------*/
    /**
     * The Changes API enables the tracking the changes occurred in the collections since the beginning of the session,
     * so it's possible to create a differential dataset for synchronization purposes (possibly to a remote db)
     */
    /**
     * (Changes API) : takes all the changes stored in each
     * collection and creates a single array for the entire database. If an array of names
     * of collections is passed then only the included collections will be tracked.
     *
     * @param {Array} [arrayOfCollectionNames=] - array of collection names. No arg means all collections are processed.
     * @returns {Array} array of changes
     * @see private method _createChange() in Collection
     */
    generateChangesNotification(arrayOfCollectionNames) {
        let changes = [];
        const selectedCollections = arrayOfCollectionNames
            || this._collections.map((coll) => coll.name);
        this._collections.forEach((coll) => {
            if (selectedCollections.indexOf(coll.name) !== -1) {
                changes = changes.concat(coll.getChanges());
            }
        });
        return changes;
    }
    /**
     * (Changes API) - stringify changes for network transmission
     * @returns {string} string representation of the changes
     */
    serializeChanges(collectionNamesArray) {
        return JSON.stringify(this.generateChangesNotification(collectionNamesArray));
    }
    /**
     * (Changes API) : clears all the changes in all collections.
     */
    clearChanges() {
        this._collections.forEach((coll) => {
            if (coll.flushChanges) {
                coll.flushChanges();
            }
        });
    }
    /**
     * Wait for throttledSaves to complete and invoke your callback when drained or duration is met.
     *
     * @param {object} options - configuration options
     * @param {boolean} [options.recursiveWait=true] - if after queue is drained, another save was kicked off, wait for it
     * @param {boolean} [options.recursiveWaitLimit=false] - limit our recursive waiting to a duration
     * @param {number} [options.recursiveWaitLimitDuration=2000] - cutoff in ms to stop recursively re-draining
     * @param {Date} [options.started=now()] - the start time of the recursive wait duration
     * @returns {Promise} a Promise that resolves when save queue is drained, it is passed a sucess parameter value
     */
    throttledSaveDrain(options = {}) {
        const now = (new Date()).getTime();
        if (!this._throttledSaves) {
            return Promise.resolve();
        }
        if (options.recursiveWait === undefined) {
            options.recursiveWait = true;
        }
        if (options.recursiveWaitLimit === undefined) {
            options.recursiveWaitLimit = false;
        }
        if (options.recursiveWaitLimitDuration === undefined) {
            options.recursiveWaitLimitDuration = 2000;
        }
        if (options.started === undefined) {
            options.started = new Date();
        }
        // if save is pending
        if (this._throttledSaves && this._throttledSaveRunning !== null) {
            // if we want to wait until we are in a state where there are no pending saves at all
            if (options.recursiveWait) {
                // queue the following meta callback for when it completes
                return Promise.resolve(Promise.all([this._throttledSaveRunning, this._throttledSavePending])).then(() => {
                    if (this._throttledSaveRunning !== null || this._throttledSavePending !== null) {
                        if (options.recursiveWaitLimit && (now - options.started.getTime() > options.recursiveWaitLimitDuration)) {
                            return Promise.reject({});
                        }
                        return this.throttledSaveDrain(options);
                    }
                    else {
                        return Promise.resolve();
                    }
                });
            }
            // just notify when current queue is depleted
            else {
                return Promise.resolve(this._throttledSaveRunning);
            }
        }
        // no save pending, just callback
        else {
            return Promise.resolve();
        }
    }
    /**
     * Internal load logic, decoupled from throttling/contention logic
     *
     * @param {object} options - an object containing inflation options for each collection
     * @param {boolean} ignore_not_found - does not raise an error if database is not found
     * @returns {Promise} a Promise that resolves after the database is loaded
     */
    _loadDatabase(options = {}, ignore_not_found = false) {
        // the persistenceAdapter should be present if all is ok, but check to be sure.
        if (this._persistenceAdapter === null) {
            return Promise.reject(new Error("persistenceAdapter not configured"));
        }
        return Promise.resolve(this._persistenceAdapter.loadDatabase(this.filename))
            .then((dbString) => {
            if (typeof (dbString) === "string") {
                this.loadJSON(dbString, options);
                this.emit("load", this);
                // if adapter has returned a js object (other than null or error) attempt to load from JSON object
            }
            else if (typeof (dbString) === "object" && dbString !== null && !(dbString instanceof Error)) {
                this.loadJSONObject(dbString, options);
                this.emit("load", this);
            }
            else {
                throw dbString;
            }
        }).catch(e => {
            if (e instanceof Error) {
                throw e;
            }
            else if (e != null) {
                throw new TypeError("The persistence adapter did not load a serialized DB string or object.");
            }
            else if (!ignore_not_found) {
                throw new Error("Database not found.");
            }
        });
    }
    /**
     * Handles manually loading from an adapter storage (such as fs-storage)
     *    This method utilizes loki configuration options (if provided) to determine which
     *    persistence method to use, or environment detection (if configuration was not provided).
     *    To avoid contention with any throttledSaves, we will drain the save queue first.
     *
     * If you are configured with autosave, you do not need to call this method yourself.
     *
     * @param {object} [options={}] - if throttling saves and loads, this controls how we drain save queue before loading
     * @param {boolean} [options.recursiveWait=true] wait recursively until no saves are queued
     * @param {boolean} [options.recursiveWaitLimit=false] limit our recursive waiting to a duration
     * @param {number} [options.recursiveWaitLimitDelay=2000] cutoff in ms to stop recursively re-draining
     * @param {Date} [options.started=now()] - the start time of the recursive wait duration
     * @returns {Promise} a Promise that resolves after the database is loaded
     */
    loadDatabase(options = {}) {
        // if throttling disabled, just call internal
        if (!this._throttledSaves) {
            return this._loadDatabase(options);
        }
        // try to drain any pending saves in the queue to lock it for loading
        return this.throttledSaveDrain(options).then(() => {
            // pause/throttle saving until loading is done
            this._throttledSaveRunning = this._loadDatabase(options).then(() => {
                // now that we are finished loading, if no saves were throttled, disable flag
                this._throttledSaveRunning = null;
            });
            return this._throttledSaveRunning;
        }, () => {
            throw new Error("Unable to pause save throttling long enough to read database");
        });
    }
    _saveDatabase() {
        // the persistenceAdapter should be present if all is ok, but check to be sure.
        if (this._persistenceAdapter === null) {
            return Promise.reject(new Error("persistenceAdapter not configured"));
        }
        // check if the adapter is requesting (and supports) a 'reference' mode export
        if (this._persistenceAdapter.mode === "reference" && typeof this._persistenceAdapter.exportDatabase === "function") {
            // filename may seem redundant but loadDatabase will need to expect this same filename
            return Promise.resolve(this._persistenceAdapter.exportDatabase(this.filename, this.copy({ removeNonSerializable: true })))
                .then(() => {
                this._autosaveClearFlags();
                this.emit("save");
            });
        }
        // otherwise just pass the serialized database to adapter
        // persistenceAdapter might be asynchronous, so we must clear `dirty` immediately
        // or autosave won't work if an update occurs between here and the callback
        this._autosaveClearFlags();
        return Promise.resolve(this._persistenceAdapter.saveDatabase(this.filename, this.serialize()))
            .then(() => {
            this.emit("save");
        });
    }
    /**
     * Handles manually saving to an adapter storage (such as fs-storage)
     *    This method utilizes loki configuration options (if provided) to determine which
     *    persistence method to use, or environment detection (if configuration was not provided).
     *
     * If you are configured with autosave, you do not need to call this method yourself.
     *
     * @returns {Promise} a Promise that resolves after the database is persisted
     */
    saveDatabase() {
        if (!this._throttledSaves) {
            return this._saveDatabase();
        }
        // if the db save is currently running, a new promise for a next db save is created
        // all calls to save db will get this new promise which will be processed right after
        // the current db save is finished
        if (this._throttledSaveRunning !== null && this._throttledSavePending === null) {
            this._throttledSavePending = Promise.resolve(this._throttledSaveRunning).then(() => {
                this._throttledSaveRunning = null;
                this._throttledSavePending = null;
                return this.saveDatabase();
            });
        }
        if (this._throttledSavePending !== null) {
            return this._throttledSavePending;
        }
        this._throttledSaveRunning = this._saveDatabase().then(() => {
            this._throttledSaveRunning = null;
        });
        return this._throttledSaveRunning;
    }
    /**
     * Handles deleting a database from the underlying storage adapter
     *
     * @returns {Promise} a Promise that resolves after the database is deleted
     */
    deleteDatabase() {
        // the persistenceAdapter should be present if all is ok, but check to be sure.
        if (this._persistenceAdapter === null) {
            return Promise.reject(new Error("persistenceAdapter not configured"));
        }
        return Promise.resolve(this._persistenceAdapter.deleteDatabase(this.filename));
    }
    /****************
     * Autosave API
     ****************/
    /**
     * Check whether any collections are "dirty" meaning we need to save the (entire) database
     * @returns {boolean} - true if database has changed since last autosave, otherwise false
     */
    _autosaveDirty() {
        for (let idx = 0; idx < this._collections.length; idx++) {
            if (this._collections[idx]._dirty) {
                return true;
            }
        }
        return false;
    }
    /**
     * Resets dirty flags on all collections.
     */
    _autosaveClearFlags() {
        for (let idx = 0; idx < this._collections.length; idx++) {
            this._collections[idx]._dirty = false;
        }
    }
    /**
     * Starts periodically saves to the underlying storage adapter.
     */
    _autosaveEnable() {
        if (!this._autosave || this._autosaveRunning) {
            return;
        }
        this._autosaveRunning = true;
        const interval = setInterval(() => {
            if (!this._autosaveRunning) {
                clearInterval(interval);
            }
            else if (this._autosaveDirty()) {
                this._autosaveHandler = this._autosaveHandler
                    .then(() => {
                    return this.saveDatabase();
                });
            }
        }, this._autosaveInterval);
    }
    /**
     * Stops the autosave interval timer.
     */
    _autosaveDisable() {
        this._autosaveRunning = false;
        return this._autosaveHandler;
    }
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(7)))

/***/ }),
/* 7 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1, eval)("this");
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _loki__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Loki", function() { return _loki__WEBPACK_IMPORTED_MODULE_0__["a"]; });

/* harmony import */ var _collection__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Collection", function() { return _collection__WEBPACK_IMPORTED_MODULE_1__["a"]; });



_loki__WEBPACK_IMPORTED_MODULE_0__[/* Loki */ "a"]["Collection"] = _collection__WEBPACK_IMPORTED_MODULE_1__[/* Collection */ "a"];

/* harmony default export */ __webpack_exports__["default"] = (_loki__WEBPACK_IMPORTED_MODULE_0__[/* Loki */ "a"]);


/***/ })
/******/ ]);
});
//# sourceMappingURL=lokidb.loki.js.map