import { Automaton } from "./Automaton";
/**
 * From org/apache/lucene/util/automaton/LevenshteinAutomata.java
 * @hidden
 */
export declare class LevenshteinAutomata {
    private word;
    private numRanges;
    private rangeLower;
    private rangeUpper;
    private description;
    private alphabet;
    private editDistance;
    constructor(input: number[], editDistance: number);
    getVector(x: number, pos: number, end: number): number;
    /**
     * @returns {Automaton}
     */
    toAutomaton(): Automaton;
}
