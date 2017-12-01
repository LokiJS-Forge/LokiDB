import {Collection} from "./collection";
import {clone, CloneMethod} from "./clone";
import {ltHelper, gtHelper, aeqHelper, sortHelper} from "./helper";
import {Dict, Doc, Query} from "../../common/types";
import {ScoreResult} from "../../full-text-search/src/scorer";

export type ANY = any;

// used to recursively scan hierarchical transform step object for param substitution
function resolveTransformObject(subObj: object, params: object, depth: number = 0) {
  let prop;
  let pname;

  if (++depth >= 10) return subObj;

  for (prop in subObj) {
    if (typeof subObj[prop] === "string" && subObj[prop].indexOf("[%lktxp]") === 0) {
      pname = subObj[prop].substring(8);
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
function resolveTransformParams(transform: any, params: object) {
  let idx;
  let clonedStep;
  const resolvedTransform = [];

  if (params === undefined) return transform;

  // iterate all steps in the transform array
  for (idx = 0; idx < transform.length; idx++) {
    // clone transform so our scan/replace can operate directly on cloned transform
    clonedStep = clone(transform[idx], CloneMethod.SHALLOW_RECURSE_OBJECTS);
    resolvedTransform.push(resolveTransformObject(clonedStep, params));
  }

  return resolvedTransform;
}

function containsCheckFn(a: ANY) {
  if (typeof a === "string" || Array.isArray(a)) {
    return (b: ANY) => (a as string).indexOf(b) !== -1;
  } else if (typeof a === "object" && a !== null) {
    return (b: ANY) => Object.hasOwnProperty.call(a, b);
  }
  return null;
}

function doQueryOp(val: ANY, op: ANY) {
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
  // a is the value in the collection
  // b is the query value
  $eq(a: ANY, b: ANY) {
    return a === b;
  },

  // abstract/loose equality
  $aeq(a: ANY, b: ANY) {
    return a == b;
  },

  $ne(a: ANY, b: ANY) {
    // ecma 5 safe test for NaN
    if (b !== b) {
      // ecma 5 test value is not NaN
      return (a === a);
    }

    return a !== b;
  },

  // date equality / loki abstract equality test
  $dteq(a: ANY, b: ANY) {
    return aeqHelper(a, b);
  },

  $gt(a: ANY, b: ANY) {
    return gtHelper(a, b, false);
  },

  $gte(a: ANY, b: ANY) {
    return gtHelper(a, b, true);
  },

  $lt(a: ANY, b: ANY) {
    return ltHelper(a, b, false);
  },

  $lte(a: ANY, b: ANY) {
    return ltHelper(a, b, true);
  },

  // ex : coll.find({'orderCount': {$between: [10, 50]}});
  $between(a: ANY, vals: ANY) {
    if (a === undefined || a === null) return false;
    return (gtHelper(a, vals[0], true) && ltHelper(a, vals[1], true));
  },

  $in(a: ANY, b: ANY) {
    return b.indexOf(a) !== -1;
  },

  $nin(a: ANY, b: ANY) {
    return b.indexOf(a) === -1;
  },

  $keyin(a: ANY, b: ANY) {
    return a in b;
  },

  $nkeyin(a: ANY, b: ANY) {
    return !(a in b);
  },

  $definedin(a: ANY, b: ANY) {
    return b[a] !== undefined;
  },

  $undefinedin(a: ANY, b: ANY) {
    return b[a] === undefined;
  },

  $regex(a: ANY, b: ANY) {
    return b.test(a);
  },

  $containsString(a: ANY, b: ANY) {
    return (typeof a === "string") && (a.indexOf(b) !== -1);
  },

  $containsNone(a: ANY, b: ANY) {
    return !LokiOps.$containsAny(a, b);
  },

  $containsAny(a: ANY, b: ANY) {
    const checkFn = containsCheckFn(a);
    if (checkFn !== null) {
      return (Array.isArray(b)) ? (b.some(checkFn)) : (checkFn(b));
    }
    return false;
  },

  $contains(a: ANY, b: ANY) {
    const checkFn = containsCheckFn(a);
    if (checkFn !== null) {
      return (Array.isArray(b)) ? (b.every(checkFn)) : (checkFn(b));
    }
    return false;
  },

  $type(a: ANY, b: ANY) {
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

  $finite(a: ANY, b: ANY) {
    return (b === isFinite(a));
  },

  $size(a: ANY, b: ANY) {
    if (Array.isArray(a)) {
      return (typeof b !== "object") ? (a.length === b) : doQueryOp(a.length, b);
    }
    return false;
  },

  $len(a: ANY, b: ANY) {
    if (typeof a === "string") {
      return (typeof b !== "object") ? (a.length === b) : doQueryOp(a.length, b);
    }
    return false;
  },

  $where(a: ANY, b: ANY) {
    return b(a) === true;
  },

  // field-level logical operators
  // a is the value in the collection
  // b is the nested query operation (for '$not')
  //   or an array of nested query operations (for '$and' and '$or')
  $not(a: ANY, b: ANY) {
    return !doQueryOp(a, b);
  },

  $and(a: ANY, b: ANY) {
    for (let idx = 0, len = b.length; idx < len; idx += 1) {
      if (!doQueryOp(a, b[idx])) {
        return false;
      }
    }
    return true;
  },

  $or(a: ANY, b: ANY) {
    for (let idx = 0, len = b.length; idx < len; idx += 1) {
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
function dotSubScan(root: object, paths: string[], fun: Function, value: ANY, pathOffset = 0) {
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
    for (let index = 0, len = element.length; index < len; index += 1) {
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
 * Resultset class allowing chainable queries.  Intended to be instanced internally.
 *    Collection.find(), Collection.where(), and Collection.chain() instantiate this.
 *
 * @example
 *    mycollection.chain()
 *      .find({ 'doors' : 4 })
 *      .where(function(obj) { return obj.name === 'Toyota' })
 *      .data();
 */
export class Resultset<E extends object = object> {

  public collection: Collection<E>;
  public filteredrows: number[];
  public filterInitialized: boolean;
  // Holds the scoring result of the last full text search.
  private _scoring: ScoreResult;

  /**
   * Constructor.
   * @param {Collection} collection - the collection which this Resultset will query against
   */
  constructor(collection: Collection<E>) {
    // retain reference to collection we are querying against
    this.collection = collection;
    this.filteredrows = [];
    this.filterInitialized = false;
    this._scoring = null;
  }

  /**
   * reset() - Reset the resultset to its initial state.
   *
   * @returns {Resultset} Reference to this resultset, for future chain operations.
   */
  reset(): Resultset<E> {
    if (this.filteredrows.length > 0) {
      this.filteredrows = [];
    }
    this.filterInitialized = false;
    return this;
  }

  /**
   * toJSON() - Override of toJSON to avoid circular references
   *
   */
  public toJSON(): Resultset<E> {
    const copy = this.copy();
    copy.collection = <never>null;
    return copy;
  }

  /**
   * Allows you to limit the number of documents passed to next chain operation.
   *    A resultset copy() is made to avoid altering original resultset.
   *
   * @param {int} qty - The number of documents to return.
   * @returns {Resultset} Returns a copy of the resultset, limited by qty, for subsequent chain ops.
   */
  public limit(qty: number): Resultset<E> {
    // if this has no filters applied, we need to populate filteredrows first
    if (!this.filterInitialized && this.filteredrows.length === 0) {
      this.filteredrows = this.collection.prepareFullDocIndex();
    }

    this.filteredrows = this.filteredrows.slice(0, qty);
    this.filterInitialized = true;
    return this;
  }

  /**
   * Used for skipping 'pos' number of documents in the resultset.
   *
   * @param {int} pos - Number of documents to skip; all preceding documents are filtered out.
   * @returns {Resultset} Returns a copy of the resultset, containing docs starting at 'pos' for subsequent chain ops.
   */
  public offset(pos: number): Resultset<E> {
    // if this has no filters applied, we need to populate filteredrows first
    if (!this.filterInitialized && this.filteredrows.length === 0) {
      this.filteredrows = this.collection.prepareFullDocIndex();
    }

    this.filteredrows = this.filteredrows.slice(pos);
    this.filterInitialized = true;
    return this;
  }

  /**
   * copy() - To support reuse of resultset in branched query situations.
   *
   * @returns {Resultset} Returns a copy of the resultset (set) but the underlying document references will be the same.
   */
  public copy(): Resultset<E> {
    const result = new Resultset<E>(this.collection);

    if (this.filteredrows.length > 0) {
      result.filteredrows = this.filteredrows.slice();
    }
    result.filterInitialized = this.filterInitialized;

    return result;
  }

  /**
   * Alias of copy()
   */
  branch() {
    return this.copy();
  }

  /**
   * Executes a named collection transform or raw array of transform steps against the resultset.
   *
   * @param {(string|array)} transform - name of collection transform or raw transform array
   * @param {object} [parameters=] - object property hash of parameters, if the transform requires them.
   * @returns {Resultset} either (this) resultset or a clone of of this resultset (depending on steps)
   */
  transform(transform: string | any[], parameters?: object): Resultset<E> {
    let idx;
    let step;
    let rs = this as Resultset;

    // if transform is name, then do lookup first
    if (typeof transform === "string") {
      if (this.collection.transforms[transform] !== undefined) {
        transform = this.collection.transforms[transform];
      }
    }

    // either they passed in raw transform array or we looked it up, so process
    if (typeof transform !== "object" || !Array.isArray(transform)) {
      throw new Error("Invalid transform");
    }

    if (parameters !== undefined) {
      transform = resolveTransformParams(transform, parameters);
    }

    for (idx = 0; idx < transform.length; idx++) {
      step = transform[idx];

      switch (step.type) {
        case "find":
          rs.find(step.value);
          break;
        case "where":
          rs.where(step.value);
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
        case "limit":
          rs = rs.limit(step.value);
          break; // limit makes copy so update reference
        case "offset":
          rs = rs.offset(step.value);
          break; // offset makes copy so update reference
        case "map":
          rs = rs.map(step.value, step.dataOptions);
          break;
        case "eqJoin":
          rs = rs.eqJoin(step.joinData, step.leftJoinKey, step.rightJoinKey, step.mapFun, step.dataOptions);
          break;
        // following cases break chain by returning array data so make any of these last in transform steps
        case "mapReduce":
          rs = rs.mapReduce(step.mapFunction, step.reduceFunction);
          break;
        // following cases update documents in current filtered resultset (use carefully)
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
    return rs as Resultset<E>;
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
   * @returns {Resultset} Reference to this resultset, sorted, for future chain operations.
   */
  public sort(comparefun: (a: E, b: E) => number): Resultset<E> {
    // if this has no filters applied, just we need to populate filteredrows first
    if (!this.filterInitialized && this.filteredrows.length === 0) {
      this.filteredrows = this.collection.prepareFullDocIndex();
    }

    const wrappedComparer =
      (((userComparer, data) => (a: number, b: number) => userComparer(data[a], data[b])))(comparefun, this.collection.data);

    this.filteredrows.sort(wrappedComparer);

    return this;
  }

  /**
   * Simpler, loose evaluation for user to sort based on a property name. (chainable).
   *    Sorting based on the same lt/gt helper functions used for binary indices.
   *
   * @param {string} propname - name of property to sort by.
   * @param {boolean} isdesc - (Optional) If true, the property will be sorted in descending order
   * @returns {Resultset} Reference to this resultset, sorted, for future chain operations.
   */
  public simplesort(propname: string, isdesc?: boolean): Resultset<E> {
    if (isdesc === undefined) {
      isdesc = false;
    }

    // if this has no filters applied, just we need to populate filteredrows first
    if (!this.filterInitialized && this.filteredrows.length === 0) {
      // if we have a binary index and no other filters applied, we can use that instead of sorting (again)
      if (this.collection.binaryIndices[propname] !== undefined) {
        // make sure index is up-to-date
        this.collection.ensureIndex(propname);
        // copy index values into filteredrows
        this.filteredrows = this.collection.binaryIndices[propname].values.slice(0);

        if (isdesc) {
          this.filteredrows.reverse();
        }

        // we are done, return this (resultset) for further chain ops
        return this;
      }
      // otherwise initialize array for sort below
      else {
        this.filteredrows = this.collection.prepareFullDocIndex();
      }
    }

    const wrappedComparer = ((prop, desc, data) => (a: number, b: number) => {
      let val1, val2, arr;
      if (~prop.indexOf(".")) {
        arr = prop.split(".");
        val1 = arr.reduce(function (obj, i) {
          return obj && obj[i] || undefined;
        }, data[a]);
        val2 = arr.reduce(function (obj, i) {
          return obj && obj[i] || undefined;
        }, data[b]);
      } else {
        val1 = data[a][prop];
        val2 = data[b][prop];
      }
      return sortHelper(val1, val2, desc);
    })(propname, isdesc, this.collection.data);

    this.filteredrows.sort(wrappedComparer);

    return this;
  }

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
  public compoundsort(properties: (string | [string, boolean])[]): Resultset<E> {
    if (properties.length === 0) {
      throw new Error("Invalid call to compoundsort, need at least one property");
    }

    let prop;
    if (properties.length === 1) {
      prop = properties[0];
      if (typeof prop === "string") {
        return this.simplesort(prop, false);
      } else {
        return this.simplesort(prop[0], prop[1]);
      }
    }

    // unify the structure of 'properties' to avoid checking it repeatedly while sorting
    for (let i = 0, len = properties.length; i < len; i += 1) {
      prop = properties[i];
      if (typeof prop === "string") {
        properties[i] = [prop, false];
      }
    }

    // if this has no filters applied, just we need to populate filteredrows first
    if (!this.filterInitialized && this.filteredrows.length === 0) {
      this.filteredrows = this.collection.prepareFullDocIndex();
    }

    const wrappedComparer =
      (((props, data) => (a: number, b: number) => this._compoundeval(props, data[a], data[b])))(properties as [string, boolean][], this.collection.data);

    this.filteredrows.sort(wrappedComparer);

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
    let res = 0;
    let prop;
    let field;
    let val1, val2, arr;
    for (let i = 0, len = properties.length; i < len; i++) {
      prop = properties[i];
      field = prop[0];
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
      res = sortHelper(val1, val2, prop[1]);
      if (res !== 0) {
        return res;
      }
    }
    return 0;
  }

  /**
   * Sorts the resultset based on the last full-text-search scoring.
   * @param {boolean} [ascending=false] - sort ascending
   * @returns {Resultset<E extends Object>}
   */
  public sortByScoring(ascending = false): Resultset<E> {
    if (this._scoring === null) {
      throw new Error("No scoring available");
    }

    if (ascending) {
      this.filteredrows.sort((a: number, b: number) => this._scoring[a] - this._scoring[b]);
    } else {
      this.filteredrows.sort((a: number, b: number) => this._scoring[b] - this._scoring[a]);
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
   * findOr() - oversee the operation of OR'ed query expressions.
   *    OR'ed expression evaluation runs each expression individually against the full collection,
   *    and finally does a set OR on each expression's results.
   *    Each evaluation can utilize a binary index to prevent multiple linear array scans.
   *
   * @param {array} expressionArray - array of expressions
   * @returns {Resultset} this resultset for further chain ops.
   */
  public findOr(expressionArray: Query[]): Resultset<E> {
    let fr = null;
    let fri = 0;
    let frlen = 0;
    const docset = [];
    const idxset = [];
    let idx = 0;
    const origCount = this.count();

    // If filter is already initialized, then we query against only those items already in filter.
    // This means no index utilization for fields, so hopefully its filtered to a smallish filteredrows.
    for (let ei = 0, elen = expressionArray.length; ei < elen; ei++) {
      // we need to branch existing query to run each filter separately and combine results
      fr = this.branch().find(expressionArray[ei]).filteredrows;
      frlen = fr.length;
      // if the find operation did not reduce the initial set, then the initial set is the actual result
      if (frlen === origCount) {
        return this;
      }

      // add any document 'hits'
      for (fri = 0; fri < frlen; fri++) {
        idx = fr[fri];
        if (idxset[idx] === undefined) {
          idxset[idx] = true;
          docset.push(idx);
        }
      }
    }

    this.filteredrows = docset;
    this.filterInitialized = true;

    return this;
  }

  public $or(expressionArray: Query[]): Resultset<E> {
    return this.findOr(expressionArray);
  }

  /**
   * findAnd() - oversee the operation of AND'ed query expressions.
   *    AND'ed expression evaluation runs each expression progressively against the full collection,
   *    internally utilizing existing chained resultset functionality.
   *    Only the first filter can utilize a binary index.
   *
   * @param {array} expressionArray - array of expressions
   * @returns {Resultset} this resultset for further chain ops.
   */
  public findAnd(expressionArray: Query[]): Resultset<E> {
    // we have already implementing method chaining in this (our Resultset class)
    // so lets just progressively apply user supplied and filters
    for (let i = 0, len = expressionArray.length; i < len; i++) {
      if (this.count() === 0) {
        return this;
      }
      this.find(expressionArray[i]);
    }
    return this;
  }

  public $and(expressionArray: Query[]): Resultset<E> {
    return this.findAnd(expressionArray);
  }

  /**
   * Used for querying via a mongo-style query object.
   *
   * @param {object} query - A mongo-style query object used for filtering current results.
   * @param {boolean} firstOnly - (Optional) Used by collection.findOne() - flag if this was invoked via findOne()
   * @returns {Resultset} this resultset for further chain ops.
   */
  public find(query?: Query, firstOnly = false): Resultset<E> {
    if (this.collection.data.length === 0) {
      this.filteredrows = [];
      this.filterInitialized = true;
      return this;
    }

    const queryObject = query || "getAll";
    let property;
    let queryObjectOp;
    let value;

    if (typeof queryObject === "object") {
      let filters = [];
      for (let p in queryObject) {
        let obj = {};
        obj[p] = queryObject[p];
        filters.push(obj);

        if (queryObject[p] !== undefined) {
          property = p;
          queryObjectOp = queryObject[p];
        }
      }
      // if more than one expression in single query object,
      // convert implicit $and to explicit $and
      if (filters.length > 1) {
        return this.find({"$and": filters}, firstOnly);
      }
    }

    // apply no filters if they want all
    if (!property || queryObject === "getAll") {
      if (firstOnly) {
        this.filteredrows = (this.collection.data.length > 0) ? [0] : [];
        this.filterInitialized = true;
      }
      return this;
    }

    // injecting $and and $or expression tree evaluation here.
    if (property === "$and" || property === "$or") {
      this[property](queryObjectOp);

      // for chained find with firstonly,
      if (firstOnly && this.filteredrows.length > 1) {
        this.filteredrows = this.filteredrows.slice(0, 1);
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
        value = new RegExp(value);
      }
    }

    // if user is deep querying the object such as find('name.first': 'odin')
    const usingDotNotation = (property.indexOf(".") !== -1);

    // if an index exists for the property being queried against, use it
    // for now only enabling where it is the first filter applied and prop is indexed
    const doIndexCheck = !usingDotNotation && !this.filterInitialized;

    let searchByIndex = false;
    if (doIndexCheck && this.collection.binaryIndices[property] && indexedOps[operator]) {
      // this is where our lazy index rebuilding will take place
      // basically we will leave all indexes dirty until we need them
      // so here we will rebuild only the index tied to this property
      // ensureIndex() will only rebuild if flagged as dirty since we are not passing force=true param
      if (this.collection.adaptiveBinaryIndices !== true) {
        this.collection.ensureIndex(property);
      }
      searchByIndex = true;
    }

    // the comparison function
    const fun = LokiOps[operator];

    // "shortcut" for collection data
    const data = this.collection.data;

    // Query executed differently depending on :
    //    - whether the property being queried has an index defined
    //    - if chained, we handle first pass differently for initial filteredrows[] population
    //
    // For performance reasons, each case has its own if block to minimize in-loop calculations

    let result: number[] = [];
    // If the filteredrows[] is already initialized, use it
    if (this.filterInitialized) {
      let filter = this.filteredrows;

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
        this._scoring = this.collection._fullTextSearch.search(query["$fts"]);
        let keys = Object.keys(this._scoring);
        for (let i = 0; i < keys.length; i++) {
          if (filter.includes(+keys[i])) {
            result.push(+keys[i]);
          }
        }
      } else if (this.collection.constraints.unique[property] !== undefined && operator == "$eq") {
        // Use unique constraint for search.
        let row = this.collection.constraints.unique[property].get(value);
        if (filter.includes(row)) {
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

      this.filteredrows = result;
      this.filterInitialized = true; // next time work against filteredrows[]
      return this;
    }

    this.filteredrows = result;
    this.filterInitialized = true; // next time work against filteredrows[]

    if (property === "$fts") {
      this._scoring = this.collection._fullTextSearch.search(query["$fts"]);
      let keys = Object.keys(this._scoring);
      for (let i = 0; i < keys.length; i++) {
        result.push(+keys[i]);
      }
      return this;
    }

    // Use unique constraint for search.
    if (this.collection.constraints.unique[property] !== undefined && operator == "$eq") {
      result.push(this.collection.constraints.unique[property].get(value));
      return this;
    }

    // first chained query so work against data[] but put results in filteredrows
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

    let index = this.collection.binaryIndices[property];
    if (operator !== "$in") {
      // search by index
      const segm = this.collection.calculateRange(operator, property, value);
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
        const segm = this.collection.calculateRange("$eq", property, value[j]);
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
   * @returns {Resultset} this resultset for further chain ops.
   */
  public where(fun: (obj: E) => boolean): Resultset<E> {
    let viewFunction;
    let result = [];

    if ("function" === typeof fun) {
      viewFunction = fun;
    } else {
      throw new TypeError("Argument is not a stored view or a function");
    }
    try {
      // If the filteredrows[] is already initialized, use it
      if (this.filterInitialized) {
        let j = this.filteredrows.length;

        while (j--) {
          if (viewFunction(this.collection.data[this.filteredrows[j]]) === true) {
            result.push(this.filteredrows[j]);
          }
        }

        this.filteredrows = result;

        return this;
      }
      // otherwise this is initial chained op, work against data, push into filteredrows[]
      else {
        let k = this.collection.data.length;

        while (k--) {
          if (viewFunction(this.collection.data[k]) === true) {
            result.push(k);
          }
        }

        this.filteredrows = result;
        this.filterInitialized = true;

        return this;
      }
    } catch (err) {
      throw err;
    }
  }

  /**
   * Returns the number of documents in the resultset.
   * @returns {number} The number of documents in the resultset.
   */
  public count(): number {
    if (this.filterInitialized) {
      return this.filteredrows.length;
    }
    return this.collection.count();
  }

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
  public data(options: Resultset.DataOptions = {}): Doc<E>[] {
    let forceClones: boolean;
    let forceCloneMethod: CloneMethod;
    let removeMeta: boolean;
    (
      {
        forceClones,
        forceCloneMethod = this.collection.cloneMethod,
        removeMeta = false
      } = options
    );

    let result = [];
    let data = this.collection.data;
    let obj;
    let len;
    let i;
    let method;

    // if user opts to strip meta, then force clones and use 'shallow' if 'force' options are not present
    if (removeMeta && !forceClones) {
      forceClones = true;
      forceCloneMethod = CloneMethod.SHALLOW;
    }

    // if collection has delta changes active, then force clones and use CloneMethod.DEEP for effective change tracking of nested objects
    if (!this.collection.disableDeltaChangesApi) {
      forceClones = true;
      forceCloneMethod = CloneMethod.DEEP;
    }

    // if this has no filters applied, just return collection.data
    if (!this.filterInitialized) {
      if (this.filteredrows.length === 0) {
        // determine whether we need to clone objects or not
        if (this.collection.cloneObjects || forceClones) {
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
        // filteredrows must have been set manually, so use it
        this.filterInitialized = true;
      }
    }

    const fr = this.filteredrows;
    len = fr.length;

    if (this.collection.cloneObjects || forceClones) {
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
   * Used to run an update operation on all documents currently in the resultset.
   *
   * @param {function} updateFunction - User supplied updateFunction(obj) will be executed for each document object.
   * @returns {Resultset} this resultset for further chain ops.
   */
  update(updateFunction: (obj: E) => E): Resultset<E> {
    // if this has no filters applied, we need to populate filteredrows first
    if (!this.filterInitialized && this.filteredrows.length === 0) {
      this.filteredrows = this.collection.prepareFullDocIndex();
    }

    const len = this.filteredrows.length;
    const rcd = this.collection.data;

    for (let idx = 0; idx < len; idx++) {
      // pass in each document object currently in resultset to user supplied updateFunction
      updateFunction(rcd[this.filteredrows[idx]]);

      // notify collection we have changed this object so it can update meta and allow DynamicViews to re-evaluate
      this.collection.update(rcd[this.filteredrows[idx]]);
    }

    return this;
  }

  /**
   * Removes all document objects which are currently in resultset from collection (as well as resultset)
   *
   * @returns {Resultset} this (empty) resultset for further chain ops.
   */
  public remove(): Resultset<E> {
    // if this has no filters applied, we need to populate filteredrows first
    if (!this.filterInitialized && this.filteredrows.length === 0) {
      this.filteredrows = this.collection.prepareFullDocIndex();
    }
    this.collection.remove(this.data());
    this.filteredrows = [];
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
  //eqJoin<T extends object>(joinData: T[] | Resultset<T>, leftJoinKey: string | ((obj: E) => string), rightJoinKey: string | ((obj: T) => string)): Resultset<{ left: E; right: T; }>;
  // eqJoin<T extends object, U extends object>(joinData: T[] | Resultset<T>, leftJoinKey: string | ((obj: E) => string), rightJoinKey: string | ((obj: T) => string), mapFun?: (a: E, b: T) => U, dataOptions?: Resultset.DataOptions): Resultset<U> {
  eqJoin(joinData: ANY, leftJoinKey: string | Function, rightJoinKey: string | Function, mapFun?: Function, dataOptions?: ANY): ANY {
// eqJoin<T extends object, U extends object>(joinData: T[] | Resultset<T>, leftJoinKey: string | ((obj: E) => string), rightJoinKey: string | ((obj: T) => string), mapFun?: (a: E, b: T) => U, dataOptions?: Resultset.DataOptions): Resultset<U> {
    let leftData = [];
    let leftDataLength;
    let rightData = [];
    let rightDataLength;
    let key;
    let result = [];
    let leftKeyisFunction = typeof leftJoinKey === "function";
    let rightKeyisFunction = typeof rightJoinKey === "function";
    let joinMap = {};

    //get the left data
    leftData = this.data(dataOptions);
    leftDataLength = leftData.length;

    //get the right data
    if (joinData instanceof Collection) {
      rightData = joinData.chain().data(dataOptions);
    } else if (joinData instanceof Resultset) {
      rightData = joinData.data(dataOptions);
    } else if (Array.isArray(joinData)) {
      rightData = joinData;
    } else {
      throw new TypeError("joinData needs to be an array or result set");
    }
    rightDataLength = rightData.length;

    //construct a lookup table
    for (let i = 0; i < rightDataLength; i++) {
      key = rightKeyisFunction ? (rightJoinKey as Function)(rightData[i]) : rightData[i][rightJoinKey as string];
      joinMap[key] = rightData[i];
    }

    if (!mapFun) {
      mapFun = (left: ANY, right: ANY) => ({
        left,
        right
      });
    }

    //Run map function over each object in the resultset
    for (let j = 0; j < leftDataLength; j++) {
      key = leftKeyisFunction ? (leftJoinKey as Function)(leftData[j]) : leftData[j][leftJoinKey as string];
      result.push(mapFun(leftData[j], joinMap[key] || {}));
    }

    //return a new resultset with no filters
    this.collection = new Collection("joinData");
    this.collection.insert(result);
    this.filteredrows = [];
    this.filterInitialized = false;

    return this;
  }

  /**
   * Applies a map function into a new collection for further chaining.
   * @param {function} mapFun - javascript map function
   * @param {object} [dataOptions=] - options to data() before input to your map function
   * @param {boolean} dataOptions.removeMeta - allows removing meta before calling mapFun
   * @param {boolean} dataOptions.forceClones - forcing the return of cloned objects to your map object
   * @param {string} dataOptions.forceCloneMethod - Allows overriding the default or collection specified cloning method.
   */
  map<U extends object>(mapFun: (obj: E, index: number, array: E[]) => U, dataOptions?: Resultset.DataOptions): Resultset<U> {
    let data = this.data(dataOptions).map(mapFun);
    //return return a new resultset with no filters
    this.collection = new Collection("mappedData");
    this.collection.insert(data as any as E);
    this.filteredrows = [];
    this.filterInitialized = false;

    return this as any as Resultset<U>;
  }
}

export namespace Resultset {
  export interface DataOptions {
    forceClones?: boolean;
    forceCloneMethod?: CloneMethod;
    removeMeta?: boolean;
  }
}
