import {LokiEventEmitter} from "./event_emitter";
import {UniqueIndex} from "./unique_index";
import {ResultSet} from "./result_set";
import {DynamicView} from "./dynamic_view";
import {ltHelper, gtHelper, aeqHelper} from "./helper";
import {Loki} from "./loki";
import {clone, CloneMethod} from "./clone";
import {Doc, Dict} from "../../common/types";
import {FullTextSearch} from "../../full-text-search/src/full_text_search";
import {PLUGINS} from "../../common/plugin";
import {Analyzer} from "../../full-text-search/src/analyzer/analyzer";

export {CloneMethod} from "./clone";

function average(array: number[]): number {
  return (array.reduce((a, b) => a + b, 0)) / array.length;
}

function standardDeviation(values: number[]): number {
  const avg = average(values);
  const squareDiffs = values.map((value) => {
    const diff = value - avg;
    return diff * diff;
  });

  const avgSquareDiff = average(squareDiffs);
  return Math.sqrt(avgSquareDiff);
}

/**
 * Returns an array with the value of a nested property of an object.
 * Returns an array of values if the nested property is across child arrays.
 * @param {object} obj - the object
 * @param {string[]} path - the path of the nested property
 * @param {any[]} array - the result array
 * @param {number} pathIdx - the current path idx
 * @returns {boolean} true if nested property is across child arrays, otherwise false
 */
function getNestedPropertyValue(obj: object, path: string[], array: any[], pathIdx: number = 0): boolean {
  if (obj === undefined) {
    return false;
  }

  if (pathIdx + 1 === path.length) {
    array.push(obj[path[pathIdx]]);
    return false;
  }

  const curr = obj[path[pathIdx]];
  if (Array.isArray(curr)) {
    for (let i = 0; i < curr.length; i++) {
      getNestedPropertyValue(curr[i], path, array, pathIdx + 1);
    }
    return true;
  } else {
    return getNestedPropertyValue(curr, path, array, pathIdx + 1);
  }
}

/**
 * Collection class that handles documents of same type
 * @extends LokiEventEmitter
 * @param <TData> - the data type
 * @param <TNested> - nested properties of data type
 */
export class Collection<TData extends object = object, TNested extends object = object> extends LokiEventEmitter {

  public name: string;
  // the data held by the collection
  public _data: Doc<TData & TNested>[];
  private idIndex: number[]; // index of id
  public binaryIndices: { [P in keyof (TData & TNested)]?: Collection.BinaryIndex }; // user defined indexes

  /**
   * Unique constraints contain duplicate object references, so they are not persisted.
   * We will keep track of properties which have unique constraints applied here, and regenerate on load.
   */
  public constraints: {
    unique: {
      [P in keyof (TData & TNested)]?: UniqueIndex<TData & TNested>;
      }
  };

  /**
   * Transforms will be used to store frequently used query chains as a series of steps which itself can be stored along
   * with the database.
   */
  public transforms: Dict<Collection.Transform<TData, TNested>[]>;

  /**
   * In autosave scenarios we will use collection level dirty flags to determine whether save is needed.
   * currently, if any collection is dirty we will autosave the whole database if autosave is configured.
   * Defaulting to true since this is called from addCollection and adding a collection should trigger save.
   */
  public dirty: boolean;

  private _cached: {
    index: number[];
    data: Doc<TData & TNested>[];
    binaryIndex: { [P in keyof (TData & TNested)]?: Collection.BinaryIndex };
  };

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
   * If set to true we will not maintain a meta property for a document.
   */
  private disableMeta: boolean;

  /**
   * Disable track changes.
   */
  private disableChangesApi: boolean;

  /**
   * Disable delta update object style on changes.
   */
  public disableDeltaChangesApi: boolean;

  /**
   * By default, if you insert a document into a collection with binary indices, if those indexed properties contain
   * a DateTime we will convert to epoch time format so that (across serializations) its value position will be the
   * same 'after' serialization as it was 'before'.
   */
  private serializableIndices: boolean;

  /**
   * Name of path of used nested properties.
   */
  private _nestedProperties: { name: keyof TNested, path: string[] }[];

  /**
   * Option to activate a cleaner daemon - clears "aged" documents at set intervals.
   */
  public ttl: Collection.TTL;

  private maxId: number;
  private _dynamicViews: DynamicView<TData, TNested>[];

  /**
   * Changes are tracked by collection and aggregated by the db.
   */
  private changes: Collection.Change[];

  /* assign correct handler based on ChangesAPI flag */
  private insertHandler: (obj: Doc<TData>) => void;
  private updateHandler: (obj: Doc<TData>, old: Doc<TData>) => void;

  public console: {
    log(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
  };

  /**
   * stages: a map of uniquely identified 'stages', which hold copies of objects to be
   * manipulated without affecting the data in the original collection
   */
  private stages: object;
  private commitLog: { timestamp: number; message: string; data: any }[];

  public _fullTextSearch: FullTextSearch;

  /**
   * @param {string} name - collection name
   * @param {(object)} [options={}] - a configuration object
   * @param {string[]} [options.unique=[]] - array of property names to define unique constraints for
   * @param {string[]} [options.exact=[]] - array of property names to define exact constraints for
   * @param {string[]} [options.indices=[]] - array property names to define binary indexes for
   * @param {boolean} [options.adaptiveBinaryIndices=true] - collection indices will be actively rebuilt rather than lazily
   * @param {boolean} [options.asyncListeners=false] - whether listeners are invoked asynchronously
   * @param {boolean} [options.disableMeta=false] - set to true to disable meta property on documents
   * @param {boolean} [options.disableChangesApi=true] - set to false to enable Changes API
   * @param {boolean} [options.disableDeltaChangesApi=true] - set to false to enable Delta Changes API (requires Changes API, forces cloning)
   * @param {boolean} [options.clone=false] - specify whether inserts and queries clone to/from user
   * @param {boolean} [options.serializableIndices =true] - converts date values on binary indexed property values are serializable
   * @param {string} [options.cloneMethod="deep"] - the clone method
   * @param {number} [options.transactional=false] - ?
   * @param {number} [options.ttl=] - age of document (in ms.) before document is considered aged/stale.
   * @param {number} [options.ttlInterval=] - time interval for clearing out 'aged' documents; not set by default
   * @param {FullTextSearch.FieldOptions} [options.fullTextSearch=] - the full-text search options
   * @see {@link Loki#addCollection} for normal creation of collections
   */
  constructor(name: string, options: Collection.Options<TData, TNested> = {}) {
    super();

    // Consistency checks.
    if (options && options.disableMeta === true) {
      if (options.disableChangesApi === false) {
        throw new Error("disableMeta option cannot be passed as true when disableChangesApi is passed as false");
      }
      if (options.disableDeltaChangesApi === false) {
        throw new Error("disableMeta option cannot be passed as true when disableDeltaChangesApi is passed as false");
      }
      if (typeof options.ttl === "number" && options.ttl > 0) {
        throw new Error("disableMeta option cannot be passed as true when ttl is enabled");
      }
    }

    // the name of the collection
    this.name = name;
    // the data held by the collection
    this._data = [];
    this.idIndex = []; // index of id
    this.binaryIndices = {}; // user defined indexes
    this.constraints = {
      unique: {}
    };

    // .
    this.transforms = {};

    // .
    this.dirty = true;

    // private holder for cached data
    this._cached = null;

    /* OPTIONS */
    // exact match and unique constraints
    if (options.unique !== undefined) {
      if (!Array.isArray(options.unique)) {
        options.unique = [options.unique];
      }
      options.unique.forEach((prop: keyof (TData & TNested)) => {
        this.constraints.unique[prop] = new UniqueIndex<TData & TNested>(prop);
      });
    }

    // Full text search
    if (PLUGINS["FullTextSearch"] !== undefined) {
      this._fullTextSearch = options.fullTextSearch !== undefined
        ? new (PLUGINS["FullTextSearch"])(options.fullTextSearch) : null;
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
    this.disableMeta = options.disableMeta !== undefined ? options.disableMeta : false;

    // .
    this.disableChangesApi = options.disableChangesApi !== undefined ? options.disableChangesApi : true;

    // .
    this.disableDeltaChangesApi = options.disableDeltaChangesApi !== undefined ? options.disableDeltaChangesApi : true;

    // .
    this.cloneMethod = options.cloneMethod !== undefined ? options.cloneMethod : "deep";
    if (this.disableChangesApi) {
      this.disableDeltaChangesApi = true;
    }

    // .
    this.serializableIndices = options.serializableIndices !== undefined ? options.serializableIndices : true;

    // .
    this._nestedProperties = [];
    if (options.nestedProperties != undefined) {
      for (let i = 0; i < options.nestedProperties.length; i++) {
        const nestedProperty = options.nestedProperties[i];
        if (typeof nestedProperty === "string") {
          this._nestedProperties.push({name: nestedProperty, path: nestedProperty.split(".")});
        } else {
          this._nestedProperties.push(nestedProperty as { name: keyof TNested, path: string[] });
        }
      }
    }

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
    this._ensureId();
    let indices = options.indices ? options.indices : [];
    for (let idx = 0; idx < indices.length; idx++) {
      this.ensureIndex(options.indices[idx]);
    }

    this.setChangesApi(this.disableChangesApi, this.disableDeltaChangesApi);

    // Add change api to event callback.
    this.on("insert", (obj: Doc<TData>) => {
      this.insertHandler(obj);
    });

    this.on("update", (obj: Doc<TData>, old: Doc<TData>) => {
      this.updateHandler(obj, old);
    });

    this.on("delete", (obj: Doc<TData>) => {
      if (!this.disableChangesApi) {
        this._createChange(this.name, "R", obj);
      }
    });

    this.on("warning", (warning: string) => {
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
      }
    };

    /* ------ STAGING API -------- */
    /**
     * stages: a map of uniquely identified 'stages', which hold copies of objects to be
     * manipulated without affecting the data in the original collection
     */
    this.stages = {};
    this.commitLog = [];
  }

  toJSON(): Collection.Serialized {
    return {
      name: this.name,
      _dynamicViews: this._dynamicViews,
      uniqueNames: Object.keys(this.constraints.unique),
      transforms: this.transforms as any,
      binaryIndices: this.binaryIndices as any,
      _data: this._data,
      idIndex: this.idIndex,
      maxId: this.maxId,
      dirty: this.dirty,
      _nestedProperties: this._nestedProperties,
      adaptiveBinaryIndices: this.adaptiveBinaryIndices,
      transactional: this.transactional,
      asyncListeners: this.asyncListeners,
      disableMeta: this.disableMeta,
      disableChangesApi: this.disableChangesApi,
      disableDeltaChangesApi: this.disableDeltaChangesApi,
      cloneObjects: this.cloneObjects,
      cloneMethod: this.cloneMethod,
      changes: this.changes,
      _fullTextSearch: this._fullTextSearch
    };
  }

  static fromJSONObject(obj: Collection.Serialized, options?: Collection.DeserializeOptions) {
    let coll = new Collection<any>(obj.name, {
      disableChangesApi: obj.disableChangesApi,
      disableDeltaChangesApi: obj.disableDeltaChangesApi
    });

    coll.adaptiveBinaryIndices = obj.adaptiveBinaryIndices !== undefined ? (obj.adaptiveBinaryIndices === true) : false;
    coll.transactional = obj.transactional;
    coll.asyncListeners = obj.asyncListeners;
    coll.disableMeta = obj.disableMeta;
    coll.disableChangesApi = obj.disableChangesApi;
    coll.cloneObjects = obj.cloneObjects;
    coll.cloneMethod = obj.cloneMethod || "deep";
    coll.changes = obj.changes;
    coll._nestedProperties = obj._nestedProperties as any[];

    coll.dirty = (options && options.retainDirtyFlags === true) ? obj.dirty : false;

    function makeLoader(coll: Collection.Serialized) {
      const collOptions = options[coll.name];

      if (collOptions.proto) {
        const inflater = collOptions.inflate || ((src: Doc<any>, dest: Doc<any>) => {
          for (let prop in src) {
            dest[prop] = src[prop];
          }
        });

        return (data: Doc<any>) => {
          const collObj = new (collOptions.proto)();
          inflater(data, collObj);
          return collObj;
        };
      }

      return collOptions.inflate;
    }

    // load each element individually
    if (options && options[obj.name] !== undefined) {
      let loader = makeLoader(obj);

      for (let j = 0; j < obj._data.length; j++) {
        coll._data[j] = coll._defineNestedProperties(loader(obj._data[j]));
      }
    } else {
      for (let j = 0; j < obj._data.length; j++) {
        coll._data[j] = coll._defineNestedProperties(obj._data[j]);
      }
    }

    coll.maxId = (obj.maxId === undefined) ? 0 : obj.maxId;
    coll.idIndex = obj.idIndex;
    if (obj.binaryIndices !== undefined) {
      coll.binaryIndices = obj.binaryIndices;
    }
    if (obj.transforms !== undefined) {
      coll.transforms = obj.transforms;
    }

    coll._ensureId();

    // regenerate unique indexes
    if (obj.uniqueNames !== undefined) {
      for (let j = 0; j < obj.uniqueNames.length; j++) {
        coll.ensureUniqueIndex(obj.uniqueNames[j]);
      }
    }

    // in case they are loading a database created before we added dynamic views, handle undefined
    if (obj._dynamicViews !== undefined) {
      // reinflate DynamicViews and attached ResultSets
      for (let idx = 0; idx < obj._dynamicViews.length; idx++) {
        coll._dynamicViews.push(DynamicView.fromJSONObject(coll, obj._dynamicViews[idx] as any));
      }
    }

    if (obj._fullTextSearch) {
      coll._fullTextSearch = PLUGINS["FullTextSearch"].fromJSONObject(obj._fullTextSearch, options.fullTextSearch);
    }

    return coll;
  }

  /**
   * Adds a named collection transform to the collection
   * @param {string} name - name to associate with transform
   * @param {array} transform - an array of transformation 'step' objects to save into the collection
   */
  public addTransform(name: string, transform: Collection.Transform<TData, TNested>[]): void {
    if (this.transforms[name] !== undefined) {
      throw new Error("a transform by that name already exists");
    }
    this.transforms[name] = transform;
  }

  /**
   * Retrieves a named transform from the collection.
   * @param {string} name - name of the transform to lookup.
   */
  public getTransform(name: string): Collection.Transform<TData, TNested>[] {
    return this.transforms[name];
  }

  /**
   * Updates a named collection transform to the collection
   * @param {string} name - name to associate with transform
   * @param {object} transform - a transformation object to save into collection
   */
  public setTransform(name: string, transform: Collection.Transform<TData, TNested>[]): void {
    this.transforms[name] = transform;
  }

  /**
   * Removes a named collection transform from the collection
   * @param {string} name - name of collection transform to remove
   */
  public removeTransform(name: string): void {
    delete this.transforms[name];
  }

  /*----------------------------+
   | TTL                        |
   +----------------------------*/
  private setTTL(age: number, interval: number): void {
    if (age < 0) {
      clearInterval(this.ttl.daemon);
    } else {
      this.ttl.age = age;
      this.ttl.ttlInterval = interval;
      this.ttl.daemon = setInterval(() => {
        const now = Date.now();
        const toRemove = this.chain().where((member: Doc<TData>) => {
          const timestamp = member.meta.updated || member.meta.created;
          const diff = now - timestamp;
          return this.ttl.age < diff;
        });
        toRemove.remove();
      }, interval);
    }
  }

  /*----------------------------+
   | INDEXING                   |
   +----------------------------*/

  /**
   * Create a row filter that covers all documents in the collection.
   */
  _prepareFullDocIndex(): number[] {
    const indexes = new Array(this._data.length);
    for (let i = 0; i < indexes.length; i++) {
      indexes[i] = i;
    }
    return indexes;
  }

  /**
   * Ensure binary index on a certain field.
   * @param {string} field - the field name
   * @param {boolean} [force=false] - flag indicating whether to construct index immediately
   */
  public ensureIndex(field: keyof (TData & TNested), force = false) {
    if (this.binaryIndices[field] && !force && !this.binaryIndices[field].dirty) {
      return;
    }

    // if the index is already defined and we are using adaptiveBinaryIndices and we are not forcing a rebuild, return.
    if (this.adaptiveBinaryIndices === true && this.binaryIndices[field] !== undefined && !force) {
      return;
    }

    const index = {
      name: field,
      dirty: true,
      values: this._prepareFullDocIndex()
    };
    this.binaryIndices[field] = index;

    const wrappedComparer = (a: number, b: number) => {
      const val1 = this._data[a][field];
      const val2 = this._data[b][field];
      if (val1 !== val2) {
        if (ltHelper(val1, val2, false)) return -1;
        if (gtHelper(val1, val2, false)) return 1;
      }
      return 0;
    };

    index.values.sort(wrappedComparer);
    index.dirty = false;

    this.dirty = true; // for autosave scenarios
  }

  public ensureUniqueIndex(field: keyof (TData & TNested)) {
    let index = new UniqueIndex<TData & TNested>(field);

    // if index already existed, (re)loading it will likely cause collisions, rebuild always
    this.constraints.unique[field] = index;
    for (let i = 0; i < this._data.length; i++) {
      index.set(this._data[i], i);
    }
    return index;
  }

  /**
   * Ensure all binary indices.
   */
  public ensureAllIndexes(force = false) {
    const keys = Object.keys(this.binaryIndices) as (keyof (TData & TNested))[];
    for (let i = 0; i < keys.length; i++) {
      this.ensureIndex(keys[i], force);
    }
  }

  public flagBinaryIndexesDirty() {
    const keys = Object.keys(this.binaryIndices) as (keyof (TData & TNested))[];
    for (let i = 0; i < keys.length; i++) {
      this.flagBinaryIndexDirty(keys[i]);
    }
  }

  public flagBinaryIndexDirty(index: keyof (TData & TNested)) {
    this.binaryIndices[index].dirty = true;
  }

  /**
   * Quickly determine number of documents in collection (or query)
   * @param {object} query - (optional) query object to count results of
   * @returns {number} number of documents in the collection
   */
  public count(query?: ResultSet.Query<Doc<TData & TNested>>): number {
    if (!query) {
      return this._data.length;
    }
    return this.chain().find(query)._filteredRows.length;
  }

  /**
   * Rebuild idIndex
   */
  private _ensureId(): void {
    this.idIndex = [];
    for (let i = 0; i < this._data.length; i++) {
      this.idIndex.push(this._data[i].$loki);
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
  public addDynamicView(name: string, options?: DynamicView.Options): DynamicView<TData, TNested> {
    const dv = new DynamicView<TData, TNested>(this, name, options);
    this._dynamicViews.push(dv);

    return dv;
  }

  /**
   * Remove a dynamic view from the collection
   * @param {string} name - name of dynamic view to remove
   **/
  public removeDynamicView(name: string): void {
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
  public getDynamicView(name: string): DynamicView<TData, TNested> {
    for (let idx = 0; idx < this._dynamicViews.length; idx++) {
      if (this._dynamicViews[idx].name === name) {
        return this._dynamicViews[idx];
      }
    }

    return null;
  }

  /**
   * Applies a 'mongo-like' find query object and passes all results to an update function.
   * @param {object} filterObject - the 'mongo-like' query object
   * @param {function} updateFunction - the update function
   */
  public findAndUpdate(filterObject: ResultSet.Query<Doc<TData & TNested>>, updateFunction: (obj: Doc<TData>) => any) {
    this.chain().find(filterObject).update(updateFunction);
  }

  /**
   * Applies a 'mongo-like' find query object removes all documents which match that filter.
   * @param {object} filterObject - 'mongo-like' query object
   */
  public findAndRemove(filterObject: ResultSet.Query<Doc<TData & TNested>>) {
    this.chain().find(filterObject).remove();
  }

  /**
   * Adds object(s) to collection, ensure object(s) have meta properties, clone it if necessary, etc.
   * @param {(object|array)} doc - the document (or array of documents) to be inserted
   * @returns {(object|array)} document or documents inserted
   */
  public insert(doc: TData): Doc<TData & TNested>;
  public insert(doc: TData[]): Doc<TData & TNested>[];
  public insert(doc: TData | TData[]): Doc<TData & TNested> | Doc<TData & TNested>[] {
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
  public insertOne(doc: TData, bulkInsert = false): Doc<TData & TNested> {
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
    const obj = this._defineNestedProperties(this.cloneObjects ? clone(doc, this.cloneMethod) : doc);

    if (!this.disableMeta && (obj as Doc<TData>).meta === undefined) {
      (obj as Doc<TData>).meta = {
        version: 0,
        revision: 0,
        created: 0
      };
    }

    // both 'pre-insert' and 'insert' events are passed internal data reference even when cloning
    // insert needs internal reference because that is where loki itself listens to add meta
    if (!bulkInsert) {
      this.emit("pre-insert", obj);
    }
    if (!this._add(obj)) {
      return undefined;
    }

    returnObj = obj;
    if (!bulkInsert) {
      this.emit("insert", obj);
      returnObj = this.cloneObjects ? clone(obj, this.cloneMethod) : obj;
    }

    return returnObj as Doc<TData & TNested>;
  }

  /**
   * Refers nested properties of an object to the root of it.
   * @param {T} data - the object
   * @returns {T & TNested} the object with nested properties
   * @hidden
   */
  _defineNestedProperties<T extends object>(data: T): T & TNested {
    for (let i = 0; i < this._nestedProperties.length; i++) {
      const name = this._nestedProperties[i].name;
      const path = this._nestedProperties[i].path;
      Object.defineProperty(data, name, {
        get() {
          // Get the value of the nested property.
          const array: any[] = [];
          if (getNestedPropertyValue(this, path, array)) {
            return array;
          } else {
            return array[0];
          }
        },
        set(val: any) {
          // Set the value of the nested property.
          path.slice(0, path.length - 1).reduce((obj: any, part: string) =>
            (obj && obj[part]) ? obj[part] : null, this)[path[path.length - 1]] = val;
        },
        enumerable: false,
        configurable: true
      });
    }
    return data as T & TNested;
  }

  /**
   * Empties the collection.
   * @param {boolean} [removeIndices=false] - remove indices
   */
  public clear({removeIndices: removeIndices = false} = {}) {
    this._data = [];
    this.idIndex = [];
    this._cached = null;
    this.maxId = 0;
    this._dynamicViews = [];
    this.dirty = true;

    // if removing indices entirely
    if (removeIndices === true) {
      this.binaryIndices = {};

      this.constraints = {
        unique: {}
      };
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
  public update(doc: Doc<TData & TNested> | Doc<TData & TNested>[]): void {
    if (Array.isArray(doc)) {

      // If not cloning, disable adaptive binary indices for the duration of the batch update,
      // followed by lazy rebuild and re-enabling adaptive indices after batch update.
      const adaptiveBatchOverride = !this.cloneObjects && this.adaptiveBinaryIndices
        && Object.keys(this.binaryIndices).length > 0;
      if (adaptiveBatchOverride) {
        this.adaptiveBinaryIndices = false;
      }

      for (let i = 0; i < doc.length; i++) {
        this.update(doc[i]);
      }

      if (adaptiveBatchOverride) {
        this.ensureAllIndexes();
        this.adaptiveBinaryIndices = true;
      }

      return;
    }
    // Verify object is a properly formed document.
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
      let newInternal = this._defineNestedProperties(this.cloneObjects || !this.disableDeltaChangesApi ? clone(doc, this.cloneMethod) : doc);

      this.emit("pre-update", doc);

      Object.keys(this.constraints.unique).forEach((key) => {
        this.constraints.unique[key].update(newInternal, position);
      });

      // operate the update
      this._data[position] = newInternal;

      // now that we can efficiently determine the data[] position of newly added document,
      // submit it for all registered DynamicViews to evaluate for inclusion/exclusion
      for (let idx = 0; idx < this._dynamicViews.length; idx++) {
        this._dynamicViews[idx]._evaluateDocument(position, false);
      }

      if (this.adaptiveBinaryIndices) {
        // for each binary index defined in collection, immediately update rather than flag for lazy rebuild
        const bIndices = this.binaryIndices;
        for (const key in bIndices) {
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
  private _add(obj: TData & TNested) {
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
        this.maxId = (this._data[this._data.length - 1].$loki + 1);
      }

      const newDoc = obj as Doc<TData & TNested>;
      newDoc.$loki = this.maxId;
      if (!this.disableMeta) {
        newDoc.meta.version = 0;
      }

      const constrUnique = this.constraints.unique;
      for (const key in constrUnique) {
        if (constrUnique[key] !== undefined) {
          constrUnique[key].set(newDoc, this._data.length);
        }
      }

      // add new obj id to idIndex
      this.idIndex.push(newDoc.$loki);

      // add the object
      this._data.push(newDoc);

      const addedPos = this._data.length - 1;

      // now that we can efficiently determine the data[] position of newly added document,
      // submit it for all registered DynamicViews to evaluate for inclusion/exclusion
      const dvlen = this._dynamicViews.length;
      for (let i = 0; i < dvlen; i++) {
        this._dynamicViews[i]._evaluateDocument(addedPos, true);
      }

      if (this.adaptiveBinaryIndices) {
        // for each binary index defined in collection, immediately update rather than flag for lazy rebuild
        for (const key in this.binaryIndices) {
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
   * @param {function} filterFunction - the filter function
   * @param {function} updateFunction - the update function
   */
  updateWhere(filterFunction: (obj: Doc<TData & TNested>) => boolean, updateFunction: (obj: Doc<TData & TNested>) => Doc<TData & TNested>) {
    const results = this.where(filterFunction);
    try {
      for (let i = 0; i < results.length; i++) {
        this.update(updateFunction(results[i]));
      }
    } catch (err) {
      this.rollback();
      this.console.error(err.message);
    }
  }

  /**
   * Remove all documents matching supplied filter function.
   * @param {function} filterFunction - the filter function
   */
  public removeWhere(filterFunction: (obj: Doc<TData & TNested>) => boolean) {
    this.remove(this._data.filter(filterFunction));
  }

  public removeDataOnly() {
    this.remove(this._data.slice());
  }

  /**
   * Remove a document from the collection
   * @param {number|object} doc - document to remove from collection
   */
  remove(doc: number | Doc<TData & TNested> | Doc<TData & TNested>[]): void {
    if (typeof doc === "number") {
      doc = this.get(doc);
    }

    if (Array.isArray(doc)) {
      let k = 0;
      const len = doc.length;
      for (k; k < len; k++) {
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
        if (doc[key] !== null && doc[key] !== undefined) {
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
        for (const key in this.binaryIndices) {
          this.adaptiveBinaryIndexRemove(position, key);
        }
      } else {
        this.flagBinaryIndexesDirty();
      }

      this._data.splice(position, 1);

      // remove id from idIndex
      this.idIndex.splice(position, 1);

      // FullTextSearch.
      if (this._fullTextSearch !== null) {
        this._fullTextSearch.removeDocument(doc, position);
      }

      this.commit();
      this.dirty = true; // for autosave scenarios
      this.emit("delete", arr[0]);
      delete doc.$loki;
      delete doc.meta;
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
   * @returns {Collection.Change[]}
   */
  public getChanges(): Collection.Change[] {
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

  private _getObjectDelta(oldObject: Doc<TData>, newObject: Doc<TData>) {
    const propertyNames = newObject !== null && typeof newObject === "object" ? Object.keys(newObject) : null;
    if (propertyNames && propertyNames.length && ["string", "boolean", "number"].indexOf(typeof(newObject)) < 0) {
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
  private _getChangeDelta(obj: Doc<TData>, old: Doc<TData>) {
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
  private _createChange(name: string, op: string, obj: Doc<TData>, old?: Doc<TData>) {
    this.changes.push({
      name,
      operation: op,
      obj: op === "U" && !this.disableDeltaChangesApi ? this._getChangeDelta(obj, old) : JSON.parse(JSON.stringify(obj))
    });
  }

  private _createInsertChange(obj: Doc<TData>) {
    this._createChange(this.name, "I", obj);
  }

  /**
   * If the changes API is disabled make sure only metadata is added without re-evaluating everytime if the changesApi is enabled
   */
  private _insertMeta(obj: Doc<TData>) {
    let len;
    let idx;

    if (this.disableMeta || !obj) {
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
      obj.meta = {
        version: 0,
        revision: 0,
        created: 0
      };
    }

    obj.meta.created = (new Date()).getTime();
    obj.meta.revision = 0;
  }

  private _updateMeta(obj: Doc<TData>) {
    if (this.disableMeta || !obj) {
      return;
    }
    obj.meta.updated = (new Date()).getTime();
    obj.meta.revision += 1;
  }


  private _createUpdateChange(obj: Doc<TData>, old: Doc<TData>) {
    this._createChange(this.name, "U", obj, old);
  }

  private _insertMetaWithChange(obj: Doc<TData>) {
    this._insertMeta(obj);
    this._createInsertChange(obj);
  }

  private _updateMetaWithChange(obj: Doc<TData>, old: Doc<TData>) {
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
  public get(id: number): Doc<TData & TNested>;
  public get(id: number, returnPosition: boolean): Doc<TData & TNested> | [Doc<TData & TNested>, number];
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
        return [this._data[min], min];
      }
      return this._data[min];
    }
    return null;
  }

  /**
   * Perform binary range lookup for the data[dataPosition][binaryIndexName] property value
   *    Since multiple documents may contain the same value (which the index is sorted on),
   *    we hone in on range and then linear scan range to find exact index array position.
   * @param {int} dataPosition : data array index/position
   * @param {string} binaryIndexName : index to search for dataPosition in
   */
  public getBinaryIndexPosition(dataPosition: number, binaryIndexName: keyof (TData & TNested)) {
    const val = this._data[dataPosition][binaryIndexName];
    const index = this.binaryIndices[binaryIndexName].values;

    // i think calculateRange can probably be moved to collection
    // as it doesn't seem to need ResultSet.  need to verify
    //let rs = new ResultSet(this, null, null);
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
  public adaptiveBinaryIndexInsert(dataPosition: number, binaryIndexName: keyof (TData & TNested)) {
    const index = this.binaryIndices[binaryIndexName].values;
    let val: any = this._data[dataPosition][binaryIndexName];

    // If you are inserting a javascript Date value into a binary index, convert to epoch time
    if (this.serializableIndices === true && val instanceof Date) {
      this._data[dataPosition][binaryIndexName] = val.getTime() as any;
      val = this._data[dataPosition][binaryIndexName];
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
  public adaptiveBinaryIndexUpdate(dataPosition: number, binaryIndexName: keyof (TData & TNested)) {
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
   * @param {number} dataPosition : coll.data array index/position
   * @param {string} binaryIndexName : index to search for dataPosition in
   * @param {boolean} removedFromIndexOnly - remove from index only
   */
  public adaptiveBinaryIndexRemove(dataPosition: number, binaryIndexName: keyof (TData & TNested), removedFromIndexOnly = false): void {
    const idxPos = this.getBinaryIndexPosition(dataPosition, binaryIndexName);
    if (idxPos === null) {
      return;
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
    const index = this.binaryIndices[binaryIndexName].values;
    for (let idx = 0; idx < index.length; idx++) {
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
  private _calculateRangeStart(prop: keyof (TData & TNested), val: any, adaptive = false): number {
    const rcd = this._data;
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
  private _calculateRangeEnd(prop: keyof (TData & TNested), val: any) {
    const rcd = this._data;
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
   *    this is used for collection.find() and first find filter of ResultSet/dynview
   *    slightly different than get() binary search in that get() hones in on 1 value,
   *    but we have to hone in on many (range)
   * @param {string} op - operation, such as $eq
   * @param {string} prop - name of property to calculate range for
   * @param {object} val - value to use for range calculation.
   * @returns {array} [start, end] index array positions
   */
  public calculateRange(op: string, prop: keyof (TData & TNested), val: any): [number, number] {
    const rcd = this._data;
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
        if (!aeqHelper(lval, val)) {
          return [0, -1];
        }
        return [lbound, ubound];

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
  public by(field: keyof (TData & TNested), value: any): Doc<TData & TNested> {
    return this.findOne({[field]: value} as any);
  }

  /**
   * Find one object by index property, by property equal to value
   * @param {object} query - query object used to perform search with
   * @returns {(object|null)} First matching document, or null if none
   */
  public findOne(query: ResultSet.Query<Doc<TData & TNested>>): Doc<TData & TNested> {
    query = query || {};

    // Instantiate ResultSet and exec find op passing firstOnly = true param
    const result = this.chain().find(query, true).data();

    if (Array.isArray(result) && result.length === 0) {
      return null;
    } else {
      if (!this.cloneObjects) {
        return result[0] as any as Doc<TData & TNested>;
      } else {
        return clone(result[0], this.cloneMethod) as any as Doc<TData & TNested>;
      }
    }
  }

  /**
   * Chain method, used for beginning a series of chained find() and/or view() operations
   * on a collection.
   *
   * @param {array} transform - Ordered array of transform step objects similar to chain
   * @param {object} parameters - Object containing properties representing parameters to substitute
   * @returns {ResultSet} (this) ResultSet, or data array if any map or join functions where called
   */
  public chain(transform?: string | Collection.Transform<TData, TNested>[], parameters?: object): ResultSet<TData, TNested> {
    const rs = new ResultSet<TData, TNested>(this);
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
  public find(query?: ResultSet.Query<Doc<TData & TNested>>): Doc<TData & TNested>[] {
    return this.chain().find(query).data();
  }

  /**
   * Find object by unindexed field by property equal to value,
   * simply iterates and returns the first element matching the query
   */
  public findOneUnindexed(prop: string, value: any) {
    let i = this._data.length;
    let doc;
    while (i--) {
      if (this._data[i][prop] === value) {
        doc = this._data[i];
        return doc;
      }
    }
    return null;
  }

  /**
   * Transaction methods
   */

  /**
   * start the transation
   */
  public startTransaction(): void {
    if (this.transactional) {
      this._cached = {
        index: this.idIndex,
        data: clone(this._data, this.cloneMethod),
        binaryIndex: this.binaryIndices,
      };

      // propagate startTransaction to dynamic views
      for (let idx = 0; idx < this._dynamicViews.length; idx++) {
        this._dynamicViews[idx].startTransaction();
      }
    }
  }

  /**
   * Commit the transaction.
   */
  public commit(): void {
    if (this.transactional) {
      this._cached = null;

      // propagate commit to dynamic views
      for (let idx = 0; idx < this._dynamicViews.length; idx++) {
        this._dynamicViews[idx].commit();
      }
    }
  }

  /**
   * Rollback the transaction.
   */
  public rollback(): void {
    if (this.transactional) {
      if (this._cached !== null) {
        this.idIndex = this._cached.index;
        this._data = this._defineNestedProperties(this._cached.data);
        this.binaryIndices = this._cached.binaryIndex;

        // propagate rollback to dynamic views
        for (let idx = 0; idx < this._dynamicViews.length; idx++) {
          this._dynamicViews[idx].rollback();
        }
      }
    }
  }

  /**
   * Query the collection by supplying a javascript filter function.
   * @example
   * let results = coll.where(function(obj) {
	 *   return obj.legs === 8;
	 * });
   * @param {function} fun - filter function to run against all collection docs
   * @returns {array} all documents which pass your filter function
   */
  public where(fun: (obj: Doc<TData & TNested>) => boolean): Doc<TData & TNested>[] {
    return this.chain().where(fun).data();
  }

  /**
   * Map Reduce operation
   * @param {function} mapFunction - function to use as map function
   * @param {function} reduceFunction - function to use as reduce function
   * @returns {data} The result of your mapReduce operation
   */
  public mapReduce<T, U>(mapFunction: (value: Doc<TData & TNested>, index: number, array: Doc<TData & TNested>[]) => T, reduceFunction: (array: T[]) => U): U {
    return reduceFunction(this._data.map(mapFunction));
  }

  /**
   * Join two collections on specified properties
   * @param {array} joinData - array of documents to 'join' to this collection
   * @param {string} leftJoinProp - property name in collection
   * @param {string} rightJoinProp - property name in joinData
   * @param {function} mapFun - (Optional) map function to use
   * @param dataOptions - options to data() before input to your map function
   * @param [dataOptions.removeMeta] - allows removing meta before calling mapFun
   * @param [dataOptions.forceClones] - forcing the return of cloned objects to your map object
   * @param [dataOptions.forceCloneMethod] - allows overriding the default or collection specified cloning method
   * @returns {ResultSet} Result of the mapping operation
   */
  public eqJoin(joinData: Collection<any> | ResultSet<any> | any[], leftJoinProp: string | ((obj: any) => string),
                rightJoinProp: string | ((obj: any) => string), mapFun?: (left: any, right: any) => any,
                dataOptions?: ResultSet.DataOptions): ResultSet<any> {
    return new ResultSet(this).eqJoin(joinData, leftJoinProp, rightJoinProp, mapFun, dataOptions);
  }

  /* ------ STAGING API -------- */

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
  public stage<F extends TData>(stageName: string, obj: Doc<F>): F {
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
  public commitStage(stageName: string, message: string) {
    const stage = this.getStage(stageName);
    const timestamp = new Date().getTime();

    for (const prop in stage) {
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
   * Returns all values of a field.
   * @param {string} field - the field name
   * @return {any}: the array of values
   */
  public extract(field: keyof (TData & TNested)): any[] {
    const result = [];
    for (let i = 0; i < this._data.length; i++) {
      result.push(this._data[i][field]);
    }
    return result;
  }

  /**
   * Finds the minimum value of a field.
   * @param {string} field - the field name
   * @return {number} the minimum value
   */
  public min(field: keyof (TData & TNested)): number {
    return Math.min.apply(null, this.extractNumerical(field));
  }

  /**
   * Finds the maximum value of a field.
   * @param {string} field - the field name
   * @return {number} the maximum value
   */
  public max(field: keyof (TData & TNested)): number {
    return Math.max.apply(null, this.extractNumerical(field));
  }

  /**
   * Finds the minimum value and its index of a field.
   * @param {string} field - the field name
   * @return {object} - index and value
   */
  public minRecord(field: keyof (TData & TNested)) {
    const result = {
      index: 0,
      value: 0
    };

    if (this._data.length === 0) {
      result.index = null;
      result.value = null;
      return result;
    }

    result.index = this._data[0].$loki;
    result.value = parseFloat(this._data[0][field] as any);
    for (let i = 1; i < this._data.length; i++) {
      const val = parseFloat(this._data[i][field] as any);
      if (result.value > val) {
        result.value = val;
        result.index = this._data[i].$loki;
      }
    }
    return result;
  }

  /**
   * Finds the maximum value and its index of a field.
   * @param {string} field - the field name
   * @return {object} - index and value
   */
  public maxRecord(field: keyof (TData & TNested)) {
    const result = {
      index: 0,
      value: 0
    };

    if (this._data.length === 0) {
      result.index = null;
      result.value = null;
      return result;
    }

    result.index = this._data[0].$loki;
    result.value = parseFloat(this._data[0][field] as any);
    for (let i = 1; i < this._data.length; i++) {
      const val = parseFloat(this._data[i][field] as any);
      if (result.value < val) {
        result.value = val;
        result.index = this._data[i].$loki;
      }
    }
    return result;
  }

  /**
   * Returns all values of a field as numbers (if possible).
   * @param {string} field - the field name
   * @return {number[]} - the number array
   */
  public extractNumerical(field: keyof (TData & TNested)) {
    return this.extract(field).map(parseFloat).filter(Number).filter((n) => !(isNaN(n)));
  }

  /**
   * Calculates the average numerical value of a field
   * @param {string} field - the field name
   * @returns {number} average of property in all docs in the collection
   */
  public avg(field: keyof (TData & TNested)): number {
    return average(this.extractNumerical(field));
  }

  /**
   * Calculate the standard deviation of a field.
   * @param {string} field - the field name
   * @return {number} the standard deviation
   */
  public stdDev(field: keyof (TData & TNested)): number {
    return standardDeviation(this.extractNumerical(field));
  }

  /**
   * Calculates the mode of a field.
   * @param {string} field - the field name
   * @return {number} the mode
   */
  public mode(field: keyof (TData & TNested)): number {
    const dict = {};
    const data = this.extractNumerical(field);

    let mode = data[0];
    let maxCount = -Infinity;
    for (let i = 0; i < data.length; i++) {
      const el = data[i];
      if (dict[el]) {
        dict[el]++;
      } else {
        dict[el] = 1;
      }
      if (dict[el] > maxCount) {
        mode = el;
        maxCount = dict[el];
      }
    }
    return mode;
  }

  /**
   * Calculates the median of a field.
   * @param {string} field - the field name
   * @return {number} the median
   */
  public median(field: keyof (TData & TNested)) {
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
  export interface Options<TData extends object, TNested extends object = {}> {
    unique?: (keyof (TData & TNested))[];
    indices?: (keyof (TData & TNested))[];
    adaptiveBinaryIndices?: boolean;
    asyncListeners?: boolean;
    disableMeta?: boolean;
    disableChangesApi?: boolean;
    disableDeltaChangesApi?: boolean;
    clone?: boolean;
    serializableIndices?: boolean;
    cloneMethod?: CloneMethod;
    transactional?: boolean;
    ttl?: number;
    ttlInterval?: number;
    nestedProperties?: (keyof TNested | { name: keyof TNested, path: string[] })[];
    fullTextSearch?: FullTextSearch.FieldOptions[];
  }

  export interface DeserializeOptions {
    retainDirtyFlags?: boolean;
    fullTextSearch?: Dict<Analyzer>;

    [collName: string]: any | { proto?: any; inflate?: (src: object, dest?: object) => void };
  }

  export interface BinaryIndex {
    dirty: boolean;
    values: any;
  }

  export interface Change {
    name: string;
    operation: string;
    obj: any;
  }

  export interface Serialized {
    name: string;
    _dynamicViews: DynamicView[];
    _nestedProperties: { name: string, path: string[] }[];
    uniqueNames: string[];
    transforms: Dict<Transform[]>;
    binaryIndices: Dict<Collection.BinaryIndex>;
    _data: Doc<any>[];
    idIndex: number[];
    maxId: number;
    dirty: boolean;
    adaptiveBinaryIndices: boolean;
    transactional: boolean;
    asyncListeners: boolean;
    disableMeta: boolean;
    disableChangesApi: boolean;
    disableDeltaChangesApi: boolean;
    cloneObjects: boolean;
    cloneMethod: CloneMethod;
    changes: any;
    _fullTextSearch: FullTextSearch;
  }

  export type Transform<TData extends object = object, TNested extends object = object> = {
    type: "find";
    value: ResultSet.Query<Doc<TData & TNested>> | string;
  } | {
    type: "where";
    value: ((obj: Doc<TData & TNested>) => boolean) | string;
  } | {
    type: "simplesort";
    property: keyof (TData & TNested);
    options?: boolean | ResultSet.SimpleSortOptions;
  } | {
    type: "compoundsort";
    value: (keyof (TData & TNested) | [keyof (TData & TNested), boolean])[];
  } | {
    type: "sort";
    value: (a: Doc<TData & TNested>, b: Doc<TData & TNested>) => number;
  } | {
    type: "sortByScoring";
    desc?: boolean;
  } | {
    type: "limit";
    value: number;
  } | {
    type: "offset";
    value: number;
  } | {
    type: "map";
    value: (obj: Doc<TData & TNested>, index: number, array: Doc<TData & TNested>[]) => any;
    dataOptions?: ResultSet.DataOptions;
  } | {
    type: "eqJoin";
    joinData: Collection<any> | ResultSet<any>;
    leftJoinKey: string | ((obj: any) => string);
    rightJoinKey: string | ((obj: any) => string);
    mapFun?: (left: any, right: any) => any;
    dataOptions?: ResultSet.DataOptions;
  } | {
    type: "mapReduce";
    mapFunction: (item: Doc<TData & TNested>, index: number, array: Doc<TData & TNested>[]) => any;
    reduceFunction: (array: any[]) => any;
  } | {
    type: "update";
    value: (obj: Doc<TData & TNested>) => any;
  } | {
    type: "remove";
  };

  export interface TTL {
    age: number;
    ttlInterval: number;
    daemon: any; // setInterval Timer
  }
}
