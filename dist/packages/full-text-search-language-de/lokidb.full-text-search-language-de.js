(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("@lokidb/full-text-search-language"));
	else if(typeof define === 'function' && define.amd)
		define("@lokidb/full-text-search-language-de", ["@lokidb/full-text-search-language"], factory);
	else if(typeof exports === 'object')
		exports["@lokidb/full-text-search-language-de"] = factory(require("@lokidb/full-text-search-language"));
	else
		{ root["@lokidb/full-text-search-language-de"] = factory(root["@lokidb/full-text-search-language"]); root["LokiFullTextSearchLanguageDe"] = root["@lokidb/full-text-search-language-de"].default; }
})(typeof self !== 'undefined' ? self : this, function(__WEBPACK_EXTERNAL_MODULE__0__) {
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
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__0__;

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// EXTERNAL MODULE: external "@lokidb/full-text-search-language"
var full_text_search_language_ = __webpack_require__(0);

// CONCATENATED MODULE: ./packages/full-text-search-language-de/src/german_analyzer.ts

class german_analyzer_GermanStemmer {
    constructor() {
        // Write everything in the constructor to reduce code size and increase performance.
        // The original implementation uses a ES5 anonymous function class.
        let a_0 = [new full_text_search_language_["Among"]("", -1, 6), new full_text_search_language_["Among"]("U", 0, 2),
            new full_text_search_language_["Among"]("Y", 0, 1), new full_text_search_language_["Among"]("\u00E4", 0, 3),
            new full_text_search_language_["Among"]("\u00F6", 0, 4), new full_text_search_language_["Among"]("\u00FC", 0, 5)
        ];
        let a_1 = [
            new full_text_search_language_["Among"]("e", -1, 2), new full_text_search_language_["Among"]("em", -1, 1),
            new full_text_search_language_["Among"]("en", -1, 2), new full_text_search_language_["Among"]("ern", -1, 1),
            new full_text_search_language_["Among"]("er", -1, 1), new full_text_search_language_["Among"]("s", -1, 3),
            new full_text_search_language_["Among"]("es", 5, 2)
        ];
        let a_2 = [new full_text_search_language_["Among"]("en", -1, 1),
            new full_text_search_language_["Among"]("er", -1, 1), new full_text_search_language_["Among"]("st", -1, 2),
            new full_text_search_language_["Among"]("est", 2, 1)
        ];
        let a_3 = [new full_text_search_language_["Among"]("ig", -1, 1),
            new full_text_search_language_["Among"]("lich", -1, 1)
        ];
        let a_4 = [new full_text_search_language_["Among"]("end", -1, 1),
            new full_text_search_language_["Among"]("ig", -1, 2), new full_text_search_language_["Among"]("ung", -1, 1),
            new full_text_search_language_["Among"]("lich", -1, 3), new full_text_search_language_["Among"]("isch", -1, 2),
            new full_text_search_language_["Among"]("ik", -1, 2), new full_text_search_language_["Among"]("heit", -1, 3),
            new full_text_search_language_["Among"]("keit", -1, 4)
        ];
        let g_v = [17, 65, 16, 1, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 8, 0, 32, 8
        ];
        let g_s_ending = [117, 30, 5];
        let g_st_ending = [
            117, 30, 4
        ];
        let I_x;
        let I_p2;
        let I_p1;
        let sbp = new full_text_search_language_["SnowballProgram"]();
        this.setCurrent = (word) => {
            sbp.setCurrent(word);
        };
        this.getCurrent = () => sbp.getCurrent();
        function habr1(c1, c2, v_1) {
            if (sbp.eq_s(1, c1)) {
                sbp.ket = sbp.cursor;
                if (sbp.in_grouping(g_v, 97, 252)) {
                    sbp.slice_from(c2);
                    sbp.cursor = v_1;
                    return true;
                }
            }
            return false;
        }
        function r_prelude() {
            let v_1 = sbp.cursor;
            let v_2;
            let v_3;
            let v_4;
            let v_5;
            while (true) {
                v_2 = sbp.cursor;
                sbp.bra = v_2;
                if (sbp.eq_s(1, "\u00DF")) {
                    sbp.ket = sbp.cursor;
                    sbp.slice_from("ss");
                }
                else {
                    if (v_2 >= sbp.limit)
                        break;
                    sbp.cursor = v_2 + 1;
                }
            }
            sbp.cursor = v_1;
            while (true) {
                v_3 = sbp.cursor;
                while (true) {
                    v_4 = sbp.cursor;
                    if (sbp.in_grouping(g_v, 97, 252)) {
                        v_5 = sbp.cursor;
                        sbp.bra = v_5;
                        if (habr1("u", "U", v_4))
                            break;
                        sbp.cursor = v_5;
                        if (habr1("y", "Y", v_4))
                            break;
                    }
                    if (v_4 >= sbp.limit) {
                        sbp.cursor = v_3;
                        return;
                    }
                    sbp.cursor = v_4 + 1;
                }
            }
        }
        function habr2() {
            while (!sbp.in_grouping(g_v, 97, 252)) {
                if (sbp.cursor >= sbp.limit)
                    return true;
                sbp.cursor++;
            }
            while (!sbp.out_grouping(g_v, 97, 252)) {
                if (sbp.cursor >= sbp.limit)
                    return true;
                sbp.cursor++;
            }
            return false;
        }
        function r_mark_regions() {
            I_p1 = sbp.limit;
            I_p2 = I_p1;
            let c = sbp.cursor + 3;
            if (0 <= c && c <= sbp.limit) {
                I_x = c;
                if (!habr2()) {
                    I_p1 = sbp.cursor;
                    if (I_p1 < I_x)
                        I_p1 = I_x;
                    if (!habr2())
                        I_p2 = sbp.cursor;
                }
            }
        }
        function r_postlude() {
            let among_var;
            let v_1;
            while (true) {
                v_1 = sbp.cursor;
                sbp.bra = v_1;
                among_var = sbp.find_among(a_0, 6);
                if (!among_var)
                    return;
                sbp.ket = sbp.cursor;
                switch (among_var) {
                    case 1:
                        sbp.slice_from("y");
                        break;
                    case 2:
                    case 5:
                        sbp.slice_from("u");
                        break;
                    case 3:
                        sbp.slice_from("a");
                        break;
                    case 4:
                        sbp.slice_from("o");
                        break;
                    case 6:
                        if (sbp.cursor >= sbp.limit)
                            return;
                        sbp.cursor++;
                        break;
                }
            }
        }
        function r_R1() {
            return I_p1 <= sbp.cursor;
        }
        function r_R2() {
            return I_p2 <= sbp.cursor;
        }
        function r_standard_suffix() {
            let among_var;
            let v_1 = sbp.limit - sbp.cursor;
            let v_2;
            let v_3;
            let v_4;
            sbp.ket = sbp.cursor;
            among_var = sbp.find_among_b(a_1, 7);
            if (among_var) {
                sbp.bra = sbp.cursor;
                if (r_R1()) {
                    switch (among_var) {
                        case 1:
                            sbp.slice_del();
                            break;
                        case 2:
                            sbp.slice_del();
                            sbp.ket = sbp.cursor;
                            if (sbp.eq_s_b(1, "s")) {
                                sbp.bra = sbp.cursor;
                                if (sbp.eq_s_b(3, "nis"))
                                    sbp.slice_del();
                            }
                            break;
                        case 3:
                            if (sbp.in_grouping_b(g_s_ending, 98, 116))
                                sbp.slice_del();
                            break;
                    }
                }
            }
            sbp.cursor = sbp.limit - v_1;
            sbp.ket = sbp.cursor;
            among_var = sbp.find_among_b(a_2, 4);
            if (among_var) {
                sbp.bra = sbp.cursor;
                if (r_R1()) {
                    switch (among_var) {
                        case 1:
                            sbp.slice_del();
                            break;
                        case 2:
                            if (sbp.in_grouping_b(g_st_ending, 98, 116)) {
                                let c = sbp.cursor - 3;
                                if (sbp.limit_backward <= c && c <= sbp.limit) {
                                    sbp.cursor = c;
                                    sbp.slice_del();
                                }
                            }
                            break;
                    }
                }
            }
            sbp.cursor = sbp.limit - v_1;
            sbp.ket = sbp.cursor;
            among_var = sbp.find_among_b(a_4, 8);
            if (among_var) {
                sbp.bra = sbp.cursor;
                if (r_R2()) {
                    switch (among_var) {
                        case 1:
                            sbp.slice_del();
                            sbp.ket = sbp.cursor;
                            if (sbp.eq_s_b(2, "ig")) {
                                sbp.bra = sbp.cursor;
                                v_2 = sbp.limit - sbp.cursor;
                                if (!sbp.eq_s_b(1, "e")) {
                                    sbp.cursor = sbp.limit - v_2;
                                    if (r_R2())
                                        sbp.slice_del();
                                }
                            }
                            break;
                        case 2:
                            v_3 = sbp.limit - sbp.cursor;
                            if (!sbp.eq_s_b(1, "e")) {
                                sbp.cursor = sbp.limit - v_3;
                                sbp.slice_del();
                            }
                            break;
                        case 3:
                            sbp.slice_del();
                            sbp.ket = sbp.cursor;
                            v_4 = sbp.limit - sbp.cursor;
                            if (!sbp.eq_s_b(2, "er")) {
                                sbp.cursor = sbp.limit - v_4;
                                if (!sbp.eq_s_b(2, "en"))
                                    break;
                            }
                            sbp.bra = sbp.cursor;
                            if (r_R1())
                                sbp.slice_del();
                            break;
                        case 4:
                            sbp.slice_del();
                            sbp.ket = sbp.cursor;
                            among_var = sbp.find_among_b(a_3, 2);
                            if (among_var) {
                                sbp.bra = sbp.cursor;
                                if (r_R2() && among_var === 1)
                                    sbp.slice_del();
                            }
                            break;
                    }
                }
            }
        }
        this.stem = () => {
            let v_1 = sbp.cursor;
            r_prelude();
            sbp.cursor = v_1;
            r_mark_regions();
            sbp.limit_backward = v_1;
            sbp.cursor = sbp.limit;
            r_standard_suffix();
            sbp.cursor = sbp.limit_backward;
            r_postlude();
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
const st = new german_analyzer_GermanStemmer();
function stemmer(token) {
    st.setCurrent(token);
    st.stem();
    return st.getCurrent();
}
const trimmer = Object(full_text_search_language_["generateTrimmer"])("A-Za-z\xAA\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02B8\u02E0-\u02E4\u1D00-\u1D25\u1D2C-\u1D5C\u1D62-\u1D65\u1D6B-\u1D77\u1D79-\u1DBE\u1E00-\u1EFF\u2071\u207F\u2090-\u209C\u212A\u212B\u2132\u214E\u2160-\u2188\u2C60-\u2C7F\uA722-\uA787\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA7FF\uAB30-\uAB5A\uAB5C-\uAB64\uFB00-\uFB06\uFF21-\uFF3A\uFF41-\uFF5A");
const stopWordFilter = Object(full_text_search_language_["generateStopWordFilter"])(["aber", "alle", "allem", "allen", "aller", "alles", "als", "also", "am", "an", "ander", "andere", "anderem", "anderen", "anderer", "anderes", "anderm", "andern", "anderr", "anders", "auch", "auf", "aus", "bei", "bin", "bis", "bist", "da", "damit", "dann", "das", "dasselbe", "dazu", "daß", "dein", "deine", "deinem", "deinen", "deiner", "deines", "dem", "demselben", "den", "denn", "denselben", "der", "derer", "derselbe", "derselben", "des", "desselben", "dessen", "dich", "die", "dies", "diese", "dieselbe", "dieselben", "diesem", "diesen", "dieser", "dieses", "dir", "doch", "dort", "du", "durch", "ein", "eine", "einem", "einen", "einer", "eines", "einig", "einige", "einigem", "einigen", "einiger", "einiges", "einmal", "er", "es", "etwas", "euch", "euer", "eure", "eurem", "euren", "eurer", "eures", "für", "gegen", "gewesen", "hab", "habe", "haben", "hat", "hatte", "hatten", "hier", "hin", "hinter", "ich", "ihm", "ihn", "ihnen", "ihr", "ihre", "ihrem", "ihren", "ihrer", "ihres", "im", "in", "indem", "ins", "ist", "jede", "jedem", "jeden", "jeder", "jedes", "jene", "jenem", "jenen", "jener", "jenes", "jetzt", "kann", "kein", "keine", "keinem", "keinen", "keiner", "keines", "können", "könnte", "machen", "man", "manche", "manchem", "manchen", "mancher", "manches", "mein", "meine", "meinem", "meinen", "meiner", "meines", "mich", "mir", "mit", "muss", "musste", "nach", "nicht", "nichts", "noch", "nun", "nur", "ob", "oder", "ohne", "sehr", "sein", "seine", "seinem", "seinen", "seiner", "seines", "selbst", "sich", "sie", "sind", "so", "solche", "solchem", "solchen", "solcher", "solches", "soll", "sollte", "sondern", "sonst", "um", "und", "uns", "unse", "unsem", "unsen", "unser", "unses", "unter", "viel", "vom", "von", "vor", "war", "waren", "warst", "was", "weg", "weil", "weiter", "welche", "welchem", "welchen", "welcher", "welches", "wenn", "werde", "werden", "wie", "wieder", "will", "wir", "wird", "wirst", "wo", "wollen", "wollte", "während", "würde", "würden", "zu", "zum", "zur", "zwar", "zwischen", "über"]);
// Export the analyzer.
class GermanAnalyzer {
    constructor() {
        this.tokenizer = splitter;
        this.token_filter = [trimmer, stemmer, stopWordFilter];
    }
}

// CONCATENATED MODULE: ./packages/full-text-search-language-de/src/index.ts
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "GermanAnalyzer", function() { return GermanAnalyzer; });


/* harmony default export */ var src = __webpack_exports__["default"] = (GermanAnalyzer);


/***/ })
/******/ ]);
});
//# sourceMappingURL=lokidb.full-text-search-language-de.js.map