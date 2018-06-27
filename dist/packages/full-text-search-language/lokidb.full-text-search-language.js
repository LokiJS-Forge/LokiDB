(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("@lokidb/full-text-search-language", [], factory);
	else if(typeof exports === 'object')
		exports["@lokidb/full-text-search-language"] = factory();
	else
		{ root["@lokidb/full-text-search-language"] = factory(); root["LokiFullTextSearchLanguage"] = root["@lokidb/full-text-search-language"].default; }
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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// CONCATENATED MODULE: ./packages/full-text-search-language/src/language.ts
/*
 * From MihaiValentin/lunr-languages.
 * Last update from 2017/04/16 - 19af41fb9bd644d9081ad274f96f700b21464290
 */
function generateTrimmer(wordCharacters) {
    const regex = new RegExp(`^[^${wordCharacters}]+|[^${wordCharacters}]+$`, "g");
    return (token) => token.replace(regex, "");
}
function generateStopWordFilter(stopWords) {
    const words = new Set(stopWords);
    return (token) => words.has(token) ? "" : token;
}
class Among {
    constructor(s, substring_i, result, method) {
        if ((!s && s !== "") || (!substring_i && (substring_i !== 0)) || !result) {
            throw ("Bad Among initialisation: s:" + s + ", substring_i: " + substring_i + ", result: " + result);
        }
        this.s_size = s.length;
        this.substring_i = substring_i;
        this.result = result;
        this.method = method;
        // Split string into a numeric character array.
        this.s = new Array(this.s_size);
        for (let i = 0; i < this.s_size; i++) {
            this.s[i] = +s.charCodeAt(i);
        }
    }
}
class SnowballProgram {
    constructor() {
        this.current = null;
        this.bra = 0;
        this.ket = 0;
        this.limit = 0;
        this.cursor = 0;
        this.limit_backward = 0;
    }
    setCurrent(word) {
        this.current = word;
        this.cursor = 0;
        this.limit = word.length;
        this.limit_backward = 0;
        this.bra = this.cursor;
        this.ket = this.limit;
    }
    getCurrent() {
        let result = this.current;
        this.current = null;
        return result;
    }
    in_grouping(s, min, max) {
        if (this.cursor < this.limit) {
            let ch = this.current.charCodeAt(this.cursor);
            if (ch <= max && ch >= min) {
                ch -= min;
                if (s[ch >> 3] & (0X1 << (ch & 0X7))) {
                    this.cursor++;
                    return true;
                }
            }
        }
        return false;
    }
    in_grouping_b(s, min, max) {
        if (this.cursor > this.limit_backward) {
            let ch = this.current.charCodeAt(this.cursor - 1);
            if (ch <= max && ch >= min) {
                ch -= min;
                if (s[ch >> 3] & (0X1 << (ch & 0X7))) {
                    this.cursor--;
                    return true;
                }
            }
        }
        return false;
    }
    out_grouping(s, min, max) {
        if (this.cursor < this.limit) {
            let ch = this.current.charCodeAt(this.cursor);
            if (ch > max || ch < min) {
                this.cursor++;
                return true;
            }
            ch -= min;
            if (!(s[ch >> 3] & (0X1 << (ch & 0X7)))) {
                this.cursor++;
                return true;
            }
        }
        return false;
    }
    out_grouping_b(s, min, max) {
        if (this.cursor > this.limit_backward) {
            let ch = this.current.charCodeAt(this.cursor - 1);
            if (ch > max || ch < min) {
                this.cursor--;
                return true;
            }
            ch -= min;
            if (!(s[ch >> 3] & (0X1 << (ch & 0X7)))) {
                this.cursor--;
                return true;
            }
        }
        return false;
    }
    eq_s(s_size, s) {
        if (this.limit - this.cursor < s_size) {
            return false;
        }
        for (let i = 0; i < s_size; i++) {
            if (this.current.charCodeAt(this.cursor + i) !== s.charCodeAt(i)) {
                return false;
            }
        }
        this.cursor += s_size;
        return true;
    }
    eq_s_b(s_size, s) {
        if (this.cursor - this.limit_backward < s_size) {
            return false;
        }
        for (let i = 0; i < s_size; i++) {
            if (this.current.charCodeAt(this.cursor - s_size + i) !== s.charCodeAt(i)) {
                return false;
            }
        }
        this.cursor -= s_size;
        return true;
    }
    find_among(v, v_size) {
        let i = 0;
        let j = v_size;
        let c = this.cursor;
        let l = this.limit;
        let common_i = 0;
        let common_j = 0;
        let first_key_inspected = false;
        while (true) {
            let k = i + ((j - i) >> 1);
            let diff = 0;
            let common = common_i < common_j ? common_i : common_j;
            let w = v[k];
            for (let i2 = common; i2 < w.s_size; i2++) {
                if (c + common === l) {
                    diff = -1;
                    break;
                }
                diff = this.current.charCodeAt(c + common) - w.s[i2];
                if (diff) {
                    break;
                }
                common++;
            }
            if (diff < 0) {
                j = k;
                common_j = common;
            }
            else {
                i = k;
                common_i = common;
            }
            if (j - i <= 1) {
                if (i > 0 || j === i || first_key_inspected) {
                    break;
                }
                first_key_inspected = true;
            }
        }
        while (true) {
            let w = v[i];
            if (common_i >= w.s_size) {
                this.cursor = c + w.s_size;
                if (!w.method) {
                    return w.result;
                }
                let res = w.method();
                this.cursor = c + w.s_size;
                if (res) {
                    return w.result;
                }
            }
            i = w.substring_i;
            if (i < 0) {
                return 0;
            }
        }
    }
    find_among_b(v, v_size) {
        let i = 0;
        let j = v_size;
        let c = this.cursor;
        let lb = this.limit_backward;
        let common_i = 0;
        let common_j = 0;
        let first_key_inspected = false;
        while (true) {
            let k = i + ((j - i) >> 1);
            let diff = 0;
            let common = common_i < common_j
                ? common_i
                : common_j;
            let w = v[k];
            for (let i2 = w.s_size - 1 - common; i2 >= 0; i2--) {
                if (c - common === lb) {
                    diff = -1;
                    break;
                }
                diff = this.current.charCodeAt(c - 1 - common) - w.s[i2];
                if (diff)
                    break;
                common++;
            }
            if (diff < 0) {
                j = k;
                common_j = common;
            }
            else {
                i = k;
                common_i = common;
            }
            if (j - i <= 1) {
                if (i > 0 || j === i || first_key_inspected)
                    break;
                first_key_inspected = true;
            }
        }
        while (true) {
            let w = v[i];
            if (common_i >= w.s_size) {
                this.cursor = c - w.s_size;
                if (!w.method)
                    return w.result;
                let res = w.method();
                this.cursor = c - w.s_size;
                if (res)
                    return w.result;
            }
            i = w.substring_i;
            if (i < 0)
                return 0;
        }
    }
    replace_s(c_bra, c_ket, s) {
        let adjustment = s.length - (c_ket - c_bra);
        let left = this.current
            .substring(0, c_bra);
        let right = this.current.substring(c_ket);
        this.current = left + s + right;
        this.limit += adjustment;
        if (this.cursor >= c_ket)
            this.cursor += adjustment;
        else if (this.cursor > c_bra)
            this.cursor = c_bra;
        return adjustment;
    }
    slice_check() {
        if (this.bra < 0 || this.bra > this.ket || this.ket > this.limit
            || this.limit > this.current.length) {
            throw ("faulty slice operation");
        }
    }
    slice_from(s) {
        this.slice_check();
        this.replace_s(this.bra, this.ket, s);
    }
    slice_del() {
        this.slice_from("");
    }
    insert(c_bra, c_ket, s) {
        let adjustment = this.replace_s(c_bra, c_ket, s);
        if (c_bra <= this.bra)
            this.bra += adjustment;
        if (c_bra <= this.ket)
            this.ket += adjustment;
    }
    slice_to() {
        this.slice_check();
        return this.current.substring(this.bra, this.ket);
    }
    eq_v_b(s) {
        return this.eq_s_b(s.length, s);
    }
}

// CONCATENATED MODULE: ./packages/full-text-search-language/src/index.ts
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "generateStopWordFilter", function() { return generateStopWordFilter; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "generateTrimmer", function() { return generateTrimmer; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "Among", function() { return Among; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "SnowballProgram", function() { return SnowballProgram; });



/***/ })
/******/ ]);
});
//# sourceMappingURL=lokidb.full-text-search-language.js.map