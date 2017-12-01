import { InvertedIndex } from "./inverted_index";
import { Dict } from "../../common/types";
import { Query } from "./query_builder";
export declare type ScoreResult = Dict<number>;
/**
 * @hidden
 */
export declare class Scorer {
    private _invIdxs;
    private _cache;
    constructor(invIdxs: Dict<InvertedIndex>);
    setDirty(): void;
    score(fieldName: string, boost: number, termIdx: InvertedIndex.Index, doScoring: boolean, docResults: Scorer.DocResults, term: number[]): void;
    scoreConstant(boost: number, docId: number, docResults: Scorer.DocResults): Map<number, Scorer.DocResult[]>;
    finalScore(query: Query, docResults: Scorer.DocResults): ScoreResult;
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
export declare namespace Scorer {
    interface IDFCache {
        idfs: Dict<number>;
        avgFieldLength: number;
    }
    interface DocResult {
        tf?: number;
        idf?: number;
        boost: number;
        fieldName?: string;
        term?: number[];
    }
    type DocResults = Map<number, DocResult[]>;
}
