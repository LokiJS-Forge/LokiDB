import { LokiEventEmitter } from "./event_emitter";
import { UniqueIndex } from "./unique_index";
import { ResultSet } from "./result_set";
import { DynamicView } from "./dynamic_view";
import { CloneMethod } from "./clone";
import { Doc, Dict } from "../../common/types";
import { FullTextSearch } from "../../full-text-search/src/full_text_search";
import { Tokenizer } from "../../full-text-search/src/tokenizer";
export { CloneMethod } from "./clone";
/**
 * Collection class that handles documents of same type
 * @extends LokiEventEmitter
 * @param <TData> - the data type
 * @param <TNested> - nested properties of data type
 */
export declare class Collection<TData extends object = object, TNested extends object = object> extends LokiEventEmitter {
    name: string;
    _data: Doc<TData>[];
    private idIndex;
    binaryIndices: {
        [P in keyof TData]?: Collection.BinaryIndex;
    };
    /**
     * Unique constraints contain duplicate object references, so they are not persisted.
     * We will keep track of properties which have unique constraints applied here, and regenerate on load.
     */
    constraints: {
        unique: {
            [P in keyof TData]?: UniqueIndex<TData>;
        };
    };
    /**
     * Transforms will be used to store frequently used query chains as a series of steps which itself can be stored along
     * with the database.
     */
    transforms: Dict<Collection.Transform<TData, TNested>[]>;
    /**
     * In autosave scenarios we will use collection level dirty flags to determine whether save is needed.
     * currently, if any collection is dirty we will autosave the whole database if autosave is configured.
     * Defaulting to true since this is called from addCollection and adding a collection should trigger save.
     */
    dirty: boolean;
    private cachedIndex;
    private cachedBinaryIndex;
    private cachedData;
    /**
     * If set to true we will optimally keep indices 'fresh' during insert/update/remove ops (never dirty/never needs rebuild).
     * If you frequently intersperse insert/update/remove ops between find ops this will likely be significantly faster option.
     */
    adaptiveBinaryIndices: boolean;
    /**
     * Is collection transactional.
     */
    private transactional;
    /**
     * Options to clone objects when inserting them.
     */
    cloneObjects: boolean;
    /**
     * Default clone method (if enabled) is parse-stringify.
     */
    cloneMethod: CloneMethod;
    /**
     * Disable track changes.
     */
    private disableChangesApi;
    /**
     * Disable delta update object style on changes.
     */
    disableDeltaChangesApi: boolean;
    /**
     * By default, if you insert a document into a collection with binary indices, if those indexed properties contain
     * a DateTime we will convert to epoch time format so that (across serializations) its value position will be the
     * same 'after' serialization as it was 'before'.
     */
    private serializableIndices;
    /**
     * Option to activate a cleaner daemon - clears "aged" documents at set intervals.
     */
    ttl: Collection.TTL;
    private maxId;
    private _dynamicViews;
    /**
     * Changes are tracked by collection and aggregated by the db.
     */
    private changes;
    private insertHandler;
    private updateHandler;
    console: {
        log(...args: any[]): void;
        warn(...args: any[]): void;
        error(...args: any[]): void;
    };
    /**
     * stages: a map of uniquely identified 'stages', which hold copies of objects to be
     * manipulated without affecting the data in the original collection
     */
    private stages;
    private commitLog;
    _fullTextSearch: FullTextSearch;
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
     * @param {string} [options.cloneMethod="deep"] - the clone method
     * @param {number} [options.transactional=false] - ?
     * @param {number} options.ttl - ?
     * @param {number} options.ttlInterval - time interval for clearing out 'aged' documents; not set by default.
     * @see {@link Loki#addCollection} for normal creation of collections
     */
    constructor(name: string, options?: Collection.Options<TData>);
    toJSON(): Collection.Serialized;
    static fromJSONObject(obj: Collection.Serialized, options?: Collection.DeserializeOptions): Collection<any, object>;
    /**
     * Adds a named collection transform to the collection
     * @param {string} name - name to associate with transform
     * @param {array} transform - an array of transformation 'step' objects to save into the collection
     */
    addTransform(name: string, transform: Collection.Transform<TData, TNested>[]): void;
    /**
     * Retrieves a named transform from the collection.
     * @param {string} name - name of the transform to lookup.
     */
    getTransform(name: string): Collection.Transform<TData, TNested>[];
    /**
     * Updates a named collection transform to the collection
     * @param {string} name - name to associate with transform
     * @param {object} transform - a transformation object to save into collection
     */
    setTransform(name: string, transform: Collection.Transform<TData, TNested>[]): void;
    /**
     * Removes a named collection transform from the collection
     * @param {string} name - name of collection transform to remove
     */
    removeTransform(name: string): void;
    private setTTL(age, interval);
    /**
     * create a row filter that covers all documents in the collection
     */
    _prepareFullDocIndex(): number[];
    /**
     * Ensure binary index on a certain field
     * @param {string} property - name of property to create binary index on
     * @param {boolean} [force=false] - flag indicating whether to construct index immediately
     */
    ensureIndex(property: keyof TData, force?: boolean): void;
    getSequencedIndexValues(property: keyof TData): string;
    ensureUniqueIndex(field: keyof TData): UniqueIndex<TData>;
    /**
     * Ensure all binary indices
     */
    ensureAllIndexes(force?: boolean): void;
    flagBinaryIndexesDirty(): void;
    flagBinaryIndexDirty(index: string): void;
    /**
     * Quickly determine number of documents in collection (or query)
     * @param {object} query - (optional) query object to count results of
     * @returns {number} number of documents in the collection
     */
    count(query?: ResultSet.Query<Doc<TData> & TNested>): number;
    /**
     * Rebuild idIndex
     */
    private _ensureId();
    /**
     * Add a dynamic view to the collection
     * @param {string} name - name of dynamic view to add
     * @param {object} options - (optional) options to configure dynamic view with
     * @param {boolean} [options.persistent=false] - indicates if view is to main internal results array in 'resultdata'
     * @param {string} [options.sortPriority=SortPriority.PASSIVE] - the sort priority
     * @param {number} options.minRebuildInterval - minimum rebuild interval (need clarification to docs here)
     * @returns {DynamicView} reference to the dynamic view added
     **/
    addDynamicView(name: string, options?: DynamicView.Options): DynamicView<TData, TNested>;
    /**
     * Remove a dynamic view from the collection
     * @param {string} name - name of dynamic view to remove
     **/
    removeDynamicView(name: string): void;
    /**
     * Look up dynamic view reference from within the collection
     * @param {string} name - name of dynamic view to retrieve reference of
     * @returns {DynamicView} A reference to the dynamic view with that name
     **/
    getDynamicView(name: string): DynamicView<TData, TNested>;
    /**
     * Applies a 'mongo-like' find query object and passes all results to an update function.
     * For filter function querying you should migrate to [
     * Where()]{@link Collection#updateWhere}.
     *
     * @param {object|function} filterObject - 'mongo-like' query object (or deprecated filterFunction mode)
     * @param {function} updateFunction - update function to run against filtered documents
     */
    findAndUpdate(filterObject: ResultSet.Query<Doc<TData> & TNested> | ((obj: Doc<TData>) => boolean), updateFunction: (obj: Doc<TData>) => any): void;
    /**
     * Applies a 'mongo-like' find query object removes all documents which match that filter.
     *
     * @param {object} filterObject - 'mongo-like' query object
     */
    findAndRemove(filterObject: ResultSet.Query<Doc<TData> & TNested>): void;
    /**
     * Adds object(s) to collection, ensure object(s) have meta properties, clone it if necessary, etc.
     * @param {(object|array)} doc - the document (or array of documents) to be inserted
     * @returns {(object|array)} document or documents inserted
     */
    insert(doc: TData): Doc<TData>;
    insert(doc: TData[]): Doc<TData>[];
    /**
     * Adds a single object, ensures it has meta properties, clone it if necessary, etc.
     * @param {object} doc - the document to be inserted
     * @param {boolean} bulkInsert - quiet pre-insert and insert event emits
     * @returns {object} document or 'undefined' if there was a problem inserting it
     */
    insertOne(doc: TData, bulkInsert?: boolean): Doc<TData>;
    /**
     * Empties the collection.
     * @param {boolean} [removeIndices=false] - remove indices
     */
    clear({removeIndices: removeIndices}?: {
        removeIndices?: boolean;
    }): void;
    /**
     * Updates an object and notifies collection that the document has changed.
     * @param {object} doc - document to update within the collection
     */
    update(doc: Doc<TData> | Doc<TData>[]): void;
    /**
     * Add object to collection
     */
    private add(obj);
    /**
     * Applies a filter function and passes all results to an update function.
     *
     * @param {function} filterFunction - filter function whose results will execute update
     * @param {function} updateFunction - update function to run against filtered documents
     */
    updateWhere(filterFunction: (obj: Doc<TData>) => boolean, updateFunction: (obj: Doc<TData>) => any): void;
    /**
     * Remove all documents matching supplied filter function.
     * For 'mongo-like' querying you should migrate to [findAndRemove()]{@link Collection#findAndRemove}.
     * @param {function|object} query - query object to filter on
     */
    removeWhere(query: ResultSet.Query<Doc<TData> & TNested> | ((obj: Doc<TData>) => boolean)): void;
    removeDataOnly(): void;
    /**
     * Remove a document from the collection
     * @param {number|object} doc - document to remove from collection
     */
    remove(doc: number | Doc<TData> | Doc<TData>[]): void;
    /**
     * Returns all changes.
     * @returns {Collection.Change[]}
     */
    getChanges(): Collection.Change[];
    /**
     * Enables/disables changes api.
     * @param {boolean} disableChangesApi
     * @param {boolean} disableDeltaChangesApi
     */
    setChangesApi(disableChangesApi: boolean, disableDeltaChangesApi?: boolean): void;
    /**
     * Clears all the changes.
     */
    flushChanges(): void;
    private _getObjectDelta(oldObject, newObject);
    /**
     * Compare changed object (which is a forced clone) with existing object and return the delta
     */
    private _getChangeDelta(obj, old);
    /**
     * This method creates a clone of the current status of an object and associates operation and collection name,
     * so the parent db can aggregate and generate a changes object for the entire db
     */
    private _createChange(name, op, obj, old?);
    private _createInsertChange(obj);
    /**
     * If the changes API is disabled make sure only metadata is added without re-evaluating everytime if the changesApi is enabled
     */
    private _insertMeta(obj);
    private _updateMeta(obj);
    private _createUpdateChange(obj, old);
    private _insertMetaWithChange(obj);
    private _updateMetaWithChange(obj, old);
    /**
     * Get by Id - faster than other methods because of the searching algorithm
     * @param {int} id - $loki id of document you want to retrieve
     * @param {boolean} returnPosition - if 'true' we will return [object, position]
     * @returns {(object|array|null)} Object reference if document was found, null if not,
     *     or an array if 'returnPosition' was passed.
     */
    get(id: number): Doc<TData>;
    get(id: number, returnPosition: boolean): Doc<TData> | [Doc<TData>, number];
    /**
     * Perform binary range lookup for the data[dataPosition][binaryIndexName] property value
     *    Since multiple documents may contain the same value (which the index is sorted on),
     *    we hone in on range and then linear scan range to find exact index array position.
     * @param {int} dataPosition : data array index/position
     * @param {string} binaryIndexName : index to search for dataPosition in
     */
    getBinaryIndexPosition(dataPosition: number, binaryIndexName: keyof TData): number;
    /**
     * Adaptively insert a selected item to the index.
     * @param {int} dataPosition : coll.data array index/position
     * @param {string} binaryIndexName : index to search for dataPosition in
     */
    adaptiveBinaryIndexInsert(dataPosition: number, binaryIndexName: keyof TData): void;
    /**
     * Adaptively update a selected item within an index.
     * @param {int} dataPosition : coll.data array index/position
     * @param {string} binaryIndexName : index to search for dataPosition in
     */
    adaptiveBinaryIndexUpdate(dataPosition: number, binaryIndexName: keyof TData): void;
    /**
     * Adaptively remove a selected item from the index.
     * @param {number} dataPosition : coll.data array index/position
     * @param {string} binaryIndexName : index to search for dataPosition in
     * @param {boolean} removedFromIndexOnly - remove from index only
     */
    adaptiveBinaryIndexRemove(dataPosition: number, binaryIndexName: keyof TData, removedFromIndexOnly?: boolean): void;
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
    private _calculateRangeStart(prop, val, adaptive?);
    /**
     * Internal method used for indexed $between.  Given a prop (index name), and a value
     * (which may or may not yet exist) this will find the final position of that upper range value.
     */
    private _calculateRangeEnd(prop, val);
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
    calculateRange(op: string, prop: keyof TData, val: any): [number, number];
    /**
     * Retrieve doc by Unique index
     * @param {string} field - name of uniquely indexed property to use when doing lookup
     * @param {any} value - unique value to search for
     * @returns {object} document matching the value passed
     */
    by(field: string, value: any): Doc<TData>;
    /**
     * Find one object by index property, by property equal to value
     * @param {object} query - query object used to perform search with
     * @returns {(object|null)} First matching document, or null if none
     */
    findOne(query: ResultSet.Query<Doc<TData> & TNested>): Doc<TData>;
    /**
     * Chain method, used for beginning a series of chained find() and/or view() operations
     * on a collection.
     *
     * @param {array} transform - Ordered array of transform step objects similar to chain
     * @param {object} parameters - Object containing properties representing parameters to substitute
     * @returns {ResultSet} (this) ResultSet, or data array if any map or join functions where called
     */
    chain(transform?: string | Collection.Transform<TData, TNested>[], parameters?: object): ResultSet<TData, TNested>;
    /**
     * Find method, api is similar to mongodb.
     * for more complex queries use [chain()]{@link Collection#chain} or [where()]{@link Collection#where}.
     * @example {@tutorial Query Examples}
     * @param {object} query - 'mongo-like' query object
     * @returns {array} Array of matching documents
     */
    find(query?: ResultSet.Query<Doc<TData> & TNested>): Doc<TData>[];
    /**
     * Find object by unindexed field by property equal to value,
     * simply iterates and returns the first element matching the query
     */
    findOneUnindexed(prop: string, value: any): Doc<TData>;
    /**
     * Transaction methods
     */
    /**
     * start the transation
     */
    startTransaction(): void;
    /**
     * commit the transation
     */
    commit(): void;
    /**
     * roll back the transation
     */
    rollback(): void;
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
    where(fun: (obj: Doc<TData>) => boolean): Doc<TData>[];
    /**
     * Map Reduce operation
     * @param {function} mapFunction - function to use as map function
     * @param {function} reduceFunction - function to use as reduce function
     * @returns {data} The result of your mapReduce operation
     */
    mapReduce<T, U>(mapFunction: (value: TData, index: number, array: TData[]) => T, reduceFunction: (array: T[]) => U): U;
    /**
     * Join two collections on specified properties
     *
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
    eqJoin(joinData: Collection<any> | ResultSet<any> | any[], leftJoinProp: string | ((obj: any) => string), rightJoinProp: string | ((obj: any) => string), mapFun?: (left: any, right: any) => any, dataOptions?: ResultSet.DataOptions): ResultSet<any>;
    /**
     * (Staging API) create a stage and/or retrieve it
     */
    getStage(name: string): any;
    /**
     * a collection of objects recording the changes applied through a commmitStage
     */
    /**
     * (Staging API) create a copy of an object and insert it into a stage
     */
    stage<F extends TData>(stageName: string, obj: Doc<F>): F;
    /**
     * (Staging API) re-attach all objects to the original collection, so indexes and views can be rebuilt
     * then create a message to be inserted in the commitlog
     * @param {string} stageName - name of stage
     * @param {string} message
     */
    commitStage(stageName: string, message: string): void;
    /**
     */
    extract(field: string): any[];
    /**
     */
    max(field: string): number;
    /**
     */
    min(field: string): number;
    /**
     */
    maxRecord(field: string): {
        index: number;
        value: number;
    };
    /**
     */
    minRecord(field: string): {
        index: number;
        value: number;
    };
    /**
     */
    extractNumerical(field: string): number[];
    /**
     * Calculates the average numerical value of a property
     *
     * @param {string} field - name of property in docs to average
     * @returns {number} average of property in all docs in the collection
     */
    avg(field: string): number;
    /**
     * Calculate standard deviation of a field
     * @param {string} field
     */
    stdDev(field: string): number;
    /**
     * @param {string} field
     */
    mode(field: string): string;
    /**
     * @param {string} field - property name
     */
    median(field: string): number;
}
export declare namespace Collection {
    interface Options<TData> {
        unique?: (keyof TData)[];
        indices?: (keyof TData)[];
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
    interface DeserializeOptions {
        retainDirtyFlags?: boolean;
        fullTextSearch?: Dict<Tokenizer.FunctionSerialization>;
        [collName: string]: any | {
            proto?: any;
            inflate?: (src: object, dest?: object) => void;
        };
    }
    interface BinaryIndex {
        dirty: boolean;
        values: any;
    }
    interface Change {
        name: string;
        operation: string;
        obj: any;
    }
    interface Serialized {
        name: string;
        _dynamicViews: DynamicView[];
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
        disableChangesApi: boolean;
        disableDeltaChangesApi: boolean;
        cloneObjects: boolean;
        cloneMethod: CloneMethod;
        changes: any;
        _fullTextSearch: FullTextSearch;
    }
    type Transform<TData extends object = object, TNested extends object = object> = {
        type: "find";
        value: ResultSet.Query<Doc<TData> & TNested> | string;
    } | {
        type: "where";
        value: ((obj: Doc<TData>) => boolean) | string;
    } | {
        type: "simplesort";
        property: keyof (TData & TNested);
        desc?: boolean;
    } | {
        type: "compoundsort";
        value: (keyof (TData & TNested) | [keyof (TData & TNested), boolean])[];
    } | {
        type: "sort";
        value: (a: Doc<TData>, b: Doc<TData>) => number;
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
        value: (obj: TData, index: number, array: TData[]) => any;
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
        mapFunction: (item: TData, index: number, array: TData[]) => any;
        reduceFunction: (array: any[]) => any;
    } | {
        type: "update";
        value: (obj: Doc<TData>) => any;
    } | {
        type: "remove";
    };
    interface TTL {
        age: number;
        ttlInterval: number;
        daemon: any;
    }
}
