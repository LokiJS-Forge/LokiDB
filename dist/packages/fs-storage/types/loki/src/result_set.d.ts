import { Collection } from "./collection";
import { CloneMethod } from "./clone";
import { Doc } from "../../common/types";
import { Scorer } from "../../full-text-search/src/scorer";
import { Query as FullTextSearchQuery } from "../../full-text-search/src/query_types";
/**
 * ResultSet class allowing chainable queries.  Intended to be instanced internally.
 *    Collection.find(), Collection.where(), and Collection.chain() instantiate this.
 *
 * @example
 *    mycollection.chain()
 *      .find({ 'doors' : 4 })
 *      .where(function(obj) { return obj.name === 'Toyota' })
 *      .data();
 *
 * @param <TData> - the data type
 * @param <TNested> - nested properties of data type
 */
export declare class ResultSet<T extends object = object> {
    _collection: Collection<T>;
    _filteredRows: number[];
    _filterInitialized: boolean;
    private _scoring;
    /**
     * Constructor.
     * @param {Collection} collection - the collection which this ResultSet will query against
     */
    constructor(collection: Collection<T>);
    /**
     * Reset the ResultSet to its initial state.
     * @returns {ResultSet} Reference to this ResultSet, for future chain operations.
     */
    reset(): this;
    /**
     * Override of toJSON to avoid circular references
     */
    toJSON(): ResultSet<T>;
    /**
     * Allows you to limit the number of documents passed to next chain operation.
     * A ResultSet copy() is made to avoid altering original ResultSet.
     * @param {int} qty - The number of documents to return.
     * @returns {ResultSet} Returns a copy of the ResultSet, limited by qty, for subsequent chain ops.
     */
    limit(qty: number): this;
    /**
     * Used for skipping 'pos' number of documents in the ResultSet.
     * @param {int} pos - Number of documents to skip; all preceding documents are filtered out.
     * @returns {ResultSet} Returns a copy of the ResultSet, containing docs starting at 'pos' for subsequent chain ops.
     */
    offset(pos: number): this;
    /**
     * To support reuse of ResultSet in branched query situations.
     * @returns {ResultSet} Returns a copy of the ResultSet (set) but the underlying document references will be the same.
     */
    copy(): ResultSet<T>;
    /**
     * Executes a named collection transform or raw array of transform steps against the ResultSet.
     * @param {(string|array)} transform - name of collection transform or raw transform array
     * @param {object} [parameters=] - object property hash of parameters, if the transform requires them.
     * @returns {ResultSet} either (this) ResultSet or a clone of of this ResultSet (depending on steps)
     */
    transform(transform: string | Collection.Transform<T>[], parameters?: object): this;
    /**
     * User supplied compare function is provided two documents to compare. (chainable)
     * @example
     *    rslt.sort(function(obj1, obj2) {
       *      if (obj1.name === obj2.name) return 0;
       *      if (obj1.name > obj2.name) return 1;
       *      if (obj1.name < obj2.name) return -1;
       *    });
     * @param {function} comparefun - A javascript compare function used for sorting.
     * @returns {ResultSet} Reference to this ResultSet, sorted, for future chain operations.
     */
    sort(comparefun: (a: Doc<T>, b: Doc<T>) => number): this;
    /**
     * Simpler, loose evaluation for user to sort based on a property name. (chainable).
     * Sorting based on the same lt/gt helper functions used for binary indices.
     * @param {string} propname - name of property to sort by.
     * @param {boolean|object=} options - boolean for sort descending or options object
     * @param {boolean} [options.desc=false] - whether to sort descending
     * @param {string} [options.sortComparator] override default with name of comparator registered in ComparatorMap
     * @returns {ResultSet} Reference to this ResultSet, sorted, for future chain operations.
     */
    simplesort(propname: keyof T, options?: boolean | ResultSet.SimpleSortOptions): this;
    /**
     * Allows sorting a ResultSet based on multiple columns.
     * @example
     * // to sort by age and then name (both ascending)
     * rs.compoundsort(['age', 'name']);
     * // to sort by age (ascending) and then by name (descending)
     * rs.compoundsort(['age', ['name', true]);
     * @param {array} properties - array of property names or subarray of [propertyname, isdesc] used evaluate sort order
     * @returns {ResultSet} Reference to this ResultSet, sorted, for future chain operations.
     */
    compoundsort(properties: (keyof T | [keyof T, boolean])[]): this;
    /**
     * Helper function for compoundsort(), performing individual object comparisons
     * @param {Array} properties - array of property names, in order, by which to evaluate sort order
     * @param {object} obj1 - first object to compare
     * @param {object} obj2 - second object to compare
     * @returns {number} 0, -1, or 1 to designate if identical (sortwise) or which should be first
     */
    private _compoundeval(properties, obj1, obj2);
    /**
     * Sorts the ResultSet based on the last full-text-search scoring.
     * @param {boolean} [ascending=false] - sort ascending
     * @returns {ResultSet}
     */
    sortByScoring(ascending?: boolean): this;
    /**
     * Returns the scoring of the last full-text-search.
     * @returns {ScoreResult[]}
     */
    getScoring(): Scorer.ScoreResult[];
    /**
     * Oversee the operation of OR'ed query expressions.
     * OR'ed expression evaluation runs each expression individually against the full collection,
     * and finally does a set OR on each expression's results.
     * Each evaluation can utilize a binary index to prevent multiple linear array scans.
     * @param {array} expressionArray - array of expressions
     * @returns {ResultSet} this ResultSet for further chain ops.
     */
    findOr(expressionArray: ResultSet.Query<Doc<T>>[]): this;
    $or(expressionArray: ResultSet.Query<Doc<T>>[]): this;
    /**
     * Oversee the operation of AND'ed query expressions.
     * AND'ed expression evaluation runs each expression progressively against the full collection,
     * internally utilizing existing chained ResultSet functionality.
     * Only the first filter can utilize a binary index.
     * @param {array} expressionArray - array of expressions
     * @returns {ResultSet} this ResultSet for further chain ops.
     */
    findAnd(expressionArray: ResultSet.Query<Doc<T>>[]): this;
    $and(expressionArray: ResultSet.Query<Doc<T>>[]): this;
    /**
     * Used for querying via a mongo-style query object.
     *
     * @param {object} query - A mongo-style query object used for filtering current results.
     * @param {boolean} firstOnly - (Optional) Used by collection.findOne() - flag if this was invoked via findOne()
     * @returns {ResultSet} this ResultSet for further chain ops.
     */
    find(query?: ResultSet.Query<Doc<T>>, firstOnly?: boolean): this;
    /**
     * Used for filtering via a javascript filter function.
     * @param {function} fun - A javascript function used for filtering current results by.
     * @returns {ResultSet} this ResultSet for further chain ops.
     */
    where(fun: (obj: Doc<T>) => boolean): this;
    /**
     * Returns the number of documents in the ResultSet.
     * @returns {number} The number of documents in the ResultSet.
     */
    count(): number;
    /**
     * Terminates the chain and returns array of filtered documents
     * @param {object} options
     * @param {boolean} [options.forceClones] - Allows forcing the return of cloned objects even when
     *        the collection is not configured for clone object.
     * @param {string} [options.forceCloneMethod] - Allows overriding the default or collection specified cloning method.
     *        Possible values 'parse-stringify', 'deep', and 'shallow' and
     * @param {boolean} [options.removeMeta] - will force clones and strip $loki and meta properties from documents
     *
     * @returns {Array} Array of documents in the ResultSet
     */
    data(options?: ResultSet.DataOptions): Doc<T>[];
    /**
     * Used to run an update operation on all documents currently in the ResultSet.
     * @param {function} updateFunction - User supplied updateFunction(obj) will be executed for each document object.
     * @returns {ResultSet} this ResultSet for further chain ops.
     */
    update(updateFunction: (obj: Doc<T>) => Doc<T>): this;
    /**
     * Removes all document objects which are currently in ResultSet from collection (as well as ResultSet)
     * @returns {ResultSet} this (empty) ResultSet for further chain ops.
     */
    remove(): this;
    /**
     * data transformation via user supplied functions
     *
     * @param {function} mapFunction - this function accepts a single document for you to transform and return
     * @param {function} reduceFunction - this function accepts many (array of map outputs) and returns single value
     * @returns {value} The output of your reduceFunction
     */
    mapReduce<U1, U2>(mapFunction: (item: Doc<T>, index: number, array: Doc<T>[]) => U1, reduceFunction: (array: U1[]) => U2): U2;
    /**
     * Left joining two sets of data. Join keys can be defined or calculated properties
     * eqJoin expects the right join key values to be unique.  Otherwise left data will be joined on the last joinData object with that key
     * @param {Array|ResultSet|Collection} joinData - Data array to join to.
     * @param {(string|function)} leftJoinKey - Property name in this result set to join on or a function to produce a value to join on
     * @param {(string|function)} rightJoinKey - Property name in the joinData to join on or a function to produce a value to join on
     * @param {function} [mapFun=] - a function that receives each matching pair and maps them into output objects - function(left,right){return joinedObject}
     * @param {object} [dataOptions=] - optional options to apply to data() calls for left and right sides
     * @param {boolean} dataOptions.removeMeta - allows removing meta before calling mapFun
     * @param {boolean} dataOptions.forceClones - forcing the return of cloned objects to your map object
     * @param {string} dataOptions.forceCloneMethod - allows overriding the default or collection specified cloning method
     * @returns {ResultSet} A ResultSet with data in the format [{left: leftObj, right: rightObj}]
     */
    eqJoin(joinData: Collection<any> | ResultSet<any> | any[], leftJoinKey: string | ((obj: any) => string), rightJoinKey: string | ((obj: any) => string), mapFun?: (left: any, right: any) => any, dataOptions?: ResultSet.DataOptions): ResultSet<any>;
    /**
     * Applies a map function into a new collection for further chaining.
     * @param {function} mapFun - javascript map function
     * @param {object} [dataOptions=] - options to data() before input to your map function
     * @param {boolean} dataOptions.removeMeta - allows removing meta before calling mapFun
     * @param {boolean} dataOptions.forceClones - forcing the return of cloned objects to your map object
     * @param {string} dataOptions.forceCloneMethod - Allows overriding the default or collection specified cloning method
     * @return {ResultSet}
     */
    map<U extends object>(mapFun: (obj: Doc<T>, index: number, array: Doc<T>[]) => U, dataOptions?: ResultSet.DataOptions): ResultSet<U>;
}
export declare namespace ResultSet {
    interface DataOptions {
        forceClones?: boolean;
        forceCloneMethod?: CloneMethod;
        removeMeta?: boolean;
    }
    interface SimpleSortOptions {
        desc?: boolean;
        sortComparator?: string;
    }
    type ContainsHelperType<R> = R extends string ? string | string[] : R extends any[] ? R[number] | R[number][] : R extends object ? keyof R | (keyof R)[] : never;
    type LokiOps<R> = {
        $eq?: R;
    } | {
        $ne?: R;
    } | {
        $gt?: R;
    } | {
        $gte?: R;
    } | {
        $lt?: R;
    } | {
        $lte?: R;
    } | {
        $between?: [R, R];
    } | {
        $in?: R[];
    } | {
        $nin?: R[];
    } | {
        $keyin?: object;
    } | {
        $nkeyin?: object;
    } | {
        $definedin?: object;
    } | {
        $undefinedin?: object;
    } | {
        $regex?: RegExp | string | [string, string];
    } | {
        $containsNone?: ContainsHelperType<R>;
    } | {
        $containsAny?: ContainsHelperType<R>;
    } | {
        $contains?: ContainsHelperType<R>;
    } | {
        $type?: string;
    } | {
        $finite?: boolean;
    } | {
        $size?: number;
    } | {
        $len?: number;
    } | {
        $where?: (val?: R) => boolean;
    };
    type Query<T> = {
        [P in keyof T]?: LokiOps<T[P]> | T[P];
    } & {
        $and?: Query<T>[];
    } & {
        $or?: Query<T>[];
    } & {
        $fts?: FullTextSearchQuery;
    };
}
