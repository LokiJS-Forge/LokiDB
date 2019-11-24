import { LokiEventEmitter } from "./event_emitter";
import { Collection } from "./collection";
import { Doc, StorageAdapter } from "../../common/types";
import { PLUGINS } from "../../common/plugin";
import { ComparatorMap, IComparatorMap } from "./comparators";
import { RangedIndexFactoryMap, IRangedIndexFactoryMap } from "./ranged_indexes";
import { LokiOperatorPackageMap, ILokiOperatorPackageMap } from "./operator_packages";

function getENV(): Loki.Environment {
  if (global !== undefined && (global["android"] || global["NSObject"])) {
    return "NATIVESCRIPT";
  }

  const isNode = global !== undefined && ({}).toString.call(global.process) === "[object process]";
  if (isNode) {
    if (global["window"]) {
      return "NODEJS"; //node-webkit
    } else {
      return "NODEJS";
    }
  }

  if (document !== undefined) {
    if (document.URL.indexOf("http://") === -1 && document.URL.indexOf("https://") === -1) {
      return "CORDOVA";
    }
    return "BROWSER";
  }

  const isBrowser = window !== undefined && ({}).toString.call(window) === "[object Window]";
  if (isBrowser) {
    return "BROWSER";
  }
  throw SyntaxError("Unknown environment...");
}

export class Loki extends LokiEventEmitter {
  public filename: string;

  // persist version of code which created the database to the database.
  // could use for upgrade scenarios
  private databaseVersion: number = 1.5; // TODO
  private engineVersion: number = 1.5;

  public _collections: Collection[];

  private _env: Loki.Environment;

  // currently keeping persistenceMethod and persistenceAdapter as loki level properties that
  // will not or cannot be deserialized  You are required to configure persistence every time
  // you instantiate a loki object (or use default environment detection) in order to load the database anyways.
  private _serializationMethod: Loki.SerializationMethod;
  private _destructureDelimiter: string;
  // persistenceMethod could be 'fs', 'localStorage', or 'adapter'
  // this is optional option param, otherwise environment detection will be used
  // if user passes their own adapter we will force this method to 'adapter' later, so no need to pass method option.
  private _persistenceMethod: Loki.PersistenceMethod = null;
  // retain reference to optional (non-serializable) persistenceAdapter 'instance'
  private _persistenceAdapter: StorageAdapter = null;

  // flags used to throttle saves
  private _throttledSaves: boolean = true;
  private _throttledSaveRunning: Promise<void> = null;
  private _throttledSavePending: Promise<void> = null;

  // autosave support (disabled by default)
  private _autosave: boolean = false;
  private _autosaveInterval: number = 5000;
  private _autosaveRunning: boolean = false;
  private _autosaveHandler: Promise<void> = Promise.resolve();

  /**
   * Constructs the main database class.
   * @param {string} filename - name of the file to be saved to
   * @param {object} [options={}] - options
   * @param {Loki.Environment} [options.env] - the javascript environment
   * @param {Loki.SerializationMethod} [options.serializationMethod=NORMAL] - the serialization method
   * @param {string} [options.destructureDelimiter="$<\n"] - string delimiter used for destructured serialization
   * @param {IComparatorMap} [options.comparatorMap] allows injecting or overriding registered comparators
   * @param {IRangedIndexFactoryMap} [options.rangedIndexFactoryMap] allows injecting or overriding registered ranged index factories
   * @param {ILokiOperatorPackageMap} [options.lokiOperatorPackageMap] allows injecting or overriding registered loki operator packages
   */
  constructor(filename = "loki.db", options: Loki.Options = {}) {
    super();

    this.filename = filename;
    this._collections = [];

    (
      {
        serializationMethod: this._serializationMethod = "normal",
        destructureDelimiter: this._destructureDelimiter = "$<\n",
        env: this._env = getENV()
      } = options
    );

    this._events = {
      "init": [],
      "loaded": [],
      "flushChanges": [],
      "close": [],
      "changes": [],
      "warning": []
    };

    // allow users to inject their own comparators
    if (options.comparatorMap) {
      for (let c in options.comparatorMap) {
        ComparatorMap[c] = options.comparatorMap[c];
      }
    }

    // allow users to register their own rangedIndex factory functions
    if (options.rangedIndexFactoryMap) {
      for (let rif in options.rangedIndexFactoryMap) {
        RangedIndexFactoryMap[rif] = options.rangedIndexFactoryMap[rif];
      }
    }

    // allow users to register their own LokiOperatorPackages or inject functionality within existing ones
    if (options.lokiOperatorPackageMap) {
      for (let lop in options.lokiOperatorPackageMap) {
        LokiOperatorPackageMap[lop] = options.lokiOperatorPackageMap[lop];
      }
    }

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
  public initializePersistence(options: Loki.PersistenceOptions = {}): Promise<void> {

    let loaded = this._autosaveDisable();

    (
      {
        autosave: this._autosave = false,
        autosaveInterval: this._autosaveInterval = 5000,
        persistenceMethod: this._persistenceMethod,
        // TODO
        //inflate: this.options.inflate,
        throttledSaves: this._throttledSaves = true
      } = options
    );

    const DEFAULT_PERSISTENCE = {
      "NODEJS": ["fs-storage"],
      "BROWSER": ["local-storage", "indexed-storage"],
      "CORDOVA": ["local-storage", "indexed-storage"],
      "MEMORY": ["memory-storage"]
    };

    const PERSISTENCE_METHODS = {
      "fs-storage": PLUGINS["FSStorage"],
      "local-storage": PLUGINS["LocalStorage"],
      "indexed-storage": PLUGINS["IndexedStorage"],
      "memory-storage": PLUGINS["MemoryStorage"]
    };

    // process the options
    if (this._persistenceMethod !== undefined) {
      // check if the specified persistence method is known
      if (typeof(PERSISTENCE_METHODS[this._persistenceMethod]) === "function") {
        this._persistenceAdapter = new (PERSISTENCE_METHODS[this._persistenceMethod]);
      } else {
        throw Error("Unknown persistence method.");
      }
    }

    // if user passes adapter, set persistence mode to adapter and retain persistence adapter instance
    if (options.adapter !== undefined) {
      this._persistenceMethod = "adapter";
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

    // if they want to load database on loki instantiation, now is a good time to load... after adapter set and before
    // possible autosave initiation
    if (options.autoload) {
      loaded = loaded.then(() => this.loadDatabase(options.inflate));
    }

    return loaded.then(() => {
      this._autosaveEnable();
    });
  }

  /**
   * Copies 'this' database into a new Loki instance. Object references are shared to make lightweight.
   * @param {object} options - options
   * @param {boolean} options.removeNonSerializable - nulls properties not safe for serialization.
   */
  public copy(options: Loki.CopyOptions = {}): Loki {
    const databaseCopy = new Loki(this.filename, {env: this._env});

    // currently inverting and letting loadJSONObject do most of the work
    databaseCopy.loadJSONObject(this, {
      retainDirtyFlags: true
    });

    // since our toJSON is not invoked for reference database adapters, this will let us mimic
    if (options.removeNonSerializable) {
      databaseCopy._persistenceAdapter = null;

      for (let idx = 0; idx < databaseCopy._collections.length; idx++) {
        databaseCopy._collections[idx]._constraints = null;
        databaseCopy._collections[idx]._ttl = null;
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
   * @param {boolean} [options.disableMeta=false] - set to true to disable meta property on documents
   * @param {boolean} [options.disableChangesApi=true] - set to false to enable Changes Api
   * @param {boolean} [options.disableDeltaChangesApi=true] - set to false to enable Delta Changes API (requires Changes API, forces cloning)
   * @param {boolean} [options.clone=false] - specify whether inserts and queries clone to/from user
   * @param {string} [options.cloneMethod=CloneMethod.DEEP] - the clone method
   * @param {number} [options.ttl=] - age of document (in ms.) before document is considered aged/stale
   * @param {number} [options.ttlInterval=] - time interval for clearing out 'aged' documents; not set by default
   * @returns {Collection} a reference to the collection which was just added
   */
  public addCollection<TData extends object = object, TNested extends object = object>(name: string, options: Collection.Options<TData, TNested> = {}): Collection<TData, TNested> {
    // Return an existing collection if a collection with the same name already exists.
    for (let i = 0; i < this._collections.length; i++) {
      if (this._collections[i].name === name) {
        return this._collections[i] as Collection<TData, TNested>;
      }
    }
    // Create a new collection otherwise.
    const collection = new Collection<TData, TNested>(name, options);
    this._collections.push(collection);
    return collection;
  }

  public loadCollection(collection: Collection): void {
    if (!collection.name) {
      throw new Error("Collection must have a name property to be loaded");
    }
    this._collections.push(collection);
  }

  /**
   * Retrieves reference to a collection by name.
   * @param {string} name - name of collection to look up
   * @returns {Collection} Reference to collection in database by that name, or null if not found
   */
  public getCollection<TData extends object = object, TNested extends object = object>(name: string): Collection<TData, TNested> {
    for (let i = 0; i < this._collections.length; i++) {
      if (this._collections[i].name === name) {
        return this._collections[i] as Collection<TData, TNested>;
      }
    }

    // no such collection
    this.emit("warning", "collection " + name + " not found");
    return null;
  }

  /**
   * Renames an existing loki collection
   * @param {string} oldName - name of collection to rename
   * @param {string} newName - new name of collection
   * @returns {Collection} reference to the newly renamed collection
   */
  public renameCollection<TData extends object = object, TNested extends object = object>(oldName: string, newName: string): Collection<TData, TNested> {
    const c = this.getCollection<TData, TNested>(oldName);
    if (c) {
      c.name = newName;
    }
    return c;
  }

  public listCollections(): { name: string, count: number }[] {
    const colls = [];
    for (let i = 0; i < this._collections.length; i++) {
      colls.push({
        name: this._collections[i].name,
        count: this._collections[i].count()
      });
    }
    return colls;
  }

  /**
   * Removes a collection from the database.
   * @param {string} collectionName - name of collection to remove
   */
  public removeCollection(collectionName: string): void {
    for (let i = 0; i < this._collections.length; i++) {
      if (this._collections[i].name === collectionName) {
        const tmpcol = new Collection(collectionName, {});
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

  /**
   * Serialize database to a string which can be loaded via {@link Loki#loadJSON}
   *
   * @returns {string} Stringified representation of the loki database.
   */
  public serialize(options: Loki.SerializeOptions = {}) {
    if (options.serializationMethod === undefined) {
      options.serializationMethod = this._serializationMethod;
    }

    switch (options.serializationMethod) {
      case "normal":
        return JSON.stringify(this);
      case "pretty":
        return JSON.stringify(this, null, 2);
      case "destructured":
        return this.serializeDestructured(); // use default options
      default:
        return JSON.stringify(this);
    }
  }

  // alias of serialize
  public toJSON(): Loki.Serialized {
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
      _throttledSaves: this._throttledSaves
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
  public serializeDestructured(options: Loki.SerializeDestructuredOptions = {}): string | string[] {
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
      dbcopy._collections[idx]._data = [];
    }

    // if we -only- wanted the db container portion, return it now
    if (options.partitioned === true && options.partition === -1) {
      // since we are deconstructing, override serializationMethod to normal for here
      return dbcopy.serialize({
        serializationMethod: "normal"
      });
    }

    // at this point we must be deconstructing the entire database
    // start by pushing db serialization into first array element
    const reconstruct: string[] = [];
    reconstruct.push(dbcopy.serialize({
      serializationMethod: "normal"
    }) as string);

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
      } else {
        reconstruct.push(result as string);
      }
    }

    // Reconstruct / present results according to four combinations : D, DA, NDA, NDAA
    if (options.partitioned) {
      // DA : Delimited Array of strings [0] db [1] collection [n] collection { partitioned: true, delimited: true }
      // useful for simple future adaptations of existing persistence adapters to save collections separately
      if (options.delimited) {
        return reconstruct;
      }
      // NDAA : Non-Delimited Array with subArrays. db at [0] and collection subarrays at [n] { partitioned: true, delimited : false }
      // This format might be the most versatile for 'rolling your own' partitioned sync or save.
      // Memory overhead can be reduced by specifying a specific partition, but at this code path they did not, so its all.
      else {
        return reconstruct;
      }
    } else {
      // D : one big Delimited string { partitioned: false, delimited : true }
      // This is the method Loki will use internally if 'destructured'.
      // Little memory overhead improvements but does not require multiple asynchronous adapter call scheduling
      if (options.delimited) {
        // indicate no more collections
        reconstruct.push("");

        return reconstruct.join(options.delimiter);
      }
      // NDA : Non-Delimited Array : one iterable array with empty string collection partitions { partitioned: false, delimited: false }
      // This format might be best candidate for custom synchronous syncs or saves
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
  public serializeCollection(options: { delimited?: boolean; collectionIndex?: number; delimiter?: string } = {}): string | string[] {
    if (options.delimited === undefined) {
      options.delimited = true;
    }

    if (options.collectionIndex === undefined) {
      throw new Error("serializeCollection called without 'collectionIndex' option");
    }
    const doccount = this._collections[options.collectionIndex].count();

    let resultlines = [];
    for (let docidx = 0; docidx < doccount; docidx++) {
      resultlines.push(JSON.stringify(this._collections[options.collectionIndex]._data[docidx]));
    }

    // D and DA
    if (options.delimited) {
      // indicate no more documents in collection (via empty delimited string)
      resultlines.push("");

      return resultlines.join(options.delimiter);
    } else {
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
  public deserializeDestructured(destructuredSource: string | string[], options: Loki.SerializeDestructuredOptions = {}) {
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
          return JSON.parse(destructuredSource[0]);
        }

        // single collection, return doc array
        return this.deserializeCollection(destructuredSource[options.partition + 1], options);
      }

      // Otherwise we are restoring an entire partitioned db
      const cdb = JSON.parse(destructuredSource[0]);
      const collCount = cdb._collections.length;
      for (let collIndex = 0; collIndex < collCount; collIndex++) {
        // attach each collection docarray to container collection data, add 1 to collection array index since db is at 0
        cdb._collections[collIndex]._data = this.deserializeCollection(destructuredSource[collIndex + 1], options);
      }

      return cdb;
    }

    // Non-Partitioned
    // D : one big Delimited string { partitioned: false, delimited : true }
    // NDA : Non-Delimited Array : one iterable array with empty string collection partitions { partitioned: false, delimited: false }

    let workarray = [];

    // D
    if (options.delimited) {
      workarray = (destructuredSource as string).split(options.delimiter);
      destructuredSource = null; // lower memory pressure
      if (workarray.length === 0) {
        return null;
      }
    }
    // NDA
    else {
      workarray = destructuredSource as string[];
    }

    // first line is database and collection shells
    const cdb = JSON.parse(workarray[0]);
    const collCount = cdb._collections.length;
    workarray[0] = null;

    let collIndex = 0;
    let lineIndex = 1;
    let done = false;
    while (!done) {
      // empty string indicates either end of collection or end of file
      if (workarray[lineIndex] === "") {
        // if no more collections to load into, we are done
        if (++collIndex > collCount) {
          done = true;
        }
      } else {
        cdb._collections[collIndex]._data.push(JSON.parse(workarray[lineIndex]));
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
  public deserializeCollection<T extends object = object>(destructuredSource: string | string[], options: Loki.DeserializeCollectionOptions = {}): Doc<T>[] {
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
      workarray = (destructuredSource as string).split(options.delimiter);
      workarray.pop();
    } else {
      workarray = destructuredSource as string[];
    }

    for (let idx = 0; idx < workarray.length; idx++) {
      workarray[idx] = JSON.parse(workarray[idx]);
    }
    return workarray as any as Doc<T>[];
  }

  /**
   * Inflates a loki database from a serialized JSON string
   *
   * @param {string} serializedDb - a serialized loki database string
   * @param {object} options - apply or override collection level settings
   * @param {boolean} options.retainDirtyFlags - whether collection dirty flags will be preserved
   */
  public loadJSON(serializedDb: string | string[], options?: Collection.DeserializeOptions): void {
    let dbObject;
    if (serializedDb.length === 0) {
      dbObject = {};
    } else {
      // using option defined in instantiated db not what was in serialized db
      switch (this._serializationMethod) {
        case "normal":
        case "pretty":
          dbObject = JSON.parse(serializedDb as string);
          break;
        case "destructured":
          dbObject = this.deserializeDestructured(serializedDb);
          break;
        default:
          dbObject = JSON.parse(serializedDb as string);
          break;
      }
    }
    this.loadJSONObject(dbObject, options);
  }

  /**
   * Inflates a loki database from a JS object
   *
   * @param {object} dbObject - a serialized loki database object
   * @param {object} options - apply or override collection level settings
   * @param {boolean} options.retainDirtyFlags - whether collection dirty flags will be preserved
   */
  public loadJSONObject(dbObject: Loki, options?: Collection.DeserializeOptions): void;
  public loadJSONObject(dbObject: Loki.Serialized, options?: Collection.DeserializeOptions): void;
  public loadJSONObject(dbObject: any, options: Collection.DeserializeOptions = {}): void {
    const len = dbObject._collections ? dbObject._collections.length : 0;

    this.filename = dbObject.filename;
    this._collections = [];

    for (let i = 0; i < len; ++i) {
      this._collections.push(Collection.fromJSONObject(dbObject._collections[i], options));
    }
  }

  /**
   * Emits the close event. In autosave scenarios, if the database is dirty, this will save and disable timer.
   * Does not actually destroy the db.
   *
   * @returns {Promise} a Promise that resolves after closing the database succeeded
   */
  public close(): Promise<void> {
    // for autosave scenarios, we will let close perform final save (if dirty)
    // For web use, you might call from window.onbeforeunload to shutdown database, saving pending changes
    if (this._autosave) {
      return this._autosaveDisable()
        .then(() => {
          if (this._autosaveDirty()) {
            return this.saveDatabase();
          }
          return Promise.resolve();
        });
    }

    return Promise.resolve().then(() => {
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
  public generateChangesNotification(arrayOfCollectionNames?: string[]): Collection.Change[] {
    let changes: Collection.Change[] = [];
    const selectedCollections = arrayOfCollectionNames
      || this._collections.map((coll: Collection) => coll.name);

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
  public serializeChanges(collectionNamesArray?: string[]) {
    return JSON.stringify(this.generateChangesNotification(collectionNamesArray));
  }

  /**
   * (Changes API) : clears all the changes in all collections.
   */
  public clearChanges() {
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
  throttledSaveDrain(options: Loki.ThrottledDrainOptions = {}): Promise<void> {
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
          } else {
            return Promise.resolve();
          }
        });
      }
      // just notify when current queue is depleted
      else {
        return Promise.resolve(this._throttledSaveRunning);
      }
    }
    // no save pending, just callback
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
  private _loadDatabase(options = {}) {
    // the persistenceAdapter should be present if all is ok, but check to be sure.
    if (this._persistenceAdapter === null) {
      return Promise.reject(new Error("persistenceAdapter not configured"));
    }

    return Promise.resolve(this._persistenceAdapter.loadDatabase(this.filename))
      .then((dbString) => {
        if (typeof (dbString) === "string") {
          this.loadJSON(dbString, options);
          this.emit("load", this);
        } else {
          dbString = dbString as object;
          // if adapter has returned an js object (other than null or error) attempt to load from JSON object
          if (typeof (dbString) === "object" && dbString !== null && !(dbString instanceof Error)) {
            this.loadJSONObject(dbString, options);
            this.emit("load", this);
          } else {
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
  public loadDatabase(options: Loki.LoadDatabaseOptions = {}): Promise<void> {
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

  private _saveDatabase() {
    // the persistenceAdapter should be present if all is ok, but check to be sure.
    if (this._persistenceAdapter === null) {
      return Promise.reject(new Error("persistenceAdapter not configured"));
    }

    // check if the adapter is requesting (and supports) a 'reference' mode export
    if (this._persistenceAdapter.mode === "reference" && typeof this._persistenceAdapter.exportDatabase === "function") {
      // filename may seem redundant but loadDatabase will need to expect this same filename
      return Promise.resolve(this._persistenceAdapter.exportDatabase(this.filename, this.copy({removeNonSerializable: true})))
        .then(() => {
          this._autosaveClearFlags();
          this.emit("save");
        });
    }

    // otherwise just pass the serialized database to adapter
    // persistenceAdapter might be asynchronous, so we must clear `dirty` immediately
    // or autosave won't work if an update occurs between here and the callback
    this._autosaveClearFlags();
    return Promise.resolve(this._persistenceAdapter.saveDatabase(this.filename, this.serialize() as string))
      .then(() => {
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
  public saveDatabase() {
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
  public deleteDatabase() {
    // the persistenceAdapter should be present if all is ok, but check to be sure.
    if (this._persistenceAdapter === null) {
      return Promise.reject(new Error("persistenceAdapter not configured"));
    }

    return Promise.resolve(this._persistenceAdapter.deleteDatabase(this.filename));
  }

  /****************
   * Autosave API
   ****************/

  /**
   * Check whether any collections are "dirty" meaning we need to save the (entire) database
   * @returns {boolean} - true if database has changed since last autosave, otherwise false
   */
  private _autosaveDirty(): boolean {
    for (let idx = 0; idx < this._collections.length; idx++) {
      if (this._collections[idx]._dirty) {
        return true;
      }
    }
    return false;
  }

  /**
   * Resets dirty flags on all collections.
   */
  private _autosaveClearFlags() {
    for (let idx = 0; idx < this._collections.length; idx++) {
      this._collections[idx]._dirty = false;
    }
  }

  /**
   * Starts periodically saves to the underlying storage adapter.
   */
  private _autosaveEnable(): void {
    if (!this._autosave || this._autosaveRunning) {
      return;
    }
    this._autosaveRunning = true;

    const interval = setInterval(() => {
      if (!this._autosaveRunning) {
        clearInterval(interval);
      } else if (this._autosaveDirty()) {
        this._autosaveHandler = this._autosaveHandler
          .then(() => {
            return this.saveDatabase();
          });
      }
    }, this._autosaveInterval);
  }

  /**
   * Stops the autosave interval timer.
   */
  private _autosaveDisable(): Promise<void> {
    this._autosaveRunning = false;
    return this._autosaveHandler;
  }
}

export namespace Loki {
  export interface Options {
    env?: Environment;
    serializationMethod?: SerializationMethod;
    destructureDelimiter?: string;
    comparatorMap?: IComparatorMap;
    rangedIndexFactoryMap?: IRangedIndexFactoryMap;
    lokiOperatorPackageMap?: ILokiOperatorPackageMap;
  }

  export interface PersistenceOptions {
    adapter?: StorageAdapter;
    autosave?: boolean;
    autosaveInterval?: number;
    autoload?: boolean;
    throttledSaves?: boolean;
    persistenceMethod?: Loki.PersistenceMethod;
    inflate?: any;
  }

  export interface CopyOptions {
    removeNonSerializable?: boolean;
  }

  export interface SerializeOptions {
    serializationMethod?: SerializationMethod;
  }

  export interface SerializeDestructuredOptions {
    partitioned?: boolean;
    partition?: number;
    delimited?: boolean;
    delimiter?: string;
  }

  export interface DeserializeCollectionOptions {
    partitioned?: boolean;
    delimited?: boolean;
    delimiter?: string;
  }

  export interface ThrottledDrainOptions {
    recursiveWait?: boolean;
    recursiveWaitLimit?: boolean;
    recursiveWaitLimitDuration?: number;
    started?: Date;
  }

  export interface Serialized {
    _env: Environment;
    _serializationMethod: SerializationMethod;
    _autosave: boolean;
    _autosaveInterval: number;
    _collections: Collection[];
    databaseVersion: number;
    engineVersion: number;
    filename: string;
    _persistenceAdapter: StorageAdapter;
    _persistenceMethod: PersistenceMethod;
    _throttledSaves: boolean;
  }

  export type LoadDatabaseOptions = Collection.DeserializeOptions & ThrottledDrainOptions;

  export type SerializationMethod = "normal" | "pretty" | "destructured";

  export type PersistenceMethod = "fs-storage" | "local-storage" | "indexed-storage" | "memory-storage" | "adapter";

  export type Environment = "NATIVESCRIPT" | "NODEJS" | "CORDOVA" | "BROWSER" | "MEMORY";
}
