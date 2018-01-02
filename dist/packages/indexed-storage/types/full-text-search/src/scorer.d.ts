import { InvertedIndex } from "./inverted_index";
import { Dict } from "../../common/types";
import { Query } from "./query_builder";
/**
 * @hidden
 */
export declare class Scorer {
    private _invIdxs;
    private _cache;
    constructor(invIdxs: Dict<InvertedIndex>);
    setDirty(): void;
    score(fieldName: string, boost: number, termIdx: InvertedIndex.Index, doScoring: boolean, queryResults: Scorer.QueryResults, term: number[]): void;
    scoreConstant(boost: number, docId: number, queryResults: Scorer.QueryResults): Map<number, Scorer.QueryResult[]>;
    finalScore(query: Query, queryResults: Scorer.QueryResults): Scorer.ScoreResult;
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
    interface QueryResult {
        tf?: number;
        idf?: number;
        boost: number;
        fieldName?: string;
        term?: number[];
    }
    type QueryResults = Map<number, QueryResult[]>;
    interface BM25Explanation {
        boost: number;
        score: number;
        docID: number;
        fieldName: string;
        index: string;
        idf: number;
        tfNorm: number;
        tf: number;
        fieldLength: number;
        avgFieldLength: number;
    }
    interface ConstantExplanation {
        boost: number;
        score: number;
    }
    type ScoreExplanation = BM25Explanation | ConstantExplanation;
    type ScoreResult = Dict<{
        score: number;
        explanation?: ScoreExplanation[];
    }>;
}
