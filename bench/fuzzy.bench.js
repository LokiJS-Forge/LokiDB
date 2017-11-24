/* global suite, benchmark */
const FTS = require("./../dist/packages/full-text-search/lokijs.full-text-search.min");
const Benchmark = require("benchmark");
const Long = require("long");

function make_word() {
  let text = "";
  const possible = "abcdef";
  const length = Math.floor(Math.random() * 10);

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

const suite = new Benchmark.Suite();

// let fts = new FTS.FullTextSearch([{name: "body"}]);
// let docs = [];
// for (let i = 0; i < 1e6; i++) {
//   let doc = make_word();
//   fts.addDocument({$loki: i, body: doc});
//   docs.push(doc);
// }
// let query = new FTS.QueryBuilder().fuzzy("body", "abcd").prefixLength(2).fuzziness(1).extended(true).build();

/**
 * Idea from:
 * * http://blog.mikemccandless.com/2011/03/lucenes-fuzzyquery-is-100-times-faster.html
 * * http://julesjacobs.github.io/2015/06/17/disqus-levenshtein-simple-and-fast.html
 *
 */


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

class ParametricDescription {
  // protected final int w;
  // protected final int n;
  // private final int[] minErrors;

  constructor(/*int*/ w, /*int*/ n, /*int[]*/ minErrors) {
    this.w = w;
    this.n = n;
    this.minErrors = minErrors;
  }

  /**
   * Return the number of states needed to compute a Levenshtein DFA
   */

  /*int*/
  size() {
    return this.minErrors.length * (this.w + 1);
  };

  /**
   * Returns true if the <code>state</code> in any Levenshtein DFA is an accept state (final state).
   */

  /*boolean*/
  isAccept(/*int*/ absState) {
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

  /*int*/
  getPosition(/*int*/ absState) {
    return absState % (this.w + 1);
  }

  unpack(/*long[]*/ data, /*int*/ index, /*int*/ bitsPerValue) {
    const bitLoc = bitsPerValue * index;
    const dataLoc = (bitLoc >> 6);
    const bitStart = (bitLoc & 63);

    if (bitStart + bitsPerValue <= 64) {
      // not split
      return data[dataLoc].shiftRight(bitStart).and(MASKS[bitsPerValue - 1]).toInt();
    } else {
      // split
      const part = 64 - bitStart;
      return (data[dataLoc].shiftRight(bitStart) & MASKS[part - 1])
        + (data[1 + dataLoc].and(MASKS[bitsPerValue - part - 1]).shiftLeft(part)).toInt();
    }
  }
}

class L1 extends ParametricDescription {
  constructor(/*int*/ w) {
    super(w, 1, [0, 1, 0, -1, -1, -1])
  }

  transition(absState, position, vector) {
    // console.log(absState, position, vector);
    // null absState should never be passed in
    //assert absState != -1;

    // decode absState -> state, offset
    let state = Math.floor(absState / (this.w + 1));
    let offset = absState % (this.w + 1);
    //assert offset >= 0;

    if (position === this.w) {
      if (state < 2) {
        const loc = vector * 2 + state;
        offset += this.unpack(offsetIncrs0, loc, 1);
        state = this.unpack(toStates0, loc, 2) - 1;
      }
    } else if (position === this.w - 1) {
      if (state < 3) {
        const loc = vector * 3 + state;
        console.log("###", vector, state);
        offset += this.unpack(offsetIncrs1, loc, 1);
        state = this.unpack(toStates1, loc, 2) - 1;
        console.log("--->", loc, offset, state);
      }
    } else if (position === this.w - 2) {
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
      return state * (this.w + 1) + offset;
    }
  }
}

class Transition {
  constructor(source, dest, min, max) {
    this.source = source;
    this.dest = dest;
    this.min = min;
    this.max = max;
  }
}

class Automaton {
  constructor() {
    this.transitions = [];
    this.isAccept = new Set();
    this.nextState = 0;
    this.currState = -1;
    this.deterministic = true;
    this.trans = {};
  }

  createState() {
    return this.nextState++;
  }

  setAccept(/*int*/ state, /*boolean*/ accept) {
    if (accept) {
      this.isAccept.add(state);
    } else {
      this.isAccept.delete(state);
    }
  }

  finishState() {
    if (this.currState !== -1) {
      this.finishCurrentState();
      this.currState = -1;
    }
  }

  finishCurrentState() {
    const destMinMax = (a, b) => {
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

    const minMaxDest = (a, b) => {
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
    let p = new Transition(-1, -1, -1, -1);

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
          console.log(min, lastMax);
          console.log("########### bad ############");
          this.deterministic = false;
          break;
        }
        lastMax = this.transitions[i].max;
      }
    }

    console.log(this.transitions);

    this.trans[this.currState] = this.transitions.slice();
    this.transitions = [];
  }

  getStartPoints() {
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

  step(state, label) {
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

  getNumStates() {
    return Math.floor(this.nextState);
  }

  addTransition(source, dest, min, max) {

    if (this.currState !== source) {
      if (this.currState !== -1) {
        this.finishCurrentState();
      }
      this.currState = source;
    }
    this.transitions.push(new Transition(source, dest, min, max));
  }
}

const MIN_CODE_POINT = 0;
const MAX_CODE_POINT = 1114111;

class LevenshteinAutomata {
  constructor(input, alphaMax = MAX_CODE_POINT) {
    this.word = [];
    let word = new Set();
    for (let i = 0; i < input.length; i++) {
      this.word.push(input.codePointAt(i));
      word.add(input.codePointAt(i));
    }

    this.alphabet = Array.from(word).sort((a, b) => a - b);

    this.numRanges = 0;
    this.rangeLower = new Array(this.alphabet.length + 2);
    this.rangeUpper = new Array(this.alphabet.length + 2);
    // calculate the unicode range intervals that exclude the alphabet
    // these are the ranges for all unicode characters not in the alphabet
    let lower = 0;
    for (let i = 0; i < this.alphabet.length; i++) {
      const higher = this.alphabet[i];
      if (higher > lower) {
        this.rangeLower[this.numRanges] = lower;
        this.rangeUpper[this.numRanges] = higher - 1;
        this.numRanges++;
      }
      lower = higher + 1;
    }
    /* add the final endpoint */
    if (lower <= alphaMax) {
      this.rangeLower[this.numRanges] = lower;
      this.rangeUpper[this.numRanges] = alphaMax;
      this.numRanges++;
    }

    this.description = new L1(input.length);
  }

  getVector(x, pos, end) {
    let vector = 0;
    for (let i = pos; i < end; i++) {
      vector <<= 1;
      if (this.word[i] === x) {
        vector |= 1;
      }
    }
    return vector;
  }

  run() {
    let automat = new Automaton();

    const n = 1;
    const range = 2 * n + 1;

    // the number of states is based on the length of the word and n
    const numStates = this.description.size();

    // TODO: Prefix
    automat.createState();

    const stateOffset = 0;

    // create all states, and mark as accept states if appropriate
    for (let i = 1; i < numStates; i++) {
      let state = automat.createState();
      automat.setAccept(state, this.description.isAccept(i));
    }
    console.log(automat.isAccept);

    for (let k = 0; k < numStates; k++) {
      const xpos = this.description.getPosition(k);

      if (xpos < 0) {
        continue;
      }

      const end = xpos + Math.min(this.word.length - xpos, range);

      console.log("k:", k, "xpos:", xpos, "end:", end);

      for (let x = 0; x < this.alphabet.length; x++) {
        const ch = this.alphabet[x];
        const cvec = this.getVector(ch, xpos, end);
        const dest = this.description.transition(k, xpos, cvec);

        console.log("x:", x, "ch:", ch, "cvec:", cvec, "dest:", dest);

        if (dest >= 0) {
          console.log("transition");
          automat.addTransition(stateOffset + k, stateOffset + dest, ch, ch);
        }
      }

      console.log("last trans, k:", k, "xpos", xpos);
      const dest = this.description.transition(k, xpos, 0);

      if (dest >= 0) {
        for (let r = 0; r < this.numRanges; r++) {
          console.log("transition", r);
          automat.addTransition(stateOffset + k, stateOffset + dest, this.rangeLower[r], this.rangeUpper[r]);
        }
      }
    }

    if (!automat.deterministic) {
      exit(0);
    }
    automat.finishState();

    return automat;
  }
}

class RunAutomaton {
  constructor(a) {
    this.automaton = a;
    this.points = a.getStartPoints();
    this.size = a.getNumStates();
    this.accept = [];
    this.transitions = [];

    for (let n = 0; n < this.size; n++) {
      this.accept[n] = a.isAccept.has(n);
      for (let c = 0; c < this.points.length; c++) {
        let dest = a.step(n, this.points[c]);
        if (dest !== -1 && dest >= this.size) {
          exit(0);
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

  getCharClass(c) {
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

  step(state, c) {
    if (c >= this.classmap.length) {
      return this.transitions[state * this.points.length + this.getCharClass(c)];
    } else {
      return this.transitions[state * this.points.length + this.classmap[c]];
    }
  }

  isAccept(state) {
    return this.accept[state];
  }
}

function calculateDistance(state, a, n) {
  let ed = 0;
  state = a.step(state, '0');
  if (state !== -1) {
    ed++;
    state = a.step(state, '0');
    if (state !== -1) {
      ed++;
    }
  }
  return n - ed;
}

function run(a, root) {
  let edit_distance = 1;

  function rec() {
    let state = 0;
    let lastState = -1;

    for (let i = 0; i < token.length; i++) {
      lastState = state;
      state = a.step(state, token[i]);
      console.log(state);
      if (state === -1) {
        return false;
      }
    }

    if (a.isAccept(state)) {
      console.log("found:", word, ": ", calculateDistance(state, a, edit_distance));
      return true;
    }
  }

  console.log(root)
  //rec(root)
}

let la = new LevenshteinAutomata("xb€d");
let tr = la.run();
let ra = new RunAutomaton(tr);

let ii = new FTS.InvertedIndex();
ii.insert("abcd", 1);
ii.insert("abdc", 2);
ii.insert("abc", 3);
ii.insert("abcde", 4);

run(ra, ii.root);


//
//
// suite
//   .add("a", () => {
//     fts.search(query);
//   })
//   .add("b", () => {
//     fts.search(query);
//   })
//   // add listeners
//   .on('cycle', function (event) {
//     console.log(String(event.target));
//   })
//   .on('complete', function () {
//     console.log('Fastest is ' + this.filter('fastest').map('name'));
//   })
//   .run();
//
