import { Long } from "./long";
/**
 * From org/apache/lucene/util/automaton/LevenshteinAutomata.java#ParametricDescription
 * @hidden
 */
export declare class ParametricDescription {
    protected _w: number;
    private _n;
    private _minErrors;
    constructor(w: number, n: number, minErrors: number[]);
    /**
     * Return the number of states needed to compute a Levenshtein DFA
     */
    size(): number;
    /**
     * Returns true if the <code>state</code> in any Levenshtein DFA is an accept state (final state).
     */
    isAccept(absState: number): boolean;
    /**
     * Returns the position in the input word for a given <code>state</code>.
     * This is the minimal boundary for the state.
     */
    getPosition(absState: number): number;
    static unpack(data: Long[], index: number, bitsPerValue: number): number;
}
