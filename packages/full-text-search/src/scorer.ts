import {InvertedIndex} from "./inverted_index";
import {Dict} from "../../common/types";
import {Query} from "./query_types";

/**
 * @hidden
 */
export class Scorer {
  private _invIdxs: Dict<InvertedIndex>;
  private _cache: Dict<Scorer.IDFCache> = {};

  constructor(invIdxs: Dict<InvertedIndex>) {
    this._invIdxs = invIdxs;
  }

  public setDirty(): void {
    this._cache = {};
  }

  public score(fieldName: string, boost: number, termIdx: InvertedIndex.Index, doScoring: boolean,
               queryResults: Scorer.QueryResults, term: number[], df: number = 0): void {
    if (termIdx === null || termIdx.dc === undefined) {
      return;
    }

    const idf = this._idf(fieldName, df || termIdx.df);
    for (const [docId, tf] of termIdx.dc) {
      if (!queryResults.has(docId)) {
        queryResults.set(docId, []);
      }

      if (doScoring) {
        // BM25 scoring.
        queryResults.get(docId).push({tf, idf, boost, fieldName, term});
      } else {
        // Constant scoring.
        queryResults.set(docId, [{boost}]);
      }
    }
  }

  public scoreConstant(boost: number, docId: InvertedIndex.DocumentIndex,
                       queryResults: Scorer.QueryResults): Scorer.QueryResults {
    if (!queryResults.has(docId)) {
      queryResults.set(docId, []);
    }
    queryResults.get(docId).push({boost});
    return queryResults;
  }

  public finalScore(query: Query, queryResults: Scorer.QueryResults): Scorer.ScoreResults {
    const result: Scorer.ScoreResults = {};
    const k1 = query.bm25 !== undefined ? query.bm25.k1 : 1.2;
    const b = query.bm25 !== undefined ? query.bm25.b : 0.75;
    const explain = query.explain !== undefined ? query.explain : false;

    for (const [docId, result1] of queryResults) {
      let docScore = 0;
      let docExplanation: Scorer.ScoreExplanation[] = [];
      for (let j = 0; j < result1.length; j++) {
        const queryResult = result1[j];
        let score = 0;
        if (queryResult.tf !== undefined) {
          // BM25 scoring.
          const tf = queryResult.tf;
          const fieldLength = Scorer._calculateFieldLength(this._invIdxs[queryResult.fieldName].docStore.get(docId)
            .fieldLength);
          const avgFieldLength = this._avgFieldLength(queryResult.fieldName);
          const tfNorm = (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (fieldLength / avgFieldLength)));
          score = queryResult.idf * tfNorm * queryResult.boost;
          if (explain) {
            docExplanation.push({
              boost: queryResult.boost,
              score: score,
              docID: docId,
              fieldName: queryResult.fieldName,
              index: String.fromCharCode(...queryResult.term),
              idf: queryResult.idf,
              tfNorm: tfNorm,
              tf: tf,
              fieldLength: fieldLength,
              avgFieldLength: avgFieldLength,
            });
          }
        } else {
          // Constant scoring.
          score = queryResult.boost;

          if (explain) {
            docExplanation.push({
              boost: queryResult.boost,
              score: score
            });
          }
        }
        docScore += score;
      }
      if (explain) {
        result[docId] = {
          score: docScore,
          explanation: docExplanation
        };
      } else {
        result[docId] = {
          score: docScore
        };
      }
    }
    return result;
  }

  private static _calculateFieldLength(fieldLength: number): number {
    // Dummy function to be compatible to lucene in unit tests.
    return fieldLength;
  }

  private _getCache(fieldName: string): Scorer.IDFCache {
    if (this._cache[fieldName] === undefined) {
      const avgFieldLength = this._invIdxs[fieldName].totalFieldLength / this._invIdxs[fieldName].docCount;
      this._cache[fieldName] = {idfs: {}, avgFieldLength};
    }
    return this._cache[fieldName];
  }

  /**
   * Returns the idf by either calculate it or use a cached one.
   * @param {string} fieldName - the name of the field
   * @param {number} docFreq - the doc frequency of the term
   * @returns {number} the idf
   * @private
   */
  private _idf(fieldName: string, docFreq: number): number {
    const cache = this._getCache(fieldName);
    if (cache.idfs[docFreq] !== undefined) {
      return cache.idfs[docFreq];
    }
    return cache.idfs[docFreq] = Math.log(1 + (this._invIdxs[fieldName].docCount - docFreq + 0.5) / (docFreq + 0.5));
  }

  private _avgFieldLength(fieldName: string): number {
    return this._getCache(fieldName).avgFieldLength;
  }
}

export namespace Scorer {
  export interface IDFCache {
    idfs: Dict<number>;
    avgFieldLength: number;
  }

  export interface QueryResult {
    tf?: number; // Term frequency.
    idf?: number; // Inverse document frequency
    boost: number;
    fieldName?: string;
    term?: number[];
  }

  export type QueryResults = Map<InvertedIndex.DocumentIndex, QueryResult[]>;

  export interface BM25Explanation {
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

  export interface ConstantExplanation {
    boost: number;
    score: number;
  }

  export type ScoreExplanation = BM25Explanation | ConstantExplanation;
  export type ScoreResult = { score: number, explanation?: ScoreExplanation[] };
  export type ScoreResults = Dict<ScoreResult>;
}
