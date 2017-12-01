import {Long} from "./long";
import {ParametricDescription} from "./parametric_description";

// 1 vectors; 2 states per vector; array length = 2
const toStates0 = [new Long(0x2)];
const offsetIncrs0 = [new Long(0x0)];

// 2 vectors; 3 states per vector; array length = 6
const toStates1 = [new Long(0xa43)];

const offsetIncrs1 = [new Long(0x38)];

// 4 vectors; 6 states per vector; array length = 24
const toStates2 = [new Long(0x82140003, 0x34534914), new Long(0x6d)];
const offsetIncrs2 = [new Long(0x55a20000, 0x5555)];

// 8 vectors; 6 states per vector; array length = 48
const toStates3 = [new Long(0x900C0003, 0x21520854), new Long(0x4534916d, 0x5b4d19a2), new Long(0xda34)];
const offsetIncrs3 = [new Long(0x20fc0000, 0x5555ae0a), new Long(0x55555555)];

// state map
//   0 -> [(0, 0)]
//   1 -> [(0, 1)]
//   2 -> [(0, 1), (1, 1)]
//   3 -> [(0, 1), (2, 1)]
//   4 -> [t(0, 1), (0, 1), (1, 1), (2, 1)]
//   5 -> [(0, 1), (1, 1), (2, 1)]

/**
 * From org/apache/lucene/util/automaton/Lev1TParametricDescription.java
 * @hidden
 */
export class Lev1TParametricDescription extends ParametricDescription {
  constructor(w: number) {
    super(w, 1, [0, 1, 0, -1, -1, -1]);
  }

  public transition(absState: number, position: number, vector: number): number {
    // null absState should never be passed in
    //assert absState != -1;

    // decode absState -> state, offset
    let state = Math.floor(absState / (this._w + 1));
    let offset = absState % (this._w + 1);
    //assert offset >= 0;

    if (position === this._w) {
      if (state < 2) {
        const loc = vector * 2 + state;
        offset += this.unpack(offsetIncrs0, loc, 1);
        state = this.unpack(toStates0, loc, 2) - 1;
      }
    } else if (position === this._w - 1) {
      if (state < 3) {
        const loc = vector * 3 + state;
        offset += this.unpack(offsetIncrs1, loc, 1);
        state = this.unpack(toStates1, loc, 2) - 1;
      }
    } else if (position === this._w - 2) {
      if (state < 6) {
        const loc = vector * 6 + state;
        offset += this.unpack(offsetIncrs2, loc, 2);
        state = this.unpack(toStates2, loc, 3) - 1;
      }
    } else {
      if (state < 6) {
        const loc = vector * 6 + state;
        offset += this.unpack(offsetIncrs3, loc, 2);
        state = this.unpack(toStates3, loc, 3) - 1;
      }
    }

    if (state === -1) {
      // null state
      return -1;
    } else {
      // translate back to abs
      return state * (this._w + 1) + offset;
    }
  }
}
