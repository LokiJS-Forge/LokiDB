export declare type Transition = [number, number, number];
export declare const MIN_CODE_POINT = 0;
export declare const MAX_CODE_POINT = 1114111;
export declare class Automaton {
    protected transitions: Transition[];
    protected _isAccept: Set<number>;
    protected nextState: number;
    protected currState: number;
    deterministic: boolean;
    protected trans: object;
    constructor();
    isAccept(n: number): boolean;
    createState(): number;
    setAccept(state: number, accept: boolean): void;
    finishState(): void;
    finishCurrentState(): void;
    getStartPoints(): number[];
    step(state: number, label: number): number;
    getNumStates(): number;
    addTransition(source: number, dest: number, min: number, max: number): void;
}
