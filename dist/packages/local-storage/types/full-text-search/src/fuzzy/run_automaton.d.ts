import { Automaton } from "./automaton";
/**
 * From org/apache/lucene/util/automaton/RunAutomaton.java
 * @hidden
 */
export declare class RunAutomaton {
    private _points;
    private _accept;
    private _transitions;
    private _classmap;
    constructor(automaton: Automaton);
    getCharClass(c: number): number;
    step(state: number, c: number): number;
    isAccept(state: number): boolean;
}
