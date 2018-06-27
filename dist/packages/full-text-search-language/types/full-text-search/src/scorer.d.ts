import { InvertedIndex } from "./inverted_index";
import { Dict } from "../../common/types";
import { Query } from "./query_types";
/**
 * @hidden
 */
export declare class Scorer {
    private _invIdxs;
    private _cache;
    constructor(invIdxs: Dict<InvertedIndex>);
    setDirty(): void;
    score(fieldName: string, boost: number, termIdx: InvertedIndex.Index, doScoring: boolean | null, queryResults: Scorer.QueryResults, term: number[], df?: number): void;
    scoreConstant(boost: number, docId: InvertedIndex.DocumentIndex, queryResults: Scorer.QueryResults): Scorer.QueryResults;
    finalScore(query: Query, queryResults: Scorer.QueryResults): Scorer.ScoreResults;
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
    type QueryResults = Map<InvertedIndex.DocumentIndex, QueryResult[]>;
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
    type ScoreResult = {
        score: number;
        explanation?: ScoreExplanation[];
    };
    type ScoreResults = Dict<ScoreResult>;
}
