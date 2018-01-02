(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("@lokijs/full-text-search"), require("@lokijs/full-text-search-language"));
	else if(typeof define === 'function' && define.amd)
		define(["@lokijs/full-text-search", "@lokijs/full-text-search-language"], factory);
	else if(typeof exports === 'object')
		exports["@lokijs/full-text-search-language-en"] = factory(require("@lokijs/full-text-search"), require("@lokijs/full-text-search-language"));
	else
{		root["@lokijs/full-text-search-language-en"] = factory(root["@lokijs/full-text-search"], root["@lokijs/full-text-search-language"]); root["LokiFullTextSearchLanguageEn"] = root["@lokijs/full-text-search-language-en"].default;}
})(typeof self !== 'undefined' ? self : this, function(__WEBPACK_EXTERNAL_MODULE_2__, __WEBPACK_EXTERNAL_MODULE_3__) {
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
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__en__ = __webpack_require__(1);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "EN", function() { return __WEBPACK_IMPORTED_MODULE_0__en__["a"]; });


/* harmony default export */ __webpack_exports__["default"] = (__WEBPACK_IMPORTED_MODULE_0__en__["a" /* EN */]);


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__full_text_search_src_index__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__full_text_search_src_index___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__full_text_search_src_index__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__full_text_search_language_src_language__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__full_text_search_language_src_language___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__full_text_search_language_src_language__);
/*
 * From olivernn/lunr.js.
 * Last update from 2017/10/14 - 2dc9c6c6c41b1f5850f2bed0a82d8cd45835d166
 */


class EnglishStemmer {
    constructor() {
        // Write everything in the constructor to reduce code size and increase performance.
        // The original implementation uses a ES5 anonymous function class.
        const step2list = {
            "ational": "ate",
            "tional": "tion",
            "enci": "ence",
            "anci": "ance",
            "izer": "ize",
            "bli": "ble",
            "alli": "al",
            "entli": "ent",
            "eli": "e",
            "ousli": "ous",
            "ization": "ize",
            "ation": "ate",
            "ator": "ate",
            "alism": "al",
            "iveness": "ive",
            "fulness": "ful",
            "ousness": "ous",
            "aliti": "al",
            "iviti": "ive",
            "biliti": "ble",
            "logi": "log"
        };
        const step3list = {
            "icate": "ic",
            "ative": "",
            "alize": "al",
            "iciti": "ic",
            "ical": "ic",
            "ful": "",
            "ness": ""
        };
        const c = "[^aeiou]"; // consonant
        const v = "[aeiouy]"; // vowel
        const C = c + "[^aeiouy]*"; // consonant sequence
        const V = v + "[aeiou]*"; // vowel sequence
        const mgr0 = "^(" + C + ")?" + V + C; // [C]VC... is m>0
        const meq1 = "^(" + C + ")?" + V + C + "(" + V + ")?$"; // [C]VC[V] is m=1
        const mgr1 = "^(" + C + ")?" + V + C + V + C; // [C]VCVC... is m>1
        const s_v = "^(" + C + ")?" + v; // vowel in stem
        const re_mgr0 = new RegExp(mgr0);
        const re_mgr1 = new RegExp(mgr1);
        const re_meq1 = new RegExp(meq1);
        const re_s_v = new RegExp(s_v);
        const re_1a = /^(.+?)(ss|i)es$/;
        const re2_1a = /^(.+?)([^s])s$/;
        const re_1b = /^(.+?)eed$/;
        const re2_1b = /^(.+?)(ed|ing)$/;
        const re_1b_2 = /.$/;
        const re2_1b_2 = /(at|bl|iz)$/;
        const re3_1b_2 = new RegExp("([^aeiouylsz])\\1$");
        const re4_1b_2 = new RegExp("^" + C + v + "[^aeiouwxy]$");
        const re_1c = /^(.+?[^aeiou])y$/;
        const re_2 = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
        const re_3 = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
        const re_4 = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
        const re2_4 = /^(.+?)([st])(ion)$/;
        const re_5 = /^(.+?)e$/;
        const re_5_1 = /ll$/;
        const re3_5 = new RegExp("^" + C + v + "[^aeiouwxy]$");
        this.porterStemmer = (w) => {
            let stem;
            let suffix;
            let firstch;
            let re;
            let re2;
            let re3;
            let re4;
            if (w.length < 3) {
                return w;
            }
            firstch = w.substr(0, 1);
            if (firstch === "y") {
                w = firstch.toUpperCase() + w.substr(1);
            }
            // Step 1a
            re = re_1a;
            re2 = re2_1a;
            if (re.test(w)) {
                w = w.replace(re, "$1$2");
            }
            else if (re2.test(w)) {
                w = w.replace(re2, "$1$2");
            }
            // Step 1b
            re = re_1b;
            re2 = re2_1b;
            if (re.test(w)) {
                const fp = re.exec(w);
                re = re_mgr0;
                if (re.test(fp[1])) {
                    re = re_1b_2;
                    w = w.replace(re, "");
                }
            }
            else if (re2.test(w)) {
                const fp = re2.exec(w);
                stem = fp[1];
                re2 = re_s_v;
                if (re2.test(stem)) {
                    w = stem;
                    re2 = re2_1b_2;
                    re3 = re3_1b_2;
                    re4 = re4_1b_2;
                    if (re2.test(w)) {
                        w = w + "e";
                    }
                    else if (re3.test(w)) {
                        re = re_1b_2;
                        w = w.replace(re, "");
                    }
                    else if (re4.test(w)) {
                        w = w + "e";
                    }
                }
            }
            // Step 1c - replace suffix y or Y by i if preceded by a non-vowel which is not the first letter of the word (so cry -> cri, by -> by, say -> say)
            re = re_1c;
            if (re.test(w)) {
                const fp = re.exec(w);
                stem = fp[1];
                w = stem + "i";
            }
            // Step 2
            re = re_2;
            if (re.test(w)) {
                const fp = re.exec(w);
                stem = fp[1];
                suffix = fp[2];
                re = re_mgr0;
                if (re.test(stem)) {
                    w = stem + step2list[suffix];
                }
            }
            // Step 3
            re = re_3;
            if (re.test(w)) {
                const fp = re.exec(w);
                stem = fp[1];
                suffix = fp[2];
                re = re_mgr0;
                if (re.test(stem)) {
                    w = stem + step3list[suffix];
                }
            }
            // Step 4
            re = re_4;
            re2 = re2_4;
            if (re.test(w)) {
                const fp = re.exec(w);
                stem = fp[1];
                re = re_mgr1;
                if (re.test(stem)) {
                    w = stem;
                }
            }
            else if (re2.test(w)) {
                const fp = re2.exec(w);
                stem = fp[1] + fp[2];
                re2 = re_mgr1;
                if (re2.test(stem)) {
                    w = stem;
                }
            }
            // Step 5
            re = re_5;
            if (re.test(w)) {
                const fp = re.exec(w);
                stem = fp[1];
                re = re_mgr1;
                re2 = re_meq1;
                re3 = re3_5;
                if (re.test(stem) || (re2.test(stem) && !(re3.test(stem)))) {
                    w = stem;
                }
            }
            re = re_5_1;
            re2 = re_mgr1;
            if (re.test(w) && re2.test(w)) {
                re = re_1b_2;
                w = w.replace(re, "");
            }
            // and turn initial Y back to y
            if (firstch === "y") {
                w = firstch.toLowerCase() + w.substr(1);
            }
            return w;
        };
    }
}
// Split at whitespace and dashes.
function splitter(str) {
    let trimmedTokens = [];
    let tokens = str.split(/[\s-]+/);
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i] !== "") {
            trimmedTokens.push(tokens[i].toLowerCase());
        }
    }
    return trimmedTokens;
}
const st = new EnglishStemmer();
function stemmer(token) {
    return st.porterStemmer(token);
}
const trimmer = Object(__WEBPACK_IMPORTED_MODULE_1__full_text_search_language_src_language__["generateTrimmer"])("A-Za-z\xAA\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02B8\u02E0-\u02E4\u1D00-\u1D25\u1D2C-\u1D5C\u1D62-\u1D65\u1D6B-\u1D77\u1D79-\u1DBE\u1E00-\u1EFF\u2071\u207F\u2090-\u209C\u212A\u212B\u2132\u214E\u2160-\u2188\u2C60-\u2C7F\uA722-\uA787\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA7FF\uAB30-\uAB5A\uAB5C-\uAB64\uFB00-\uFB06\uFF21-\uFF3A\uFF41-\uFF5A");
const stopWordFilter = Object(__WEBPACK_IMPORTED_MODULE_1__full_text_search_language_src_language__["generateStopWordFilter"])(["a", "able", "about", "across", "after", "all", "almost", "also", "am", "among", "an", "and", "any", "are", "as", "at", "be", "because", "been", "but", "by", "can", "cannot", "could", "dear", "did", "do", "does", "either", "else", "ever", "every", "for", "from", "get", "got", "had", "has", "have", "he", "her", "hers", "him", "his", "how", "however", "i", "if", "in", "into", "is", "it", "its", "just", "least", "let", "like", "likely", "may", "me", "might", "most", "must", "my", "neither", "no", "nor", "not", "of", "off", "often", "on", "only", "or", "other", "our", "own", "rather", "said", "say", "says", "she", "should", "since", "so", "some", "than", "that", "the", "their", "them", "then", "there", "these", "they", "this", "tis", "to", "too", "twas", "us", "wants", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why", "will", "with", "would", "yet", "you", "your"]);
// Create, configure and export the tokenizer.
const EN = new __WEBPACK_IMPORTED_MODULE_0__full_text_search_src_index__["Tokenizer"]();
/* harmony export (immutable) */ __webpack_exports__["a"] = EN;

EN.setSplitter("whitespace-splitter", splitter);
EN.add("trimmer-en", trimmer);
EN.add("stemmer-en", stemmer);
EN.add("stopWordFilter-en", stopWordFilter);


/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_3__;

/***/ })
/******/ ]);
});
//# sourceMappingURL=lokijs.full-text-search-language-en.js.map