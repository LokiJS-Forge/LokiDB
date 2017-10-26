import {InvertedIndex} from "./inverted_index";
import {Dictionary} from "./full_text_search";

export type ANY = any;

export class Scorer {
  private _invIdxs: Dictionary<InvertedIndex>;
  private _cache: object = {};

  constructor(invIdxs: Dictionary<InvertedIndex>) {
    this._invIdxs = invIdxs;
  }

  setDirty() {
    this._cache = {};
  }

  prepare(fieldName: string, boost: number, termIdx: ANY, doScoring: boolean, docResults: object = {}, term: string = null) {
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
            // 	docId + ":" + docResult.fieldName + ":" + docResult.term + " = " + res,
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
            /*console.log(
             "Constant: " + res,
             "\n\tboost: " + docResult.boost,
             "\n\tvalue : " + docResult.value);*/
            break;
        }
        docScore += res;
      }
      //console.log(docId, " === ", docScore);
      result[docId] = docScore;
    }
    return result;
  }

  static _calculateFieldLength(fieldLength: number) {
    // Lucene uses a SmallFloat (size of 1 byte) to store the field length in scoring.
    // This is useless in javascript, because every number is represented as a double (8 byte).
    // To align the scoring result with lucene, this calculation is still needed.
    // Lucene also includes the field boost, but field boost is deprecated and not supported by Loki.

    // Find closest value in array.
    const lockUp = [1, 1.30612242, 1.77777779, 2.55999994, 4, 5.22448969, 7.11111116, 10.2399998, 16, 20.8979588,
      28.4444447, 40.9599991, 64, 83.591835, 113.777779, 163.839996, 256, 334.36734, 455.111115, 655.359985, 1024,
      1337.46936, 1820.44446, 2621.43994, 4096, 5349.87744, 7281.77783, 10485.7598, 16384, 21399.5098, 29127.1113,
      41943.0391, 65536, 85598.0391, 116508.445, 167772.156, 262144, 342392.156, 466033.781, 671088.625, 1048576,
      1369568.62, 1864135.12, 2684354.5, 4194304, 5478274.5, 7456540.5, 10737418, 16777216, 21913098, 29826162,
      42949672, 67108864, 87652392, 119304648, 171798688, 268435456, 350609568, 477218592, 687194752];

    for (let i = 0; i < lockUp.length; i++) {
      if (lockUp[i] >= fieldLength) {
        return lockUp[i];
      }
    }
    throw RangeError("Unsupported field length.");
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
