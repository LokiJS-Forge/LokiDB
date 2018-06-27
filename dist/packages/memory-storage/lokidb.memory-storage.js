(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("@lokidb/memory-storage", [], factory);
	else if(typeof exports === 'object')
		exports["@lokidb/memory-storage"] = factory();
	else
		{ root["@lokidb/memory-storage"] = factory(); root["LokiMemoryStorage"] = root["@lokidb/memory-storage"].default; }
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
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
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

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(2)))

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// EXTERNAL MODULE: ./packages/common/plugin.ts
var common_plugin = __webpack_require__(0);

// CONCATENATED MODULE: ./packages/memory-storage/src/memory_storage.ts

/**
 * An in-memory persistence adapter for an in-memory database.
 * This simple 'key/value' adapter is intended for unit testing and diagnostics.
 */
class memory_storage_MemoryStorage {
    /**
     * Registers the local storage as plugin.
     */
    static register() {
        common_plugin["a" /* PLUGINS */]["MemoryStorage"] = memory_storage_MemoryStorage;
    }
    /**
     * Deregisters the local storage as plugin.
     */
    static deregister() {
        delete common_plugin["a" /* PLUGINS */]["MemoryStorage"];
    }
    /**
     * @param {object} options - memory storage options
     * @param {boolean} [options.asyncResponses=false] - whether callbacks are invoked asynchronously (default: false)
     * @param {int} [options.asyncTimeout=50] - timeout in ms to queue callbacks (default: 50)
     */
    constructor(options) {
        this.hashStore = {};
        this.options = options || {};
        if (this.options.asyncResponses === undefined) {
            this.options.asyncResponses = false;
        }
        if (this.options.asyncTimeout === undefined) {
            this.options.asyncTimeout = 50; // 50 ms default
        }
    }
    /**
     * Loads a serialized database from its in-memory store.
     * (Loki persistence adapter interface function)
     *
     * @param {string} dbname - name of the database (filename/keyname)
     * @returns {Promise} a Promise that resolves after the database was loaded
     */
    loadDatabase(dbname) {
        if (this.options.asyncResponses) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (this.hashStore[dbname] !== undefined) {
                        resolve(this.hashStore[dbname].value);
                    }
                    else {
                        reject(new Error("unable to load database, " + dbname + " was not found in memory storage"));
                    }
                }, this.options.asyncTimeout);
            });
        }
        else {
            if (this.hashStore[dbname] !== undefined) {
                return Promise.resolve(this.hashStore[dbname].value);
            }
            else {
                return Promise.reject(new Error("unable to load database, " + dbname + " was not found in memory storage"));
            }
        }
    }
    /**
     * Saves a serialized database to its in-memory store.
     * (Loki persistence adapter interface function)
     *
     * @param {string} dbname - name of the database (filename/keyname)
     * @param {string} dbstring - the database content
     * @returns {Promise} a Promise that resolves after the database was persisted
     */
    saveDatabase(dbname, dbstring) {
        if (this.options.asyncResponses) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const saveCount = (this.hashStore[dbname] !== undefined ? this.hashStore[dbname].savecount : 0);
                    this.hashStore[dbname] = {
                        savecount: saveCount + 1,
                        lastsave: new Date(),
                        value: dbstring
                    };
                    resolve();
                }, this.options.asyncTimeout);
                return Promise.resolve();
            });
        }
        else {
            const saveCount = (this.hashStore[dbname] !== undefined ? this.hashStore[dbname].savecount : 0);
            this.hashStore[dbname] = {
                savecount: saveCount + 1,
                lastsave: new Date(),
                value: dbstring
            };
            return Promise.resolve();
        }
    }
    /**
     * Deletes a database from its in-memory store.
     *
     * @param {string} dbname - name of the database (filename/keyname)
     * @returns {Promise} a Promise that resolves after the database was deleted
     */
    deleteDatabase(dbname) {
        delete this.hashStore[dbname];
        return Promise.resolve();
    }
}

// CONCATENATED MODULE: ./packages/memory-storage/src/index.ts
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "MemoryStorage", function() { return memory_storage_MemoryStorage; });


/* harmony default export */ var src = __webpack_exports__["default"] = (memory_storage_MemoryStorage);


/***/ }),
/* 2 */
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


/***/ })
/******/ ]);
});
//# sourceMappingURL=lokidb.memory-storage.js.map