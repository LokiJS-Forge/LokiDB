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

function sortByDestMinMax(a: Transition, b: Transition) {
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
}

function sortByMinMaxDest(a: Transition, b: Transition) {
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
}

/**
 * From org/apache/lucene/util/automaton/Automaton.java
 * @hidden
 */
export class Automaton {
  private _stateTransitions: Transition[] = [];
  private _accept: Set<number>;
  private _nextState: number;
  private _currState: number;
  // public deterministic: boolean;
  private _transitions: object;

  constructor() {
    this._stateTransitions = [];
    this._accept = new Set();
    this._nextState = 0;
    this._currState = -1;
    // this.deterministic = true;
    this._transitions = {};
  }

  public isAccept(n: number): boolean {
    return this._accept.has(n);
  }

  public createState(): number {
    return this._nextState++;
  }

  public setAccept(state: number, accept: boolean): void {
    if (accept) {
      this._accept.add(state);
    } else {
      this._accept.delete(state);
    }
  }

  public finishState(): void {
    if (this._currState !== -1) {
      this._finishCurrentState();
      this._currState = -1;
    }
  }

  private _finishCurrentState(): void {
    // Sort all transitions.
    this._stateTransitions.sort(sortByDestMinMax);

    let upto = 0;
    let p: Transition = [-1, -1, -1];

    for (let i = 0, len = this._stateTransitions.length; i < len; i++) {
      let t = this._stateTransitions[i];
      if (p[0] === t[0]) {
        if (t[1] <= p[2] + 1) {
          if (t[2] > p[2]) {
            p[2] = t[2];
          }
        } else {
          if (p[0] !== -1) {
            this._stateTransitions[upto][0] = p[0];
            this._stateTransitions[upto][1] = p[1];
            this._stateTransitions[upto][2] = p[2];
            upto++;
          }
          p[1] = t[1];
          p[2] = t[2];
        }
      } else {
        if (p[0] !== -1) {
          this._stateTransitions[upto][0] = p[0];
          this._stateTransitions[upto][1] = p[1];
          this._stateTransitions[upto][2] = p[2];
          upto++;
        }
        p[0] = t[0];
        p[1] = t[1];
        p[2] = t[2];
      }
    }

    if (p[0] !== -1) {
      // Last transition
      this._stateTransitions[upto][0] = p[0];
      this._stateTransitions[upto][1] = p[1];
      this._stateTransitions[upto][2] = p[2];
      upto++;
    }

    this._transitions[this._currState] = this._stateTransitions.slice(0, upto).sort(sortByMinMaxDest);

    // if (this.deterministic && upto > 1) {
    //   let lastMax = this.stateTransitions[0][2];
    //   for (let i = 1; i < upto; i++) {
    //     let min = this.stateTransitions[i][1];
    //     if (min <= lastMax) {
    //       this.deterministic = false;
    //       break;
    //     }
    //     lastMax = this.stateTransitions[i][2];
    //   }
    // }

    this._stateTransitions = [];
  }

  public getStartPoints(): number[] {
    const pointset = new Set();
    pointset.add(MIN_CODE_POINT);

    const states = Object.keys(this._transitions);
    for (let i = 0; i < states.length; i++) {
      let trans = this._transitions[states[i]];
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

  public step(state: number, label: number): number {
    let trans = this._transitions[state];
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

  public getNumStates(): number {
    return this._nextState;
  }

  public addTransition(source: number, dest: number, min: number, max: number): void {
    if (this._currState !== source) {
      if (this._currState !== -1) {
        this._finishCurrentState();
      }
      this._currState = source;
    }
    this._stateTransitions.push([dest, min, max]);
  }
}
