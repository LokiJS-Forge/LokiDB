import { LokiEventEmitter } from "./event_emitter";
import { UniqueIndex } from "./unique_index";
import { ResultSet } from "./result_set";
import { DynamicView } from "./dynamic_view";
import { IRangedIndex, ComparatorMap, RangedIndexFactoryMap } from "./helper";
import { clone, CloneMethod } from "./clone";
import { Doc, Dict } from "../../common/types";
import { FullTextSearch } from "../../full-text-search/src/full_text_search";
import { PLUGINS } from "../../common/plugin";
import { Analyzer } from "../../full-text-search/src/analyzer/analyzer";

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
export class Collection<TData extends object = object, TNested extends object = object, T extends TData & TNested = TData & TNested> extends LokiEventEmitter {
  // the name of the collection
  public name: string;
  // the data held by the collection
  public _data: Doc<T>[] = [];
  // index of id
  private _idIndex: number[] = [];
  // user defined indexes
  public _rangedIndexes: { [P in keyof T]?: Collection.RangedIndexMeta } = {};
  // loki obj map
  public _lokimap: { [$loki : number]: Doc<T> } = {};
  // default comparator name to use for unindexed sorting
  public _unindexedSortComparator: string = "js";
  // default LokiOperatorPackage ('default' uses fastest 'javascript' comparisons)
  public _defaultLokiOperatorPackage: string = "js";

  /**
   * Unique constraints contain duplicate object references, so they are not persisted.
   * We will keep track of properties which have unique constraints applied here, and regenerate on load.
   */
  public _constraints: {
    unique: {
      [P in keyof T]?: UniqueIndex;
    }
  } = {unique: {}};

  /**
   * Transforms will be used to store frequently used query chains as a series of steps which itself can be stored along
   * with the database.
   */
  public _transforms: Dict<Collection.Transform<T>[]> = {};

  /**
   * In autosave scenarios we will use collection level dirty flags to determine whether save is needed.
   * currently, if any collection is dirty we will autosave the whole database if autosave is configured.
   * Defaulting to true since this is called from addCollection and adding a collection should trigger save.
   */
  public _dirty: boolean = true;

  // private holder for cached data
  private _cached: {
    index: number[];
    data: Doc<T>[];
    rangedIndexes: { [name: string]: Collection.RangedIndexMeta };
  } = null;

  /**
   * Is collection transactional.
   */
  private _transactional: boolean;

  /**
   * Options to clone objects when inserting them.
   */
  public _cloneObjects: boolean;

  /**
   * Default clone method (if enabled) is parse-stringify.
   */
  public _cloneMethod: CloneMethod;

  /**
   * If set to true we will not maintain a meta property for a document.
   */
  private _disableMeta: boolean;

  /**
   * Disable track changes.
   */
  private _disableChangesApi: boolean;

  /**
   * Disable delta update object style on changes.
   */
  public _disableDeltaChangesApi: boolean;

  /**
   * By default, if you insert a document with a Date value for an indexed property, we will convert that value to number.
   */
  private _serializableIndexes: boolean;

  /**
   * Name of path of used nested properties.
   */
  private _nestedProperties: { name: keyof TNested, path: string[] }[] = [];

  /**
   * Option to activate a cleaner daemon - clears "aged" documents at set intervals.
   */
  public _ttl: Collection.TTL = {
    age: null,
    ttlInterval: null,
    daemon: null
  };

  // currentMaxId - change manually at your own peril!
  private _maxId: number = 0;
  private _dynamicViews: DynamicView<T>[] = [];

  /**
   * Changes are tracked by collection and aggregated by the db.
   */
  private _changes: Collection.Change[] = [];

  /**
   * stages: a map of uniquely identified 'stages', which hold copies of objects to be
   * manipulated without affecting the data in the original collection
   */
  private _stages: object = {};
  private _commitLog: { timestamp: number; message: string; data: any }[] = [];

  public _fullTextSearch: FullTextSearch;

  /**
   * @param {string} name - collection name
   * @param {(object)} [options={}] - a configuration object
   * @param {string[]} [options.unique=[]] - array of property names to define unique constraints for
   * @param {string[]} [options.exact=[]] - array of property names to define exact constraints for
   * @param {RangedIndexOptions} [options.rangedIndexes] - configuration object for ranged indexes
   * @param {boolean} [options.asyncListeners=false] - whether listeners are invoked asynchronously
   * @param {boolean} [options.disableMeta=false] - set to true to disable meta property on documents
   * @param {boolean} [options.disableChangesApi=true] - set to false to enable Changes API
   * @param {boolean} [options.disableDeltaChangesApi=true] - set to false to enable Delta Changes API (requires Changes API, forces cloning)
   * @param {boolean} [options.clone=false] - specify whether inserts and queries clone to/from user
   * @param {boolean} [options.serializableIndexes=true] - converts date values on binary indexed property values are serializable
   * @param {string} [options.cloneMethod="deep"] - the clone method
   * @param {number} [options.transactional=false] - ?
   * @param {number} [options.ttl=] - age of document (in ms.) before document is considered aged/stale.
   * @param {number} [options.ttlInterval=] - time interval for clearing out 'aged' documents; not set by default
   * @param {string} [options.unindexedSortComparator="js"] "js", "abstract", "abstract-date", "loki" or other registered comparator name
   * @param {string} [options.defaultLokiOperatorPackage="js"] "js", "loki", "comparator" (or user defined) query ops package
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

    /* OPTIONS */
    this._unindexedSortComparator = options.unindexedSortComparator || "js";
    this._defaultLokiOperatorPackage = options.defaultLokiOperatorPackage || "js";

    // exact match and unique constraints
    if (options.unique !== undefined) {
      if (!Array.isArray(options.unique)) {
        options.unique = [options.unique];
      }
      options.unique.forEach((prop) => {
        this._constraints.unique[prop] = new UniqueIndex(prop as string);
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
    this._transactional = options.transactional !== undefined ? options.transactional : false;

    // .
    this._cloneObjects = options.clone !== undefined ? options.clone : false;

    // .
    this._asyncListeners = options.asyncListeners !== undefined ? options.asyncListeners : false;

    // .
    this._disableMeta = options.disableMeta !== undefined ? options.disableMeta : false;

    // .
    this._disableChangesApi = options.disableChangesApi !== undefined ? options.disableChangesApi : true;

    // .
    this._disableDeltaChangesApi = options.disableDeltaChangesApi !== undefined ? options.disableDeltaChangesApi : true;

    // .
    this._cloneMethod = options.cloneMethod !== undefined ? options.cloneMethod : "deep";
    if (this._disableChangesApi) {
      this._disableDeltaChangesApi = true;
    }

    // .
    this._serializableIndexes = options.serializableIndexes !== undefined ? options.serializableIndexes : true;

    // .
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

    this.setTTL(options.ttl || -1, options.ttlInterval);

    // events
    this._events = {
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

    // initialize the id index
    this._ensureId();
    let rangedIndexes: Collection.RangedIndexOptions = options.rangedIndexes || {};
    for (let ri in rangedIndexes) {
      // Todo: any way to type annotate this as typesafe generic?
      this.ensureRangedIndex(ri, rangedIndexes[ri].indexTypeName, rangedIndexes[ri].comparatorName);
    }

    this.setChangesApi(this._disableChangesApi, this._disableDeltaChangesApi);

    // for de-serialization purposes
    this.flushChanges();
  }

  toJSON(): Collection.Serialized {
    return {
      name: this.name,
      unindexedSortComparator: this._unindexedSortComparator,
      defaultLokiOperatorPackage: this._defaultLokiOperatorPackage,
      _dynamicViews: this._dynamicViews,
      uniqueNames: Object.keys(this._constraints.unique),
      transforms: this._transforms as any,
      rangedIndexes: this._rangedIndexes as any,
      _data: this._data,
      idIndex: this._idIndex,
      maxId: this._maxId,
      _dirty: this._dirty,
      _nestedProperties: this._nestedProperties,
      transactional: this._transactional,
      asyncListeners: this._asyncListeners,
      disableMeta: this._disableMeta,
      disableChangesApi: this._disableChangesApi,
      disableDeltaChangesApi: this._disableDeltaChangesApi,
      cloneObjects: this._cloneObjects,
      cloneMethod: this._cloneMethod,
      changes: this._changes,
      _fullTextSearch: this._fullTextSearch
    };
  }

  static fromJSONObject(obj: Collection.Serialized, options?: Collection.DeserializeOptions) {
    // instantiate collection with options needed by constructor
    let coll = new Collection<any>(obj.name, {
      disableChangesApi: obj.disableChangesApi,
      disableDeltaChangesApi: obj.disableDeltaChangesApi,
      unindexedSortComparator: obj.unindexedSortComparator,
      defaultLokiOperatorPackage: obj.defaultLokiOperatorPackage
    });

    coll._transactional = obj.transactional;
    coll._asyncListeners = obj.asyncListeners;
    coll._disableMeta = obj.disableMeta;
    coll._disableChangesApi = obj.disableChangesApi;
    coll._cloneObjects = obj.cloneObjects;
    coll._cloneMethod = obj.cloneMethod || "deep";
    coll._changes = obj.changes;
    coll._nestedProperties = obj._nestedProperties as any[];
    coll._rangedIndexes = obj.rangedIndexes || {};

    coll._dirty = (options && options.retainDirtyFlags === true) ? obj._dirty : false;

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
        // regenerate lokimap
        coll._lokimap[coll._data[j].$loki] = coll._data[j];
      }
    } else {
      for (let j = 0; j < obj._data.length; j++) {
        coll._data[j] = coll._defineNestedProperties(obj._data[j]);
        // regenerate lokimap
        coll._lokimap[coll._data[j].$loki] = coll._data[j];
      }
    }

    coll._maxId = (obj.maxId === undefined) ? 0 : obj.maxId;
    coll._idIndex = obj.idIndex;
    if (obj.transforms !== undefined) {
      coll._transforms = obj.transforms;
    }

    // inflate rangedindexes
    for (let ri in obj.rangedIndexes) {
      // shortcut reference to serialized meta
      let sri = obj.rangedIndexes[ri];
      // lookup index factory function in map based on index type name
      let rif = RangedIndexFactoryMap[sri.indexTypeName];
      // lookup comparator function in map based on comparator name
      let ricmp = ComparatorMap[sri.comparatorName];
      // using index type (from meta), index factory and comparator... create instance of ranged index
      let rii = rif(ri, ricmp);
      // now ask new index instance to inflate from plain object
      rii.restore(sri.index);
      // attach class instance to our collection's ranged index's (index) instance property
      coll._rangedIndexes[ri].index = rii;
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
  public addTransform(name: string, transform: Collection.Transform<T>[]): void {
    if (this._transforms[name] !== undefined) {
      throw new Error("a transform by that name already exists");
    }
    this._transforms[name] = transform;
  }

  /**
   * Retrieves a named transform from the collection.
   * @param {string} name - name of the transform to lookup.
   */
  public getTransform(name: string): Collection.Transform<T>[] {
    return this._transforms[name];
  }

  /**
   * Updates a named collection transform to the collection
   * @param {string} name - name to associate with transform
   * @param {object} transform - a transformation object to save into collection
   */
  public setTransform(name: string, transform: Collection.Transform<T>[]): void {
    this._transforms[name] = transform;
  }

  /**
   * Removes a named collection transform from the collection
   * @param {string} name - name of collection transform to remove
   */
  public removeTransform(name: string): void {
    delete this._transforms[name];
  }

  /*----------------------------+
   | TTL                        |
   +----------------------------*/
  private setTTL(age: number, interval: number): void {
    if (age < 0) {
      clearInterval(this._ttl.daemon);
    } else {
      this._ttl.age = age;
      this._ttl.ttlInterval = interval;
      this._ttl.daemon = setInterval(() => {
        const now = Date.now();
        const toRemove = this.chain().where((member: Doc<T>) => {
          const timestamp = member.meta.updated || member.meta.created;
          const diff = now - timestamp;
          return this._ttl.age < diff;
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
   * Ensure rangedIndex of a field.
   * @param field
   * @param indexTypeName
   * @param comparatorName
   */
  public ensureIndex(field: string, indexTypeName?: string, comparatorName?: string) {
    this.ensureRangedIndex(field, indexTypeName, comparatorName);
  }

  /**
   * Ensure rangedIndex of a field.
   * @param field Property to create an index on (need to look into contraining on keyof T)
   * @param indexTypeName Name of IndexType factory within (global?) hashmap to create IRangedIndex from
   * @param comparatorName Name of Comparator within (global?) hashmap
   */
  public ensureRangedIndex(field: string, indexTypeName?: string, comparatorName?: string) {
    indexTypeName = indexTypeName || "avl";
    comparatorName = comparatorName || "loki";

    if (!RangedIndexFactoryMap[indexTypeName]) {
      throw new Error("ensureRangedIndex: Unknown range index type");
    }

    if (!ComparatorMap[comparatorName]) {
      throw new Error("ensureRangedIndex: Unknown comparator");
    }

    let rif = RangedIndexFactoryMap[indexTypeName];
    let comparator = ComparatorMap[comparatorName];

    this._rangedIndexes[field] = {
      index: rif(field, comparator),
      indexTypeName: indexTypeName,
      comparatorName: comparatorName
    };

    let rii = this._rangedIndexes[field].index;

    for (let i = 0; i < this._data.length; i++) {
      rii.insert(this._data[i].$loki, this._data[i][field]);
    }
  }

  public ensureUniqueIndex(field: keyof T) {
    let index = new UniqueIndex(field as string);

    // if index already existed, (re)loading it will likely cause collisions, rebuild always
    this._constraints.unique[field] = index;
    for (let i = 0; i < this._data.length; i++) {
      index.set(this._data[i].$loki, this._data[i][field]);
    }
    return index;
  }

  /**
   * Quickly determine number of documents in collection (or query)
   * @param {object} query - (optional) query object to count results of
   * @returns {number} number of documents in the collection
   */
  public count(query?: ResultSet.Query<Doc<T>>): number {
    if (!query) {
      return this._data.length;
    }
    return this.chain().find(query)._filteredRows.length;
  }

  /**
   * Rebuild idIndex
   */
  private _ensureId(): void {
    this._idIndex = [];
    for (let i = 0; i < this._data.length; i++) {
      this._idIndex.push(this._data[i].$loki);
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
  public addDynamicView(name: string, options?: DynamicView.Options): DynamicView<T> {
    const dv = new DynamicView<T>(this as any as Collection<T>, name, options);
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
  public getDynamicView(name: string): DynamicView<T> {
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
  public findAndUpdate(filterObject: ResultSet.Query<Doc<T>>, updateFunction: (obj: Doc<T>) => any) {
    this.chain().find(filterObject).update(updateFunction);
  }

  /**
   * Applies a 'mongo-like' find query object removes all documents which match that filter.
   * @param {object} filterObject - 'mongo-like' query object
   */
  public findAndRemove(filterObject: ResultSet.Query<Doc<T>>) {
    this.chain().find(filterObject).remove();
  }

  /**
   * Adds object(s) to collection, ensure object(s) have meta properties, clone it if necessary, etc.
   * @param {(object|array)} doc - the document (or array of documents) to be inserted
   * @returns {(object|array)} document or documents inserted
   */
  public insert(doc: TData): Doc<T>;
  public insert(doc: TData[]): Doc<T>[];
  public insert(doc: TData | TData[]): Doc<T> | Doc<T>[] {
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
    results = this._cloneObjects ? clone(results, this._cloneMethod) : results;

    return results.length === 1 ? results[0] : results;
  }

  /**
   * Adds a single object, ensures it has meta properties, clone it if necessary, etc.
   * @param {object} doc - the document to be inserted
   * @param {boolean} bulkInsert - quiet pre-insert and insert event emits
   * @returns {object} document or 'undefined' if there was a problem inserting it
   */
  public insertOne(doc: TData, bulkInsert = false): Doc<T> {
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
    const obj = this._defineNestedProperties(this._cloneObjects ? clone(doc, this._cloneMethod) : doc) as T;

    if (!this._disableMeta && (obj as Doc<TData>).meta === undefined) {
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

    // update meta and store changes if ChangesAPI is enabled
    // (moved from "insert" event listener to allow internal reference to be used)
    if (this._disableChangesApi) {
      this._insertMeta(obj as Doc<TData>);
    } else {
      this._insertMetaWithChange(obj as Doc<TData>);
    }

    // if cloning is enabled, emit insert event with clone of new object
    returnObj = this._cloneObjects ? clone(obj, this._cloneMethod) : obj;
    if (!bulkInsert) {
      this.emit("insert", returnObj);
    }

    return returnObj as Doc<T>;
  }

  /**
   * Refers nested properties of an object to the root of it.
   * @param {T} data - the object
   * @returns {T & TNested} the object with nested properties
   * @hidden
   */
  _defineNestedProperties<U extends TData>(data: U): U & TNested {
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
    return data as U & TNested;
  }

  /**
   * Empties the collection.
   * @param {boolean} [removeIndices=false] - remove indices
   */
  public clear({removeIndices: removeIndices = false} = {}) {
    this._data = [];
    this._idIndex = [];
    this._cached = null;
    this._maxId = 0;
    this._dynamicViews = [];
    this._dirty = true;

    // if removing indices entirely
    if (removeIndices === true) {
      this._rangedIndexes = {};

      this._constraints = {
        unique: {}
      };
    }
    // clear indices but leave definitions in place
    else {
      // re-instance ranged indexes
      for (let ri in this._rangedIndexes) {
        this.ensureRangedIndex(ri, this._rangedIndexes[ri].indexTypeName, this._rangedIndexes[ri].comparatorName);
      }

      // clear entire unique indices definition
      const uniqueNames = Object.keys(this._constraints.unique);
      for (let i = 0; i < uniqueNames.length; i++) {
        this._constraints.unique[uniqueNames[i]].clear();
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
  public update(doc: Doc<T> | Doc<T>[]): void {
    if (Array.isArray(doc)) {

      for (let i = 0; i < doc.length; i++) {
        this.update(doc[i]);
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
      let newInternal = this._defineNestedProperties(this._cloneObjects || !this._disableDeltaChangesApi ? clone(doc, this._cloneMethod) : doc);

      this.emit("pre-update", doc);

      Object.keys(this._constraints.unique).forEach((key) => {
        this._constraints.unique[key].update(newInternal.$loki, newInternal[key]);
      });

      // operate the update
      this._data[position] = newInternal;
      this._lokimap[doc.$loki] = newInternal;

      // now that we can efficiently determine the data[] position of newly added document,
      // submit it for all registered DynamicViews to evaluate for inclusion/exclusion
      for (let idx = 0; idx < this._dynamicViews.length; idx++) {
        this._dynamicViews[idx]._evaluateDocument(position, false);
      }

      // Notify all ranged indexes of (possible) value update
      for (let ri in this._rangedIndexes) {
        this._rangedIndexes[ri].index.update(doc.$loki, doc[ri]);
      }

      this._idIndex[position] = newInternal.$loki;

      // FullTextSearch.
      if (this._fullTextSearch !== null) {
        this._fullTextSearch.updateDocument(doc, position);
      }

      this.commit();
      this._dirty = true; // for autosave scenarios

      // update meta and store changes if ChangesAPI is enabled
      if (this._disableChangesApi) {
        this._updateMeta(newInternal);
      }
      else {
        this._updateMetaWithChange(newInternal, oldInternal);
      }

      let returnObj = newInternal;
      // if cloning is enabled, emit 'update' event and return with clone of new object
      if (this._cloneObjects) {
        returnObj = clone(newInternal, this._cloneMethod);
      }

      this.emit("update", returnObj, oldInternal);
    } catch (err) {
      this.rollback();
      this.emit("error", err);
      throw (err); // re-throw error so user does not think it succeeded
    }
  }

  /**
   * Add object to collection
   */
  private _add(obj: T) {
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
      this._maxId++;

      if (isNaN(this._maxId)) {
        this._maxId = (this._data[this._data.length - 1].$loki + 1);
      }

      const newDoc = obj as Doc<T>;
      newDoc.$loki = this._maxId;
      if (!this._disableMeta) {
        newDoc.meta.version = 0;
      }

      const constrUnique = this._constraints.unique;
      for (const key in constrUnique) {
        if (constrUnique[key] !== undefined) {
          constrUnique[key].set(newDoc.$loki, newDoc[key]);
        }
      }

      // add new obj id to idIndex
      this._idIndex.push(newDoc.$loki);
      // update lokimap
      this._lokimap[newDoc.$loki] = newDoc;

      // add the object
      this._data.push(newDoc);

      const addedPos = this._data.length - 1;

      // now that we can efficiently determine the data[] position of newly added document,
      // submit it for all registered DynamicViews to evaluate for inclusion/exclusion
      const dvlen = this._dynamicViews.length;
      for (let i = 0; i < dvlen; i++) {
        this._dynamicViews[i]._evaluateDocument(addedPos, true);
      }

      // add id/val kvp to ranged index
      for (let ri in this._rangedIndexes) {
        // ensure Dates are converted to unix epoch time if serializableIndexes is true
        if (this._serializableIndexes && newDoc[ri] instanceof Date) {
          newDoc[ri] = newDoc[ri].getTime();
        }
        this._rangedIndexes[ri].index.insert(obj["$loki"], obj[ri]);
      }

      // FullTextSearch.
      if (this._fullTextSearch !== null) {
        this._fullTextSearch.addDocument(newDoc, addedPos);
      }

      this.commit();
      this._dirty = true; // for autosave scenarios

      return (this._cloneObjects) ? (clone(newDoc, this._cloneMethod)) : (newDoc);
    } catch (err) {
      this.rollback();
      this.emit("error", err);
      throw (err); // re-throw error so user does not think it succeeded
    }
  }

  /**
   * Applies a filter function and passes all results to an update function.
   * @param {function} filterFunction - the filter function
   * @param {function} updateFunction - the update function
   */
  updateWhere(filterFunction: (obj: Doc<T>) => boolean, updateFunction: (obj: Doc<T>) => Doc<T>) {
    const results = this.where(filterFunction);
    try {
      for (let i = 0; i < results.length; i++) {
        this.update(updateFunction(results[i]));
      }
    } catch (err) {
      this.rollback();
      throw err;
    }
  }

  /**
   * Remove all documents matching supplied filter function.
   * @param {function} filterFunction - the filter function
   */
  public removeWhere(filterFunction: (obj: Doc<T>) => boolean) {
    this.remove(this._data.filter(filterFunction));
  }

  public removeDataOnly() {
    this.remove(this._data.slice());
  }

  /**
   * Remove a document from the collection
   * @param {number|object} doc - document to remove from collection
   */
  remove(doc: number | Doc<T> | Doc<T>[]): void {
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

      // already converted but let's narrow to make typescript happy
      let aDoc : Doc<T> = (typeof doc === "number") ? this.get(doc) : doc;
      Object.keys(this._constraints.unique).forEach((key) => {
        if (key in aDoc) {
          this._constraints.unique[key].remove(aDoc.$loki);
        }
      });
      // now that we can efficiently determine the data[] position of newly added document,
      // submit it for all registered DynamicViews to remove
      for (let idx = 0; idx < this._dynamicViews.length; idx++) {
        this._dynamicViews[idx]._removeDocument(position);
      }

      this._data.splice(position, 1);

      // remove id from idIndex
      this._idIndex.splice(position, 1);
      // remove from lokimap
      delete this._lokimap[doc.$loki];

      // remove id/val kvp from binary tree index
      for (let ri in this._rangedIndexes) {
        this._rangedIndexes[ri].index.remove(doc.$loki);
      }

      // FullTextSearch.
      if (this._fullTextSearch !== null) {
        this._fullTextSearch.removeDocument(doc, position);
      }

      this.commit();
      this._dirty = true; // for autosave scenarios

      if (!this._disableChangesApi) {
        this._createChange(this.name, "R", arr[0]);
      }

      this.emit("delete", arr[0]);
      delete doc.$loki;
      delete doc.meta;
    } catch (err) {
      this.rollback();
      this.emit("error", err);
      throw err;
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
    return this._changes;
  }

  /**
   * Enables/disables changes api.
   * @param {boolean} disableChangesApi
   * @param {boolean} disableDeltaChangesApi
   */
  public setChangesApi(disableChangesApi: boolean, disableDeltaChangesApi: boolean = true) {
    this._disableChangesApi = disableChangesApi;
    this._disableDeltaChangesApi = disableChangesApi ? true : disableDeltaChangesApi;
  }

  /**
   * Clears all the changes.
   */
  public flushChanges() {
    this._changes = [];
  }

  private _getObjectDelta(oldObject: Doc<TData>, newObject: Doc<TData>) {
    const propertyNames = newObject !== null && typeof newObject === "object" ? Object.keys(newObject) : null;
    if (propertyNames && propertyNames.length && ["string", "boolean", "number"].indexOf(typeof(newObject)) < 0) {
      const delta = {};
      for (let i = 0; i < propertyNames.length; i++) {
        const propertyName = propertyNames[i];
        if (newObject.hasOwnProperty(propertyName)) {
          if (!oldObject.hasOwnProperty(propertyName) || this._constraints.unique[propertyName] !== undefined
            || propertyName === "$loki" || propertyName === "meta") {
            delta[propertyName] = newObject[propertyName];
          } else {
            const propertyDelta = this._getObjectDelta(oldObject[propertyName], newObject[propertyName]);
            if (propertyDelta !== undefined && propertyDelta !== {}) {
              delta[propertyName] = propertyDelta;
            }
          }
        }
      }
      return Object.keys(delta).length === 0 ? undefined : delta;
    } else {
      return oldObject === newObject ? undefined : newObject;
    }
  }

  /**
   * Compare changed object (which is a forced clone) with existing object and return the delta
   */
  private _getChangeDelta(obj: Doc<TData>, old: Doc<TData>) {
    if (old) {
      return this._getObjectDelta(old, obj);
    } else {
      return JSON.parse(JSON.stringify(obj));
    }
  }

  /**
   * Creates a clone of the current status of an object and associates operation and collection name,
   * so the parent db can aggregate and generate a changes object for the entire db
   */
  private _createChange(name: string, op: string, obj: Doc<TData>, old?: Doc<TData>) {
    this._changes.push({
      name,
      operation: op,
      obj: op === "U" && !this._disableDeltaChangesApi
        ? this._getChangeDelta(obj, old)
        : JSON.parse(JSON.stringify(obj))
    });
  }

  private _createInsertChange(obj: Doc<TData>) {
    this._createChange(this.name, "I", obj);
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

  private _insertMeta(obj: Doc<TData>) {
    if (this._disableMeta) {
      return;
    }

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
    if (this._disableMeta) {
      return;
    }

    obj.meta.updated = (new Date()).getTime();
    obj.meta.revision += 1;
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
  public get(id: number): Doc<T>;
  public get(id: number, returnPosition: boolean): Doc<T> | [Doc<T>, number];
  public get(id: number, returnPosition = false) {
    if (!returnPosition) {
      let doc = this._lokimap[id];

      if (doc === undefined) return null;

      return doc;
    }
    const data = this._idIndex;
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
   * Retrieve doc by Unique index
   * @param {string} field - name of uniquely indexed property to use when doing lookup
   * @param {any} value - unique value to search for
   * @returns {object} document matching the value passed
   */
  public by(field: keyof T, value: any): Doc<T> {
    // for least amount of overhead, we will directly
    // access index rather than use find codepath
    let lokiId = this._constraints.unique[field].get(value);

    if (!this._cloneObjects) {
      return this._lokimap[lokiId];
    } else {
      return clone(this._lokimap[lokiId], this._cloneMethod);
    }
  }

  /**
   * Find one object by index property, by property equal to value
   * @param {object} query - query object used to perform search with
   * @returns {(object|null)} First matching document, or null if none
   */
  public findOne(query: ResultSet.Query<Doc<T>>): Doc<T> {
    query = query || {};

    // Instantiate ResultSet and exec find op passing firstOnly = true param
    const result = this.chain().find(query, true).data();

    if (Array.isArray(result) && result.length === 0) {
      return null;
    } else {
      if (!this._cloneObjects) {
        return result[0];
      } else {
        return clone(result[0], this._cloneMethod);
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
  public chain(transform?: string | Collection.Transform<T>[], parameters?: object): ResultSet<T> {
    const rs = new ResultSet<T>(this as any as Collection<T>);
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
  public find(query?: ResultSet.Query<Doc<T>>): Doc<T>[] {
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
    if (this._transactional) {
      // backup any ranged indexes
      let rib: { [name: string]: Collection.RangedIndexMeta } = {};
      for (let ri in this._rangedIndexes) {
        rib[ri].indexTypeName = this._rangedIndexes[ri].indexTypeName;
        rib[ri].comparatorName = this._rangedIndexes[ri].comparatorName;
        rib[ri].index = this._rangedIndexes[ri].index.backup();
      }

      this._cached = {
        index: this._idIndex,
        data: clone(this._data, this._cloneMethod),
        rangedIndexes: rib,
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
    if (this._transactional) {
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
    if (this._transactional) {
      if (this._cached !== null) {
        this._idIndex = this._cached.index;
        this._data = this._cached.data;
        for (let i = 0; i < this._data.length; i++) {
          this._data[i] = this._defineNestedProperties(this._data[i]);
        }

        // restore ranged indexes
        for (let ri in this._cached.rangedIndexes) {
          // shortcut reference to serialized meta
          let sri = this._cached.rangedIndexes[ri];
          // lookup index factory function in map based on index type name
          let rif = RangedIndexFactoryMap[sri.indexTypeName];
          // lookup comparator function in map based on comparator name
          let ricmp = ComparatorMap[sri.comparatorName];
          // using index type (from meta), index factory and comparator... create instance of ranged index
          let rii = rif(ri, ricmp);
          // now ask new index instance to inflate from plain object
          rii.restore(sri.index);
          // attach class instance to our collection's ranged index's (index) instance property
          this._rangedIndexes[ri].index = rii;
        }

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
  public where(fun: (obj: Doc<T>) => boolean): Doc<T>[] {
    return this.chain().where(fun).data();
  }

  /**
   * Map Reduce operation
   * @param {function} mapFunction - function to use as map function
   * @param {function} reduceFunction - function to use as reduce function
   * @returns {data} The result of your mapReduce operation
   */
  public mapReduce<U1, U2>(mapFunction: (value: Doc<T>, index: number, array: Doc<T>[]) => U1, reduceFunction: (array: U1[]) => U2): U2 {
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
    if (!this._stages[name]) {
      this._stages[name] = {};
    }
    return this._stages[name];
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
      this._commitLog.push({
        timestamp,
        message,
        data: JSON.parse(JSON.stringify(stage[prop]))
      });
    }
    this._stages[stageName] = {};
  }

  /**
   * Returns all values of a field.
   * @param {string} field - the field name
   * @return {any}: the array of values
   */
  public extract(field: keyof T): any[] {
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
  public min(field: keyof T): number {
    return Math.min.apply(null, this.extractNumerical(field));
  }

  /**
   * Finds the maximum value of a field.
   * @param {string} field - the field name
   * @return {number} the maximum value
   */
  public max(field: keyof T): number {
    return Math.max.apply(null, this.extractNumerical(field));
  }

  /**
   * Finds the minimum value and its index of a field.
   * @param {string} field - the field name
   * @return {object} - index and value
   */
  public minRecord(field: keyof T) {
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
  public maxRecord(field: keyof T) {
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
  public extractNumerical(field: keyof T) {
    return this.extract(field).map(parseFloat).filter(Number).filter((n) => !(isNaN(n)));
  }

  /**
   * Calculates the average numerical value of a field
   * @param {string} field - the field name
   * @returns {number} average of property in all docs in the collection
   */
  public avg(field: keyof T): number {
    return average(this.extractNumerical(field));
  }

  /**
   * Calculate the standard deviation of a field.
   * @param {string} field - the field name
   * @return {number} the standard deviation
   */
  public stdDev(field: keyof T): number {
    return standardDeviation(this.extractNumerical(field));
  }

  /**
   * Calculates the mode of a field.
   * @param {string} field - the field name
   * @return {number} the mode
   */
  public mode(field: keyof T): number {
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
  public median(field: keyof T) {
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
  export interface Options<TData extends object, TNested extends object = {}, T extends object = TData & TNested> {
    unique?: (keyof T)[];
    unindexedSortComparator?: string;
    defaultLokiOperatorPackage?: string;
    rangedIndexes?: RangedIndexOptions;
    serializableIndexes?: boolean;
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

  export interface RangedIndexOptions {
    [prop: string]: RangedIndexMeta;
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

  export interface RangedIndexMeta {
    index?: IRangedIndex<any>;
    indexTypeName?: string;
    comparatorName?: string;
  }

  export interface Change {
    name: string;
    operation: string;
    obj: any;
  }

  export interface Serialized {
    name: string;
    unindexedSortComparator: string;
    defaultLokiOperatorPackage: string;
    _dynamicViews: DynamicView[];
    _nestedProperties: { name: string, path: string[] }[];
    uniqueNames: string[];
    transforms: Dict<Transform[]>;
    rangedIndexes: RangedIndexOptions;
    _data: Doc<any>[];
    idIndex: number[];
    maxId: number;
    _dirty: boolean;
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

  export interface CheckIndexOptions {
    randomSampling?: boolean;
    randomSamplingFactor?: number;
    repair?: boolean;
  }

  export type Transform<T extends object = object> = {
    type: "find";
    value: ResultSet.Query<Doc<T>> | string;
  } | {
    type: "where";
    value: ((obj: Doc<T>) => boolean) | string;
  } | {
    type: "simplesort";
    property: keyof T;
    options?: boolean | ResultSet.SimpleSortOptions;
  } | {
    type: "compoundsort";
    value: (keyof T | [keyof T, boolean])[];
  } | {
    type: "sort";
    value: (a: Doc<T>, b: Doc<T>) => number;
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
    value: (obj: Doc<T>, index: number, array: Doc<T>[]) => any;
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
    mapFunction: (item: Doc<T>, index: number, array: Doc<T>[]) => any;
    reduceFunction: (array: any[]) => any;
  } | {
    type: "update";
    value: (obj: Doc<T>) => any;
  } | {
    type: "remove";
  };

  export interface TTL {
    age: number;
    ttlInterval: number;
    daemon: any; // setInterval Timer
  }
}
