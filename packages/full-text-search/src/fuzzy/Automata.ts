/**
 * Transition with dest, min and max.
 * @hidden
 */
export declare type Transition = [number, number, number];

/**
 * @type {number}
 * @hidden
 */
export const MIN_CODE_POINT = 0;
/**
 * @type {number}
 * @hidden
 */
export const MAX_CODE_POINT = 1114111;

/**
 * From org/apache/lucene/util/automaton/Automaton.java
 * @hidden
 */
export class Automaton {
  protected transitions: Transition[] = [];
  protected _isAccept: Set<number>;
  protected nextState: number;
  protected currState: number;
  public deterministic: boolean;
  protected trans: object;

  constructor() {
    this.transitions = [];
    this._isAccept = new Set();
    this.nextState = 0;
    this.currState = -1;
    this.deterministic = true;
    this.trans = {};
  }

  isAccept(n: number): boolean {
    return this._isAccept.has(n);
  }

  createState() {
    return this.nextState++;
  }

  setAccept(state: number, accept: boolean) {
    if (accept) {
      this._isAccept.add(state);
    } else {
      this._isAccept.delete(state);
    }
  }

  finishState() {
    if (this.currState !== -1) {
      this.finishCurrentState();
      this.currState = -1;
    }
  }

  finishCurrentState() {
    const destMinMax = (a: Transition, b: Transition) => {
      if (a[0] < b[0]) {
        return -1;
      } else if (a[0] > b[0]) {
        return 1;
      }
      if (a[1] < b[1]) {
        return -1;
      } else if (a[1] > b[1]) {
        return 1;
      }
      if (a[2] < b[2]) {
        return -1;
      } else if (a[2] > b[2]) {
        return 1;
      }
      return 0;
    };

    const minMaxDest = (a: Transition, b: Transition) => {
      if (a[1] < b[1]) {
        return -1;
      } else if (a[1] > b[1]) {
        return 1;
      }
      if (a[2] < b[2]) {
        return -1;
      } else if (a[2] > b[2]) {
        return 1;
      }
      if (a[0] < b[0]) {
        return -1;
      } else if (a[0] > b[0]) {
        return 1;
      }
      return 0;
    };

    // Sort all transitions
    this.transitions.sort(destMinMax);

    let offset = 0;
    let upto = 0;
    let p: Transition = [-1, -1, -1];

    for (let i = 0, len = this.transitions.length; i < len; i++) {
      // tDest = transitions[offset + 3 * i];
      // tMin = transitions[offset + 3 * i + 1];
      // tMax = transitions[offset + 3 * i + 2];
      let t = this.transitions[i];

      if (p[0] === t[0]) {
        if (t[1] <= p[2] + 1) {
          if (t[2] > p[2]) {
            p[2] = t[2];
          }
        } else {
          if (p[0] !== -1) {
            this.transitions[offset + upto][0] = p[0];
            this.transitions[offset + upto][1] = p[1];
            this.transitions[offset + upto][2] = p[2];
            upto++;
          }
          p[1] = t[1];
          p[2] = t[2];
        }
      } else {
        if (p[0] !== -1) {
          this.transitions[offset + upto][0] = p[0];
          this.transitions[offset + upto][1] = p[1];
          this.transitions[offset + upto][2] = p[2];
          upto++;
        }
        p[0] = t[0];
        p[1] = t[1];
        p[2] = t[2];
      }
    }

    if (p[0] !== -1) {
      // Last transition
      this.transitions[offset + upto][0] = p[0];
      this.transitions[offset + upto][1] = p[1];
      this.transitions[offset + upto][2] = p[2];
      upto++;
    }

    this.transitions = this.transitions.slice(0, upto);
    this.transitions.sort(minMaxDest);

    // if (this.deterministic && upto > 1) {
    //   let lastMax = this.transitions[0][2];
    //   for (let i = 1; i < upto; i++) {
    //     let min = this.transitions[i][1];
    //     if (min <= lastMax) {
    //       this.deterministic = false;
    //       break;
    //     }
    //     lastMax = this.transitions[i][2];
    //   }
    // }

    this.trans[this.currState] = this.transitions.slice();
    this.transitions = [];
  }

  getStartPoints(): number[] {
    let pointset = new Set();
    pointset.add(MIN_CODE_POINT);

    const states = Object.keys(this.trans);
    for (let i = 0; i < states.length; i++) {
      let trans = this.trans[states[i]];
      for (let j = 0; j < trans.length; j++) {
        let tran = trans[j];
        pointset.add(tran[1]);
        if (tran[2] < MAX_CODE_POINT) {
          pointset.add(tran[2] + 1);
        }
      }
    }

    return Array.from(pointset).sort((a, b) => a - b);
  }

  step(state: number, label: number): number {
    let trans = this.trans[state];
    if (trans) {
      for (let i = 0; i < trans.length; i++) {
        let tran = trans[i];
        if (tran[1] <= label && label <= tran[2]) {
          return tran[0];
        }
      }
    }
    return -1;
  }

  getNumStates(): number {
    return this.nextState;
  }

  addTransition(source: number, dest: number, min: number, max: number) {
    if (this.currState !== source) {
      if (this.currState !== -1) {
        this.finishCurrentState();
      }
      this.currState = source;
    }
    this.transitions.push([dest, min, max]);
  }
}
