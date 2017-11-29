import { Automaton } from "./Automaton";
/**
 * From org/apache/lucene/util/automaton/RunAutomaton.java
 * @hidden
 */
export declare class RunAutomaton {
    private automaton;
    private points;
    private size;
    private accept;
    private transitions;
    private classmap;
    constructor(a: Automaton);
    getCharClass(c: number): number;
    step(state: number, c: number): number;
    isAccept(state: number): boolean;
}
