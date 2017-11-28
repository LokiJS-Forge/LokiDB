import {InvertedIndex} from "./inverted_index";
import {Dict} from "../../common/types";

export type ANY = any;

/**
 * @hidden
 */
export class Scorer {
  private _invIdxs: Dict<InvertedIndex>;
  private _cache: object = {};

  constructor(invIdxs: Dict<InvertedIndex>) {
    this._invIdxs = invIdxs;
  }

  setDirty() {
    this._cache = {};
  }

  prepare(fieldName: string, boost: number, termIdx: ANY, doScoring: boolean, docResults: object = {}, term: number[] = null) {
    if (termIdx === null || termIdx.dc === undefined) {
      return null;
    }

    const idf = this._idf(fieldName, termIdx.df);
    const docIds = Object.keys(termIdx.dc);
    for (let j = 0; j < docIds.length; j++) {
      const docId = docIds[j];
      if (docResults[docId] === undefined) {
        docResults[docId] = [];
      }

      if (doScoring) {
        const tf = termIdx.dc[docId];
        docResults[docId].push({type: "BM25", tf, idf, boost, fieldName, term});
      } else {
        docResults[docId] = [{type: "constant", value: 1, boost, fieldName}];
      }
    }

    return docResults;
  }

  scoreConstant(boost: number, docId: string, docResults: object = {}) {
    if (docResults[docId] === undefined) {
      docResults[docId] = [];
    }
    docResults[docId].push({type: "constant", value: 1, boost});
    return docResults;
  }

  finalScore(query: ANY, docResults: object = {}) {
    const result = {};
    const k1 = query.scoring.k1;
    const b = query.scoring.b;

    const docs = Object.keys(docResults);
    for (let i = 0, docId; i < docs.length, docId = docs[i]; i++) {
      let docScore = 0;
      for (let j = 0; j < docResults[docId].length; j++) {
        const docResult = docResults[docId][j];

        let res = 0;
        switch (docResult.type) {
          case "BM25": {
            const tf = docResult.tf;
            const fieldLength = Scorer._calculateFieldLength(this._invIdxs[docResult.fieldName].documentStore[docId]
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
            break;
          }
          case "constant":
            res = docResult.value * docResult.boost;
            // console.log(
            //  "Constant: " + res,
            //  "\n\tboost: " + docResult.boost,
            //  "\n\tvalue : " + docResult.value);
            break;
        }
        docScore += res;
      }
      //console.log(docId, " === ", docScore);
      result[docId] = docScore;
    }
    return result;
  }

  private static _calculateFieldLength(fieldLength: number) {
    return fieldLength;
  }

  private _getCache(fieldName: string) {
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
  private _idf(fieldName: string, docFreq: number) {
    const cache = this._getCache(fieldName);
    if (cache.idfs[docFreq] !== undefined) {
      return cache.idfs[docFreq];
    }
    return cache.idfs[docFreq] = Math.log(1 + (this._invIdxs[fieldName].documentCount - docFreq + 0.5) / (docFreq + 0.5));
  }

  private _avgFieldLength(fieldName: string) {
    return this._getCache(fieldName).avgFieldLength;
  }
}
