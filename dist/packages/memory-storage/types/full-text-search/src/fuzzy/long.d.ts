/**
 * Class supports 64Bit integer operations.
 * A cut-down version of dcodeIO/long.js.
 * @hidden
 */
export declare class Long {
    private _low;
    private _high;
    constructor(low?: number, high?: number);
    /**
     * Returns this long with bits arithmetically shifted to the right by the given amount.
     * @param {number} numBits - number of bits
     * @returns {Long} the long
     */
    shiftRight(numBits: number): Long;
    /**
     * Returns this long with bits arithmetically shifted to the left by the given amount.
     * @param {number} numBits - number of bits
     * @returns {Long} the long
     */
    shiftLeft(numBits: number): Long;
    /**
     * Returns the bitwise AND of this Long and the specified.
     * @param {Long} other - the other Long
     * @returns {Long} the long
     */
    and(other: Long): Long;
    /**
     * Converts the Long to a 32 bit integer, assuming it is a 32 bit integer.
     * @returns {number}
     */
    toInt(): number;
}
