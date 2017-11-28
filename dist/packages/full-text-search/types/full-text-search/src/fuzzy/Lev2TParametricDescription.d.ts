import { ParametricDescription } from "./ParametricDescription";
export declare class Lev2TParametricDescription extends ParametricDescription {
    constructor(w: number);
    transition(absState: number, position: number, vector: number): number;
}
