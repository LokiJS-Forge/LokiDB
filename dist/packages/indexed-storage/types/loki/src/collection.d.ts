import { LokiEventEmitter } from "./event_emitter";
import { UniqueIndex } from "./unique_index";
import { ResultSet } from "./result_set";
import { DynamicView } from "./dynamic_view";
import { IRangedIndex } from "./ranged_indexes";
import { CloneMethod } from "./clone";
import { Doc, Dict } from "../../common/types";
import { FullTextSearch } from "../../full-text-search/src/full_text_search";
import { Analyzer } from "../../full-text-search/src/analyzer/analyzer";
/**
 * Collection class that handles documents of same type
 * @extends LokiEventEmitter
 * @param <TData> - the data type
 * @param <TNested> - nested properties of data type
 */
export declare class Collection<TData extends object = object, TNested extends object = object, T extends TData & TNested = TData & TNested> extends LokiEventEmitter {
    name: string;
    _data: Doc<T>[];
    private _idIndex;
    _rangedIndexes: {
        [P in keyof T]?: Collection.RangedIndexMeta;
    };
    _lokimap: {
        [$loki: number]: Doc<T>;
    };
    _unindexedSortComparator: string;
    _defaultLokiOperatorPackage: string;
    /**
     * Unique constraints contain duplicate object references, so they are not persisted.
     * We will keep track of properties which have unique constraints applied here, and regenerate on load.
     */
    _constraints: {
        unique: {
            [P in keyof T]?: UniqueIndex;
        };
    };
    /**
     * Transforms will be used to store frequently used query chains as a series of steps which itself can be stored along
     * with the database.
     */
    _transforms: Dict<Collection.Transform<T>[]>;
    /**
     * In autosave scenarios we will use collection level dirty flags to determine whether save is needed.
     * currently, if any collection is dirty we will autosave the whole database if autosave is configured.
     * Defaulting to true since this is called from addCollection and adding a collection should trigger save.
     */
    _dirty: boolean;
    private _cached;
    /**
     * Is collection transactional.
     */
    private _transactional;
    /**
     * Options to clone objects when inserting them.
     */
    _cloneObjects: boolean;
    /**
     * Default clone method (if enabled) is parse-stringify.
     */
    _cloneMethod: CloneMethod;
    /**
     * If set to true we will not maintain a meta property for a document.
     */
    private _disableMeta;
    /**
     * Disable track changes.
     */
    private _disableChangesApi;
    /**
     * Disable delta update object style on changes.
     */
    _disableDeltaChangesApi: boolean;
    /**
     * By default, if you insert a document with a Date value for an indexed property, we will convert that value to number.
     */
    private _serializableIndexes;
    /**
     * Name of path of used nested properties.
     */
    private _nestedProperties;
    /**
     * Option to activate a cleaner daemon - clears "aged" documents at set intervals.
     */
    _ttl: Collection.TTL;
    private _maxId;
    private _dynamicViews;
    /**
     * Changes are tracked by collection and aggregated by the db.
     */
    private _changes;
    /**
     * stages: a map of uniquely identified 'stages', which hold copies of objects to be
     * manipulated without affecting the data in the original collection
     */
    private _stages;
    private _commitLog;
    _fullTextSearch: FullTextSearch;
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
    constructor(name: string, options?: Collection.Options<TData, TNested>);
    toJSON(): Collection.Serialized;
    static fromJSONObject(obj: Collection.Serialized, options?: Collection.DeserializeOptions): Collection<any, object, any>;
    /**
     * Adds a named collection transform to the collection
     * @param {string} name - name to associate with transform
     * @param {array} transform - an array of transformation 'step' objects to save into the collection
     */
    addTransform(name: string, transform: Collection.Transform<T>[]): void;
    /**
     * Retrieves a named transform from the collection.
     * @param {string} name - name of the transform to lookup.
     */
    getTransform(name: string): Collection.Transform<T>[];
    /**
     * Updates a named collection transform to the collection
     * @param {string} name - name to associate with transform
     * @param {object} transform - a transformation object to save into collection
     */
    setTransform(name: string, transform: Collection.Transform<T>[]): void;
    /**
     * Removes a named collection transform from the collection
     * @param {string} name - name of collection transform to remove
     */
    removeTransform(name: string): void;
    private setTTL(age, interval);
    /**
     * Create a row filter that covers all documents in the collection.
     */
    _prepareFullDocIndex(): number[];
    /**
     * Ensure rangedIndex of a field.
     * @param field
     * @param indexTypeName
     * @param comparatorName
     */
    ensureIndex(field: string, indexTypeName?: string, comparatorName?: string): void;
    /**
     * Ensure rangedIndex of a field.
     * @param field Property to create an index on (need to look into contraining on keyof T)
     * @param indexTypeName Name of IndexType factory within (global?) hashmap to create IRangedIndex from
     * @param comparatorName Name of Comparator within (global?) hashmap
     */
    ensureRangedIndex(field: string, indexTypeName?: string, comparatorName?: string): void;
    ensureUniqueIndex(field: keyof T): UniqueIndex;
    /**
     * Quickly determine number of documents in collection (or query)
     * @param {object} query - (optional) query object to count results of
     * @returns {number} number of documents in the collection
     */
    count(query?: ResultSet.Query<Doc<T>>): number;
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
    addDynamicView(name: string, options?: DynamicView.Options): DynamicView<T>;
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
    getDynamicView(name: string): DynamicView<T>;
    /**
     * Applies a 'mongo-like' find query object and passes all results to an update function.
     * @param {object} filterObject - the 'mongo-like' query object
     * @param {function} updateFunction - the update function
     */
    findAndUpdate(filterObject: ResultSet.Query<Doc<T>>, updateFunction: (obj: Doc<T>) => any): void;
    /**
     * Applies a 'mongo-like' find query object removes all documents which match that filter.
     * @param {object} filterObject - 'mongo-like' query object
     */
    findAndRemove(filterObject: ResultSet.Query<Doc<T>>): void;
    /**
     * Adds object(s) to collection, ensure object(s) have meta properties, clone it if necessary, etc.
     * @param {(object|array)} doc - the document (or array of documents) to be inserted
     * @returns {(object|array)} document or documents inserted
     */
    insert(doc: TData): Doc<T>;
    insert(doc: TData[]): Doc<T>[];
    /**
     * Adds a single object, ensures it has meta properties, clone it if necessary, etc.
     * @param {object} doc - the document to be inserted
     * @param {boolean} bulkInsert - quiet pre-insert and insert event emits
     * @returns {object} document or 'undefined' if there was a problem inserting it
     */
    insertOne(doc: TData, bulkInsert?: boolean): Doc<T>;
    /**
     * Refers nested properties of an object to the root of it.
     * @param {T} data - the object
     * @returns {T & TNested} the object with nested properties
     * @hidden
     */
    _defineNestedProperties<U extends TData>(data: U): U & TNested;
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
    update(doc: Doc<T> | Doc<T>[]): void;
    /**
     * Add object to collection
     */
    private _add(obj);
    /**
     * Applies a filter function and passes all results to an update function.
     * @param {function} filterFunction - the filter function
     * @param {function} updateFunction - the update function
     */
    updateWhere(filterFunction: (obj: Doc<T>) => boolean, updateFunction: (obj: Doc<T>) => Doc<T>): void;
    /**
     * Remove all documents matching supplied filter function.
     * @param {function} filterFunction - the filter function
     */
    removeWhere(filterFunction: (obj: Doc<T>) => boolean): void;
    removeDataOnly(): void;
    /**
     * Remove a document from the collection
     * @param {number|object} doc - document to remove from collection
     */
    remove(doc: number | Doc<T> | Doc<T>[]): void;
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
     * Creates a clone of the current status of an object and associates operation and collection name,
     * so the parent db can aggregate and generate a changes object for the entire db
     */
    private _createChange(name, op, obj, old?);
    private _createInsertChange(obj);
    private _createUpdateChange(obj, old);
    private _insertMetaWithChange(obj);
    private _updateMetaWithChange(obj, old);
    private _insertMeta(obj);
    private _updateMeta(obj);
    /**
     * Get by Id - faster than other methods because of the searching algorithm
     * @param {int} id - $loki id of document you want to retrieve
     * @param {boolean} returnPosition - if 'true' we will return [object, position]
     * @returns {(object|array|null)} Object reference if document was found, null if not,
     *     or an array if 'returnPosition' was passed.
     */
    get(id: number): Doc<T>;
    get(id: number, returnPosition: boolean): Doc<T> | [Doc<T>, number];
    /**
     * Retrieve doc by Unique index
     * @param {string} field - name of uniquely indexed property to use when doing lookup
     * @param {any} value - unique value to search for
     * @returns {object} document matching the value passed
     */
    by(field: keyof T, value: any): Doc<T>;
    /**
     * Find one object by index property, by property equal to value
     * @param {object} query - query object used to perform search with
     * @returns {(object|null)} First matching document, or null if none
     */
    findOne(query: ResultSet.Query<Doc<T>>): Doc<T>;
    /**
     * Chain method, used for beginning a series of chained find() and/or view() operations
     * on a collection.
     *
     * @param {array} transform - Ordered array of transform step objects similar to chain
     * @param {object} parameters - Object containing properties representing parameters to substitute
     * @returns {ResultSet} (this) ResultSet, or data array if any map or join functions where called
     */
    chain(transform?: string | Collection.Transform<T>[], parameters?: object): ResultSet<T>;
    /**
     * Find method, api is similar to mongodb.
     * for more complex queries use [chain()]{@link Collection#chain} or [where()]{@link Collection#where}.
     * @example {@tutorial Query Examples}
     * @param {object} query - 'mongo-like' query object
     * @returns {array} Array of matching documents
     */
    find(query?: ResultSet.Query<Doc<T>>): Doc<T>[];
    /**
     * Find object by unindexed field by property equal to value,
     * simply iterates and returns the first element matching the query
     */
    findOneUnindexed(prop: string, value: any): Doc<T>;
    /**
     * Transaction methods
     */
    /**
     * start the transation
     */
    startTransaction(): void;
    /**
     * Commit the transaction.
     */
    commit(): void;
    /**
     * Rollback the transaction.
     */
    rollback(): void;
    /**
     * Query the collection by supplying a javascript filter function.
     * @example
     * let results = coll.where(function(obj) {
       *   return obj.legs === 8;
       * });
     * @param {function} fun - filter function to run against all collection docs
     * @returns {array} all documents which pass your filter function
     */
    where(fun: (obj: Doc<T>) => boolean): Doc<T>[];
    /**
     * Map Reduce operation
     * @param {function} mapFunction - function to use as map function
     * @param {function} reduceFunction - function to use as reduce function
     * @returns {data} The result of your mapReduce operation
     */
    mapReduce<U1, U2>(mapFunction: (value: Doc<T>, index: number, array: Doc<T>[]) => U1, reduceFunction: (array: U1[]) => U2): U2;
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
     * Returns all values of a field.
     * @param {string} field - the field name
     * @return {any}: the array of values
     */
    extract(field: keyof T): any[];
    /**
     * Finds the minimum value of a field.
     * @param {string} field - the field name
     * @return {number} the minimum value
     */
    min(field: keyof T): number;
    /**
     * Finds the maximum value of a field.
     * @param {string} field - the field name
     * @return {number} the maximum value
     */
    max(field: keyof T): number;
    /**
     * Finds the minimum value and its index of a field.
     * @param {string} field - the field name
     * @return {object} - index and value
     */
    minRecord(field: keyof T): {
        index: number;
        value: number;
    };
    /**
     * Finds the maximum value and its index of a field.
     * @param {string} field - the field name
     * @return {object} - index and value
     */
    maxRecord(field: keyof T): {
        index: number;
        value: number;
    };
    /**
     * Returns all values of a field as numbers (if possible).
     * @param {string} field - the field name
     * @return {number[]} - the number array
     */
    extractNumerical(field: keyof T): number[];
    /**
     * Calculates the average numerical value of a field
     * @param {string} field - the field name
     * @returns {number} average of property in all docs in the collection
     */
    avg(field: keyof T): number;
    /**
     * Calculate the standard deviation of a field.
     * @param {string} field - the field name
     * @return {number} the standard deviation
     */
    stdDev(field: keyof T): number;
    /**
     * Calculates the mode of a field.
     * @param {string} field - the field name
     * @return {number} the mode
     */
    mode(field: keyof T): number;
    /**
     * Calculates the median of a field.
     * @param {string} field - the field name
     * @return {number} the median
     */
    median(field: keyof T): number;
}
export declare namespace Collection {
    interface Options<TData extends object, TNested extends object = {}, T extends object = TData & TNested> {
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
        nestedProperties?: (keyof TNested | {
            name: keyof TNested;
            path: string[];
        })[];
        fullTextSearch?: FullTextSearch.FieldOptions[];
    }
    interface RangedIndexOptions {
        [prop: string]: RangedIndexMeta;
    }
    interface DeserializeOptions {
        retainDirtyFlags?: boolean;
        fullTextSearch?: Dict<Analyzer>;
        [collName: string]: any | {
            proto?: any;
            inflate?: (src: object, dest?: object) => void;
        };
    }
    interface BinaryIndex {
        dirty: boolean;
        values: any;
    }
    interface RangedIndexMeta {
        index?: IRangedIndex<any>;
        indexTypeName?: string;
        comparatorName?: string;
    }
    interface Change {
        name: string;
        operation: string;
        obj: any;
    }
    interface Serialized {
        name: string;
        unindexedSortComparator: string;
        defaultLokiOperatorPackage: string;
        _dynamicViews: DynamicView[];
        _nestedProperties: {
            name: string;
            path: string[];
        }[];
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
    interface CheckIndexOptions {
        randomSampling?: boolean;
        randomSamplingFactor?: number;
        repair?: boolean;
    }
    type Transform<T extends object = object> = {
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
    interface TTL {
        age: number;
        ttlInterval: number;
        daemon: any;
    }
}
