import {Automaton} from "./Automata";

export class RunAutomaton {

  private automaton: Automaton;
  private points: number[];
  private size: number;
  private accept: boolean[];
  private transitions: number[];
  private alphabetSize: number;
  private classmap: number[];

  constructor(a: Automaton) {
    this.automaton = a;
    this.points = a.getStartPoints();
    this.size = a.getNumStates();
    this.accept = [];
    this.transitions = [];

    for (let n = 0; n < this.size; n++) {
      this.accept[n] = a.isAccept(n);
      for (let c = 0; c < this.points.length; c++) {
        let dest = a.step(n, this.points[c]);
        if (dest !== -1 && dest >= this.size) {
          //exit(0);
          // console.log("bad1");
        }
        this.transitions[n * this.points.length + c] = dest;
      }
    }

    this.alphabetSize = 256;

    this.classmap = new Array(Math.min(256, this.alphabetSize));
    let i = 0;
    for (let j = 0; j < this.classmap.length; j++) {
      if (i + 1 < this.points.length && j === this.points[i + 1]) {
        i++;
      }
      this.classmap[j] = i;
    }
  }

  getCharClass(c: number): number {
    // binary search
    let a = 0;
    let b = this.points.length;
    while (b - a > 1) {
      let d = (a + b) >>> 1;
      if (this.points[d] > c) b = d;
      else if (this.points[d] < c) a = d;
      else return d;
    }
    return a;
  }

  step(state: number, c: number): number {
    if (c >= this.classmap.length) {
      return this.transitions[state * this.points.length + this.getCharClass(c)];
    } else {
      return this.transitions[state * this.points.length + this.classmap[c]];
    }
  }

  isAccept(state: number): boolean {
    return this.accept[state];
  }
}
