import { Automaton } from "./Automata";
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
