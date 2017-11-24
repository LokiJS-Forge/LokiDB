/**
 * @hidden
 */
export declare type ANY = any;
/** Helper function for determining 'loki' abstract equality which is a little more abstract than ==
 *     aeqHelper(5, '5') === true
 *     aeqHelper(5.0, '5') === true
 *     aeqHelper(new Date("1/1/2011"), new Date("1/1/2011")) === true
 *     aeqHelper({a:1}, {z:4}) === true (all objects sorted equally)
 *     aeqHelper([1, 2, 3], [1, 3]) === false
 *     aeqHelper([1, 2, 3], [1, 2, 3]) === true
 *     aeqHelper(undefined, null) === true
 */
/**
 * @hidden
 * @param {ANY} prop1
 * @param {ANY} prop2
 * @returns {boolean}
 */
export declare function aeqHelper(prop1: ANY, prop2: ANY): boolean;
/** Helper function for determining 'less-than' conditions for ops, sorting, and binary indices.
 *     In the future we might want $lt and $gt ops to use their own functionality/helper.
 *     Since binary indices on a property might need to index [12, NaN, new Date(), Infinity], we
 *     need this function (as well as gtHelper) to always ensure one value is LT, GT, or EQ to another.
 * @hidden
 */
export declare function ltHelper(prop1: ANY, prop2: ANY, equal: boolean): boolean;
/**
 * @hidden
 * @param {ANY} prop1
 * @param {ANY} prop2
 * @param {boolean} equal
 * @returns {boolean}
 */
export declare function gtHelper(prop1: ANY, prop2: ANY, equal: boolean): boolean;
/**
 * @hidden
 * @param {ANY} prop1
 * @param {ANY} prop2
 * @param {ANY} desc
 * @returns {number}
 */
export declare function sortHelper(prop1: ANY, prop2: ANY, desc: ANY): 0 | 1 | -1;
