import { ParametricDescription } from "./parametric_description";
/**
 * From org/apache/lucene/util/automaton/Lev2TParametricDescription.java
 * @hidden
 */
export declare class Lev2TParametricDescription extends ParametricDescription {
    constructor(w: number);
    transition(absState: number, position: number, vector: number): number;
}
