export class Transition {
  public dest: number;
  public min: number;
  public max: number;

  constructor(dest: number, min: number, max: number) {
    this.dest = dest;
    this.min = min;
    this.max = max;
  }
}

export const MIN_CODE_POINT = 0;
export const MAX_CODE_POINT = 1114111;

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
      if (a.dest < b.dest) {
        return -1;
      } else if (a.dest > b.dest) {
        return 1;
      }
      if (a.min < b.min) {
        return -1;
      } else if (a.min > b.min) {
        return 1;
      }
      if (a.max < b.max) {
        return -1;
      } else if (a.max > b.max) {
        return 1;
      }
      return 0;
    };

    const minMaxDest = (a: Transition, b: Transition) => {
      if (a.min < b.min) {
        return -1;
      } else if (a.min > b.min) {
        return 1;
      }
      if (a.max < b.max) {
        return -1;
      } else if (a.max > b.max) {
        return 1;
      }
      if (a.dest < b.dest) {
        return -1;
      } else if (a.dest > b.dest) {
        return 1;
      }
      return 0;
    };

    // Sort all transitions
    this.transitions.sort(destMinMax);

    let offset = 0;
    let upto = 0;
    let p = new Transition(-1, -1, -1);

    for (let i = 0, len = this.transitions.length; i < len; i++) {
      // tDest = transitions[offset + 3 * i];
      // tMin = transitions[offset + 3 * i + 1];
      // tMax = transitions[offset + 3 * i + 2];
      let t = this.transitions[i];

      if (p.dest === t.dest) {
        if (t.min <= p.max + 1) {
          if (t.max > p.max) {
            p.max = t.max;
          }
        } else {
          if (p.dest !== -1) {
            this.transitions[offset + upto].dest = p.dest;
            this.transitions[offset + upto].min = p.min;
            this.transitions[offset + upto].max = p.max;
            upto++;
          }
          p.min = t.min;
          p.max = t.max;
        }
      } else {
        if (p.dest !== -1) {
          this.transitions[offset + upto].dest = p.dest;
          this.transitions[offset + upto].min = p.min;
          this.transitions[offset + upto].max = p.max;
          upto++;
        }
        p.dest = t.dest;
        p.min = t.min;
        p.max = t.max;
      }
    }

    if (p.dest !== -1) {
      // Last transition
      this.transitions[offset + upto].dest = p.dest;
      this.transitions[offset + upto].min = p.min;
      this.transitions[offset + upto].max = p.max;
      upto++;
    }

    this.transitions = this.transitions.slice(0, upto);
    this.transitions.sort(minMaxDest);

    if (this.deterministic && upto > 1) {
      let lastMax = this.transitions[0].max;
      for (let i = 1; i < upto; i++) {
        let min = this.transitions[i].min;
        if (min <= lastMax) {
          this.deterministic = false;
          break;
        }
        lastMax = this.transitions[i].max;
      }
    }

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
        pointset.add(tran.min);
        if (tran.max < MAX_CODE_POINT) {
          pointset.add(tran.max + 1);
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
        if (tran.min <= label && label <= tran.max) {
          return tran.dest;
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
    this.transitions.push(new Transition(dest, min, max));
  }
}
