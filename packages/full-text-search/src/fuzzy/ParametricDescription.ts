import {Long} from "./Long";

const MASKS = [new Long(0x1), new Long(0x3), new Long(0x7), new Long(0xf),
  new Long(0x1f), new Long(0x3f), new Long(0x7f), new Long(0xff),
  new Long(0x1ff), new Long(0x3ff), new Long(0x7ff), new Long(0xfff),
  new Long(0x1fff), new Long(0x3fff), new Long(0x7fff), new Long(0xffff),
  new Long(0xf, 0x1fff), new Long(0xf, 0x3fff), new Long(0xf, 0x7fff), new Long(0xf, 0xffff),
  new Long(0xff, 0x1fff), new Long(0xff, 0x3fff), new Long(0xff, 0x7fff), new Long(0xff, 0xffff),
  new Long(0xfff, 0x1fff), new Long(0xfff, 0x3fff), new Long(0xfff, 0x7fff), new Long(0xfff, 0xffff),
  new Long(0xffff, 0x1fff), new Long(0xffff, 0x3fff), new Long(0xffff, 0x7fff), new Long(0xffff, 0xffff),
  new Long(0xfffff, 0x1fff), new Long(0xfffff, 0x3fff), new Long(0xfffff, 0x7fff), new Long(0xfffff, 0xffff),
  new Long(0xffffff, 0x1fff), new Long(0xffffff, 0x3fff), new Long(0xffffff, 0x7fff), new Long(0xffffff, 0xffff),
  new Long(0xfffffff, 0x1fff), new Long(0xfffffff, 0x3fff), new Long(0xfffffff, 0x7fff), new Long(0xfffffff, 0xffff),
  new Long(0xffffffff, 0x1fff), new Long(0xffffffff, 0x3fff), new Long(0xffffffff, 0x7fff), new Long(0xffffffff, 0xffff),
  new Long(0xfffffffff, 0x1fff), new Long(0xfffffffff, 0x3fff), new Long(0xfffffffff, 0x7fff), new Long(0xfffffffff, 0xffff),
  new Long(0xffffffffff, 0x1fff), new Long(0xffffffffff, 0x3fff), new Long(0xffffffffff, 0x7fff), new Long(0xffffffffff, 0xffff),
  new Long(0xfffffffffff, 0x1fff), new Long(0xfffffffffff, 0x3fff), new Long(0xfffffffffff, 0x7fff), new Long(0xfffffffffff, 0xffff),
  new Long(0xffffffffffff, 0x1fff), new Long(0xffffffffffff, 0x3fff), new Long(0xffffffffffff, 0x7fff)];

/**
 * From org/apache/lucene/util/automaton/LevenshteinAutomata.java#ParametricDescription
 * @hidden
 */
export class ParametricDescription {
  protected w: number;
  private n: number;
  private minErrors: number[];

  constructor(w: number, n: number, minErrors: number[]) {
    this.w = w;
    this.n = n;
    this.minErrors = minErrors;
  }

  /**
   * Return the number of states needed to compute a Levenshtein DFA
   */
  size(): number {
    return this.minErrors.length * (this.w + 1);
  }

  /**
   * Returns true if the <code>state</code> in any Levenshtein DFA is an accept state (final state).
   */
  isAccept(absState: number): boolean {
    // decode absState -> state, offset
    let state = Math.floor(absState / (this.w + 1));
    let offset = absState % (this.w + 1);
    //assert offset >= 0;
    return this.w - offset + this.minErrors[state] <= this.n;
  }

  /**
   * Returns the position in the input word for a given <code>state</code>.
   * This is the minimal boundary for the state.
   */
  getPosition(absState: number): number {
    return absState % (this.w + 1);
  }

  unpack(data: Long[], index: number, bitsPerValue: number): number {
    const bitLoc = bitsPerValue * index;
    const dataLoc = (bitLoc >> 6);
    const bitStart = (bitLoc & 63);

    if (bitStart + bitsPerValue <= 64) {
      // not split
      return data[dataLoc].shiftRight(bitStart).and(MASKS[bitsPerValue - 1]).toInt();
    } else {
      // split
      const part = 64 - bitStart;
      return (data[dataLoc].shiftRight(bitStart).and(MASKS[part - 1])).toInt()
        + (data[1 + dataLoc].and(MASKS[bitsPerValue - part - 1]).shiftLeft(part)).toInt();
    }
  }
}
