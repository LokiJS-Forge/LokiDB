import {Collection} from "./collection";
import {clone, CloneMethod} from "./clone";
import {ltHelper, gtHelper, aeqHelper, sortHelper} from "./helper";
import {Doc} from "../../common/types";
import {ScoreResult} from "../../full-text-search/src/scorer";
import {Query as FullTextSearchQuery} from "../../full-text-search/src/query_builder";

// used to recursively scan hierarchical transform step object for param substitution
function resolveTransformObject<E extends object, D extends object>(subObj: Collection.Transform<E, D>, params: object, depth: number = 0): Collection.Transform<E, D> {
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
function resolveTransformParams<E extends object, D extends object>(transform: Collection.Transform<E, D>[], params: object): Collection.Transform<E, D>[] {
  if (params === undefined) {
    return transform;
  }

  // iterate all steps in the transform array
  const resolvedTransform: Collection.Transform<E, D>[] = [];
  for (let idx = 0; idx < transform.length; idx++) {
    // clone transform so our scan/replace can operate directly on cloned transform
    const clonedStep = clone(transform[idx], "shallow-recurse-objects");
    resolvedTransform.push(resolveTransformObject<E, D>(clonedStep, params));
  }

  return resolvedTransform;
}

function containsCheckFn(a: any) {
  if (typeof a === "string" || Array.isArray(a)) {
    return (b: any) => (a as any).indexOf(b) !== -1;
  } else if (typeof a === "object" && a !== null) {
    return (b: string) => Object.hasOwnProperty.call(a, b);
  }
  return null;
}

function doQueryOp(val: any, op: object) {
  for (let p in op) {
    if (Object.hasOwnProperty.call(op, p)) {
      return LokiOps[p](val, op[p]);
    }
  }
  return false;
}


/**
 * @hidden
 */
export const LokiOps = {
  // comparison operators
  // a is the value in the _collection
  // b is the query value
  $eq(a: any, b: any): boolean {
    return a === b;
  },

  // abstract/loose equality
  $aeq(a: any, b: any): boolean {
    return a == b;
  },

  $ne(a: any, b: any): boolean {
    // ecma 5 safe test for NaN
    if (b !== b) {
      // ecma 5 test value is not NaN
      return (a === a);
    }
    return a !== b;
  },

  // date equality / loki abstract equality test
  $dteq(a: any, b: any): boolean {
    return aeqHelper(a, b);
  },

  $gt(a: any, b: any): boolean {
    return gtHelper(a, b, false);
  },

  $gte(a: any, b: any): boolean {
    return gtHelper(a, b, true);
  },

  $lt(a: any, b: any): boolean {
    return ltHelper(a, b, false);
  },

  $lte(a: any, b: any): boolean {
    return ltHelper(a, b, true);
  },

  $between(a: any, range: [any, any]): boolean {
    if (a === undefined || a === null) return false;
    return (gtHelper(a, range[0], true) && ltHelper(a, range[1], true));
  },

  $in(a: any, b: any): boolean {
    return b.indexOf(a) !== -1;
  },

  $nin(a: any, b: any): boolean {
    return b.indexOf(a) === -1;
  },

  $keyin(a: any, b: any): boolean {
    return a in b;
  },

  $nkeyin(a: any, b: any): boolean {
    return !(a in b);
  },

  $definedin(a: any, b: any): boolean {
    return b[a] !== undefined;
  },

  $undefinedin(a: any, b: any): boolean {
    return b[a] === undefined;
  },

  $regex(a: any, b: any): boolean {
    return b.test(a);
  },

  $containsString(a: any, b: any): boolean {
    return (typeof a === "string") && (a.indexOf(b) !== -1);
  },

  $containsNone(a: any, b: any): boolean {
    return !LokiOps.$containsAny(a, b);
  },

  $containsAny(a: any, b: any): boolean {
    const checkFn = containsCheckFn(a);
    if (checkFn !== null) {
      return (Array.isArray(b)) ? (b.some(checkFn)) : (checkFn(b));
    }
    return false;
  },

  $contains(a: any, b: any): boolean {
    const checkFn = containsCheckFn(a);
    if (checkFn !== null) {
      return (Array.isArray(b)) ? (b.every(checkFn)) : (checkFn(b));
    }
    return false;
  },

  $type(a: any, b: any): boolean {
    let type: string = typeof a;
    if (type === "object") {
      if (Array.isArray(a)) {
        type = "array";
      } else if (a instanceof Date) {
        type = "date";
      }
    }
    return (typeof b !== "object") ? (type === b) : doQueryOp(type, b);
  },

  $finite(a: any, b: any): boolean {
    return (b === isFinite(a));
  },

  $size(a: any, b: any): boolean {
    if (Array.isArray(a)) {
      return (typeof b !== "object") ? (a.length === b) : doQueryOp(a.length, b);
    }
    return false;
  },

  $len(a: any, b: any): boolean {
    if (typeof a === "string") {
      return (typeof b !== "object") ? (a.length === b) : doQueryOp(a.length, b);
    }
    return false;
  },

  $where(a: any, b: any): boolean {
    return b(a) === true;
  },

  // field-level logical operators
  // a is the value in the _collection
  // b is the nested query operation (for '$not')
  //   or an array of nested query operations (for '$and' and '$or')
  $not(a: any, b: any): boolean {
    return !doQueryOp(a, b);
  },

  $and(a: any, b: any): boolean {
    for (let idx = 0, len = b.length; idx < len; idx++) {
      if (!doQueryOp(a, b[idx])) {
        return false;
      }
    }
    return true;
  },

  $or(a: any, b: any): boolean {
    for (let idx = 0, len = b.length; idx < len; idx++) {
      if (doQueryOp(a, b[idx])) {
        return true;
      }
    }
    return false;
  }
};

// if an op is registered in this object, our 'calculateRange' can use it with our binary indices.
// if the op is registered to a function, we will run that function/op as a 2nd pass filter on results.
// those 2nd pass filter functions should be similar to LokiOps functions, accepting 2 vals to compare.
const indexedOps = {
  $eq: LokiOps.$eq,
  $aeq: true,
  $dteq: true,
  $gt: true,
  $gte: true,
  $lt: true,
  $lte: true,
  $in: true,
  $between: true
};

/**
 * dotSubScan - helper function used for dot notation queries.
 *
 * @param {object} root - object to traverse
 * @param {array} paths - array of properties to drill into
 * @param {function} fun - evaluation function to test with
 * @param {any} value - comparative value to also pass to (compare) fun
 * @param {number} pathOffset - index of the item in 'paths' to start the sub-scan from
 */
function dotSubScan(root: object, paths: string[], fun: (a: any, b: any) => boolean, value: any, pathOffset = 0) {
  const path = paths[pathOffset];
  if (root === undefined || root === null || root[path] === undefined) {
    return false;
  }

  let valueFound = false;
  const element = root[path];
  if (pathOffset + 1 >= paths.length) {
    // if we have already expanded out the dot notation,
    // then just evaluate the test function and value on the element
    valueFound = fun(element, value);
  } else if (Array.isArray(element)) {
    for (let index = 0, len = element.length; index < len; index++) {
      valueFound = dotSubScan(element[index], paths, fun, value, pathOffset + 1);
      if (valueFound === true) {
        break;
      }
    }
  } else {
    valueFound = dotSubScan(element, paths, fun, value, pathOffset + 1);
  }

  return valueFound;
}

/**
 * ResultSet class allowing chainable queries.  Intended to be instanced internally.
 *    Collection.find(), Collection.where(), and Collection.chain() instantiate this.
 *
 * @example
 *    mycollection.chain()
 *      .find({ 'doors' : 4 })
 *      .where(function(obj) { return obj.name === 'Toyota' })
 *      .data();
 */
export class ResultSet<E extends object = object, D extends object = object> {

  public _collection: Collection<E, D>;
  public _filteredRows: number[];
  public _filterInitialized: boolean;
  // Holds the scoring result of the last full-text search.
  private _scoring: ScoreResult;

  /**
   * Constructor.
   * @param {Collection} collection - the collection which this ResultSet will query against
   */
  constructor(collection: Collection<E, D>) {
    // retain reference to collection we are querying against
    this._collection = collection;
    this._filteredRows = [];
    this._filterInitialized = false;
    this._scoring = null;
  }

  /**
   * reset() - Reset the ResultSet to its initial state.
   *
   * @returns {ResultSet} Reference to this ResultSet, for future chain operations.
   */
  reset(): this {
    if (this._filteredRows.length > 0) {
      this._filteredRows = [];
    }
    this._filterInitialized = false;
    return this;
  }

  /**
   * Override of toJSON to avoid circular references
   *
   */
  public toJSON(): ResultSet<E, D> {
    const copy = this.copy();
    copy._collection = <never>null;
    return copy;
  }

  /**
   * Allows you to limit the number of documents passed to next chain operation.
   *    A ResultSet copy() is made to avoid altering original ResultSet.
   *
   * @param {int} qty - The number of documents to return.
   * @returns {ResultSet} Returns a copy of the ResultSet, limited by qty, for subsequent chain ops.
   */
  public limit(qty: number): this {
    // if this has no filters applied, we need to populate filteredRows first
    if (!this._filterInitialized && this._filteredRows.length === 0) {
      this._filteredRows = this._collection._prepareFullDocIndex();
    }

    this._filteredRows = this._filteredRows.slice(0, qty);
    this._filterInitialized = true;
    return this;
  }

  /**
   * Used for skipping 'pos' number of documents in the ResultSet.
   *
   * @param {int} pos - Number of documents to skip; all preceding documents are filtered out.
   * @returns {ResultSet} Returns a copy of the ResultSet, containing docs starting at 'pos' for subsequent chain ops.
   */
  public offset(pos: number): this {
    // if this has no filters applied, we need to populate filteredRows first
    if (!this._filterInitialized && this._filteredRows.length === 0) {
      this._filteredRows = this._collection._prepareFullDocIndex();
    }

    this._filteredRows = this._filteredRows.slice(pos);
    this._filterInitialized = true;
    return this;
  }

  /**
   * copy() - To support reuse of ResultSet in branched query situations.
   *
   * @returns {ResultSet} Returns a copy of the ResultSet (set) but the underlying document references will be the same.
   */
  public copy(): ResultSet<E, D> {
    const result = new ResultSet<E, D>(this._collection);
    result._filteredRows = this._filteredRows.slice();
    result._filterInitialized = this._filterInitialized;
    return result;
  }

  /**
   * Alias of copy()
   */
  public branch(): ResultSet<E, D> {
    return this.copy();
  }

  /**
   * Executes a named collection transform or raw array of transform steps against the ResultSet.
   *
   * @param {(string|array)} transform - name of collection transform or raw transform array
   * @param {object} [parameters=] - object property hash of parameters, if the transform requires them.
   * @returns {ResultSet} either (this) ResultSet or a clone of of this ResultSet (depending on steps)
   */
  public transform(transform: string | Collection.Transform<E, D>[], parameters?: object): this {
    // if transform is name, then do lookup first
    if (typeof transform === "string") {
      transform = this._collection.transforms[transform];
    }

    if (parameters !== undefined) {
      transform = resolveTransformParams(transform, parameters);
    }

    let rs = this;
    for (let idx = 0; idx < transform.length; idx++) {
      const step = transform[idx];

      switch (step.type) {
        case "find":
          rs.find(step.value as ResultSet.Query<Doc<E> & D>);
          break;
        case "where":
          rs.where(step.value as (obj: Doc<E>) => boolean);
          break;
        case "simplesort":
          rs.simplesort(step.property, step.desc);
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
   *
   * @param {function} comparefun - A javascript compare function used for sorting.
   * @returns {ResultSet} Reference to this ResultSet, sorted, for future chain operations.
   */
  public sort(comparefun: (a: Doc<E>, b: Doc<E>) => number): this {
    // if this has no filters applied, just we need to populate filteredRows first
    if (!this._filterInitialized && this._filteredRows.length === 0) {
      this._filteredRows = this._collection._prepareFullDocIndex();
    }

    const data = this._collection._data;
    const wrappedComparer = (a: number, b: number) => comparefun(data[a], data[b]);

    this._filteredRows.sort(wrappedComparer);

    return this;
  }

  /**
   * Simpler, loose evaluation for user to sort based on a property name. (chainable).
   *    Sorting based on the same lt/gt helper functions used for binary indices.
   *
   * @param {string} propname - name of property to sort by.
   * @param {boolean} [descending=false] - if true, the property will be sorted in descending order
   * @returns {ResultSet} Reference to this ResultSet, sorted, for future chain operations.
   */
  public simplesort(propname: keyof (E & D), descending: boolean = false): this {
    // if this has no filters applied, just we need to populate filteredRows first
    if (!this._filterInitialized && this._filteredRows.length === 0) {
      //TODO:
      // if we have a binary index and no other filters applied, we can use that instead of sorting (again)
      if (this._collection.binaryIndices[propname as keyof E] !== undefined) {
        // make sure index is up-to-date
        this._collection.ensureIndex(propname as keyof E);
        // copy index values into filteredRows
        this._filteredRows = this._collection.binaryIndices[propname as keyof E].values.slice(0);

        if (descending) {
          this._filteredRows.reverse();
        }

        // we are done, return this (ResultSet) for further chain ops
        return this;
      }
      // otherwise initialize array for sort below
      else {
        this._filteredRows = this._collection._prepareFullDocIndex();
      }
    }

    const data = this._collection._data;
    const wrappedComparer = (a: number, b: number) => {
      let val1, val2;
      if (~propname.indexOf(".")) {
        const arr = propname.split(".");
        val1 = arr.reduce(function (obj, i) {
          return obj && obj[i] || undefined;
        }, data[a]);
        val2 = arr.reduce(function (obj, i) {
          return obj && obj[i] || undefined;
        }, data[b]);
      } else {
        val1 = data[a][propname as keyof E];
        val2 = data[b][propname as keyof E];
      }
      return sortHelper(val1, val2, descending);
    };

    this._filteredRows.sort(wrappedComparer);

    return this;
  }

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
  public compoundsort(properties: (keyof (E & D) | [keyof (E & D), boolean])[]): this {
    if (properties.length === 0) {
      throw new Error("Invalid call to compoundsort, need at least one property");
    }

    if (properties.length === 1) {
      const prop = properties[0];
      if (typeof prop === "string") {
        return this.simplesort(prop, false);
      } else {
        return this.simplesort(prop[0] as keyof (E & D), prop[1] as boolean);
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
      this._filteredRows = this._collection._prepareFullDocIndex();
    }

    const data = this._collection._data;
    const wrappedComparer = (a: number, b: number) => this._compoundeval(properties as [string, boolean][], data[a], data[b]);

    this._filteredRows.sort(wrappedComparer);

    return this;
  }

  /**
   * Helper function for compoundsort(), performing individual object comparisons
   *
   * @param {Array} properties - array of property names, in order, by which to evaluate sort order
   * @param {object} obj1 - first object to compare
   * @param {object} obj2 - second object to compare
   * @returns {number} 0, -1, or 1 to designate if identical (sortwise) or which should be first
   */
  private _compoundeval(properties: [string, boolean][], obj1: E, obj2: E): number {
    for (let i = 0, len = properties.length; i < len; i++) {
      const prop = properties[i];
      const field = prop[0];
      let val1, val2, arr;
      if (~field.indexOf(".")) {
        arr = field.split(".");
        val1 = arr.reduce((obj: object, i: string) => {
          return obj && obj[i] || undefined;
        }, obj1);
        val2 = arr.reduce((obj: object, i: string) => {
          return obj && obj[i] || undefined;
        }, obj2);
      } else {
        val1 = obj1[field];
        val2 = obj2[field];
      }
      const res = sortHelper(val1, val2, prop[1]);
      if (res !== 0) {
        return res;
      }
    }
    return 0;
  }

  /**
   * Sorts the ResultSet based on the last full-text-search scoring.
   * @param {boolean} [ascending=false] - sort ascending
   * @returns {ResultSet<E extends Object>}
   */
  public sortByScoring(ascending = false): this {
    if (this._scoring === null) {
      throw new Error("No scoring available");
    }

    if (ascending) {
      this._filteredRows.sort((a: number, b: number) => this._scoring[a] - this._scoring[b]);
    } else {
      this._filteredRows.sort((a: number, b: number) => this._scoring[b] - this._scoring[a]);
    }

    return this;
  }

  /**
   * Returns the scoring of the last full-text-search.
   * @returns {ScoreResult}
   */
  public getScoring(): ScoreResult {
    if (this._scoring === null) {
      throw new Error("No scoring available");
    }
    return this._scoring;
  }

  /**
   * Oversee the operation of OR'ed query expressions.
   *    OR'ed expression evaluation runs each expression individually against the full collection,
   *    and finally does a set OR on each expression's results.
   *    Each evaluation can utilize a binary index to prevent multiple linear array scans.
   *
   * @param {array} expressionArray - array of expressions
   * @returns {ResultSet} this ResultSet for further chain ops.
   */
  public findOr(expressionArray: ResultSet.Query<Doc<E> & D>[]): this {
    const docset = [];
    const idxset = [];
    const origCount = this.count();

    // If filter is already initialized, then we query against only those items already in filter.
    // This means no index utilization for fields, so hopefully its filtered to a smallish filteredRows.
    for (let ei = 0, elen = expressionArray.length; ei < elen; ei++) {
      // we need to branch existing query to run each filter separately and combine results
      const fr = this.branch().find(expressionArray[ei])._filteredRows;
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

  public $or(expressionArray: ResultSet.Query<Doc<E> & D>[]): this {
    return this.findOr(expressionArray);
  }

  /**
   * Oversee the operation of AND'ed query expressions.
   *    AND'ed expression evaluation runs each expression progressively against the full collection,
   *    internally utilizing existing chained ResultSet functionality.
   *    Only the first filter can utilize a binary index.
   *
   * @param {array} expressionArray - array of expressions
   * @returns {ResultSet} this ResultSet for further chain ops.
   */
  public findAnd(expressionArray: ResultSet.Query<Doc<E> & D>[]): this {
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

  public $and(expressionArray: ResultSet.Query<Doc<E> & D>[]): this {
    return this.findAnd(expressionArray);
  }

  /**
   * Used for querying via a mongo-style query object.
   *
   * @param {object} query - A mongo-style query object used for filtering current results.
   * @param {boolean} firstOnly - (Optional) Used by collection.findOne() - flag if this was invoked via findOne()
   * @returns {ResultSet} this ResultSet for further chain ops.
   */
  public find(query?: ResultSet.Query<Doc<E> & D>, firstOnly = false): this {
    if (this._collection._data.length === 0) {
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
        return this.find({"$and": filters} as any, firstOnly);
      }
    }

    // apply no filters if they want all
    if (!property || queryObject === "getAll") {
      if (firstOnly) {
        this._filteredRows = (this._collection._data.length > 0) ? [0] : [];
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
    let operator;
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

    // if user is deep querying the object such as find('name.first': 'odin')
    const usingDotNotation = (property.indexOf(".") !== -1);

    // if an index exists for the property being queried against, use it
    // for now only enabling where it is the first filter applied and prop is indexed
    const doIndexCheck = !usingDotNotation && !this._filterInitialized;

    let searchByIndex = false;
    if (doIndexCheck && this._collection.binaryIndices[property] && indexedOps[operator]) {
      // this is where our lazy index rebuilding will take place
      // basically we will leave all indexes dirty until we need them
      // so here we will rebuild only the index tied to this property
      // ensureIndex() will only rebuild if flagged as dirty since we are not passing force=true param
      if (this._collection.adaptiveBinaryIndices !== true) {
        this._collection.ensureIndex(property);
      }
      searchByIndex = true;
    }

    // the comparison function
    const fun = LokiOps[operator];

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

      // currently supporting dot notation for non-indexed conditions only
      if (usingDotNotation) {
        property = property.split(".");
        for (let i = 0; i < filter.length; i++) {
          let rowIdx = filter[i];
          if (dotSubScan(data[rowIdx], property, fun, value)) {
            result.push(rowIdx);
          }
        }
      } else if (property === "$fts") {
        this._scoring = this._collection._fullTextSearch.search(query.$fts as FullTextSearchQuery);
        let keys = Object.keys(this._scoring);
        for (let i = 0; i < keys.length; i++) {
          if (filter.indexOf(+keys[i]) !== -1) {
            result.push(+keys[i]);
          }
        }
      } else if (this._collection.constraints.unique[property] !== undefined && operator === "$eq") {
        // Use unique constraint for search.
        let row = this._collection.constraints.unique[property].get(value);
        if (filter.indexOf(row) !== -1) {
          result.push(row);
        }
      } else {
        for (let i = 0; i < filter.length; i++) {
          let rowIdx = filter[i];
          if (fun(data[rowIdx][property], value)) {
            result.push(rowIdx);
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
      this._scoring = this._collection._fullTextSearch.search(query.$fts as FullTextSearchQuery);
      let keys = Object.keys(this._scoring);
      for (let i = 0; i < keys.length; i++) {
        result.push(+keys[i]);
      }
      return this;
    }

    // Use unique constraint for search.
    if (this._collection.constraints.unique[property] !== undefined && operator === "$eq") {
      result.push(this._collection.constraints.unique[property].get(value));
      return this;
    }

    // first chained query so work against data[] but put results in filteredRows
    // if not searching by index
    if (!searchByIndex) {
      if (usingDotNotation) {
        property = property.split(".");
        for (let i = 0; i < data.length; i++) {
          if (dotSubScan(data[i], property, fun, value)) {
            result.push(i);
            if (firstOnly) {
              return this;
            }
          }
        }
      } else {
        for (let i = 0; i < data.length; i++) {
          if (fun(data[i][property], value)) {
            result.push(i);
            if (firstOnly) {
              return this;
            }
          }
        }
      }
      return this;
    }

    let index = this._collection.binaryIndices[property];
    if (operator !== "$in") {
      // search by index
      const segm = this._collection.calculateRange(operator, property, value);
      for (let i = segm[0]; i <= segm[1]; i++) {
        if (indexedOps[operator] !== true) {
          // must be a function, implying 2nd phase filtering of results from calculateRange
          if (indexedOps[operator](data[index.values[i]][property], value)) {
            result.push(index.values[i]);
            if (firstOnly) {
              return this;
            }
          }
        } else {
          result.push(index.values[i]);
          if (firstOnly) {
            return this;
          }
        }
      }
    } else {
      const idxset = [];
      // query each value '$eq' operator and merge the segment results.
      for (let j = 0, len = value.length; j < len; j++) {
        const segm = this._collection.calculateRange("$eq", property, value[j]);
        for (let i = segm[0]; i <= segm[1]; i++) {
          if (idxset[i] === undefined) {
            idxset[i] = true;
            result.push(index.values[i]);
          }
          if (firstOnly) {
            return this;
          }
        }
      }
    }
    return this;
  }


  /**
   * Used for filtering via a javascript filter function.
   *
   * @param {function} fun - A javascript function used for filtering current results by.
   * @returns {ResultSet} this ResultSet for further chain ops.
   */
  public where(fun: (obj: Doc<E>) => boolean): this {
    let viewFunction;
    let result = [];

    if ("function" === typeof fun) {
      viewFunction = fun;
    } else {
      throw new TypeError("Argument is not a stored view or a function");
    }
    try {
      // If the filteredRows[] is already initialized, use it
      if (this._filterInitialized) {
        let j = this._filteredRows.length;

        while (j--) {
          if (viewFunction(this._collection._data[this._filteredRows[j]]) === true) {
            result.push(this._filteredRows[j]);
          }
        }

        this._filteredRows = result;

        return this;
      }
      // otherwise this is initial chained op, work against data, push into filteredRows[]
      else {
        let k = this._collection._data.length;

        while (k--) {
          if (viewFunction(this._collection._data[k]) === true) {
            result.push(k);
          }
        }

        this._filteredRows = result;
        this._filterInitialized = true;

        return this;
      }
    } catch (err) {
      throw err;
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
  public data(options: ResultSet.DataOptions = {}): Doc<E>[] {
    let forceClones: boolean;
    let forceCloneMethod: CloneMethod;
    let removeMeta: boolean;
    (
      {
        forceClones,
        forceCloneMethod = this._collection.cloneMethod,
        removeMeta = false
      } = options
    );

    let result = [];
    let data = this._collection._data;
    let obj;
    let len;
    let i;
    let method: CloneMethod;

    // if user opts to strip meta, then force clones and use 'shallow' if 'force' options are not present
    if (removeMeta && !forceClones) {
      forceClones = true;
      forceCloneMethod = "shallow";
    }

    // if collection has delta changes active, then force clones and use CloneMethod.DEEP for effective change tracking of nested objects
    if (!this._collection.disableDeltaChangesApi) {
      forceClones = true;
      forceCloneMethod = "deep";
    }

    // if this has no filters applied, just return collection.data
    if (!this._filterInitialized) {
      if (this._filteredRows.length === 0) {
        // determine whether we need to clone objects or not
        if (this._collection.cloneObjects || forceClones) {
          len = data.length;
          method = forceCloneMethod;

          for (i = 0; i < len; i++) {
            obj = clone(data[i], method);
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
          return data.slice();
        }
      } else {
        // filteredRows must have been set manually, so use it
        this._filterInitialized = true;
      }
    }

    const fr = this._filteredRows;
    len = fr.length;

    if (this._collection.cloneObjects || forceClones) {
      method = forceCloneMethod;
      for (i = 0; i < len; i++) {
        obj = clone(data[fr[i]], method);
        if (removeMeta) {
          delete obj.$loki;
          delete obj.meta;
        }
        result.push(obj);
      }
    } else {
      for (i = 0; i < len; i++) {
        result.push(data[fr[i]]);
      }
    }
    return result;
  }

  /**
   * Used to run an update operation on all documents currently in the ResultSet.
   *
   * @param {function} updateFunction - User supplied updateFunction(obj) will be executed for each document object.
   * @returns {ResultSet} this ResultSet for further chain ops.
   */
  update(updateFunction: (obj: Doc<E>) => E): this {
    // if this has no filters applied, we need to populate filteredRows first
    if (!this._filterInitialized && this._filteredRows.length === 0) {
      this._filteredRows = this._collection._prepareFullDocIndex();
    }

    const len = this._filteredRows.length;
    const rcd = this._collection._data;

    for (let idx = 0; idx < len; idx++) {
      // pass in each document object currently in ResultSet to user supplied updateFunction
      updateFunction(rcd[this._filteredRows[idx]]);

      // notify collection we have changed this object so it can update meta and allow DynamicViews to re-evaluate
      this._collection.update(rcd[this._filteredRows[idx]]);
    }

    return this;
  }

  /**
   * Removes all document objects which are currently in ResultSet from collection (as well as ResultSet)
   *
   * @returns {ResultSet} this (empty) ResultSet for further chain ops.
   */
  public remove(): this {
    // if this has no filters applied, we need to populate filteredRows first
    if (!this._filterInitialized && this._filteredRows.length === 0) {
      this._filteredRows = this._collection._prepareFullDocIndex();
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
  public mapReduce<T, U>(mapFunction: (item: E, index: number, array: E[]) => T, reduceFunction: (array: T[]) => U): U {
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
  map<U extends object>(mapFun: (obj: E, index: number, array: E[]) => U, dataOptions?: ResultSet.DataOptions): ResultSet<U> {
    const data = this.data(dataOptions).map(mapFun);
    //return return a new ResultSet with no filters
    this._collection = new Collection("mappedData");
    this._collection.insert(data as any as E);
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

  export type PartialModel<E, T> = { [P in keyof E]?: T | E[P] };

  export type Query<E> = PartialModel<E & { $and: Query<E>[]; $or: Query<E>[], $fts: FullTextSearchQuery },
    { [Y in keyof typeof LokiOps]?: any }>;

  interface AB {
    name: string;
  }

  let rqwe: Query<AB> = {
    $fts: {
      query: {
        type: "term",
        value: "c",
        field: "r"
      }
    },
    $and: [{
      name: "abc"
    }]
  };
}
