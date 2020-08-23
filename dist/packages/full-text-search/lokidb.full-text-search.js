(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("@lokidb/full-text-search", [], factory);
	else if(typeof exports === 'object')
		exports["@lokidb/full-text-search"] = factory();
	else
		{ root["@lokidb/full-text-search"] = factory(); root["LokiFullTextSearch"] = root["@lokidb/full-text-search"].default; }
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

// CONCATENATED MODULE: ./packages/full-text-search/src/analyzer/tokenizer.ts
/**
 * Splits a string at whitespace characters into tokens.
 * @param {string} value - the string
 * @returns {string[]} - the tokens
 */
function whitespaceTokenizer(value) {
    return value.split(/[\s]+/);
}

// CONCATENATED MODULE: ./packages/full-text-search/src/analyzer/token_filter.ts
/**
 * Converts a token to lowercase.
 * @param {string} token - the token
 * @returns {string} - the lowercased token
 */
function lowercaseTokenFilter(token) {
    return token.toLowerCase();
}
/**
 * Converts a token to uppercase.
 * @param {string} token - the token
 * @returns {string} - the uppercased token
 */
function uppercaseTokenFilter(token) {
    return token.toUpperCase();
}

// CONCATENATED MODULE: ./packages/full-text-search/src/analyzer/analyzer.ts


/**
 * Analyzes a given string.
 * @param {Analyzer} analyzer - the analyzer
 * @param {string} str - the string
 * @returns {string[]} - the tokens
 */
function analyze(analyzer, str) {
    if (analyzer.char_filter) {
        for (let j = 0; j < analyzer.char_filter.length; j++) {
            str = analyzer.char_filter[j](str);
        }
    }
    const tokens = analyzer.tokenizer(str);
    if (analyzer.token_filter) {
        for (let i = 0; i < tokens.length; i++) {
            for (let k = 0; k < analyzer.token_filter.length; k++) {
                tokens[i] = analyzer.token_filter[k](tokens[i], i, tokens);
            }
        }
    }
    // Remove empty tokens.
    return tokens.filter((token) => token);
}
/**
 * An analyzer with the whitespace tokenizer and the lowercase token filter.
 */
class analyzer_StandardAnalyzer {
    constructor() {
        this.tokenizer = whitespaceTokenizer;
        this.token_filter = [lowercaseTokenFilter];
    }
}

// CONCATENATED MODULE: ./packages/full-text-search/src/inverted_index.ts

/**
 * Converts a string into an array of code points.
 * @param str - the string
 * @returns {number[]} to code points
 * @hidden
 */
function toCodePoints(str) {
    const r = [];
    for (let i = 0; i < str.length;) {
        const chr = str.charCodeAt(i++);
        if (chr >= 0xD800 && chr <= 0xDBFF) {
            // surrogate pair
            const low = str.charCodeAt(i++);
            r.push(0x10000 + ((chr - 0xD800) << 10) | (low - 0xDC00));
        }
        else {
            // ordinary character
            r.push(chr);
        }
    }
    return r;
}
/**
 * Inverted index class handles featured text search for specific document fields.
 * @hidden
 */
class inverted_index_InvertedIndex {
    /**
     * @param {boolean} [options.store=true] - inverted index will be stored at serialization rather than rebuilt on load
     * @param {boolean} [options.optimizeChanges=true] - flag to store additional metadata inside the index for better
     *  performance if an existing field is updated or removed
     * @param {Analyzer} [options.analyzer=] - the analyzer of this inverted index
     */
    constructor(options = {}) {
        this.docCount = 0;
        this.docStore = new Map();
        this.totalFieldLength = 0;
        this.root = new Map();
        ({
            store: this._store = true,
            optimizeChanges: this._optimizeChanges = true,
            analyzer: this.analyzer = new analyzer_StandardAnalyzer()
        } = options);
    }
    /**
     * Adds defined fields of a document to the inverted index.
     * @param {string} field - the field to add
     * @param {number} docId - the doc id of the field
     */
    insert(field, docId) {
        if (this.docStore.has(docId)) {
            throw Error("Field already added.");
        }
        // Tokenize document field.
        const fieldTokens = analyze(this.analyzer, field);
        if (fieldTokens.length == 0) {
            // Add empty field at least to document store for query 'exists'.
            this.docStore.set(docId, { fieldLength: 0 });
            return;
        }
        this.totalFieldLength += fieldTokens.length;
        this.docCount += 1;
        this.docStore.set(docId, { fieldLength: fieldTokens.length });
        // Holds references to each index of a document.
        const indexRef = [];
        if (this._optimizeChanges) {
            Object.defineProperties(this.docStore.get(docId), {
                indexRef: { enumerable: false, configurable: true, writable: true, value: indexRef }
            });
        }
        // Iterate over all unique field terms.
        for (const token of new Set(fieldTokens)) {
            // Calculate term frequency.
            let tf = 0;
            for (let j = 0; j < fieldTokens.length; j++) {
                if (fieldTokens[j] === token) {
                    ++tf;
                }
            }
            // Add term to index tree.
            let branch = this.root;
            for (const c of toCodePoints(token)) {
                let child = branch.get(c);
                if (child === undefined) {
                    child = new Map();
                    if (this._optimizeChanges) {
                        child.pa = branch;
                    }
                    branch.set(c, child);
                }
                branch = child;
            }
            // Add term info to index leaf.
            if (branch.dc === undefined) {
                branch.dc = new Map();
                branch.df = 0;
            }
            branch.dc.set(docId, tf);
            branch.df += 1;
            // Store index leaf for deletion.
            indexRef.push(branch);
        }
    }
    /**
     * Removes all relevant terms of a document from the inverted index.
     * @param {number} docId - the document.
     */
    remove(docId) {
        if (!this.docStore.has(docId)) {
            return;
        }
        const docStore = this.docStore.get(docId);
        // Remove document.
        this.docStore.delete(docId);
        if (docStore.fieldLength === 0) {
            return;
        }
        this.docCount -= 1;
        // Reduce total field length.
        this.totalFieldLength -= docStore.fieldLength;
        if (this._optimizeChanges) {
            // Iterate over all term references.
            // Remove docId from docs and decrement document frequency.
            const indexRef = docStore.indexRef;
            for (let j = 0; j < indexRef.length; j++) {
                let index = indexRef[j];
                index.df -= 1;
                index.dc.delete(docId);
                // Check if no document is left for current tree.
                if (index.df === 0) {
                    // Delete unused meta data of branch.
                    delete index.df;
                    delete index.dc;
                    // Check for sub branches.
                    if (index.size !== 0) {
                        continue;
                    }
                    // Delete term branch if not used anymore.
                    do {
                        // Go tree upwards.
                        const parent = index.pa;
                        // Delete parent reference for preventing memory leak (cycle reference).
                        delete index.pa;
                        // Iterate over all children.
                        for (const key of parent.keys()) {
                            // Remove previous child form parent.
                            if (parent.get(key) === index) {
                                parent.delete(key);
                                break;
                            }
                        }
                        index = parent;
                    } while (index.pa !== undefined && index.size === 0 && index.df === undefined);
                }
            }
        }
        else {
            this._remove(this.root, docId);
        }
    }
    /**
     * Gets the term index of a term.
     * @param {string} term - the term
     * @param {object} root - the term index to start from
     * @param {number} start - the position of the term string to start from
     * @return {object} - The term index or null if the term is not in the term tree.
     */
    static getTermIndex(term, root, start = 0) {
        if (start >= term.length) {
            return null;
        }
        for (let i = start; i < term.length; i++) {
            let child = root.get(term[i]);
            if (child === undefined) {
                return null;
            }
            root = child;
        }
        return root;
    }
    /**
     * Extends a term index to all available term leafs.
     * @param {object} idx - the term index to start from
     * @param {number[]} [term=[]] - the current term
     * @param {Array} termIndices - all extended indices with their term
     * @returns {Array} - Array with term indices and extension
     */
    static extendTermIndex(idx, term = [], termIndices = []) {
        if (idx.df !== undefined) {
            termIndices.push({ index: idx, term: term.slice() });
        }
        term.push(0);
        for (const child of idx) {
            term[term.length - 1] = child[0];
            inverted_index_InvertedIndex.extendTermIndex(child[1], term, termIndices);
        }
        term.pop();
        return termIndices;
    }
    /**
     * Serialize the inverted index.
     * @returns {{docStore: *, _fields: *, index: *}}
     */
    toJSON() {
        if (this._store) {
            return {
                _store: true,
                _optimizeChanges: this._optimizeChanges,
                docCount: this.docCount,
                docStore: [...this.docStore],
                totalFieldLength: this.totalFieldLength,
                root: inverted_index_InvertedIndex._serializeIndex(this.root)
            };
        }
        return {
            _store: false,
            _optimizeChanges: this._optimizeChanges,
        };
    }
    /**
     * Deserialize the inverted index.
     * @param {{docStore: *, _fields: *, index: *}} serialized - The serialized inverted index.
     * @param {Analyzer} analyzer[undefined] - an analyzer
     */
    static fromJSONObject(serialized, analyzer) {
        const invIdx = new inverted_index_InvertedIndex({
            store: serialized._store,
            optimizeChanges: serialized._optimizeChanges,
            analyzer: analyzer
        });
        if (serialized._store) {
            invIdx.docCount = serialized.docCount;
            invIdx.docStore = new Map(serialized.docStore);
            invIdx.totalFieldLength = serialized.totalFieldLength;
            invIdx.root = inverted_index_InvertedIndex._deserializeIndex(serialized.root);
        }
        if (invIdx._optimizeChanges) {
            invIdx._regenerate(invIdx.root, null);
        }
        return invIdx;
    }
    static _serializeIndex(idx) {
        const serialized = {};
        if (idx.dc !== undefined) {
            serialized.d = { df: idx.df, dc: [...idx.dc] };
        }
        if (idx.size === 0) {
            return serialized;
        }
        const keys = [];
        const values = [];
        for (const child of idx) {
            keys.push(child[0]);
            values.push(inverted_index_InvertedIndex._serializeIndex(child[1]));
        }
        serialized.k = keys;
        serialized.v = values;
        return serialized;
    }
    static _deserializeIndex(serialized) {
        const idx = new Map();
        if (serialized.k !== undefined) {
            for (let i = 0; i < serialized.k.length; i++) {
                idx.set(serialized.k[i], inverted_index_InvertedIndex._deserializeIndex(serialized.v[i]));
            }
        }
        if (serialized.d !== undefined) {
            idx.df = serialized.d.df;
            idx.dc = new Map(serialized.d.dc);
        }
        return idx;
    }
    /**
     * Set parent of to each index and regenerate the indexRef.
     * @param {Index} index - the index
     * @param {Index} parent - the parent
     */
    _regenerate(index, parent) {
        // Set parent.
        if (parent !== null) {
            index.pa = parent;
        }
        // Iterate over subtree.
        for (const child of index.values()) {
            this._regenerate(child, index);
        }
        if (index.dc !== undefined) {
            // Get documents of term.
            for (const docId of index.dc.keys()) {
                // Get document store at specific document/field.
                const ref = this.docStore.get(docId);
                if (ref.indexRef === undefined) {
                    Object.defineProperties(ref, {
                        indexRef: { enumerable: false, configurable: true, writable: true, value: [] }
                    });
                }
                // Set reference to term index.
                ref.indexRef.push(index);
            }
        }
    }
    /**
     * Iterate over the whole inverted index and remove the document.
     * Delete branch if not needed anymore.
     * Function is needed if index is used without optimization.
     * @param {Index} idx - the index
     * @param {number} docId - the doc id
     * @returns {boolean} true if index is empty
     */
    _remove(idx, docId) {
        for (const child of idx) {
            // Checkout branch.
            if (this._remove(child[1], docId)) {
                idx.delete(child[0]);
            }
        }
        // Remove docId from docs and decrement document frequency.
        if (idx.df !== undefined) {
            if (idx.dc.has(docId)) {
                idx.df -= 1;
                idx.dc.delete(docId);
                // Delete unused meta data of branch.
                if (idx.df === 0) {
                    delete idx.df;
                    delete idx.dc;
                }
            }
        }
        return idx.size === 0 && idx.dc === undefined;
    }
}

// CONCATENATED MODULE: ./packages/full-text-search/src/scorer.ts
/**
 * @hidden
 */
class Scorer {
    constructor(invIdxs) {
        this._cache = {};
        this._invIdxs = invIdxs;
    }
    setDirty() {
        this._cache = {};
    }
    score(fieldName, boost, termIdx, doScoring, queryResults, term, df = 0) {
        if (termIdx === null || termIdx.dc === undefined) {
            return;
        }
        const idf = this._idf(fieldName, df || termIdx.df);
        for (const [docId, tf] of termIdx.dc) {
            if (!queryResults.has(docId)) {
                queryResults.set(docId, []);
            }
            if (doScoring === true) {
                // BM25 scoring.
                queryResults.get(docId).push({ tf, idf, boost, fieldName, term });
            }
            else if (doScoring === false) {
                // Constant scoring.
                queryResults.set(docId, [{ boost }]);
            }
            else {
                // Zero scoring.
                queryResults.set(docId, [{ boost: 0 }]);
            }
        }
    }
    scoreConstant(boost, docId, queryResults) {
        if (!queryResults.has(docId)) {
            queryResults.set(docId, []);
        }
        queryResults.get(docId).push({ boost });
        return queryResults;
    }
    finalScore(query, queryResults) {
        const finalResult = {};
        const k1 = query.bm25 !== undefined ? query.bm25.k1 : 1.2;
        const b = query.bm25 !== undefined ? query.bm25.b : 0.75;
        const explain = query.explain !== undefined ? query.explain : false;
        for (const [docId, result] of queryResults) {
            let docScore = 0;
            let docExplanation = [];
            for (let i = 0; i < result.length; i++) {
                const queryResult = result[i];
                let score = 0;
                if (queryResult.tf !== undefined) {
                    // BM25 scoring.
                    const tf = queryResult.tf;
                    const fieldLength = Scorer._calculateFieldLength(this._invIdxs[queryResult.fieldName].docStore.get(docId)
                        .fieldLength);
                    const avgFieldLength = this._avgFieldLength(queryResult.fieldName);
                    const tfNorm = (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (fieldLength / avgFieldLength)));
                    score = queryResult.idf * tfNorm * queryResult.boost;
                    if (explain) {
                        docExplanation.push({
                            boost: queryResult.boost,
                            score: score,
                            docID: docId,
                            fieldName: queryResult.fieldName,
                            index: String.fromCharCode(...queryResult.term),
                            idf: queryResult.idf,
                            tfNorm: tfNorm,
                            tf: tf,
                            fieldLength: fieldLength,
                            avgFieldLength: avgFieldLength,
                        });
                    }
                }
                else {
                    // Constant scoring.
                    score = queryResult.boost;
                    if (explain) {
                        docExplanation.push({
                            boost: queryResult.boost,
                            score: score
                        });
                    }
                }
                docScore += score;
            }
            if (explain) {
                finalResult[docId] = {
                    score: docScore,
                    explanation: docExplanation
                };
            }
            else {
                finalResult[docId] = {
                    score: docScore
                };
            }
        }
        return finalResult;
    }
    static _calculateFieldLength(fieldLength) {
        // Dummy function to be compatible to lucene in unit tests.
        return fieldLength;
    }
    _getCache(fieldName) {
        if (this._cache[fieldName] === undefined) {
            const avgFieldLength = this._invIdxs[fieldName].totalFieldLength / this._invIdxs[fieldName].docCount;
            this._cache[fieldName] = { idfs: {}, avgFieldLength };
        }
        return this._cache[fieldName];
    }
    /**
     * Returns the idf by either calculate it or use a cached one.
     * @param {string} fieldName - the name of the field
     * @param {number} docFreq - the doc frequency of the term
     * @returns {number} the idf
     * @private
     */
    _idf(fieldName, docFreq) {
        const cache = this._getCache(fieldName);
        if (cache.idfs[docFreq] !== undefined) {
            return cache.idfs[docFreq];
        }
        return cache.idfs[docFreq] = Math.log(1 + (this._invIdxs[fieldName].docCount - docFreq + 0.5) / (docFreq + 0.5));
    }
    _avgFieldLength(fieldName) {
        return this._getCache(fieldName).avgFieldLength;
    }
}

// CONCATENATED MODULE: ./packages/full-text-search/src/fuzzy/run_automaton.ts
/**
 * From org/apache/lucene/util/automaton/RunAutomaton.java
 * @hidden
 */
class RunAutomaton {
    constructor(automaton) {
        const size = automaton.getNumStates();
        this._points = automaton.getStartPoints();
        this._accept = new Array(size);
        this._transitions = new Array(size * this._points.length);
        for (let n = 0; n < size; n++) {
            this._accept[n] = automaton.isAccept(n);
            for (let c = 0; c < this._points.length; c++) {
                // assert dest === -1 || dest < size;
                this._transitions[n * this._points.length + c] = automaton.step(n, this._points[c]);
            }
        }
        this._classmap = new Array(256 /* alphaSize */);
        for (let i = 0, j = 0; j < this._classmap.length; j++) {
            if (i + 1 < this._points.length && j === this._points[i + 1]) {
                i++;
            }
            this._classmap[j] = i;
        }
    }
    getCharClass(c) {
        // binary search
        let a = 0;
        let b = this._points.length;
        while (b - a > 1) {
            const d = (a + b) >>> 1;
            if (this._points[d] > c) {
                b = d;
            }
            else if (this._points[d] < c) {
                a = d;
            }
            else {
                return d;
            }
        }
        return a;
    }
    step(state, c) {
        if (c >= this._classmap.length) {
            return this._transitions[state * this._points.length + this.getCharClass(c)];
        }
        else {
            return this._transitions[state * this._points.length + this._classmap[c]];
        }
    }
    isAccept(state) {
        return this._accept[state];
    }
}

// CONCATENATED MODULE: ./packages/full-text-search/src/fuzzy/automaton.ts
/**
 * @type {number}
 * @hidden
 */
const MIN_CODE_POINT = 0;
/**
 * @type {number}
 * @hidden
 */
const MAX_CODE_POINT = 1114111;
function sortByDestMinMax(a, b) {
    if (a[0] < b[0]) {
        return -1;
    }
    else if (a[0] > b[0]) {
        return 1;
    }
    if (a[1] < b[1]) {
        return -1;
    }
    else if (a[1] > b[1]) {
        return 1;
    }
    if (a[2] < b[2]) {
        return -1;
    }
    else if (a[2] > b[2]) {
        return 1;
    }
    return 0;
}
function sortByMinMaxDest(a, b) {
    if (a[1] < b[1]) {
        return -1;
    }
    else if (a[1] > b[1]) {
        return 1;
    }
    if (a[2] < b[2]) {
        return -1;
    }
    else if (a[2] > b[2]) {
        return 1;
    }
    if (a[0] < b[0]) {
        return -1;
    }
    else if (a[0] > b[0]) {
        return 1;
    }
    return 0;
}
/**
 * From org/apache/lucene/util/automaton/Automaton.java
 * @hidden
 */
class Automaton {
    constructor() {
        this._stateTransitions = [];
        this._stateTransitions = [];
        this._accept = new Set();
        this._nextState = 0;
        this._currState = -1;
        // this.deterministic = true;
        this._transitions = {};
    }
    isAccept(n) {
        return this._accept.has(n);
    }
    createState() {
        return this._nextState++;
    }
    setAccept(state, accept) {
        if (accept) {
            this._accept.add(state);
        }
        else {
            this._accept.delete(state);
        }
    }
    finishState() {
        if (this._currState !== -1) {
            this._finishCurrentState();
            this._currState = -1;
        }
    }
    _finishCurrentState() {
        // Sort all transitions.
        this._stateTransitions.sort(sortByDestMinMax);
        let upto = 0;
        let p = [-1, -1, -1];
        for (let i = 0, len = this._stateTransitions.length; i < len; i++) {
            let t = this._stateTransitions[i];
            if (p[0] === t[0]) {
                if (t[1] <= p[2] + 1) {
                    if (t[2] > p[2]) {
                        p[2] = t[2];
                    }
                }
                else {
                    if (p[0] !== -1) {
                        this._stateTransitions[upto][0] = p[0];
                        this._stateTransitions[upto][1] = p[1];
                        this._stateTransitions[upto][2] = p[2];
                        upto++;
                    }
                    p[1] = t[1];
                    p[2] = t[2];
                }
            }
            else {
                if (p[0] !== -1) {
                    this._stateTransitions[upto][0] = p[0];
                    this._stateTransitions[upto][1] = p[1];
                    this._stateTransitions[upto][2] = p[2];
                    upto++;
                }
                p[0] = t[0];
                p[1] = t[1];
                p[2] = t[2];
            }
        }
        if (p[0] !== -1) {
            // Last transition
            this._stateTransitions[upto][0] = p[0];
            this._stateTransitions[upto][1] = p[1];
            this._stateTransitions[upto][2] = p[2];
            upto++;
        }
        this._transitions[this._currState] = this._stateTransitions.slice(0, upto).sort(sortByMinMaxDest);
        // if (this.deterministic && upto > 1) {
        //   let lastMax = this.stateTransitions[0][2];
        //   for (let i = 1; i < upto; i++) {
        //     let min = this.stateTransitions[i][1];
        //     if (min <= lastMax) {
        //       this.deterministic = false;
        //       break;
        //     }
        //     lastMax = this.stateTransitions[i][2];
        //   }
        // }
        this._stateTransitions = [];
    }
    getStartPoints() {
        const pointset = new Set();
        pointset.add(MIN_CODE_POINT);
        const states = Object.keys(this._transitions);
        for (let i = 0; i < states.length; i++) {
            let trans = this._transitions[states[i]];
            for (let j = 0; j < trans.length; j++) {
                let tran = trans[j];
                pointset.add(tran[1]);
                if (tran[2] < MAX_CODE_POINT) {
                    pointset.add(tran[2] + 1);
                }
            }
        }
        return Array.from(pointset).sort((a, b) => a - b);
    }
    step(state, label) {
        let trans = this._transitions[state];
        if (trans) {
            for (let i = 0; i < trans.length; i++) {
                let tran = trans[i];
                if (tran[1] <= label && label <= tran[2]) {
                    return tran[0];
                }
            }
        }
        return -1;
    }
    getNumStates() {
        return this._nextState;
    }
    addTransition(source, dest, min, max) {
        if (this._currState !== source) {
            if (this._currState !== -1) {
                this._finishCurrentState();
            }
            this._currState = source;
        }
        this._stateTransitions.push([dest, min, max]);
    }
}

// CONCATENATED MODULE: ./packages/full-text-search/src/fuzzy/long.ts
/**
 * Class supports 64Bit integer operations.
 * A cut-down version of dcodeIO/long.js.
 * @hidden
 */
class Long {
    constructor(low = 0, high = 0) {
        this._low = low;
        this._high = high;
    }
    /**
     * Returns this long with bits arithmetically shifted to the right by the given amount.
     * @param {number} numBits - number of bits
     * @returns {Long} the long
     */
    shiftRight(numBits) {
        if ((numBits &= 63) === 0)
            return this;
        else if (numBits < 32)
            return new Long((this._low >>> numBits) | (this._high << (32 - numBits)), this._high >> numBits);
        else
            return new Long((this._high >> (numBits - 32)), this._high >= 0 ? 0 : -1);
    }
    /**
     * Returns this long with bits arithmetically shifted to the left by the given amount.
     * @param {number} numBits - number of bits
     * @returns {Long} the long
     */
    shiftLeft(numBits) {
        if ((numBits &= 63) === 0)
            return this;
        else if (numBits < 32)
            return new Long(this._low << numBits, (this._high << numBits) | (this._low >>> (32 - numBits)));
        else
            return new Long(0, this._low << (numBits - 32));
    }
    /**
     * Returns the bitwise AND of this Long and the specified.
     * @param {Long} other - the other Long
     * @returns {Long} the long
     */
    and(other) {
        return new Long(this._low & other._low, this._high & other._high);
    }
    /**
     * Converts the Long to a 32 bit integer, assuming it is a 32 bit integer.
     * @returns {number}
     */
    toInt() {
        return this._low;
    }
}

// CONCATENATED MODULE: ./packages/full-text-search/src/fuzzy/parametric_description.ts

const MASKS = [new Long(0x1), new Long(0x3), new Long(0x7), new Long(0xf),
    new Long(0x1f), new Long(0x3f), new Long(0x7f), new Long(0xff),
    new Long(0x1ff), new Long(0x3ff), new Long(0x7ff), new Long(0xfff),
    new Long(0x1fff), new Long(0x3fff), new Long(0x7fff), new Long(0xffff),
    new Long(0xf, 0x1fff), new Long(0xf, 0x3fff), new Long(0xf, 0x7fff), new Long(0xf, 0xffff),
    new Long(0xff, 0x1fff), new Long(0xff, 0x3fff), new Long(0xff, 0x7fff), new Long(0xff, 0xffff),
    new Long(0xfff, 0x1fff), new Long(0xfff, 0x3fff), new Long(0xfff, 0x7fff), new Long(0xfff, 0xffff),
    new Long(0xffff, 0x1fff), new Long(0xffff, 0x3fff), new Long(0xffff, 0x7fff), new Long(0xffff, 0xffff),
    new Long(0xfffff, 0x1fff), new Long(0xfffff, 0x3fff), new Long(0xfffff, 0x7fff), new Long(0xfffff, 0xffff),
    new Long(0xffffff, 0x1fff), new Long(0xffffff, 0x3fff), new Long(0xffffff, 0x7fff), new Long(0xffffff, 0xffff),
    new Long(0xfffffff, 0x1fff), new Long(0xfffffff, 0x3fff), new Long(0xfffffff, 0x7fff), new Long(0xfffffff, 0xffff),
    new Long(0xffffffff, 0x1fff), new Long(0xffffffff, 0x3fff), new Long(0xffffffff, 0x7fff), new Long(0xffffffff, 0xffff),
    new Long(0xfffffffff, 0x1fff), new Long(0xfffffffff, 0x3fff), new Long(0xfffffffff, 0x7fff), new Long(0xfffffffff, 0xffff),
    new Long(0xffffffffff, 0x1fff), new Long(0xffffffffff, 0x3fff), new Long(0xffffffffff, 0x7fff), new Long(0xffffffffff, 0xffff),
    new Long(0xfffffffffff, 0x1fff), new Long(0xfffffffffff, 0x3fff), new Long(0xfffffffffff, 0x7fff), new Long(0xfffffffffff, 0xffff),
    new Long(0xffffffffffff, 0x1fff), new Long(0xffffffffffff, 0x3fff), new Long(0xffffffffffff, 0x7fff)];
/**
 * From org/apache/lucene/util/automaton/LevenshteinAutomata.java#ParametricDescription
 * @hidden
 */
class ParametricDescription {
    constructor(w, n, minErrors) {
        this._w = w;
        this._n = n;
        this._minErrors = minErrors;
    }
    /**
     * Return the number of states needed to compute a Levenshtein DFA
     */
    size() {
        return this._minErrors.length * (this._w + 1);
    }
    /**
     * Returns true if the <code>state</code> in any Levenshtein DFA is an accept state (final state).
     */
    isAccept(absState) {
        // decode absState -> state, offset
        let state = Math.floor(absState / (this._w + 1));
        let offset = absState % (this._w + 1);
        //assert offset >= 0;
        return this._w - offset + this._minErrors[state] <= this._n;
    }
    /**
     * Returns the position in the input word for a given <code>state</code>.
     * This is the minimal boundary for the state.
     */
    getPosition(absState) {
        return absState % (this._w + 1);
    }
    static unpack(data, index, bitsPerValue) {
        const bitLoc = bitsPerValue * index;
        const dataLoc = (bitLoc >> 6);
        const bitStart = (bitLoc & 63);
        if (bitStart + bitsPerValue <= 64) {
            // not split
            return data[dataLoc].shiftRight(bitStart).and(MASKS[bitsPerValue - 1]).toInt();
        }
        else {
            // split
            const part = 64 - bitStart;
            return (data[dataLoc].shiftRight(bitStart).and(MASKS[part - 1])).toInt()
                + (data[1 + dataLoc].and(MASKS[bitsPerValue - part - 1]).shiftLeft(part)).toInt();
        }
    }
}

// CONCATENATED MODULE: ./packages/full-text-search/src/fuzzy/lev1t_parametric_description.ts


// 1 vectors; 2 states per vector; array length = 2
const toStates0 = [new Long(0x2)];
const offsetIncrs0 = [new Long(0x0)];
// 2 vectors; 3 states per vector; array length = 6
const toStates1 = [new Long(0xa43)];
const offsetIncrs1 = [new Long(0x38)];
// 4 vectors; 6 states per vector; array length = 24
const toStates2 = [new Long(0x82140003, 0x34534914), new Long(0x6d)];
const offsetIncrs2 = [new Long(0x55a20000, 0x5555)];
// 8 vectors; 6 states per vector; array length = 48
const toStates3 = [new Long(0x900C0003, 0x21520854), new Long(0x4534916d, 0x5b4d19a2), new Long(0xda34)];
const offsetIncrs3 = [new Long(0x20fc0000, 0x5555ae0a), new Long(0x55555555)];
// state map
//   0 -> [(0, 0)]
//   1 -> [(0, 1)]
//   2 -> [(0, 1), (1, 1)]
//   3 -> [(0, 1), (2, 1)]
//   4 -> [t(0, 1), (0, 1), (1, 1), (2, 1)]
//   5 -> [(0, 1), (1, 1), (2, 1)]
/**
 * From org/apache/lucene/util/automaton/Lev1TParametricDescription.java
 * @hidden
 */
class lev1t_parametric_description_Lev1TParametricDescription extends ParametricDescription {
    constructor(w) {
        super(w, 1, [0, 1, 0, -1, -1, -1]);
    }
    transition(absState, position, vector) {
        // null absState should never be passed in
        //assert absState != -1;
        // decode absState -> state, offset
        let state = Math.floor(absState / (this._w + 1));
        let offset = absState % (this._w + 1);
        //assert offset >= 0;
        if (position === this._w) {
            if (state < 2) {
                const loc = vector * 2 + state;
                offset += ParametricDescription.unpack(offsetIncrs0, loc, 1);
                state = ParametricDescription.unpack(toStates0, loc, 2) - 1;
            }
        }
        else if (position === this._w - 1) {
            if (state < 3) {
                const loc = vector * 3 + state;
                offset += ParametricDescription.unpack(offsetIncrs1, loc, 1);
                state = ParametricDescription.unpack(toStates1, loc, 2) - 1;
            }
        }
        else if (position === this._w - 2) {
            if (state < 6) {
                const loc = vector * 6 + state;
                offset += ParametricDescription.unpack(offsetIncrs2, loc, 2);
                state = ParametricDescription.unpack(toStates2, loc, 3) - 1;
            }
        }
        else {
            if (state < 6) {
                const loc = vector * 6 + state;
                offset += ParametricDescription.unpack(offsetIncrs3, loc, 2);
                state = ParametricDescription.unpack(toStates3, loc, 3) - 1;
            }
        }
        if (state === -1) {
            // null state
            return -1;
        }
        else {
            // translate back to abs
            return state * (this._w + 1) + offset;
        }
    }
}

// CONCATENATED MODULE: ./packages/full-text-search/src/fuzzy/lev2t_parametric_description.ts


// 1 vectors; 3 states per vector; array length = 3
const lev2t_parametric_description_toStates0 = /*2 bits per value */ [
    new Long(0x23)
];
const lev2t_parametric_description_offsetIncrs0 = /*1 bits per value */ [
    new Long(0x0)
];
// 2 vectors; 5 states per vector; array length = 10
const lev2t_parametric_description_toStates1 = /*3 bits per value */ [
    new Long(0x13688b44)
];
const lev2t_parametric_description_offsetIncrs1 = /*1 bits per value */ [
    new Long(0x3e0)
];
// 4 vectors; 13 states per vector; array length = 52
const lev2t_parametric_description_toStates2 = /*4 bits per value */ [
    new Long(0x5200b504, 0x60dbb0b0), new Long(0x27062227, 0x52332176), new Long(0x14323235, 0x23555432), new Long(0x4354)
];
const lev2t_parametric_description_offsetIncrs2 = /*2 bits per value */ [
    new Long(0x00002000, 0x555080a8), new Long(0x55555555, 0x55)
];
// 8 vectors; 28 states per vector; array length = 224
const lev2t_parametric_description_toStates3 = /*5 bits per value */ [
    new Long(0x40059404, 0xe701c029), new Long(0x00a50000, 0xa0101620), new Long(0xa1416288, 0xb02c8c40), new Long(0x310858c0, 0xa821032),
    new Long(0x0d28b201, 0x31442398), new Long(0x847788e0, 0x5281e528), new Long(0x08c2280e, 0xa23980d3), new Long(0xa962278c, 0x1e3294b1),
    new Long(0x2288e528, 0x8c41309e), new Long(0x021aca21, 0x11444409), new Long(0x86b1086b, 0x11a46248), new Long(0x1d6240c4, 0x2a625894),
    new Long(0x489074ad, 0x5024a50b), new Long(0x520c411a, 0x14821aca), new Long(0x0b594a44, 0x5888b589), new Long(0xc411a465, 0x941d6520),
    new Long(0xad6a62d4, 0x8b589075), new Long(0x1a5055a4)
];
const lev2t_parametric_description_offsetIncrs3 = /*2 bits per value */ [
    new Long(0x00002000, 0x30c302), new Long(0xc3fc333c, 0x2a0030f3), new Long(0x8282a820, 0x233a0032), new Long(0x32b283a8, 0x55555555),
    new Long(0x55555555, 0x55555555), new Long(0x55555555, 0x55555555), new Long(0x55555555, 0x55555555)
];
// 16 vectors; 45 states per vector; array length = 720
const toStates4 = /*6 bits per value */ [
    new Long(0x002c5004, 0x3801450), new Long(0x00000e38, 0xc500014b), new Long(0x51401402, 0x514), new Long(0x0),
    new Long(0x14010000, 0x518000b), new Long(0x28e20230, 0x9f1c208), new Long(0x830a70c2, 0x219f0df0), new Long(0x08208200, 0x82000082),
    new Long(0x60800800, 0x8050501), new Long(0x02602643, 0x30820986), new Long(0x50508064, 0x45640142), new Long(0x20000831, 0x8500514),
    new Long(0x85002082, 0x41405820), new Long(0x0990c201, 0x45618098), new Long(0x50a01051, 0x8316d0c), new Long(0x050df0e0, 0x21451420),
    new Long(0x14508214, 0xd142140), new Long(0x50821c60, 0x3c21c018), new Long(0xcb142087, 0x1cb1403), new Long(0x1851822c, 0x80082145),
    new Long(0x20800020, 0x200208), new Long(0x87180345, 0xd0061820), new Long(0x24976b09, 0xcb0a81cb), new Long(0x624709d1, 0x8b1a60e),
    new Long(0x82249089, 0x2490820), new Long(0x00d2c024, 0xc31421c6), new Long(0x15454423, 0x3c314515), new Long(0xc21cb140, 0x31853c22),
    new Long(0x2c208214, 0x4514500b), new Long(0x508b0051, 0x8718034), new Long(0x5108f0c5, 0xb2cb4551), new Long(0x1cb0a810, 0xe824715d),
    new Long(0x908b0e60, 0x1422cb14), new Long(0xc02cb145, 0x30812c22), new Long(0x0cb1420c, 0x84202202), new Long(0x20ce0850, 0x5c20ce08),
    new Long(0x8b0d70c2, 0x20820820), new Long(0x14214208, 0x42085082), new Long(0x50830c20, 0x9208340), new Long(0x13653592, 0xc6134dc6),
    new Long(0x6dc4db4d, 0xd309341c), new Long(0x54d34d34, 0x6424d908), new Long(0x030814c2, 0x92072c22), new Long(0x24a30930, 0x4220724b),
    new Long(0x25c920e2, 0x2470d720), new Long(0x975c9082, 0x92c92d70), new Long(0x04924e08, 0xcb0880c2), new Long(0xc24c2481, 0x45739728),
    new Long(0xda6174da, 0xc6da4db5), new Long(0x5d30971d, 0x4b5d35d7), new Long(0x93825ce2, 0x1030815c), new Long(0x020cb145, 0x51442051),
    new Long(0x2c220e2c, 0xc538210e), new Long(0x52cb0d70, 0x8514214), new Long(0x85145142, 0x204b0850), new Long(0x4051440c, 0x92156083),
    new Long(0xa60e6595, 0x4d660e4d), new Long(0x1c6dc658, 0x94d914e4), new Long(0x1454d365, 0x82642659), new Long(0x51030813, 0x2892072c),
    new Long(0xcb2ca30b, 0xe2c22072), new Long(0x20538910, 0x452c70d7), new Long(0x708e3891, 0x8b2cb2d), new Long(0xc204b24e, 0x81cb1440),
    new Long(0x28c2ca24, 0xda44e38e), new Long(0x85d660e4, 0x1dc6da65), new Long(0x8e5d914e, 0xe2cb5d33), new Long(0x38938238)
];
const offsetIncrs4 = /*3 bits per value */ [
    new Long(0x00080000, 0x30020000), new Long(0x20c060), new Long(0x04000000, 0x81490000), new Long(0x10824824, 0x40249241),
    new Long(0x60002082, 0xdb6030c3), new Long(0x301b0d80, 0x6c36c06c), new Long(0x000db0db, 0xb01861b0), new Long(0x9188e06d, 0x1b703620),
    new Long(0x06d86db7, 0x8009200), new Long(0x02402490, 0x4920c24), new Long(0x08249009, 0x490002), new Long(0x28124804, 0x49081281),
    new Long(0x124a44a2, 0x34800104), new Long(0x0d24020c, 0xc3093090), new Long(0x24c24d24, 0x40009a09), new Long(0x9201061a, 0x4984a06),
    new Long(0x71269262, 0x494d0492), new Long(0x92492492, 0x24924924), new Long(0x49249249, 0x92492492), new Long(0x24924924, 0x49249249),
    new Long(0x92492492, 0x24924924), new Long(0x49249249, 0x92492492), new Long(0x24924924, 0x49249249), new Long(0x92492492, 0x24924924),
    new Long(0x49249249, 0x92492492), new Long(0x24924924, 0x49249249), new Long(0x92492492, 0x24924924), new Long(0x49249249, 0x92492492),
    new Long(0x24924924, 0x49249249), new Long(0x92492492, 0x24924924), new Long(0x49249249, 0x92492492), new Long(0x24924924, 0x49249249),
    new Long(0x92492492, 0x24924924), new Long(0x49249249, 0x2492)
];
// 32 vectors; 45 states per vector; array length = 1440
const toStates5 = /*6 bits per value */ [
    new Long(0x002c5004, 0x3801450), new Long(0x00000e38, 0xc500014b), new Long(0x51401402, 0x514), new Long(0x0),
    new Long(0x14010000, 0x514000b), new Long(0x038e00e0, 0x550000), new Long(0x0600b180, 0x26451850), new Long(0x08208208, 0x82082082),
    new Long(0x40820820, 0x2c500), new Long(0x808c0146, 0x70820a38), new Long(0x9c30827c, 0xc37c20c2), new Long(0x20800867, 0x208208),
    new Long(0x02002080, 0xb1401020), new Long(0x00518000, 0x828e2023), new Long(0x209f1c20, 0x830a70c), new Long(0x853df0df, 0x51451450),
    new Long(0x14508214, 0x16142142), new Long(0x30805050, 0x60260264), new Long(0x43082098, 0x25050806), new Long(0x14564014, 0x42000083),
    new Long(0x20850051, 0x8500208), new Long(0x14140582, 0x80990c20), new Long(0x08261809, 0x82019202), new Long(0x90060941, 0x8920519),
    new Long(0xc22cb242, 0x22492492), new Long(0x0162492c, 0x43080505), new Long(0x86026026, 0x80414515), new Long(0xc5b43142, 0x37c38020),
    new Long(0x14508014, 0x42085085), new Long(0x50850051, 0x1414058), new Long(0x980990c2, 0x51456180), new Long(0x0c50a010, 0xe008316d),
    new Long(0x508b21f0, 0x2c52cb2c), new Long(0xc22cb249, 0x600d2c92), new Long(0x1850821c, 0x873c21c0), new Long(0x03cb1420, 0x2c01cb14),
    new Long(0x45185182, 0x20800821), new Long(0x08208000, 0x45002002), new Long(0x20871803, 0x8700614), new Long(0x050821cf, 0x740500f5),
    new Long(0x18609000, 0x934d9646), new Long(0x30824d30, 0x4c24d34d), new Long(0xc600d642, 0x1860821), new Long(0x25dac274, 0xc2a072c9),
    new Long(0x91c27472, 0x2c698398), new Long(0x89242242, 0x92420820), new Long(0x34b00900, 0x82087180), new Long(0xb09d0061, 0x1cb24976),
    new Long(0x9d1cb0a8, 0x60e62470), new Long(0x1574ce3e, 0xd31455d7), new Long(0x25c25d74, 0x1c600d38), new Long(0x423c3142, 0x51515454),
    new Long(0x1403c314, 0xc22c21cb), new Long(0x21431853, 0xb2c208), new Long(0x05145145, 0x34508b0), new Long(0x0c508718, 0x5515108f),
    new Long(0xf2051454, 0x8740500), new Long(0x0618f090, 0xe2534d92), new Long(0x6592c238, 0x49382659), new Long(0x21c600d6, 0x4423c314),
    new Long(0xcb2d1545, 0x72c2a042), new Long(0xa091c574, 0x422c3983), new Long(0x508b2c52, 0xb2c514), new Long(0x8034b08b, 0xf0c50871),
    new Long(0x45515108, 0xa810b2cb), new Long(0x715d1cb0, 0x2260e824), new Long(0x8e2d74ce, 0xe6592c53), new Long(0x38938238, 0x420c3081),
    new Long(0x22020cb1, 0x8508420), new Long(0xce0820ce, 0x70c25c20), new Long(0x08208b0d, 0x42082082), new Long(0x50821421, 0xc204208),
    new Long(0x832c5083, 0x21080880), new Long(0x0838c214, 0xa5083882), new Long(0xa9c39430, 0xaaaaaaaa), new Long(0x9fa9faaa, 0x1aaa7eaa),
    new Long(0x1420c308, 0x824820d0), new Long(0x84d94d64, 0x7184d371), new Long(0x1b7136d3, 0x34c24d07), new Long(0x1534d34d, 0x99093642),
    new Long(0x30c20530, 0x8340508), new Long(0x53592092, 0x34dc6136), new Long(0x4db4dc61, 0xa479c6dc), new Long(0x4924924a, 0x920a9f92),
    new Long(0x8192a82a, 0x72c22030), new Long(0x30930920, 0x724b24a), new Long(0x920e2422, 0xd72025c), new Long(0xc9082247, 0x92d70975),
    new Long(0x24e0892c, 0x880c2049), new Long(0xc2481cb0, 0x2c928c24), new Long(0x89088749, 0x80a52488), new Long(0xaac74394, 0x6a861b2a),
    new Long(0xab27b278, 0x81b2ca6), new Long(0x072c2203, 0xa3093092), new Long(0x6915ce5c, 0xd76985d3), new Long(0x771b6936, 0x5d74c25c),
    new Long(0x892d74d7, 0x724e0973), new Long(0x0880c205, 0x4c2481cb), new Long(0x739728c2, 0x6174da45), new Long(0xda4db5da, 0x4aa175c6),
    new Long(0x86486186, 0x6a869b27), new Long(0x308186ca, 0xcb14510), new Long(0x44205102, 0x220e2c51), new Long(0x38210e2c, 0xcb0d70c5),
    new Long(0x51421452, 0x14514208), new Long(0x4b085085, 0x51440c20), new Long(0x1440832c, 0xcb145108), new Long(0x488b0888, 0x94316208),
    new Long(0x9f7e79c3, 0xfaaa7dfa), new Long(0x7ea7df7d, 0x30819ea), new Long(0x20d01451, 0x65648558), new Long(0x93698399, 0x96135983),
    new Long(0x39071b71, 0xd9653645), new Long(0x96451534, 0x4e09909), new Long(0x051440c2, 0x21560834), new Long(0x60e65959, 0xd660e4da),
    new Long(0xc6dc6584, 0x9207e979), new Long(0xdf924820, 0xa82a8207), new Long(0x103081a6, 0x892072c5), new Long(0xb2ca30b2, 0x2c22072c),
    new Long(0x0538910e, 0x52c70d72), new Long(0x08e38914, 0x8b2cb2d7), new Long(0x204b24e0, 0x1cb1440c), new Long(0x8c2ca248, 0x874b2cb2),
    new Long(0x24488b08, 0x43948162), new Long(0x9b1f7e77, 0x9e786aa6), new Long(0xeca6a9e7, 0x51030819), new Long(0x2892072c, 0x8e38a30b),
    new Long(0x83936913, 0x69961759), new Long(0x4538771b, 0x74ce3976), new Long(0x08e38b2d, 0xc204e24e), new Long(0x81cb1440, 0x28c2ca24),
    new Long(0xda44e38e, 0x85d660e4), new Long(0x75c6da65, 0x698607e9), new Long(0x99e7864a, 0xa6ca6aa6)
];
const offsetIncrs5 = /*3 bits per value */ [
    new Long(0x00080000, 0x30020000), new Long(0x20c060), new Long(0x04000000, 0x1000000), new Long(0x50603018, 0xdb6db6db),
    new Long(0x00002db6, 0xa4800002), new Long(0x41241240, 0x12492088), new Long(0x00104120, 0x40000100), new Long(0x92092052, 0x2492c420),
    new Long(0x096592d9, 0xc30d800), new Long(0xc36036d8, 0xb01b0c06), new Long(0x6c36db0d, 0x186c0003), new Long(0xb01b6c06, 0xad860361),
    new Long(0x5b6dd6dd, 0x360001b7), new Long(0x0db6030c, 0xc412311c), new Long(0xb6e36e06, 0xdb0d), new Long(0xdb01861b, 0x9188e06),
    new Long(0x71b72b62, 0x6dd6db), new Long(0x00800920, 0x40240249), new Long(0x904920c2, 0x20824900), new Long(0x40049000, 0x12012480),
    new Long(0xa4906120, 0x5524ad4a), new Long(0x02480015, 0x40924020), new Long(0x48409409, 0x92522512), new Long(0x24000820, 0x49201001),
    new Long(0x204a04a0, 0x29128924), new Long(0x00055549, 0x900830d2), new Long(0x24c24034, 0x934930c), new Long(0x02682493, 0x4186900),
    new Long(0x61201a48, 0x9a498612), new Long(0x355249d4, 0xc348001), new Long(0x940d2402, 0x24c40930), new Long(0x0924e24d, 0x1a40009a),
    new Long(0x06920106, 0x6204984a), new Long(0x92712692, 0x92494d54), new Long(0x24924924, 0x49249249), new Long(0x92492492, 0x24924924),
    new Long(0x49249249, 0x92492492), new Long(0x24924924, 0x49249249), new Long(0x92492492, 0x24924924), new Long(0x49249249, 0x92492492),
    new Long(0x24924924, 0x49249249), new Long(0x92492492, 0x24924924), new Long(0x49249249, 0x92492492), new Long(0x24924924, 0x49249249),
    new Long(0x92492492, 0x24924924), new Long(0x49249249, 0x92492492), new Long(0x24924924, 0x49249249), new Long(0x92492492, 0x24924924),
    new Long(0x49249249, 0x92492492), new Long(0x24924924, 0x49249249), new Long(0x92492492, 0x24924924), new Long(0x49249249, 0x92492492),
    new Long(0x24924924, 0x49249249), new Long(0x92492492, 0x24924924), new Long(0x49249249, 0x92492492), new Long(0x24924924, 0x49249249),
    new Long(0x92492492, 0x24924924), new Long(0x49249249, 0x92492492), new Long(0x24924924, 0x49249249), new Long(0x92492492, 0x24924924),
    new Long(0x49249249, 0x92492492), new Long(0x24924924, 0x49249249), new Long(0x92492492, 0x24924924), new Long(0x49249249, 0x92492492),
    new Long(0x24924924, 0x49249249), new Long(0x92492492, 0x24924924), new Long(0x49249249, 0x92492492), new Long(0x24924924)
];
// state map
//   0 -> [(0, 0)]
//   1 -> [(0, 2)]
//   2 -> [(0, 1)]
//   3 -> [(0, 1), (1, 1)]
//   4 -> [(0, 2), (1, 2)]
//   5 -> [t(0, 2), (0, 2), (1, 2), (2, 2)]
//   6 -> [(0, 2), (2, 1)]
//   7 -> [(0, 1), (2, 2)]
//   8 -> [(0, 2), (2, 2)]
//   9 -> [(0, 1), (1, 1), (2, 1)]
//   10 -> [(0, 2), (1, 2), (2, 2)]
//   11 -> [(0, 1), (2, 1)]
//   12 -> [t(0, 1), (0, 1), (1, 1), (2, 1)]
//   13 -> [(0, 2), (1, 2), (2, 2), (3, 2)]
//   14 -> [t(0, 2), (0, 2), (1, 2), (2, 2), (3, 2)]
//   15 -> [(0, 2), t(1, 2), (1, 2), (2, 2), (3, 2)]
//   16 -> [(0, 2), (2, 1), (3, 1)]
//   17 -> [(0, 1), t(1, 2), (2, 2), (3, 2)]
//   18 -> [(0, 2), (3, 2)]
//   19 -> [(0, 2), (1, 2), t(1, 2), (2, 2), (3, 2)]
//   20 -> [t(0, 2), (0, 2), (1, 2), (3, 1)]
//   21 -> [(0, 1), (1, 1), (3, 2)]
//   22 -> [(0, 2), (2, 2), (3, 2)]
//   23 -> [(0, 2), (1, 2), (3, 1)]
//   24 -> [(0, 2), (1, 2), (3, 2)]
//   25 -> [(0, 1), (2, 2), (3, 2)]
//   26 -> [(0, 2), (3, 1)]
//   27 -> [(0, 1), (3, 2)]
//   28 -> [(0, 2), (2, 1), (4, 2)]
//   29 -> [(0, 2), t(1, 2), (1, 2), (2, 2), (3, 2), (4, 2)]
//   30 -> [(0, 2), (1, 2), (4, 2)]
//   31 -> [(0, 2), (1, 2), (3, 2), (4, 2)]
//   32 -> [(0, 2), (2, 2), (3, 2), (4, 2)]
//   33 -> [(0, 2), (1, 2), t(2, 2), (2, 2), (3, 2), (4, 2)]
//   34 -> [(0, 2), (1, 2), (2, 2), t(2, 2), (3, 2), (4, 2)]
//   35 -> [(0, 2), (3, 2), (4, 2)]
//   36 -> [(0, 2), t(2, 2), (2, 2), (3, 2), (4, 2)]
//   37 -> [t(0, 2), (0, 2), (1, 2), (2, 2), (4, 2)]
//   38 -> [(0, 2), (1, 2), (2, 2), (4, 2)]
//   39 -> [t(0, 2), (0, 2), (1, 2), (2, 2), (3, 2), (4, 2)]
//   40 -> [(0, 2), (1, 2), (2, 2), (3, 2), (4, 2)]
//   41 -> [(0, 2), (4, 2)]
//   42 -> [t(0, 2), (0, 2), (1, 2), (2, 2), t(2, 2), (3, 2), (4, 2)]
//   43 -> [(0, 2), (2, 2), (4, 2)]
//   44 -> [(0, 2), (1, 2), t(1, 2), (2, 2), (3, 2), (4, 2)]
/**
 * From org/apache/lucene/util/automaton/Lev2TParametricDescription.java
 * @hidden
 */
class lev2t_parametric_description_Lev2TParametricDescription extends ParametricDescription {
    constructor(w) {
        super(w, 2, [0, 2, 1, 0, 1, 0, -1, 0, 0, -1, 0, -1, -1, -1, -1, -1, -2, -1, -1, -1, -2, -1, -1, -2, -1, -1, -2, -1, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2]);
    }
    transition(absState, position, vector) {
        // null absState should never be passed in
        // assert absState != -1;
        // decode absState -> state, offset
        let state = Math.floor(absState / (this._w + 1));
        let offset = absState % (this._w + 1);
        // assert offset >= 0;
        if (position === this._w) {
            if (state < 3) {
                const loc = vector * 3 + state;
                offset += ParametricDescription.unpack(lev2t_parametric_description_offsetIncrs0, loc, 1);
                state = ParametricDescription.unpack(lev2t_parametric_description_toStates0, loc, 2) - 1;
            }
        }
        else if (position === this._w - 1) {
            if (state < 5) {
                const loc = vector * 5 + state;
                offset += ParametricDescription.unpack(lev2t_parametric_description_offsetIncrs1, loc, 1);
                state = ParametricDescription.unpack(lev2t_parametric_description_toStates1, loc, 3) - 1;
            }
        }
        else if (position === this._w - 2) {
            if (state < 13) {
                const loc = vector * 13 + state;
                offset += ParametricDescription.unpack(lev2t_parametric_description_offsetIncrs2, loc, 2);
                state = ParametricDescription.unpack(lev2t_parametric_description_toStates2, loc, 4) - 1;
            }
        }
        else if (position === this._w - 3) {
            if (state < 28) {
                const loc = vector * 28 + state;
                offset += ParametricDescription.unpack(lev2t_parametric_description_offsetIncrs3, loc, 2);
                state = ParametricDescription.unpack(lev2t_parametric_description_toStates3, loc, 5) - 1;
            }
        }
        else if (position === this._w - 4) {
            if (state < 45) {
                const loc = vector * 45 + state;
                offset += ParametricDescription.unpack(offsetIncrs4, loc, 3);
                state = ParametricDescription.unpack(toStates4, loc, 6) - 1;
            }
        }
        else {
            if (state < 45) {
                const loc = vector * 45 + state;
                offset += ParametricDescription.unpack(offsetIncrs5, loc, 3);
                state = ParametricDescription.unpack(toStates5, loc, 6) - 1;
            }
        }
        if (state === -1) {
            // null state
            return -1;
        }
        else {
            // translate back to abs
            return state * (this._w + 1) + offset;
        }
    }
}

// CONCATENATED MODULE: ./packages/full-text-search/src/fuzzy/levenshtein_automata.ts



/**
 * From org/apache/lucene/util/automaton/LevenshteinAutomata.java
 * @hidden
 */
class levenshtein_automata_LevenshteinAutomata {
    constructor(input, editDistance) {
        this._word = input;
        this._editDistance = editDistance;
        this._alphabet = [...new Set(this._word)].sort((a, b) => a - b);
        this._numRanges = 0;
        this._rangeLower = new Array(this._alphabet.length + 2);
        this._rangeUpper = new Array(this._alphabet.length + 2);
        // calculate the unicode range intervals that exclude the alphabet
        // these are the ranges for all unicode characters not in the alphabet
        let lower = 0;
        for (let i = 0; i < this._alphabet.length; i++) {
            const higher = this._alphabet[i];
            if (higher > lower) {
                this._rangeLower[this._numRanges] = lower;
                this._rangeUpper[this._numRanges] = higher - 1;
                this._numRanges++;
            }
            lower = higher + 1;
        }
        /* add the final endpoint */
        if (lower <= MAX_CODE_POINT) {
            this._rangeLower[this._numRanges] = lower;
            this._rangeUpper[this._numRanges] = MAX_CODE_POINT;
            this._numRanges++;
        }
        if (editDistance === 1) {
            this._description = new lev1t_parametric_description_Lev1TParametricDescription(input.length);
        }
        else {
            this._description = new lev2t_parametric_description_Lev2TParametricDescription(input.length);
        }
    }
    /**
     * Transforms the NDFA to a DFA.
     * @returns {Automaton}
     */
    toAutomaton() {
        let automat = new Automaton();
        const range = 2 * this._editDistance + 1;
        // the number of states is based on the length of the word and the edit distance
        const numStates = this._description.size();
        // Prefix is not needed to be handled by the automaton.
        // stateOffset = 0;
        automat.createState();
        // create all states, and mark as accept states if appropriate
        for (let i = 1; i < numStates; i++) {
            let state = automat.createState();
            automat.setAccept(state, this._description.isAccept(i));
        }
        for (let k = 0; k < numStates; k++) {
            const xpos = this._description.getPosition(k);
            if (xpos < 0) {
                continue;
            }
            const end = xpos + Math.min(this._word.length - xpos, range);
            for (let x = 0; x < this._alphabet.length; x++) {
                const ch = this._alphabet[x];
                const cvec = this._getVector(ch, xpos, end);
                const dest = this._description.transition(k, xpos, cvec);
                if (dest >= 0) {
                    automat.addTransition(k, dest, ch, ch);
                }
            }
            const dest = this._description.transition(k, xpos, 0);
            if (dest >= 0) {
                for (let r = 0; r < this._numRanges; r++) {
                    automat.addTransition(k, dest, this._rangeLower[r], this._rangeUpper[r]);
                }
            }
        }
        // assert automat.deterministic;
        automat.finishState();
        return automat;
    }
    _getVector(x, pos, end) {
        let vector = 0;
        for (let i = pos; i < end; i++) {
            vector <<= 1;
            if (this._word[i] === x) {
                vector |= 1;
            }
        }
        return vector;
    }
}

// CONCATENATED MODULE: ./packages/full-text-search/src/index_searcher.ts





function calculateMinShouldMatch(optionalClauseCount, spec) {
    if (spec === undefined) {
        return 1;
    }
    if (typeof spec === "number") {
        return (spec < 0) ? optionalClauseCount + spec : spec;
    }
    let result = optionalClauseCount;
    if (spec.includes("<")) {
        // Parse conditional minimumShouldMatch.;
        for (const s of spec.split(" ")) {
            const parts = s.split("<");
            const upperBound = parseInt(parts[0]);
            if (optionalClauseCount <= upperBound) {
                return result;
            }
            else {
                result = calculateMinShouldMatch(optionalClauseCount, parts[1]);
            }
        }
        return result;
    }
    if (spec.includes("%")) {
        // Parse percentage.
        const percent = parseInt(spec.slice(0, -1));
        const calc = (result * percent) * (1 / 100);
        result = (calc < 0) ? result + Math.ceil(calc) : Math.floor(calc);
    }
    else {
        const calc = parseInt(spec);
        result = (calc < 0) ? result + calc : calc;
    }
    return (result < 1) ? 1 : result;
}
/**
 * @hidden
 */
class index_searcher_IndexSearcher {
    /**
     * Constructs an index searcher.
     * @param {Dict<InvertedIndex>} invIdxs - the inverted indexes
     * @param {Set<number>} docs - the ids of the documents
     */
    constructor(invIdxs, docs) {
        this._invIdxs = invIdxs;
        this._docs = docs;
        this._scorer = new Scorer(this._invIdxs);
    }
    search(query) {
        let queryResults = this._recursive(query.query, true);
        // Do final scoring.
        if (query.calculate_scoring !== undefined ? query.calculate_scoring : true) {
            return this._scorer.finalScore(query, queryResults);
        }
        const result = {};
        for (const key of queryResults.keys()) {
            result[key] = { score: 1 };
        }
        return result;
    }
    setDirty() {
        this._scorer.setDirty();
    }
    _recursive(query, doScoring) {
        let queryResults = new Map();
        const boost = query.boost !== undefined ? query.boost : 1;
        const fieldName = query.field !== undefined ? query.field : null;
        let root = null;
        let analyzer = null;
        if (this._invIdxs[fieldName] !== undefined) {
            root = this._invIdxs[fieldName].root;
            analyzer = this._invIdxs[fieldName].analyzer;
        }
        switch (query.type) {
            case "bool": {
                queryResults = null;
                if (query.must !== undefined) {
                    queryResults = this._getUnique(query.must, doScoring, queryResults);
                }
                if (query.filter !== undefined) {
                    queryResults = this._getUnique(query.filter, null, queryResults);
                }
                if (query.should !== undefined) {
                    const shouldDocs = this._getAll(query.should, doScoring);
                    let empty = false;
                    if (queryResults === null) {
                        empty = true;
                        queryResults = new Map();
                    }
                    const msm = Math.max(1, calculateMinShouldMatch(query.should.length, query.minimum_should_match));
                    if (empty && msm === 1) {
                        // Take all documents.
                        queryResults = shouldDocs;
                    }
                    else {
                        // Remove documents with fewer matches.
                        for (const [docId, res] of shouldDocs) {
                            if (res.length >= msm) {
                                if (queryResults.has(docId)) {
                                    queryResults.get(docId).push(...res);
                                }
                                else if (empty) {
                                    queryResults.set(docId, res);
                                }
                                else {
                                    queryResults.delete(docId);
                                }
                            }
                        }
                    }
                }
                // Match all documents if must/filter/should is not defined.
                if (queryResults === null) {
                    queryResults = this._recursive({ type: "match_all" }, false);
                }
                if (query.not !== undefined) {
                    let notDocs = this._getAll(query.not, null);
                    // Remove all matching documents.
                    for (const docId of notDocs.keys()) {
                        if (queryResults.has(docId)) {
                            queryResults.delete(docId);
                        }
                    }
                }
                // Boost query results afterwards.
                if (boost !== 1) {
                    for (const [_, result] of queryResults) {
                        for (let i = 0; i < result.length; i++) {
                            result[i].boost *= boost;
                        }
                    }
                }
                break;
            }
            case "term": {
                const cps = toCodePoints(query.value);
                let termIdx = inverted_index_InvertedIndex.getTermIndex(cps, root);
                this._scorer.score(fieldName, boost, termIdx, doScoring, queryResults, cps);
                break;
            }
            case "terms": {
                for (let i = 0; i < query.value.length; i++) {
                    const cps = toCodePoints(query.value[i]);
                    let termIdx = inverted_index_InvertedIndex.getTermIndex(cps, root);
                    this._scorer.score(fieldName, boost, termIdx, doScoring, queryResults, cps);
                }
                break;
            }
            case "fuzzy": {
                const [f, idf] = fuzzySearch(query, root);
                for (let i = 0; i < f.length; i++) {
                    this._scorer.score(fieldName, boost * f[i].boost, f[i].index, doScoring, queryResults, f[i].term, idf);
                }
                break;
            }
            case "wildcard": {
                const enableScoring = query.enable_scoring !== undefined ? query.enable_scoring : false;
                const w = wildcardSearch(query, root);
                for (let i = 0; i < w.length; i++) {
                    this._scorer.score(fieldName, boost, w[i].index, doScoring && enableScoring, queryResults, w[i].term);
                }
                break;
            }
            case "match_all": {
                for (let docId of this._docs) {
                    this._scorer.scoreConstant(boost, docId, queryResults);
                }
                break;
            }
            case "constant_score": {
                let tmpQueryResults = this._getAll(query.filter, false);
                // Add to each document a constant score.
                for (const docId of tmpQueryResults.keys()) {
                    this._scorer.scoreConstant(boost, docId, queryResults);
                }
                break;
            }
            case "prefix": {
                const enableScoring = query.enable_scoring !== undefined ? query.enable_scoring : false;
                const cps = toCodePoints(query.value);
                const termIdx = inverted_index_InvertedIndex.getTermIndex(cps, root);
                if (termIdx !== null) {
                    const termIdxs = inverted_index_InvertedIndex.extendTermIndex(termIdx);
                    for (let i = 0; i < termIdxs.length; i++) {
                        this._scorer.score(fieldName, boost, termIdxs[i].index, doScoring && enableScoring, queryResults, [...cps, ...termIdxs[i].term]);
                    }
                }
                break;
            }
            case "exists": {
                if (root !== null) {
                    for (const docId of this._invIdxs[fieldName].docStore.keys()) {
                        this._scorer.scoreConstant(boost, docId, queryResults);
                    }
                }
                break;
            }
            case "match": {
                const terms = analyze(analyzer, query.value);
                const operator = query.operator !== undefined ? query.operator : "or";
                const boolQuery = { type: "bool" };
                const subQueries = [];
                if (operator === "or") {
                    if (query.minimum_should_match !== undefined) {
                        boolQuery.minimum_should_match = query.minimum_should_match;
                    }
                    // Create a should query.
                    boolQuery.should = subQueries;
                }
                else {
                    // Create a must query.
                    boolQuery.must = subQueries;
                }
                boolQuery.boost = boost;
                if (query.fuzziness !== undefined) {
                    let prefixLength = query.prefix_length !== undefined ? query.prefix_length : 2;
                    let extended = query.extended !== undefined ? query.extended : false;
                    // Add each fuzzy.
                    for (let i = 0; i < terms.length; i++) {
                        subQueries.push({
                            type: "fuzzy", field: fieldName, value: terms[i], fuzziness: query.fuzziness,
                            prefix_length: prefixLength, extended: extended
                        });
                    }
                }
                else {
                    // Add each term.
                    for (let i = 0; i < terms.length; i++) {
                        subQueries.push({ type: "term", field: fieldName, value: terms[i] });
                    }
                }
                queryResults = this._recursive(boolQuery, doScoring);
                break;
            }
            default:
                break;
        }
        return queryResults;
    }
    _getUnique(queries, doScoring, queryResults) {
        if (queries.length === 0) {
            return queryResults;
        }
        for (let i = 0; i < queries.length; i++) {
            let currDocs = this._recursive(queries[i], doScoring);
            if (queryResults === null) {
                queryResults = this._recursive(queries[0], doScoring);
                continue;
            }
            for (const docId of queryResults.keys()) {
                if (!currDocs.has(docId)) {
                    queryResults.delete(docId);
                }
                else {
                    queryResults.get(docId).push(...currDocs.get(docId));
                }
            }
        }
        return queryResults;
    }
    _getAll(queries, doScoring, queryResults = new Map()) {
        for (let i = 0; i < queries.length; i++) {
            let currDocs = this._recursive(queries[i], doScoring);
            for (const docId of currDocs.keys()) {
                if (!queryResults.has(docId)) {
                    queryResults.set(docId, currDocs.get(docId));
                }
                else {
                    queryResults.get(docId).push(...currDocs.get(docId));
                }
            }
        }
        return queryResults;
    }
}
/**
 * Calculates the levenshtein distance. Specialized version.
 * Copyright Kigiri: https://github.com/kigiri
 *           Milot Mirdita: https://github.com/milot-mirdita
 *           Toni Neubert:  https://github.com/Viatorus/
 * @param {string} a - a string
 * @param {string} b - a string
 */
function calculateLevenshteinDistance(a, b) {
    let i;
    let j;
    let prev;
    let val;
    const row = Array(a.length + 1);
    // init the row
    for (i = 0; i <= a.length; i++) {
        row[i] = i;
    }
    // fill in the rest
    for (i = 1; i <= b.length; i++) {
        prev = i;
        for (j = 1; j <= a.length; j++) {
            if (b[i - 1] === a[j - 1]) { // match
                val = row[j - 1];
            }
            else {
                val = Math.min(row[j - 1] + 1, // substitution
                Math.min(prev + 1, // insertion
                row[j] + 1)); // deletion
                // transposition
                if (i > 1 && j > 1 && b[i - 2] === a[j - 1] && a[j - 2] === b[i - 1]) {
                    val = Math.min(val, row[j - 1] - (a[j - 1] === b[i - 1] ? 1 : 0));
                }
            }
            row[j - 1] = prev;
            prev = val;
        }
        row[a.length] = prev;
    }
    return row[a.length];
}
/**
 * Performs a fuzzy search.
 * @param {FuzzyQuery} query - the fuzzy query
 * @param {Index} root - the root index
 * @returns {[FuzzyResult, number]} - the fuzzy results and the maximum df
 */
function fuzzySearch(query, root) {
    let value = toCodePoints(query.value);
    let fuzziness = query.fuzziness !== undefined ? query.fuzziness : "AUTO";
    if (fuzziness === "AUTO") {
        if (value.length <= 2) {
            fuzziness = 0;
        }
        else if (value.length <= 5) {
            fuzziness = 1;
        }
        else {
            fuzziness = 2;
        }
    }
    let prefixLength = query.prefix_length !== undefined ? query.prefix_length : 0;
    let extended = query.extended !== undefined ? query.extended : false;
    // Do just a prefix search if zero fuzziness.
    if (fuzziness === 0) {
        prefixLength = value.length;
    }
    let result = [];
    let startIdx = root;
    let prefix = value.slice(0, prefixLength);
    let fuzzy = value;
    let df = 0;
    // Perform a prefix search.
    if (prefixLength !== 0) {
        startIdx = inverted_index_InvertedIndex.getTermIndex(prefix, startIdx);
        fuzzy = fuzzy.slice(prefixLength);
    }
    // No startIdx found.
    if (startIdx === null) {
        return [result, df];
    }
    // Fuzzy is not necessary anymore, because prefix search includes the whole query value.
    if (fuzzy.length === 0) {
        if (extended) {
            // Add all terms down the index.
            const all = inverted_index_InvertedIndex.extendTermIndex(startIdx);
            for (let i = 0; i < all.length; i++) {
                result.push({ index: all[i].index, term: all[i].term, boost: 1 });
                df = Math.max(df, all[i].index.df);
            }
        }
        else if (startIdx.dc !== undefined) {
            // Add prefix search result.
            result.push({ index: startIdx, term: value, boost: 1 });
            df = startIdx.df;
        }
        return [result, df];
    }
    // The matching term.
    const term = [0];
    // Create an automaton from the fuzzy.
    const automaton = new RunAutomaton(new levenshtein_automata_LevenshteinAutomata(fuzzy, fuzziness).toAutomaton());
    function determineEditDistance(state, term, fuzzy) {
        // Check how many edits this fuzzy can still do.
        let ed = 0;
        state = automaton.step(state, 0);
        if (state !== -1 && automaton.isAccept(state)) {
            ed++;
            state = automaton.step(state, 0);
            if (state !== -1 && automaton.isAccept(state)) {
                ed++;
            }
            // Special handling for smaller terms.
            if (term.length < fuzzy.length) {
                if (ed !== fuzziness) {
                    return calculateLevenshteinDistance(term, fuzzy);
                }
                // Include the term and fuzzy length.
                ed -= fuzzy.length - term.length;
            }
        }
        return fuzziness - ed;
    }
    function recursive(state, key, idx) {
        term[term.length - 1] = key;
        // Check the current key of term with the automaton.
        state = automaton.step(state, key);
        if (state === -1) {
            return;
        }
        if (automaton.isAccept(state)) {
            if (extended) {
                // Add all terms down the index.
                const all = inverted_index_InvertedIndex.extendTermIndex(idx);
                for (let i = 0; i < all.length; i++) {
                    result.push({ index: all[i].index, term: all[i].term, boost: 1 });
                    df = Math.max(df, all[i].index.df);
                }
                return;
            }
            else if (idx.df !== undefined) {
                // Calculate boost.
                const distance = determineEditDistance(state, term, fuzzy);
                const boost = Math.max(0, 1 - distance / Math.min(prefix.length + term.length, value.length));
                result.push({ index: idx, term: [...prefix, ...term], boost });
                df = Math.max(df, idx.df);
            }
        }
        term.push(0);
        for (const child of idx) {
            recursive(state, child[0], child[1]);
        }
        term.pop();
    }
    for (const child of startIdx) {
        recursive(0, child[0], child[1]);
    }
    return [result, df];
}
/**
 * Performs a wildcard search.
 * @param {WildcardQuery} query - the wildcard query
 * @param {Index} root - the root index
 * @returns {Array} - the results
 */
function wildcardSearch(query, root) {
    let wildcard = toCodePoints(query.value);
    let result = [];
    function recursive(index, idx = 0, term = [], escaped = false) {
        if (index === null) {
            return;
        }
        if (idx === wildcard.length) {
            if (index.df !== undefined) {
                result.push({ index: index, term: term.slice() });
            }
            return;
        }
        // Escaped character.
        if (!escaped && wildcard[idx] === 92 /* \ */) {
            recursive(index, idx + 1, term, true);
        }
        else if (!escaped && wildcard[idx] === 63 /* ? */) {
            for (const child of index) {
                recursive(child[1], idx + 1, [...term, child[0]]);
            }
        }
        else if (!escaped && wildcard[idx] === 42 /* * */) {
            // Check if asterisk is last wildcard character
            if (idx + 1 === wildcard.length) {
                const all = inverted_index_InvertedIndex.extendTermIndex(index);
                for (let i = 0; i < all.length; i++) {
                    recursive(all[i].index, idx + 1, [...term, ...all[i].term]);
                }
            }
            else {
                // Iterate over the whole tree.
                recursive(index, idx + 1, term, false);
                const indices = [{ index: index, term: [] }];
                do {
                    const index = indices.pop();
                    for (const child of index.index) {
                        recursive(child[1], idx + 1, [...term, ...index.term, child[0]]);
                        indices.push({ index: child[1], term: [...index.term, child[0]] });
                    }
                } while (indices.length !== 0);
            }
        }
        else {
            recursive(inverted_index_InvertedIndex.getTermIndex([wildcard[idx]], index), idx + 1, [...term, wildcard[idx]]);
        }
    }
    recursive(root);
    return result;
}

// EXTERNAL MODULE: ./packages/common/plugin.ts
var common_plugin = __webpack_require__(0);

// CONCATENATED MODULE: ./packages/full-text-search/src/full_text_search.ts



class full_text_search_FullTextSearch {
    /**
     * Initialize the full-text search for the given fields.
     * @param {object[]} fieldOptions - the field options
     * @param {string} fieldOptions.field - the name of the property field
     * @param {boolean=true} fieldOptions.store - flag to indicate if the full-text search should be stored on serialization or
     *  rebuild on deserialization
     * @param {boolean=true} fieldOptions.optimizeChanges - flag to optimize updating and deleting of documents
     *    (requires more memory but performs faster)
     * @param {Analyzer} fieldOptions.analyzer - an analyzer for the field
     * @param {string} [id] - the property name of the document index
     */
    constructor(fieldOptions = [], id) {
        this._invIdxs = {};
        // Create an inverted index for each field.
        for (let i = 0; i < fieldOptions.length; i++) {
            let fieldOption = fieldOptions[i];
            this._invIdxs[fieldOption.field] = new inverted_index_InvertedIndex(fieldOption);
        }
        this._id = id;
        this._docs = new Set();
        this._idxSearcher = new index_searcher_IndexSearcher(this._invIdxs, this._docs);
    }
    /**
     * Registers the full-text search as plugin.
     */
    static register() {
        common_plugin["a" /* PLUGINS */]["FullTextSearch"] = full_text_search_FullTextSearch;
    }
    addDocument(doc, id = doc[this._id]) {
        let fieldNames = Object.keys(this._invIdxs);
        for (let i = 0, fieldName; i < fieldNames.length, fieldName = fieldNames[i]; i++) {
            let field = doc[fieldName];
            // Skip null and undefined.
            if (field === null || field === undefined) {
                continue;
            }
            if (typeof field !== "string") {
                // Convert number to string.
                if (typeof field === "number") {
                    field = field.toString();
                }
                else {
                    throw TypeError("Unsupported field type for full text search.");
                }
            }
            this._invIdxs[fieldName].insert(field, id);
        }
        this._docs.add(id);
        this._idxSearcher.setDirty();
    }
    removeDocument(doc, id = doc[this._id]) {
        let fieldNames = Object.keys(this._invIdxs);
        for (let i = 0; i < fieldNames.length; i++) {
            this._invIdxs[fieldNames[i]].remove(id);
        }
        this._docs.delete(id);
        this._idxSearcher.setDirty();
    }
    updateDocument(doc, id = doc[this._id]) {
        this.removeDocument(doc, id);
        this.addDocument(doc, id);
    }
    clear() {
        for (let id of this._docs) {
            this.removeDocument(null, id);
        }
    }
    search(query) {
        return this._idxSearcher.search(query);
    }
    toJSON() {
        let serialized = { id: this._id, ii: {} };
        let fieldNames = Object.keys(this._invIdxs);
        for (let i = 0; i < fieldNames.length; i++) {
            const fieldName = fieldNames[i];
            serialized.ii[fieldName] = this._invIdxs[fieldName].toJSON();
        }
        return serialized;
    }
    static fromJSONObject(serialized, analyzers = {}) {
        let fts = new full_text_search_FullTextSearch([], serialized.id);
        let fieldNames = Object.keys(serialized.ii);
        for (let i = 0; i < fieldNames.length; i++) {
            const fieldName = fieldNames[i];
            fts._invIdxs[fieldName] = inverted_index_InvertedIndex.fromJSONObject(serialized.ii[fieldName], analyzers[fieldName]);
        }
        return fts;
    }
}

// CONCATENATED MODULE: ./packages/full-text-search/src/index.ts
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "FullTextSearch", function() { return full_text_search_FullTextSearch; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "analyze", function() { return analyze; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "StandardAnalyzer", function() { return analyzer_StandardAnalyzer; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "whitespaceTokenizer", function() { return whitespaceTokenizer; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "lowercaseTokenFilter", function() { return lowercaseTokenFilter; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "uppercaseTokenFilter", function() { return uppercaseTokenFilter; });




full_text_search_FullTextSearch["Analyzer"] = {};
full_text_search_FullTextSearch["Analyzer"]["analyze"] = analyze;
full_text_search_FullTextSearch["Analyzer"]["StandardAnalyzer"] = analyzer_StandardAnalyzer;
full_text_search_FullTextSearch["Tokenizer"] = {};
full_text_search_FullTextSearch["Tokenizer"]["whitespaceTokenizer"] = whitespaceTokenizer;
full_text_search_FullTextSearch["TokenFilter"] = {};
full_text_search_FullTextSearch["TokenFilter"]["lowercaseTokenFilter"] = lowercaseTokenFilter;
full_text_search_FullTextSearch["TokenFilter"]["uppercaseTokenFilter"] = uppercaseTokenFilter;

/* harmony default export */ var src = __webpack_exports__["default"] = (full_text_search_FullTextSearch);


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
//# sourceMappingURL=lokidb.full-text-search.js.map