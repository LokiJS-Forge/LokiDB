(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["@lokijs/full-text-search"] = factory();
	else
{		root["@lokijs/full-text-search"] = factory(); root["LokiFullTextSearch"] = root["@lokijs/full-text-search"].default;}
})(this, function() {
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
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__tokenizer__ = __webpack_require__(2);


/**
 * Inverted index class handles featured text search for specific document fields.
 * @constructor InvertedIndex
 * @param {boolean} [options.store=true] - inverted index will be stored at serialization rather than rebuilt on load.
 */
class InvertedIndex {
  /**
   * @param {boolean} store
   * @param {boolean} optimizeChanges
   * @param {Tokenizer} tokenizer
   */
  constructor({store = true, optimizeChanges = true, tokenizer = new __WEBPACK_IMPORTED_MODULE_0__tokenizer__["a" /* Tokenizer */]} = {}) {
    this._store = store;
    this._optimizeChanges = optimizeChanges;
    this._tokenizer = tokenizer;
    this._docCount = 0;
    this._docStore = {};
    this._totalFieldLength = 0;
    this._root = {};
  }

  get store() {
    return this._store;
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
   * @param {object} field - the field to add
   * @param {number} docId - the doc id of the field
   */
  insert(field, docId) {
    if (this._docStore[docId] !== undefined) {
      throw Error("Field already added.");
    }

    this._docCount += 1;
    this._docStore[docId] = {};

    // Tokenize document field.
    let fieldTokens = this._tokenizer.tokenize(field);
    this._totalFieldLength += fieldTokens.length;

    let termRefs = [];
    this._docStore[docId] = {fieldLength: fieldTokens.length};
    if (this._optimizeChanges) {
      Object.defineProperties(this._docStore[docId], {
        termRefs: {enumerable: false, configurable: true, writable: true, value: termRefs}
      });
    }

    // Iterate over all unique field terms.
    for (let term of new Set(fieldTokens)) {
      if (term === "") {
        continue;
      }
      // Calculate term frequency.
      let tf = 0;
      for (let j = 0; j < fieldTokens.length; j++) {
        if (fieldTokens[j] === term) {
          tf++;
        }
      }

      // Add term to index tree.
      let branch = this._root;
      for (let i = 0; i < term.length; i++) {
        let c = term[i];
        if (branch[c] === undefined) {
          let child = {};
          if (this._optimizeChanges) {
            Object.defineProperties(child, {
              pa: {enumerable: false, configurable: true, writable: true, value: branch}
            });
          }
          branch[c] = child;
        }
        branch = branch[c];
      }
      // Add term info to index leaf.
      if (branch.dc === undefined) {
        branch.dc = {};
        branch.df = 0;
      }
      branch.dc[docId] = tf;
      branch.df += 1;

      // Store index leaf for deletion.
      termRefs.push(branch);
    }
  }

  /**
   * Removes all relevant terms of a document from the inverted index.
   * @param {number} docId - the document.
   */
  remove(docId) {
    if (this._docStore[docId] === undefined) {
      return;
    }
    let docStore = this._docStore[docId];
    // Remove document.
    delete this._docStore[docId];
    this._docCount -= 1;

    // Reduce total field length.
    this._totalFieldLength -= docStore.fieldLength;

    if (this._optimizeChanges) {
      // Iterate over all term references.
      // Remove docId from docs and decrement document frequency.
      let termRefs = docStore.termRefs;
      for (let j = 0; j < termRefs.length; j++) {
        let index = termRefs[j];
        index.df -= 1;
        delete index.dc[docId];

        // Check if no document is left for current tree.
        if (index.df === 0) {
          // Delete unused meta data of branch.
          delete index.df;
          delete index.dc;

          // Check for sub branches.
          if (Object.keys(index).length !== 0) {
            continue;
          }

          // Delete term branch if not used anymore.
          let keys = [];
          do {
            // Go tree upwards.
            let parent = index.pa;
            // Delete parent reference for preventing memory leak (cycle reference).
            delete index.pa;

            // Iterate over all children.
            keys = Object.keys(parent);
            for (let k = 0; k < keys.length; k++) {
              let key = keys[k];
              if (key.length !== 1) {
                continue;
              }
              // Remove previous child form parent.
              if (parent[key] === index) {
                delete parent[key];
                break;
              }
            }
            index = parent;
          } while (index.pa !== undefined && keys.length === 1);
        }
      }
    } else {
      // Iterate over the whole inverted index and remove the document.
      // Delete branch if not needed anymore.
      let recursive = (root) => {
        let keys = Object.keys(root);
        for (let i = 0; i < keys.length; i++) {
          let key = keys[i];
          if (key.length === 1) {
            // Checkout branch.
            if (recursive(root[key])) {
              delete root[key];
            }
          }
        }
        // Remove docId from docs and decrement document frequency.
        if (root.df !== undefined) {
          if (root.dc[docId] !== undefined) {
            root.df -= 1;
            delete root.dc[docId];

            // Delete unused meta data of branch.
            if (root.df === 0) {
              delete root.df;
              delete root.dc;
            }
          }
        }
        return Object.keys(root).length === 0;
      };
      recursive(this._root);
    }
  }

  /**
   * Gets the term index of a term.
   * @param {string} term - the term.
   * @param {object} root - the term index to start from
   * @param {number} start - the position of the term string to start from
   * @return {object} - The term index or null if the term is not in the term tree.
   */
  static getTermIndex(term, root, start = 0) {
    if (start >= term.length) {
      return null;
    }
    for (let i = start; i < term.length; i++) {
      if (root[term[i]] === undefined) {
        return null;
      }
      root = root[term[i]];
    }
    return root;
  }

  /**
   * Extends a term index for the one branch.
   * @param {object} root - the term index to start from
   * @return {Array} - array with term indices and extension
   */
  static getNextTermIndex(root) {
    let termIndices = [];
    let keys = Object.keys(root);
    for (let i = 0; i < keys.length; i++) {
      if (keys[i].length === 1) {
        termIndices.push({index: root[keys[i]], term: keys[i]});
      }
    }
    return termIndices;
  }

  /**
   * Extends a term index to all available term leafs.
   * @param {object} root - the term index to start from
   * @returns {Array} - Array with term indices and extension
   */
  static extendTermIndex(root) {
    let termIndices = [];
    let stack = [root];
    let treeStack = [""];
    do {
      let root = stack.pop();
      let treeTermn = treeStack.pop();

      if (root.df !== undefined) {
        termIndices.push({index: root, term: treeTermn});
      }

      let keys = Object.keys(root);
      for (let i = 0; i < keys.length; i++) {
        if (keys[i].length === 1) {
          stack.push(root[keys[i]]);
          treeStack.push(treeTermn + keys[i]);
        }
      }
    } while (stack.length !== 0);

    return termIndices;
  }

  /**
   * Serialize the inverted index.
   * @returns {{docStore: *, _fields: *, index: *}}
   */
  toJSON() {
    if (this._store) {
      return this;
    } else {
      return {
        _store: false,
        _optimizeChanges: this._optimizeChanges,
        _tokenizer: this._tokenizer
      };
    }
  }

  /**
   * Deserialize the inverted index.
   * @param {{docStore: *, _fields: *, index: *}} serialized - The serialized inverted index.
   * @param {Object.<string, function>|Tokenizer} funcTok[undefined] - the depending functions with labels
   *  or an equivalent tokenizer
   */
  static fromJSONObject(serialized, funcTok = undefined) {
    let dbObject = serialized;
    let invIdx = new InvertedIndex({
      store: dbObject._store,
      optimizeChanges: dbObject._optimizeChanges,
      tokenizer: __WEBPACK_IMPORTED_MODULE_0__tokenizer__["a" /* Tokenizer */].fromJSONObject(dbObject._tokenizer, funcTok)
    });
    invIdx._docCount = dbObject._docCount;
    invIdx._docStore = dbObject._docStore;
    invIdx._totalFieldLength = dbObject._totalFieldLength;
    invIdx._root = dbObject._root;

    let regenerate = (index, parent) => {
      // Set parent.
      if (parent !== null) {
        Object.defineProperties(index, {
          pa: {enumerable: false, configurable: true, writable: false, value: parent}
        });
      }

      // Iterate over all keys.
      let keys = Object.keys(index);
      for (let i = 0; i < keys.length; i++) {
        // Found term, save in document store.
        if (keys[i] === "dc") {
          // Get documents of term.
          let docIds = Object.keys(index.dc);
          for (let j = 0; j < docIds.length; j++) {
            // Get document store at specific document/field.
            let ref = invIdx._docStore[docIds[j]];
            if (ref.termRefs === undefined) {
              Object.defineProperties(ref, {
                termRefs: {enumerable: false, configurable: true, writable: true, value: []}
              });
            }
            // Set reference to term index.
            ref.termRefs.push(index);
          }
        } else if (keys[i].length === 1) {
          // Iterate over subtree.
          regenerate(index[keys[i]], index);
        }
      }
    };

    if (invIdx._optimizeChanges) {
      regenerate(invIdx._root, null);
    }

    return invIdx;
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = InvertedIndex;



/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__inverted_index__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index_searcher__ = __webpack_require__(4);



class FullTextSearch {
  /**
   * Initialize the full text search for the given fields.
   * @param {object[]} fields - the field options
   * @param {string} fields.name - the name of the field
   * @param {boolean=true} fields.store - flag to indicate if the full text search should be stored on serialization or
   *  rebuild on deserialization
   * @param {boolean=true} fields.optimizeChanges - flag to indicate if deleting/updating a document should be optimized
   *  (requires more memory but performs better)
   * @param {Tokenizer=Tokenizer} fields.tokenizer - the tokenizer of the field
   * @param {string=$loki} id - the property name of the document index
   */
  constructor(fields, {id = "$loki"} = {}) {
    if (fields === undefined) {
      throw new SyntaxError("Fields needs to be defined!");
    }

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

  addDocument(doc) {
    if (doc[this._id] === undefined) {
      throw new Error("Document is not stored in the collection.");
    }

    let fieldNames = Object.keys(doc);
    for (let i = 0, fieldName; i < fieldNames.length, fieldName = fieldNames[i]; i++) {
      if (this._invIdxs[fieldName] !== undefined) {
        this._invIdxs[fieldName].insert(doc[fieldName], doc[this._id]);
      }
    }

    this._docs.add(doc[this._id]);
    this.setDirty();
  }

  removeDocument(doc) {
    if (doc[this._id] === undefined) {
      throw new Error("Document is not stored in the collection.");
    }

    let fieldNames = Object.keys(this._invIdxs);
    for (let i = 0; i < fieldNames.length; i++) {
      this._invIdxs[fieldNames[i]].remove(doc[this._id]);
    }

    this._docs.delete(doc[this._id]);
    this.setDirty();
  }

  updateDocument(doc) {
    this.removeDocument(doc);
    this.addDocument(doc);
  }

  search(query) {
    return this._idxSearcher.search(query);
  }

  toJSON() {
    let serialized = {};
    let fieldNames = Object.keys(this._invIdxs);
    for (let i = 0, fieldName; i < fieldNames.length, fieldName = fieldNames[i]; i++) {
      serialized[fieldName] = this._invIdxs[fieldName].toJSON();
    }
    return serialized;
  }

  static fromJSONObject(serialized, tokenizers) {
    let db = JSON.parse(serialized);
    let fts = new FullTextSearch();
    let fieldNames = Object.keys(db);
    for (let i = 0, fieldName; i < fieldNames.length, fieldName = fieldNames[i]; i++) {
      fts._invIdxs[fieldName] = new __WEBPACK_IMPORTED_MODULE_0__inverted_index__["a" /* InvertedIndex */]();
      fts._invIdxs[fieldName].loadJSON(db[fieldName], tokenizers[fieldName]);
    }
    return fts;
  }

  setDirty() {
    this._idxSearcher.setDirty();
  }
}
/* harmony export (immutable) */ __webpack_exports__["FullTextSearch"] = FullTextSearch;



/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_js__ = __webpack_require__(3);


/**
 * Splits a string at non-alphanumeric characters into lower case tokens.
 * @param {string} str - the string
 * @returns {string[]} - the tokens
 * @private
 */
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
    this._splitter = null;
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
	 * @private
	 */
  toJSON() {
    let serialized = {tokenizers: []};
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
	 * 	or an equivalent tokenizer
	 */
  static fromJSONObject(serialized, funcTok) {
    let tkz = new Tokenizer();
    if (funcTok !== undefined && funcTok instanceof Tokenizer) {
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
    } else {
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
    if (__WEBPACK_IMPORTED_MODULE_0__utils_js__["a" /* isFunction */](labelFunc)) {
      return this._queue.indexOf(labelFunc);
    } else {
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
/* harmony export (immutable) */ __webpack_exports__["a"] = isFunction;
/* unused harmony export isObject */
/* unused harmony export isNumber */
/* unused harmony export isBoolean */
/* unused harmony export isString */
/**
 * Checks if the variable is a function.
 * @param {*} x - the variable
 * @return {boolean} true if function, otherwise false
 */
function isFunction(x) {
  return Object.prototype.toString.call(x) === "[object Function]";
}

/**
 * Checks if the variable is an object.
 * @param {*} x - the variable
 * @return {boolean} true if object, otherwise false
 */
function isObject(x) {
  return Object.prototype.toString.call(x) === "[object Object]";
}

/**
 * Checks if the variable is a number.
 * @param {*} x - the variable
 * @return {boolean} true if number, otherwise false
 */
function isNumber(x) {
  return Object.prototype.toString.call(x) === "[object Number]";
}

/**
 * Checks if the variable is a boolean.
 * @param {*} x - the variable
 * @return {boolean} true if boolean, otherwise false
 */
function isBoolean(x) {
  return Object.prototype.toString.call(x) === "[object Boolean]";
}

/**
 * Checks if the variable is a string.
 * @param {*} x - the variable
 * @return {boolean} true if string, otherwise false
 */
function isString(x) {
  return Object.prototype.toString.call(x) === "[object String]";
}


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__scorer__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__inverted_index__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__queries__ = __webpack_require__(6);




class IndexSearcher {
  /**
   *
   * @param {object} invIdxs
   */
  constructor(invIdxs, docs) {
    this._invIdxs = invIdxs;
    this._docs = docs;
    this._scorer = new __WEBPACK_IMPORTED_MODULE_0__scorer__["a" /* Scorer */](this._invIdxs);
  }

  search(query) {
    let docResults = this._recursive(query.query, true);

    // Final scoring.
    let finalScoring = query.final_scoring !== undefined ? query.final_scoring : true;
    if (finalScoring) {
      return this._scorer.finalScore(query, docResults);
    }
    return docResults;
  }

  setDirty() {
    this._scorer.setDirty();
  }

  _recursive(query, doScoring) {
    let docResults = {};
    let boost = query.boost !== undefined ? query.boost : 1;
    let fieldName = query.field !== undefined ? query.field : null;
    let enableScoring = query.enable_scoring !== undefined ? query.enable_scoring : false;

    let root = null;
    let tokenizer = null;
    if (this._invIdxs[fieldName] !== undefined) {
      root = this._invIdxs[fieldName].root;
      tokenizer = this._invIdxs[fieldName].tokenizer;
    }

    switch (query.type) {
      case "bool": {
        docResults = null;
        if (query.must !== undefined) {
          docResults = this._getUnique(query.must.values, doScoring, docResults);
        }
        if (query.filter !== undefined) {
          docResults = this._getUnique(query.filter.values, false, docResults);
        }

        if (query.should !== undefined) {
          let shouldDocs = this._getAll(query.should.values, doScoring);

          let empty = false;
          if (docResults === null) {
            docResults = {};
            empty = true;
          }

          let msm = 1;
          // TODO: Enable percent and ranges.
          if (query.minimum_should_match !== undefined) {
            msm = query.minimum_should_match;
            let shouldLength = query.should.values.length;
            if (msm <= -1) {
              msm = shouldLength + msm;
            } else if (msm < 0) {
              msm = shouldLength - Math.floor(shouldLength * -msm);
            } else if (msm < 1) {
              msm = Math.floor(shouldLength * msm);
            }
          }
          // Remove all docs with fewer matches.
          let docs = Object.keys(shouldDocs);
          for (let i = 0, docId; i < docs.length, docId = docs[i]; i++) {
            if (shouldDocs[docId].length >= msm) {
              if (docResults[docId] !== undefined) {
                docResults[docId].push(...shouldDocs[docId]);
              } else if (empty) {
                docResults[docId] = shouldDocs[docId];
              } else {
                delete docResults[docId];
              }
            }
          }
        }
        if (query.not !== undefined) {
          let notDocs = this._getAll(query.not.values, false);
          // Remove all docs.
          let docs = Object.keys(notDocs);
          for (let i = 0, docId; i < docs.length, docId = docs[i]; i++) {
            if (docResults[docId] !== undefined) {
              delete docResults[docId];
            }
          }
        }
        break;
      }
      case "term": {
        let termIdx = __WEBPACK_IMPORTED_MODULE_1__inverted_index__["a" /* InvertedIndex */].getTermIndex(query.value, root);
        this._scorer.prepare(fieldName, boost, termIdx, doScoring, docResults, query.value);
        break;
      }
      case "terms": {
        for (let i = 0; i < query.value.length; i++) {
          let termIdx = __WEBPACK_IMPORTED_MODULE_1__inverted_index__["a" /* InvertedIndex */].getTermIndex(query.value[i], root);
          this._scorer.prepare(fieldName, boost, termIdx, doScoring, docResults, query.value[i]);
        }
        break;
      }
      case "fuzzy": {
        let f = new FuzzySearch(query);
        let b = f.search(root);
        for (let i = 0; i < b.length; i++) {
          this._scorer.prepare(fieldName, boost * b[i].boost, b[i].index, doScoring, docResults, b[i].term);
        }
        break;
      }
      case "wildcard": {
        let w = new WildcardSearch(query);
        let a = w.search(root);
        for (let i = 0; i < a.length; i++) {
          this._scorer.prepare(fieldName, boost, a[i].index, doScoring && enableScoring, docResults, a[i].term);
        }
        break;
      }
      case "match_all": {
        for (let docId of this._docs) {
          this._scorer.scoreConstant(boost, docId, docResults);
        }
        break;
      }
      case "constant_score": {
        let tmpDocResults = this._getAll(query.filter.values, false);
        let docs = Object.keys(tmpDocResults);
        // Add to each document a constant score.
        for (let i = 0; i < docs.length; i++) {
          this._scorer.scoreConstant(boost, docs[i], docResults);
        }
        break;
      }
      case "prefix": {
        let termIdx = __WEBPACK_IMPORTED_MODULE_1__inverted_index__["a" /* InvertedIndex */].getTermIndex(query.value, root);
        if (termIdx !== null) {
          termIdx = __WEBPACK_IMPORTED_MODULE_1__inverted_index__["a" /* InvertedIndex */].extendTermIndex(termIdx);
          for (let i = 0; i < termIdx.length; i++) {
            this._scorer.prepare(fieldName, boost, termIdx[i].index, doScoring && enableScoring, docResults, query.value + termIdx[i].term);
          }
        }
        break;
      }
      case "exists": {
        if (root !== null) {
          let docs = Object.keys(this._invIdxs[fieldName].documentStore);
          for (let i = 0; i < docs.length; i++) {
            this._scorer.scoreConstant(boost, docs[i], docResults);
          }
        }
        break;
      }
      case "match": {
        let terms = tokenizer.tokenize(query.value);
        let operator = query.operator !== undefined ? query.operator : "or";

        let tmpQuery = new __WEBPACK_IMPORTED_MODULE_2__queries__["a" /* QueryBuilder */]().bool();
        if (operator === "or") {
          if (query.minimum_should_match !== undefined) {
            tmpQuery = tmpQuery.minimumShouldMatch(query.minimum_should_match);
          }
          // Build a should query.
          tmpQuery = tmpQuery.beginShould();
        } else {
          // Build a must query.
          tmpQuery = tmpQuery.beginMust();
        }
        tmpQuery = tmpQuery.boost(boost);

        if (query.fuzziness !== undefined) {
          let prefixLength = query.prefix_length !== undefined ? query.prefix_length : 2;
          // Add each fuzzy.
          for (let i = 0; i < terms.length; i++) {
            tmpQuery = tmpQuery.fuzzy(fieldName, terms[i]).fuzziness(query.fuzziness).prefixLength(prefixLength);
          }
        } else {
          // Add each term.
          for (let i = 0; i < terms.length; i++) {
            tmpQuery = tmpQuery.term(fieldName, terms[i]);
          }
        }
        if (operator === "or") {
          tmpQuery = tmpQuery.endShould();
        } else {
          tmpQuery = tmpQuery.endMust();
        }
        docResults = this._recursive(tmpQuery.build().query, doScoring);

        break;
      }
      default:
        break;
    }
    return docResults;
  }

  _getUnique(values, doScoring, docResults) {
    if (values.length === 0) {
      return docResults;
    }

    for (let i = 0; i < values.length; i++) {
      let currDocs = this._recursive(values[i], doScoring);
      if (docResults === null) {
        docResults = this._recursive(values[0], doScoring);
        continue;
      }

      let docs = Object.keys(docResults);
      for (let j = 0, docId; j < docs.length, docId = docs[j]; j++) {
        if (currDocs[docId] === undefined) {
          delete docResults[docId];
        } else {
          docResults[docId].push(...currDocs[docId]);
        }
      }
    }
    return docResults;
  }

  _getAll(values, doScoring) {
    let docResults = {};
    for (let i = 0; i < values.length; i++) {
      let currDocs = this._recursive(values[i], doScoring);
      let docs = Object.keys(currDocs);
      for (let j = 0, docId; j < docs.length, docId = docs[j]; j++) {
        if (docResults[docId] === undefined) {
          docResults[docId] = currDocs[docId];
        } else {
          docResults[docId].push(...currDocs[docId]);
        }
      }
    }
    return docResults;
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = IndexSearcher;



class FuzzySearch {
  constructor(query) {
    this._fuzzy = query.value;
    this._fuzziness = query.fuzziness !== undefined ? query.fuzziness : "AUTO";
    if (this._fuzziness === "AUTO") {
      if (this._fuzzy.length <= 2) {
        this._fuzziness = 0;
      } else if (this._fuzzy.length <= 5) {
        this._fuzziness = 1;
      } else {
        this._fuzziness = 2;
      }
    }
    this._prefixLength = query.prefix_length !== undefined ? query.prefix_length : 2;
  }

  /**
   * Copyright Kigiri: https://github.com/kigiri
   *           Milot Mirdita: https://github.com/milot-mirdita
   *           Toni Neubert:  https://github.com/Viatorus/
   */
  levenshtein_distance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    let tmp;
    let i;
    let j;
    let prev;
    let val;
    // swap to save some memory O(min(a,b)) instead of O(a)
    if (a.length > b.length) {
      tmp = a;
      a = b;
      b = tmp;
    }

    const row = Array(a.length + 1);
    // init the row
    for (i = 0; i <= a.length; i++) {
      row[i] = i;
    }

    // fill in the rest
    for (i = 1; i <= b.length; i++) {
      prev = i;
      for (j = 1; j <= a.length; j++) {
        if (b[i - 1] === a[j - 1]) {	// match
          val = row[j - 1];
        } else {
          val = Math.min(row[j - 1] + 1, // substitution
            Math.min(prev + 1,         // insertion
              row[j] + 1));          // deletion

          // transposition.
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
   * Performs a fuzzy search for a given term.
   * @param {string} query - a fuzzy term to match.
   * @param {number} [maxDistance=2] - maximal edit distance between terms
   * @returns {Array} - array with all matching term indices.
   */
  search(root) {
    // Todo: Include levenshtein to reduce similar iterations.
    // Tree tokens at same depth share same row until depth (should works if recursive).
    // Pregenerate tree token ?
    // var treeToken = Array(token.length + maxDistance);

    let start = root;
    let pre = this._fuzzy.slice(0, this._prefixLength);
    let fuzzy = this._fuzzy;
    if (this._prefixLength !== 0) {
      start = __WEBPACK_IMPORTED_MODULE_1__inverted_index__["a" /* InvertedIndex */].getTermIndex(pre, start);
      fuzzy = fuzzy.slice(this._prefixLength);
    }
    if (start === null) {
      return [];
    }
    if (fuzzy.length === 0) {
      // Return if prefixLength == this._fuzzy length.
      return [{term: this._fuzziness, index: start, boost: 1}];
    }

    let similarTokens = [];

    let stack = [start];
    let treeStack = [""];
    do {
      let root = stack.pop();
      let treeTerms = treeStack.pop();

      // Compare tokens if they are in near distance.
      if (root.df !== undefined && Math.abs(fuzzy.length - treeTerms.length) <= this._fuzziness) {
        const distance = this.levenshtein_distance(fuzzy, treeTerms);
        if (distance <= this._fuzziness) {
          let term = pre + treeTerms;
          // Calculate boost.
          let boost = 1 - distance / Math.min(term.length, this._fuzzy.length);
          similarTokens.push({term, index: root, boost});
        }
      }

      // Iterate over all subtrees.
      // If token from tree is not longer than maximal distance.
      if (treeTerms.length - fuzzy.length <= this._fuzziness) {
        // Iterate over all subtrees.
        let keys = Object.keys(root);
        for (let i = 0; i < keys.length; i++) {
          if (keys[i].length === 1) {
            stack.push(root[keys[i]]);
            treeStack.push(treeTerms + keys[i]);
          }
        }
      }
    } while (stack.length !== 0);

    return similarTokens;
  }
}

class WildcardSearch {

  constructor(query) {
    this._wildcard = query.value;
    this._result = [];
  }

  /**
   * Performs a wild card search for a given query term.
   * @param {string} query - a wild card query to match.
   * @returns {Array} - array with all matching term indices.
   */
  search(root) {
    // Todo: Need an implementation for star operator in the middle.
    this._result = [];
    this._recursive(root);
    return this._result;
  }

  /**
   *
   * @param root
   * @param idx
   * @param term
   * @param escaped
   * @private
   */
  _recursive(root, idx = 0, term = "", escaped = false) {
    if (root === null) {
      return;
    }

    if (idx === this._wildcard.length) {
      if (root.df !== undefined) {
        this._result.push({index: root, term});
      }
      return;
    }

    if (!escaped && this._wildcard[idx] === "\\") {
      this._recursive(root, idx + 1, term, true);
    } else if (!escaped && this._wildcard[idx] === "?") {
      let others = __WEBPACK_IMPORTED_MODULE_1__inverted_index__["a" /* InvertedIndex */].getNextTermIndex(root);
      for (let i = 0; i < others.length; i++) {
        this._recursive(others[i].index, idx + 1, term + others[i].term);
      }
    } else if (!escaped && this._wildcard[idx] === "*") {
      // Check if asterisk is last wildcard character
      if (idx + 1 === this._wildcard.length) {
        let all = __WEBPACK_IMPORTED_MODULE_1__inverted_index__["a" /* InvertedIndex */].extendTermIndex(root);
        for (let i = 0; i < all.length; i++) {
          this._recursive(all[i].index, idx + 1, term + all[i].term);
        }
        return;
      }
      // Iterate over the whole tree.
      this._recursive(root, idx + 1, term);
      let roots = [{index: root, term: ""}];
      do {
        root = roots.pop();
        let others = __WEBPACK_IMPORTED_MODULE_1__inverted_index__["a" /* InvertedIndex */].getNextTermIndex(root.index);
        for (let i = 0; i < others.length; i++) {
          this._recursive(others[i].index, idx + 1, term + root.term + others[i].term);
          roots.push({index: others[i].index, term: root.term + others[i].term});
        }
      } while (roots.length !== 0);
    } else {
      this._recursive(__WEBPACK_IMPORTED_MODULE_1__inverted_index__["a" /* InvertedIndex */].getTermIndex(this._wildcard[idx], root), idx + 1, term + this._wildcard[idx]);
    }
  }
}


/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class Scorer {
  constructor(invIdxs) {
    this._invIdxs = invIdxs;
    this._cache = {};
  }

  setDirty() {
    this._cache = {};
  }

  prepare(fieldName, boost, termIdx, doScoring, docResults = {}, term = null) {
    if (termIdx === null || termIdx.dc === undefined) {
      return null;
    }

    let idf = this._idf(fieldName, termIdx.df);
    let docIds = Object.keys(termIdx.dc);
    for (let j = 0; j < docIds.length; j++) {
      let docId = docIds[j];
      if (docResults[docId] === undefined) {
        docResults[docId] = [];
      }

      if (doScoring) {
        let tf = termIdx.dc[docId];
        docResults[docId].push({
          type: "BM25",
          tf,
          idf,
          boost,
          fieldName,
          term
        });
      } else {
        docResults[docId] = [{
          type: "constant", value: 1, boost, fieldName
        }];
      }
    }

    return docResults;
  }

  scoreConstant(boost, docId, docResults = {}) {
    if (docResults[docId] === undefined) {
      docResults[docId] = [];
    }
    docResults[docId].push({type: "constant", value: 1, boost});
    return docResults;
  }

  finalScore(query, docResults = {}) {
    let result = {};
    let k1 = query.scoring.k1;
    let b = query.scoring.b;

    let docs = Object.keys(docResults);
    for (let i = 0, docId; i < docs.length, docId = docs[i]; i++) {
      let docScore = 0;
      for (let j = 0; j < docResults[docId].length; j++) {
        let docResult = docResults[docId][j];

        let res = 0;
        switch (docResult.type) {
          case "BM25": {
            let tf = docResult.tf;
            let fieldLength = Scorer._calculateFieldLength(this._invIdxs[docResult.fieldName].documentStore[docId]
              .fieldLength);
            let avgFieldLength = this._avgFieldLength(docResult.fieldName);
            // tfNorm, computed as (freq * (k1 + 1)) / (freq + k1 * (1 - b + b * fieldLength / avgFieldLength)) from
            let tfNorm = (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (fieldLength / avgFieldLength)));
            res = docResult.idf * tfNorm * docResult.boost;
            // console.log(
            // 	docId + ":" + docResult.fieldName + ":" + docResult.term + " = " + res,
            // 	"\n\ttype: BM25",
            // 	"\n\tboost: " + docResult.boost,
            // 	"\n\tidf : " + docResult.idf,
            // 	"\n\ttfNorm : " + tfNorm,
            // 	"\n\ttf : " + tf,
            // 	"\n\tavg : " + avgFieldLength,
            // 	"\n\tfl : " + fieldLength);
            break;
          }
          case "constant":
            res = docResult.value * docResult.boost;
            /*console.log(
						 "Constant: " + res,
						 "\n\tboost: " + docResult.boost,
						 "\n\tvalue : " + docResult.value);*/
            break;
        }
        docScore += res;
      }
      //console.log(docId, " === ", docScore);
      result[docId] = docScore;
    }
    return result;
  }

  static _calculateFieldLength(fieldLength) {
    // Lucene uses a SmallFloat (size of 1 byte) to store the field length in scoring.
    // This is useless in javascript, because every number is represented as a double (8 byte).
    // To align the scoring result with lucene, this calculation is still needed.
    // Lucene also includes the field boost, but field boost is deprecated and not supported by Loki.

    // Find closest value in array.
    const lockUp = [1, 1.30612242, 1.77777779, 2.55999994, 4, 5.22448969, 7.11111116, 10.2399998, 16, 20.8979588,
      28.4444447, 40.9599991, 64, 83.591835, 113.777779, 163.839996, 256, 334.36734, 455.111115, 655.359985, 1024,
      1337.46936, 1820.44446, 2621.43994, 4096, 5349.87744, 7281.77783, 10485.7598, 16384, 21399.5098, 29127.1113,
      41943.0391, 65536, 85598.0391, 116508.445, 167772.156, 262144, 342392.156, 466033.781, 671088.625, 1048576,
      1369568.62, 1864135.12, 2684354.5, 4194304, 5478274.5, 7456540.5, 10737418, 16777216, 21913098, 29826162,
      42949672, 67108864, 87652392, 119304648, 171798688, 268435456, 350609568, 477218592, 687194752];

    for (let i = 0; i < lockUp.length; i++) {
      if (lockUp[i] >= fieldLength) {
        return lockUp[i];
      }
    }
    throw RangeError("Unsupported field length.");
  }

  _getCache(fieldName) {
    if (this._cache[fieldName] === undefined) {
      let avgFieldLength = this._invIdxs[fieldName].totalFieldLength / this._invIdxs[fieldName].documentCount;
      this._cache[fieldName] = {idfs: {}, avgFieldLength};
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
    let cache = this._getCache(fieldName);
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
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * Query builder
 */
//import * as Utils from './utils.js';
/**
 * The base query class to enable boost to a query type.
 */
class BaseQuery {
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
     * @return {BaseQuery} object itself for cascading
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
/* unused harmony export BaseQuery */

/**
 * A query which finds documents where a document field contains a term.
 *
 * See also [Lucene#TermQuery]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/TermQuery.html}
 * and [Elasticsearch#TermQuery]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-term-query.html}.
 *
 * @example
 * new QueryBuilder()
 *   .term("name", "infinity"])
 * .build();
 * // The resulting documents:
 * // contains the term infinity
 *
 * @extends BaseQuery
 */
class TermQuery extends BaseQuery {
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
/* unused harmony export TermQuery */

/**
 * A query which finds documents where a document field contains any of the terms.
 *
 * See also [Lucene#TermRangeQuery]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/TermRangeQuery.html}
 * and [Elasticsearch#TermsQuery]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-terms-query.html}.
 *
 * @example
 * new QueryBuilder()
 *   .terms("quotes", ["infinity", "atom", "energy"])
 * .build();
 * // The resulting documents:
 * // contains the terms infinity, atom or energy
 *
 * @extends BaseQuery
 */
class TermsQuery extends BaseQuery {
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
/* unused harmony export TermsQuery */

/**
 * A query which finds documents where the wildcard term can be applied at an existing document field term.
 *
 * Wildcard | Description
 * -------- | ------------
 * ? (question mark) | Skips a single character.
 *
 * To escape a wildcard character, use _\_ (backslash), e.g. \?.
 *
 * * To enable scoring for wildcard queries, use {@link WildcardQuery#enableScoring}.
 *
 * See also [Lucene#WildcardQuery]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/WildcardQuery.html}
 * and [Elasticsearch#WildcardQuery]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-wildcard-query.html}.
 *
 * _TODO: Implement wildcard * (asterisk) to skip zero or more characters._
 * @todo Implement wildcard * (asterisk) to skip zero or more characters.
 *
 * @example
 * new QueryBuilder()
 *   .wildcard("question", "e?nste?n\?")
 * .build();
 * // The resulting documents:
 * // contains the wildcard surname e?nste?n\? (like Einstein? or Eynsteyn? but not Einsteine or Ensten?)
 *
 * @extends BaseQuery
 */
class WildcardQuery extends BaseQuery {
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
     * This flag enables scoring for wildcard results, similar to {@link TermQuery}.
     * @param {boolean} enable - flag to enable or disable scoring
     * @return {WildcardQuery}
     */
    enableScoring(enable) {
        this._data.enable_scoring = enable;
        return this;
    }
}
/* unused harmony export WildcardQuery */

/**
 * A query which finds documents where the fuzzy term can be transformed into an existing document field term within a
 * given edit distance
 * ([Damerau–Levenshtein distance]{@link https://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance}).
 *
 * The edit distance is the minimum number of an insertion, deletion or substitution of a single character
 * or a transposition of two adjacent characters.
 *
 * * To set the maximal allowed edit distance, use {@link FuzzyQuery#fuzziness} (default is AUTO).
 * * To set the initial word length, which should ignored for fuzziness, use {@link FuzzyQuery#prefixLength}.
 *
 * See also [Lucene#FuzzyQuery]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/FuzzyQuery.html}
 * and [Elasticsearch#FuzzyQuery]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-fuzzy-query.html}.
 *
 * @example
 * new QueryBuilder()
 *   .fuzzy("surname", "einsten")
 *     .fuzziness(3)
 *     .prefixLength(3)
 * .build();
 * // The resulting documents:
 * // contains the fuzzy surname einstn (like Einstein or Einst but not Eisstein or Insten)
 *
 * @extends BaseQuery
 */
class FuzzyQuery extends BaseQuery {
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
     * @param {number|string} fuzziness - the edit distance as number or AUTO
     *
     * AUTO generates an edit distance based on the length of the term:
     * * 0..2 -> must match exactly
     * * 3..5 -> one edit allowed
     * * >5 two edits allowed
     *
     * @return {FuzzyQuery} - object itself for cascading
     */
    fuzziness(fuzziness) {
        if (fuzziness !== "AUTO" && fuzziness < 0) {
            throw TypeError("Fuzziness must be a positive number or AUTO.");
        }
        this._data.fuzziness = fuzziness;
        return this;
    }
    /**
     * Sets the initial word length.
     * @param {number} prefixLength - the positive prefix length
     * @return {FuzzyQuery}  object itself for cascading
     */
    prefixLength(prefixLength) {
        if (prefixLength < 0) {
            throw TypeError("Prefix length must be a positive number.");
        }
        this._data.prefix_length = prefixLength;
        return this;
    }
}
/* unused harmony export FuzzyQuery */

/**
 * A query which matches documents containing the prefix of a term inside a field.
 *
 * * To enable scoring for wildcard queries, use {@link WildcardQuery#enableScoring}.
 *
 * See also [Lucene#PrefixQuery]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/PrefixQuery.html}
 * and [Elasticsearch#MatchQuery]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-prefix-query.html}
 *
 * @example
 * new QueryBuilder()
 *   .prefix("surname", "alb")
 * .build()
 * // The resulting documents:
 * // contains the term prefix alb as surname
 *
 * @extends BaseQuery
 */
class PrefixQuery extends BaseQuery {
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
     * This flag enables scoring for wildcard results, similar to {@link TermQuery}.
     * @param {boolean} enable - flag to enable or disable scoring
     * @return {PrefixQuery}
     */
    enableScoring(enable) {
        this._data.enable_scoring = enable;
        return this;
    }
}
/* unused harmony export PrefixQuery */

/**
 * A query which matches all documents with a given field.
 *
 * See also [Elasticsearch#ExistsQuery]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-exists-query.html}.
 *
 * @example
 * new QueryBuilder()
 *   .exists("name")
 * .build()
 * // The resulting documents:
 * // has the field "name"
 *
 * @extends BaseQuery
 */
class ExistsQuery extends BaseQuery {
    /**
     * @param {string} field - the field name of the document
     * @param data
     */
    constructor(field, data = {}) {
        super("exists", data);
        this._data.field = field;
    }
}
/* unused harmony export ExistsQuery */

/**
 * A query which tokenizes the given query text, performs a query foreach token and combines the results using a boolean
 * operator.
 *
 * Operator      | Description
 * ------------- | -------------
 * or (default) | Finds documents which matches some tokens. The minimum amount of matches can be controlled with [minimumShouldMatch]{@link MatchQuery#minimumShouldMatch} (default is 1).
 * and | Finds documents which matches all tokens.
 *
 * To enable a [fuzzy query]{@link FuzzyQuery} for the tokens, use {@link MatchQuery#fuzziness} and {@link MatchQuery#prefixLength}.
 *
 * See also [Lucene#?]{@link ?}
 * and [Elasticsearch#MatchQuery]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-match-query.html}.
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
 * @extends BaseQuery
 */
class MatchQuery extends BaseQuery {
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
     * @return {MatchQuery} object itself for cascading
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
     * @return {MatchQuery} object itself for cascading
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
     * @param {number|string} fuzziness - the edit distance as number or AUTO
     *
     * AUTO generates an edit distance based on the length of the term:
     * * 0..2 -> must match exactly
     * * 3..5 -> one edit allowed
     * * >5 two edits allowed
     *
     * @return {MatchQuery} - object itself for cascading
     */
    fuzziness(fuzziness) {
        if (fuzziness !== "AUTO" && fuzziness < 0) {
            throw TypeError("Fuzziness must be a positive number or AUTO.");
        }
        this._data.fuzziness = fuzziness;
        return this;
    }
    /**
     * Sets the starting word length which should not be considered for fuzziness.
     * @param {number} prefixLength - the positive prefix length
     * @return {MatchQuery} - object itself for cascading
     */
    prefixLength(prefixLength) {
        if (prefixLength < 0) {
            throw TypeError("Prefix length must be a positive number.");
        }
        this._data.prefix_length = prefixLength;
        return this;
    }
}
/* unused harmony export MatchQuery */

/**
 * A query that matches all documents and giving them a constant score equal to the query boost.
 *
 * Typically used inside a must clause of a {@link BoolQuery} to subsequently reject non matching documents with the not
 * clause.
 *
 * See also [Lucene#MatchAllDocsQuery]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/MatchAllDocsQuery.html}
 * and [Elasticsearch#MatchAllQuery]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-match-all-query.html}.
 *
 * @example
 * new QueryBuilder()
 *   .matchAll()
 *     .boost(2.5)
 * .build()
 * // The resulting documents:
 * // all documents and giving a score of 2.5
 *
 * @extends BaseQuery
 */
class MatchAllQuery extends BaseQuery {
    constructor(data = {}) {
        super("match_all", data);
    }
}
/* unused harmony export MatchAllQuery */

/**
 * A query which holds all sub queries like an array.
 * @private
 */
class ArrayQuery extends BaseQuery {
    constructor(callbackName, callback, data = {}) {
        super("array", data);
        this._data.values = [];
        this._callbackName = callbackName;
        this[callbackName] = callback;
        this._prepare = (queryType, ...args) => {
            let data = {};
            let query = new queryType(...args, data);
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
        return this._prepare(BoolQuery);
    }
    constantScore() {
        return this._prepare(ConstantScoreQuery);
    }
    term(field, term) {
        return this._prepare(TermQuery, field, term);
    }
    terms(field, terms) {
        return this._prepare(TermsQuery, field, terms);
    }
    wildcard(field, wildcard) {
        return this._prepare(WildcardQuery, field, wildcard);
    }
    fuzzy(field, fuzzy) {
        return this._prepare(FuzzyQuery, field, fuzzy);
    }
    match(field, query) {
        return this._prepare(MatchQuery, field, query);
    }
    matchAll() {
        return this._prepare(MatchAllQuery);
    }
    prefix(field, prefix) {
        return this._prepare(PrefixQuery, field, prefix);
    }
    exists(field) {
        return this._prepare(ExistsQuery, field);
    }
}
/**
 * A query that wraps sub queries and returns a constant score equal to the query boost for every document in the filter.
 *
 * See also [Lucene#BooleanQuery]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/ConstantScoreQuery.html}
 * and [Elasticsearch#ConstantScoreQuery]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-constant-score-query.html}.
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
 * @extends BaseQuery
 */
class ConstantScoreQuery extends BaseQuery {
    constructor(data = {}) {
        super("constant_score", data);
    }
    /**
     * Starts an array of queries. Use endFilter() to finish the array.
     * @return {ArrayQuery} array query for holding sub queries
     */
    beginFilter() {
        this._data.filter = {};
        return new ArrayQuery("endFilter", () => {
            return this;
        }, this._data.filter);
    }
}
/* unused harmony export ConstantScoreQuery */

/**
 * A query that matches documents matching boolean combinations of sub queries.
 *
 * This query consists of one or more boolean clauses with different behavior but interrelated to each other.
 *
 * Occur         | Description
 * ------------- | -------------
 * must  | Finds documents which matches all sub queries.
 * filter  | Finds documents which matches all sub queries but these documents do not contribute to the score.
 * should  | Finds documents which matches some sub queries. The minimum amount of matches can be controlled with [minimumShouldMatch]{@link BoolQuery#minimumShouldMatch} (default is 1).
 * not  | Documents which match any sub query will be ignored.
 *
 * A sub query can be any other query type and also the bool query itself.
 *
 * See also [Lucene#BooleanQuery]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/BooleanQuery.html}
 * and [Elasticsearch#BoolQuery]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-bool-query.html}.
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
 * @extends BaseQuery
 */
class BoolQuery extends BaseQuery {
    constructor(data = {}) {
        super("bool", data);
    }
    /**
     * Starts an array of queries for must clause. Use endMust() to finish the array.
     * @return {ArrayQuery} array query for holding sub queries
     */
    beginMust() {
        this._data.must = {};
        return new ArrayQuery("endMust", () => {
            return this;
        }, this._data.must);
    }
    /**
     * Starts an array of queries for filter clause. Use endFilter() to finish the array.
     * @return {ArrayQuery} array query for holding sub queries
     */
    beginFilter() {
        this._data.filter = {};
        return new ArrayQuery("endFilter", () => {
            return this;
        }, this._data.filter);
    }
    /**
     * Starts an array of queries for should clause. Use endShould() to finish the array.
     * @return {ArrayQuery} array query for holding sub queries
     */
    beginShould() {
        this._data.should = {};
        return new ArrayQuery("endShould", () => {
            return this;
        }, this._data.should);
    }
    /**
     * Starts an array of queries for not clause. Use endNot() to finish the array.
     * @return {ArrayQuery} array query for holding sub queries
     */
    beginNot() {
        this._data.not = {};
        return new ArrayQuery("endNot", () => {
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
     * @return {BoolQuery} object itself for cascading
     */
    minimumShouldMatch(minShouldMatch) {
        this._data.minimum_should_match = minShouldMatch;
        return this;
    }
}
/* unused harmony export BoolQuery */

/**
 * This query builder is the root of each query search.
 * The query contains a sub query and parameters for setup scoring and search options.
 *
 * Possible sub query types are:
 * {@link TermQuery}, {@link TermsQuery}, {@link FuzzyQuery}, {@link WildcardQuery},
 * {@link MatchQuery}, {@link MatchAllQuery}, {@link PrefixQuery},  {@link BoolQuery},
 * {@link ConstantScoreQuery}, {@link ExistsQuery}
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
        this.useBM25();
    }
    /**
     * The query performs a final scoring over all scored sub queries and rank documents by there relevant.
     * @param {boolean} enable - flag to enable or disable final scoring
     * @return {QueryBuilder}
     */
    enableFinalScoring(enable) {
        this._data.final_scoring = enable;
        return this;
    }
    /**
     * Use [Okapi BM25]{@link https://en.wikipedia.org/wiki/Okapi_BM25} as scoring model (default).
     *
     * See also [Lucene#MatchAllDocsQuery]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/similarities/BM25Similarity.html}
     * and [Elasticsearch#BM25]{@link https://www.elastic.co/guide/en/elasticsearch/guide/current/pluggable-similarites.html#bm25}.
     *
     * @param {number} [k1=1.2] - controls how quickly an increase in term frequency results in term-frequency saturation.
     *                            Lower values result in quicker saturation, and higher values in slower saturation.
     * @param {number} [b=0.75] - controls how much effect field-length normalization should have.
     *                            A value of 0.0 disables normalization completely, and a value of 1.0 normalizes fully.
     * @return {QueryBuilder}
     */
    useBM25(k1 = 1.2, b = 0.75) {
        if (k1 < 0) {
            throw TypeError("BM25s k1 must be a positive number.");
        }
        if (b < 0 || b > 1) {
            throw TypeError("BM25s b must be a number between 0 and 1 inclusive.");
        }
        this._data.scoring = {
            type: "BM25",
            k1,
            b
        };
        return this;
    }
    bool() {
        return this._prepare(BoolQuery);
    }
    constantScore() {
        return this._prepare(ConstantScoreQuery);
    }
    term(field, term) {
        return this._prepare(TermQuery, field, term);
    }
    terms(field, terms) {
        return this._prepare(TermsQuery, field, terms);
    }
    wildcard(field, wildcard) {
        return this._prepare(WildcardQuery, field, wildcard);
    }
    fuzzy(field, fuzzy) {
        return this._prepare(FuzzyQuery, field, fuzzy);
    }
    match(field, query) {
        return this._prepare(MatchQuery, field, query);
    }
    matchAll() {
        return this._prepare(MatchAllQuery);
    }
    prefix(field, prefix) {
        return this._prepare(PrefixQuery, field, prefix);
    }
    exists(field) {
        return this._prepare(ExistsQuery, field);
    }
    _prepare(queryType, ...args) {
        this._child = new queryType(...args, this._data.query);
        this._child.build = () => {
            return this._data;
        };
        return this._child;
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = QueryBuilder;



/***/ })
/******/ ]);
});
//# sourceMappingURL=lokijs.full-text-search.js.map