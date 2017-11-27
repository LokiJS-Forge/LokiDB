import { Automaton } from "./Automata";
export declare class LevenshteinAutomata {
    private word;
    private numRanges;
    private rangeLower;
    private rangeUpper;
    private description;
    private alphabet;
    constructor(input: number[], alphaMax?: number);
    getVector(x: number, pos: number, end: number): number;
    run(): Automaton;
}
