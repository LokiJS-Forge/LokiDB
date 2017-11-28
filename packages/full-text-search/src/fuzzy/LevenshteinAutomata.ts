import {Automaton, MAX_CODE_POINT} from "./Automata";
import {Lev1TParametricDescription} from "./Lev1TParametricDescription";
import {Lev2TParametricDescription} from "./Lev2TParametricDescription";

/**
 * From org/apache/lucene/util/automaton/LevenshteinAutomata.java
 * @hidden
 */
export class LevenshteinAutomata {
  private word: number[];
  private numRanges: number;
  private rangeLower: number[];
  private rangeUpper: number[];
  private description: Lev1TParametricDescription;
  private alphabet: number[];
  private editDistance: number;

  constructor(input: number[], editDistance: number) {
    this.word = input;
    this.editDistance = editDistance;
    this.alphabet = Array.from(this.word).sort((a, b) => a - b) as any;

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
    if (lower <= MAX_CODE_POINT) {
      this.rangeLower[this.numRanges] = lower;
      this.rangeUpper[this.numRanges] = MAX_CODE_POINT;
      this.numRanges++;
    }

    if (editDistance == 1) {
      this.description = new Lev1TParametricDescription(input.length);
    } else {
      this.description = new Lev2TParametricDescription(input.length);
    }
  }

  getVector(x: number, pos: number, end: number) {
    let vector = 0;
    for (let i = pos; i < end; i++) {
      vector <<= 1;
      if (this.word[i] === x) {
        vector |= 1;
      }
    }
    return vector;
  }

  /**
   * @returns {Automaton}
   */
  toAutomaton() {
    let automat = new Automaton();
    const range = 2 * this.editDistance + 1;

    // the number of states is based on the length of the word and the edit distance
    const numStates = this.description.size();

    // Prefix is not needed to be handled by the automaton.
    // stateOffset = 0;
    automat.createState();

    // create all states, and mark as accept states if appropriate
    for (let i = 1; i < numStates; i++) {
      let state = automat.createState();
      automat.setAccept(state, this.description.isAccept(i));
    }

    for (let k = 0; k < numStates; k++) {
      const xpos = this.description.getPosition(k);

      if (xpos < 0) {
        continue;
      }

      const end = xpos + Math.min(this.word.length - xpos, range);
      for (let x = 0; x < this.alphabet.length; x++) {
        const ch = this.alphabet[x];
        const cvec = this.getVector(ch, xpos, end);
        const dest = this.description.transition(k, xpos, cvec);

        if (dest >= 0) {
          automat.addTransition(/*stateOffset +*/ k, /*stateOffset + */dest, ch, ch);
        }
      }

      const dest = this.description.transition(k, xpos, 0);
      if (dest >= 0) {
        for (let r = 0; r < this.numRanges; r++) {
          automat.addTransition(/*stateOffset + */k, /*stateOffset + */dest, this.rangeLower[r], this.rangeUpper[r]);
        }
      }
    }

    // assert automat.deterministic;
    automat.finishState();

    return automat;
  }
}
