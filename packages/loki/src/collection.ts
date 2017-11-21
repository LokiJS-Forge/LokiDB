import {LokiEventEmitter} from "./event_emitter";
import {UniqueIndex} from "./unique_index";
import {ExactIndex} from "./exact_index";
import {Resultset} from "./resultset";
import {DynamicView} from "./dynamic_view";
import {clone, CloneMethod} from "./clone";
import {ltHelper, gtHelper, aeqHelper} from "./helper";
import {Loki} from "./loki";
import {copyProperties} from "./utils";
import {Doc, Dict, Query} from "./types";
import {FullTextSearch} from "../../full-text-search/src/full_text_search";

/*
 'isDeepProperty' is not defined              no-undef
 'deepProperty' is not defined                no-undef
 'average' is not defined                     no-undef
 'standardDeviation' is not defined           no-undef
 'sub' is not defined                         no-undef

 byExample?
 indexing -> own class?
 remove data only?
 */

export type ANY = any;
export {CloneMethod} from "./clone";

/**
 * General utils, including statistical functions
 */
function isDeepProperty(field: string) {
  return field.indexOf(".") !== -1;
}

function average(array: number[]) {
  return (array.reduce((a, b) => a + b, 0)) / array.length;
}

function standardDeviation(values: number[]) {
  const avg = average(values);
  const squareDiffs = values.map((value) => {
    const diff = value - avg;
    return diff * diff;
  });

  const avgSquareDiff = average(squareDiffs);
  return Math.sqrt(avgSquareDiff);
}

function deepProperty(obj: object, property: string, isDeep: boolean) {
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
export class Collection<E extends object = object> extends LokiEventEmitter {

  public name: string;
  // the data held by the collection
  public data: Doc<E>[];
  private idIndex: number[]; // index of id
  public binaryIndices: Dict<Collection.BinaryIndex>; // user defined indexes
  public constraints = {
    unique: {},
    exact: {}
  };

  /**
   * Unique contraints contain duplicate object references, so they are not persisted.
   * We will keep track of properties which have unique contraint applied here, and regenerate on load.
   */
  private uniqueNames: string[];

  /**
   * Transforms will be used to store frequently used query chains as a series of steps which itself can be stored along
   * with the database.
   */
  public transforms: {};

  /**
   * In autosave scenarios we will use collection level dirty flags to determine whether save is needed.
   * currently, if any collection is dirty we will autosave the whole database if autosave is configured.
   * Defaulting to true since this is called from addCollection and adding a collection should trigger save.
   */
  public dirty: boolean;

  private cachedIndex: ANY;
  private cachedBinaryIndex: ANY;
  private cachedData: ANY;

  /**
   * If set to true we will optimally keep indices 'fresh' during insert/update/remove ops (never dirty/never needs rebuild).
   * If you frequently intersperse insert/update/remove ops between find ops this will likely be significantly faster option.
   */
  public adaptiveBinaryIndices: boolean;

  /**
   * Is collection transactional.
   */
  private transactional: boolean;


  /**
   * Options to clone objects when inserting them.
   */
  public cloneObjects: boolean;

  /**
   * Default clone method (if enabled) is parse-stringify.
   */
  public cloneMethod: CloneMethod;


  /**
   * Disable track changes.
   */
  private disableChangesApi: boolean;

  /**
   * Disable delta update object style on changes.
   */
  public disableDeltaChangesApi: ANY;

  /**
   * By default, if you insert a document into a collection with binary indices, if those indexed properties contain
   * a DateTime we will convert to epoch time format so that (across serializations) its value position will be the
   * same 'after' serialization as it was 'before'.
   */
  private serializableIndices: boolean;

  /**
   * Option to activate a cleaner daemon - clears "aged" documents at set intervals.
   */
  public ttl: ANY;

  private maxId: number;
  private _dynamicViews: DynamicView<E>[];

  /**
   * Changes are tracked by collection and aggregated by the db.
   */
  private changes: Collection.Change[];

  /* assign correct handler based on ChangesAPI flag */
  private insertHandler: ANY;
  private updateHandler: ANY;

  public console: ANY;
  private stages: object;
  private commitLog: ANY[];

  public _fullTextSearch: FullTextSearch;

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
   * @param {string} [options.cloneMethod='parse-stringify'] - 'parse-stringify', 'jquery-extend-deep', 'shallow'
   * @param {number} [options.transactional=false] - ?
   * @param {number} options.ttl - ?
   * @param {number} options.ttlInterval - time interval for clearing out 'aged' documents; not set by default.
   * @see {@link Loki#addCollection} for normal creation of collections
   */
  constructor(name: string, options: Collection.Options = {}) {
    super();
    // the name of the collection
    this.name = name;
    // the data held by the collection
    this.data = [];
    this.idIndex = []; // index of id
    this.binaryIndices = {}; // user defined indexes
    this.constraints = {
      unique: {},
      exact: {}
    };
    // .
    this.uniqueNames = [];

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
      options.unique.forEach((prop: string) => {
        this.uniqueNames.push(prop); // used to regenerate on subsequent database loads
        this.constraints.unique[prop] = new UniqueIndex(prop);
      });
    }

    if (options.exact !== undefined) {
      options.exact.forEach((prop: string) => {
        this.constraints.exact[prop] = new ExactIndex(prop);
      });
    }

    // Full text search
    if (Loki["FullTextSearch"] !== undefined) {
       this._fullTextSearch = options.fullTextSearch !== undefined
         ? new (Loki["FullTextSearch"])(options.fullTextSearch) : null;
    } else {
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
    this.cloneMethod = options.cloneMethod !== undefined ? options.cloneMethod : CloneMethod.PARSE_STRINGIFY;
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
    this.on("insert", (obj: Doc<E>) => {
      this.insertHandler(obj);
    });

    this.on("update", (obj: Doc<E>, old: Doc<E>) => {
      this.updateHandler(obj, old);
    });

    this.on("delete", (obj: Doc<E>) => {
      if (!this.disableChangesApi) {
        this._createChange(this.name, "R", obj);
      }
    });

    this.on("warning", (warning: ANY) => {
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
      uniqueNames: this.uniqueNames,
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

  // TODO: Force rebuild?
  static fromJSONObject(obj: ANY, options?: Collection.DeserializeOptions) {
    let coll = new Collection(obj.name, {
      disableChangesApi: obj.disableChangesApi,
      disableDeltaChangesApi: obj.disableDeltaChangesApi
    });

    coll.adaptiveBinaryIndices = obj.adaptiveBinaryIndices !== undefined ? (obj.adaptiveBinaryIndices === true) : false;
    coll.transactional = obj.transactional;
    coll.asyncListeners = obj.asyncListeners;
    coll.disableChangesApi = obj.disableChangesApi;
    coll.cloneObjects = obj.cloneObjects;
    coll.cloneMethod = obj.cloneMethod || "parse-stringify";
    coll.changes = obj.changes;

    coll.dirty = (options && options.retainDirtyFlags === true) ? obj.dirty : false;

    function makeLoader(coll: ANY) {
      const collOptions = options[coll.name];

      if (collOptions.proto) {
        let inflater = collOptions.inflate || copyProperties;

        return (data: ANY) => {
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
    } else {
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
    coll.uniqueNames = [];
    if (obj.uniqueNames !== undefined) {
      coll.uniqueNames = obj.uniqueNames;
      for (j = 0; j < coll.uniqueNames.length; j++) {
        coll.ensureUniqueIndex(coll.uniqueNames[j]);
      }
    }

    // in case they are loading a database created before we added dynamic views, handle undefined
    if (obj._dynamicViews === undefined)
      return coll;

    // reinflate DynamicViews and attached Resultsets
    for (let idx = 0; idx < obj._dynamicViews.length; idx++) {
      coll._dynamicViews.push(DynamicView.fromJSONObject(coll, obj._dynamicViews[idx]));
    }

    if (obj._fullTextSearch) {
      coll._fullTextSearch = FullTextSearch.fromJSONObject(obj._fullTextSearch);
    }

    return coll;
  }

  /**
   * Adds a named collection transform to the collection
   * @param {string} name - name to associate with transform
   * @param {array} transform - an array of transformation 'step' objects to save into the collection
   */
  addTransform(name: string, transform: ANY[]) {
    if (this.transforms[name] !== undefined) {
      throw new Error("a transform by that name already exists");
    }

    this.transforms[name] = transform;
  }

  /**
   * Retrieves a named transform from the collection.
   * @param {string} name - name of the transform to lookup.
   */
  getTransform(name: string) {
    return this.transforms[name];
  }

  /**
   * Updates a named collection transform to the collection
   * @param {string} name - name to associate with transform
   * @param {object} transform - a transformation object to save into collection
   */
  setTransform(name: string, transform: ANY[]) {
    this.transforms[name] = transform;
  }

  /**
   * Removes a named collection transform from the collection
   * @param {string} name - name of collection transform to remove
   */
  removeTransform(name: string) {
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
      const toRemove = collection.chain().where((member: ANY) => {
        const timestamp = member.meta.updated || member.meta.created;
        const diff = now - timestamp;
        return age < diff;
      });
      toRemove.remove();
    };
  }

  private setTTL(age: number, interval: number) {
    if (age < 0) {
      clearInterval(this.ttl.daemon);
    } else {
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
  ensureIndex(property: string, force = false) {
    // optional parameter to force rebuild whether flagged as dirty or not
    if (property === null || property === undefined) {
      throw new Error("Attempting to set index without an associated property");
    }

    if (this.binaryIndices[property] && !force) {
      if (!this.binaryIndices[property].dirty) return;
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

    const wrappedComparer =
      (((prop, data) => (a: string, b: string) => {
        let val1, val2, arr;
        if (~prop.indexOf(".")) {
          arr = prop.split(".");
          val1 = arr.reduce(function (obj, i) {
            return obj && obj[i] || undefined;
          }, data[a]);
          val2 = arr.reduce(function (obj, i) {
            return obj && obj[i] || undefined;
          }, data[b]);
        } else {
          val1 = data[a][prop];
          val2 = data[b][prop];
        }

        if (val1 !== val2) {
          if (ltHelper(val1, val2, false)) return -1;
          if (gtHelper(val1, val2, false)) return 1;
        }
        return 0;
      }))(property, this.data);

    index.values.sort(wrappedComparer);
    index.dirty = false;

    this.dirty = true; // for autosave scenarios
  }

  getSequencedIndexValues(property: string) {
    let idx;
    const idxvals = this.binaryIndices[property].values;
    let result = "";

    for (idx = 0; idx < idxvals.length; idx++) {
      result += " [" + idx + "] " + this.data[idxvals[idx]][property];
    }

    return result;
  }

  ensureUniqueIndex(field: string) {
    let index = this.constraints.unique[field];
    if (!index) {
      // keep track of new unique index for regenerate after database (re)load.
      if (this.uniqueNames.indexOf(field) == -1) {
        this.uniqueNames.push(field);
      }
    }

    // if index already existed, (re)loading it will likely cause collisions, rebuild always
    this.constraints.unique[field] = index = new UniqueIndex(field);
    this.data.forEach((obj) => {
      index.set(obj);
    });
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

  flagBinaryIndexDirty(index: string) {
    if (this.binaryIndices[index])
      this.binaryIndices[index].dirty = true;
  }

  /**
   * Quickly determine number of documents in collection (or query)
   * @param {object} query - (optional) query object to count results of
   * @returns {number} number of documents in the collection
   */
  count(query?: object): number {
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
   * @param {string} [options.sortPriority='passive'] - 'passive' (sorts performed on call to data) or 'active' (after updates)
   * @param {number} options.minRebuildInterval - minimum rebuild interval (need clarification to docs here)
   * @returns {DynamicView} reference to the dynamic view added
   **/
  addDynamicView(name: string, options?: DynamicView.Options): DynamicView<E> {
    const dv = new DynamicView<E>(this, name, options);
    this._dynamicViews.push(dv);

    return dv;
  }

  /**
   * Remove a dynamic view from the collection
   * @param {string} name - name of dynamic view to remove
   **/
  removeDynamicView(name: string) {
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
  getDynamicView(name: string) {
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
  findAndUpdate(filterObject: Query | ((obj: E) => boolean), updateFunction: (obj: E) => E) {
    if (typeof(filterObject) === "function") {
      this.updateWhere(filterObject, updateFunction);
    } else {
      this.chain().find(filterObject).update(updateFunction);
    }
  }

  /**
   * Applies a 'mongo-like' find query object removes all documents which match that filter.
   *
   * @param {object} filterObject - 'mongo-like' query object
   */
  findAndRemove(filterObject: object) {
    this.chain().find(filterObject).remove();
  }

  /**
   * Adds object(s) to collection, ensure object(s) have meta properties, clone it if necessary, etc.
   * @param {(object|array)} doc - the document (or array of documents) to be inserted
   * @returns {(object|array)} document or documents inserted
   */
  insert(doc: E | E[]): Doc<E>;
  insert(doc: E[]): Doc<E>[];
  insert(doc: E | E[]) {
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
    results = this.cloneObjects ? clone(results, this.cloneMethod) : results;

    return results.length === 1 ? results[0] : results;
  }

  /**
   * Adds a single object, ensures it has meta properties, clone it if necessary, etc.
   * @param {object} doc - the document to be inserted
   * @param {boolean} bulkInsert - quiet pre-insert and insert event emits
   * @returns {object} document or 'undefined' if there was a problem inserting it
   */
  insertOne(doc: E, bulkInsert = false): Doc<E> {
    let err = null;
    let returnObj;

    if (typeof doc !== "object") {
      err = new TypeError("Document needs to be an object");
    } else if (doc === null) {
      err = new TypeError("Object cannot be null");
    }

    if (err !== null) {
      this.emit("error", err);
      throw err;
    }

    // if configured to clone, do so now... otherwise just use same obj reference
    const obj = this.cloneObjects ? clone(doc, this.cloneMethod) : doc;

    if ((<any>obj).meta === undefined) {
      (<any>obj).meta = {
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
      returnObj = this.cloneObjects ? clone(obj, this.cloneMethod) : obj;
    }

    return returnObj as Doc<E>;
  }

  /**
   * Empties the collection.
   * @param {object} options - configure clear behavior
   * @param {boolean} options.removeIndices - (default: false)
   */
  clear(options: ANY = {}) {
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
        exact: {}
      };
      this.uniqueNames = [];
    }
    // clear indices but leave definitions in place
    else {
      // clear binary indices
      const keys = Object.keys(this.binaryIndices);
      keys.forEach((biname) => {
        this.binaryIndices[biname].dirty = false;
        this.binaryIndices[biname].values = [];
      });

      // clear entire unique indices definition
      this.constraints = {
        unique: {},
        exact: {}
      };

      // add definitions back
      this.uniqueNames.forEach((uiname) => {
        this.ensureUniqueIndex(uiname);
      });
    }

    if (this._fullTextSearch !== null) {
      this._fullTextSearch.clear();
    }
  }

  /**
   * Updates an object and notifies collection that the document has changed.
   * @param {object} doc - document to update within the collection
   */
  update(doc: ANY) {
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
      let newInternal = this.cloneObjects || !this.disableDeltaChangesApi ? clone(doc, this.cloneMethod) : doc;

      this.emit("pre-update", doc);

      Object.keys(this.constraints.unique).forEach((key) => {
        this.constraints.unique[key].update(oldInternal, newInternal);
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
      } else {
        this.flagBinaryIndexesDirty();
      }

      this.idIndex[position] = newInternal.$loki;

      // FullTextSearch.
      if (this._fullTextSearch !== null) {
         this._fullTextSearch.updateDocument(doc, position);
      }

      this.commit();
      this.dirty = true; // for autosave scenarios

      this.emit("update", doc, this.cloneObjects || !this.disableDeltaChangesApi ? clone(oldInternal, this.cloneMethod) : null);
      return doc;
    } catch (err) {
      this.rollback();
      this.console.error(err.message);
      this.emit("error", err);
      throw (err); // re-throw error so user does not think it succeeded
    }
  }

  /**
   * Add object to collection
   */
  private add(obj: E) {
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

      const newDoc = obj as Doc<E>;
      newDoc.$loki = this.maxId;
      newDoc.meta.version = 0;

      let key;
      const constrUnique = this.constraints.unique;
      for (key in constrUnique) {
        if (constrUnique[key] !== undefined) {
          constrUnique[key].set(newDoc);
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
      } else {
        this.flagBinaryIndexesDirty();
      }

      // FullTextSearch.
      if (this._fullTextSearch !== null) {
        this._fullTextSearch.addDocument(newDoc, addedPos);
      }

      this.commit();
      this.dirty = true; // for autosave scenarios

      return (this.cloneObjects) ? (clone(newDoc, this.cloneMethod)) : (newDoc);
    } catch (err) {
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
  updateWhere(filterFunction: (obj: E) => boolean, updateFunction: (obj: E) => E) {
    const results = this.where(filterFunction);
    let i = 0;
    let obj;
    try {
      for (i; i < results.length; i++) {
        obj = updateFunction(results[i]);
        this.update(obj);
      }

    } catch (err) {
      this.rollback();
      this.console.error(err.message);
    }
  }

  /**
   * Remove all documents matching supplied filter function.
   * For 'mongo-like' querying you should migrate to [findAndRemove()]{@link Collection#findAndRemove}.
   * @param {function|object} query - query object to filter on
   */
  removeWhere(query: Query | ((obj: E) => boolean)) {
    let list;
    if (typeof query === "function") {
      list = this.data.filter(query);
      this.remove(list);
    } else {
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
  remove(doc: ANY) {
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
      } else {
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
    } catch (err) {
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
  public getChanges() {
    return this.changes;
  }

  /**
   * Enables/disables changes api.
   * @param {boolean} disableChangesApi
   * @param {boolean} disableDeltaChangesApi
   */
  public setChangesApi(disableChangesApi: boolean, disableDeltaChangesApi: boolean = true) {
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
  public flushChanges() {
    this.changes = [];
  }

  private _getObjectDelta(oldObject: Doc<E>, newObject: Doc<E>) {
    const propertyNames = newObject !== null && typeof newObject === "object" ? Object.keys(newObject) : null;
    if (propertyNames && propertyNames.length && ["string", "boolean", "number"].indexOf(typeof(newObject)) < 0) {
      const delta = {};
      for (let i = 0; i < propertyNames.length; i++) {
        const propertyName = propertyNames[i];
        if (newObject.hasOwnProperty(propertyName)) {
          if (!oldObject.hasOwnProperty(propertyName) || this.uniqueNames.indexOf(propertyName) >= 0 || propertyName === "$loki" || propertyName === "meta") {
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
  private _getChangeDelta(obj: Doc<E>, old: Doc<E>) {
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
  private _createChange(name: string, op: string, obj: Doc<E>, old?: Doc<E>) {
    this.changes.push({
      name,
      operation: op,
      obj: op === "U" && !this.disableDeltaChangesApi ? this._getChangeDelta(obj, old) : JSON.parse(JSON.stringify(obj))
    });
  }

  private _createInsertChange(obj: Doc<E>) {
    this._createChange(this.name, "I", obj);
  }

  /**
   * If the changes API is disabled make sure only metadata is added without re-evaluating everytime if the changesApi is enabled
   */
  private _insertMeta(obj: Doc<E>) {
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

  private _updateMeta(obj: Doc<E>) {
    if (!obj) {
      return;
    }
    obj.meta.updated = (new Date()).getTime();
    obj.meta.revision += 1;
  }


  private _createUpdateChange(obj: Doc<E>, old: Doc<E>) {
    this._createChange(this.name, "U", obj, old);
  }

  private _insertMetaWithChange(obj: Doc<E>) {
    this._insertMeta(obj);
    this._createInsertChange(obj);
  }

  private _updateMetaWithChange(obj: Doc<E>, old: Doc<E>) {
    this._updateMeta(obj);
    this._createUpdateChange(obj, old);
  }

  /*---------------------+
   | Finding methods     |
   +----------------------*/

  /**
   * Get by Id - faster than other methods because of the searching algorithm
   * @param {int} id - $loki id of document you want to retrieve
   * @param {boolean} returnPosition - if 'true' we will return [object, position]
   * @returns {(object|array|null)} Object reference if document was found, null if not,
   *     or an array if 'returnPosition' was passed.
   */
  public get(id: number): Doc<E>;
  public get(id: number, returnPosition: boolean): Doc<E> | [Doc<E>, number];
  public get(id: number, returnPosition = false) {
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
      } else {
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
  public getBinaryIndexPosition(dataPosition: number, binaryIndexName: string) {
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
      if (index[idx] === dataPosition) return idx;
    }

    // uhoh
    return null;
  }

  /**
   * Adaptively insert a selected item to the index.
   * @param {int} dataPosition : coll.data array index/position
   * @param {string} binaryIndexName : index to search for dataPosition in
   */
  adaptiveBinaryIndexInsert(dataPosition: number, binaryIndexName: string) {
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
  adaptiveBinaryIndexUpdate(dataPosition: number, binaryIndexName: string) {
    // linear scan needed to find old position within index unless we optimize for clone scenarios later
    // within (my) node 5.6.0, the following for() loop with strict compare is -much- faster than indexOf()
    let idxPos;

    const index = this.binaryIndices[binaryIndexName].values;
    const len = index.length;

    for (idxPos = 0; idxPos < len; idxPos++) {
      if (index[idxPos] === dataPosition) break;
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
  adaptiveBinaryIndexRemove(dataPosition: number, binaryIndexName: string, removedFromIndexOnly = false): ANY {
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
  private _calculateRangeStart(prop: string, val: ANY, adaptive = false): number {
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

      if (ltHelper(rcd[index[mid]][prop], val, false)) {
        min = mid + 1;
      } else {
        max = mid;
      }
    }

    const lbound = min;

    // found it... return it
    if (aeqHelper(val, rcd[index[lbound]][prop])) {
      return lbound;
    }

    // if not in index and our value is less than the found one
    if (ltHelper(val, rcd[index[lbound]][prop], false)) {
      return adaptive ? lbound : lbound - 1;
    }

    // not in index and our value is greater than the found one
    return adaptive ? lbound + 1 : lbound;
  }

  /**
   * Internal method used for indexed $between.  Given a prop (index name), and a value
   * (which may or may not yet exist) this will find the final position of that upper range value.
   */
  private _calculateRangeEnd(prop: string, val: ANY) {
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

      if (ltHelper(val, rcd[index[mid]][prop], false)) {
        max = mid;
      } else {
        min = mid + 1;
      }
    }

    const ubound = max;

    // only eq if last element in array is our val
    if (aeqHelper(val, rcd[index[ubound]][prop])) {
      return ubound;
    }

    // if not in index and our value is less than the found one
    if (gtHelper(val, rcd[index[ubound]][prop], false)) {
      return ubound + 1;
    }

    // either hole or first nonmatch
    if (aeqHelper(val, rcd[index[ubound - 1]][prop])) {
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
  calculateRange(op: string, prop: string, val: ANY): [number, number] {
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
        if (ltHelper(val, minVal, false) || gtHelper(val, maxVal, false)) {
          return [0, -1];
        }
        break;
      case "$dteq":
        if (ltHelper(val, minVal, false) || gtHelper(val, maxVal, false)) {
          return [0, -1];
        }
        break;
      case "$gt":
        // none are within range
        if (gtHelper(val, maxVal, true)) {
          return [0, -1];
        }
        // all are within range
        if (gtHelper(minVal, val, false)) {
          return [min, max];
        }
        break;
      case "$gte":
        // none are within range
        if (gtHelper(val, maxVal, false)) {
          return [0, -1];
        }
        // all are within range
        if (gtHelper(minVal, val, true)) {
          return [min, max];
        }
        break;
      case "$lt":
        // none are within range
        if (ltHelper(val, minVal, true)) {
          return [0, -1];
        }
        // all are within range
        if (ltHelper(maxVal, val, false)) {
          return [min, max];
        }
        break;
      case "$lte":
        // none are within range
        if (ltHelper(val, minVal, false)) {
          return [0, -1];
        }
        // all are within range
        if (ltHelper(maxVal, val, true)) {
          return [min, max];
        }
        break;
      case "$between":
        // none are within range (low range is greater)
        if (gtHelper(val[0], maxVal, false)) {
          return [0, -1];
        }
        // none are within range (high range lower)
        if (ltHelper(val[1], minVal, false)) {
          return [0, -1];
        }

        lbound = this._calculateRangeStart(prop, val[0]);
        ubound = this._calculateRangeEnd(prop, val[1]);

        if (lbound < 0) lbound++;
        if (ubound > max) ubound--;

        if (!gtHelper(rcd[index[lbound]][prop], val[0], true)) lbound++;
        if (!ltHelper(rcd[index[ubound]][prop], val[1], true)) ubound--;

        if (ubound < lbound) return [0, -1];

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
        if (!aeqHelper(lval, val)) {
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
        if (!aeqHelper(rcd[index[ubound]][prop], val)) {
          //if (gtHelper(rcd[index[ubound]][prop], val, false)) {
          return [ubound, max];
        }
        // otherwise (found) so ubound is still equal, get next
        return [ubound + 1, max];

      case "$gte":
        // if hole (not found) lb position marks left outside of range
        if (!aeqHelper(rcd[index[lbound]][prop], val)) {
          //if (ltHelper(rcd[index[lbound]][prop], val, false)) {
          return [lbound + 1, max];
        }
        // otherwise (found) so lb is first position where its equal
        return [lbound, max];

      case "$lt":
        // if hole (not found) position already is less than
        if (!aeqHelper(rcd[index[lbound]][prop], val)) {
          //if (ltHelper(rcd[index[lbound]][prop], val, false)) {
          return [min, lbound];
        }
        // otherwise (found) so lb marks left inside of eq range, get previous
        return [min, lbound - 1];

      case "$lte":
        // if hole (not found) ub position marks right outside so get previous
        if (!aeqHelper(rcd[index[ubound]][prop], val)) {
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
  public by(field: string, value?: ANY): Doc<E> {
    const result = this.constraints.unique[field].get(value);
    if (!this.cloneObjects) {
      return result as Doc<E>;
    } else {
      return clone(result, this.cloneMethod) as any as Doc<E>;
    }
  }

  /**
   * Find one object by index property, by property equal to value
   * @param {object} query - query object used to perform search with
   * @returns {(object|null)} First matching document, or null if none
   */
  public findOne(query: object): Doc<E> {
    query = query || {};

    // Instantiate Resultset and exec find op passing firstOnly = true param
    const result = this.chain().find(query, true).data();

    if (Array.isArray(result) && result.length === 0) {
      return null;
    } else {
      if (!this.cloneObjects) {
        return result[0] as any as Doc<E>;
      } else {
        return clone(result[0], this.cloneMethod) as any as Doc<E>;
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
  public chain(transform?: string | ANY[], parameters?: ANY): Resultset<E> {
    const rs = new Resultset<E>(this);

    if (typeof transform === "undefined") {
      return rs;
    }
    return rs.transform(transform, parameters) as Resultset<E>;
  }

  /**
   * Find method, api is similar to mongodb.
   * for more complex queries use [chain()]{@link Collection#chain} or [where()]{@link Collection#where}.
   * @example {@tutorial Query Examples}
   * @param {object} query - 'mongo-like' query object
   * @returns {array} Array of matching documents
   */
  public find(query?: Query): Doc<E>[] {
    return this.chain().find(query).data();
  }

  /**
   * Find object by unindexed field by property equal to value,
   * simply iterates and returns the first element matching the query
   */
  public findOneUnindexed(prop: string, value: ANY) {
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
  public startTransaction(): void {
    if (this.transactional) {
      this.cachedData = clone(this.data, this.cloneMethod);
      this.cachedIndex = this.idIndex;
      this.cachedBinaryIndex = this.binaryIndices;

      // propagate startTransaction to dynamic views
      for (let idx = 0; idx < this._dynamicViews.length; idx++) {
        this._dynamicViews[idx].startTransaction();
      }
    }
  }

  /** commit the transation */
  public commit(): void {
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
  public rollback(): void {
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
  public where(fun: (obj: E) => boolean): Doc<E>[] {
    return this.chain().where(fun).data();
  }

  /**
   * Map Reduce operation
   *
   * @param {function} mapFunction - function to use as map function
   * @param {function} reduceFunction - function to use as reduce function
   * @returns {data} The result of your mapReduce operation
   */
  mapReduce<T, U>(mapFunction: (value: E, index: number, array: E[]) => T, reduceFunction: (array: T[]) => U): U {
    try {
      return reduceFunction(this.data.map(mapFunction));
    } catch (err) {
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
  eqJoin(joinData: ANY[], leftJoinProp: string, rightJoinProp: string, mapFun?: Function): Resultset {
    // logic in Resultset class
    return new Resultset(this).eqJoin(joinData, leftJoinProp, rightJoinProp, mapFun);
  }

  /* ------ STAGING API -------- */

  /**
   * stages: a map of uniquely identified 'stages', which hold copies of objects to be
   * manipulated without affecting the data in the original collection
   */


  /**
   * (Staging API) create a stage and/or retrieve it
   */
  getStage(name: string) {
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
  stage(stageName: string, obj: ANY) {
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
  commitStage(stageName: string, message: string) {
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
  extract(field: string) {
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
  max(field: string) {
    return Math.max.apply(null, this.extract(field));
  }

  /**
   */
  min(field: string) {
    return Math.min.apply(null, this.extract(field));
  }

  /**
   */
  maxRecord(field: string) {
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
      } else {
        max = deepProperty(this.data[i], field, deep);
        result.index = this.data[i].$loki;
      }
    }
    result.value = max;
    return result;
  }

  /**
   */
  minRecord(field: string) {
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
      } else {
        min = deepProperty(this.data[i], field, deep);
        result.index = this.data[i].$loki;
      }
    }
    result.value = min;
    return result;
  }

  /**
   */
  extractNumerical(field: string) {
    return this.extract(field).map(parseFloat).filter(Number).filter((n) => !(isNaN(n)));
  }

  /**
   * Calculates the average numerical value of a property
   *
   * @param {string} field - name of property in docs to average
   * @returns {number} average of property in all docs in the collection
   */
  avg(field: string) {
    return average(this.extractNumerical(field));
  }

  /**
   * Calculate standard deviation of a field
   * @param {string} field
   */
  stdDev(field: string) {
    return standardDeviation(this.extractNumerical(field));
  }

  /**
   * @param {string} field
   */
  mode(field: string) {
    const dict = {};
    const data = this.extract(field);
    data.forEach((obj) => {
      if (dict[obj]) {
        dict[obj] += 1;
      } else {
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
      } else {
        mode = prop;
        max = dict[prop];
      }
    }
    return mode;
  }

  /**
   * @param {string} field - property name
   */
  median(field: string) {
    const values = this.extractNumerical(field);
    values.sort((a, b) => a - b);

    const half = Math.floor(values.length / 2);

    if (values.length % 2) {
      return values[half];
    } else {
      return (values[half - 1] + values[half]) / 2.0;
    }
  }
}

export namespace Collection {
  export interface Options {
    unique?: string[];
    exact?: string[];
    indices?: string[];
    adaptiveBinaryIndices?: boolean;
    asyncListeners?: boolean;
    disableChangesApi?: boolean;
    disableDeltaChangesApi?: boolean;
    clone?: boolean;
    serializableIndices?: boolean;
    cloneMethod?: CloneMethod;
    transactional?: boolean;
    ttl?: number;
    ttlInterval?: number;
    fullTextSearch?: FullTextSearch.FieldOptions[];
  }

  export interface DeserializeOptions {
    retainDirtyFlags?: boolean;
  }

  export interface BinaryIndex {
    dirty: boolean;
    values: any;
  }

  export type Change = any;
}
