import { ParametricDescription } from "./ParametricDescription";
export declare class Lev1TParametricDescription extends ParametricDescription {
    constructor(w: number);
    transition(absState: number, position: number, vector: number): number;
}
