import { ParametricDescription } from "./parametric_description";
/**
 * From org/apache/lucene/util/automaton/Lev1TParametricDescription.java
 * @hidden
 */
export declare class Lev1TParametricDescription extends ParametricDescription {
    constructor(w: number);
    transition(absState: number, position: number, vector: number): number;
}
