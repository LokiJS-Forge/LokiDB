import { LokiEventEmitter } from "./event_emitter";
import { ResultSet } from "./result_set";
import { Collection } from "./collection";
import { Doc } from "../../common/types";
import { Scorer } from "../../full-text-search/src/scorer";
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
 *
 * @param <TData> - the data type
 * @param <TNested> - nested properties of data type
 */
export declare class DynamicView<T extends object = object> extends LokiEventEmitter {
    readonly name: string;
    private _collection;
    private _persistent;
    private _sortPriority;
    private _minRebuildInterval;
    private _rebuildPending;
    private _resultSet;
    private _resultData;
    private _resultDirty;
    private _cachedResultSet;
    private _filterPipeline;
    private _sortFunction;
    private _sortCriteria;
    private _sortCriteriaSimple;
    private _sortByScoring;
    private _sortDirty;
    /**
     * Constructor.
     * @param {Collection} collection - a reference to the collection to work agains
     * @param {string} name - the name of this dynamic view
     * @param {object} options - the options
     * @param {boolean} [options.persistent=false] - indicates if view is to main internal results array in 'resultdata'
     * @param {string} [options.sortPriority="passive"] - the sort priority
     * @param {number} [options.minRebuildInterval=1] - minimum rebuild interval (need clarification to docs here)
     */
    constructor(collection: Collection<T>, name: string, options?: DynamicView.Options);
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
    private _rematerialize({removeWhereFilters});
    /**
     * Makes a copy of the internal ResultSet for branched queries.
     * Unlike this dynamic view, the branched ResultSet will not be 'live' updated,
     * so your branched query should be immediately resolved and not held for future evaluation.
     * @param {(string|array=)} transform - Optional name of collection transform, or an array of transform steps
     * @param {object} parameters - optional parameters (if optional transform requires them)
     * @returns {ResultSet} A copy of the internal ResultSet for branched queries.
     */
    branchResultSet(transform?: string | Collection.Transform<T>[], parameters?: object): ResultSet<T>;
    /**
     * Override of toJSON to avoid circular references.
     */
    toJSON(): DynamicView.Serialized;
    static fromJSONObject(collection: Collection, obj: DynamicView.Serialized): DynamicView;
    /**
     * Used to clear pipeline and reset dynamic view to initial state.
     * Existing options should be retained.
     * @param {boolean} queueSortPhase - (default: false) if true we will async rebuild view (maybe set default to true in future?)
     */
    removeFilters({queueSortPhase}?: {
        queueSortPhase?: boolean;
    }): void;
    /**
     * Used to apply a sort to the dynamic view
     * @example
     * dv.applySort(function(obj1, obj2) {
       *   if (obj1.name === obj2.name) return 0;
       *   if (obj1.name > obj2.name) return 1;
       *   if (obj1.name < obj2.name) return -1;
       * });
     * @param {function} comparefun - a javascript compare function used for sorting
     * @returns {DynamicView} this DynamicView object, for further chain ops.
     */
    applySort(comparefun: (lhs: Doc<T>, rhs: Doc<T>) => number): this;
    /**
     * Used to specify a property used for view translation.
     * @param {string} field - the field name
     * @param {boolean|object=} options - boolean for sort descending or options object
     * @param {boolean} [options.desc=false] - whether we should sort descending.
     * @param {boolean} [options.disableIndexIntersect=false] - whether we should explicity not use array intersection.
     * @param {boolean} [options.forceIndexIntersect=false] - force array intersection (if binary index exists).
     * @param {boolean} [options.useJavascriptSorting=false] - whether results are sorted via basic javascript sort.
     * @returns {DynamicView} this DynamicView object, for further chain ops.
     * @example
     * dv.applySimpleSort("name");
     */
    applySimpleSort(field: keyof T, options?: boolean | ResultSet.SimpleSortOptions): this;
    /**
     * Allows sorting a ResultSet based on multiple columns.
     * @param {Array} criteria - array of property names or subarray of [propertyname, isdesc] used evaluate sort order
     * @returns {DynamicView} Reference to this DynamicView, sorted, for future chain operations.
     * @example
     * // to sort by age and then name (both ascending)
     * dv.applySortCriteria(['age', 'name']);
     * // to sort by age (ascending) and then by name (descending)
     * dv.applySortCriteria(['age', ['name', true]]);
     * // to sort by age (descending) and then by name (descending)
     * dv.applySortCriteria([['age', true], ['name', true]]);
     */
    applySortCriteria(criteria: (keyof T | [keyof T, boolean])[]): this;
    /**
     * Used to apply a sort by the latest full-text-search scoring.
     * @param {boolean} [ascending=false] - sort ascending
     */
    applySortByScoring(ascending?: boolean): this;
    /**
     * Returns the scoring of the last full-text-search.
     * @returns {ScoreResult[]}
     */
    getScoring(): Scorer.ScoreResult[];
    /**
     * Marks the beginning of a transaction.
     * @returns {DynamicView} this DynamicView object, for further chain ops.
     */
    startTransaction(): this;
    /**
     * Commits a transaction.
     * @returns {DynamicView} this DynamicView object, for further chain ops.
     */
    commit(): this;
    /**
     * Rolls back a transaction.
     * @returns {DynamicView} this DynamicView object, for further chain ops.
     */
    rollback(): this;
    /**
     * Find the index of a filter in the pipeline, by that filter's ID.
     * @param {(string|number)} uid - The unique ID of the filter.
     * @returns {number}: index of the referenced filter in the pipeline; -1 if not found.
     */
    private _indexOfFilterWithId(uid);
    /**
     * Add the filter object to the end of view's filter pipeline and apply the filter to the ResultSet.
     * @param {object} filter - The filter object. Refer to applyFilter() for extra details.
     */
    private _addFilter(filter);
    /**
     * Reapply all the filters in the current pipeline.
     *
     * @returns {DynamicView} this DynamicView object, for further chain ops.
     */
    reapplyFilters(): this;
    /**
     * Adds or updates a filter in the DynamicView filter pipeline
     * @param {object} filter - A filter object to add to the pipeline.
     *    The object is in the format { 'type': filter_type, 'val', filter_param, 'uid', optional_filter_id }
     * @returns {DynamicView} this DynamicView object, for further chain ops.
     */
    applyFilter(filter: DynamicView.Filter<T>): this;
    /**
     * applyFind() - Adds or updates a mongo-style query option in the DynamicView filter pipeline
     *
     * @param {object} query - A mongo-style query object to apply to pipeline
     * @param {(string|number)} uid - Optional: The unique ID of this filter, to reference it in the future.
     * @returns {DynamicView} this DynamicView object, for further chain ops.
     */
    applyFind(query: object, uid?: string | number): this;
    /**
     * Adds or updates a javascript filter function in the DynamicView filter pipeline
     * @param {function} fun - A javascript filter function to apply to pipeline
     * @param {(string|number)} uid - Optional: The unique ID of this filter, to reference it in the future.
     * @returns {DynamicView} this DynamicView object, for further chain ops.
     */
    applyWhere(fun: (obj: Doc<T>) => boolean, uid?: string | number): this;
    /**
     * Remove the specified filter from the DynamicView filter pipeline
     * @param {(string|number)} uid - The unique ID of the filter to be removed.
     * @returns {DynamicView} this DynamicView object, for further chain ops.
     */
    removeFilter(uid: string | number): this;
    /**
     * Returns the number of documents representing the current DynamicView contents.
     * @returns {number} The number of documents representing the current DynamicView contents.
     */
    count(): number;
    /**
     * Resolves and pending filtering and sorting, then returns document array as result.
     * @param {object} options - optional parameters to pass to ResultSet.data() if non-persistent
     * @param {boolean} [options.forceClones] - Allows forcing the return of cloned objects even when
     *        the collection is not configured for clone object.
     * @param {string} [options.forceCloneMethod] - Allows overriding the default or collection specified cloning method.
     *        Possible values include 'parse-stringify', 'jquery-extend-deep', 'shallow', 'shallow-assign'
     * @param {boolean} [options.removeMeta] - will force clones and strip $loki and meta properties from documents
     *
     * @returns {Array} An array of documents representing the current DynamicView contents.
     */
    data(options?: ResultSet.DataOptions): Doc<T>[];
    /**
     * When the view is not sorted we may still wish to be notified of rebuild events.
     * This event will throttle and queue a single rebuild event when batches of updates affect the view.
     */
    private _queueRebuildEvent();
    /**
     * If the view is sorted we will throttle sorting to either :
     * (1) passive - when the user calls data(), or
     * (2) active - once they stop updating and yield js thread control
     */
    private _queueSortPhase();
    /**
     * Invoked synchronously or asynchronously to perform final sort phase (if needed)
     */
    private _performSortPhase(options?);
    /**
     * (Re)evaluating document inclusion.
     * Called by : collection.insert() and collection.update().
     * @param {int} objIndex - index of document to (re)run through filter pipeline.
     * @param {boolean} isNew - true if the document was just added to the collection.
     * @hidden
     */
    _evaluateDocument(objIndex: number, isNew: boolean): void;
    /**
     * Internal function called on collection.delete().
     * @hidden
     */
    _removeDocument(objIndex: number): void;
    /**
     * Data transformation via user supplied functions
     * @param {function} mapFunction - this function accepts a single document for you to transform and return
     * @param {function} reduceFunction - this function accepts many (array of map outputs) and returns single value
     * @returns The output of your reduceFunction
     */
    mapReduce<U1, U2>(mapFunction: (item: T, index: number, array: T[]) => U1, reduceFunction: (array: U1[]) => U2): U2;
}
export declare namespace DynamicView {
    interface Options {
        persistent?: boolean;
        sortPriority?: SortPriority;
        minRebuildInterval?: number;
    }
    type SortPriority = "passive" | "active";
    interface Serialized {
        name: string;
        _persistent: boolean;
        _sortPriority: SortPriority;
        _minRebuildInterval: number;
        _resultSet: ResultSet<any>;
        _filterPipeline: Filter<any>[];
        _sortCriteria: (string | [string, boolean])[];
        _sortCriteriaSimple: {
            field: string;
            options: boolean | ResultSet.SimpleSortOptions;
        };
        _sortByScoring: boolean;
        _sortDirty: boolean;
    }
    type Filter<T extends object = object> = {
        type: "find";
        val: ResultSet.Query<Doc<T>>;
        uid: number | string;
    } | {
        type: "where";
        val: (obj: Doc<T>) => boolean;
        uid: number | string;
    };
}
