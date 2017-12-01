import {Automaton} from "./automaton";

/**
 * From org/apache/lucene/util/automaton/RunAutomaton.java
 * @hidden
 */
export class RunAutomaton {
  private _points: number[];
  private _accept: boolean[];
  private _transitions: number[];
  private _classmap: number[];

  constructor(automaton: Automaton) {
    const size = automaton.getNumStates();
    this._points = automaton.getStartPoints();
    this._accept = new Array(size);
    this._transitions = new Array(size * this._points.length);

    for (let n = 0; n < size; n++) {
      this._accept[n] = automaton.isAccept(n);
      for (let c = 0; c < this._points.length; c++) {
        // assert dest == -1 || dest < size;
        this._transitions[n * this._points.length + c] = automaton.step(n, this._points[c]);
      }
    }

    this._classmap = new Array(256 /* alphaSize */);
    for (let i = 0, j = 0; j < this._classmap.length; j++) {
      if (i + 1 < this._points.length && j === this._points[i + 1]) {
        i++;
      }
      this._classmap[j] = i;
    }
  }

  getCharClass(c: number): number {
    // binary search
    let a = 0;
    let b = this._points.length;
    while (b - a > 1) {
      const d = (a + b) >>> 1;
      if (this._points[d] > c) {
        b = d;
      } else if (this._points[d] < c) {
        a = d;
      } else {
        return d;
      }
    }
    return a;
  }

  step(state: number, c: number): number {
    if (c >= this._classmap.length) {
      return this._transitions[state * this._points.length + this.getCharClass(c)];
    } else {
      return this._transitions[state * this._points.length + this._classmap[c]];
    }
  }

  isAccept(state: number): boolean {
    return this._accept[state];
  }
}
