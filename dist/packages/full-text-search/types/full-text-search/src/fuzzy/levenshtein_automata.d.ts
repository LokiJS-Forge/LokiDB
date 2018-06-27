import { Automaton } from "./automaton";
/**
 * From org/apache/lucene/util/automaton/LevenshteinAutomata.java
 * @hidden
 */
export declare class LevenshteinAutomata {
    private _word;
    private _numRanges;
    private _rangeLower;
    private _rangeUpper;
    private _description;
    private _alphabet;
    private _editDistance;
    constructor(input: number[], editDistance: number);
    /**
     * Transforms the NDFA to a DFA.
     * @returns {Automaton}
     */
    toAutomaton(): Automaton;
    private _getVector(x, pos, end);
}
