import { InvertedIndex } from "./inverted_index";
import { Dict } from "../../common/types";
export declare type ANY = any;
export declare class Scorer {
    private _invIdxs;
    private _cache;
    constructor(invIdxs: Dict<InvertedIndex>);
    setDirty(): void;
    prepare(fieldName: string, boost: number, termIdx: ANY, doScoring: boolean, docResults?: object, term?: number[]): object;
    scoreConstant(boost: number, docId: string, docResults?: object): object;
    finalScore(query: ANY, docResults?: object): {};
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
