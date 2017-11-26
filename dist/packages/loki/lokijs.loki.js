(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["@lokijs/loki"] = factory();
	else
{		root["@lokijs/loki"] = factory(); root["Loki"] = root["@lokijs/loki"].default;}
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
/******/ 	return __webpack_require__(__webpack_require__.s = 8);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * LokiEventEmitter is a minimalist version of EventEmitter. It enables any
 * constructor that inherits EventEmitter to emit events and trigger
 * listeners that have been added to the event through the on(event, callback) method
 *
 * @constructor LokiEventEmitter
 */
class LokiEventEmitter {
    constructor() {
        this.events = {};
        this.asyncListeners = false;
    }
    /**
     * on(eventName, listener) - adds a listener to the queue of callbacks associated to an event
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
        event = this.events[eventName];
        if (!event) {
            event = this.events[eventName] = [];
        }
        event.push(listener);
        return listener;
    }
    /**
     * emit(eventName, data) - emits a particular event
     * with the option of passing optional parameters which are going to be processed by the callback
     * provided signatures match (i.e. if passing emit(event, arg0, arg1) the listener should take two parameters)
     * @param {string} eventName - the name of the event
     * @param {object} data - optional object passed with the event
     */
    emit(eventName, ...data) {
        if (eventName && this.events[eventName]) {
            this.events[eventName].forEach((listener) => {
                if (this.asyncListeners) {
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
     * Alias of LokiEventEmitter.prototype.on
     * addListener(eventName, listener) - adds a listener to the queue of callbacks associated to an event
     * @param {string|string[]} eventName - the name(s) of the event(s) to listen to
     * @param {function} listener - callback function of listener to attach
     * @returns {int} the index of the callback in the array of listeners for a particular event
     */
    addListener(eventName, listener) {
        return this.on(eventName, listener);
    }
    /**
     * removeListener() - removes the listener at position 'index' from the event 'eventName'
     * @param {string|string[]} eventName - the name(s) of the event(s) which the listener is attached to
     * @param {function} listener - the listener callback function to remove from emitter
     */
    removeListener(eventName, listener) {
        if (Array.isArray(eventName)) {
            eventName.forEach((currentEventName) => {
                this.removeListener(currentEventName, listener);
            });
        }
        if (this.events[eventName]) {
            const listeners = this.events[eventName];
            listeners.splice(listeners.indexOf(listener), 1);
        }
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = LokiEventEmitter;



/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__event_emitter__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__unique_index__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__resultset__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__dynamic_view__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__helper__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__clone__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__full_text_search_src_full_text_search__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__common_plugin__ = __webpack_require__(3);
/* unused harmony reexport CloneMethod */









/**
 * General utils, including statistical functions
 */
function isDeepProperty(field) {
    return field.indexOf(".") !== -1;
}
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
function deepProperty(obj, property, isDeep) {
    if (isDeep === false) {
        // pass without processing
        return obj[property];
    }
    const pieces = property.split(".");
    let root = obj;
    while (pieces.length > 0) {
        root = root[pieces.shift()];
    }
    return root;
}
/**
 * Collection class that handles documents of same type
 * @extends LokiEventEmitter
 */
class Collection extends __WEBPACK_IMPORTED_MODULE_0__event_emitter__["a" /* LokiEventEmitter */] {
    /**
     * @param {string} name - collection name
     * @param {(object)} [options={}] - a configuration object
     * @param {string[]} [options.unique=[]] - array of property names to define unique constraints for
     * @param {string[]} [options.exact=[]] - array of property names to define exact constraints for
     * @param {string[]} [options.indices=[]] - array property names to define binary indexes for
     * @param {boolean} [options.adaptiveBinaryIndices=true] - collection indices will be actively rebuilt rather than lazily
     * @param {boolean} [options.asyncListeners=false] - whether listeners are invoked asynchronously
     * @param {boolean} [options.disableChangesApi=true] - set to false to enable Changes API
     * @param {boolean} [options.disableDeltaChangesApi=true] - set to false to enable Delta Changes API (requires Changes API, forces cloning)
     * @param {boolean} [options.clone=false] - specify whether inserts and queries clone to/from user
     * @param {boolean} [options.serializableIndices =true] - converts date values on binary indexed property values are serializable
     * @param {string} [options.cloneMethod=CloneMethod.DEEP] - the clone method
     * @param {number} [options.transactional=false] - ?
     * @param {number} options.ttl - ?
     * @param {number} options.ttlInterval - time interval for clearing out 'aged' documents; not set by default.
     * @see {@link Loki#addCollection} for normal creation of collections
     */
    constructor(name, options = {}) {
        super();
        /**
         * Unique contraints contain duplicate object references, so they are not persisted.
         * We will keep track of properties which have unique contraint applied here, and regenerate on load.
         */
        this.constraints = {
            unique: {}
        };
        // the name of the collection
        this.name = name;
        // the data held by the collection
        this.data = [];
        this.idIndex = []; // index of id
        this.binaryIndices = {}; // user defined indexes
        this.constraints = {
            unique: {},
        };
        // .
        this.transforms = {};
        // .
        this.dirty = true;
        // private holders for cached data
        this.cachedIndex = null;
        this.cachedBinaryIndex = null;
        this.cachedData = null;
        /* OPTIONS */
        // exact match and unique constraints
        if (options.unique !== undefined) {
            if (!Array.isArray(options.unique)) {
                options.unique = [options.unique];
            }
            options.unique.forEach((prop) => {
                this.constraints.unique[prop] = new __WEBPACK_IMPORTED_MODULE_1__unique_index__["a" /* UniqueIndex */](prop);
            });
        }
        // Full text search
        if (__WEBPACK_IMPORTED_MODULE_7__common_plugin__["a" /* PLUGINS */]["FullTextSearch"] !== undefined) {
            this._fullTextSearch = options.fullTextSearch !== undefined
                ? new (__WEBPACK_IMPORTED_MODULE_7__common_plugin__["a" /* PLUGINS */]["FullTextSearch"])(options.fullTextSearch) : null;
        }
        else {
            this._fullTextSearch = null;
        }
        // .
        this.adaptiveBinaryIndices = options.adaptiveBinaryIndices !== undefined ? options.adaptiveBinaryIndices : true;
        // .
        this.transactional = options.transactional !== undefined ? options.transactional : false;
        // .
        this.cloneObjects = options.clone !== undefined ? options.clone : false;
        // .
        this.asyncListeners = options.asyncListeners !== undefined ? options.asyncListeners : false;
        // .
        this.disableChangesApi = options.disableChangesApi !== undefined ? options.disableChangesApi : true;
        // .
        this.disableDeltaChangesApi = options.disableDeltaChangesApi !== undefined ? options.disableDeltaChangesApi : true;
        // .
        this.cloneMethod = options.cloneMethod !== undefined ? options.cloneMethod : __WEBPACK_IMPORTED_MODULE_5__clone__["a" /* CloneMethod */].DEEP;
        if (this.disableChangesApi) {
            this.disableDeltaChangesApi = true;
        }
        // .
        this.serializableIndices = options.serializableIndices !== undefined ? options.serializableIndices : true;
        //
        this.ttl = {
            age: null,
            ttlInterval: null,
            daemon: null
        };
        this.setTTL(options.ttl || -1, options.ttlInterval);
        // currentMaxId - change manually at your own peril!
        this.maxId = 0;
        this._dynamicViews = [];
        // events
        this.events = {
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
        // .
        this.changes = [];
        // initialize the id index
        this.ensureId();
        let indices = options.indices ? options.indices : [];
        for (let idx = 0; idx < indices.length; idx++) {
            this.ensureIndex(options.indices[idx]);
        }
        this.setChangesApi(this.disableChangesApi, this.disableDeltaChangesApi);
        // Add change api to event callback.
        this.on("insert", (obj) => {
            this.insertHandler(obj);
        });
        this.on("update", (obj, old) => {
            this.updateHandler(obj, old);
        });
        this.on("delete", (obj) => {
            if (!this.disableChangesApi) {
                this._createChange(this.name, "R", obj);
            }
        });
        this.on("warning", (warning) => {
            this.console.warn(warning);
        });
        // for de-serialization purposes
        this.flushChanges();
        this.console = {
            log() {
            },
            warn() {
            },
            error() {
            },
        };
        /* ------ STAGING API -------- */
        /**
         * stages: a map of uniquely identified 'stages', which hold copies of objects to be
         * manipulated without affecting the data in the original collection
         */
        this.stages = {};
        this.commitLog = [];
    }
    toJSON() {
        return {
            name: this.name,
            _dynamicViews: this._dynamicViews,
            uniqueNames: Object.keys(this.constraints.unique),
            transforms: this.transforms,
            binaryIndices: this.binaryIndices,
            data: this.data,
            idIndex: this.idIndex,
            maxId: this.maxId,
            dirty: this.dirty,
            adaptiveBinaryIndices: this.adaptiveBinaryIndices,
            transactional: this.transactional,
            asyncListeners: this.asyncListeners,
            disableChangesApi: this.disableChangesApi,
            cloneObjects: this.cloneObjects,
            cloneMethod: this.cloneMethod,
            changes: this.changes,
            _fullTextSearch: this._fullTextSearch
        };
    }
    static fromJSONObject(obj, options) {
        let coll = new Collection(obj.name, {
            disableChangesApi: obj.disableChangesApi,
            disableDeltaChangesApi: obj.disableDeltaChangesApi
        });
        coll.adaptiveBinaryIndices = obj.adaptiveBinaryIndices !== undefined ? (obj.adaptiveBinaryIndices === true) : false;
        coll.transactional = obj.transactional;
        coll.asyncListeners = obj.asyncListeners;
        coll.disableChangesApi = obj.disableChangesApi;
        coll.cloneObjects = obj.cloneObjects;
        coll.cloneMethod = obj.cloneMethod || __WEBPACK_IMPORTED_MODULE_5__clone__["a" /* CloneMethod */].DEEP;
        coll.changes = obj.changes;
        coll.dirty = (options && options.retainDirtyFlags === true) ? obj.dirty : false;
        function makeLoader(coll) {
            const collOptions = options[coll.name];
            if (collOptions.proto) {
                let inflater = collOptions.inflate || ((src, dest) => {
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
        let clen = obj.data.length;
        let j = 0;
        if (options && options[obj.name] !== undefined) {
            let loader = makeLoader(obj);
            for (j; j < clen; j++) {
                coll.data[j] = loader(obj.data[j]);
            }
        }
        else {
            for (j; j < clen; j++) {
                coll.data[j] = obj.data[j];
            }
        }
        coll.maxId = (typeof obj.maxId === "undefined") ? 0 : obj.maxId;
        coll.idIndex = obj.idIndex;
        if (obj.binaryIndices !== undefined) {
            coll.binaryIndices = obj.binaryIndices;
        }
        if (obj.transforms !== undefined) {
            coll.transforms = obj.transforms;
        }
        coll.ensureId();
        // regenerate unique indexes
        if (obj.uniqueNames !== undefined) {
            for (j = 0; j < obj.uniqueNames.length; j++) {
                coll.ensureUniqueIndex(obj.uniqueNames[j]);
            }
        }
        // in case they are loading a database created before we added dynamic views, handle undefined
        if (obj._dynamicViews !== undefined) {
            // reinflate DynamicViews and attached Resultsets
            for (let idx = 0; idx < obj._dynamicViews.length; idx++) {
                coll._dynamicViews.push(__WEBPACK_IMPORTED_MODULE_3__dynamic_view__["a" /* DynamicView */].fromJSONObject(coll, obj._dynamicViews[idx]));
            }
        }
        if (obj._fullTextSearch) {
            coll._fullTextSearch = __WEBPACK_IMPORTED_MODULE_6__full_text_search_src_full_text_search__["a" /* FullTextSearch */].fromJSONObject(obj._fullTextSearch);
        }
        return coll;
    }
    /**
     * Adds a named collection transform to the collection
     * @param {string} name - name to associate with transform
     * @param {array} transform - an array of transformation 'step' objects to save into the collection
     */
    addTransform(name, transform) {
        if (this.transforms[name] !== undefined) {
            throw new Error("a transform by that name already exists");
        }
        this.transforms[name] = transform;
    }
    /**
     * Retrieves a named transform from the collection.
     * @param {string} name - name of the transform to lookup.
     */
    getTransform(name) {
        return this.transforms[name];
    }
    /**
     * Updates a named collection transform to the collection
     * @param {string} name - name to associate with transform
     * @param {object} transform - a transformation object to save into collection
     */
    setTransform(name, transform) {
        this.transforms[name] = transform;
    }
    /**
     * Removes a named collection transform from the collection
     * @param {string} name - name of collection transform to remove
     */
    removeTransform(name) {
        delete this.transforms[name];
    }
    /*----------------------------+
     | TTL daemon                  |
     +----------------------------*/
    ttlDaemonFuncGen() {
        const collection = this;
        const age = this.ttl.age;
        return function ttlDaemon() {
            const now = Date.now();
            const toRemove = collection.chain().where((member) => {
                const timestamp = member.meta.updated || member.meta.created;
                const diff = now - timestamp;
                return age < diff;
            });
            toRemove.remove();
        };
    }
    setTTL(age, interval) {
        if (age < 0) {
            clearInterval(this.ttl.daemon);
        }
        else {
            this.ttl.age = age;
            this.ttl.ttlInterval = interval;
            this.ttl.daemon = setInterval(this.ttlDaemonFuncGen(), interval);
        }
    }
    /*----------------------------+
     | INDEXING                    |
     +----------------------------*/
    /**
     * create a row filter that covers all documents in the collection
     */
    prepareFullDocIndex() {
        const len = this.data.length;
        const indexes = new Array(len);
        for (let i = 0; i < len; i += 1) {
            indexes[i] = i;
        }
        return indexes;
    }
    /**
     * Ensure binary index on a certain field
     * @param {string} property - name of property to create binary index on
     * @param {boolean} force - (Optional) flag indicating whether to construct index immediately
     */
    ensureIndex(property, force = false) {
        // optional parameter to force rebuild whether flagged as dirty or not
        if (property === null || property === undefined) {
            throw new Error("Attempting to set index without an associated property");
        }
        if (this.binaryIndices[property] && !force) {
            if (!this.binaryIndices[property].dirty)
                return;
        }
        // if the index is already defined and we are using adaptiveBinaryIndices and we are not forcing a rebuild, return.
        if (this.adaptiveBinaryIndices === true && this.binaryIndices[property] !== undefined && !force) {
            return;
        }
        const index = {
            "name": property,
            "dirty": true,
            "values": this.prepareFullDocIndex()
        };
        this.binaryIndices[property] = index;
        const wrappedComparer = (((prop, data) => (a, b) => {
            let val1, val2, arr;
            if (~prop.indexOf(".")) {
                arr = prop.split(".");
                val1 = arr.reduce(function (obj, i) {
                    return obj && obj[i] || undefined;
                }, data[a]);
                val2 = arr.reduce(function (obj, i) {
                    return obj && obj[i] || undefined;
                }, data[b]);
            }
            else {
                val1 = data[a][prop];
                val2 = data[b][prop];
            }
            if (val1 !== val2) {
                if (Object(__WEBPACK_IMPORTED_MODULE_4__helper__["c" /* ltHelper */])(val1, val2, false))
                    return -1;
                if (Object(__WEBPACK_IMPORTED_MODULE_4__helper__["b" /* gtHelper */])(val1, val2, false))
                    return 1;
            }
            return 0;
        }))(property, this.data);
        index.values.sort(wrappedComparer);
        index.dirty = false;
        this.dirty = true; // for autosave scenarios
    }
    getSequencedIndexValues(property) {
        let idx;
        const idxvals = this.binaryIndices[property].values;
        let result = "";
        for (idx = 0; idx < idxvals.length; idx++) {
            result += " [" + idx + "] " + this.data[idxvals[idx]][property];
        }
        return result;
    }
    ensureUniqueIndex(field) {
        let index = new __WEBPACK_IMPORTED_MODULE_1__unique_index__["a" /* UniqueIndex */](field);
        // if index already existed, (re)loading it will likely cause collisions, rebuild always
        this.constraints.unique[field] = index;
        for (let i = 0; i < this.data.length; i++) {
            index.set(this.data[i], i);
        }
        return index;
    }
    /**
     * Ensure all binary indices
     */
    ensureAllIndexes(force = false) {
        let key;
        const bIndices = this.binaryIndices;
        for (key in bIndices) {
            if (bIndices[key] !== undefined) {
                this.ensureIndex(key, force);
            }
        }
    }
    flagBinaryIndexesDirty() {
        let key;
        const bIndices = this.binaryIndices;
        for (key in bIndices) {
            if (bIndices[key] !== undefined) {
                bIndices[key].dirty = true;
            }
        }
    }
    flagBinaryIndexDirty(index) {
        if (this.binaryIndices[index])
            this.binaryIndices[index].dirty = true;
    }
    /**
     * Quickly determine number of documents in collection (or query)
     * @param {object} query - (optional) query object to count results of
     * @returns {number} number of documents in the collection
     */
    count(query) {
        if (!query) {
            return this.data.length;
        }
        return this.chain().find(query).filteredrows.length;
    }
    /**
     * Rebuild idIndex
     */
    ensureId() {
        const len = this.data.length;
        let i = 0;
        this.idIndex = [];
        for (i; i < len; i += 1) {
            this.idIndex.push(this.data[i].$loki);
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
        const dv = new __WEBPACK_IMPORTED_MODULE_3__dynamic_view__["a" /* DynamicView */](this, name, options);
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
     * For filter function querying you should migrate to [
     * Where()]{@link Collection#updateWhere}.
     *
     * @param {object|function} filterObject - 'mongo-like' query object (or deprecated filterFunction mode)
     * @param {function} updateFunction - update function to run against filtered documents
     */
    findAndUpdate(filterObject, updateFunction) {
        if (typeof (filterObject) === "function") {
            this.updateWhere(filterObject, updateFunction);
        }
        else {
            this.chain().find(filterObject).update(updateFunction);
        }
    }
    /**
     * Applies a 'mongo-like' find query object removes all documents which match that filter.
     *
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
        results = this.cloneObjects ? Object(__WEBPACK_IMPORTED_MODULE_5__clone__["b" /* clone */])(results, this.cloneMethod) : results;
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
        const obj = this.cloneObjects ? Object(__WEBPACK_IMPORTED_MODULE_5__clone__["b" /* clone */])(doc, this.cloneMethod) : doc;
        if (obj.meta === undefined) {
            obj.meta = {
                revision: 0,
                created: 0
            };
        }
        // both 'pre-insert' and 'insert' events are passed internal data reference even when cloning
        // insert needs internal reference because that is where loki itself listens to add meta
        if (!bulkInsert) {
            this.emit("pre-insert", obj);
        }
        if (!this.add(obj)) {
            return undefined;
        }
        returnObj = obj;
        if (!bulkInsert) {
            this.emit("insert", obj);
            returnObj = this.cloneObjects ? Object(__WEBPACK_IMPORTED_MODULE_5__clone__["b" /* clone */])(obj, this.cloneMethod) : obj;
        }
        return returnObj;
    }
    /**
     * Empties the collection.
     * @param {object} options - configure clear behavior
     * @param {boolean} options.removeIndices - (default: false)
     */
    clear(options = {}) {
        this.data = [];
        this.idIndex = [];
        this.cachedIndex = null;
        this.cachedBinaryIndex = null;
        this.cachedData = null;
        this.maxId = 0;
        this._dynamicViews = [];
        this.dirty = true;
        // if removing indices entirely
        if (options.removeIndices === true) {
            this.binaryIndices = {};
            this.constraints = {
                unique: {},
            };
        }
        else {
            // clear binary indices
            const keys = Object.keys(this.binaryIndices);
            keys.forEach((biname) => {
                this.binaryIndices[biname].dirty = false;
                this.binaryIndices[biname].values = [];
            });
            // clear entire unique indices definition
            const uniqueNames = Object.keys(this.constraints.unique);
            for (let i = 0; i < uniqueNames.length; i++) {
                this.constraints.unique[uniqueNames[i]].clear();
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
            let k = 0;
            const len = doc.length;
            for (k; k < len; k += 1) {
                this.update(doc[k]);
            }
            return;
        }
        // verify object is a properly formed document
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
            let newInternal = this.cloneObjects || !this.disableDeltaChangesApi ? Object(__WEBPACK_IMPORTED_MODULE_5__clone__["b" /* clone */])(doc, this.cloneMethod) : doc;
            this.emit("pre-update", doc);
            Object.keys(this.constraints.unique).forEach((key) => {
                this.constraints.unique[key].update(newInternal, position);
            });
            // operate the update
            this.data[position] = newInternal;
            // now that we can efficiently determine the data[] position of newly added document,
            // submit it for all registered DynamicViews to evaluate for inclusion/exclusion
            for (let idx = 0; idx < this._dynamicViews.length; idx++) {
                this._dynamicViews[idx]._evaluateDocument(position, false);
            }
            let key;
            if (this.adaptiveBinaryIndices) {
                // for each binary index defined in collection, immediately update rather than flag for lazy rebuild
                const bIndices = this.binaryIndices;
                for (key in bIndices) {
                    this.adaptiveBinaryIndexUpdate(position, key);
                }
            }
            else {
                this.flagBinaryIndexesDirty();
            }
            this.idIndex[position] = newInternal.$loki;
            // FullTextSearch.
            if (this._fullTextSearch !== null) {
                this._fullTextSearch.updateDocument(doc, position);
            }
            this.commit();
            this.dirty = true; // for autosave scenarios
            this.emit("update", doc, this.cloneObjects || !this.disableDeltaChangesApi ? Object(__WEBPACK_IMPORTED_MODULE_5__clone__["b" /* clone */])(oldInternal, this.cloneMethod) : null);
            return doc;
        }
        catch (err) {
            this.rollback();
            this.console.error(err.message);
            this.emit("error", err);
            throw (err); // re-throw error so user does not think it succeeded
        }
    }
    /**
     * Add object to collection
     */
    add(obj) {
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
            this.maxId++;
            if (isNaN(this.maxId)) {
                this.maxId = (this.data[this.data.length - 1].$loki + 1);
            }
            const newDoc = obj;
            newDoc.$loki = this.maxId;
            newDoc.meta.version = 0;
            let key;
            const constrUnique = this.constraints.unique;
            for (key in constrUnique) {
                if (constrUnique[key] !== undefined) {
                    constrUnique[key].set(newDoc, this.data.length);
                }
            }
            // add new obj id to idIndex
            this.idIndex.push(newDoc.$loki);
            // add the object
            this.data.push(newDoc);
            const addedPos = this.data.length - 1;
            // now that we can efficiently determine the data[] position of newly added document,
            // submit it for all registered DynamicViews to evaluate for inclusion/exclusion
            const dvlen = this._dynamicViews.length;
            for (let i = 0; i < dvlen; i++) {
                this._dynamicViews[i]._evaluateDocument(addedPos, true);
            }
            if (this.adaptiveBinaryIndices) {
                // for each binary index defined in collection, immediately update rather than flag for lazy rebuild
                const bIndices = this.binaryIndices;
                for (key in bIndices) {
                    this.adaptiveBinaryIndexInsert(addedPos, key);
                }
            }
            else {
                this.flagBinaryIndexesDirty();
            }
            // FullTextSearch.
            if (this._fullTextSearch !== null) {
                this._fullTextSearch.addDocument(newDoc, addedPos);
            }
            this.commit();
            this.dirty = true; // for autosave scenarios
            return (this.cloneObjects) ? (Object(__WEBPACK_IMPORTED_MODULE_5__clone__["b" /* clone */])(newDoc, this.cloneMethod)) : (newDoc);
        }
        catch (err) {
            this.rollback();
            this.console.error(err.message);
            this.emit("error", err);
            throw (err); // re-throw error so user does not think it succeeded
        }
    }
    /**
     * Applies a filter function and passes all results to an update function.
     *
     * @param {function} filterFunction - filter function whose results will execute update
     * @param {function} updateFunction - update function to run against filtered documents
     */
    updateWhere(filterFunction, updateFunction) {
        const results = this.where(filterFunction);
        let i = 0;
        let obj;
        try {
            for (i; i < results.length; i++) {
                obj = updateFunction(results[i]);
                this.update(obj);
            }
        }
        catch (err) {
            this.rollback();
            this.console.error(err.message);
        }
    }
    /**
     * Remove all documents matching supplied filter function.
     * For 'mongo-like' querying you should migrate to [findAndRemove()]{@link Collection#findAndRemove}.
     * @param {function|object} query - query object to filter on
     */
    removeWhere(query) {
        let list;
        if (typeof query === "function") {
            list = this.data.filter(query);
            this.remove(list);
        }
        else {
            this.chain().find(query).remove();
        }
    }
    removeDataOnly() {
        this.remove(this.data.slice());
    }
    /**
     * Remove a document from the collection
     * @param {object} doc - document to remove from collection
     */
    remove(doc) {
        if (typeof doc === "number") {
            doc = this.get(doc);
        }
        if ("object" !== typeof doc) {
            throw new Error("Parameter is not an object");
        }
        if (Array.isArray(doc)) {
            let k = 0;
            const len = doc.length;
            for (k; k < len; k += 1) {
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
            Object.keys(this.constraints.unique).forEach((key) => {
                if (doc[key] !== null && typeof doc[key] !== "undefined") {
                    this.constraints.unique[key].remove(doc[key]);
                }
            });
            // now that we can efficiently determine the data[] position of newly added document,
            // submit it for all registered DynamicViews to remove
            for (let idx = 0; idx < this._dynamicViews.length; idx++) {
                this._dynamicViews[idx]._removeDocument(position);
            }
            if (this.adaptiveBinaryIndices) {
                // for each binary index defined in collection, immediately update rather than flag for lazy rebuild
                let key;
                const bIndices = this.binaryIndices;
                for (key in bIndices) {
                    this.adaptiveBinaryIndexRemove(position, key);
                }
            }
            else {
                this.flagBinaryIndexesDirty();
            }
            this.data.splice(position, 1);
            // remove id from idIndex
            this.idIndex.splice(position, 1);
            // FullTextSearch.
            if (this._fullTextSearch != null) {
                this._fullTextSearch.removeDocument(doc, position);
            }
            this.commit();
            this.dirty = true; // for autosave scenarios
            this.emit("delete", arr[0]);
            delete doc.$loki;
            delete doc.meta;
            return doc;
        }
        catch (err) {
            this.rollback();
            this.console.error(err.message);
            this.emit("error", err);
            return null;
        }
    }
    /*------------+
     | Change API |
     +------------*/
    /**
     * Returns all changes.
     * @returns {ANY}
     */
    getChanges() {
        return this.changes;
    }
    /**
     * Enables/disables changes api.
     * @param {boolean} disableChangesApi
     * @param {boolean} disableDeltaChangesApi
     */
    setChangesApi(disableChangesApi, disableDeltaChangesApi = true) {
        this.disableChangesApi = disableChangesApi;
        this.disableDeltaChangesApi = disableDeltaChangesApi;
        if (disableChangesApi) {
            this.disableDeltaChangesApi = true;
        }
        this.insertHandler = this.disableChangesApi ? this._insertMeta : this._insertMetaWithChange;
        this.updateHandler = this.disableChangesApi ? this._updateMeta : this._updateMetaWithChange;
    }
    /**
     * Clears all the changes.
     */
    flushChanges() {
        this.changes = [];
    }
    _getObjectDelta(oldObject, newObject) {
        const propertyNames = newObject !== null && typeof newObject === "object" ? Object.keys(newObject) : null;
        if (propertyNames && propertyNames.length && ["string", "boolean", "number"].indexOf(typeof (newObject)) < 0) {
            const delta = {};
            for (let i = 0; i < propertyNames.length; i++) {
                const propertyName = propertyNames[i];
                if (newObject.hasOwnProperty(propertyName)) {
                    if (!oldObject.hasOwnProperty(propertyName) || this.constraints.unique[propertyName] !== undefined || propertyName === "$loki" || propertyName === "meta") {
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
     * This method creates a clone of the current status of an object and associates operation and collection name,
     * so the parent db can aggregate and generate a changes object for the entire db
     */
    _createChange(name, op, obj, old) {
        this.changes.push({
            name,
            operation: op,
            obj: op === "U" && !this.disableDeltaChangesApi ? this._getChangeDelta(obj, old) : JSON.parse(JSON.stringify(obj))
        });
    }
    _createInsertChange(obj) {
        this._createChange(this.name, "I", obj);
    }
    /**
     * If the changes API is disabled make sure only metadata is added without re-evaluating everytime if the changesApi is enabled
     */
    _insertMeta(obj) {
        let len;
        let idx;
        if (!obj) {
            return;
        }
        // if batch insert
        if (Array.isArray(obj)) {
            len = obj.length;
            for (idx = 0; idx < len; idx++) {
                if (obj[idx].meta === undefined) {
                    obj[idx].meta = {};
                }
                obj[idx].meta.created = (new Date()).getTime();
                obj[idx].meta.revision = 0;
            }
            return;
        }
        // single object
        if (!obj.meta) {
            obj.meta = {};
        }
        obj.meta.created = (new Date()).getTime();
        obj.meta.revision = 0;
    }
    _updateMeta(obj) {
        if (!obj) {
            return;
        }
        obj.meta.updated = (new Date()).getTime();
        obj.meta.revision += 1;
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
    get(id, returnPosition = false) {
        const data = this.idIndex;
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
                return [this.data[min], min];
            }
            return this.data[min];
        }
        return null;
    }
    /**
     * Perform binary range lookup for the data[dataPosition][binaryIndexName] property value
     *    Since multiple documents may contain the same value (which the index is sorted on),
     *    we hone in on range and then linear scan range to find exact index array position.
     * @param {int} dataPosition : coll.data array index/position
     * @param {string} binaryIndexName : index to search for dataPosition in
     */
    getBinaryIndexPosition(dataPosition, binaryIndexName) {
        const val = this.data[dataPosition][binaryIndexName];
        const index = this.binaryIndices[binaryIndexName].values;
        // i think calculateRange can probably be moved to collection
        // as it doesn't seem to need resultset.  need to verify
        //let rs = new Resultset(this, null, null);
        const range = this.calculateRange("$eq", binaryIndexName, val);
        if (range[0] === 0 && range[1] === -1) {
            // uhoh didn't find range
            return null;
        }
        const min = range[0];
        const max = range[1];
        // narrow down the sub-segment of index values
        // where the indexed property value exactly matches our
        // value and then linear scan to find exact -index- position
        for (let idx = min; idx <= max; idx++) {
            if (index[idx] === dataPosition)
                return idx;
        }
        // uhoh
        return null;
    }
    /**
     * Adaptively insert a selected item to the index.
     * @param {int} dataPosition : coll.data array index/position
     * @param {string} binaryIndexName : index to search for dataPosition in
     */
    adaptiveBinaryIndexInsert(dataPosition, binaryIndexName) {
        const index = this.binaryIndices[binaryIndexName].values;
        let val = this.data[dataPosition][binaryIndexName];
        // If you are inserting a javascript Date value into a binary index, convert to epoch time
        if (this.serializableIndices === true && val instanceof Date) {
            this.data[dataPosition][binaryIndexName] = val.getTime();
            val = this.data[dataPosition][binaryIndexName];
        }
        const idxPos = (index.length === 0) ? 0 : this._calculateRangeStart(binaryIndexName, val, true);
        // insert new data index into our binary index at the proper sorted location for relevant property calculated by idxPos.
        // doing this after adjusting dataPositions so no clash with previous item at that position.
        this.binaryIndices[binaryIndexName].values.splice(idxPos, 0, dataPosition);
    }
    /**
     * Adaptively update a selected item within an index.
     * @param {int} dataPosition : coll.data array index/position
     * @param {string} binaryIndexName : index to search for dataPosition in
     */
    adaptiveBinaryIndexUpdate(dataPosition, binaryIndexName) {
        // linear scan needed to find old position within index unless we optimize for clone scenarios later
        // within (my) node 5.6.0, the following for() loop with strict compare is -much- faster than indexOf()
        let idxPos;
        const index = this.binaryIndices[binaryIndexName].values;
        const len = index.length;
        for (idxPos = 0; idxPos < len; idxPos++) {
            if (index[idxPos] === dataPosition)
                break;
        }
        //let idxPos = this.binaryIndices[binaryIndexName].values.indexOf(dataPosition);
        this.binaryIndices[binaryIndexName].values.splice(idxPos, 1);
        //this.adaptiveBinaryIndexRemove(dataPosition, binaryIndexName, true);
        this.adaptiveBinaryIndexInsert(dataPosition, binaryIndexName);
    }
    /**
     * Adaptively remove a selected item from the index.
     * @param {int} dataPosition : coll.data array index/position
     * @param {string} binaryIndexName : index to search for dataPosition in
     */
    adaptiveBinaryIndexRemove(dataPosition, binaryIndexName, removedFromIndexOnly = false) {
        const idxPos = this.getBinaryIndexPosition(dataPosition, binaryIndexName);
        const index = this.binaryIndices[binaryIndexName].values;
        let len;
        let idx;
        if (idxPos === null) {
            // throw new Error('unable to determine binary index position');
            return null;
        }
        // remove document from index
        this.binaryIndices[binaryIndexName].values.splice(idxPos, 1);
        // if we passed this optional flag parameter, we are calling from adaptiveBinaryIndexUpdate,
        // in which case data positions stay the same.
        if (removedFromIndexOnly === true) {
            return;
        }
        // since index stores data array positions, if we remove a document
        // we need to adjust array positions -1 for all document positions greater than removed position
        len = index.length;
        for (idx = 0; idx < len; idx++) {
            if (index[idx] > dataPosition) {
                index[idx]--;
            }
        }
    }
    /**
     * Internal method used for index maintenance and indexed searching.
     * Calculates the beginning of an index range for a given value.
     * For index maintainance (adaptive:true), we will return a valid index position to insert to.
     * For querying (adaptive:false/undefined), we will :
     *    return lower bound/index of range of that value (if found)
     *    return next lower index position if not found (hole)
     * If index is empty it is assumed to be handled at higher level, so
     * this method assumes there is at least 1 document in index.
     *
     * @param {string} prop - name of property which has binary index
     * @param {any} val - value to find within index
     * @param {bool?} adaptive - if true, we will return insert position
     */
    _calculateRangeStart(prop, val, adaptive = false) {
        const rcd = this.data;
        const index = this.binaryIndices[prop].values;
        let min = 0;
        let max = index.length - 1;
        let mid = 0;
        if (index.length === 0) {
            return -1;
        }
        // hone in on start position of value
        while (min < max) {
            mid = (min + max) >> 1;
            if (Object(__WEBPACK_IMPORTED_MODULE_4__helper__["c" /* ltHelper */])(rcd[index[mid]][prop], val, false)) {
                min = mid + 1;
            }
            else {
                max = mid;
            }
        }
        const lbound = min;
        // found it... return it
        if (Object(__WEBPACK_IMPORTED_MODULE_4__helper__["a" /* aeqHelper */])(val, rcd[index[lbound]][prop])) {
            return lbound;
        }
        // if not in index and our value is less than the found one
        if (Object(__WEBPACK_IMPORTED_MODULE_4__helper__["c" /* ltHelper */])(val, rcd[index[lbound]][prop], false)) {
            return adaptive ? lbound : lbound - 1;
        }
        // not in index and our value is greater than the found one
        return adaptive ? lbound + 1 : lbound;
    }
    /**
     * Internal method used for indexed $between.  Given a prop (index name), and a value
     * (which may or may not yet exist) this will find the final position of that upper range value.
     */
    _calculateRangeEnd(prop, val) {
        const rcd = this.data;
        const index = this.binaryIndices[prop].values;
        let min = 0;
        let max = index.length - 1;
        let mid = 0;
        if (index.length === 0) {
            return -1;
        }
        // hone in on start position of value
        while (min < max) {
            mid = (min + max) >> 1;
            if (Object(__WEBPACK_IMPORTED_MODULE_4__helper__["c" /* ltHelper */])(val, rcd[index[mid]][prop], false)) {
                max = mid;
            }
            else {
                min = mid + 1;
            }
        }
        const ubound = max;
        // only eq if last element in array is our val
        if (Object(__WEBPACK_IMPORTED_MODULE_4__helper__["a" /* aeqHelper */])(val, rcd[index[ubound]][prop])) {
            return ubound;
        }
        // if not in index and our value is less than the found one
        if (Object(__WEBPACK_IMPORTED_MODULE_4__helper__["b" /* gtHelper */])(val, rcd[index[ubound]][prop], false)) {
            return ubound + 1;
        }
        // either hole or first nonmatch
        if (Object(__WEBPACK_IMPORTED_MODULE_4__helper__["a" /* aeqHelper */])(val, rcd[index[ubound - 1]][prop])) {
            return ubound - 1;
        }
        // hole, so ubound if nearest gt than the val we were looking for
        return ubound;
    }
    /**
     * Binary Search utility method to find range/segment of values matching criteria.
     *    this is used for collection.find() and first find filter of resultset/dynview
     *    slightly different than get() binary search in that get() hones in on 1 value,
     *    but we have to hone in on many (range)
     * @param {string} op - operation, such as $eq
     * @param {string} prop - name of property to calculate range for
     * @param {object} val - value to use for range calculation.
     * @returns {array} [start, end] index array positions
     */
    calculateRange(op, prop, val) {
        const rcd = this.data;
        const index = this.binaryIndices[prop].values;
        const min = 0;
        const max = index.length - 1;
        let lbound;
        let lval;
        let ubound;
        // when no documents are in collection, return empty range condition
        if (rcd.length === 0) {
            return [0, -1];
        }
        const minVal = rcd[index[min]][prop];
        const maxVal = rcd[index[max]][prop];
        // if value falls outside of our range return [0, -1] to designate no results
        switch (op) {
            case "$eq":
            case "$aeq":
                if (Object(__WEBPACK_IMPORTED_MODULE_4__helper__["c" /* ltHelper */])(val, minVal, false) || Object(__WEBPACK_IMPORTED_MODULE_4__helper__["b" /* gtHelper */])(val, maxVal, false)) {
                    return [0, -1];
                }
                break;
            case "$dteq":
                if (Object(__WEBPACK_IMPORTED_MODULE_4__helper__["c" /* ltHelper */])(val, minVal, false) || Object(__WEBPACK_IMPORTED_MODULE_4__helper__["b" /* gtHelper */])(val, maxVal, false)) {
                    return [0, -1];
                }
                break;
            case "$gt":
                // none are within range
                if (Object(__WEBPACK_IMPORTED_MODULE_4__helper__["b" /* gtHelper */])(val, maxVal, true)) {
                    return [0, -1];
                }
                // all are within range
                if (Object(__WEBPACK_IMPORTED_MODULE_4__helper__["b" /* gtHelper */])(minVal, val, false)) {
                    return [min, max];
                }
                break;
            case "$gte":
                // none are within range
                if (Object(__WEBPACK_IMPORTED_MODULE_4__helper__["b" /* gtHelper */])(val, maxVal, false)) {
                    return [0, -1];
                }
                // all are within range
                if (Object(__WEBPACK_IMPORTED_MODULE_4__helper__["b" /* gtHelper */])(minVal, val, true)) {
                    return [min, max];
                }
                break;
            case "$lt":
                // none are within range
                if (Object(__WEBPACK_IMPORTED_MODULE_4__helper__["c" /* ltHelper */])(val, minVal, true)) {
                    return [0, -1];
                }
                // all are within range
                if (Object(__WEBPACK_IMPORTED_MODULE_4__helper__["c" /* ltHelper */])(maxVal, val, false)) {
                    return [min, max];
                }
                break;
            case "$lte":
                // none are within range
                if (Object(__WEBPACK_IMPORTED_MODULE_4__helper__["c" /* ltHelper */])(val, minVal, false)) {
                    return [0, -1];
                }
                // all are within range
                if (Object(__WEBPACK_IMPORTED_MODULE_4__helper__["c" /* ltHelper */])(maxVal, val, true)) {
                    return [min, max];
                }
                break;
            case "$between":
                // none are within range (low range is greater)
                if (Object(__WEBPACK_IMPORTED_MODULE_4__helper__["b" /* gtHelper */])(val[0], maxVal, false)) {
                    return [0, -1];
                }
                // none are within range (high range lower)
                if (Object(__WEBPACK_IMPORTED_MODULE_4__helper__["c" /* ltHelper */])(val[1], minVal, false)) {
                    return [0, -1];
                }
                lbound = this._calculateRangeStart(prop, val[0]);
                ubound = this._calculateRangeEnd(prop, val[1]);
                if (lbound < 0)
                    lbound++;
                if (ubound > max)
                    ubound--;
                if (!Object(__WEBPACK_IMPORTED_MODULE_4__helper__["b" /* gtHelper */])(rcd[index[lbound]][prop], val[0], true))
                    lbound++;
                if (!Object(__WEBPACK_IMPORTED_MODULE_4__helper__["c" /* ltHelper */])(rcd[index[ubound]][prop], val[1], true))
                    ubound--;
                if (ubound < lbound)
                    return [0, -1];
                return ([lbound, ubound]);
        }
        // determine lbound where needed
        switch (op) {
            case "$eq":
            case "$aeq":
            case "$dteq":
            case "$gte":
            case "$lt":
                lbound = this._calculateRangeStart(prop, val);
                lval = rcd[index[lbound]][prop];
                break;
            default:
                break;
        }
        // determine ubound where needed
        switch (op) {
            case "$eq":
            case "$aeq":
            case "$dteq":
            case "$lte":
            case "$gt":
                ubound = this._calculateRangeEnd(prop, val);
                break;
            default:
                break;
        }
        switch (op) {
            case "$eq":
            case "$aeq":
            case "$dteq":
                // if hole (not found)
                //if (ltHelper(lval, val, false) || gtHelper(lval, val, false)) {
                //  return [0, -1];
                //}
                if (!Object(__WEBPACK_IMPORTED_MODULE_4__helper__["a" /* aeqHelper */])(lval, val)) {
                    return [0, -1];
                }
                return [lbound, ubound];
            //case '$dteq':
            // if hole (not found)
            //  if (lval > val || lval < val) {
            //    return [0, -1];
            //  }
            //  return [lbound, ubound];
            case "$gt":
                // (an eqHelper would probably be better test)
                // if hole (not found) ub position is already greater
                if (!Object(__WEBPACK_IMPORTED_MODULE_4__helper__["a" /* aeqHelper */])(rcd[index[ubound]][prop], val)) {
                    //if (gtHelper(rcd[index[ubound]][prop], val, false)) {
                    return [ubound, max];
                }
                // otherwise (found) so ubound is still equal, get next
                return [ubound + 1, max];
            case "$gte":
                // if hole (not found) lb position marks left outside of range
                if (!Object(__WEBPACK_IMPORTED_MODULE_4__helper__["a" /* aeqHelper */])(rcd[index[lbound]][prop], val)) {
                    //if (ltHelper(rcd[index[lbound]][prop], val, false)) {
                    return [lbound + 1, max];
                }
                // otherwise (found) so lb is first position where its equal
                return [lbound, max];
            case "$lt":
                // if hole (not found) position already is less than
                if (!Object(__WEBPACK_IMPORTED_MODULE_4__helper__["a" /* aeqHelper */])(rcd[index[lbound]][prop], val)) {
                    //if (ltHelper(rcd[index[lbound]][prop], val, false)) {
                    return [min, lbound];
                }
                // otherwise (found) so lb marks left inside of eq range, get previous
                return [min, lbound - 1];
            case "$lte":
                // if hole (not found) ub position marks right outside so get previous
                if (!Object(__WEBPACK_IMPORTED_MODULE_4__helper__["a" /* aeqHelper */])(rcd[index[ubound]][prop], val)) {
                    //if (gtHelper(rcd[index[ubound]][prop], val, false)) {
                    return [min, ubound - 1];
                }
                // otherwise (found) so ub is last position where its still equal
                return [min, ubound];
            default:
                return [0, rcd.length - 1];
        }
    }
    /**
     * Retrieve doc by Unique index
     * @param {string} field - name of uniquely indexed property to use when doing lookup
     * @param {any} value - unique value to search for
     * @returns {object} document matching the value passed
     */
    by(field, value) {
        return this.findOne({ [field]: value });
    }
    /**
     * Find one object by index property, by property equal to value
     * @param {object} query - query object used to perform search with
     * @returns {(object|null)} First matching document, or null if none
     */
    findOne(query) {
        query = query || {};
        // Instantiate Resultset and exec find op passing firstOnly = true param
        const result = this.chain().find(query, true).data();
        if (Array.isArray(result) && result.length === 0) {
            return null;
        }
        else {
            if (!this.cloneObjects) {
                return result[0];
            }
            else {
                return Object(__WEBPACK_IMPORTED_MODULE_5__clone__["b" /* clone */])(result[0], this.cloneMethod);
            }
        }
    }
    /**
     * Chain method, used for beginning a series of chained find() and/or view() operations
     * on a collection.
     *
     * @param {array} transform - Ordered array of transform step objects similar to chain
     * @param {object} parameters - Object containing properties representing parameters to substitute
     * @returns {Resultset} (this) resultset, or data array if any map or join functions where called
     */
    chain(transform, parameters) {
        const rs = new __WEBPACK_IMPORTED_MODULE_2__resultset__["a" /* Resultset */](this);
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
        let i = this.data.length;
        let doc;
        while (i--) {
            if (this.data[i][prop] === value) {
                doc = this.data[i];
                return doc;
            }
        }
        return null;
    }
    /**
     * Transaction methods
     */
    /** start the transation */
    startTransaction() {
        if (this.transactional) {
            this.cachedData = Object(__WEBPACK_IMPORTED_MODULE_5__clone__["b" /* clone */])(this.data, this.cloneMethod);
            this.cachedIndex = this.idIndex;
            this.cachedBinaryIndex = this.binaryIndices;
            // propagate startTransaction to dynamic views
            for (let idx = 0; idx < this._dynamicViews.length; idx++) {
                this._dynamicViews[idx].startTransaction();
            }
        }
    }
    /** commit the transation */
    commit() {
        if (this.transactional) {
            this.cachedData = null;
            this.cachedIndex = null;
            this.cachedBinaryIndex = null;
            // propagate commit to dynamic views
            for (let idx = 0; idx < this._dynamicViews.length; idx++) {
                this._dynamicViews[idx].commit();
            }
        }
    }
    /** roll back the transation */
    rollback() {
        if (this.transactional) {
            if (this.cachedData !== null && this.cachedIndex !== null) {
                this.data = this.cachedData;
                this.idIndex = this.cachedIndex;
                this.binaryIndices = this.cachedBinaryIndex;
            }
            // propagate rollback to dynamic views
            for (let idx = 0; idx < this._dynamicViews.length; idx++) {
                this._dynamicViews[idx].rollback();
            }
        }
    }
    /**
     * Query the collection by supplying a javascript filter function.
     * @example
     * let results = coll.where(function(obj) {
       *   return obj.legs === 8;
       * });
     *
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
        try {
            return reduceFunction(this.data.map(mapFunction));
        }
        catch (err) {
            throw err;
        }
    }
    /**
     * Join two collections on specified properties
     *
     * @param {array} joinData - array of documents to 'join' to this collection
     * @param {string} leftJoinProp - property name in collection
     * @param {string} rightJoinProp - property name in joinData
     * @param {function} mapFun - (Optional) map function to use
     * @returns {Resultset} Result of the mapping operation
     */
    //eqJoin<T extends object>(joinData: T[] | Resultset<T>, leftJoinProp: string | ((obj: E) => string), rightJoinProp: string | ((obj: T) => string)): Resultset<{ left: E; right: T; }>;
    // eqJoin<T extends object, U extends object>(joinData: T[] | Resultset<T>, leftJoinProp: string | ((obj: E) => string), rightJoinProp: string | ((obj: T) => string), mapFun?: (a: E, b: T) => U): Resultset<U> {
    //eqJoin<T extends object, U extends object>(joinData: T[] | Resultset<T>, leftJoinKey: string | ((obj: E) => string), rightJoinKey: string | ((obj: T) => string), mapFun?: (a: E, b: T) => U, dataOptions?: Resultset.DataOptions): Resultset<{ left: E; right: T; }> {
    eqJoin(joinData, leftJoinProp, rightJoinProp, mapFun) {
        // logic in Resultset class
        return new __WEBPACK_IMPORTED_MODULE_2__resultset__["a" /* Resultset */](this).eqJoin(joinData, leftJoinProp, rightJoinProp, mapFun);
    }
    /* ------ STAGING API -------- */
    /**
     * stages: a map of uniquely identified 'stages', which hold copies of objects to be
     * manipulated without affecting the data in the original collection
     */
    /**
     * (Staging API) create a stage and/or retrieve it
     */
    getStage(name) {
        if (!this.stages[name]) {
            this.stages[name] = {};
        }
        return this.stages[name];
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
        let prop;
        const timestamp = new Date().getTime();
        for (prop in stage) {
            this.update(stage[prop]);
            this.commitLog.push({
                timestamp,
                message,
                data: JSON.parse(JSON.stringify(stage[prop]))
            });
        }
        this.stages[stageName] = {};
    }
    /**
     */
    extract(field) {
        let i = 0;
        const len = this.data.length;
        const isDotNotation = isDeepProperty(field);
        const result = [];
        for (i; i < len; i += 1) {
            result.push(deepProperty(this.data[i], field, isDotNotation));
        }
        return result;
    }
    /**
     */
    max(field) {
        return Math.max.apply(null, this.extract(field));
    }
    /**
     */
    min(field) {
        return Math.min.apply(null, this.extract(field));
    }
    /**
     */
    maxRecord(field) {
        let i = 0;
        const len = this.data.length;
        const deep = isDeepProperty(field);
        const result = {
            index: 0,
            value: 0
        };
        let max;
        for (i; i < len; i += 1) {
            if (max !== undefined) {
                if (max < deepProperty(this.data[i], field, deep)) {
                    max = deepProperty(this.data[i], field, deep);
                    result.index = this.data[i].$loki;
                }
            }
            else {
                max = deepProperty(this.data[i], field, deep);
                result.index = this.data[i].$loki;
            }
        }
        result.value = max;
        return result;
    }
    /**
     */
    minRecord(field) {
        let i = 0;
        const len = this.data.length;
        const deep = isDeepProperty(field);
        const result = {
            index: 0,
            value: 0
        };
        let min;
        for (i; i < len; i += 1) {
            if (min !== undefined) {
                if (min > deepProperty(this.data[i], field, deep)) {
                    min = deepProperty(this.data[i], field, deep);
                    result.index = this.data[i].$loki;
                }
            }
            else {
                min = deepProperty(this.data[i], field, deep);
                result.index = this.data[i].$loki;
            }
        }
        result.value = min;
        return result;
    }
    /**
     */
    extractNumerical(field) {
        return this.extract(field).map(parseFloat).filter(Number).filter((n) => !(isNaN(n)));
    }
    /**
     * Calculates the average numerical value of a property
     *
     * @param {string} field - name of property in docs to average
     * @returns {number} average of property in all docs in the collection
     */
    avg(field) {
        return average(this.extractNumerical(field));
    }
    /**
     * Calculate standard deviation of a field
     * @param {string} field
     */
    stdDev(field) {
        return standardDeviation(this.extractNumerical(field));
    }
    /**
     * @param {string} field
     */
    mode(field) {
        const dict = {};
        const data = this.extract(field);
        data.forEach((obj) => {
            if (dict[obj]) {
                dict[obj] += 1;
            }
            else {
                dict[obj] = 1;
            }
        });
        let max;
        let prop;
        let mode;
        for (prop in dict) {
            if (max) {
                if (max < dict[prop]) {
                    mode = prop;
                }
            }
            else {
                mode = prop;
                max = dict[prop];
            }
        }
        return mode;
    }
    /**
     * @param {string} field - property name
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
/* harmony export (immutable) */ __webpack_exports__["a"] = Collection;



/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return CloneMethod; });
/* harmony export (immutable) */ __webpack_exports__["b"] = clone;
var CloneMethod;
(function (CloneMethod) {
    CloneMethod[CloneMethod["PARSE_STRINGIFY"] = 0] = "PARSE_STRINGIFY";
    CloneMethod[CloneMethod["DEEP"] = 1] = "DEEP";
    CloneMethod[CloneMethod["SHALLOW"] = 2] = "SHALLOW";
    CloneMethod[CloneMethod["SHALLOW_ASSIGN"] = 3] = "SHALLOW_ASSIGN";
    CloneMethod[CloneMethod["SHALLOW_RECURSE_OBJECTS"] = 4] = "SHALLOW_RECURSE_OBJECTS";
})(CloneMethod || (CloneMethod = {}));
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
    if (target instanceof Date) {
        return new Date(target.getTime());
    }
    const copy = (target instanceof Array) ? [] : {};
    walk(target, copy);
    return copy;
}
/**
 * @hidden
 */
function clone(data, method = CloneMethod.PARSE_STRINGIFY) {
    if (data === null || data === undefined) {
        return null;
    }
    let cloned;
    switch (method) {
        case CloneMethod.PARSE_STRINGIFY:
            cloned = JSON.parse(JSON.stringify(data));
            break;
        case CloneMethod.DEEP:
            cloned = deepCopy(data);
            break;
        case CloneMethod.SHALLOW:
            cloned = Object.create(data.constructor.prototype);
            Object.assign(cloned, data);
            break;
        case CloneMethod.SHALLOW_RECURSE_OBJECTS:
            // shallow clone top level properties
            cloned = clone(data, CloneMethod.SHALLOW);
            const keys = Object.keys(data);
            // for each of the top level properties which are object literals, recursively shallow copy
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (typeof data[key] === "object" && data[key].constructor.name === "Object") {
                    cloned[key] = clone(data[key], CloneMethod.SHALLOW_RECURSE_OBJECTS);
                }
            }
            break;
        default:
            break;
    }
    return cloned;
}


/***/ }),
/* 3 */
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


/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(4)))

/***/ }),
/* 4 */
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


/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__collection__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__clone__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__helper__ = __webpack_require__(6);



// used to recursively scan hierarchical transform step object for param substitution
function resolveTransformObject(subObj, params, depth = 0) {
    let prop;
    let pname;
    if (++depth >= 10)
        return subObj;
    for (prop in subObj) {
        if (typeof subObj[prop] === "string" && subObj[prop].indexOf("[%lktxp]") === 0) {
            pname = subObj[prop].substring(8);
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
    let idx;
    let clonedStep;
    const resolvedTransform = [];
    if (params === undefined)
        return transform;
    // iterate all steps in the transform array
    for (idx = 0; idx < transform.length; idx++) {
        // clone transform so our scan/replace can operate directly on cloned transform
        clonedStep = Object(__WEBPACK_IMPORTED_MODULE_1__clone__["b" /* clone */])(transform[idx], __WEBPACK_IMPORTED_MODULE_1__clone__["a" /* CloneMethod */].SHALLOW_RECURSE_OBJECTS);
        resolvedTransform.push(resolveTransformObject(clonedStep, params));
    }
    return resolvedTransform;
}
function containsCheckFn(a) {
    if (typeof a === "string" || Array.isArray(a)) {
        return (b) => a.indexOf(b) !== -1;
    }
    else if (typeof a === "object" && a !== null) {
        return (b) => Object.hasOwnProperty.call(a, b);
    }
    return null;
}
function doQueryOp(val, op) {
    for (let p in op) {
        if (Object.hasOwnProperty.call(op, p)) {
            return LokiOps[p](val, op[p]);
        }
    }
    return false;
}
/**
 * @hidden
 */
const LokiOps = {
    // comparison operators
    // a is the value in the collection
    // b is the query value
    $eq(a, b) {
        return a === b;
    },
    // abstract/loose equality
    $aeq(a, b) {
        return a == b;
    },
    $ne(a, b) {
        // ecma 5 safe test for NaN
        if (b !== b) {
            // ecma 5 test value is not NaN
            return (a === a);
        }
        return a !== b;
    },
    // date equality / loki abstract equality test
    $dteq(a, b) {
        return Object(__WEBPACK_IMPORTED_MODULE_2__helper__["a" /* aeqHelper */])(a, b);
    },
    $gt(a, b) {
        return Object(__WEBPACK_IMPORTED_MODULE_2__helper__["b" /* gtHelper */])(a, b, false);
    },
    $gte(a, b) {
        return Object(__WEBPACK_IMPORTED_MODULE_2__helper__["b" /* gtHelper */])(a, b, true);
    },
    $lt(a, b) {
        return Object(__WEBPACK_IMPORTED_MODULE_2__helper__["c" /* ltHelper */])(a, b, false);
    },
    $lte(a, b) {
        return Object(__WEBPACK_IMPORTED_MODULE_2__helper__["c" /* ltHelper */])(a, b, true);
    },
    // ex : coll.find({'orderCount': {$between: [10, 50]}});
    $between(a, vals) {
        if (a === undefined || a === null)
            return false;
        return (Object(__WEBPACK_IMPORTED_MODULE_2__helper__["b" /* gtHelper */])(a, vals[0], true) && Object(__WEBPACK_IMPORTED_MODULE_2__helper__["c" /* ltHelper */])(a, vals[1], true));
    },
    $in(a, b) {
        return b.indexOf(a) !== -1;
    },
    $nin(a, b) {
        return b.indexOf(a) === -1;
    },
    $keyin(a, b) {
        return a in b;
    },
    $nkeyin(a, b) {
        return !(a in b);
    },
    $definedin(a, b) {
        return b[a] !== undefined;
    },
    $undefinedin(a, b) {
        return b[a] === undefined;
    },
    $regex(a, b) {
        return b.test(a);
    },
    $containsString(a, b) {
        return (typeof a === "string") && (a.indexOf(b) !== -1);
    },
    $containsNone(a, b) {
        return !LokiOps.$containsAny(a, b);
    },
    $containsAny(a, b) {
        const checkFn = containsCheckFn(a);
        if (checkFn !== null) {
            return (Array.isArray(b)) ? (b.some(checkFn)) : (checkFn(b));
        }
        return false;
    },
    $contains(a, b) {
        const checkFn = containsCheckFn(a);
        if (checkFn !== null) {
            return (Array.isArray(b)) ? (b.every(checkFn)) : (checkFn(b));
        }
        return false;
    },
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
        return (typeof b !== "object") ? (type === b) : doQueryOp(type, b);
    },
    $finite(a, b) {
        return (b === isFinite(a));
    },
    $size(a, b) {
        if (Array.isArray(a)) {
            return (typeof b !== "object") ? (a.length === b) : doQueryOp(a.length, b);
        }
        return false;
    },
    $len(a, b) {
        if (typeof a === "string") {
            return (typeof b !== "object") ? (a.length === b) : doQueryOp(a.length, b);
        }
        return false;
    },
    $where(a, b) {
        return b(a) === true;
    },
    // field-level logical operators
    // a is the value in the collection
    // b is the nested query operation (for '$not')
    //   or an array of nested query operations (for '$and' and '$or')
    $not(a, b) {
        return !doQueryOp(a, b);
    },
    $and(a, b) {
        for (let idx = 0, len = b.length; idx < len; idx += 1) {
            if (!doQueryOp(a, b[idx])) {
                return false;
            }
        }
        return true;
    },
    $or(a, b) {
        for (let idx = 0, len = b.length; idx < len; idx += 1) {
            if (doQueryOp(a, b[idx])) {
                return true;
            }
        }
        return false;
    }
};
/* unused harmony export LokiOps */

// if an op is registered in this object, our 'calculateRange' can use it with our binary indices.
// if the op is registered to a function, we will run that function/op as a 2nd pass filter on results.
// those 2nd pass filter functions should be similar to LokiOps functions, accepting 2 vals to compare.
const indexedOps = {
    $eq: LokiOps.$eq,
    $aeq: true,
    $dteq: true,
    $gt: true,
    $gte: true,
    $lt: true,
    $lte: true,
    $in: true,
    $between: true
};
/**
 * dotSubScan - helper function used for dot notation queries.
 *
 * @param {object} root - object to traverse
 * @param {array} paths - array of properties to drill into
 * @param {function} fun - evaluation function to test with
 * @param {any} value - comparative value to also pass to (compare) fun
 * @param {number} pathOffset - index of the item in 'paths' to start the sub-scan from
 */
function dotSubScan(root, paths, fun, value, pathOffset = 0) {
    const path = paths[pathOffset];
    if (root === undefined || root === null || root[path] === undefined) {
        return false;
    }
    let valueFound = false;
    const element = root[path];
    if (pathOffset + 1 >= paths.length) {
        // if we have already expanded out the dot notation,
        // then just evaluate the test function and value on the element
        valueFound = fun(element, value);
    }
    else if (Array.isArray(element)) {
        for (let index = 0, len = element.length; index < len; index += 1) {
            valueFound = dotSubScan(element[index], paths, fun, value, pathOffset + 1);
            if (valueFound === true) {
                break;
            }
        }
    }
    else {
        valueFound = dotSubScan(element, paths, fun, value, pathOffset + 1);
    }
    return valueFound;
}
/**
 * Resultset class allowing chainable queries.  Intended to be instanced internally.
 *    Collection.find(), Collection.where(), and Collection.chain() instantiate this.
 *
 * @example
 *    mycollection.chain()
 *      .find({ 'doors' : 4 })
 *      .where(function(obj) { return obj.name === 'Toyota' })
 *      .data();
 */
class Resultset {
    /**
     * Constructor.
     * @param {Collection} collection - the collection which this Resultset will query against
     */
    constructor(collection) {
        // retain reference to collection we are querying against
        this.collection = collection;
        this.filteredrows = [];
        this.filterInitialized = false;
        this._scoring = null;
    }
    /**
     * reset() - Reset the resultset to its initial state.
     *
     * @returns {Resultset} Reference to this resultset, for future chain operations.
     */
    reset() {
        if (this.filteredrows.length > 0) {
            this.filteredrows = [];
        }
        this.filterInitialized = false;
        return this;
    }
    /**
     * toJSON() - Override of toJSON to avoid circular references
     *
     */
    toJSON() {
        const copy = this.copy();
        copy.collection = null;
        return copy;
    }
    /**
     * Allows you to limit the number of documents passed to next chain operation.
     *    A resultset copy() is made to avoid altering original resultset.
     *
     * @param {int} qty - The number of documents to return.
     * @returns {Resultset} Returns a copy of the resultset, limited by qty, for subsequent chain ops.
     */
    limit(qty) {
        // if this has no filters applied, we need to populate filteredrows first
        if (!this.filterInitialized && this.filteredrows.length === 0) {
            this.filteredrows = this.collection.prepareFullDocIndex();
        }
        this.filteredrows = this.filteredrows.slice(0, qty);
        this.filterInitialized = true;
        return this;
    }
    /**
     * Used for skipping 'pos' number of documents in the resultset.
     *
     * @param {int} pos - Number of documents to skip; all preceding documents are filtered out.
     * @returns {Resultset} Returns a copy of the resultset, containing docs starting at 'pos' for subsequent chain ops.
     */
    offset(pos) {
        // if this has no filters applied, we need to populate filteredrows first
        if (!this.filterInitialized && this.filteredrows.length === 0) {
            this.filteredrows = this.collection.prepareFullDocIndex();
        }
        this.filteredrows = this.filteredrows.slice(pos);
        this.filterInitialized = true;
        return this;
    }
    /**
     * copy() - To support reuse of resultset in branched query situations.
     *
     * @returns {Resultset} Returns a copy of the resultset (set) but the underlying document references will be the same.
     */
    copy() {
        const result = new Resultset(this.collection);
        if (this.filteredrows.length > 0) {
            result.filteredrows = this.filteredrows.slice();
        }
        result.filterInitialized = this.filterInitialized;
        return result;
    }
    /**
     * Alias of copy()
     */
    branch() {
        return this.copy();
    }
    /**
     * Executes a named collection transform or raw array of transform steps against the resultset.
     *
     * @param {(string|array)} transform - name of collection transform or raw transform array
     * @param {object} [parameters=] - object property hash of parameters, if the transform requires them.
     * @returns {Resultset} either (this) resultset or a clone of of this resultset (depending on steps)
     */
    transform(transform, parameters) {
        let idx;
        let step;
        let rs = this;
        // if transform is name, then do lookup first
        if (typeof transform === "string") {
            if (this.collection.transforms[transform] !== undefined) {
                transform = this.collection.transforms[transform];
            }
        }
        // either they passed in raw transform array or we looked it up, so process
        if (typeof transform !== "object" || !Array.isArray(transform)) {
            throw new Error("Invalid transform");
        }
        if (parameters !== undefined) {
            transform = resolveTransformParams(transform, parameters);
        }
        for (idx = 0; idx < transform.length; idx++) {
            step = transform[idx];
            switch (step.type) {
                case "find":
                    rs.find(step.value);
                    break;
                case "where":
                    rs.where(step.value);
                    break;
                case "simplesort":
                    rs.simplesort(step.property, step.desc);
                    break;
                case "compoundsort":
                    rs.compoundsort(step.value);
                    break;
                case "sort":
                    rs.sort(step.value);
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
                // following cases update documents in current filtered resultset (use carefully)
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
     *
     * @param {function} comparefun - A javascript compare function used for sorting.
     * @returns {Resultset} Reference to this resultset, sorted, for future chain operations.
     */
    sort(comparefun) {
        // if this has no filters applied, just we need to populate filteredrows first
        if (!this.filterInitialized && this.filteredrows.length === 0) {
            this.filteredrows = this.collection.prepareFullDocIndex();
        }
        const wrappedComparer = (((userComparer, data) => (a, b) => userComparer(data[a], data[b])))(comparefun, this.collection.data);
        this.filteredrows.sort(wrappedComparer);
        return this;
    }
    /**
     * Simpler, loose evaluation for user to sort based on a property name. (chainable).
     *    Sorting based on the same lt/gt helper functions used for binary indices.
     *
     * @param {string} propname - name of property to sort by.
     * @param {boolean} isdesc - (Optional) If true, the property will be sorted in descending order
     * @returns {Resultset} Reference to this resultset, sorted, for future chain operations.
     */
    simplesort(propname, isdesc) {
        if (typeof (isdesc) === "undefined") {
            isdesc = false;
        }
        // if this has no filters applied, just we need to populate filteredrows first
        if (!this.filterInitialized && this.filteredrows.length === 0) {
            // if we have a binary index and no other filters applied, we can use that instead of sorting (again)
            if (this.collection.binaryIndices[propname] !== undefined) {
                // make sure index is up-to-date
                this.collection.ensureIndex(propname);
                // copy index values into filteredrows
                this.filteredrows = this.collection.binaryIndices[propname].values.slice(0);
                if (isdesc) {
                    this.filteredrows.reverse();
                }
                // we are done, return this (resultset) for further chain ops
                return this;
            }
            else {
                this.filteredrows = this.collection.prepareFullDocIndex();
            }
        }
        const wrappedComparer = ((prop, desc, data) => (a, b) => {
            let val1, val2, arr;
            if (~prop.indexOf(".")) {
                arr = prop.split(".");
                val1 = arr.reduce(function (obj, i) {
                    return obj && obj[i] || undefined;
                }, data[a]);
                val2 = arr.reduce(function (obj, i) {
                    return obj && obj[i] || undefined;
                }, data[b]);
            }
            else {
                val1 = data[a][prop];
                val2 = data[b][prop];
            }
            return Object(__WEBPACK_IMPORTED_MODULE_2__helper__["d" /* sortHelper */])(val1, val2, desc);
        })(propname, isdesc, this.collection.data);
        this.filteredrows.sort(wrappedComparer);
        return this;
    }
    /**
     * Allows sorting a resultset based on multiple columns.
     * @example
     * // to sort by age and then name (both ascending)
     * rs.compoundsort(['age', 'name']);
     * // to sort by age (ascending) and then by name (descending)
     * rs.compoundsort(['age', ['name', true]);
     *
     * @param {array} properties - array of property names or subarray of [propertyname, isdesc] used evaluate sort order
     * @returns {Resultset} Reference to this resultset, sorted, for future chain operations.
     */
    compoundsort(properties) {
        if (properties.length === 0) {
            throw new Error("Invalid call to compoundsort, need at least one property");
        }
        let prop;
        if (properties.length === 1) {
            prop = properties[0];
            if (typeof prop === "string") {
                return this.simplesort(prop, false);
            }
            else {
                return this.simplesort(prop[0], prop[1]);
            }
        }
        // unify the structure of 'properties' to avoid checking it repeatedly while sorting
        for (let i = 0, len = properties.length; i < len; i += 1) {
            prop = properties[i];
            if (typeof prop === "string") {
                properties[i] = [prop, false];
            }
        }
        // if this has no filters applied, just we need to populate filteredrows first
        if (!this.filterInitialized && this.filteredrows.length === 0) {
            this.filteredrows = this.collection.prepareFullDocIndex();
        }
        const wrappedComparer = (((props, data) => (a, b) => this._compoundeval(props, data[a], data[b])))(properties, this.collection.data);
        this.filteredrows.sort(wrappedComparer);
        return this;
    }
    /**
     * Helper function for compoundsort(), performing individual object comparisons
     *
     * @param {Array} properties - array of property names, in order, by which to evaluate sort order
     * @param {object} obj1 - first object to compare
     * @param {object} obj2 - second object to compare
     * @returns {number} 0, -1, or 1 to designate if identical (sortwise) or which should be first
     */
    _compoundeval(properties, obj1, obj2) {
        let res = 0;
        let prop;
        let field;
        let val1, val2, arr;
        for (let i = 0, len = properties.length; i < len; i++) {
            prop = properties[i];
            field = prop[0];
            if (~field.indexOf(".")) {
                arr = field.split(".");
                val1 = arr.reduce((obj, i) => {
                    return obj && obj[i] || undefined;
                }, obj1);
                val2 = arr.reduce((obj, i) => {
                    return obj && obj[i] || undefined;
                }, obj2);
            }
            else {
                val1 = obj1[field];
                val2 = obj2[field];
            }
            res = Object(__WEBPACK_IMPORTED_MODULE_2__helper__["d" /* sortHelper */])(val1, val2, prop[1]);
            if (res !== 0) {
                return res;
            }
        }
        return 0;
    }
    /**
     * Sorts the resultset based on the last full-text-search scoring.
     * @param {boolean} [ascending=false] - sort ascending
     * @returns {Resultset<E extends Object>}
     */
    sortByScoring(ascending = false) {
        if (this._scoring === null) {
            throw new Error("No scoring available");
        }
        if (ascending) {
            this.filteredrows.sort((a, b) => this._scoring[a] - this._scoring[b]);
        }
        else {
            this.filteredrows.sort((a, b) => this._scoring[b] - this._scoring[a]);
        }
        return this;
    }
    /**
     * findOr() - oversee the operation of OR'ed query expressions.
     *    OR'ed expression evaluation runs each expression individually against the full collection,
     *    and finally does a set OR on each expression's results.
     *    Each evaluation can utilize a binary index to prevent multiple linear array scans.
     *
     * @param {array} expressionArray - array of expressions
     * @returns {Resultset} this resultset for further chain ops.
     */
    findOr(expressionArray) {
        let fr = null;
        let fri = 0;
        let frlen = 0;
        const docset = [];
        const idxset = [];
        let idx = 0;
        const origCount = this.count();
        // If filter is already initialized, then we query against only those items already in filter.
        // This means no index utilization for fields, so hopefully its filtered to a smallish filteredrows.
        for (let ei = 0, elen = expressionArray.length; ei < elen; ei++) {
            // we need to branch existing query to run each filter separately and combine results
            fr = this.branch().find(expressionArray[ei]).filteredrows;
            frlen = fr.length;
            // if the find operation did not reduce the initial set, then the initial set is the actual result
            if (frlen === origCount) {
                return this;
            }
            // add any document 'hits'
            for (fri = 0; fri < frlen; fri++) {
                idx = fr[fri];
                if (idxset[idx] === undefined) {
                    idxset[idx] = true;
                    docset.push(idx);
                }
            }
        }
        this.filteredrows = docset;
        this.filterInitialized = true;
        return this;
    }
    $or(expressionArray) {
        return this.findOr(expressionArray);
    }
    /**
     * findAnd() - oversee the operation of AND'ed query expressions.
     *    AND'ed expression evaluation runs each expression progressively against the full collection,
     *    internally utilizing existing chained resultset functionality.
     *    Only the first filter can utilize a binary index.
     *
     * @param {array} expressionArray - array of expressions
     * @returns {Resultset} this resultset for further chain ops.
     */
    findAnd(expressionArray) {
        // we have already implementing method chaining in this (our Resultset class)
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
     * @returns {Resultset} this resultset for further chain ops.
     */
    find(query, firstOnly = false) {
        if (this.collection.data.length === 0) {
            this.filteredrows = [];
            this.filterInitialized = true;
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
                this.filteredrows = (this.collection.data.length > 0) ? [0] : [];
                this.filterInitialized = true;
            }
            return this;
        }
        // injecting $and and $or expression tree evaluation here.
        if (property === "$and" || property === "$or") {
            this[property](queryObjectOp);
            // for chained find with firstonly,
            if (firstOnly && this.filteredrows.length > 1) {
                this.filteredrows = this.filteredrows.slice(0, 1);
            }
            return this;
        }
        // see if query object is in shorthand mode (assuming eq operator)
        let operator;
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
        // if user is deep querying the object such as find('name.first': 'odin')
        const usingDotNotation = (property.indexOf(".") !== -1);
        // if an index exists for the property being queried against, use it
        // for now only enabling where it is the first filter applied and prop is indexed
        const doIndexCheck = !usingDotNotation && !this.filterInitialized;
        let searchByIndex = false;
        if (doIndexCheck && this.collection.binaryIndices[property] && indexedOps[operator]) {
            // this is where our lazy index rebuilding will take place
            // basically we will leave all indexes dirty until we need them
            // so here we will rebuild only the index tied to this property
            // ensureIndex() will only rebuild if flagged as dirty since we are not passing force=true param
            if (this.collection.adaptiveBinaryIndices !== true) {
                this.collection.ensureIndex(property);
            }
            searchByIndex = true;
        }
        // the comparison function
        const fun = LokiOps[operator];
        // "shortcut" for collection data
        const data = this.collection.data;
        // Query executed differently depending on :
        //    - whether the property being queried has an index defined
        //    - if chained, we handle first pass differently for initial filteredrows[] population
        //
        // For performance reasons, each case has its own if block to minimize in-loop calculations
        let result = [];
        // If the filteredrows[] is already initialized, use it
        if (this.filterInitialized) {
            let filter = this.filteredrows;
            // currently supporting dot notation for non-indexed conditions only
            if (usingDotNotation) {
                property = property.split(".");
                for (let i = 0; i < filter.length; i++) {
                    let rowIdx = filter[i];
                    if (dotSubScan(data[rowIdx], property, fun, value)) {
                        result.push(rowIdx);
                    }
                }
            }
            else if (property === "$fts") {
                this._scoring = this.collection._fullTextSearch.search(query["$fts"]);
                let keys = Object.keys(this._scoring);
                for (let i = 0; i < keys.length; i++) {
                    if (filter.includes(+keys[i])) {
                        result.push(+keys[i]);
                    }
                }
            }
            else if (this.collection.constraints.unique[property] !== undefined && operator == "$eq") {
                // Use unique constraint for search.
                let row = this.collection.constraints.unique[property].get(value);
                if (filter.includes(row)) {
                    result.push(row);
                }
            }
            else {
                for (let i = 0; i < filter.length; i++) {
                    let rowIdx = filter[i];
                    if (fun(data[rowIdx][property], value)) {
                        result.push(rowIdx);
                    }
                }
            }
            this.filteredrows = result;
            this.filterInitialized = true; // next time work against filteredrows[]
            return this;
        }
        this.filteredrows = result;
        this.filterInitialized = true; // next time work against filteredrows[]
        if (property === "$fts") {
            this._scoring = this.collection._fullTextSearch.search(query["$fts"]);
            let keys = Object.keys(this._scoring);
            for (let i = 0; i < keys.length; i++) {
                result.push(+keys[i]);
            }
            return this;
        }
        // Use unique constraint for search.
        if (this.collection.constraints.unique[property] !== undefined && operator == "$eq") {
            result.push(this.collection.constraints.unique[property].get(value));
            return this;
        }
        // first chained query so work against data[] but put results in filteredrows
        // if not searching by index
        if (!searchByIndex) {
            if (usingDotNotation) {
                property = property.split(".");
                for (let i = 0; i < data.length; i++) {
                    if (dotSubScan(data[i], property, fun, value)) {
                        result.push(i);
                        if (firstOnly) {
                            return this;
                        }
                    }
                }
            }
            else {
                for (let i = 0; i < data.length; i++) {
                    if (fun(data[i][property], value)) {
                        result.push(i);
                        if (firstOnly) {
                            return this;
                        }
                    }
                }
            }
            return this;
        }
        let index = this.collection.binaryIndices[property];
        if (operator !== "$in") {
            // search by index
            const segm = this.collection.calculateRange(operator, property, value);
            for (let i = segm[0]; i <= segm[1]; i++) {
                if (indexedOps[operator] !== true) {
                    // must be a function, implying 2nd phase filtering of results from calculateRange
                    if (indexedOps[operator](data[index.values[i]][property], value)) {
                        result.push(index.values[i]);
                        if (firstOnly) {
                            return this;
                        }
                    }
                }
                else {
                    result.push(index.values[i]);
                    if (firstOnly) {
                        return this;
                    }
                }
            }
        }
        else {
            const idxset = [];
            // query each value '$eq' operator and merge the segment results.
            for (let j = 0, len = value.length; j < len; j++) {
                const segm = this.collection.calculateRange("$eq", property, value[j]);
                for (let i = segm[0]; i <= segm[1]; i++) {
                    if (idxset[i] === undefined) {
                        idxset[i] = true;
                        result.push(index.values[i]);
                    }
                    if (firstOnly) {
                        return this;
                    }
                }
            }
        }
        return this;
    }
    /**
     * Used for filtering via a javascript filter function.
     *
     * @param {function} fun - A javascript function used for filtering current results by.
     * @returns {Resultset} this resultset for further chain ops.
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
        try {
            // If the filteredrows[] is already initialized, use it
            if (this.filterInitialized) {
                let j = this.filteredrows.length;
                while (j--) {
                    if (viewFunction(this.collection.data[this.filteredrows[j]]) === true) {
                        result.push(this.filteredrows[j]);
                    }
                }
                this.filteredrows = result;
                return this;
            }
            else {
                let k = this.collection.data.length;
                while (k--) {
                    if (viewFunction(this.collection.data[k]) === true) {
                        result.push(k);
                    }
                }
                this.filteredrows = result;
                this.filterInitialized = true;
                return this;
            }
        }
        catch (err) {
            throw err;
        }
    }
    /**
     * Returns the number of documents in the resultset.
     * @returns {number} The number of documents in the resultset.
     */
    count() {
        if (this.filterInitialized) {
            return this.filteredrows.length;
        }
        return this.collection.count();
    }
    /**
     * Terminates the chain and returns array of filtered documents
     * @param {object} options
     * @param {boolean} options.forceClones - Allows forcing the return of cloned objects even when
     *        the collection is not configured for clone object.
     * @param {string} options.forceCloneMethod - Allows overriding the default or collection specified cloning method.
     *        Possible values include 'parse-stringify', 'jquery-extend-deep', and 'shallow'
     * @param {boolean} options.removeMeta - Will force clones and strip $loki and meta properties from documents
     *
     * @returns {Array} Array of documents in the resultset
     */
    data(options = {}) {
        let forceClones;
        let forceCloneMethod;
        let removeMeta;
        ({
            forceClones,
            forceCloneMethod = this.collection.cloneMethod,
            removeMeta = false
        } = options);
        let result = [];
        let data = this.collection.data;
        let obj;
        let len;
        let i;
        let method;
        // if user opts to strip meta, then force clones and use 'shallow' if 'force' options are not present
        if (removeMeta && !forceClones) {
            forceClones = true;
            forceCloneMethod = __WEBPACK_IMPORTED_MODULE_1__clone__["a" /* CloneMethod */].SHALLOW;
        }
        // if collection has delta changes active, then force clones and use CloneMethod.DEEP for effective change tracking of nested objects
        if (!this.collection.disableDeltaChangesApi) {
            forceClones = true;
            forceCloneMethod = __WEBPACK_IMPORTED_MODULE_1__clone__["a" /* CloneMethod */].DEEP;
        }
        // if this has no filters applied, just return collection.data
        if (!this.filterInitialized) {
            if (this.filteredrows.length === 0) {
                // determine whether we need to clone objects or not
                if (this.collection.cloneObjects || forceClones) {
                    len = data.length;
                    method = forceCloneMethod;
                    for (i = 0; i < len; i++) {
                        obj = Object(__WEBPACK_IMPORTED_MODULE_1__clone__["b" /* clone */])(data[i], method);
                        if (removeMeta) {
                            delete obj.$loki;
                            delete obj.meta;
                        }
                        result.push(obj);
                    }
                    return result;
                }
                else {
                    return data.slice();
                }
            }
            else {
                // filteredrows must have been set manually, so use it
                this.filterInitialized = true;
            }
        }
        const fr = this.filteredrows;
        len = fr.length;
        if (this.collection.cloneObjects || forceClones) {
            method = forceCloneMethod;
            for (i = 0; i < len; i++) {
                obj = Object(__WEBPACK_IMPORTED_MODULE_1__clone__["b" /* clone */])(data[fr[i]], method);
                if (removeMeta) {
                    delete obj.$loki;
                    delete obj.meta;
                }
                result.push(obj);
            }
        }
        else {
            for (i = 0; i < len; i++) {
                result.push(data[fr[i]]);
            }
        }
        return result;
    }
    /**
     * Used to run an update operation on all documents currently in the resultset.
     *
     * @param {function} updateFunction - User supplied updateFunction(obj) will be executed for each document object.
     * @returns {Resultset} this resultset for further chain ops.
     */
    update(updateFunction) {
        // if this has no filters applied, we need to populate filteredrows first
        if (!this.filterInitialized && this.filteredrows.length === 0) {
            this.filteredrows = this.collection.prepareFullDocIndex();
        }
        const len = this.filteredrows.length;
        const rcd = this.collection.data;
        for (let idx = 0; idx < len; idx++) {
            // pass in each document object currently in resultset to user supplied updateFunction
            updateFunction(rcd[this.filteredrows[idx]]);
            // notify collection we have changed this object so it can update meta and allow DynamicViews to re-evaluate
            this.collection.update(rcd[this.filteredrows[idx]]);
        }
        return this;
    }
    /**
     * Removes all document objects which are currently in resultset from collection (as well as resultset)
     *
     * @returns {Resultset} this (empty) resultset for further chain ops.
     */
    remove() {
        // if this has no filters applied, we need to populate filteredrows first
        if (!this.filterInitialized && this.filteredrows.length === 0) {
            this.filteredrows = this.collection.prepareFullDocIndex();
        }
        this.collection.remove(this.data());
        this.filteredrows = [];
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
     * @param {Array|Resultset|Collection} joinData - Data array to join to.
     * @param {(string|function)} leftJoinKey - Property name in this result set to join on or a function to produce a value to join on
     * @param {(string|function)} rightJoinKey - Property name in the joinData to join on or a function to produce a value to join on
     * @param {function} [mapFun=] - a function that receives each matching pair and maps them into output objects - function(left,right){return joinedObject}
     * @param {object} [dataOptions=] - optional options to apply to data() calls for left and right sides
     * @param {boolean} dataOptions.removeMeta - allows removing meta before calling mapFun
     * @param {boolean} dataOptions.forceClones - forcing the return of cloned objects to your map object
     * @param {string} dataOptions.forceCloneMethod - Allows overriding the default or collection specified cloning method.
     * @returns {Resultset} A resultset with data in the format [{left: leftObj, right: rightObj}]
     */
    //eqJoin<T extends object>(joinData: T[] | Resultset<T>, leftJoinKey: string | ((obj: E) => string), rightJoinKey: string | ((obj: T) => string)): Resultset<{ left: E; right: T; }>;
    // eqJoin<T extends object, U extends object>(joinData: T[] | Resultset<T>, leftJoinKey: string | ((obj: E) => string), rightJoinKey: string | ((obj: T) => string), mapFun?: (a: E, b: T) => U, dataOptions?: Resultset.DataOptions): Resultset<U> {
    eqJoin(joinData, leftJoinKey, rightJoinKey, mapFun, dataOptions) {
        // eqJoin<T extends object, U extends object>(joinData: T[] | Resultset<T>, leftJoinKey: string | ((obj: E) => string), rightJoinKey: string | ((obj: T) => string), mapFun?: (a: E, b: T) => U, dataOptions?: Resultset.DataOptions): Resultset<U> {
        let leftData = [];
        let leftDataLength;
        let rightData = [];
        let rightDataLength;
        let key;
        let result = [];
        let leftKeyisFunction = typeof leftJoinKey === "function";
        let rightKeyisFunction = typeof rightJoinKey === "function";
        let joinMap = {};
        //get the left data
        leftData = this.data(dataOptions);
        leftDataLength = leftData.length;
        //get the right data
        if (joinData instanceof __WEBPACK_IMPORTED_MODULE_0__collection__["a" /* Collection */]) {
            rightData = joinData.chain().data(dataOptions);
        }
        else if (joinData instanceof Resultset) {
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
            key = rightKeyisFunction ? rightJoinKey(rightData[i]) : rightData[i][rightJoinKey];
            joinMap[key] = rightData[i];
        }
        if (!mapFun) {
            mapFun = (left, right) => ({
                left,
                right
            });
        }
        //Run map function over each object in the resultset
        for (let j = 0; j < leftDataLength; j++) {
            key = leftKeyisFunction ? leftJoinKey(leftData[j]) : leftData[j][leftJoinKey];
            result.push(mapFun(leftData[j], joinMap[key] || {}));
        }
        //return a new resultset with no filters
        this.collection = new __WEBPACK_IMPORTED_MODULE_0__collection__["a" /* Collection */]("joinData");
        this.collection.insert(result);
        this.filteredrows = [];
        this.filterInitialized = false;
        return this;
    }
    /**
     * Applies a map function into a new collection for further chaining.
     * @param {function} mapFun - javascript map function
     * @param {object} [dataOptions=] - options to data() before input to your map function
     * @param {boolean} dataOptions.removeMeta - allows removing meta before calling mapFun
     * @param {boolean} dataOptions.forceClones - forcing the return of cloned objects to your map object
     * @param {string} dataOptions.forceCloneMethod - Allows overriding the default or collection specified cloning method.
     */
    map(mapFun, dataOptions) {
        let data = this.data(dataOptions).map(mapFun);
        //return return a new resultset with no filters
        this.collection = new __WEBPACK_IMPORTED_MODULE_0__collection__["a" /* Collection */]("mappedData");
        this.collection.insert(data);
        this.filteredrows = [];
        this.filterInitialized = false;
        return this;
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Resultset;



/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = aeqHelper;
/* harmony export (immutable) */ __webpack_exports__["c"] = ltHelper;
/* harmony export (immutable) */ __webpack_exports__["b"] = gtHelper;
/* harmony export (immutable) */ __webpack_exports__["d"] = sortHelper;
/** Helper function for determining 'loki' abstract equality which is a little more abstract than ==
 *     aeqHelper(5, '5') === true
 *     aeqHelper(5.0, '5') === true
 *     aeqHelper(new Date("1/1/2011"), new Date("1/1/2011")) === true
 *     aeqHelper({a:1}, {z:4}) === true (all objects sorted equally)
 *     aeqHelper([1, 2, 3], [1, 3]) === false
 *     aeqHelper([1, 2, 3], [1, 2, 3]) === true
 *     aeqHelper(undefined, null) === true
 */
/**
 * @hidden
 * @param {ANY} prop1
 * @param {ANY} prop2
 * @returns {boolean}
 */
function aeqHelper(prop1, prop2) {
    let cv1;
    let cv2;
    let t1;
    let t2;
    if (prop1 === prop2)
        return true;
    // 'falsy' and Boolean handling
    if (!prop1 || !prop2 || prop1 === true || prop2 === true || prop1 !== prop1 || prop2 !== prop2) {
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
    cv1 = Number(prop1);
    cv2 = Number(prop2);
    // if one or both are 'number-like'...
    if (cv1 === cv1 || cv2 === cv2) {
        return (cv1 === cv2);
    }
    // not strict equal nor less than nor gt so must be mixed types, convert to string and use that to compare
    cv1 = prop1.toString();
    cv2 = prop2.toString();
    return (cv1 == cv2);
}
/** Helper function for determining 'less-than' conditions for ops, sorting, and binary indices.
 *     In the future we might want $lt and $gt ops to use their own functionality/helper.
 *     Since binary indices on a property might need to index [12, NaN, new Date(), Infinity], we
 *     need this function (as well as gtHelper) to always ensure one value is LT, GT, or EQ to another.
 * @hidden
 */
function ltHelper(prop1, prop2, equal) {
    let cv1;
    let cv2;
    let t1;
    let t2;
    // if one of the params is falsy or strictly true or not equal to itself
    // 0, 0.0, "", NaN, null, undefined, not defined, false, true
    if (!prop1 || !prop2 || prop1 === true || prop2 === true || prop1 !== prop1 || prop2 !== prop2) {
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
    cv1 = Number(prop1);
    cv2 = Number(prop2);
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
 * @param {ANY} prop1
 * @param {ANY} prop2
 * @param {boolean} equal
 * @returns {boolean}
 */
function gtHelper(prop1, prop2, equal) {
    let cv1;
    let cv2;
    let t1;
    let t2;
    // 'falsy' and Boolean handling
    if (!prop1 || !prop2 || prop1 === true || prop2 === true || prop1 !== prop1 || prop2 !== prop2) {
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
    cv1 = Number(prop1);
    cv2 = Number(prop2);
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
 * @hidden
 * @param {ANY} prop1
 * @param {ANY} prop2
 * @param {ANY} desc
 * @returns {number}
 */
function sortHelper(prop1, prop2, desc) {
    if (aeqHelper(prop1, prop2))
        return 0;
    if (ltHelper(prop1, prop2, false)) {
        return (desc) ? (1) : (-1);
    }
    if (gtHelper(prop1, prop2, false)) {
        return (desc) ? (-1) : (1);
    }
    // not lt, not gt so implied equality-- date compatible
    return 0;
}


/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__tokenizer__ = __webpack_require__(13);

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
    constructor(options = {}) {
        this._docCount = 0;
        this._docStore = {};
        this._totalFieldLength = 0;
        this._root = {};
        ({
            store: this._store = true,
            optimizeChanges: this._optimizeChanges = true,
            tokenizer: this._tokenizer = new __WEBPACK_IMPORTED_MODULE_0__tokenizer__["a" /* Tokenizer */]()
        } = options);
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
     * @param {string} field - the field to add
     * @param {number} docId - the doc id of the field
     */
    insert(field, docId) {
        if (this._docStore[docId] !== undefined) {
            throw Error("Field already added.");
        }
        this._docCount += 1;
        this._docStore[docId] = {};
        // Tokenize document field.
        const fieldTokens = this._tokenizer.tokenize(field);
        this._totalFieldLength += fieldTokens.length;
        const termRefs = [];
        this._docStore[docId] = { fieldLength: fieldTokens.length };
        if (this._optimizeChanges) {
            Object.defineProperties(this._docStore[docId], {
                termRefs: { enumerable: false, configurable: true, writable: true, value: termRefs }
            });
        }
        // Iterate over all unique field terms.
        for (const term of new Set(fieldTokens)) {
            if (term === "") {
                continue;
            }
            // Calculate term frequency.
            let tf = 0;
            for (let j = 0; j < fieldTokens.length; j++) {
                if (fieldTokens[j] === term) {
                    ++tf;
                }
            }
            // Add term to index tree.
            let branch = this._root;
            for (let i = 0; i < term.length; i++) {
                const c = term[i];
                if (branch[c] === undefined) {
                    const child = {};
                    if (this._optimizeChanges) {
                        Object.defineProperties(child, {
                            pa: { enumerable: false, configurable: true, writable: true, value: branch }
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
        const docStore = this._docStore[docId];
        // Remove document.
        delete this._docStore[docId];
        this._docCount -= 1;
        // Reduce total field length.
        this._totalFieldLength -= docStore.fieldLength;
        if (this._optimizeChanges) {
            // Iterate over all term references.
            // Remove docId from docs and decrement document frequency.
            const termRefs = docStore.termRefs;
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
                        const parent = index.pa;
                        // Delete parent reference for preventing memory leak (cycle reference).
                        delete index.pa;
                        // Iterate over all children.
                        keys = Object.keys(parent);
                        for (let k = 0; k < keys.length; k++) {
                            const key = keys[k];
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
        }
        else {
            // Iterate over the whole inverted index and remove the document.
            // Delete branch if not needed anymore.
            const recursive = (root) => {
                const keys = Object.keys(root);
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
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
        const termIndices = [];
        const keys = Object.keys(root);
        for (let i = 0; i < keys.length; i++) {
            if (keys[i].length === 1) {
                termIndices.push({ index: root[keys[i]], term: keys[i] });
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
        const termIndices = [];
        const stack = [root];
        const treeStack = [""];
        do {
            const root = stack.pop();
            const treeTerm = treeStack.pop();
            if (root.df !== undefined) {
                termIndices.push({ index: root, term: treeTerm });
            }
            const keys = Object.keys(root);
            for (let i = 0; i < keys.length; i++) {
                if (keys[i].length === 1) {
                    stack.push(root[keys[i]]);
                    treeStack.push(treeTerm + keys[i]);
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
    static fromJSONObject(serialized, funcTok = undefined) {
        const invIdx = new InvertedIndex({
            store: serialized._store,
            optimizeChanges: serialized._optimizeChanges,
            tokenizer: __WEBPACK_IMPORTED_MODULE_0__tokenizer__["a" /* Tokenizer */].fromJSONObject(serialized._tokenizer, funcTok)
        });
        if (invIdx._store) {
            invIdx._docCount = serialized._docCount;
            invIdx._docStore = serialized._docStore;
            invIdx._totalFieldLength = serialized._totalFieldLength;
            invIdx._root = serialized._root;
        }
        const regenerate = (index, parent) => {
            // Set parent.
            if (parent !== null) {
                Object.defineProperties(index, {
                    pa: { enumerable: false, configurable: true, writable: false, value: parent }
                });
            }
            // Iterate over all keys.
            const keys = Object.keys(index);
            for (let i = 0; i < keys.length; i++) {
                // Found term, save in document store.
                if (keys[i] === "dc") {
                    // Get documents of term.
                    const docIds = Object.keys(index.dc);
                    for (let j = 0; j < docIds.length; j++) {
                        // Get document store at specific document/field.
                        const ref = invIdx._docStore[docIds[j]];
                        if (ref.termRefs === undefined) {
                            Object.defineProperties(ref, {
                                termRefs: { enumerable: false, configurable: true, writable: true, value: [] }
                            });
                        }
                        // Set reference to term index.
                        ref.termRefs.push(index);
                    }
                }
                else if (keys[i].length === 1) {
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
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__loki__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__collection__ = __webpack_require__(1);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Loki", function() { return __WEBPACK_IMPORTED_MODULE_0__loki__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Collection", function() { return __WEBPACK_IMPORTED_MODULE_1__collection__["a"]; });



/* harmony default export */ __webpack_exports__["default"] = ({ Loki: __WEBPACK_IMPORTED_MODULE_0__loki__["a" /* Loki */] });


/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__event_emitter__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__collection__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__common_plugin__ = __webpack_require__(3);



function getENV() {
    if (global !== undefined && (global["android"] || global["NSObject"])) {
        return Loki.Environment.NATIVE_SCRIPT;
    }
    const isNode = global !== undefined && ({}).toString.call(global) === "[object global]";
    if (isNode) {
        if (global["window"]) {
            return Loki.Environment.NODE_JS; //node-webkit
        }
        else {
            return Loki.Environment.NODE_JS;
        }
    }
    const isBrowser = window !== undefined && ({}).toString.call(window) === "[object Window]";
    if (document !== undefined) {
        if (document.URL.indexOf("http://") === -1 && document.URL.indexOf("https://") === -1) {
            return Loki.Environment.CORDOVA;
        }
        return Loki.Environment.BROWSER;
    }
    if (!isBrowser) {
        throw SyntaxError("Unknown environment...");
    }
}
class Loki extends __WEBPACK_IMPORTED_MODULE_0__event_emitter__["a" /* LokiEventEmitter */] {
    /**
     * Constructs the main database class.
     * @param {string} filename - name of the file to be saved to
     * @param {object} [options={}] - options
     * @param {Loki.Environment} [options.env=auto] - overrides environment detection
     * @param {Loki.SerializationMethod} [options.serializationMethod=NORMAL] - the serialization method
     * @param {string} [options.destructureDelimiter="$<\n"] - string delimiter used for destructured serialization
     * @param {boolean} [options.verbose=false] - enable console output
     */
    constructor(filename = "loki.db", options = {}) {
        super();
        this.filename = filename;
        this._collections = [];
        ({
            serializationMethod: this._serializationMethod = Loki.SerializationMethod.NORMAL,
            destructureDelimiter: this._destructureDelimiter = "$<\n",
            verbose: this._verbose = false,
            env: this._env = getENV()
        } = options);
        // persist version of code which created the database to the database.
        // could use for upgrade scenarios
        this.databaseVersion = 1.5;
        this.engineVersion = 1.5;
        // autosave support (disabled by default)
        this._autosave = false;
        this._autosaveInterval = 5000;
        this._autosaveHandle = null;
        this._throttledSaves = true;
        // currently keeping persistenceMethod and persistenceAdapter as loki level properties that
        // will not or cannot be deserialized  You are required to configure persistence every time
        // you instantiate a loki object (or use default environment detection) in order to load the database anyways.
        // persistenceMethod could be 'fs', 'localStorage', or 'adapter'
        // this is optional option param, otherwise environment detection will be used
        // if user passes their own adapter we will force this method to 'adapter' later, so no need to pass method option.
        this._persistenceMethod = null;
        // retain reference to optional (non-serializable) persistenceAdapter 'instance'
        this._persistenceAdapter = null;
        // flags used to throttle saves
        this._throttledSaveRunning = null;
        this._throttledSavePending = null;
        this.events = {
            "init": [],
            "loaded": [],
            "flushChanges": [],
            "close": [],
            "changes": [],
            "warning": []
        };
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
        ({
            autosave: this._autosave = false,
            autosaveInterval: this._autosaveInterval = 5000,
            persistenceMethod: this._persistenceMethod,
            // TODO
            //inflate: this.options.inflate,
            throttledSaves: this._throttledSaves = true,
        } = options);
        const DEFAULT_PERSISTENCE = {
            [Loki.Environment.NODE_JS]: [Loki.PersistenceMethod.FS_STORAGE],
            [Loki.Environment.BROWSER]: [Loki.PersistenceMethod.LOCAL_STORAGE, Loki.PersistenceMethod.INDEXED_STORAGE],
            [Loki.Environment.CORDOVA]: [Loki.PersistenceMethod.LOCAL_STORAGE, Loki.PersistenceMethod.INDEXED_STORAGE],
            [Loki.Environment.MEMORY]: [Loki.PersistenceMethod.MEMORY_STORAGE]
        };
        const PERSISTENCE_METHODS = {
            [Loki.PersistenceMethod.FS_STORAGE]: __WEBPACK_IMPORTED_MODULE_2__common_plugin__["a" /* PLUGINS */]["LokiFSStorage"],
            [Loki.PersistenceMethod.LOCAL_STORAGE]: __WEBPACK_IMPORTED_MODULE_2__common_plugin__["a" /* PLUGINS */]["LokiLocalStorage"],
            [Loki.PersistenceMethod.INDEXED_STORAGE]: __WEBPACK_IMPORTED_MODULE_2__common_plugin__["a" /* PLUGINS */]["LokiIndexedStorage"],
            [Loki.PersistenceMethod.MEMORY_STORAGE]: __WEBPACK_IMPORTED_MODULE_2__common_plugin__["a" /* PLUGINS */]["LokiMemoryStorage"]
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
            this._persistenceMethod = Loki.PersistenceMethod.ADAPTER;
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
        this.autosaveDisable();
        // if they want to load database on loki instantiation, now is a good time to load... after adapter set and before possible autosave initiation
        let loaded;
        if (options.autoload) {
            loaded = this.loadDatabase(options.inflate);
        }
        else {
            loaded = Promise.resolve();
        }
        return loaded.then(() => {
            if (this._autosave) {
                this.autosaveEnable();
            }
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
            databaseCopy._autosaveHandle = null;
            databaseCopy._persistenceAdapter = null;
            for (let idx = 0; idx < databaseCopy._collections.length; idx++) {
                databaseCopy._collections[idx].constraints = null;
                databaseCopy._collections[idx].ttl = null;
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
     * @param {boolean} [options.disableChangesApi=true] - set to false to enable Changes Api
     * @param {boolean} [options.clone=false] - specify whether inserts and queries clone to/from user
     * @param {string} [options.cloneMethod=CloneMethod.DEEP] - the clone method
     * @param {int} options.ttlInterval - time interval for clearing out 'aged' documents; not set by default.
     * @returns {Collection} a reference to the collection which was just added
     */
    addCollection(name, options = {}) {
        const collection = new __WEBPACK_IMPORTED_MODULE_1__collection__["a" /* Collection */](name, options);
        this._collections.push(collection);
        if (this._verbose) {
            collection.console = console;
        }
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
     * @param {string} collectionName - name of collection to look up
     * @returns {Collection} Reference to collection in database by that name, or null if not found
     */
    getCollection(collectionName) {
        let i;
        const len = this._collections.length;
        for (i = 0; i < len; i += 1) {
            if (this._collections[i].name === collectionName) {
                return this._collections[i];
            }
        }
        // no such collection
        this.emit("warning", "collection " + collectionName + " not found");
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
                count: this._collections[i].data.length
            });
        }
        return colls;
    }
    /**
     * Removes a collection from the database.
     * @param {string} collectionName - name of collection to remove
     */
    removeCollection(collectionName) {
        for (let i = 0; i < this._collections.length; i += 1) {
            if (this._collections[i].name === collectionName) {
                const tmpcol = new __WEBPACK_IMPORTED_MODULE_1__collection__["a" /* Collection */](collectionName, {});
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
    getName() {
        return this.filename;
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
            case Loki.SerializationMethod.NORMAL:
                return JSON.stringify(this);
            case Loki.SerializationMethod.PRETTY:
                return JSON.stringify(this, null, 2);
            case Loki.SerializationMethod.DESTRUCTURED:
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
            _throttledSaves: this._throttledSaves,
            _verbose: this._verbose,
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
            dbcopy._collections[idx].data = [];
        }
        // if we -only- wanted the db container portion, return it now
        if (options.partitioned === true && options.partition === -1) {
            // since we are deconstructing, override serializationMethod to normal for here
            return dbcopy.serialize({
                serializationMethod: Loki.SerializationMethod.NORMAL
            });
        }
        // at this point we must be deconstructing the entire database
        // start by pushing db serialization into first array element
        const reconstruct = [];
        reconstruct.push(dbcopy.serialize({
            serializationMethod: Loki.SerializationMethod.NORMAL
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
        let doccount;
        let docidx;
        let resultlines = [];
        if (options.delimited === undefined) {
            options.delimited = true;
        }
        if (options.collectionIndex === undefined) {
            throw new Error("serializeCollection called without 'collectionIndex' option");
        }
        doccount = this._collections[options.collectionIndex].data.length;
        resultlines = [];
        for (docidx = 0; docidx < doccount; docidx++) {
            resultlines.push(JSON.stringify(this._collections[options.collectionIndex].data[docidx]));
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
        let workarray = [];
        let len;
        let cdb;
        let collIndex = 0;
        let collCount;
        let lineIndex = 1;
        let done = false;
        let currObject;
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
                    cdb = JSON.parse(destructuredSource[0]);
                    return cdb;
                }
                // single collection, return doc array
                return this.deserializeCollection(destructuredSource[options.partition + 1], options);
            }
            // Otherwise we are restoring an entire partitioned db
            cdb = JSON.parse(destructuredSource[0]);
            collCount = cdb._collections.length;
            for (collIndex = 0; collIndex < collCount; collIndex++) {
                // attach each collection docarray to container collection data, add 1 to collection array index since db is at 0
                cdb._collections[collIndex].data = this.deserializeCollection(destructuredSource[collIndex + 1], options);
            }
            return cdb;
        }
        // Non-Partitioned
        // D : one big Delimited string { partitioned: false, delimited : true }
        // NDA : Non-Delimited Array : one iterable array with empty string collection partitions { partitioned: false, delimited: false }
        // D
        if (options.delimited) {
            workarray = destructuredSource.split(options.delimiter);
            destructuredSource = null; // lower memory pressure
            len = workarray.length;
            if (len === 0) {
                return null;
            }
        }
        else {
            workarray = destructuredSource;
        }
        // first line is database and collection shells
        cdb = JSON.parse(workarray[0]);
        collCount = cdb._collections.length;
        workarray[0] = null;
        while (!done) {
            // empty string indicates either end of collection or end of file
            if (workarray[lineIndex] === "") {
                // if no more collections to load into, we are done
                if (++collIndex > collCount) {
                    done = true;
                }
            }
            else {
                currObject = JSON.parse(workarray[lineIndex]);
                cdb._collections[collIndex].data.push(currObject);
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
                case Loki.SerializationMethod.NORMAL:
                case Loki.SerializationMethod.PRETTY:
                    dbObject = JSON.parse(serializedDb);
                    break;
                case Loki.SerializationMethod.DESTRUCTURED:
                    dbObject = this.deserializeDestructured(serializedDb);
                    break;
                default:
                    dbObject = JSON.parse(serializedDb);
                    break;
            }
        }
        this.loadJSONObject(dbObject, options);
    }
    /**
     * Inflates a loki database from a JS object
     *
     * @param {object} dbObject - a serialized loki database string
     * @param {object} options - apply or override collection level settings
     * @param {boolean} options.retainDirtyFlags - whether collection dirty flags will be preserved
     */
    loadJSONObject(dbObject, options = {}) {
        const len = dbObject._collections ? dbObject._collections.length : 0;
        this.filename = dbObject.filename;
        this._collections = [];
        for (let i = 0; i < len; ++i) {
            this._collections.push(__WEBPACK_IMPORTED_MODULE_1__collection__["a" /* Collection */].fromJSONObject(dbObject._collections[i], options));
        }
    }
    /**
     * Emits the close event. In autosave scenarios, if the database is dirty, this will save and disable timer.
     * Does not actually destroy the db.
     *
     * @returns {Promise} a Promise that resolves after closing the database succeeded
     */
    close() {
        let saved;
        // for autosave scenarios, we will let close perform final save (if dirty)
        // For web use, you might call from window.onbeforeunload to shutdown database, saving pending changes
        if (this._autosave) {
            this.autosaveDisable();
            // Check if collections are dirty.
            for (let idx = 0; idx < this._collections.length; idx++) {
                if (this._collections[idx].dirty) {
                    saved = this.saveDatabase();
                    break;
                }
            }
        }
        return Promise.resolve(saved).then(() => {
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
            else {
                return Promise.resolve(this._throttledSaveRunning);
            }
        }
        else {
            return Promise.resolve();
        }
    }
    /**
     * Internal load logic, decoupled from throttling/contention logic
     *
     * @param {object} options - an object containing inflation options for each collection
     * @returns {Promise} a Promise that resolves after the database is loaded
     */
    _loadDatabase(options = {}) {
        // the persistenceAdapter should be present if all is ok, but check to be sure.
        if (this._persistenceAdapter === null) {
            return Promise.reject(new Error("persistenceAdapter not configured"));
        }
        return Promise.resolve(this._persistenceAdapter.loadDatabase(this.filename))
            .then((dbString) => {
            if (typeof (dbString) === "string") {
                this.loadJSON(dbString, options);
                this.emit("load", this);
            }
            else {
                dbString = dbString;
                // if adapter has returned an js object (other than null or error) attempt to load from JSON object
                if (typeof (dbString) === "object" && dbString !== null && !(dbString instanceof Error)) {
                    this.loadJSONObject(dbString, options);
                    this.emit("load", this);
                }
                else {
                    if (dbString instanceof Error)
                        throw dbString;
                    throw new TypeError("The persistence adapter did not load a serialized DB string or object.");
                }
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
        let saved;
        // check if the adapter is requesting (and supports) a 'reference' mode export
        if (this._persistenceAdapter.mode === "reference" && typeof this._persistenceAdapter.exportDatabase === "function") {
            // filename may seem redundant but loadDatabase will need to expect this same filename
            saved = this._persistenceAdapter.exportDatabase(this.filename, this.copy({ removeNonSerializable: true }));
        }
        else {
            saved = this._persistenceAdapter.saveDatabase(this.filename, this.serialize());
        }
        return Promise.resolve(saved).then(() => {
            // Set all collection not dirty.
            for (let idx = 0; idx < this._collections.length; idx++) {
                this._collections[idx].dirty = false;
            }
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
    /**
     * Starts periodically saves to the underlying storage adapter.
     */
    autosaveEnable() {
        if (this._autosaveHandle) {
            return;
        }
        let running = true;
        this._autosave = true;
        this._autosaveHandle = () => {
            running = false;
            this._autosaveHandle = undefined;
        };
        setTimeout(() => {
            if (running) {
                this.saveDatabase().then(this.saveDatabase, this.saveDatabase);
            }
        }, this._autosaveInterval);
    }
    /**
     * Stops the autosave interval timer.
     */
    autosaveDisable() {
        this._autosave = false;
        if (this._autosaveHandle) {
            this._autosaveHandle();
        }
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Loki;

(function (Loki) {
    let SerializationMethod;
    (function (SerializationMethod) {
        SerializationMethod[SerializationMethod["NORMAL"] = 0] = "NORMAL";
        SerializationMethod[SerializationMethod["PRETTY"] = 1] = "PRETTY";
        SerializationMethod[SerializationMethod["DESTRUCTURED"] = 2] = "DESTRUCTURED";
    })(SerializationMethod = Loki.SerializationMethod || (Loki.SerializationMethod = {}));
    let PersistenceMethod;
    (function (PersistenceMethod) {
        PersistenceMethod[PersistenceMethod["FS_STORAGE"] = 0] = "FS_STORAGE";
        PersistenceMethod[PersistenceMethod["LOCAL_STORAGE"] = 1] = "LOCAL_STORAGE";
        PersistenceMethod[PersistenceMethod["INDEXED_STORAGE"] = 2] = "INDEXED_STORAGE";
        PersistenceMethod[PersistenceMethod["MEMORY_STORAGE"] = 3] = "MEMORY_STORAGE";
        PersistenceMethod[PersistenceMethod["ADAPTER"] = 4] = "ADAPTER";
    })(PersistenceMethod = Loki.PersistenceMethod || (Loki.PersistenceMethod = {}));
    let Environment;
    (function (Environment) {
        Environment[Environment["NODE_JS"] = 0] = "NODE_JS";
        Environment[Environment["NATIVE_SCRIPT"] = 1] = "NATIVE_SCRIPT";
        Environment[Environment["BROWSER"] = 2] = "BROWSER";
        Environment[Environment["CORDOVA"] = 3] = "CORDOVA";
        Environment[Environment["MEMORY"] = 4] = "MEMORY";
    })(Environment = Loki.Environment || (Loki.Environment = {}));
})(Loki || (Loki = {}));

/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(4)))

/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class UniqueIndex {
    /**
     * Constructs an unique index object.
     * @param {number|string} propertyField - the property field to index
     */
    constructor(propertyField) {
        this._field = propertyField;
        this._keyMap = {};
    }
    /**
     * Sets a document's unique index.
     * @param {Doc} doc - the document
     * @param {number} row - the data row of the document
     */
    set(doc, row) {
        const fieldValue = doc[this._field];
        if (fieldValue !== null && fieldValue !== undefined) {
            if (this._keyMap[fieldValue] !== undefined) {
                throw new Error("Duplicate key for property " + this._field + ": " + fieldValue);
            }
            else {
                this._keyMap[fieldValue] = row;
            }
        }
    }
    /**
     * Returns the data row of an unique index.
     * @param {number|string} index - the index
     * @returns {number | string} - the row
     */
    get(index) {
        return this._keyMap[index];
    }
    /**
     * Updates a document's unique index.
     * @param  {Object} doc - the document
     * @param  {number} row - the data row of the document
     */
    update(doc, row) {
        // Find and remove current keyMap for row.
        const uniqueNames = Object.keys(this._keyMap);
        for (let i = 0; i < uniqueNames.length; i++) {
            if (row === this._keyMap[uniqueNames[i]]) {
                delete this._keyMap[uniqueNames[i]];
                break;
            }
        }
        this.set(doc, row);
    }
    /**
     * Removes an unique index.
     * @param {number|string} index - the unique index
     */
    remove(index) {
        if (this._keyMap[index] !== undefined) {
            delete this._keyMap[index];
        }
        else {
            throw new Error("Key is not in unique index: " + this._field);
        }
    }
    /**
     * Clears all unique indexes.
     */
    clear() {
        this._keyMap = {};
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = UniqueIndex;



/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__event_emitter__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__resultset__ = __webpack_require__(5);


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
 */
class DynamicView extends __WEBPACK_IMPORTED_MODULE_0__event_emitter__["a" /* LokiEventEmitter */] {
    /**
     * Constructor.
     * @param {Collection} collection - a reference to the collection to work agains
     * @param {string} name - the name of this dynamic view
     * @param {object} options - the options
     * @param {boolean} [options.persistent=false] - indicates if view is to main internal results array in 'resultdata'
     * @param {string} [options.sortPriority=SortPriority.PASSIVE] - the sort priority
     * @param {number} [options.minRebuildInterval=1] - minimum rebuild interval (need clarification to docs here)
     */
    constructor(collection, name, options = {}) {
        super();
        ({
            persistent: this._persistent = false,
            sortPriority: this._sortPriority = DynamicView.SortPriority.PASSIVE,
            minRebuildInterval: this._minRebuildInterval = 1
        } = options);
        this._collection = collection;
        this.name = name;
        this._rebuildPending = false;
        // 'passive' will defer the sort phase until they call data(). (most efficient overall)
        // 'active' will sort async whenever next idle. (prioritizes read speeds)
        // sortPriority: this._sortPriority = DynamicView.SortPriority.PASSIVE,
        this._resultset = new __WEBPACK_IMPORTED_MODULE_1__resultset__["a" /* Resultset */](collection);
        this._resultdata = [];
        this._resultsdirty = false;
        this._cachedresultset = null;
        // keep ordered filter pipeline
        this._filterPipeline = [];
        // sorting member variables
        // we only support one active search, applied using applySort() or applySimpleSort()
        this._sortFunction = null;
        this._sortCriteria = null;
        this._sortByScoring = null;
        this._sortDirty = false;
        // for now just have 1 event for when we finally rebuilt lazy view
        // once we refactor transactions, i will tie in certain transactional events
        this.events = {
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
        let fpl;
        let fpi;
        let idx;
        this._resultdata = [];
        this._resultsdirty = true;
        this._resultset = new __WEBPACK_IMPORTED_MODULE_1__resultset__["a" /* Resultset */](this._collection);
        if (this._sortFunction || this._sortCriteria || this._sortByScoring !== null) {
            this._sortDirty = true;
        }
        if (removeWhereFilters) {
            // for each view see if it had any where filters applied... since they don't
            // serialize those functions lets remove those invalid filters
            fpl = this._filterPipeline.length;
            fpi = fpl;
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
        fpl = ofp.length;
        for (idx = 0; idx < fpl; idx++) {
            this.applyFind(ofp[idx].val);
        }
        // during creation of unit tests, i will remove this forced refresh and leave lazy
        this.data();
        // emit rebuild event in case user wants to be notified
        this.emit("rebuild", this);
        return this;
    }
    /**
     * Makes a copy of the internal resultset for branched queries.
     * Unlike this dynamic view, the branched resultset will not be 'live' updated,
     * so your branched query should be immediately resolved and not held for future evaluation.
     *
     * @param {(string|array=)} transform - Optional name of collection transform, or an array of transform steps
     * @param {object} parameters - optional parameters (if optional transform requires them)
     * @returns {Resultset} A copy of the internal resultset for branched queries.
     */
    branchResultset(transform, parameters) {
        const rs = this._resultset.branch();
        if (transform === undefined) {
            return rs;
        }
        return rs.transform(transform, parameters);
    }
    /**
     * toJSON() - Override of toJSON to avoid circular references
     *
     */
    toJSON() {
        return {
            name: this.name,
            _persistent: this._persistent,
            _sortPriority: this._sortPriority,
            _minRebuildInterval: this._minRebuildInterval,
            _resultset: this._resultset,
            _resultsdirty: true,
            _filterPipeline: this._filterPipeline,
            _sortCriteria: this._sortCriteria,
            _sortByScoring: this._sortByScoring,
            _sortDirty: this._sortDirty,
        };
    }
    static fromJSONObject(collection, obj) {
        let dv = new DynamicView(collection, obj.name, obj.options);
        dv._resultsdirty = obj._resultsdirty;
        dv._filterPipeline = obj._filterPipeline;
        dv._resultdata = [];
        dv._sortCriteria = obj._sortCriteria;
        dv._sortByScoring = obj._sortByScoring;
        dv._sortDirty = obj._sortDirty;
        dv._resultset.filteredrows = obj._resultset.filteredrows;
        dv._resultset.filterInitialized = obj._resultset.filterInitialized;
        dv._rematerialize({
            removeWhereFilters: true
        });
        return dv;
    }
    /**
     * Used to clear pipeline and reset dynamic view to initial state.
     *     Existing options should be retained.
     * @param {boolean} queueSortPhase - (default: false) if true we will async rebuild view (maybe set default to true in future?)
     */
    removeFilters({ queueSortPhase = false } = {}) {
        this._rebuildPending = false;
        this._resultset.reset();
        this._resultdata = [];
        this._resultsdirty = true;
        this._cachedresultset = null;
        // keep ordered filter pipeline
        this._filterPipeline = [];
        // sorting member variables
        // we only support one active search, applied using applySort() or applySimpleSort()
        this._sortFunction = null;
        this._sortCriteria = null;
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
     *
     * @param {function} comparefun - a javascript compare function used for sorting
     * @returns {DynamicView} this DynamicView object, for further chain ops.
     */
    applySort(comparefun) {
        this._sortFunction = comparefun;
        this._sortCriteria = null;
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
        this._sortByScoring = ascending;
        this._queueSortPhase();
        return this;
    }
    /**
     * Used to specify a property used for view translation.
     * @example
     * dv.applySimpleSort("name");
     *
     * @param {string} propname - Name of property by which to sort.
     * @param {boolean} isdesc - (Optional) If true, the sort will be in descending order.
     * @returns {DynamicView} this DynamicView object, for further chain ops.
     */
    applySimpleSort(propname, isdesc) {
        this._sortCriteria = [
            [propname, isdesc || false]
        ];
        this._sortFunction = null;
        this._sortByScoring = null;
        this._queueSortPhase();
        return this;
    }
    /**
     * Allows sorting a resultset based on multiple columns.
     * @example
     * // to sort by age and then name (both ascending)
     * dv.applySortCriteria(['age', 'name']);
     * // to sort by age (ascending) and then by name (descending)
     * dv.applySortCriteria(['age', ['name', true]);
     * // to sort by age (descending) and then by name (descending)
     * dv.applySortCriteria(['age', true], ['name', true]);
     *
     * @param {Array} criteria - array of property names or subarray of [propertyname, isdesc] used evaluate sort order
     * @returns {DynamicView} Reference to this DynamicView, sorted, for future chain operations.
     */
    applySortCriteria(criteria) {
        this._sortCriteria = criteria;
        this._sortFunction = null;
        this._sortByScoring = null;
        this._queueSortPhase();
        return this;
    }
    /**
     * Marks the beginning of a transaction.
     * @returns {DynamicView} this DynamicView object, for further chain ops.
     */
    startTransaction() {
        this._cachedresultset = this._resultset.copy();
        return this;
    }
    /**
     * Commits a transaction.
     * @returns {DynamicView} this DynamicView object, for further chain ops.
     */
    commit() {
        this._cachedresultset = null;
        return this;
    }
    /**
     * Rolls back a transaction.
     * @returns {DynamicView} this DynamicView object, for further chain ops.
     */
    rollback() {
        this._resultset = this._cachedresultset;
        if (this._persistent) {
            // for now just rebuild the persistent dynamic view data in this worst case scenario
            // (a persistent view utilizing transactions which get rolled back), we already know the filter so not too bad.
            this._resultdata = this._resultset.data();
            this.emit("rebuild", this);
        }
        return this;
    }
    /**
     * Find the index of a filter in the pipeline, by that filter's ID.
     *
     * @param {(string|number)} uid - The unique ID of the filter.
     * @returns {number}: index of the referenced filter in the pipeline; -1 if not found.
     */
    _indexOfFilterWithId(uid) {
        if (typeof uid === "string" || typeof uid === "number") {
            for (let idx = 0, len = this._filterPipeline.length; idx < len; idx += 1) {
                if (uid === this._filterPipeline[idx].uid) {
                    return idx;
                }
            }
        }
        return -1;
    }
    /**
     * Add the filter object to the end of view's filter pipeline and apply the filter to the resultset.
     *
     * @param {object} filter - The filter object. Refer to applyFilter() for extra details.
     */
    _addFilter(filter) {
        this._filterPipeline.push(filter);
        this._resultset[filter.type](filter.val);
    }
    /**
     * Reapply all the filters in the current pipeline.
     *
     * @returns {DynamicView} this DynamicView object, for further chain ops.
     */
    reapplyFilters() {
        this._resultset.reset();
        this._cachedresultset = null;
        if (this._persistent) {
            this._resultdata = [];
            this._resultsdirty = true;
        }
        const filters = this._filterPipeline;
        this._filterPipeline = [];
        for (let idx = 0, len = filters.length; idx < len; idx += 1) {
            this._addFilter(filters[idx]);
        }
        if (this._sortFunction || this._sortCriteria || this._sortByScoring !== null) {
            this._queueSortPhase();
        }
        else {
            this._queueRebuildEvent();
        }
        return this;
    }
    /**
     * Adds or updates a filter in the DynamicView filter pipeline
     *
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
        this._cachedresultset = null;
        if (this._persistent) {
            this._resultdata = [];
            this._resultsdirty = true;
        }
        this._addFilter(filter);
        if (this._sortFunction || this._sortCriteria || this._sortByScoring !== null) {
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
     * applyWhere() - Adds or updates a javascript filter function in the DynamicView filter pipeline
     *
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
     * removeFilter() - Remove the specified filter from the DynamicView filter pipeline
     *
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
        // recurring resultset data resolutions should know internally its already up to date.
        // for persistent data this will not update resultdata nor fire rebuild event.
        if (this._resultsdirty) {
            this._resultdata = this._resultset.data();
        }
        return this._resultset.count();
    }
    /**
     * Resolves and pending filtering and sorting, then returns document array as result.
     *
     * @param {object} options - optional parameters to pass to resultset.data() if non-persistent
     * @param {boolean} options.forceClones - Allows forcing the return of cloned objects even when
     *        the collection is not configured for clone object.
     * @param {string} options.forceCloneMethod - Allows overriding the default or collection specified cloning method.
     *        Possible values include 'parse-stringify', 'jquery-extend-deep', 'shallow', 'shallow-assign'
     * @param {boolean} options.removeMeta - Will force clones and strip $loki and meta properties from documents
     *
     * @returns {Array} An array of documents representing the current DynamicView contents.
     */
    data(options = {}) {
        // using final sort phase as 'catch all' for a few use cases which require full rebuild
        if (this._sortDirty || this._resultsdirty) {
            this._performSortPhase({
                suppressRebuildEvent: true
            });
        }
        return (this._persistent) ? (this._resultdata) : (this._resultset.data(options));
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
     *    (1) passive - when the user calls data(), or
     *    (2) active - once they stop updating and yield js thread control
     */
    _queueSortPhase() {
        // already queued? exit without queuing again
        if (this._sortDirty) {
            return;
        }
        this._sortDirty = true;
        if (this._sortPriority === DynamicView.SortPriority.ACTIVE) {
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
        if (!this._sortDirty && !this._resultsdirty) {
            return;
        }
        if (this._sortDirty) {
            if (this._sortFunction) {
                this._resultset.sort(this._sortFunction);
            }
            else if (this._sortCriteria) {
                this._resultset.compoundsort(this._sortCriteria);
            }
            else if (this._sortByScoring !== null) {
                this._resultset.sortByScoring(this._sortByScoring);
            }
            this._sortDirty = false;
        }
        if (this._persistent) {
            // persistent view, rebuild local resultdata array
            this._resultdata = this._resultset.data();
            this._resultsdirty = false;
        }
        if (!options.suppressRebuildEvent) {
            this.emit("rebuild", this);
        }
    }
    /**
     * (Re)evaluating document inclusion.
     *    Called by : collection.insert() and collection.update().
     *
     * @param {int} objIndex - index of document to (re)run through filter pipeline.
     * @param {boolean} isNew - true if the document was just added to the collection.
     */
    _evaluateDocument(objIndex, isNew) {
        // if no filter applied yet, the result 'set' should remain 'everything'
        if (!this._resultset.filterInitialized) {
            if (this._persistent) {
                this._resultdata = this._resultset.data();
            }
            // need to re-sort to sort new document
            if (this._sortFunction || this._sortCriteria) {
                this._queueSortPhase();
            }
            else {
                this._queueRebuildEvent();
            }
            return;
        }
        const ofr = this._resultset.filteredrows;
        const oldPos = (isNew) ? (-1) : (ofr.indexOf(+objIndex));
        const oldlen = ofr.length;
        // creating a 1-element resultset to run filter chain ops on to see if that doc passes filters;
        // mostly efficient algorithm, slight stack overhead price (this function is called on inserts and updates)
        const evalResultset = new __WEBPACK_IMPORTED_MODULE_1__resultset__["a" /* Resultset */](this._collection);
        evalResultset.filteredrows = [objIndex];
        evalResultset.filterInitialized = true;
        let filter;
        for (let idx = 0, len = this._filterPipeline.length; idx < len; idx++) {
            filter = this._filterPipeline[idx];
            evalResultset[filter.type](filter.val);
        }
        // not a true position, but -1 if not pass our filter(s), 0 if passed filter(s)
        const newPos = (evalResultset.filteredrows.length === 0) ? -1 : 0;
        // wasn't in old, shouldn't be now... do nothing
        if (oldPos === -1 && newPos === -1)
            return;
        // wasn't in resultset, should be now... add
        if (oldPos === -1 && newPos !== -1) {
            ofr.push(objIndex);
            if (this._persistent) {
                this._resultdata.push(this._collection.data[objIndex]);
            }
            // need to re-sort to sort new document
            if (this._sortFunction || this._sortCriteria) {
                this._queueSortPhase();
            }
            else {
                this._queueRebuildEvent();
            }
            return;
        }
        // was in resultset, shouldn't be now... delete
        if (oldPos !== -1 && newPos === -1) {
            if (oldPos < oldlen - 1) {
                ofr.splice(oldPos, 1);
                if (this._persistent) {
                    this._resultdata.splice(oldPos, 1);
                }
            }
            else {
                ofr.length = oldlen - 1;
                if (this._persistent) {
                    this._resultdata.length = oldlen - 1;
                }
            }
            // in case changes to data altered a sort column
            if (this._sortFunction || this._sortCriteria) {
                this._queueSortPhase();
            }
            else {
                this._queueRebuildEvent();
            }
            return;
        }
        // was in resultset, should still be now... (update persistent only?)
        if (oldPos !== -1 && newPos !== -1) {
            if (this._persistent) {
                // in case document changed, replace persistent view data with the latest collection.data document
                this._resultdata[oldPos] = this._collection.data[objIndex];
            }
            // in case changes to data altered a sort column
            if (this._sortFunction || this._sortCriteria) {
                this._queueSortPhase();
            }
            else {
                this._queueRebuildEvent();
            }
        }
    }
    /**
     * internal function called on collection.delete()
     */
    _removeDocument(objIndex) {
        // if no filter applied yet, the result 'set' should remain 'everything'
        if (!this._resultset.filterInitialized) {
            if (this._persistent) {
                this._resultdata = this._resultset.data();
            }
            // in case changes to data altered a sort column
            if (this._sortFunction || this._sortCriteria) {
                this._queueSortPhase();
            }
            else {
                this._queueRebuildEvent();
            }
            return;
        }
        const ofr = this._resultset.filteredrows;
        const oldPos = ofr.indexOf(+objIndex);
        let oldlen = ofr.length;
        let idx;
        if (oldPos !== -1) {
            // if not last row in resultdata, swap last to hole and truncate last row
            if (oldPos < oldlen - 1) {
                ofr[oldPos] = ofr[oldlen - 1];
                ofr.length = oldlen - 1;
                if (this._persistent) {
                    this._resultdata[oldPos] = this._resultdata[oldlen - 1];
                    this._resultdata.length = oldlen - 1;
                }
            }
            else {
                ofr.length = oldlen - 1;
                if (this._persistent) {
                    this._resultdata.length = oldlen - 1;
                }
            }
            // in case changes to data altered a sort column
            if (this._sortFunction || this._sortCriteria) {
                this._queueSortPhase();
            }
            else {
                this._queueRebuildEvent();
            }
        }
        // since we are using filteredrows to store data array positions
        // if they remove a document (whether in our view or not),
        // we need to adjust array positions -1 for all document array references after that position
        oldlen = ofr.length;
        for (idx = 0; idx < oldlen; idx++) {
            if (ofr[idx] > objIndex) {
                ofr[idx]--;
            }
        }
    }
    /**
     * Data transformation via user supplied functions
     *
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
/* harmony export (immutable) */ __webpack_exports__["a"] = DynamicView;

(function (DynamicView) {
    let SortPriority;
    (function (SortPriority) {
        SortPriority[SortPriority["PASSIVE"] = 0] = "PASSIVE";
        SortPriority[SortPriority["ACTIVE"] = 1] = "ACTIVE";
    })(SortPriority = DynamicView.SortPriority || (DynamicView.SortPriority = {}));
})(DynamicView || (DynamicView = {}));


/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__inverted_index__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__index_searcher__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__common_plugin__ = __webpack_require__(3);



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
    constructor(fields = [], id = "$loki") {
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
     * Registers the full text search as plugin.
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
        this.setDirty();
    }
    removeDocument(doc, id = doc[this._id]) {
        let fieldNames = Object.keys(this._invIdxs);
        for (let i = 0; i < fieldNames.length; i++) {
            this._invIdxs[fieldNames[i]].remove(id);
        }
        this._docs.delete(id);
        this.setDirty();
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
        let serialized = {};
        let fieldNames = Object.keys(this._invIdxs);
        for (let i = 0, fieldName; i < fieldNames.length, fieldName = fieldNames[i]; i++) {
            serialized[fieldName] = this._invIdxs[fieldName].toJSON();
        }
        return serialized;
    }
    static fromJSONObject(serialized, tokenizers = []) {
        let fts = new FullTextSearch();
        let fieldNames = Object.keys(serialized);
        for (let i = 0, fieldName; i < fieldNames.length, fieldName = fieldNames[i]; i++) {
            fts._invIdxs[fieldName] = __WEBPACK_IMPORTED_MODULE_0__inverted_index__["a" /* InvertedIndex */].fromJSONObject(serialized[fieldName], tokenizers[fieldName]);
        }
        return fts;
    }
    setDirty() {
        this._idxSearcher.setDirty();
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = FullTextSearch;

/* unused harmony default export */ var _unused_webpack_default_export = (FullTextSearch);


/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
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
    static fromJSONObject(serialized, funcTok = undefined) {
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
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__scorer__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__inverted_index__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__query_builder__ = __webpack_require__(16);



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
                        }
                        else if (msm < 0) {
                            msm = shouldLength - Math.floor(shouldLength * -msm);
                        }
                        else if (msm < 1) {
                            msm = Math.floor(shouldLength * msm);
                        }
                    }
                    // Remove all docs with fewer matches.
                    let docs = Object.keys(shouldDocs);
                    for (let i = 0, docId; i < docs.length, docId = docs[i]; i++) {
                        if (shouldDocs[docId].length >= msm) {
                            if (docResults[docId] !== undefined) {
                                docResults[docId].push(...shouldDocs[docId]);
                            }
                            else if (empty) {
                                docResults[docId] = shouldDocs[docId];
                            }
                            else {
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
                let f = fuzzySearch(query, root);
                for (let i = 0; i < f.length; i++) {
                    this._scorer.prepare(fieldName, boost * f[i].boost, f[i].index, doScoring, docResults, f[i].term);
                }
                break;
            }
            case "wildcard": {
                let w = wildcardSearch(query, root);
                for (let i = 0; i < w.length; i++) {
                    this._scorer.prepare(fieldName, boost, w[i].index, doScoring && enableScoring, docResults, w[i].term);
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
                    const termIdxs = __WEBPACK_IMPORTED_MODULE_1__inverted_index__["a" /* InvertedIndex */].extendTermIndex(termIdx);
                    for (let i = 0; i < termIdxs.length; i++) {
                        this._scorer.prepare(fieldName, boost, termIdxs[i].index, doScoring && enableScoring, docResults, query.value + termIdxs[i].term);
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
                }
                else {
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
                }
                else {
                    docResults[docId].push(...currDocs[docId]);
                }
            }
        }
        return docResults;
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = IndexSearcher;

/**
 * Calculates the levenshtein distance.
 * Copyright Kigiri: https://github.com/kigiri
 *           Milot Mirdita: https://github.com/milot-mirdita
 *           Toni Neubert:  https://github.com/Viatorus/
 * @param {string} a - a string
 * @param {string} b - a string
 */
function levenshteinDistance(a, b) {
    if (a.length === 0)
        return b.length;
    if (b.length === 0)
        return a.length;
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
            if (b[i - 1] === a[j - 1]) {
                val = row[j - 1];
            }
            else {
                val = Math.min(row[j - 1] + 1, // substitution
                Math.min(prev + 1, // insertion
                row[j] + 1)); // deletion
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
 * Performs a fuzzy search.
 * @param {ANY} query - the fuzzy query
 * @param {InvertedIndex.Index} root - the root index
 * @returns {Array}
 */
function fuzzySearch(query, root) {
    let value = query.value;
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
    // Todo: Include levenshtein to reduce similar iterations.
    // Tree tokens at same depth share same row until depth (should works if recursive).
    // Pregenerate tree token ?
    // var treeToken = Array(token.length + maxDistance);
    let start = root;
    let pre = value.slice(0, prefixLength);
    let fuzzy = value;
    if (prefixLength !== 0) {
        start = __WEBPACK_IMPORTED_MODULE_1__inverted_index__["a" /* InvertedIndex */].getTermIndex(pre, start);
        fuzzy = fuzzy.slice(prefixLength);
    }
    if (start === null) {
        return [];
    }
    if (fuzzy.length === 0) {
        // Return if prefixLength == value length.
        return [{ term: "", index: start, boost: 1 }];
    }
    /// Fuzziness of the fuzzy without extension.
    let extend_fuzzy = 1e10;
    let similarTokens = [];
    let stack = [start];
    let treeStack = [""];
    do {
        let index = stack.pop();
        let treeTerms = treeStack.pop();
        // Check if fuzzy should be extended.
        if (extended) {
            if (treeTerms.length === fuzzy.length) {
                extend_fuzzy = levenshteinDistance(fuzzy, treeTerms);
            }
            else {
                extend_fuzzy = extend_fuzzy <= fuzziness && treeTerms.length >= fuzzy.length
                    ? extend_fuzzy
                    : 1e10;
            }
        }
        // Compare tokens if they are in near distance.
        if (index.df !== undefined) {
            let matched = false;
            if (Math.abs(fuzzy.length - treeTerms.length) <= fuzziness) {
                const distance = levenshteinDistance(fuzzy, treeTerms);
                if (distance <= fuzziness) {
                    let term = pre + treeTerms;
                    // Calculate boost.
                    let boost = 1 - distance / Math.min(term.length, value.length);
                    similarTokens.push({ term, index: index, boost });
                    matched = true;
                }
            }
            // Only include extended terms that did not previously match.
            if (extend_fuzzy <= fuzziness && !matched) {
                let term = pre + treeTerms;
                // Calculate boost.
                let boost = 1 - (extend_fuzzy + treeTerms.length - fuzzy.length) / Math.min(term.length, value.length);
                similarTokens.push({ term: term, index: index, boost });
            }
        }
        // Iterate over all subtrees.
        // If token from tree is not longer than maximal distance.
        if ((treeTerms.length - fuzzy.length <= fuzziness) || extend_fuzzy <= fuzziness) {
            // Iterate over all subtrees.
            let keys = Object.keys(index);
            for (let i = 0; i < keys.length; i++) {
                if (keys[i].length === 1) {
                    stack.push(index[keys[i]]);
                    treeStack.push(treeTerms + keys[i]);
                }
            }
        }
    } while (stack.length !== 0);
    return similarTokens;
}
/**
 * Performs a wildcard search.
 * @param {ANY} query - the wildcard query
 * @param {InvertedIndex.Index} root - the root index
 * @returns {Array}
 */
function wildcardSearch(query, root) {
    let wildcard = query.value;
    let result = [];
    function recursive(index, idx = 0, term = "", escaped = false) {
        if (index === null) {
            return;
        }
        if (idx === wildcard.length) {
            if (index.df !== undefined) {
                result.push({ index: index, term });
            }
            return;
        }
        if (!escaped && wildcard[idx] === "\\") {
            recursive(index, idx + 1, term, true);
        }
        else if (!escaped && wildcard[idx] === "?") {
            let others = __WEBPACK_IMPORTED_MODULE_1__inverted_index__["a" /* InvertedIndex */].getNextTermIndex(index);
            for (let i = 0; i < others.length; i++) {
                recursive(others[i].index, idx + 1, term + others[i].term);
            }
        }
        else if (!escaped && wildcard[idx] === "*") {
            // Check if asterisk is last wildcard character
            if (idx + 1 === wildcard.length) {
                const all = __WEBPACK_IMPORTED_MODULE_1__inverted_index__["a" /* InvertedIndex */].extendTermIndex(index);
                for (let i = 0; i < all.length; i++) {
                    recursive(all[i].index, idx + 1, term + all[i].term);
                }
                return;
            }
            // Iterate over the whole tree.
            recursive(index, idx + 1, term);
            const indices = [{ index: index, term: "" }];
            do {
                const index = indices.pop();
                let others = __WEBPACK_IMPORTED_MODULE_1__inverted_index__["a" /* InvertedIndex */].getNextTermIndex(index.index);
                for (let i = 0; i < others.length; i++) {
                    recursive(others[i].index, idx + 1, term + index.term + others[i].term);
                    indices.push({ index: others[i].index, term: index.term + others[i].term });
                }
            } while (indices.length !== 0);
        }
        else {
            recursive(__WEBPACK_IMPORTED_MODULE_1__inverted_index__["a" /* InvertedIndex */].getTermIndex(wildcard[idx], index), idx + 1, term + wildcard[idx]);
        }
    }
    recursive(root);
    return result;
}


/***/ }),
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class Scorer {
    constructor(invIdxs) {
        this._cache = {};
        this._invIdxs = invIdxs;
    }
    setDirty() {
        this._cache = {};
    }
    prepare(fieldName, boost, termIdx, doScoring, docResults = {}, term = null) {
        if (termIdx === null || termIdx.dc === undefined) {
            return null;
        }
        const idf = this._idf(fieldName, termIdx.df);
        const docIds = Object.keys(termIdx.dc);
        for (let j = 0; j < docIds.length; j++) {
            const docId = docIds[j];
            if (docResults[docId] === undefined) {
                docResults[docId] = [];
            }
            if (doScoring) {
                const tf = termIdx.dc[docId];
                docResults[docId].push({ type: "BM25", tf, idf, boost, fieldName, term });
            }
            else {
                docResults[docId] = [{ type: "constant", value: 1, boost, fieldName }];
            }
        }
        return docResults;
    }
    scoreConstant(boost, docId, docResults = {}) {
        if (docResults[docId] === undefined) {
            docResults[docId] = [];
        }
        docResults[docId].push({ type: "constant", value: 1, boost });
        return docResults;
    }
    finalScore(query, docResults = {}) {
        const result = {};
        const k1 = query.scoring.k1;
        const b = query.scoring.b;
        const docs = Object.keys(docResults);
        for (let i = 0, docId; i < docs.length, docId = docs[i]; i++) {
            let docScore = 0;
            for (let j = 0; j < docResults[docId].length; j++) {
                const docResult = docResults[docId][j];
                let res = 0;
                switch (docResult.type) {
                    case "BM25": {
                        const tf = docResult.tf;
                        const fieldLength = Scorer._calculateFieldLength(this._invIdxs[docResult.fieldName].documentStore[docId]
                            .fieldLength);
                        const avgFieldLength = this._avgFieldLength(docResult.fieldName);
                        const tfNorm = (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (fieldLength / avgFieldLength)));
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
                        // console.log(
                        //  "Constant: " + res,
                        //  "\n\tboost: " + docResult.boost,
                        //  "\n\tvalue : " + docResult.value);
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
/* 16 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
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
 * @example
 * new QueryBuilder()
 *   .wildcard("question", "e?nst*n\?")
 * .build();
 * // The resulting documents:
 * // contains the wildcard surname e?nst*n\? (like Einstein? or Eynsteyn? but not Einsteine or Ensten?)
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
 * given edit distance.
 * ([Damerau–Levenshtein distance]{@link https://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance}).
 *
 * The edit distance is the minimum number of an insertion, deletion or substitution of a single character
 * or a transposition of two adjacent characters.
 *
 * * To set the maximal allowed edit distance, use {@link FuzzyQuery#fuzziness} (default is AUTO).
 * * To set the initial word length, which should ignored for fuzziness, use {@link FuzzyQuery#prefixLength}.
 * * To include longer document field terms than the fuzzy term and edit distance together, use
 *   {@link FuzzyQuery#extended}.
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
    /**
     * This flag allows longer document field terms than the actual fuzzy.
     * @param {boolean} extended - flag to enable or disable extended search
     * @return {FuzzyQuery}
     */
    extended(extended) {
        this._data.extended = extended;
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
     * This flag enables scoring for prefix results, similar to {@link TermQuery}.
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
 * To enable a [fuzzy query]{@link FuzzyQuery} for the tokens, use {@link MatchQuery#fuzziness},
 * {@link MatchQuery#prefixLength} and {@link MatchQuery#extended}
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
    /**
     * This flag allows longer document field terms than the actual fuzzy.
     * @param {boolean} extended - flag to enable or disable extended search
     * @return {MatchQuery}
     */
    extended(extended) {
        this._data.extended = extended;
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
 */
class ArrayQuery extends BaseQuery {
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
/* unused harmony export ArrayQuery */

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
//# sourceMappingURL=lokijs.loki.js.map