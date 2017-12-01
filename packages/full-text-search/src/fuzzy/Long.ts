/**
 * Class supports 64Bit integer operations.
 * A cut-down version of dcodeIO/long.js.
 * @hidden
 */
export class Long {
  private _low: number;
  private _high: number;

  constructor(low: number = 0, high: number = 0) {
    this._low = low;
    this._high = high;
  }

  /**
   * Returns this long with bits arithmetically shifted to the right by the given amount.
   * @param {number} numBits - number of bits
   * @returns {Long} the long
   */
  shiftRight(numBits: number): Long {
    if ((numBits &= 63) === 0)
      return this;
    else if (numBits < 32)
      return new Long((this._low >>> numBits) | (this._high << (32 - numBits)), this._high >> numBits);
    else
      return new Long((this._high >> (numBits - 32)), this._high >= 0 ? 0 : -1);
  }

  /**
   * Returns this long with bits arithmetically shifted to the left by the given amount.
   * @param {number} numBits - number of bits
   * @returns {Long} the long
   */
  shiftLeft(numBits: number): Long {
    if ((numBits &= 63) === 0)
      return this;
    else if (numBits < 32)
      return new Long(this._low << numBits, (this._high << numBits) | (this._low >>> (32 - numBits)));
    else
      return new Long(0, this._low << (numBits - 32));
  }

  /**
   * Returns the bitwise AND of this Long and the specified.
   * @param {Long} other - the other Long
   * @returns {Long} the long
   */
  and(other: Long): Long {
    return new Long(this._low & other._low, this._high & other._high);
  }

  /**
   * Converts the Long to a 32 bit integer, assuming it is a 32 bit integer.
   * @returns {number}
   */
  toInt(): number {
    return this._low;
  }
}
