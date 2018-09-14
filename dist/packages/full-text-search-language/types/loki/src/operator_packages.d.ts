import { ILokiComparer } from "./comparators";
/** Hash interface for named LokiOperatorPackage registration */
export interface ILokiOperatorPackageMap {
    [name: string]: LokiOperatorPackage;
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
export declare function aeqHelper(prop1: any, prop2: any): boolean;
/**
 * Helper function for determining 'less-than' conditions for ops, sorting, and binary indices.
 *     In the future we might want $lt and $gt ops to use their own functionality/helper.
 *     Since binary indices on a property might need to index [12, NaN, new Date(), Infinity], we
 *     need this function (as well as gtHelper) to always ensure one value is LT, GT, or EQ to another.
 * @hidden
 */
export declare function ltHelper(prop1: any, prop2: any, equal: boolean): boolean;
/**
 * @hidden
 * @param {any} prop1
 * @param {any} prop2
 * @param {boolean} equal
 * @returns {boolean}
 */
export declare function gtHelper(prop1: any, prop2: any, equal: boolean): boolean;
/**
 * @param {any} prop1
 * @param {any} prop2
 * @param {boolean} descending
 * @returns {number}
 * @hidden
 */
export declare function sortHelper(prop1: any, prop2: any, descending: boolean): number;
/**
 * Default implementation of LokiOperatorPackage, using fastest javascript comparison operators.
 */
export declare class LokiOperatorPackage {
    $eq(a: any, b: any): boolean;
    $ne(a: any, b: any): boolean;
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
    private doQueryOp(val, op);
    private containsCheckFn(a);
}
/**
 * LokiOperatorPackage which utilizes abstract 'loki' comparisons for basic relational equality op implementations.
 */
export declare class LokiAbstractOperatorPackage extends LokiOperatorPackage {
    constructor();
    $eq(a: any, b: any): boolean;
    $ne(a: any, b: any): boolean;
    $gt(a: any, b: any): boolean;
    $gte(a: any, b: any): boolean;
    $lt(a: any, b: any): boolean;
    $lte(a: any, b: any): boolean;
    $between(a: any, range: [any, any]): boolean;
}
/**
 * LokiOperatorPackage which utilizes provided comparator for basic relational equality op implementations.
 */
export declare class ComparatorOperatorPackage<T> extends LokiOperatorPackage {
    comparator: ILokiComparer<T>;
    constructor(comparator: ILokiComparer<T>);
    $eq(a: any, b: any): boolean;
    $ne(a: any, b: any): boolean;
    $gt(a: any, b: any): boolean;
    $gte(a: any, b: any): boolean;
    $lt(a: any, b: any): boolean;
    $lte(a: any, b: any): boolean;
    $between(a: any, range: [any, any]): boolean;
}
/**
 * Map/Register of named LokiOperatorPackages which implement all unindexed query ops within 'find' query objects
 */
export declare let LokiOperatorPackageMap: ILokiOperatorPackageMap;
