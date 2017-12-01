/**
 * Transition with dest, min and max.
 * @hidden
 */
export declare type Transition = [number, number, number];
/**
 * @type {number}
 * @hidden
 */
export declare const MIN_CODE_POINT = 0;
/**
 * @type {number}
 * @hidden
 */
export declare const MAX_CODE_POINT = 1114111;
/**
 * From org/apache/lucene/util/automaton/Automaton.java
 * @hidden
 */
export declare class Automaton {
    private _stateTransitions;
    private _accept;
    private _nextState;
    private _currState;
    private _transitions;
    constructor();
    isAccept(n: number): boolean;
    createState(): number;
    setAccept(state: number, accept: boolean): void;
    finishState(): void;
    private _finishCurrentState();
    getStartPoints(): number[];
    step(state: number, label: number): number;
    getNumStates(): number;
    addTransition(source: number, dest: number, min: number, max: number): void;
}
