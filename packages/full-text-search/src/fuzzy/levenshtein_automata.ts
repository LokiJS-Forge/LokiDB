import { Automaton, MAX_CODE_POINT } from "./automaton";
import { Lev1TParametricDescription } from "./lev1t_parametric_description";
import { Lev2TParametricDescription } from "./lev2t_parametric_description";

/**
 * From org/apache/lucene/util/automaton/LevenshteinAutomata.java
 * @hidden
 */
export class LevenshteinAutomata {
  private _word: number[];
  private _numRanges: number;
  private _rangeLower: number[];
  private _rangeUpper: number[];
  private _description: Lev1TParametricDescription;
  private _alphabet: number[];
  private _editDistance: number;

  constructor(input: number[], editDistance: number) {
    this._word = input;
    this._editDistance = editDistance;
    this._alphabet = [...new Set(this._word)].sort((a: number, b: number) => a - b);

    this._numRanges = 0;
    this._rangeLower = new Array(this._alphabet.length + 2);
    this._rangeUpper = new Array(this._alphabet.length + 2);
    // calculate the unicode range intervals that exclude the alphabet
    // these are the ranges for all unicode characters not in the alphabet
    let lower = 0;
    for (let i = 0; i < this._alphabet.length; i++) {
      const higher = this._alphabet[i];
      if (higher > lower) {
        this._rangeLower[this._numRanges] = lower;
        this._rangeUpper[this._numRanges] = higher - 1;
        this._numRanges++;
      }
      lower = higher + 1;
    }
    /* add the final endpoint */
    if (lower <= MAX_CODE_POINT) {
      this._rangeLower[this._numRanges] = lower;
      this._rangeUpper[this._numRanges] = MAX_CODE_POINT;
      this._numRanges++;
    }

    if (editDistance === 1) {
      this._description = new Lev1TParametricDescription(input.length);
    } else {
      this._description = new Lev2TParametricDescription(input.length);
    }
  }

  /**
   * Transforms the NDFA to a DFA.
   * @returns {Automaton}
   */
  public toAutomaton(): Automaton {
    let automat = new Automaton();
    const range = 2 * this._editDistance + 1;

    // the number of states is based on the length of the word and the edit distance
    const numStates = this._description.size();

    // Prefix is not needed to be handled by the automaton.
    // stateOffset = 0;
    automat.createState();

    // create all states, and mark as accept states if appropriate
    for (let i = 1; i < numStates; i++) {
      let state = automat.createState();
      automat.setAccept(state, this._description.isAccept(i));
    }

    for (let k = 0; k < numStates; k++) {
      const xpos = this._description.getPosition(k);

      if (xpos < 0) {
        continue;
      }

      const end = xpos + Math.min(this._word.length - xpos, range);
      for (let x = 0; x < this._alphabet.length; x++) {
        const ch = this._alphabet[x];
        const cvec = this._getVector(ch, xpos, end);
        const dest = this._description.transition(k, xpos, cvec);

        if (dest >= 0) {
          automat.addTransition(k, dest, ch, ch);
        }
      }

      const dest = this._description.transition(k, xpos, 0);
      if (dest >= 0) {
        for (let r = 0; r < this._numRanges; r++) {
          automat.addTransition(k, dest, this._rangeLower[r], this._rangeUpper[r]);
        }
      }
    }

    // assert automat.deterministic;
    automat.finishState();

    return automat;
  }

  private _getVector(x: number, pos: number, end: number): number {
    let vector = 0;
    for (let i = pos; i < end; i++) {
      vector <<= 1;
      if (this._word[i] === x) {
        vector |= 1;
      }
    }
    return vector;
  }
}
