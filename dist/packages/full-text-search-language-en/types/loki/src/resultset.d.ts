import { Collection } from "./collection";
import { CloneMethod } from "./clone";
import { Doc, Query } from "../../common/types";
import { ScoreResult } from "../../full-text-search/src/scorer";
export declare type ANY = any;
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
    $between(a: any, vals: any): boolean;
    $in(a: any, b: any): boolean;
    $nin(a: any, b: any): boolean;
    $keyin(a: any, b: any): boolean;
    $nkeyin(a: any, b: any): boolean;
    $definedin(a: any, b: any): boolean;
    $undefinedin(a: any, b: any): boolean;
    $regex(a: any, b: any): any;
    $containsString(a: any, b: any): boolean;
    $containsNone(a: any, b: any): boolean;
    $containsAny(a: any, b: any): any;
    $contains(a: any, b: any): any;
    $type(a: any, b: any): any;
    $finite(a: any, b: any): boolean;
    $size(a: any, b: any): any;
    $len(a: any, b: any): any;
    $where(a: any, b: any): boolean;
    $not(a: any, b: any): boolean;
    $and(a: any, b: any): boolean;
    $or(a: any, b: any): boolean;
};
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
export declare class Resultset<E extends object = object> {
    collection: Collection<E>;
    filteredrows: number[];
    filterInitialized: boolean;
    private _scoring;
    /**
     * Constructor.
     * @param {Collection} collection - the collection which this Resultset will query against
     */
    constructor(collection: Collection<E>);
    /**
     * reset() - Reset the resultset to its initial state.
     *
     * @returns {Resultset} Reference to this resultset, for future chain operations.
     */
    reset(): Resultset<E>;
    /**
     * toJSON() - Override of toJSON to avoid circular references
     *
     */
    toJSON(): Resultset<E>;
    /**
     * Allows you to limit the number of documents passed to next chain operation.
     *    A resultset copy() is made to avoid altering original resultset.
     *
     * @param {int} qty - The number of documents to return.
     * @returns {Resultset} Returns a copy of the resultset, limited by qty, for subsequent chain ops.
     */
    limit(qty: number): Resultset<E>;
    /**
     * Used for skipping 'pos' number of documents in the resultset.
     *
     * @param {int} pos - Number of documents to skip; all preceding documents are filtered out.
     * @returns {Resultset} Returns a copy of the resultset, containing docs starting at 'pos' for subsequent chain ops.
     */
    offset(pos: number): Resultset<E>;
    /**
     * copy() - To support reuse of resultset in branched query situations.
     *
     * @returns {Resultset} Returns a copy of the resultset (set) but the underlying document references will be the same.
     */
    copy(): Resultset<E>;
    /**
     * Alias of copy()
     */
    branch(): Resultset<E>;
    /**
     * Executes a named collection transform or raw array of transform steps against the resultset.
     *
     * @param {(string|array)} transform - name of collection transform or raw transform array
     * @param {object} [parameters=] - object property hash of parameters, if the transform requires them.
     * @returns {Resultset} either (this) resultset or a clone of of this resultset (depending on steps)
     */
    transform(transform: string | any[], parameters?: object): Resultset<E>;
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
    sort(comparefun: (a: E, b: E) => number): Resultset<E>;
    /**
     * Simpler, loose evaluation for user to sort based on a property name. (chainable).
     *    Sorting based on the same lt/gt helper functions used for binary indices.
     *
     * @param {string} propname - name of property to sort by.
     * @param {boolean} isdesc - (Optional) If true, the property will be sorted in descending order
     * @returns {Resultset} Reference to this resultset, sorted, for future chain operations.
     */
    simplesort(propname: string, isdesc?: boolean): Resultset<E>;
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
    compoundsort(properties: (string | [string, boolean])[]): Resultset<E>;
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
     * Sorts the resultset based on the last full-text-search scoring.
     * @param {boolean} [ascending=false] - sort ascending
     * @returns {Resultset<E extends Object>}
     */
    sortByScoring(ascending?: boolean): Resultset<E>;
    /**
     * Returns the scoring of the last full-text-search.
     * @returns {ScoreResult}
     */
    getScoring(): ScoreResult;
    /**
     * findOr() - oversee the operation of OR'ed query expressions.
     *    OR'ed expression evaluation runs each expression individually against the full collection,
     *    and finally does a set OR on each expression's results.
     *    Each evaluation can utilize a binary index to prevent multiple linear array scans.
     *
     * @param {array} expressionArray - array of expressions
     * @returns {Resultset} this resultset for further chain ops.
     */
    findOr(expressionArray: Query[]): Resultset<E>;
    $or(expressionArray: Query[]): Resultset<E>;
    /**
     * findAnd() - oversee the operation of AND'ed query expressions.
     *    AND'ed expression evaluation runs each expression progressively against the full collection,
     *    internally utilizing existing chained resultset functionality.
     *    Only the first filter can utilize a binary index.
     *
     * @param {array} expressionArray - array of expressions
     * @returns {Resultset} this resultset for further chain ops.
     */
    findAnd(expressionArray: Query[]): Resultset<E>;
    $and(expressionArray: Query[]): Resultset<E>;
    /**
     * Used for querying via a mongo-style query object.
     *
     * @param {object} query - A mongo-style query object used for filtering current results.
     * @param {boolean} firstOnly - (Optional) Used by collection.findOne() - flag if this was invoked via findOne()
     * @returns {Resultset} this resultset for further chain ops.
     */
    find(query?: Query, firstOnly?: boolean): Resultset<E>;
    /**
     * Used for filtering via a javascript filter function.
     *
     * @param {function} fun - A javascript function used for filtering current results by.
     * @returns {Resultset} this resultset for further chain ops.
     */
    where(fun: (obj: E) => boolean): Resultset<E>;
    /**
     * Returns the number of documents in the resultset.
     * @returns {number} The number of documents in the resultset.
     */
    count(): number;
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
    data(options?: Resultset.DataOptions): Doc<E>[];
    /**
     * Used to run an update operation on all documents currently in the resultset.
     *
     * @param {function} updateFunction - User supplied updateFunction(obj) will be executed for each document object.
     * @returns {Resultset} this resultset for further chain ops.
     */
    update(updateFunction: (obj: E) => E): Resultset<E>;
    /**
     * Removes all document objects which are currently in resultset from collection (as well as resultset)
     *
     * @returns {Resultset} this (empty) resultset for further chain ops.
     */
    remove(): Resultset<E>;
    /**
     * data transformation via user supplied functions
     *
     * @param {function} mapFunction - this function accepts a single document for you to transform and return
     * @param {function} reduceFunction - this function accepts many (array of map outputs) and returns single value
     * @returns {value} The output of your reduceFunction
     */
    mapReduce<T, U>(mapFunction: (item: E, index: number, array: E[]) => T, reduceFunction: (array: T[]) => U): U;
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
    eqJoin(joinData: ANY, leftJoinKey: string | Function, rightJoinKey: string | Function, mapFun?: Function, dataOptions?: ANY): ANY;
    /**
     * Applies a map function into a new collection for further chaining.
     * @param {function} mapFun - javascript map function
     * @param {object} [dataOptions=] - options to data() before input to your map function
     * @param {boolean} dataOptions.removeMeta - allows removing meta before calling mapFun
     * @param {boolean} dataOptions.forceClones - forcing the return of cloned objects to your map object
     * @param {string} dataOptions.forceCloneMethod - Allows overriding the default or collection specified cloning method.
     */
    map<U extends object>(mapFun: (obj: E, index: number, array: E[]) => U, dataOptions?: Resultset.DataOptions): Resultset<U>;
}
export declare namespace Resultset {
    interface DataOptions {
        forceClones?: boolean;
        forceCloneMethod?: CloneMethod;
        removeMeta?: boolean;
    }
}
