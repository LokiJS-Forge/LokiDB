import { InvertedIndex } from "./inverted_index";
import { Dict } from "../../common/types";
export declare type ANY = any;
/**
 * @hidden
 */
export declare class Scorer {
    private _invIdxs;
    private _cache;
    constructor(invIdxs: Dict<InvertedIndex>);
    setDirty(): void;
    prepare(fieldName: string, boost: number, termIdx: InvertedIndex.Index, doScoring: boolean, docResults?: Map<number, any[]>, term?: number[]): Map<number, any[]>;
    scoreConstant(boost: number, docId: number, docResults?: Map<number, any[]>): Map<number, any[]>;
    finalScore(query: ANY, docResults?: Map<number, any[]>): {};
    private static _calculateFieldLength(fieldLength);
    private _getCache(fieldName);
    /**
     * Returns the idf by either calculate it or use a cached one.
     * @param {string} fieldName - the name of the field
     * @param {number} docFreq - the doc frequency of the term
     * @returns {number} the idf
     * @private
     */
    private _idf(fieldName, docFreq);
    private _avgFieldLength(fieldName);
}
