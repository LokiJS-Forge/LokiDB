(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["@lokidb/memory-storage"] = factory();
	else
{		root["@lokidb/memory-storage"] = factory(); root["LokiMemoryStorage"] = root["@lokidb/memory-storage"].default;}
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
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
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
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__memory_storage__ = __webpack_require__(1);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "MemoryStorage", function() { return __WEBPACK_IMPORTED_MODULE_0__memory_storage__["a"]; });


/* harmony default export */ __webpack_exports__["default"] = (__WEBPACK_IMPORTED_MODULE_0__memory_storage__["a" /* MemoryStorage */]);


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__common_plugin__ = __webpack_require__(2);

/**
 * An in-memory persistence adapter for an in-memory database.
 * This simple 'key/value' adapter is intended for unit testing and diagnostics.
 */
class MemoryStorage {
    /**
     * Registers the local storage as plugin.
     */
    static register() {
        __WEBPACK_IMPORTED_MODULE_0__common_plugin__["a" /* PLUGINS */]["MemoryStorage"] = MemoryStorage;
    }
    /**
     * Deregisters the local storage as plugin.
     */
    static deregister() {
        delete __WEBPACK_IMPORTED_MODULE_0__common_plugin__["a" /* PLUGINS */]["MemoryStorage"];
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
/* harmony export (immutable) */ __webpack_exports__["a"] = MemoryStorage;



/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {function getGlobal() {
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
/* harmony export (immutable) */ __webpack_exports__["a"] = PLUGINS;


/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(3)))

/***/ }),
/* 3 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ })
/******/ ]);
});
//# sourceMappingURL=lokidb.memory-storage.js.map