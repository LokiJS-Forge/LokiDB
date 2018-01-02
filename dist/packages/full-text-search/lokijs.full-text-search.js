(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["@lokijs/full-text-search"] = factory();
	else
{		root["@lokijs/full-text-search"] = factory(); root["LokiFullTextSearch"] = root["@lokijs/full-text-search"].default;}
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
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
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
/* harmony export (immutable) */ __webpack_exports__["a"] = Long;



/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["b"] = toCodePoints;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__tokenizer__ = __webpack_require__(2);

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
class InvertedIndex {
    /**
     * @param {boolean} [options.store=true] - inverted index will be stored at serialization rather than rebuilt on load.
     * @param {boolean} optimizeChanges
     * @param {Tokenizer} tokenizer
     */
    constructor(options = {}) {
        this._docCount = 0;
        this._docStore = new Map();
        this._totalFieldLength = 0;
        this._root = new Map();
        ({
            store: this._store = true,
            optimizeChanges: this._optimizeChanges = true,
            tokenizer: this._tokenizer = new __WEBPACK_IMPORTED_MODULE_0__tokenizer__["a" /* Tokenizer */]()
        } = options);
    }
    get store() {
        return this._store;
    }
    set store(val) {
        this._store = val;
    }
    get tokenizer() {
        return this._tokenizer;
    }
    get documentCount() {
        return this._docCount;
    }
    get documentStore() {
        return this._docStore;
    }
    get totalFieldLength() {
        return this._totalFieldLength;
    }
    get root() {
        return this._root;
    }
    /**
     * Adds defined fields of a document to the inverted index.
     * @param {string} field - the field to add
     * @param {number} docId - the doc id of the field
     */
    insert(field, docId) {
        if (this._docStore.has(docId)) {
            throw Error("Field already added.");
        }
        // Tokenize document field.
        const fieldTokens = this._tokenizer.tokenize(field);
        this._totalFieldLength += fieldTokens.length;
        this._docCount += 1;
        this._docStore.set(docId, { fieldLength: fieldTokens.length });
        // Holds references to each index of a document.
        const indexRef = [];
        if (this._optimizeChanges) {
            Object.defineProperties(this._docStore.get(docId), {
                indexRef: { enumerable: false, configurable: true, writable: true, value: indexRef }
            });
        }
        // Iterate over all unique field terms.
        for (const token of new Set(fieldTokens)) {
            if (token === "") {
                continue;
            }
            // Calculate term frequency.
            let tf = 0;
            for (let j = 0; j < fieldTokens.length; j++) {
                if (fieldTokens[j] === token) {
                    ++tf;
                }
            }
            // Add term to index tree.
            let branch = this._root;
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
        if (!this._docStore.has(docId)) {
            return;
        }
        const docStore = this._docStore.get(docId);
        // Remove document.
        this._docStore.delete(docId);
        this._docCount -= 1;
        // Reduce total field length.
        this._totalFieldLength -= docStore.fieldLength;
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
            this._remove(this._root, docId);
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
            InvertedIndex.extendTermIndex(child[1], term, termIndices);
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
                _tokenizer: this._tokenizer,
                _docCount: this._docCount,
                _docStore: [...this._docStore],
                _totalFieldLength: this._totalFieldLength,
                _root: InvertedIndex.serializeIndex(this._root)
            };
        }
        return {
            _store: false,
            _optimizeChanges: this._optimizeChanges,
            _tokenizer: this._tokenizer
        };
    }
    /**
     * Deserialize the inverted index.
     * @param {{docStore: *, _fields: *, index: *}} serialized - The serialized inverted index.
     * @param {Object.<string, function>|Tokenizer} funcTok[undefined] - the depending functions with labels
     *  or an equivalent tokenizer
     */
    static fromJSONObject(serialized, funcTok) {
        const invIdx = new InvertedIndex({
            store: serialized._store,
            optimizeChanges: serialized._optimizeChanges,
            tokenizer: __WEBPACK_IMPORTED_MODULE_0__tokenizer__["a" /* Tokenizer */].fromJSONObject(serialized._tokenizer, funcTok)
        });
        if (invIdx._store) {
            invIdx._docCount = serialized._docCount;
            invIdx._docStore = new Map(serialized._docStore);
            invIdx._totalFieldLength = serialized._totalFieldLength;
            invIdx._root = InvertedIndex.deserializeIndex(serialized._root);
        }
        if (invIdx._optimizeChanges) {
            invIdx._regenerate(invIdx._root, null);
        }
        return invIdx;
    }
    static serializeIndex(idx) {
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
            values.push(InvertedIndex.serializeIndex(child[1]));
        }
        serialized.k = keys;
        serialized.v = values;
        return serialized;
    }
    static deserializeIndex(serialized) {
        const idx = new Map();
        if (serialized.k !== undefined) {
            for (let i = 0; i < serialized.k.length; i++) {
                idx.set(serialized.k[i], InvertedIndex.deserializeIndex(serialized.v[i]));
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
                const ref = this._docStore.get(docId);
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
/* harmony export (immutable) */ __webpack_exports__["a"] = InvertedIndex;



/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
function defaultSplitter(str) {
    let tokens = str.split(/[^\w]+/);
    for (let i = 0; i < tokens.length; i++) {
        tokens[i] = tokens[i].toLowerCase();
    }
    return tokens;
}
/**
 * The tokenizer is used to prepare the string content of a document field for the inverted index.
 * Firstly the string gets split into tokens.
 * After that the tokens will be trimmed/stemmed with defined functions from the queue.
 *
 * * To change the splitter function, use {@link Tokenizer#setSplitter}.
 * * To add functions to the queue, use {@link Tokenizer#add}, {@link Tokenizer#addBefore} and
 *   {@link Tokenizer#addAfter}.
 * * To remove a function from the queue, use {@link Tokenizer#remove}.
 * * To reset the tokenizer, use {@link Tokenizer#reset}.
 */
class Tokenizer {
    /**
     * Initializes the tokenizer with a splitter, which splits a string at non-alphanumeric characters.
     * The queue is empty.
     */
    constructor() {
        this._queue = [];
        this._symbol = Symbol("label");
        this.reset();
    }
    /**
     * Sets a function with defined label as the splitter function.
     * The function must take a string as argument and return an array of tokens.
     *
     * @param {string} label - the label
     * @param {function} func - the function
     */
    setSplitter(label, func) {
        if (label === "") {
            throw Error("Label cannot be empty.");
        }
        func[this._symbol] = label;
        this._splitter = func;
    }
    /**
     * Gets the splitter.
     * @return {Array.<string, function>} - tuple with label and function
     */
    getSplitter() {
        return [this._splitter[this._symbol], this._splitter];
    }
    /**
     * Resets the splitter to default.
     */
    resetSplitter() {
        this._splitter = defaultSplitter;
    }
    /**
     * Checks if a function is inside the queue.
     * @param {string|function} labelFunc - an existing label or function
     * @returns {boolean} true if exists, otherwise false
     */
    has(labelFunc) {
        return this._getPosition(labelFunc) !== -1;
    }
    /**
     * Gets a function from the queue.
     * Only the first found function gets returned if a label or a function is multiple used.
     *
     * @param {string|function} labelFunc - an existing label or function
     * @return {Array.<string, function>} - tuple with label and function
     */
    get(labelFunc) {
        let pos = this._getPosition(labelFunc);
        if (pos === -1) {
            throw Error("Cannot find existing function.");
        }
        return [this._queue[pos][this._symbol], this._queue[pos]];
    }
    /**
     * Adds a function with defined label to the end of the queue.
     * The function must take a token string as argument and return a token.
     *
     * @param {string} label - the label
     * @param {function} func - the function
     */
    add(label, func) {
        this._addFunction(label, func, this._queue.length);
    }
    /**
     * Adds a function with defined label before an existing function to the queue.
     * The function must take a token string as argument and return a token.
     *
     * @param {string|function} labelFunc - an existing label or function
     * @param {string} label - the label
     * @param {function} func - the function
     */
    addBefore(labelFunc, label, func) {
        let pos = this._getPosition(labelFunc);
        if (pos === -1) {
            throw Error("Cannot find existing function.");
        }
        this._addFunction(label, func, pos);
    }
    /**
     * Adds a function with defined label after an existing function to the queue.
     * The function must take a token string as argument and return a token.
     *
     * @param {string|function} labelFunc - an existing label or function
     * @param {string} label - the label
     * @param {function} func - the function
     */
    addAfter(labelFunc, label, func) {
        let pos = this._getPosition(labelFunc);
        if (pos === -1) {
            throw Error("Cannot find existing function.");
        }
        this._addFunction(label, func, pos + 1);
    }
    /**
     * Removes a function from the queue.
     * @param {string|function} labelFunc - an existing label or function
     */
    remove(labelFunc) {
        let pos = this._getPosition(labelFunc);
        if (pos === -1) {
            throw Error("Cannot find existing function.");
        }
        this._queue.splice(pos, 1);
    }
    /**
     * Resets the splitter and tokenize queue to default.
     */
    reset() {
        this._splitter = defaultSplitter;
        this._queue = [];
    }
    /**
     * Tokenizes a string into tokens.
     * @param {string} str - the string
     * @return {string[]} the tokens
     */
    tokenize(str) {
        let tokens = this._splitter(str);
        // Apply each token over the queue functions.
        for (let i = 0; i < this._queue.length; i++) {
            let newTokens = [];
            for (let j = 0; j < tokens.length; j++) {
                let token = this._queue[i](tokens[j]);
                if (token) {
                    newTokens.push(token);
                }
            }
            tokens = newTokens;
        }
        return tokens;
    }
    /**
     * Serializes the tokenizer by returning the labels of the used functions.
     * @returns {{splitter: string?, tokenizers: string[]}} - the serialization
     */
    toJSON() {
        let serialized = {
            tokenizers: []
        };
        if (this._splitter !== defaultSplitter) {
            serialized.splitter = this._splitter[this._symbol];
        }
        for (let i = 0; i < this._queue.length; i++) {
            serialized.tokenizers.push(this._queue[i][this._symbol]);
        }
        return serialized;
    }
    /**
     * Deserializes the tokenizer by reassign the correct function to each label.
     * @param {{splitter: string, tokenizers: string[]}} serialized - the serialized labels
     * @param {Object.<string, function>|Tokenizer} funcTok - the depending functions with labels
     *  or an equivalent tokenizer
     */
    static fromJSONObject(serialized, funcTok) {
        let tkz = new Tokenizer();
        if (funcTok instanceof Tokenizer) {
            if (serialized.splitter !== undefined) {
                let splitter = funcTok.getSplitter();
                if (serialized.splitter !== splitter[0]) {
                    throw Error("Splitter function not found.");
                }
                tkz.setSplitter(splitter[0], splitter[1]);
            }
            for (let i = 0; i < serialized.tokenizers.length; i++) {
                if (!funcTok.has(serialized.tokenizers[i])) {
                    throw Error("Tokenizer function not found.");
                }
                let labelFunc = funcTok.get(serialized.tokenizers[i]);
                tkz.add(labelFunc[0], labelFunc[1]);
            }
        }
        else {
            if (serialized.splitter !== undefined) {
                if (funcTok.splitters[serialized.splitter] === undefined) {
                    throw Error("Splitter function not found.");
                }
                tkz.setSplitter(serialized.splitter, funcTok.splitters[serialized.splitter]);
            }
            for (let i = 0; i < serialized.tokenizers.length; i++) {
                if (funcTok.tokenizers[serialized.tokenizers[i]] === undefined) {
                    throw Error("Tokenizer function not found.");
                }
                tkz.add(serialized.tokenizers[i], funcTok.tokenizers[serialized.tokenizers[i]]);
            }
        }
        return tkz;
    }
    /**
     * Returns the position of a function inside the queue.
     * @param {string|function} labelFunc - an existing label or function
     * @return {number} the position
     * @private
     */
    _getPosition(labelFunc) {
        if (labelFunc instanceof Function) {
            return this._queue.indexOf(labelFunc);
        }
        else {
            for (let i = 0; i < this._queue.length; i++) {
                if (this._queue[i][this._symbol] === labelFunc) {
                    return i;
                }
            }
        }
        return -1;
    }
    /**
     * Adds a function with defined label at a specific position to the queue.
     * @param {string} label - the label
     * @param {function} func - the function
     * @param {number} pos - the position
     * @private
     */
    _addFunction(label, func, pos) {
        if (label === "") {
            throw Error("Label cannot be empty.");
        }
        func[this._symbol] = label;
        this._queue.splice(pos, 0, func);
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Tokenizer;



/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * The base query class to enable boost to a query type.
 */
class BaseQueryBuilder {
    /**
     * @param {string} type - the type name of the query
     * @param data
     */
    constructor(type, data = {}) {
        this._data = data;
        this._data.type = type;
    }
    /**
     * Boosts the query result.
     *
     * See also [Lucene#BoostQuery]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/BoostQuery.html}
     * and [Elasticsearch#boost]{@link https://www.elastic.co/guide/en/elasticsearch/reference/5.2/mapping-boost.html}.
     *
     * @param {number} value - the positive boost
     * @return {BaseQueryBuilder} object itself for cascading
     */
    boost(value) {
        if (value < 0) {
            throw TypeError("Boost must be a positive number.");
        }
        this._data.boost = value;
        return this;
    }
    /**
     * Build the final query.
     * @return {Object} - the final query
     */
    build() {
        return this._data;
    }
}
/* unused harmony export BaseQueryBuilder */

/**
 * A query which finds documents where a document field contains a term.
 *
 * See also [Lucene#TermQueryBuilder]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/TermQuery.html}
 * and [Elasticsearch#TermQueryBuilder]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-term-query.html}.
 *
 * @example
 * new QueryBuilder()
 *   .term("name", "infinity"])
 * .build();
 * // The resulting documents:
 * // contains the term infinity
 *
 * @extends BaseQueryBuilder
 */
class TermQueryBuilder extends BaseQueryBuilder {
    /**
     * @param {string} field - the field name of the document
     * @param {string} term - the term
     * @param data
     */
    constructor(field, term, data = {}) {
        super("term", data);
        this._data.field = field;
        this._data.value = term;
    }
}
/* unused harmony export TermQueryBuilder */

/**
 * A query which finds documents where a document field contains any of the terms.
 *
 * See also [Lucene#TermRangeQuery]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/TermRangeQuery.html}
 * and [Elasticsearch#TermsQueryBuilder]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-terms-query.html}.
 *
 * @example
 * new QueryBuilder()
 *   .terms("quotes", ["infinity", "atom", "energy"])
 * .build();
 * // The resulting documents:
 * // contains the terms infinity, atom or energy
 *
 * @extends BaseQueryBuilder
 */
class TermsQueryBuilder extends BaseQueryBuilder {
    /**
     * @param {string} field - the field name of the document
     * @param {string[]} terms - the terms
     * @param data
     */
    constructor(field, terms, data = {}) {
        super("terms", data);
        this._data.field = field;
        this._data.value = terms;
    }
}
/* unused harmony export TermsQueryBuilder */

/**
 * A query which finds documents where the wildcard term can be applied at an existing document field term.
 *
 * Wildcard | Description
 * -------- | ------------
 * ? (question mark) | Skips a single character.
 *
 * To escape a wildcard character, use _\_ (backslash), e.g. \?.
 *
 * * To enable scoring for wildcard queries, use {@link WildcardQueryBuilder#enableScoring}.
 *
 * See also [Lucene#WildcardQueryBuilder]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/WildcardQuery.html}
 * and [Elasticsearch#WildcardQueryBuilder]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-wildcard-query.html}.
 *
 * @example
 * new QueryBuilder()
 *   .wildcard("question", "e?nst*n\?")
 * .build();
 * // The resulting documents:
 * // contains the wildcard surname e?nst*n\? (like Einstein? or Eynsteyn? but not Einsteine or Ensten?)
 *
 * @extends BaseQueryBuilder
 */
class WildcardQueryBuilder extends BaseQueryBuilder {
    /**
     * @param {string} field - the field name of the document
     * @param {string} wildcard - the wildcard term
     * @param data
     */
    constructor(field, wildcard, data = {}) {
        super("wildcard", data);
        this._data.field = field;
        this._data.value = wildcard;
    }
    /**
     * This flag enables scoring for wildcard results, similar to {@link TermQueryBuilder}.
     * @param {boolean} enable - flag to enable or disable scoring
     * @return {WildcardQueryBuilder}
     */
    enableScoring(enable) {
        this._data.enable_scoring = enable;
        return this;
    }
}
/* unused harmony export WildcardQueryBuilder */

/**
 * A query which finds documents where the fuzzy term can be transformed into an existing document field term within a
 * given edit distance.
 * ([Damerau–Levenshtein distance]{@link https://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance}).
 *
 * The edit distance is the minimum number of an insertion, deletion or substitution of a single character
 * or a transposition of two adjacent characters.
 *
 * * To set the maximal allowed edit distance, use {@link FuzzyQueryBuilder#fuzziness} (default is AUTO).
 * * To set the initial word length, which should ignored for fuzziness, use {@link FuzzyQueryBuilder#prefixLength}.
 * * To include longer document field terms than the fuzzy term and edit distance together, use
 *   {@link FuzzyQueryBuilder#extended}.
 *
 * See also [Lucene#FuzzyQueryBuilder]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/FuzzyQuery.html}
 * and [Elasticsearch#FuzzyQueryBuilder]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-fuzzy-query.html}.
 *
 * @example
 * new QueryBuilder()
 *   .fuzzy("surname", "einsten")
 *     .fuzziness(2)
 *     .prefixLength(3)
 * .build();
 * // The resulting documents:
 * // contains the fuzzy surname einstn (like Einstein or Einst but not Eisstein or Insten)
 *
 * @extends BaseQueryBuilder
 */
class FuzzyQueryBuilder extends BaseQueryBuilder {
    /**
     * @param {string} field - the field name of the document
     * @param {string} fuzzy - the fuzzy term
     * @param data
     */
    constructor(field, fuzzy, data = {}) {
        super("fuzzy", data);
        this._data.field = field;
        this._data.value = fuzzy;
    }
    /**
     * Sets the maximal allowed fuzziness.
     * @param {number|string} fuzziness - the edit distance 0, 1, 2 or AUTO
     *
     * AUTO generates an edit distance based on the length of the term:
     * * 0..2 -> must match exactly
     * * 3..5 -> one edit allowed
     * * >5 two edits allowed
     *
     * @return {FuzzyQueryBuilder} - object itself for cascading
     */
    fuzziness(fuzziness) {
        if (fuzziness !== "AUTO" && (fuzziness < 0 || fuzziness > 2)) {
            throw TypeError("Fuzziness must be 0, 1, 2 or AUTO.");
        }
        this._data.fuzziness = fuzziness;
        return this;
    }
    /**
     * Sets the initial word length.
     * @param {number} prefixLength - the positive prefix length
     * @return {FuzzyQueryBuilder}  object itself for cascading
     */
    prefixLength(prefixLength) {
        if (prefixLength < 0) {
            throw TypeError("Prefix length must be a positive number.");
        }
        this._data.prefix_length = prefixLength;
        return this;
    }
    /**
     * This flag allows longer document field terms than the actual fuzzy.
     * @param {boolean} extended - flag to enable or disable extended search
     * @return {FuzzyQueryBuilder}
     */
    extended(extended) {
        this._data.extended = extended;
        return this;
    }
}
/* unused harmony export FuzzyQueryBuilder */

/**
 * A query which matches documents containing the prefix of a term inside a field.
 *
 * * To enable scoring for wildcard queries, use {@link WildcardQueryBuilder#enableScoring}.
 *
 * See also [Lucene#PrefixQueryBuilder]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/PrefixQuery.html}
 * and [Elasticsearch#MatchQueryBuilder]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-prefix-query.html}
 *
 * @example
 * new QueryBuilder()
 *   .prefix("surname", "alb")
 * .build()
 * // The resulting documents:
 * // contains the term prefix alb as surname
 *
 * @extends BaseQueryBuilder
 */
class PrefixQueryBuilder extends BaseQueryBuilder {
    /**
     * @param {string} field - the field name of the document
     * @param {string} prefix - the prefix of a term
     * @param data
     */
    constructor(field, prefix, data = {}) {
        super("prefix", data);
        this._data.field = field;
        this._data.value = prefix;
    }
    /**
     * This flag enables scoring for prefix results, similar to {@link TermQueryBuilder}.
     * @param {boolean} enable - flag to enable or disable scoring
     * @return {PrefixQueryBuilder}
     */
    enableScoring(enable) {
        this._data.enable_scoring = enable;
        return this;
    }
}
/* unused harmony export PrefixQueryBuilder */

/**
 * A query which matches all documents with a given field.
 *
 * See also [Elasticsearch#ExistsQueryBuilder]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-exists-query.html}.
 *
 * @example
 * new QueryBuilder()
 *   .exists("name")
 * .build()
 * // The resulting documents:
 * // has the field "name"
 *
 * @extends BaseQueryBuilder
 */
class ExistsQueryBuilder extends BaseQueryBuilder {
    /**
     * @param {string} field - the field name of the document
     * @param data
     */
    constructor(field, data = {}) {
        super("exists", data);
        this._data.field = field;
    }
}
/* unused harmony export ExistsQueryBuilder */

/**
 * A query which tokenizes the given query text, performs a query foreach token and combines the results using a boolean
 * operator.
 *
 * Operator      | Description
 * ------------- | -------------
 * or (default) | Finds documents which matches some tokens. The minimum amount of matches can be controlled with [minimumShouldMatch]{@link MatchQueryBuilder#minimumShouldMatch} (default is 1).
 * and | Finds documents which matches all tokens.
 *
 * To enable a [fuzzy query]{@link FuzzyQueryBuilder} for the tokens, use {@link MatchQueryBuilder#fuzziness},
 * {@link MatchQueryBuilder#prefixLength} and {@link MatchQueryBuilder#extended}
 *
 * See also [Lucene#?]{@link ?}
 * and [Elasticsearch#MatchQueryBuilder]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-match-query.html}.
 *
 * @example
 * new QueryBuilder()
 *   .match("name", "albrt einsten")
 *     .boost(2.5)
 *     .operator("and")
 *     .fuzziness(2)
 *     .prefixLength(3)
 * .build();
 * // The resulting documents:
 * // contains the fuzzy name albrt einsten (like Albert Einstein) with a boost of 2.5
 *
 * @extends BaseQueryBuilder
 */
class MatchQueryBuilder extends BaseQueryBuilder {
    /**
     * @param {string} field - the field name of the document
     * @param {string} query - the query text
     * @param data
     */
    constructor(field, query, data = {}) {
        super("match", data);
        this._data.field = field;
        this._data.value = query;
    }
    /**
     * Controls the amount of minimum matching sub queries before a document will be considered.
     * @param {number} minShouldMatch - number of minimum matching sub queries
     *   minShouldMatch >= 1: Indicates a fixed value regardless of the number of sub queries.
     *   minShouldMatch <= -1: Indicates that the number of sub queries, minus this number should be mandatory.
     *   minShouldMatch < 0: Indicates that this percent of the total number of sub queries can be missing.
     *     The number computed from the percentage is rounded down, before being subtracted from the total to determine
     *     the minimum.
     *   minShouldMatch < 1: Indicates that this percent of the total number of sub queries are necessary.
     *     The number computed from the percentage is rounded down and used as the minimum.
     * @return {MatchQueryBuilder} object itself for cascading
     */
    minimumShouldMatch(minShouldMatch) {
        if (this._data.operator !== undefined && this._data.operator === "and") {
            throw SyntaxError("Match query with \"and\" operator does not support minimum should match.");
        }
        this._data.minimum_should_match = minShouldMatch;
        return this;
    }
    /**
     * Sets the boolean operator.
     * @param {string} op - the operator ("or" || "and")
     * @return {MatchQueryBuilder} object itself for cascading
     */
    operator(op) {
        if (op !== "and" && op !== "or") {
            throw SyntaxError("Unknown operator.");
        }
        this._data.operator = op;
        if (this._data.minimum_should_match !== undefined && this._data.operator === "and") {
            throw SyntaxError("Match query with \"and\" operator does not support minimum should match.");
        }
        return this;
    }
    /**
     * Sets the maximal allowed fuzziness.
     * @param {number|string} fuzziness - the edit distance 0, 1, 2 or AUTO
     *
     * AUTO generates an edit distance based on the length of the term:
     * * 0..2 -> must match exactly
     * * 3..5 -> one edit allowed
     * * >5 two edits allowed
     *
     * @return {MatchQueryBuilder} - object itself for cascading
     */
    fuzziness(fuzziness) {
        if (fuzziness !== "AUTO" && (fuzziness < 0 || fuzziness > 2)) {
            throw TypeError("Fuzziness must be 0, 1, 2 or AUTO.");
        }
        this._data.fuzziness = fuzziness;
        return this;
    }
    /**
     * Sets the starting word length which should not be considered for fuzziness.
     * @param {number} prefixLength - the positive prefix length
     * @return {MatchQueryBuilder} - object itself for cascading
     */
    prefixLength(prefixLength) {
        if (prefixLength < 0) {
            throw TypeError("Prefix length must be a positive number.");
        }
        this._data.prefix_length = prefixLength;
        return this;
    }
    /**
     * This flag allows longer document field terms than the actual fuzzy.
     * @param {boolean} extended - flag to enable or disable extended search
     * @return {MatchQueryBuilder}
     */
    extended(extended) {
        this._data.extended = extended;
        return this;
    }
}
/* unused harmony export MatchQueryBuilder */

/**
 * A query that matches all documents and giving them a constant score equal to the query boost.
 *
 * Typically used inside a must clause of a {@link BoolQueryBuilder} to subsequently reject non matching documents with the not
 * clause.
 *
 * See also [Lucene#MatchAllDocsQuery]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/MatchAllDocsQuery.html}
 * and [Elasticsearch#MatchAllQueryBuilder]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-match-all-query.html}.
 *
 * @example
 * new QueryBuilder()
 *   .matchAll()
 *     .boost(2.5)
 * .build()
 * // The resulting documents:
 * // all documents and giving a score of 2.5
 *
 * @extends BaseQueryBuilder
 */
class MatchAllQueryBuilder extends BaseQueryBuilder {
    constructor(data = {}) {
        super("match_all", data);
    }
}
/* unused harmony export MatchAllQueryBuilder */

/**
 * A query that wraps sub queries and returns a constant score equal to the query boost for every document in the filter.
 *
 * See also [Lucene#BooleanQuery]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/ConstantScoreQuery.html}
 * and [Elasticsearch#ConstantScoreQueryBuilder]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-constant-score-query.html}.
 *
 * @example
 * new QueryBuilder()
 *   .constantScore()
 *     .boost(1.5)
 *     .beginFilter()
 *       .term("first_name", "albert")
 *       .term("surname", "einstein")
 *     .endFilter()
 * .build()
 * // The resulting documents:
 * // * contains albert as first name, einstein as surname and the document score is 42.
 *
 * @extends BaseQueryBuilder
 */
class ConstantScoreQueryBuilder extends BaseQueryBuilder {
    constructor(data = {}) {
        super("constant_score", data);
    }
    /**
     * Starts an array of queries. Use endFilter() to finish the array.
     * @return {ArrayQueryBuilder} array query for holding sub queries
     */
    beginFilter() {
        this._data.filter = {};
        return new ArrayQueryBuilder("endFilter", () => {
            return this;
        }, this._data.filter);
    }
}
/* unused harmony export ConstantScoreQueryBuilder */

/**
 * A query that matches documents matching boolean combinations of sub queries.
 *
 * This query consists of one or more boolean clauses with different behavior but interrelated to each other.
 *
 * Occur         | Description
 * ------------- | -------------
 * must  | Finds documents which matches all sub queries.
 * filter  | Finds documents which matches all sub queries but these documents do not contribute to the score.
 * should  | Finds documents which matches some sub queries. The minimum amount of matches can be controlled with [minimumShouldMatch]{@link BoolQueryBuilder#minimumShouldMatch} (default is 1).
 * not  | Documents which match any sub query will be ignored.
 *
 * A sub query can be any other query type and also the bool query itself.
 *
 * See also [Lucene#BooleanQuery]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/BooleanQuery.html}
 * and [Elasticsearch#BoolQueryBuilder]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-bool-query.html}.
 *
 * @example
 * new QueryBuilder()
 *   .bool()
 *     .beginMust().boost(2)
 *       .term("first_name", "albert")
 *     .endMust()
 *     .beginFilter()
 *       .term("birthplace", "ulm")
 *     .endFilter()
 *     .beginShould().minimumShouldMatch(2)
 *       .fuzzy("surname", "einstin")
 *       .wildcard("name", "geni?s")
 *       .term("quotes", "infinity")
 *     .endShould()
 *     .beginNot()
 *       .terms("research_field", ["biology", "geography"])
 *     .endNot()
 * .build();
 * // The resulting documents:
 * // contains the name albert (must: contribute to the score with a boost of 2)
 * // contains the birthplace ulm (filter: not contribute to the score)
 * // contains a minimum of two matches from the fuzzy, wildcard and/or term query (should: contribute to the score)
 * // do not contains biology or geography as research field (not: not contribute to the score)
 *
 * @extends BaseQueryBuilder
 */
class BoolQueryBuilder extends BaseQueryBuilder {
    constructor(data = {}) {
        super("bool", data);
    }
    /**
     * Starts an array of queries for must clause. Use endMust() to finish the array.
     * @return {ArrayQueryBuilder} array query for holding sub queries
     */
    beginMust() {
        this._data.must = {};
        return new ArrayQueryBuilder("endMust", () => {
            return this;
        }, this._data.must);
    }
    /**
     * Starts an array of queries for filter clause. Use endFilter() to finish the array.
     * @return {ArrayQueryBuilder} array query for holding sub queries
     */
    beginFilter() {
        this._data.filter = {};
        return new ArrayQueryBuilder("endFilter", () => {
            return this;
        }, this._data.filter);
    }
    /**
     * Starts an array of queries for should clause. Use endShould() to finish the array.
     * @return {ArrayQueryBuilder} array query for holding sub queries
     */
    beginShould() {
        this._data.should = {};
        return new ArrayQueryBuilder("endShould", () => {
            return this;
        }, this._data.should);
    }
    /**
     * Starts an array of queries for not clause. Use endNot() to finish the array.
     * @return {ArrayQueryBuilder} array query for holding sub queries
     */
    beginNot() {
        this._data.not = {};
        return new ArrayQueryBuilder("endNot", () => {
            return this;
        }, this._data.not);
    }
    /**
     * Controls the amount of minimum matching sub queries before a document will be considered.
     * @param {number} minShouldMatch - number of minimum matching sub queries
     *   minShouldMatch >= 1: Indicates a fixed value regardless of the number of sub queries.
     *   minShouldMatch <= -1: Indicates that the number of sub queries, minus this number should be mandatory.
     *   minShouldMatch < 0: Indicates that this percent of the total number of sub queries can be missing.
     *     The number computed from the percentage is rounded down, before being subtracted from the total to determine
     *     the minimum.
     *   minShouldMatch < 1: Indicates that this percent of the total number of sub queries are necessary.
     *     The number computed from the percentage is rounded down and used as the minimum.
     * @return {BoolQueryBuilder} object itself for cascading
     */
    minimumShouldMatch(minShouldMatch) {
        this._data.minimum_should_match = minShouldMatch;
        return this;
    }
}
/* unused harmony export BoolQueryBuilder */

/**
 * A query which holds all sub queries like an array.
 */
class ArrayQueryBuilder extends BaseQueryBuilder {
    constructor(callbackName, callback, data = {}) {
        super("array", data);
        this._data.values = [];
        this._callbackName = callbackName;
        this[callbackName] = callback;
        this._prepare = (queryType, ...args) => {
            const data = {};
            const query = new queryType(...args, data);
            this._data.values.push(data);
            query.bool = this.bool;
            query.constantScore = this.constantScore;
            query.term = this.term;
            query.terms = this.terms;
            query.wildcard = this.wildcard;
            query.fuzzy = this.fuzzy;
            query.match = this.match;
            query.matchAll = this.matchAll;
            query.prefix = this.prefix;
            query.exists = this.exists;
            query._prepare = this._prepare;
            query[this._callbackName] = this[this._callbackName];
            return query;
        };
    }
    bool() {
        return this._prepare(BoolQueryBuilder);
    }
    constantScore() {
        return this._prepare(ConstantScoreQueryBuilder);
    }
    term(field, term) {
        return this._prepare(TermQueryBuilder, field, term);
    }
    terms(field, terms) {
        return this._prepare(TermsQueryBuilder, field, terms);
    }
    wildcard(field, wildcard) {
        return this._prepare(WildcardQueryBuilder, field, wildcard);
    }
    fuzzy(field, fuzzy) {
        return this._prepare(FuzzyQueryBuilder, field, fuzzy);
    }
    match(field, query) {
        return this._prepare(MatchQueryBuilder, field, query);
    }
    matchAll() {
        return this._prepare(MatchAllQueryBuilder);
    }
    prefix(field, prefix) {
        return this._prepare(PrefixQueryBuilder, field, prefix);
    }
    exists(field) {
        return this._prepare(ExistsQueryBuilder, field);
    }
}
/* unused harmony export ArrayQueryBuilder */

/**
 * This query builder is the root of each query search.
 * The query contains a sub query and parameters for setup scoring and search options.
 *
 * Possible sub query types are:
 * {@link TermQueryBuilder}, {@link TermsQueryBuilder}, {@link FuzzyQueryBuilder}, {@link WildcardQueryBuilder},
 * {@link MatchQueryBuilder}, {@link MatchAllQueryBuilder}, {@link PrefixQueryBuilder},  {@link BoolQueryBuilder},
 * {@link ConstantScoreQueryBuilder}, {@link ExistsQueryBuilder}
 *
 * @example
 * new QueryBuilder()
 *   .finalScoring(true)
 *   .useBM25(1.5, 0.5)
 *   .term("first_name", "albert")
 * .build();
 * // The resulting documents:
 * // contains the first name albert
 * // are scored and ranked using BM25 with k1=1.5 and b=0.5
 */
class QueryBuilder {
    constructor() {
        this._data = { query: {} };
    }
    /**
     * The query performs a final scoring over all scored sub queries.
     * @param {boolean} enable - flag to enable or disable final scoring
     * @return {this}
     */
    enableFinalScoring(enable) {
        this._data.final_scoring = enable;
        return this;
    }
    /**
     * Adds an explanation of the scoring of each document for all matched terms.
     * @param {boolean} enable -flag to enable or disable explanation
     * @returns {this}
     */
    explain(enable) {
        this._data.explain = enable;
        return this;
    }
    /**
     * Configures the [Okapi BM25]{@link https://en.wikipedia.org/wiki/Okapi_BM25} as scoring model.
     *
     * See also [Lucene#MatchAllDocsQuery]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/similarities/BM25Similarity.html}
     * and [Elasticsearch#BM25]{@link https://www.elastic.co/guide/en/elasticsearch/guide/current/pluggable-similarites.html#bm25}.
     *
     * @param {number} [k1=1.2] - controls how quickly an increase in term frequency results in term-frequency saturation.
     *                            Lower values result in quicker saturation, and higher values in slower saturation
     * @param {number} [b=0.75] - controls how much effect field-length normalization should have.
     *                            A value of 0.0 disables normalization completely, and a value of 1.0 normalizes fully
     * @return {this}
     */
    BM25Similarity(k1 = 1.2, b = 0.75) {
        if (k1 < 0) {
            throw TypeError("BM25s k1 must be a positive number.");
        }
        if (b < 0 || b > 1) {
            throw TypeError("BM25s b must be a number between 0 and 1 inclusive.");
        }
        this._data.bm25 = {
            k1,
            b
        };
        return this;
    }
    bool() {
        return this._prepare(BoolQueryBuilder);
    }
    constantScore() {
        return this._prepare(ConstantScoreQueryBuilder);
    }
    term(field, term) {
        return this._prepare(TermQueryBuilder, field, term);
    }
    terms(field, terms) {
        return this._prepare(TermsQueryBuilder, field, terms);
    }
    wildcard(field, wildcard) {
        return this._prepare(WildcardQueryBuilder, field, wildcard);
    }
    fuzzy(field, fuzzy) {
        return this._prepare(FuzzyQueryBuilder, field, fuzzy);
    }
    match(field, query) {
        return this._prepare(MatchQueryBuilder, field, query);
    }
    matchAll() {
        return this._prepare(MatchAllQueryBuilder);
    }
    prefix(field, prefix) {
        return this._prepare(PrefixQueryBuilder, field, prefix);
    }
    exists(field) {
        return this._prepare(ExistsQueryBuilder, field);
    }
    _prepare(queryType, ...args) {
        const query = new queryType(...args, this._data.query);
        query.build = () => {
            return this._data;
        };
        return query;
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = QueryBuilder;



/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__long__ = __webpack_require__(0);

const MASKS = [new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x1), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x3), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x7), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xf),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x1f), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x3f), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x7f), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xff),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x1ff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x3ff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x7ff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xfff),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x1fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x3fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x7fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xffff),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xf, 0x1fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xf, 0x3fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xf, 0x7fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xf, 0xffff),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xff, 0x1fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xff, 0x3fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xff, 0x7fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xff, 0xffff),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xfff, 0x1fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xfff, 0x3fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xfff, 0x7fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xfff, 0xffff),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xffff, 0x1fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xffff, 0x3fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xffff, 0x7fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xffff, 0xffff),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xfffff, 0x1fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xfffff, 0x3fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xfffff, 0x7fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xfffff, 0xffff),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xffffff, 0x1fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xffffff, 0x3fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xffffff, 0x7fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xffffff, 0xffff),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xfffffff, 0x1fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xfffffff, 0x3fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xfffffff, 0x7fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xfffffff, 0xffff),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xffffffff, 0x1fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xffffffff, 0x3fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xffffffff, 0x7fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xffffffff, 0xffff),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xfffffffff, 0x1fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xfffffffff, 0x3fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xfffffffff, 0x7fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xfffffffff, 0xffff),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xffffffffff, 0x1fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xffffffffff, 0x3fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xffffffffff, 0x7fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xffffffffff, 0xffff),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xfffffffffff, 0x1fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xfffffffffff, 0x3fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xfffffffffff, 0x7fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xfffffffffff, 0xffff),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xffffffffffff, 0x1fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xffffffffffff, 0x3fff), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xffffffffffff, 0x7fff)];
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
    unpack(data, index, bitsPerValue) {
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
/* harmony export (immutable) */ __webpack_exports__["a"] = ParametricDescription;



/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__full_text_search__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__tokenizer__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__query_builder__ = __webpack_require__(3);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "FullTextSearch", function() { return __WEBPACK_IMPORTED_MODULE_0__full_text_search__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Tokenizer", function() { return __WEBPACK_IMPORTED_MODULE_1__tokenizer__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "QueryBuilder", function() { return __WEBPACK_IMPORTED_MODULE_2__query_builder__["a"]; });



__WEBPACK_IMPORTED_MODULE_0__full_text_search__["a" /* FullTextSearch */]["Tokenizer"] = __WEBPACK_IMPORTED_MODULE_1__tokenizer__["a" /* Tokenizer */];
__WEBPACK_IMPORTED_MODULE_0__full_text_search__["a" /* FullTextSearch */]["QueryBuilder"] = __WEBPACK_IMPORTED_MODULE_2__query_builder__["a" /* QueryBuilder */];

/* harmony default export */ __webpack_exports__["default"] = (__WEBPACK_IMPORTED_MODULE_0__full_text_search__["a" /* FullTextSearch */]);


/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__inverted_index__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index_searcher__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__common_plugin__ = __webpack_require__(14);



class FullTextSearch {
    /**
     * Initialize the full-text search for the given fields.
     * @param {object[]} fields - the field options
     * @param {string} fields.name - the name of the field
     * @param {boolean=true} fields.store - flag to indicate if the full-text search should be stored on serialization or
     *  rebuild on deserialization
     * @param {boolean=true} fields.optimizeChanges - flag to indicate if deleting/updating a document should be optimized
     *  (requires more memory but performs better)
     * @param {Tokenizer=Tokenizer} fields.tokenizer - the tokenizer of the field
     * @param {string} [id] - the property name of the document index
     */
    constructor(fields = [], id) {
        this._invIdxs = {};
        // Create inverted indices for each field.
        for (let i = 0; i < fields.length; i++) {
            let field = fields[i];
            this._invIdxs[field.name] = new __WEBPACK_IMPORTED_MODULE_0__inverted_index__["a" /* InvertedIndex */](field);
        }
        this._id = id;
        this._docs = new Set();
        this._idxSearcher = new __WEBPACK_IMPORTED_MODULE_1__index_searcher__["a" /* IndexSearcher */](this._invIdxs, this._docs);
    }
    /**
     * Registers the full-text search as plugin.
     */
    static register() {
        __WEBPACK_IMPORTED_MODULE_2__common_plugin__["a" /* PLUGINS */]["FullTextSearch"] = FullTextSearch;
    }
    addDocument(doc, id = doc[this._id]) {
        let fieldNames = Object.keys(doc);
        for (let i = 0, fieldName; i < fieldNames.length, fieldName = fieldNames[i]; i++) {
            if (this._invIdxs[fieldName] !== undefined) {
                this._invIdxs[fieldName].insert(doc[fieldName], id);
            }
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
    static fromJSONObject(serialized, tokenizers = {}) {
        let fts = new FullTextSearch([], serialized.id);
        let fieldNames = Object.keys(serialized.ii);
        for (let i = 0; i < fieldNames.length; i++) {
            const fieldName = fieldNames[i];
            fts._invIdxs[fieldName] = __WEBPACK_IMPORTED_MODULE_0__inverted_index__["a" /* InvertedIndex */].fromJSONObject(serialized.ii[fieldName], tokenizers[fieldName]);
        }
        return fts;
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = FullTextSearch;



/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__scorer__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__inverted_index__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__query_builder__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__fuzzy_run_automaton__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__fuzzy_levenshtein_automata__ = __webpack_require__(10);





/**
 * @hidden
 */
class IndexSearcher {
    /**
     * @param {object} invIdxs
     */
    constructor(invIdxs, docs) {
        this._invIdxs = invIdxs;
        this._docs = docs;
        this._scorer = new __WEBPACK_IMPORTED_MODULE_0__scorer__["a" /* Scorer */](this._invIdxs);
    }
    search(query) {
        let queryResults = this._recursive(query.query, true);
        // Do final scoring.
        if (query.final_scoring !== undefined ? query.final_scoring : true) {
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
        let tokenizer = null;
        if (this._invIdxs[fieldName] !== undefined) {
            root = this._invIdxs[fieldName].root;
            tokenizer = this._invIdxs[fieldName].tokenizer;
        }
        switch (query.type) {
            case "bool": {
                queryResults = null;
                if (query.must !== undefined) {
                    queryResults = this._getUnique(query.must.values, doScoring, queryResults);
                }
                if (query.filter !== undefined) {
                    queryResults = this._getUnique(query.filter.values, false, queryResults);
                }
                if (query.should !== undefined) {
                    let shouldDocs = this._getAll(query.should.values, doScoring);
                    let empty = false;
                    if (queryResults === null) {
                        queryResults = new Map();
                        empty = true;
                    }
                    let msm = 1;
                    // TODO: Enable percent and ranges.
                    if (query.minimum_should_match !== undefined) {
                        msm = query.minimum_should_match;
                        let shouldLength = query.should.values.length;
                        if (msm <= -1) {
                            msm = shouldLength + msm;
                        }
                        else if (msm < 0) {
                            msm = shouldLength - Math.floor(shouldLength * -msm);
                        }
                        else if (msm < 1) {
                            msm = Math.floor(shouldLength * msm);
                        }
                    }
                    // Remove all docs with fewer matches.
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
                if (query.not !== undefined) {
                    let notDocs = this._getAll(query.not.values, false);
                    // Remove all docs.
                    for (const docId of notDocs.keys()) {
                        if (queryResults.has(docId)) {
                            queryResults.delete(docId);
                        }
                    }
                }
                break;
            }
            case "term": {
                const cps = Object(__WEBPACK_IMPORTED_MODULE_1__inverted_index__["b" /* toCodePoints */])(query.value);
                let termIdx = __WEBPACK_IMPORTED_MODULE_1__inverted_index__["a" /* InvertedIndex */].getTermIndex(cps, root);
                this._scorer.score(fieldName, boost, termIdx, doScoring, queryResults, cps);
                break;
            }
            case "terms": {
                for (let i = 0; i < query.value.length; i++) {
                    const cps = Object(__WEBPACK_IMPORTED_MODULE_1__inverted_index__["b" /* toCodePoints */])(query.value[i]);
                    let termIdx = __WEBPACK_IMPORTED_MODULE_1__inverted_index__["a" /* InvertedIndex */].getTermIndex(cps, root);
                    this._scorer.score(fieldName, boost, termIdx, doScoring, queryResults, cps);
                }
                break;
            }
            case "fuzzy": {
                const f = fuzzySearch(query, root);
                for (let i = 0; i < f.length; i++) {
                    this._scorer.score(fieldName, boost * f[i].boost, f[i].index, doScoring, queryResults, f[i].term);
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
                let tmpQueryResults = this._getAll(query.filter.values, false);
                // Add to each document a constant score.
                for (const docId of tmpQueryResults.keys()) {
                    this._scorer.scoreConstant(boost, docId, queryResults);
                }
                break;
            }
            case "prefix": {
                const enableScoring = query.enable_scoring !== undefined ? query.enable_scoring : false;
                const cps = Object(__WEBPACK_IMPORTED_MODULE_1__inverted_index__["b" /* toCodePoints */])(query.value);
                const termIdx = __WEBPACK_IMPORTED_MODULE_1__inverted_index__["a" /* InvertedIndex */].getTermIndex(cps, root);
                if (termIdx !== null) {
                    const termIdxs = __WEBPACK_IMPORTED_MODULE_1__inverted_index__["a" /* InvertedIndex */].extendTermIndex(termIdx);
                    for (let i = 0; i < termIdxs.length; i++) {
                        this._scorer.score(fieldName, boost, termIdxs[i].index, doScoring && enableScoring, queryResults, [...cps, ...termIdxs[i].term]);
                    }
                }
                break;
            }
            case "exists": {
                if (root !== null) {
                    for (const docId of this._invIdxs[fieldName].documentStore.keys()) {
                        this._scorer.scoreConstant(boost, docId, queryResults);
                    }
                }
                break;
            }
            case "match": {
                let terms = tokenizer.tokenize(query.value);
                let operator = query.operator !== undefined ? query.operator : "or";
                let tmpQuery = new __WEBPACK_IMPORTED_MODULE_2__query_builder__["a" /* QueryBuilder */]().bool();
                if (operator === "or") {
                    if (query.minimum_should_match !== undefined) {
                        tmpQuery = tmpQuery.minimumShouldMatch(query.minimum_should_match);
                    }
                    // Build a should query.
                    tmpQuery = tmpQuery.beginShould();
                }
                else {
                    // Build a must query.
                    tmpQuery = tmpQuery.beginMust();
                }
                tmpQuery = tmpQuery.boost(boost);
                if (query.fuzziness !== undefined) {
                    let prefixLength = query.prefix_length !== undefined ? query.prefix_length : 2;
                    let extended = query.extended !== undefined ? query.extended : false;
                    // Add each fuzzy.
                    for (let i = 0; i < terms.length; i++) {
                        tmpQuery = tmpQuery.fuzzy(fieldName, terms[i]).fuzziness(query.fuzziness).prefixLength(prefixLength).extended(extended);
                    }
                }
                else {
                    // Add each term.
                    for (let i = 0; i < terms.length; i++) {
                        tmpQuery = tmpQuery.term(fieldName, terms[i]);
                    }
                }
                if (operator === "or") {
                    tmpQuery = tmpQuery.endShould();
                }
                else {
                    tmpQuery = tmpQuery.endMust();
                }
                queryResults = this._recursive(tmpQuery.build().query, doScoring);
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
    _getAll(queries, doScoring) {
        let queryResults = new Map();
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
/* harmony export (immutable) */ __webpack_exports__["a"] = IndexSearcher;

/**
 * Performs a fuzzy search.
 * @param {FuzzyQuery} query - the fuzzy query
 * @param {Index} root - the root index
 * @returns {FuzzyResult} - the results
 */
function fuzzySearch(query, root) {
    let value = Object(__WEBPACK_IMPORTED_MODULE_1__inverted_index__["b" /* toCodePoints */])(query.value);
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
    let prefixLength = query.prefix_length !== undefined ? query.prefix_length : 2;
    let extended = query.extended !== undefined ? query.extended : false;
    // Do just a prefix search if zero fuzziness.
    if (fuzziness === 0) {
        prefixLength = value.length;
    }
    let result = [];
    let startIdx = root;
    let prefix = value.slice(0, prefixLength);
    let fuzzy = value;
    // Perform a prefix search.
    if (prefixLength !== 0) {
        startIdx = __WEBPACK_IMPORTED_MODULE_1__inverted_index__["a" /* InvertedIndex */].getTermIndex(prefix, startIdx);
        fuzzy = fuzzy.slice(prefixLength);
    }
    // No startIdx found.
    if (startIdx === null) {
        return result;
    }
    // Fuzzy is not necessary anymore, because prefix search includes the whole query value.
    if (fuzzy.length === 0) {
        if (extended) {
            // Add all terms down the index.
            const all = __WEBPACK_IMPORTED_MODULE_1__inverted_index__["a" /* InvertedIndex */].extendTermIndex(startIdx);
            for (let i = 0; i < all.length; i++) {
                result.push({ index: all[i].index, term: all[i].term, boost: 1 });
            }
        }
        else if (startIdx.dc !== undefined) {
            // Add prefix search result.
            result.push({ index: startIdx, term: value, boost: 1 });
        }
        return result;
    }
    // The matching term.
    const term = [0];
    // Create an automaton from the fuzzy.
    const automaton = new __WEBPACK_IMPORTED_MODULE_3__fuzzy_run_automaton__["a" /* RunAutomaton */](new __WEBPACK_IMPORTED_MODULE_4__fuzzy_levenshtein_automata__["a" /* LevenshteinAutomata */](fuzzy, fuzziness).toAutomaton());
    function determineEditDistance(state, termLength, fuzzyLength) {
        // Check how many edits this fuzzy can still do.
        let ed = 0;
        state = automaton.step(state, 0);
        if (state !== -1 && automaton.isAccept(state)) {
            ed++;
            state = automaton.step(state, 0);
            if (state !== -1 && automaton.isAccept(state)) {
                ed++;
            }
        }
        // Include the term and fuzzy length.
        ed -= Math.abs(termLength - fuzzyLength);
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
                let all = __WEBPACK_IMPORTED_MODULE_1__inverted_index__["a" /* InvertedIndex */].extendTermIndex(idx);
                for (let i = 0; i < all.length; i++) {
                    result.push({ index: all[i].index, term: all[i].term, boost: 1 });
                }
                return;
            }
            else if (idx.df !== undefined) {
                // Calculate boost.
                let distance = determineEditDistance(state, term.length, fuzzy.length);
                let boost = 1 - distance / Math.min(prefix.length + term.length, value.length);
                result.push({ index: idx, term: [...prefix, ...term], boost });
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
    return result;
}
/**
 * Performs a wildcard search.
 * @param {WildcardQuery} query - the wildcard query
 * @param {Index} root - the root index
 * @returns {Array} - the results
 */
function wildcardSearch(query, root) {
    let wildcard = Object(__WEBPACK_IMPORTED_MODULE_1__inverted_index__["b" /* toCodePoints */])(query.value);
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
                const all = __WEBPACK_IMPORTED_MODULE_1__inverted_index__["a" /* InvertedIndex */].extendTermIndex(index);
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
            recursive(__WEBPACK_IMPORTED_MODULE_1__inverted_index__["a" /* InvertedIndex */].getTermIndex([wildcard[idx]], index), idx + 1, [...term, wildcard[idx]]);
        }
    }
    recursive(root);
    return result;
}


/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * @hidden
 */
class Scorer {
    constructor(invIdxs) {
        this._invIdxs = invIdxs;
        this._cache = {};
    }
    setDirty() {
        this._cache = {};
    }
    score(fieldName, boost, termIdx, doScoring, queryResults, term) {
        if (termIdx === null || termIdx.dc === undefined) {
            return;
        }
        const idf = this._idf(fieldName, termIdx.df);
        for (const [docId, tf] of termIdx.dc) {
            if (!queryResults.has(docId)) {
                queryResults.set(docId, []);
            }
            if (doScoring) {
                // BM25 scoring.
                queryResults.get(docId).push({ tf, idf, boost, fieldName, term });
            }
            else {
                // Constant scoring.
                queryResults.set(docId, [{ boost }]);
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
        const result = {};
        const k1 = query.bm25 !== undefined ? query.bm25.k1 : 1.2;
        const b = query.bm25 !== undefined ? query.bm25.b : 0.75;
        const explain = query.explain !== undefined ? query.explain : false;
        for (const [docId, result1] of queryResults) {
            let docScore = 0;
            let docExplanation = [];
            for (let j = 0; j < result1.length; j++) {
                const queryResult = result1[j];
                let score = 0;
                if (queryResult.tf !== undefined) {
                    // BM25 scoring.
                    const tf = queryResult.tf;
                    const fieldLength = Scorer._calculateFieldLength(this._invIdxs[queryResult.fieldName].documentStore.get(+docId)
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
                result[docId] = {
                    score: docScore,
                    explanation: docExplanation
                };
            }
            else {
                result[docId] = {
                    score: docScore
                };
            }
        }
        return result;
    }
    static _calculateFieldLength(fieldLength) {
        // Dummy function to be compatible to lucene in unit tests.
        return fieldLength;
    }
    _getCache(fieldName) {
        if (this._cache[fieldName] === undefined) {
            const avgFieldLength = this._invIdxs[fieldName].totalFieldLength / this._invIdxs[fieldName].documentCount;
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
        return cache.idfs[docFreq] = Math.log(1 + (this._invIdxs[fieldName].documentCount - docFreq + 0.5) / (docFreq + 0.5));
    }
    _avgFieldLength(fieldName) {
        return this._getCache(fieldName).avgFieldLength;
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Scorer;



/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
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
/* harmony export (immutable) */ __webpack_exports__["a"] = RunAutomaton;



/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__automaton__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__lev1t_parametric_description__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__lev2t_parametric_description__ = __webpack_require__(13);



/**
 * From org/apache/lucene/util/automaton/LevenshteinAutomata.java
 * @hidden
 */
class LevenshteinAutomata {
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
        if (lower <= __WEBPACK_IMPORTED_MODULE_0__automaton__["b" /* MAX_CODE_POINT */]) {
            this._rangeLower[this._numRanges] = lower;
            this._rangeUpper[this._numRanges] = __WEBPACK_IMPORTED_MODULE_0__automaton__["b" /* MAX_CODE_POINT */];
            this._numRanges++;
        }
        if (editDistance === 1) {
            this._description = new __WEBPACK_IMPORTED_MODULE_1__lev1t_parametric_description__["a" /* Lev1TParametricDescription */](input.length);
        }
        else {
            this._description = new __WEBPACK_IMPORTED_MODULE_2__lev2t_parametric_description__["a" /* Lev2TParametricDescription */](input.length);
        }
    }
    /**
     * Transforms the NDFA to a DFA.
     * @returns {Automaton}
     */
    toAutomaton() {
        let automat = new __WEBPACK_IMPORTED_MODULE_0__automaton__["a" /* Automaton */]();
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
                const cvec = this.getVector(ch, xpos, end);
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
    getVector(x, pos, end) {
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
/* harmony export (immutable) */ __webpack_exports__["a"] = LevenshteinAutomata;



/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * @type {number}
 * @hidden
 */
const MIN_CODE_POINT = 0;
/* unused harmony export MIN_CODE_POINT */

/**
 * @type {number}
 * @hidden
 */
const MAX_CODE_POINT = 1114111;
/* harmony export (immutable) */ __webpack_exports__["b"] = MAX_CODE_POINT;

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
/* harmony export (immutable) */ __webpack_exports__["a"] = Automaton;



/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__long__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__parametric_description__ = __webpack_require__(4);


// 1 vectors; 2 states per vector; array length = 2
const toStates0 = [new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x2)];
const offsetIncrs0 = [new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x0)];
// 2 vectors; 3 states per vector; array length = 6
const toStates1 = [new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xa43)];
const offsetIncrs1 = [new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x38)];
// 4 vectors; 6 states per vector; array length = 24
const toStates2 = [new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x82140003, 0x34534914), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x6d)];
const offsetIncrs2 = [new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x55a20000, 0x5555)];
// 8 vectors; 6 states per vector; array length = 48
const toStates3 = [new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x900C0003, 0x21520854), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x4534916d, 0x5b4d19a2), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xda34)];
const offsetIncrs3 = [new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x20fc0000, 0x5555ae0a), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x55555555)];
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
class Lev1TParametricDescription extends __WEBPACK_IMPORTED_MODULE_1__parametric_description__["a" /* ParametricDescription */] {
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
                offset += this.unpack(offsetIncrs0, loc, 1);
                state = this.unpack(toStates0, loc, 2) - 1;
            }
        }
        else if (position === this._w - 1) {
            if (state < 3) {
                const loc = vector * 3 + state;
                offset += this.unpack(offsetIncrs1, loc, 1);
                state = this.unpack(toStates1, loc, 2) - 1;
            }
        }
        else if (position === this._w - 2) {
            if (state < 6) {
                const loc = vector * 6 + state;
                offset += this.unpack(offsetIncrs2, loc, 2);
                state = this.unpack(toStates2, loc, 3) - 1;
            }
        }
        else {
            if (state < 6) {
                const loc = vector * 6 + state;
                offset += this.unpack(offsetIncrs3, loc, 2);
                state = this.unpack(toStates3, loc, 3) - 1;
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
/* harmony export (immutable) */ __webpack_exports__["a"] = Lev1TParametricDescription;



/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__long__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__parametric_description__ = __webpack_require__(4);


// 1 vectors; 3 states per vector; array length = 3
const toStates0 = [
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x23)
];
const offsetIncrs0 = [
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x0)
];
// 2 vectors; 5 states per vector; array length = 10
const toStates1 = [
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x13688b44)
];
const offsetIncrs1 = [
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x3e0)
];
// 4 vectors; 13 states per vector; array length = 52
const toStates2 = [
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x5200b504, 0x60dbb0b0), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x27062227, 0x52332176), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x14323235, 0x23555432), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x4354)
];
const offsetIncrs2 = [
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x00002000, 0x555080a8), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x55555555, 0x55)
];
// 8 vectors; 28 states per vector; array length = 224
const toStates3 = [
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x40059404, 0xe701c029), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x00a50000, 0xa0101620), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xa1416288, 0xb02c8c40), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x310858c0, 0xa821032),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x0d28b201, 0x31442398), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x847788e0, 0x5281e528), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x08c2280e, 0xa23980d3), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xa962278c, 0x1e3294b1),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x2288e528, 0x8c41309e), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x021aca21, 0x11444409), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x86b1086b, 0x11a46248), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x1d6240c4, 0x2a625894),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x489074ad, 0x5024a50b), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x520c411a, 0x14821aca), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x0b594a44, 0x5888b589), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xc411a465, 0x941d6520),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xad6a62d4, 0x8b589075), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x1a5055a4)
];
const offsetIncrs3 = [
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x00002000, 0x30c302), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xc3fc333c, 0x2a0030f3), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x8282a820, 0x233a0032), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x32b283a8, 0x55555555),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x55555555, 0x55555555), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x55555555, 0x55555555), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x55555555, 0x55555555)
];
// 16 vectors; 45 states per vector; array length = 720
const toStates4 = [
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x002c5004, 0x3801450), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x00000e38, 0xc500014b), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x51401402, 0x514), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x0),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x14010000, 0x518000b), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x28e20230, 0x9f1c208), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x830a70c2, 0x219f0df0), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x08208200, 0x82000082),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x60800800, 0x8050501), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x02602643, 0x30820986), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x50508064, 0x45640142), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x20000831, 0x8500514),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x85002082, 0x41405820), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x0990c201, 0x45618098), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x50a01051, 0x8316d0c), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x050df0e0, 0x21451420),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x14508214, 0xd142140), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x50821c60, 0x3c21c018), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xcb142087, 0x1cb1403), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x1851822c, 0x80082145),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x20800020, 0x200208), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x87180345, 0xd0061820), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x24976b09, 0xcb0a81cb), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x624709d1, 0x8b1a60e),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x82249089, 0x2490820), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x00d2c024, 0xc31421c6), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x15454423, 0x3c314515), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xc21cb140, 0x31853c22),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x2c208214, 0x4514500b), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x508b0051, 0x8718034), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x5108f0c5, 0xb2cb4551), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x1cb0a810, 0xe824715d),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x908b0e60, 0x1422cb14), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xc02cb145, 0x30812c22), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x0cb1420c, 0x84202202), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x20ce0850, 0x5c20ce08),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x8b0d70c2, 0x20820820), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x14214208, 0x42085082), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x50830c20, 0x9208340), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x13653592, 0xc6134dc6),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x6dc4db4d, 0xd309341c), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x54d34d34, 0x6424d908), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x030814c2, 0x92072c22), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x24a30930, 0x4220724b),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x25c920e2, 0x2470d720), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x975c9082, 0x92c92d70), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x04924e08, 0xcb0880c2), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xc24c2481, 0x45739728),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xda6174da, 0xc6da4db5), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x5d30971d, 0x4b5d35d7), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x93825ce2, 0x1030815c), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x020cb145, 0x51442051),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x2c220e2c, 0xc538210e), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x52cb0d70, 0x8514214), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x85145142, 0x204b0850), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x4051440c, 0x92156083),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xa60e6595, 0x4d660e4d), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x1c6dc658, 0x94d914e4), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x1454d365, 0x82642659), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x51030813, 0x2892072c),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xcb2ca30b, 0xe2c22072), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x20538910, 0x452c70d7), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x708e3891, 0x8b2cb2d), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xc204b24e, 0x81cb1440),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x28c2ca24, 0xda44e38e), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x85d660e4, 0x1dc6da65), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x8e5d914e, 0xe2cb5d33), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x38938238)
];
const offsetIncrs4 = [
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x00080000, 0x30020000), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x20c060), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x04000000, 0x81490000), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x10824824, 0x40249241),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x60002082, 0xdb6030c3), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x301b0d80, 0x6c36c06c), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x000db0db, 0xb01861b0), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x9188e06d, 0x1b703620),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x06d86db7, 0x8009200), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x02402490, 0x4920c24), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x08249009, 0x490002), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x28124804, 0x49081281),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x124a44a2, 0x34800104), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x0d24020c, 0xc3093090), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x24c24d24, 0x40009a09), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x9201061a, 0x4984a06),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x71269262, 0x494d0492), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x92492492, 0x24924924), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x49249249, 0x92492492), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x24924924, 0x49249249),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x92492492, 0x24924924), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x49249249, 0x92492492), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x24924924, 0x49249249), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x92492492, 0x24924924),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x49249249, 0x92492492), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x24924924, 0x49249249), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x92492492, 0x24924924), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x49249249, 0x92492492),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x24924924, 0x49249249), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x92492492, 0x24924924), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x49249249, 0x92492492), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x24924924, 0x49249249),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x92492492, 0x24924924), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x49249249, 0x2492)
];
// 32 vectors; 45 states per vector; array length = 1440
const toStates5 = [
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x002c5004, 0x3801450), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x00000e38, 0xc500014b), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x51401402, 0x514), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x0),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x14010000, 0x514000b), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x038e00e0, 0x550000), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x0600b180, 0x26451850), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x08208208, 0x82082082),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x40820820, 0x2c500), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x808c0146, 0x70820a38), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x9c30827c, 0xc37c20c2), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x20800867, 0x208208),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x02002080, 0xb1401020), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x00518000, 0x828e2023), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x209f1c20, 0x830a70c), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x853df0df, 0x51451450),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x14508214, 0x16142142), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x30805050, 0x60260264), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x43082098, 0x25050806), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x14564014, 0x42000083),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x20850051, 0x8500208), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x14140582, 0x80990c20), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x08261809, 0x82019202), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x90060941, 0x8920519),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xc22cb242, 0x22492492), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x0162492c, 0x43080505), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x86026026, 0x80414515), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xc5b43142, 0x37c38020),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x14508014, 0x42085085), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x50850051, 0x1414058), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x980990c2, 0x51456180), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x0c50a010, 0xe008316d),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x508b21f0, 0x2c52cb2c), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xc22cb249, 0x600d2c92), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x1850821c, 0x873c21c0), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x03cb1420, 0x2c01cb14),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x45185182, 0x20800821), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x08208000, 0x45002002), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x20871803, 0x8700614), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x050821cf, 0x740500f5),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x18609000, 0x934d9646), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x30824d30, 0x4c24d34d), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xc600d642, 0x1860821), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x25dac274, 0xc2a072c9),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x91c27472, 0x2c698398), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x89242242, 0x92420820), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x34b00900, 0x82087180), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xb09d0061, 0x1cb24976),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x9d1cb0a8, 0x60e62470), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x1574ce3e, 0xd31455d7), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x25c25d74, 0x1c600d38), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x423c3142, 0x51515454),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x1403c314, 0xc22c21cb), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x21431853, 0xb2c208), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x05145145, 0x34508b0), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x0c508718, 0x5515108f),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xf2051454, 0x8740500), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x0618f090, 0xe2534d92), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x6592c238, 0x49382659), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x21c600d6, 0x4423c314),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xcb2d1545, 0x72c2a042), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xa091c574, 0x422c3983), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x508b2c52, 0xb2c514), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x8034b08b, 0xf0c50871),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x45515108, 0xa810b2cb), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x715d1cb0, 0x2260e824), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x8e2d74ce, 0xe6592c53), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x38938238, 0x420c3081),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x22020cb1, 0x8508420), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xce0820ce, 0x70c25c20), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x08208b0d, 0x42082082), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x50821421, 0xc204208),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x832c5083, 0x21080880), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x0838c214, 0xa5083882), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xa9c39430, 0xaaaaaaaa), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x9fa9faaa, 0x1aaa7eaa),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x1420c308, 0x824820d0), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x84d94d64, 0x7184d371), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x1b7136d3, 0x34c24d07), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x1534d34d, 0x99093642),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x30c20530, 0x8340508), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x53592092, 0x34dc6136), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x4db4dc61, 0xa479c6dc), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x4924924a, 0x920a9f92),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x8192a82a, 0x72c22030), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x30930920, 0x724b24a), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x920e2422, 0xd72025c), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xc9082247, 0x92d70975),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x24e0892c, 0x880c2049), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xc2481cb0, 0x2c928c24), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x89088749, 0x80a52488), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xaac74394, 0x6a861b2a),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xab27b278, 0x81b2ca6), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x072c2203, 0xa3093092), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x6915ce5c, 0xd76985d3), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x771b6936, 0x5d74c25c),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x892d74d7, 0x724e0973), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x0880c205, 0x4c2481cb), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x739728c2, 0x6174da45), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xda4db5da, 0x4aa175c6),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x86486186, 0x6a869b27), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x308186ca, 0xcb14510), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x44205102, 0x220e2c51), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x38210e2c, 0xcb0d70c5),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x51421452, 0x14514208), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x4b085085, 0x51440c20), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x1440832c, 0xcb145108), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x488b0888, 0x94316208),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x9f7e79c3, 0xfaaa7dfa), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x7ea7df7d, 0x30819ea), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x20d01451, 0x65648558), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x93698399, 0x96135983),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x39071b71, 0xd9653645), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x96451534, 0x4e09909), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x051440c2, 0x21560834), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x60e65959, 0xd660e4da),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xc6dc6584, 0x9207e979), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xdf924820, 0xa82a8207), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x103081a6, 0x892072c5), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xb2ca30b2, 0x2c22072c),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x0538910e, 0x52c70d72), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x08e38914, 0x8b2cb2d7), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x204b24e0, 0x1cb1440c), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x8c2ca248, 0x874b2cb2),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x24488b08, 0x43948162), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x9b1f7e77, 0x9e786aa6), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xeca6a9e7, 0x51030819), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x2892072c, 0x8e38a30b),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x83936913, 0x69961759), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x4538771b, 0x74ce3976), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x08e38b2d, 0xc204e24e), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x81cb1440, 0x28c2ca24),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xda44e38e, 0x85d660e4), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x75c6da65, 0x698607e9), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x99e7864a, 0xa6ca6aa6)
];
const offsetIncrs5 = [
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x00080000, 0x30020000), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x20c060), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x04000000, 0x1000000), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x50603018, 0xdb6db6db),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x00002db6, 0xa4800002), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x41241240, 0x12492088), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x00104120, 0x40000100), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x92092052, 0x2492c420),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x096592d9, 0xc30d800), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xc36036d8, 0xb01b0c06), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x6c36db0d, 0x186c0003), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xb01b6c06, 0xad860361),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x5b6dd6dd, 0x360001b7), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x0db6030c, 0xc412311c), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xb6e36e06, 0xdb0d), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xdb01861b, 0x9188e06),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x71b72b62, 0x6dd6db), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x00800920, 0x40240249), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x904920c2, 0x20824900), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x40049000, 0x12012480),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0xa4906120, 0x5524ad4a), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x02480015, 0x40924020), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x48409409, 0x92522512), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x24000820, 0x49201001),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x204a04a0, 0x29128924), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x00055549, 0x900830d2), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x24c24034, 0x934930c), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x02682493, 0x4186900),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x61201a48, 0x9a498612), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x355249d4, 0xc348001), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x940d2402, 0x24c40930), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x0924e24d, 0x1a40009a),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x06920106, 0x6204984a), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x92712692, 0x92494d54), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x24924924, 0x49249249), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x92492492, 0x24924924),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x49249249, 0x92492492), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x24924924, 0x49249249), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x92492492, 0x24924924), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x49249249, 0x92492492),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x24924924, 0x49249249), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x92492492, 0x24924924), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x49249249, 0x92492492), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x24924924, 0x49249249),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x92492492, 0x24924924), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x49249249, 0x92492492), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x24924924, 0x49249249), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x92492492, 0x24924924),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x49249249, 0x92492492), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x24924924, 0x49249249), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x92492492, 0x24924924), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x49249249, 0x92492492),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x24924924, 0x49249249), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x92492492, 0x24924924), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x49249249, 0x92492492), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x24924924, 0x49249249),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x92492492, 0x24924924), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x49249249, 0x92492492), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x24924924, 0x49249249), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x92492492, 0x24924924),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x49249249, 0x92492492), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x24924924, 0x49249249), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x92492492, 0x24924924), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x49249249, 0x92492492),
    new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x24924924, 0x49249249), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x92492492, 0x24924924), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x49249249, 0x92492492), new __WEBPACK_IMPORTED_MODULE_0__long__["a" /* Long */](0x24924924)
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
class Lev2TParametricDescription extends __WEBPACK_IMPORTED_MODULE_1__parametric_description__["a" /* ParametricDescription */] {
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
                offset += this.unpack(offsetIncrs0, loc, 1);
                state = this.unpack(toStates0, loc, 2) - 1;
            }
        }
        else if (position === this._w - 1) {
            if (state < 5) {
                const loc = vector * 5 + state;
                offset += this.unpack(offsetIncrs1, loc, 1);
                state = this.unpack(toStates1, loc, 3) - 1;
            }
        }
        else if (position === this._w - 2) {
            if (state < 13) {
                const loc = vector * 13 + state;
                offset += this.unpack(offsetIncrs2, loc, 2);
                state = this.unpack(toStates2, loc, 4) - 1;
            }
        }
        else if (position === this._w - 3) {
            if (state < 28) {
                const loc = vector * 28 + state;
                offset += this.unpack(offsetIncrs3, loc, 2);
                state = this.unpack(toStates3, loc, 5) - 1;
            }
        }
        else if (position === this._w - 4) {
            if (state < 45) {
                const loc = vector * 45 + state;
                offset += this.unpack(offsetIncrs4, loc, 3);
                state = this.unpack(toStates4, loc, 6) - 1;
            }
        }
        else {
            if (state < 45) {
                const loc = vector * 45 + state;
                offset += this.unpack(offsetIncrs5, loc, 3);
                state = this.unpack(toStates5, loc, 6) - 1;
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
/* harmony export (immutable) */ __webpack_exports__["a"] = Lev2TParametricDescription;



/***/ }),
/* 14 */
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


/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(15)))

/***/ }),
/* 15 */
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
//# sourceMappingURL=lokijs.full-text-search.js.map