/**
 * This file contains LokiOperatorPackages, RangedIndex and Comparator interfaces, as well as
 * global map object instances for registered LokiOperatorPackages, RangedIndex implementations, and Comparator functions
 */

import { AvlTreeIndex } from "./avl_index";

/* valid range ops that the index must directly support */
export type RangedValueOperator = "$gt" | "$gte" | "$lt" | "$lte" | "$eq" | "$neq" | "$between";

/* Loki Comparator interface for dependency injection to ranged indexes */
export interface ILokiComparer<T> {
  (a: T, b: T): -1 | 0 | 1;
}

export interface IRangedIndexRequest<T> {
  op: RangedValueOperator;
  val: T;
  high?: T;
}

export interface IComparatorMap {
  [name: string]: ILokiComparer<any>;
}

/** Map/Register of named ILokiComparer functions returning -1, 0, 1 for lt/eq/gt assertions for two passed parameters */
export let ComparatorMap: IComparatorMap = {
  "js": CreateJavascriptComparator<any>(),
  "abstract-js": CreateAbstractJavascriptComparator<any>(),
  "abstract-date": CreateAbstractDateJavascriptComparator<any>(),
  "loki": CreateLokiComparator()
};

/** Hash Interface for global ranged index factory map*/
export interface IRangedIndexFactoryMap {
  [name: string]: (name: string, comparator: ILokiComparer<any>) => IRangedIndex<any>;
}

/** Map/Register of named factory functions returning IRangedIndex instances */
export let RangedIndexFactoryMap: IRangedIndexFactoryMap = {
  "avl": (name: string, comparator: ILokiComparer<any>) => { return new AvlTreeIndex(name, comparator); }
};

/** Defines interface which all loki ranged indexes need to implement */
export interface IRangedIndex<T> {
  insert(id: number, val: T): void;
  update(id: number, val: T): void;
  remove(id: number): void;
  restore(tree: any): void;
  backup(): IRangedIndex<T>;

  rangeRequest(range?: IRangedIndexRequest<T>): number[];

  validateIndex(): boolean;
}

/** Typescript-friendly factory for strongly typed 'js' comparators */
export function CreateJavascriptComparator<T>(): ILokiComparer<T> {
  return (val: T, val2: T) => {
    if (val === val2) return 0;
    if (val < val2) return -1;
    return 1;
  };
}

/** Typescript-friendly factory for strongly typed 'abstract js' comparators */
export function CreateAbstractJavascriptComparator<T>(): ILokiComparer<T> {
  return (val: T, val2: T) => {
    if (val == val2) return 0;
    if (val < val2) return -1;
    return 1;
  };
}

/**
 * Comparator which attempts to deal with deal with dates at comparator level.
 * Should work for dates in any of the object, string, and number formats
 */
export function CreateAbstractDateJavascriptComparator<T>(): ILokiComparer<T> {
  return (val: T, val2: T) => {
    let v1: string = (new Date(val as any).toISOString());
    let v2: string = (new Date(val2 as any).toISOString());
    if (v1 == v2) return 0;
    if (v1 < v2) return -1;
    return 1;
  };
}

/** Typescript-friendly factory for strongly typed 'loki' comparators */
export function CreateLokiComparator(): ILokiComparer<any> {
  return (val: any, val2: any) => {
    if (aeqHelper(val, val2)) return 0;
    if (ltHelper(val, val2, false)) return -1;
    return 1;
  };
}

/**
 * Helper function for determining 'loki' abstract equality which is a little more abstract than ==
 *     aeqHelper(5, '5') === true
 *     aeqHelper(5.0, '5') === true
 *     aeqHelper(new Date("1/1/2011"), new Date("1/1/2011")) === true
 *     aeqHelper({a:1}, {z:4}) === true (all objects sorted equally)
 *     aeqHelper([1, 2, 3], [1, 3]) === false
 *     aeqHelper([1, 2, 3], [1, 2, 3]) === true
 *     aeqHelper(undefined, null) === true
 * @param {any} prop1
 * @param {any} prop2
 * @returns {boolean}
 * @hidden
 */
export function aeqHelper(prop1: any, prop2: any): boolean {
  if (prop1 === prop2) return true;

  // 'falsy' and Boolean handling
  if (!prop1 || !prop2 || prop1 === true || prop2 === true || prop1 !== prop1 || prop2 !== prop2) {
    let t1: number;
    let t2: number;

    // dates and NaN conditions (typed dates before serialization)
    switch (prop1) {
      case undefined:
        t1 = 1;
        break;
      case null:
        t1 = 1;
        break;
      case false:
        t1 = 3;
        break;
      case true:
        t1 = 4;
        break;
      case "":
        t1 = 5;
        break;
      default:
        t1 = (prop1 === prop1) ? 9 : 0;
        break;
    }

    switch (prop2) {
      case undefined:
        t2 = 1;
        break;
      case null:
        t2 = 1;
        break;
      case false:
        t2 = 3;
        break;
      case true:
        t2 = 4;
        break;
      case "":
        t2 = 5;
        break;
      default:
        t2 = (prop2 === prop2) ? 9 : 0;
        break;
    }

    // one or both is edge case
    if (t1 !== 9 || t2 !== 9) {
      return (t1 === t2);
    }
  }

  // Handle 'Number-like' comparisons
  let cv1 = Number(prop1);
  let cv2 = Number(prop2);

  // if one or both are 'number-like'...
  if (cv1 === cv1 || cv2 === cv2) {
    return (cv1 === cv2);
  }

  // not strict equal nor less than nor gt so must be mixed types, convert to string and use that to compare
  cv1 = prop1.toString();
  cv2 = prop2.toString();

  return (cv1 == cv2);
}

/**
 * Helper function for determining 'less-than' conditions for ops, sorting, and binary indices.
 *     In the future we might want $lt and $gt ops to use their own functionality/helper.
 *     Since binary indices on a property might need to index [12, NaN, new Date(), Infinity], we
 *     need this function (as well as gtHelper) to always ensure one value is LT, GT, or EQ to another.
 * @hidden
 */
export function ltHelper(prop1: any, prop2: any, equal: boolean): boolean {
  // if one of the params is falsy or strictly true or not equal to itself
  // 0, 0.0, "", NaN, null, undefined, not defined, false, true
  if (!prop1 || !prop2 || prop1 === true || prop2 === true || prop1 !== prop1 || prop2 !== prop2) {
    let t1: number;
    let t2: number;

    switch (prop1) {
      case undefined:
        t1 = 1;
        break;
      case null:
        t1 = 1;
        break;
      case false:
        t1 = 3;
        break;
      case true:
        t1 = 4;
        break;
      case "":
        t1 = 5;
        break;
      // if strict equal probably 0 so sort higher, otherwise probably NaN so sort lower than even null
      default:
        t1 = (prop1 === prop1) ? 9 : 0;
        break;
    }

    switch (prop2) {
      case undefined:
        t2 = 1;
        break;
      case null:
        t2 = 1;
        break;
      case false:
        t2 = 3;
        break;
      case true:
        t2 = 4;
        break;
      case "":
        t2 = 5;
        break;
      default:
        t2 = (prop2 === prop2) ? 9 : 0;
        break;
    }

    // one or both is edge case
    if (t1 !== 9 || t2 !== 9) {
      return (t1 === t2) ? equal : (t1 < t2);
    }
  }

  // if both are numbers (string encoded or not), compare as numbers
  let cv1 = Number(prop1);
  let cv2 = Number(prop2);

  if (cv1 === cv1 && cv2 === cv2) {
    if (cv1 < cv2) return true;
    if (cv1 > cv2) return false;
    return equal;
  }

  if (cv1 === cv1 && cv2 !== cv2) {
    return true;
  }

  if (cv2 === cv2 && cv1 !== cv1) {
    return false;
  }

  if (prop1 < prop2) return true;
  if (prop1 > prop2) return false;
  if (prop1 == prop2) return equal;

  // not strict equal nor less than nor gt so must be mixed types, convert to string and use that to compare
  cv1 = prop1.toString();
  cv2 = prop2.toString();

  if (cv1 < cv2) {
    return true;
  }

  if (cv1 == cv2) {
    return equal;
  }

  return false;
}

/**
 * @hidden
 * @param {any} prop1
 * @param {any} prop2
 * @param {boolean} equal
 * @returns {boolean}
 */
export function gtHelper(prop1: any, prop2: any, equal: boolean): boolean {
  // 'falsy' and Boolean handling
  if (!prop1 || !prop2 || prop1 === true || prop2 === true || prop1 !== prop1 || prop2 !== prop2) {
    let t1: number;
    let t2: number;

    switch (prop1) {
      case undefined:
        t1 = 1;
        break;
      case null:
        t1 = 1;
        break;
      case false:
        t1 = 3;
        break;
      case true:
        t1 = 4;
        break;
      case "":
        t1 = 5;
        break;
      // NaN 0
      default:
        t1 = (prop1 === prop1) ? 9 : 0;
        break;
    }

    switch (prop2) {
      case undefined:
        t2 = 1;
        break;
      case null:
        t2 = 1;
        break;
      case false:
        t2 = 3;
        break;
      case true:
        t2 = 4;
        break;
      case "":
        t2 = 5;
        break;
      default:
        t2 = (prop2 === prop2) ? 9 : 0;
        break;
    }

    // one or both is edge case
    if (t1 !== 9 || t2 !== 9) {
      return (t1 === t2) ? equal : (t1 > t2);
    }
  }

  // if both are numbers (string encoded or not), compare as numbers
  let cv1 = Number(prop1);
  let cv2 = Number(prop2);
  if (cv1 === cv1 && cv2 === cv2) {
    if (cv1 > cv2) return true;
    if (cv1 < cv2) return false;
    return equal;
  }

  if (cv1 === cv1 && cv2 !== cv2) {
    return false;
  }

  if (cv2 === cv2 && cv1 !== cv1) {
    return true;
  }

  if (prop1 > prop2) return true;
  if (prop1 < prop2) return false;
  if (prop1 == prop2) return equal;

  // not strict equal nor less than nor gt so must be dates or mixed types
  // convert to string and use that to compare
  cv1 = prop1.toString();
  cv2 = prop2.toString();

  if (cv1 > cv2) {
    return true;
  }

  if (cv1 == cv2) {
    return equal;
  }

  return false;
}

/**
 * @param {any} prop1
 * @param {any} prop2
 * @param {boolean} descending
 * @returns {number}
 * @hidden
 */
export function sortHelper(prop1: any, prop2: any, descending: boolean): number {
  if (aeqHelper(prop1, prop2)) {
    return 0;
  }

  if (ltHelper(prop1, prop2, false)) {
    return descending ? 1 : -1;
  }

  if (gtHelper(prop1, prop2, false)) {
    return descending ? -1 : 1;
  }

  // not lt, not gt so implied equality-- date compatible
  return 0;
}

/** Hash interface for named LokiOperatorPackage registration */
export interface ILokiOperatorPackageMap {
  [name: string]: LokiOperatorPackage;
}

/**
 * Default implementation of LokiOperatorPackage, using fastest javascript comparison operators.
 */
export class LokiOperatorPackage {
  // comparison operators
  // a is the value in the collection
  // b is the query value
  $eq(a: any, b: any): boolean {
    return a === b;
  }

  $ne(a: any, b: any): boolean {
    return a !== b;
  }

  $gt(a: any, b: any): boolean {
    return a > b;
  }

  $gte(a: any, b: any): boolean {
    return a >= b;
  }

  $lt(a: any, b: any): boolean {
    return a < b;
  }

  $lte(a: any, b: any): boolean {
    return a <= b;
  }

  $between(a: any, range: [any, any]): boolean {
    if (a === undefined || a === null) return false;
    return a >= range[0] && a <= range[1];
  }

  $in(a: any, b: any): boolean {
    return b.indexOf(a) !== -1;
  }

  $nin(a: any, b: any): boolean {
    return b.indexOf(a) === -1;
  }

  $keyin(a: string, b: object): boolean {
    return a in b;
  }

  $nkeyin(a: string, b: object): boolean {
    return !(a in b);
  }

  $definedin(a: string, b: object): boolean {
    return b[a] !== undefined;
  }

  $undefinedin(a: string, b: object): boolean {
    return b[a] === undefined;
  }

  $regex(a: string, b: RegExp): boolean {
    return b.test(a);
  }

  $containsNone(a: any, b: any): boolean {
    return !this.$containsAny(a, b);
  }

  $containsAny(a: any, b: any): boolean {
    const checkFn = this.containsCheckFn(a);
    if (checkFn !== null) {
      return (Array.isArray(b)) ? (b.some(checkFn)) : (checkFn(b));
    }
    return false;
  }

  $contains(a: any, b: any): boolean {
    const checkFn = this.containsCheckFn(a);
    if (checkFn !== null) {
      return (Array.isArray(b)) ? (b.every(checkFn)) : (checkFn(b));
    }
    return false;
  }

  $type(a: any, b: any): boolean {
    let type: string = typeof a;
    if (type === "object") {
      if (Array.isArray(a)) {
        type = "array";
      } else if (a instanceof Date) {
        type = "date";
      }
    }
    return (typeof b !== "object") ? (type === b) : this.doQueryOp(type, b);
  }

  $finite(a: number, b: boolean): boolean {
    return (b === isFinite(a));
  }

  $size(a: any, b: any): boolean {
    if (Array.isArray(a)) {
      return (typeof b !== "object") ? (a.length === b) : this.doQueryOp(a.length, b);
    }
    return false;
  }

  $len(a: any, b: any): boolean {
    if (typeof a === "string") {
      return (typeof b !== "object") ? (a.length === b) : this.doQueryOp(a.length, b);
    }
    return false;
  }

  $where(a: any, b: any): boolean {
    return b(a) === true;
  }

  // field-level logical operators
  // a is the value in the collection
  // b is the nested query operation (for '$not')
  //   or an array of nested query operations (for '$and' and '$or')
  $not(a: any, b: any): boolean {
    return !this.doQueryOp(a, b);
  }

  $and(a: any, b: any): boolean {
    for (let idx = 0, len = b.length; idx < len; idx++) {
      if (!this.doQueryOp(a, b[idx])) {
        return false;
      }
    }
    return true;
  }

  $or(a: any, b: any): boolean {
    for (let idx = 0, len = b.length; idx < len; idx++) {
      if (this.doQueryOp(a, b[idx])) {
        return true;
      }
    }
    return false;
  }

  private doQueryOp(val: any, op: object) {
    for (let p in op) {
      if (Object.hasOwnProperty.call(op, p)) {
        return this[p](val, op[p]);
      }
    }
    return false;
  }

  private containsCheckFn(a: any) {
    if (typeof a === "string" || Array.isArray(a)) {
      return (b: any) => (a as any).indexOf(b) !== -1;
    } else if (typeof a === "object" && a !== null) {
      return (b: string) => Object.hasOwnProperty.call(a, b);
    }
    return null;
  }
}

/**
 * LokiOperatorPackage which utilizes abstract 'loki' comparisons for basic relational equality op implementations.
 */
export class LokiAbstractOperatorPackage extends LokiOperatorPackage {
  constructor() {
    super();
  }

  $eq(a: any, b: any): boolean {
    return aeqHelper(a, b);
  }

  $ne(a: any, b: any): boolean {
    return !aeqHelper(a, b);
  }

  $gt(a: any, b: any): boolean {
    return gtHelper(a, b, false);
  }

  $gte(a: any, b: any): boolean {
    return gtHelper(a, b, true);
  }

  $lt(a: any, b: any): boolean {
    return ltHelper(a, b, false);
  }

  $lte(a: any, b: any): boolean {
    return ltHelper(a, b, true);
  }

  $between(a: any, range: [any, any]): boolean {
    if (a === undefined || a === null) return false;
    return gtHelper(a, range[0], true) && ltHelper(a, range[1], true);
  }

}

/**
 * LokiOperatorPackage which utilizes provided comparator for basic relational equality op implementations.
 */
export class ComparatorOperatorPackage<T> extends LokiOperatorPackage {
  comparator: ILokiComparer<T>;

  constructor(comparator: ILokiComparer<T>) {
    super();
    this.comparator = comparator;
  }

  $eq(a: any, b: any): boolean {
    return this.comparator(a, b) === 0;
  }

  $ne(a: any, b: any): boolean {
    return this.comparator(a, b) !== 0;
  }

  $gt(a: any, b: any): boolean {
    return this.comparator(a, b) === 1;
  }

  $gte(a: any, b: any): boolean {
    return this.comparator(a, b) > -1;
  }

  $lt(a: any, b: any): boolean {
    return this.comparator(a, b) === -1;
  }

  $lte(a: any, b: any): boolean {
    return this.comparator(a, b) < 1;
  }

  $between(a: any, range: [any, any]): boolean {
    if (a === undefined || a === null) return false;
    return this.comparator(a, range[0]) > -1 && this.comparator(a, range[1]) < 1;
  }
}

/**
 * Map/Register of named LokiOperatorPackages which implement all unindexed query ops within 'find' query objects
 */
export let LokiOperatorPackageMap : ILokiOperatorPackageMap = {
  "js" : new LokiOperatorPackage(),
  "loki" : new LokiAbstractOperatorPackage(),
  "comparator" : new ComparatorOperatorPackage<any>(ComparatorMap["loki"])
};
