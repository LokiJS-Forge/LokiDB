import { Collection } from "./collection";
import { clone, CloneMethod } from "./clone";
import { sortHelper, LokiOperatorPackageMap } from "./operator_packages";
import { ComparatorMap, ILokiComparer } from "./comparators";
import { Doc } from "../../common/types";
import { Scorer } from "../../full-text-search/src/scorer";
import { Query as FullTextSearchQuery } from "../../full-text-search/src/query_types";

// used to recursively scan hierarchical transform step object for param substitution
function resolveTransformObject<T extends object>(subObj: Collection.Transform<T>, params: object, depth: number = 0): Collection.Transform<T> {
  if (++depth >= 10) {
    return subObj;
  }

  for (const prop in subObj) {
    if (typeof subObj[prop] === "string" && subObj[prop].indexOf("[%lktxp]") === 0) {
      const pname = subObj[prop].substring(8);
      if (params[pname] !== undefined) {
        subObj[prop] = params[pname];
      }
    } else if (typeof subObj[prop] === "object") {
      subObj[prop] = resolveTransformObject(subObj[prop], params, depth);
    }
  }
  return subObj;
}

// top level utility to resolve an entire (single) transform (array of steps) for parameter substitution
function resolveTransformParams<T extends object>(transform: Collection.Transform<T>[], params: object): Collection.Transform<T>[] {
  if (params === undefined) {
    return transform;
  }

  // iterate all steps in the transform array
  const resolvedTransform: Collection.Transform<T>[] = [];
  for (let idx = 0; idx < transform.length; idx++) {
    // clone transform so our scan/replace can operate directly on cloned transform
    const clonedStep = clone(transform[idx], "shallow-recurse");
    resolvedTransform.push(resolveTransformObject<T>(clonedStep, params));
  }

  return resolvedTransform;
}

/**
 * @hidden
 */
// if an op is registered in this object, our 'calculateRange' can use it with our binary indices.
// if the op is registered to a function, we will run that function/op as a 2nd pass filter on results.
// those 2nd pass filter functions should be similar to LokiOps functions, accepting 2 vals to compare.
const indexedOps = {
  $eq: true,
  $dteq: true,
  $gt: true,
  $gte: true,
  $lt: true,
  $lte: true,
  $in: true,
  $between: true
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
export class ResultSet<T extends object = object> {

  public _collection: Collection<T>;
  public _filteredRows: number[] = [];
  public _filterInitialized: boolean = false;
  // Holds the scoring result of the last full-text search.
  private _scoring: Scorer.ScoreResults = null;

  /**
   * Constructor.
   * @param {Collection} collection - the collection which this ResultSet will query against
   */
  constructor(collection: Collection<T>) {
    // retain reference to collection we are querying against
    this._collection = collection;
  }

  /**
   * Reset the ResultSet to its initial state.
   * @returns {ResultSet} Reference to this ResultSet, for future chain operations.
   */
  public reset(): this {
    if (this._filteredRows.length > 0) {
      this._filteredRows = [];
    }
    this._filterInitialized = false;
    return this;
  }

  /**
   * Override of toJSON to avoid circular references
   */
  public toJSON(): ResultSet<T> {
    const copy = this.copy();
    copy._collection = null;
    return copy;
  }

  /**
   * Allows you to limit the number of documents passed to next chain operation.
   * A ResultSet copy() is made to avoid altering original ResultSet.
   * @param {int} qty - The number of documents to return.
   * @returns {ResultSet} Returns a copy of the ResultSet, limited by qty, for subsequent chain ops.
   */
  public limit(qty: number): this {
    // if this has no filters applied, we need to populate filteredRows first
    if (!this._filterInitialized && this._filteredRows.length === 0) {
      this._filteredRows = [...this._collection._data.keys()];
    }

    this._filteredRows = this._filteredRows.slice(0, qty);
    this._filterInitialized = true;
    return this;
  }

  /**
   * Used for skipping 'pos' number of documents in the ResultSet.
   * @param {int} pos - Number of documents to skip; all preceding documents are filtered out.
   * @returns {ResultSet} Returns a copy of the ResultSet, containing docs starting at 'pos' for subsequent chain ops.
   */
  public offset(pos: number): this {
    // if this has no filters applied, we need to populate filteredRows first
    if (!this._filterInitialized && this._filteredRows.length === 0) {
      this._filteredRows = [...this._collection._data.keys()];
    }

    this._filteredRows = this._filteredRows.slice(pos);
    this._filterInitialized = true;
    return this;
  }

  /**
   * To support reuse of ResultSet in branched query situations.
   * @returns {ResultSet} Returns a copy of the ResultSet (set) but the underlying document references will be the same.
   */
  public copy(): ResultSet<T> {
    const result = new ResultSet<T>(this._collection);
    result._filteredRows = this._filteredRows.slice();
    result._filterInitialized = this._filterInitialized;
    return result;
  }

  /**
   * Executes a named collection transform or raw array of transform steps against the ResultSet.
   * @param {(string|array)} transform - name of collection transform or raw transform array
   * @param {object} [parameters=] - object property hash of parameters, if the transform requires them.
   * @returns {ResultSet} either (this) ResultSet or a clone of of this ResultSet (depending on steps)
   */
  public transform(transform: string | Collection.Transform<T>[], parameters?: object): this {
    // if transform is name, then do lookup first
    if (typeof transform === "string") {
      transform = this._collection._transforms[transform];
    }

    if (parameters !== undefined) {
      transform = resolveTransformParams(transform, parameters);
    }

    let rs = this;
    for (let idx = 0; idx < transform.length; idx++) {
      const step = transform[idx];

      switch (step.type) {
        case "find":
          rs.find(step.value as ResultSet.Query<Doc<T>>);
          break;
        case "where":
          rs.where(step.value as (obj: Doc<T>) => boolean);
          break;
        case "simplesort":
          rs.simplesort(step.property, step.options);
          break;
        case "compoundsort":
          rs.compoundsort(step.value);
          break;
        case "sort":
          rs.sort(step.value);
          break;
        case "sortByScoring":
          rs.sortByScoring(step.desc);
          break;
        case "limit":
          rs = rs.limit(step.value);
          break; // limit makes copy so update reference
        case "offset":
          rs = rs.offset(step.value);
          break; // offset makes copy so update reference
        case "map":
          rs = rs.map(step.value, step.dataOptions) as any as this;
          break;
        case "eqJoin":
          rs = rs.eqJoin(step.joinData, step.leftJoinKey, step.rightJoinKey, step.mapFun, step.dataOptions) as this;
          break;
        // following cases break chain by returning array data so make any of these last in transform steps
        case "mapReduce":
          rs = rs.mapReduce(step.mapFunction, step.reduceFunction);
          break;
        // following cases update documents in current filtered ResultSet (use carefully)
        case "update":
          rs.update(step.value);
          break;
        case "remove":
          rs.remove();
          break;
        default:
          break;
      }
    }
    return rs;
  }

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
  public sort(comparefun: (a: Doc<T>, b: Doc<T>) => number): this {
    // if this has no filters applied, just we need to populate filteredRows first
    if (!this._filterInitialized && this._filteredRows.length === 0) {
      this._filteredRows = [...this._collection._data.keys()];
    }

    const data = this._collection._data;
    const wrappedComparer = (a: number, b: number) => comparefun(data.get(a), data.get(b));

    this._filteredRows.sort(wrappedComparer);

    return this;
  }

  /**
   * Simpler, loose evaluation for user to sort based on a property name. (chainable).
   * Sorting based on the same lt/gt helper functions used for binary indices.
   * @param {string} propname - name of property to sort by.
   * @param {boolean|object=} options - boolean for sort descending or options object
   * @param {boolean} [options.desc=false] - whether to sort descending
   * @param {string} [options.sortComparator] override default with name of comparator registered in ComparatorMap
   * @returns {ResultSet} Reference to this ResultSet, sorted, for future chain operations.
   */
  public simplesort(propname: keyof T, options: boolean | ResultSet.SimpleSortOptions = { desc: false }): this {
    if (typeof options === "boolean") {
      options = {
        desc: options
      };
    }

    if (!this._filterInitialized && this._collection._rangedIndexes.hasOwnProperty(propname)) {
      this._filteredRows = this._collection._rangedIndexes[propname].index.rangeRequest();
      this._filterInitialized = true;
      return this;
    }

    // if this has no filters applied, just we need to populate filteredRows first
    if (!this._filterInitialized && this._filteredRows.length === 0) {
      this._filteredRows = [...this._collection._data.keys()];
    }

    const data = this._collection._data;

    let comparator : ILokiComparer<any> =
      (options.sortComparator) ?
        ComparatorMap[options.sortComparator] :
        ComparatorMap[this._collection._unindexedSortComparator];

    const wrappedComparer = (a: number, b: number) => {
      return comparator(data.get(a)[propname], data.get(b)[propname]);
    };

    this._filteredRows.sort(wrappedComparer);

    if (options.desc) {
      this._filteredRows.reverse();
    }

    return this;
  }

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
  public compoundsort(properties: (keyof T | [keyof T, boolean])[]): this {
    if (properties.length === 0) {
      throw new Error("Invalid call to compoundsort, need at least one property");
    }

    if (properties.length === 1) {
      const prop = properties[0];
      if (typeof prop === "string") {
        return this.simplesort(prop, false);
      } else {
        return this.simplesort(prop[0] as keyof T, prop[1] as boolean | ResultSet.SimpleSortOptions);
      }
    }

    // unify the structure of 'properties' to avoid checking it repeatedly while sorting
    for (let i = 0, len = properties.length; i < len; i++) {
      const prop = properties[i];
      if (typeof prop === "string") {
        properties[i] = [prop, false];
      }
    }

    // if this has no filters applied, just we need to populate filteredRows first
    if (!this._filterInitialized && this._filteredRows.length === 0) {
      this._filteredRows = [...this._collection._data.keys()];
    }

    const data = this._collection._data;
    const wrappedComparer = (a: number, b: number) =>
      this._compoundeval(properties as [keyof T, boolean][], data.get(a), data.get(b));

    this._filteredRows.sort(wrappedComparer);

    return this;
  }

  /**
   * Helper function for compoundsort(), performing individual object comparisons
   * @param {Array} properties - array of property names, in order, by which to evaluate sort order
   * @param {object} obj1 - first object to compare
   * @param {object} obj2 - second object to compare
   * @returns {number} 0, -1, or 1 to designate if identical (sortwise) or which should be first
   */
  private _compoundeval(properties: [keyof T, boolean][], obj1: T, obj2: T): number {
    for (let i = 0, len = properties.length; i < len; i++) {
      const prop = properties[i];
      const field = prop[0];
      const res = sortHelper(obj1[field], obj2[field], prop[1]);
      if (res !== 0) {
        return res;
      }
    }
    return 0;
  }

  /**
   * Sorts the ResultSet based on the last full-text-search scoring.
   * @param {boolean} [ascending=false] - sort ascending
   * @returns {ResultSet}
   */
  public sortByScoring(ascending = false): this {
    if (this._scoring === null) {
      throw new Error("No scoring available");
    }

    if (ascending) {
      this._filteredRows.sort((a: number, b: number) => this._scoring[a].score - this._scoring[b].score);
    } else {
      this._filteredRows.sort((a: number, b: number) => this._scoring[b].score - this._scoring[a].score);
    }

    return this;
  }

  /**
   * Returns the scoring of the last full-text-search.
   * @returns {ScoreResult[]}
   */
  public getScoring(): Scorer.ScoreResult[] {
    if (this._scoring === null) {
      throw new Error("No scoring available");
    }
    const scoring: Scorer.ScoreResult[] = [];
    for (let i = 0; i < this._filteredRows.length; i++) {
      scoring.push(this._scoring[this._filteredRows[i]]);
    }
    return scoring;
  }

  /**
   * Oversee the operation of OR'ed query expressions.
   * OR'ed expression evaluation runs each expression individually against the full collection,
   * and finally does a set OR on each expression's results.
   * Each evaluation can utilize a binary index to prevent multiple linear array scans.
   * @param {array} expressionArray - array of expressions
   * @returns {ResultSet} this ResultSet for further chain ops.
   */
  public findOr(expressionArray: ResultSet.Query<Doc<T>>[]): this {
    const docset = [];
    const idxset = [];
    const origCount = this.count();

    // If filter is already initialized, then we query against only those items already in filter.
    // This means no index utilization for fields, so hopefully its filtered to a smallish filteredRows.
    for (let ei = 0, elen = expressionArray.length; ei < elen; ei++) {
      // we need to branch existing query to run each filter separately and combine results
      const fr = this.copy().find(expressionArray[ei])._filteredRows;
      const frlen = fr.length;
      // if the find operation did not reduce the initial set, then the initial set is the actual result
      if (frlen === origCount) {
        return this;
      }

      // add any document 'hits'
      for (let fri = 0; fri < frlen; fri++) {
        const idx = fr[fri];
        if (idxset[idx] === undefined) {
          idxset[idx] = true;
          docset.push(idx);
        }
      }
    }

    this._filteredRows = docset;
    this._filterInitialized = true;

    return this;
  }

  public $or(expressionArray: ResultSet.Query<Doc<T>>[]): this {
    return this.findOr(expressionArray);
  }

  /**
   * Oversee the operation of AND'ed query expressions.
   * AND'ed expression evaluation runs each expression progressively against the full collection,
   * internally utilizing existing chained ResultSet functionality.
   * Only the first filter can utilize a binary index.
   * @param {array} expressionArray - array of expressions
   * @returns {ResultSet} this ResultSet for further chain ops.
   */
  public findAnd(expressionArray: ResultSet.Query<Doc<T>>[]): this {
    // we have already implementing method chaining in this (our ResultSet class)
    // so lets just progressively apply user supplied and filters
    for (let i = 0, len = expressionArray.length; i < len; i++) {
      if (this.count() === 0) {
        return this;
      }
      this.find(expressionArray[i]);
    }
    return this;
  }

  public $and(expressionArray: ResultSet.Query<Doc<T>>[]): this {
    return this.findAnd(expressionArray);
  }

  /**
   * Used for querying via a mongo-style query object.
   *
   * @param {object} query - A mongo-style query object used for filtering current results.
   * @param {boolean} firstOnly - (Optional) Used by collection.findOne() - flag if this was invoked via findOne()
   * @returns {ResultSet} this ResultSet for further chain ops.
   */
  public find(query?: ResultSet.Query<Doc<T>>, firstOnly = false): this {
    if (this._collection._data.size === 0) {
      this._filteredRows = [];
      this._filterInitialized = true;
      return this;
    }

    const queryObject = query || "getAll";
    let property: any;
    let queryObjectOp: any;
    let value: any;

    if (typeof queryObject === "object") {
      let filters = [];
      for (let p in queryObject) {
        let obj = {};
        obj[p as any] = queryObject[p];
        filters.push(obj);

        if (queryObject[p] !== undefined) {
          property = p;
          queryObjectOp = queryObject[p];
        }
      }
      // if more than one expression in single query object,
      // convert implicit $and to explicit $and
      if (filters.length > 1) {
        return this.find({ "$and": filters } as any, firstOnly);
      }
    }

    // apply no filters if they want all
    if (!property || queryObject === "getAll") {
      if (firstOnly) {
        this._filteredRows = (this._collection._data.size > 0) ? [0 /* TODOOOOOOOOOO */] : [];
        this._filterInitialized = true;
      }
      return this;
    }

    // injecting $and and $or expression tree evaluation here.
    if (property === "$and" || property === "$or") {
      this[property](queryObjectOp);

      // for chained find with firstOnly,
      if (firstOnly && this._filteredRows.length > 1) {
        this._filteredRows = this._filteredRows.slice(0, 1);
      }

      return this;
    }

    // see if query object is in shorthand mode (assuming eq operator)
    let operator = "";
    if (queryObjectOp === null || (typeof queryObjectOp !== "object" || queryObjectOp instanceof Date)) {
      operator = "$eq";
      value = queryObjectOp;
    } else if (typeof queryObjectOp === "object") {
      for (let key in queryObjectOp) {
        if (queryObjectOp[key] !== undefined) {
          operator = key;
          value = queryObjectOp[key];
          break;
        }
      }
    } else {
      throw new Error("Do not know what you want to do.");
    }

    // for regex ops, precompile
    if (operator === "$regex") {
      if (Array.isArray(value)) {
        value = new RegExp(value[0], value[1]);
      } else if (!(value instanceof RegExp)) {
        value = new RegExp(value as any);
      }
    }

    // if an index exists for the property being queried against, use it
    // for now only enabling where it is the first filter applied and prop is indexed
    const doIndexCheck = !this._filterInitialized;

    let searchByIndex = false;

    if (doIndexCheck && this._collection._rangedIndexes[property] && indexedOps[operator]) {
      searchByIndex = true;
    }

    // the comparison function
    const operatorPackage = LokiOperatorPackageMap[this._collection._defaultLokiOperatorPackage];
    // "shortcut" for collection data
    const data = this._collection._data;

    // Query executed differently depending on :
    //    - whether the property being queried has an index defined
    //    - if chained, we handle first pass differently for initial filteredRows[] population
    //
    // For performance reasons, each case has its own if block to minimize in-loop calculations

    let result: number[] = [];
    // If the filteredRows[] is already initialized, use it
    if (this._filterInitialized) {
      let filter = this._filteredRows;
      
      if (property === "$fts") {
        this._scoring = this._collection._fullTextSearch.search(queryObject.$fts as FullTextSearchQuery);
        const keys = Object.keys(this._scoring);
        for (let i = 0; i < keys.length; i++) {
          if (filter.indexOf(+keys[i]) !== -1) {
            result.push(+keys[i]);
          }
        }
      } else if (this._collection._constraints.unique[property] !== undefined && operator === "$eq") {
        const lokiId  = this._collection._constraints.unique[property].get(value);

        if (filter.indexOf(lokiId) !== -1) {
          result.push(lokiId);
        }
      } else {
        for (let i = 0; i < filter.length; i++) {
          let lokiId = filter[i];

          // calling operator as method property of operator package preserves 'this'
          if (operatorPackage[operator](data.get(lokiId)[property], value)) {
            result.push(lokiId);
          }
        }
      }

      this._filteredRows = result;
      this._filterInitialized = true; // next time work against filteredRows[]
      return this;
    }

    this._filteredRows = result;
    this._filterInitialized = true; // next time work against filteredRows[]

    if (property === "$fts") {
      this._scoring = this._collection._fullTextSearch.search(queryObject.$fts as FullTextSearchQuery);
      let keys = Object.keys(this._scoring);
      for (let i = 0; i < keys.length; i++) {
        result.push(+keys[i]);
      }
      return this;
    }

    // Use unique constraint for search.
    if (this._collection._constraints.unique[property] !== undefined && operator === "$eq") {
      // convert back to position for filtered rows (until we refactor filteredrows to store $loki instead of data pos)
      result.push(this._collection._constraints.unique[property].get(value));
      return this;
    }

    // if not searching by index
    if (!searchByIndex) {
      // determine comparator to use for ops
      for (const doc of data.values()) {
        // calling operator as method property of operator package preserves 'this'
        if (operatorPackage[operator](doc[property], value)) {
          result.push(doc.$loki);
          if (firstOnly) {
            return this;
          }
        }
      }
      return this;
    }

    // If we have a rangedIndex defined, use that and bail
    if (this._collection._rangedIndexes[property]) {

      if (operator === "$in") {
        let ri: Collection.RangedIndexMeta = this._collection._rangedIndexes[property];

        // iterate each $in array value
        for (let val of value) {
          // request matches where val eq current iterated val
          let idResult = ri.index.rangeRequest({ op: "$eq", val: val });
          // for each result in match
          for (const id of idResult) {
            result.push(id);
          }
        }
        return this;
      }

      if (operator === "$between") {
        let idResult = this._collection._rangedIndexes[property].index.rangeRequest({
          op: operator,
          val: value[0],
          high: value[1]
        });

        // for now we will have to 'shim' the binary tree index's $loki ids back
        // into data array indices, ideally i would like to repurpose filteredrows to use loki ids
        for (let id of idResult) {
          result.push(id);
        }

        return this;
      }

      let idResult = this._collection._rangedIndexes[property].index.rangeRequest({
        op: operator,
        val: value
      });

      // if our op requires 'second pass'
      if (indexedOps[operator] !== true) {
        for (let id of idResult) {
          if (indexedOps[operator](data.get(id)[property], value)) {
            result.push(id);
          }
        }
      }
      else {
        // for now we will have to 'shim' the binary tree index's $loki ids back
        // into data array indices, ideally i would like to repurpose filteredrows to use loki ids
        for (let id of idResult) {
          result.push(id);
        }
      }
    }

    return this;
  }


  /**
   * Used for filtering via a javascript filter function.
   * @param {function} fun - A javascript function used for filtering current results by.
   * @returns {ResultSet} this ResultSet for further chain ops.
   */
  public where(fun: (obj: Doc<T>) => boolean): this {
    let viewFunction;
    let result = [];

    if ("function" === typeof fun) {
      viewFunction = fun;
    } else {
      throw new TypeError("Argument is not a stored view or a function");
    }

    // If the filteredRows[] is already initialized, use it
    if (this._filterInitialized) {
      let j = this._filteredRows.length;

      while (j--) {
        if (viewFunction(this._collection._data.get(this._filteredRows[j])) === true) {
          result.push(this._filteredRows[j]);
        }
      }

      this._filteredRows = result;

      return this;
    }
    // otherwise this is initial chained op, work against data, push into filteredRows[]
    else {
      for (const doc of this._collection._data.values()) {
        if (viewFunction(doc)) {
          result.push(doc.$loki);
        }
      }

      this._filteredRows = result;
      this._filterInitialized = true;

      return this;
    }
  }

  /**
   * Returns the number of documents in the ResultSet.
   * @returns {number} The number of documents in the ResultSet.
   */
  public count(): number {
    if (this._filterInitialized) {
      return this._filteredRows.length;
    }
    return this._collection.count();
  }

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
  public data(options: ResultSet.DataOptions = {}): Doc<T>[] {
    let forceClones: boolean;
    let forceCloneMethod: CloneMethod;
    let removeMeta: boolean;
    (
      {
        forceClones = false,
        forceCloneMethod = this._collection._cloneMethod,
        removeMeta = false
      } = options
    );

    let result = [];
    let data = this._collection._data;
    let obj;
    let method: CloneMethod;

    // if user opts to strip meta, then force clones and use 'shallow' if 'force' options are not present
    if (removeMeta && !forceClones) {
      forceClones = true;
      forceCloneMethod = "shallow";
    }

    // if collection has delta changes active, then force clones and use CloneMethod.DEEP for effective change tracking of nested objects
    if (!this._collection._disableDeltaChangesApi) {
      forceClones = true;
      forceCloneMethod = "deep";
    }

    // if this has no filters applied, just return collection.data
    if (!this._filterInitialized) {
      if (this._filteredRows.length === 0) {
        // determine whether we need to clone objects or not
        if (this._collection._cloneObjects || forceClones) {
          method = forceCloneMethod;

          for (const doc of data.values()) {
            obj = this._collection._defineNestedProperties(clone(doc, method));
            if (removeMeta) {
              delete obj.$loki;
              delete obj.meta;
            }
            result.push(obj);
          }
          return result;
        }
        // otherwise we are not cloning so return sliced array with same object references
        else {
          return [...data.values()];
        }
      } else {
        // filteredRows must have been set manually, so use it
        this._filterInitialized = true;
      }
    }

    const fr = this._filteredRows;
    if (this._collection._cloneObjects || forceClones) {
      method = forceCloneMethod;
      for (let i = 0; i < fr.length; i++) {
        obj = this._collection._defineNestedProperties(clone(data.get(fr[i]), method));
        if (removeMeta) {
          delete obj.$loki;
          delete obj.meta;
        }
        result.push(obj);
      }
    } else {
      for (let i = 0; i < fr.length; i++) {
        result.push(data.get(fr[i]));
      }
    }
    return result;
  }

  /**
   * Used to run an update operation on all documents currently in the ResultSet.
   * @param {function} updateFunction - User supplied updateFunction(obj) will be executed for each document object.
   * @returns {ResultSet} this ResultSet for further chain ops.
   */
  public update(updateFunction: (obj: Doc<T>) => Doc<T>): this {
    // if this has no filters applied, we need to populate filteredRows first
    if (!this._filterInitialized && this._filteredRows.length === 0) {
      this._filteredRows = [...this._collection._data.keys()];
    }

    const len = this._filteredRows.length;
    const rcd = this._collection._data;

    // pass in each document object currently in ResultSet to user supplied updateFunction
    for (let idx = 0; idx < len; idx++) {
      // if we have cloning option specified or are doing differential delta changes, clone object first
      if (this._collection._cloneObjects || !this._collection._disableDeltaChangesApi) {
        const obj = clone(rcd[this._filteredRows[idx]], this._collection._cloneMethod);
        updateFunction(obj);
        this._collection.update(obj);
      }
      else {
        // no need to clone, so just perform update on collection data object instance
        updateFunction(rcd[this._filteredRows[idx]]);
        this._collection.update(rcd[this._filteredRows[idx]]);
      }
    }

    return this;
  }

  /**
   * Removes all document objects which are currently in ResultSet from collection (as well as ResultSet)
   * @returns {ResultSet} this (empty) ResultSet for further chain ops.
   */
  public remove(): this {
    // if this has no filters applied, we need to populate filteredRows first
    if (!this._filterInitialized && this._filteredRows.length === 0) {
      this._filteredRows = [...this._collection._data.keys()];
    }
    this._collection.remove(this.data());
    this._filteredRows = [];
    return this;
  }

  /**
   * data transformation via user supplied functions
   *
   * @param {function} mapFunction - this function accepts a single document for you to transform and return
   * @param {function} reduceFunction - this function accepts many (array of map outputs) and returns single value
   * @returns {value} The output of your reduceFunction
   */
  public mapReduce<U1, U2>(mapFunction: (item: Doc<T>, index: number, array: Doc<T>[]) => U1,
    reduceFunction: (array: U1[]) => U2): U2 {
    try {
      return reduceFunction(this.data().map(mapFunction));
    } catch (err) {
      throw err;
    }
  }

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
  public eqJoin(joinData: Collection<any> | ResultSet<any> | any[], leftJoinKey: string | ((obj: any) => string),
    rightJoinKey: string | ((obj: any) => string), mapFun?: (left: any, right: any) => any,
    dataOptions?: ResultSet.DataOptions): ResultSet<any> {
    let rightData = [];
    let rightDataLength;
    let key;
    let result = [];
    let leftKeyisFunction = typeof leftJoinKey === "function";
    let rightKeyisFunction = typeof rightJoinKey === "function";
    let joinMap = {};

    //get the left data
    let leftData = this.data(dataOptions);
    let leftDataLength = leftData.length;

    //get the right data
    if (joinData instanceof Collection) {
      rightData = joinData.chain().data(dataOptions);
    } else if (joinData instanceof ResultSet) {
      rightData = joinData.data(dataOptions);
    } else if (Array.isArray(joinData)) {
      rightData = joinData;
    } else {
      throw new TypeError("joinData needs to be an array or result set");
    }
    rightDataLength = rightData.length;

    //construct a lookup table
    for (let i = 0; i < rightDataLength; i++) {
      key = rightKeyisFunction
        ? (rightJoinKey as (obj: any) => string)(rightData[i])
        : rightData[i][rightJoinKey as string];
      joinMap[key] = rightData[i];
    }

    if (!mapFun) {
      mapFun = (left: any, right: any) => ({
        left,
        right
      });
    }

    //Run map function over each object in the ResultSet
    for (let j = 0; j < leftDataLength; j++) {
      key = leftKeyisFunction
        ? (leftJoinKey as (obj: any) => string)(leftData[j])
        : leftData[j][leftJoinKey as string];
      result.push(mapFun(leftData[j], joinMap[key] || {}));
    }

    //return a new ResultSet with no filters
    this._collection = new Collection("joinData");
    this._collection.insert(result);
    this._filteredRows = [];
    this._filterInitialized = false;

    return this;
  }

  /**
   * Applies a map function into a new collection for further chaining.
   * @param {function} mapFun - javascript map function
   * @param {object} [dataOptions=] - options to data() before input to your map function
   * @param {boolean} dataOptions.removeMeta - allows removing meta before calling mapFun
   * @param {boolean} dataOptions.forceClones - forcing the return of cloned objects to your map object
   * @param {string} dataOptions.forceCloneMethod - Allows overriding the default or collection specified cloning method
   * @return {ResultSet}
   */
  public map<U extends object>(mapFun: (obj: Doc<T>, index: number, array: Doc<T>[]) => U,
    dataOptions?: ResultSet.DataOptions): ResultSet<U> {
    const data = this.data(dataOptions).map(mapFun);
    //return return a new ResultSet with no filters
    this._collection = new Collection("mappedData");
    this._collection.insert(data as any as T);
    this._filteredRows = [];
    this._filterInitialized = false;
    return this as any as ResultSet<U>;
  }
}

export namespace ResultSet {
  export interface DataOptions {
    forceClones?: boolean;
    forceCloneMethod?: CloneMethod;
    removeMeta?: boolean;
  }

  export interface SimpleSortOptions {
    desc?: boolean;
    sortComparator?: string;
  }

  export type ContainsHelperType<R> =
    R extends string ? string | string[] :
    R extends any[] ? R[number] | R[number][] :
    R extends object ? keyof R | (keyof R)[] : never;

  export type LokiOps<R> = {
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
    $regex?: RegExp | string | [string, string] // string and [string, string] are better for serialization
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

  export type Query<T> =
    { [P in keyof T]?: LokiOps<T[P]> | T[P] }
    & { $and?: Query<T>[] }
    & { $or?: Query<T>[] }
    & { $fts?: FullTextSearchQuery };
}
