(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("@lokijs/loki"), require("fs"));
	else if(typeof define === 'function' && define.amd)
		define(["@lokijs/loki", "fs"], factory);
	else if(typeof exports === 'object')
		exports["@lokijs/fs-storage"] = factory(require("@lokijs/loki"), require("fs"));
	else
{		root["@lokijs/fs-storage"] = factory(root["@lokijs/loki"], root["fs"]); root["LokiFsStorage"] = root["@lokijs/fs-storage"].default;}
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_2__) {
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
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__loki_src_loki__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__loki_src_loki___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__loki_src_loki__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_fs__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_fs___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_fs__);



/**
 * A loki persistence adapter which persists using node fs module.
 */
class LokiFSStorage {
  /**
   * loadDatabase() - Load data from file, will throw an error if the file does not exist
   * @param {string} dbname - the filename of the database to load
   * @returns {Promise} a Promise that resolves after the database was loaded
   */
  loadDatabase(dbname) {
    return new Promise((resolve, reject) => {
      __WEBPACK_IMPORTED_MODULE_1_fs___default.a.stat(dbname, (err, stats) => {
        if (!err && stats.isFile()) {
          __WEBPACK_IMPORTED_MODULE_1_fs___default.a.readFile(dbname, {
            encoding: "utf8"
          }, function readFileCallback(err, data) {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          });
        } else {
          reject();
        }
      });
    });
  }

  /**
   * saveDatabase() - save data to file, will throw an error if the file can't be saved
   * might want to expand this to avoid dataloss on partial save
   * @param {string} dbname - the filename of the database to load
   * @returns {Promise} a Promise that resolves after the database was persisted
   */
  saveDatabase(dbname, dbstring) {
    const tmpdbname = dbname + "~";

    return new Promise((resolve, reject) => {
      __WEBPACK_IMPORTED_MODULE_1_fs___default.a.writeFile(tmpdbname, dbstring, (err) => {
        if (err) {
          reject(err);
        } else {
          __WEBPACK_IMPORTED_MODULE_1_fs___default.a.rename(tmpdbname, dbname, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        }
      });
    });
  }

  /**
   * deleteDatabase() - delete the database file, will throw an error if the
   * file can't be deleted
   * @param {string} dbname - the filename of the database to delete
   * @returns {Promise} a Promise that resolves after the database was deleted
   */
  deleteDatabase(dbname) {
    return new Promise((resolve, reject) => {
      __WEBPACK_IMPORTED_MODULE_1_fs___default.a.unlink(dbname, function deleteDatabaseCallback(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
/* harmony export (immutable) */ __webpack_exports__["LokiFSStorage"] = LokiFSStorage;


__WEBPACK_IMPORTED_MODULE_0__loki_src_loki__["Loki"].LokiFSStorage = LokiFSStorage;

/* harmony default export */ __webpack_exports__["default"] = (LokiFSStorage);


/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ })
/******/ ]);
});
//# sourceMappingURL=lokijs.fs-storage.js.map