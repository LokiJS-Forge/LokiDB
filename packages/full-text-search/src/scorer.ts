import {InvertedIndex} from "./inverted_index";
import {Dict} from "../../common/types";
import {Query} from "./query_builder";

export type ScoreResult = Dict<number>;

/**
 * @hidden
 */
export class Scorer {
  private _invIdxs: Dict<InvertedIndex>;
  private _cache: Dict<Scorer.IDFCache>;

  constructor(invIdxs: Dict<InvertedIndex>) {
    this._invIdxs = invIdxs;
    this._cache = {};
  }

  public setDirty(): void {
    this._cache = {};
  }

  public score(fieldName: string, boost: number, termIdx: InvertedIndex.Index, doScoring: boolean, docResults: Scorer.DocResults, term: number[]): void {
    if (termIdx === null || termIdx.dc === undefined) {
      return;
    }

    const idf = this._idf(fieldName, termIdx.df);
    for (const [docId, tf] of termIdx.dc) {
      if (!docResults.has(docId)) {
        docResults.set(docId, []);
      }

      if (doScoring) {
        // BM25 scoring.
        docResults.get(docId).push({tf, idf, boost, fieldName, term});
      } else {
        // Constant scoring.
        docResults.set(docId, [{boost}]);
      }
    }
  }

  public scoreConstant(boost: number, docId: number, docResults: Scorer.DocResults) {
    if (!docResults.has(docId)) {
      docResults.set(docId, []);
    }
    docResults.get(docId).push({boost});
    return docResults;
  }

  public finalScore(query: Query, docResults: Scorer.DocResults): ScoreResult {
    const result: ScoreResult = {};
    const k1 = query.bm25 !== undefined ? query.bm25.k1 : 1.2;
    const b = query.bm25 !== undefined ? query.bm25.b : 0.75;

    for (const [docId, result1] of docResults) {
      let docScore = 0;
      for (let j = 0; j < result1.length; j++) {
        const docResult = result1[j];
        let res = 0;
        if (docResult.tf !== undefined) {
          // BM25 scoring.
          const tf = docResult.tf;
          const fieldLength = Scorer._calculateFieldLength(this._invIdxs[docResult.fieldName].documentStore.get(+docId)
            .fieldLength);
          const avgFieldLength = this._avgFieldLength(docResult.fieldName);
          const tfNorm = (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (fieldLength / avgFieldLength)));
          res = docResult.idf * tfNorm * docResult.boost;
          // console.log(
          // 	docId + ":" + docResult.fieldName + ":" + String.fromCharCode(...docResult.term) + " = " + res,
          // 	"\n\ttype: BM25",
          // 	"\n\tboost: " + docResult.boost,
          // 	"\n\tidf : " + docResult.idf,
          // 	"\n\ttfNorm : " + tfNorm,
          // 	"\n\ttf : " + tf,
          // 	"\n\tavg : " + avgFieldLength,
          // 	"\n\tfl : " + fieldLength);
        } else {
          // Constant scoring.
          res = docResult.boost;
          // console.log(
          //  "Constant: " + res,
          //  "\n\tboost: " + docResult.boost);
        }
        docScore += res;
      }
      //console.log(docId, " === ", docScore);
      result[docId] = docScore;
    }
    return result;
  }

  private static _calculateFieldLength(fieldLength: number): number {
    // Dummy function to be compatible to lucene in unit tests.
    return fieldLength;
  }

  private _getCache(fieldName: string): Scorer.IDFCache {
    if (this._cache[fieldName] === undefined) {
      const avgFieldLength = this._invIdxs[fieldName].totalFieldLength / this._invIdxs[fieldName].documentCount;
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
    return cache.idfs[docFreq] = Math.log(1 + (this._invIdxs[fieldName].documentCount - docFreq + 0.5) / (docFreq + 0.5));
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

  export interface DocResult {
    tf?: number; // Term frequency.
    idf?: number; // Inverse document frequency
    boost: number;
    fieldName?: string;
    term?: number[];
  }

  export type DocResults = Map<number, DocResult[]>;
}
