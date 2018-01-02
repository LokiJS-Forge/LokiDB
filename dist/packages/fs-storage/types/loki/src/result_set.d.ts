import { Collection } from "./collection";
import { CloneMethod } from "./clone";
import { Doc } from "../../common/types";
import { Scorer } from "../../full-text-search/src/scorer";
import { Query as FullTextSearchQuery } from "../../full-text-search/src/query_builder";
/**
 * @hidden
 */
export declare const LokiOps: {
    $eq(a: any, b: any): boolean;
    $aeq(a: any, b: any): boolean;
    $ne(a: any, b: any): boolean;
    $dteq(a: any, b: any): boolean;
    $gt(a: any, b: any): boolean;
    $gte(a: any, b: any): boolean;
    $lt(a: any, b: any): boolean;
    $lte(a: any, b: any): boolean;
    $between(a: any, range: [any, any]): boolean;
    $in(a: any, b: any): boolean;
    $nin(a: any, b: any): boolean;
    $keyin(a: string, b: object): boolean;
    $nkeyin(a: string, b: object): boolean;
    $definedin(a: string, b: object): boolean;
    $undefinedin(a: string, b: object): boolean;
    $regex(a: string, b: RegExp): boolean;
    $containsString(a: any, b: string): boolean;
    $containsNone(a: any, b: any): boolean;
    $containsAny(a: any, b: any): boolean;
    $contains(a: any, b: any): boolean;
    $type(a: any, b: any): boolean;
    $finite(a: number, b: boolean): boolean;
    $size(a: any, b: any): boolean;
    $len(a: any, b: any): boolean;
    $where(a: any, b: any): boolean;
    $not(a: any, b: any): boolean;
    $and(a: any, b: any): boolean;
    $or(a: any, b: any): boolean;
};
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
export declare class ResultSet<TData extends object = object, TNested extends object = object> {
    _collection: Collection<TData, TNested>;
    _filteredRows: number[];
    _filterInitialized: boolean;
    private _scoring;
    /**
     * Constructor.
     * @param {Collection} collection - the collection which this ResultSet will query against
     */
    constructor(collection: Collection<TData, TNested>);
    /**
     * reset() - Reset the ResultSet to its initial state.
     *
     * @returns {ResultSet} Reference to this ResultSet, for future chain operations.
     */
    reset(): this;
    /**
     * Override of toJSON to avoid circular references
     *
     */
    toJSON(): ResultSet<TData, TNested>;
    /**
     * Allows you to limit the number of documents passed to next chain operation.
     *    A ResultSet copy() is made to avoid altering original ResultSet.
     *
     * @param {int} qty - The number of documents to return.
     * @returns {ResultSet} Returns a copy of the ResultSet, limited by qty, for subsequent chain ops.
     */
    limit(qty: number): this;
    /**
     * Used for skipping 'pos' number of documents in the ResultSet.
     *
     * @param {int} pos - Number of documents to skip; all preceding documents are filtered out.
     * @returns {ResultSet} Returns a copy of the ResultSet, containing docs starting at 'pos' for subsequent chain ops.
     */
    offset(pos: number): this;
    /**
     * copy() - To support reuse of ResultSet in branched query situations.
     *
     * @returns {ResultSet} Returns a copy of the ResultSet (set) but the underlying document references will be the same.
     */
    copy(): ResultSet<TData, TNested>;
    /**
     * Alias of copy()
     */
    branch(): ResultSet<TData, TNested>;
    /**
     * Executes a named collection transform or raw array of transform steps against the ResultSet.
     *
     * @param {(string|array)} transform - name of collection transform or raw transform array
     * @param {object} [parameters=] - object property hash of parameters, if the transform requires them.
     * @returns {ResultSet} either (this) ResultSet or a clone of of this ResultSet (depending on steps)
     */
    transform(transform: string | Collection.Transform<TData, TNested>[], parameters?: object): this;
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
     * @returns {ResultSet} Reference to this ResultSet, sorted, for future chain operations.
     */
    sort(comparefun: (a: Doc<TData>, b: Doc<TData>) => number): this;
    /**
     * Simpler, loose evaluation for user to sort based on a property name. (chainable).
     *    Sorting based on the same lt/gt helper functions used for binary indices.
     *
     * @param {string} propname - name of property to sort by.
     * @param {boolean} [descending=false] - if true, the property will be sorted in descending order
     * @returns {ResultSet} Reference to this ResultSet, sorted, for future chain operations.
     */
    simplesort(propname: keyof (TData & TNested), descending?: boolean): this;
    /**
     * Allows sorting a ResultSet based on multiple columns.
     * @example
     * // to sort by age and then name (both ascending)
     * rs.compoundsort(['age', 'name']);
     * // to sort by age (ascending) and then by name (descending)
     * rs.compoundsort(['age', ['name', true]);
     *
     * @param {array} properties - array of property names or subarray of [propertyname, isdesc] used evaluate sort order
     * @returns {ResultSet} Reference to this ResultSet, sorted, for future chain operations.
     */
    compoundsort(properties: (keyof (TData & TNested) | [keyof (TData & TNested), boolean])[]): this;
    /**
     * Helper function for compoundsort(), performing individual object comparisons
     *
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
     * @returns {ScoreResult}
     */
    getScoring(): Scorer.ScoreResult;
    /**
     * Oversee the operation of OR'ed query expressions.
     *    OR'ed expression evaluation runs each expression individually against the full collection,
     *    and finally does a set OR on each expression's results.
     *    Each evaluation can utilize a binary index to prevent multiple linear array scans.
     *
     * @param {array} expressionArray - array of expressions
     * @returns {ResultSet} this ResultSet for further chain ops.
     */
    findOr(expressionArray: ResultSet.Query<Doc<TData> & TNested>[]): this;
    $or(expressionArray: ResultSet.Query<Doc<TData> & TNested>[]): this;
    /**
     * Oversee the operation of AND'ed query expressions.
     *    AND'ed expression evaluation runs each expression progressively against the full collection,
     *    internally utilizing existing chained ResultSet functionality.
     *    Only the first filter can utilize a binary index.
     *
     * @param {array} expressionArray - array of expressions
     * @returns {ResultSet} this ResultSet for further chain ops.
     */
    findAnd(expressionArray: ResultSet.Query<Doc<TData> & TNested>[]): this;
    $and(expressionArray: ResultSet.Query<Doc<TData> & TNested>[]): this;
    /**
     * Used for querying via a mongo-style query object.
     *
     * @param {object} query - A mongo-style query object used for filtering current results.
     * @param {boolean} firstOnly - (Optional) Used by collection.findOne() - flag if this was invoked via findOne()
     * @returns {ResultSet} this ResultSet for further chain ops.
     */
    find(query?: ResultSet.Query<Doc<TData> & TNested>, firstOnly?: boolean): this;
    /**
     * Used for filtering via a javascript filter function.
     *
     * @param {function} fun - A javascript function used for filtering current results by.
     * @returns {ResultSet} this ResultSet for further chain ops.
     */
    where(fun: (obj: Doc<TData>) => boolean): this;
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
    data(options?: ResultSet.DataOptions): Doc<TData>[];
    /**
     * Used to run an update operation on all documents currently in the ResultSet.
     *
     * @param {function} updateFunction - User supplied updateFunction(obj) will be executed for each document object.
     * @returns {ResultSet} this ResultSet for further chain ops.
     */
    update(updateFunction: (obj: Doc<TData>) => TData): this;
    /**
     * Removes all document objects which are currently in ResultSet from collection (as well as ResultSet)
     *
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
    mapReduce<T, U>(mapFunction: (item: TData, index: number, array: TData[]) => T, reduceFunction: (array: T[]) => U): U;
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
    map<U extends object>(mapFun: (obj: TData, index: number, array: TData[]) => U, dataOptions?: ResultSet.DataOptions): ResultSet<U>;
}
export declare namespace ResultSet {
    interface DataOptions {
        forceClones?: boolean;
        forceCloneMethod?: CloneMethod;
        removeMeta?: boolean;
    }
    type LokiOps<R> = {
        $eq?: R;
        $aeq?: R;
        $ne?: R;
        $dteq?: R;
        $gt?: R;
        $gte?: R;
        $lt?: R;
        $lte?: R;
        $between?: [R, R];
        $in?: R[];
        $nin?: R[];
        $keyin?: object;
        $nkeyin?: object;
        $definedin?: object;
        $undefinedin?: object;
        $regex?: RegExp | string | [string, string];
        $containsString?: string;
        $containsNone?: R[] | R;
        $containsAny?: R[] | R;
        $contains?: any;
        $type?: string;
        $finite?: boolean;
        $size?: number;
        $len?: number;
        $where?: (val?: R) => boolean;
    };
    type Query<TData> = {
        [P in keyof TData]?: LokiOps<TData[P]> | TData[P];
    } & {
        $and?: Query<TData>[];
    } & {
        $or?: Query<TData>[];
    } & {
        $fts?: FullTextSearchQuery;
    };
}
