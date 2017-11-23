import {Scorer} from "./scorer";
import {InvertedIndex} from "./inverted_index";
import {QueryBuilder} from "./query_builder";
import {Dict} from "../../common/types";

type Tree = any;
export type ANY = any;

export class IndexSearcher {
  private _invIdxs: Dict<InvertedIndex>;
  private _docs: ANY;
  private _scorer: Scorer;

  /**
   * @param {object} invIdxs
   */
  constructor(invIdxs: Dict<InvertedIndex>, docs: ANY) {
    this._invIdxs = invIdxs;
    this._docs = docs;
    this._scorer = new Scorer(this._invIdxs);
  }

  public search(query: ANY) {
    let docResults = this._recursive(query.query, true);

    // Final scoring.
    let finalScoring = query.final_scoring !== undefined ? query.final_scoring : true;
    if (finalScoring) {
      return this._scorer.finalScore(query, docResults);
    }
    return docResults;
  }

  public setDirty() {
    this._scorer.setDirty();
  }

  private _recursive(query: ANY, doScoring: boolean) {
    let docResults = {};
    let boost = query.boost !== undefined ? query.boost : 1;
    let fieldName = query.field !== undefined ? query.field : null;
    let enableScoring = query.enable_scoring !== undefined ? query.enable_scoring : false;

    let root = null;
    let tokenizer = null;
    if (this._invIdxs[fieldName] !== undefined) {
      root = this._invIdxs[fieldName].root;
      tokenizer = this._invIdxs[fieldName].tokenizer;
    }

    switch (query.type) {
      case "bool": {
        docResults = null;
        if (query.must !== undefined) {
          docResults = this._getUnique(query.must.values, doScoring, docResults);
        }
        if (query.filter !== undefined) {
          docResults = this._getUnique(query.filter.values, false, docResults);
        }

        if (query.should !== undefined) {
          let shouldDocs = this._getAll(query.should.values, doScoring);

          let empty = false;
          if (docResults === null) {
            docResults = {};
            empty = true;
          }

          let msm = 1;
          // TODO: Enable percent and ranges.
          if (query.minimum_should_match !== undefined) {
            msm = query.minimum_should_match;
            let shouldLength = query.should.values.length;
            if (msm <= -1) {
              msm = shouldLength + msm;
            } else if (msm < 0) {
              msm = shouldLength - Math.floor(shouldLength * -msm);
            } else if (msm < 1) {
              msm = Math.floor(shouldLength * msm);
            }
          }
          // Remove all docs with fewer matches.
          let docs = Object.keys(shouldDocs);
          for (let i = 0, docId; i < docs.length, docId = docs[i]; i++) {
            if (shouldDocs[docId].length >= msm) {
              if (docResults[docId] !== undefined) {
                docResults[docId].push(...shouldDocs[docId]);
              } else if (empty) {
                docResults[docId] = shouldDocs[docId];
              } else {
                delete docResults[docId];
              }
            }
          }
        }
        if (query.not !== undefined) {
          let notDocs = this._getAll(query.not.values, false);
          // Remove all docs.
          let docs = Object.keys(notDocs);
          for (let i = 0, docId; i < docs.length, docId = docs[i]; i++) {
            if (docResults[docId] !== undefined) {
              delete docResults[docId];
            }
          }
        }
        break;
      }
      case "term": {
        let termIdx = InvertedIndex.getTermIndex(query.value, root);
        this._scorer.prepare(fieldName, boost, termIdx, doScoring, docResults, query.value);
        break;
      }
      case "terms": {
        for (let i = 0; i < query.value.length; i++) {
          let termIdx = InvertedIndex.getTermIndex(query.value[i], root);
          this._scorer.prepare(fieldName, boost, termIdx, doScoring, docResults, query.value[i]);
        }
        break;
      }
      case "fuzzy": {
        let f = fuzzySearch(query, root);
        for (let i = 0; i < f.length; i++) {
          this._scorer.prepare(fieldName, boost * f[i].boost, f[i].index, doScoring, docResults, f[i].term);
        }
        break;
      }
      case "wildcard": {
        let w = wildcardSearch(query, root);
        for (let i = 0; i < w.length; i++) {
          this._scorer.prepare(fieldName, boost, w[i].index, doScoring && enableScoring, docResults, w[i].term);
        }
        break;
      }
      case "match_all": {
        for (let docId of this._docs) {
          this._scorer.scoreConstant(boost, docId, docResults);
        }
        break;
      }
      case "constant_score": {
        let tmpDocResults = this._getAll(query.filter.values, false);
        let docs = Object.keys(tmpDocResults);
        // Add to each document a constant score.
        for (let i = 0; i < docs.length; i++) {
          this._scorer.scoreConstant(boost, docs[i], docResults);
        }
        break;
      }
      case "prefix": {
        let termIdx = InvertedIndex.getTermIndex(query.value, root);
        if (termIdx !== null) {
          const termIdxs = InvertedIndex.extendTermIndex(termIdx);
          for (let i = 0; i < termIdxs.length; i++) {
            this._scorer.prepare(fieldName, boost, termIdxs[i].index, doScoring && enableScoring, docResults, query.value + termIdxs[i].term);
          }
        }
        break;
      }
      case "exists": {
        if (root !== null) {
          let docs = Object.keys(this._invIdxs[fieldName].documentStore);
          for (let i = 0; i < docs.length; i++) {
            this._scorer.scoreConstant(boost, docs[i], docResults);
          }
        }
        break;
      }
      case "match": {
        let terms = tokenizer.tokenize(query.value);
        let operator = query.operator !== undefined ? query.operator : "or";

        let tmpQuery: any = new QueryBuilder().bool();
        if (operator === "or") {
          if (query.minimum_should_match !== undefined) {
            tmpQuery = tmpQuery.minimumShouldMatch(query.minimum_should_match);
          }
          // Build a should query.
          tmpQuery = tmpQuery.beginShould();
        } else {
          // Build a must query.
          tmpQuery = tmpQuery.beginMust();
        }
        tmpQuery = tmpQuery.boost(boost);

        if (query.fuzziness !== undefined) {
          let prefixLength = query.prefix_length !== undefined ? query.prefix_length : 2;
          let extended = query.extended !== undefined ? query.extended : false;
          // Add each fuzzy.
          for (let i = 0; i < terms.length; i++) {
            tmpQuery = tmpQuery.fuzzy(fieldName, terms[i]).fuzziness(query.fuzziness).prefixLength(prefixLength).extended(extended);
          }
        } else {
          // Add each term.
          for (let i = 0; i < terms.length; i++) {
            tmpQuery = tmpQuery.term(fieldName, terms[i]);
          }
        }
        if (operator === "or") {
          tmpQuery = tmpQuery.endShould();
        } else {
          tmpQuery = tmpQuery.endMust();
        }
        docResults = this._recursive(tmpQuery.build().query, doScoring);

        break;
      }
      default:
        break;
    }
    return docResults;
  }

  private _getUnique(values: ANY[], doScoring: boolean, docResults: ANY) {
    if (values.length === 0) {
      return docResults;
    }

    for (let i = 0; i < values.length; i++) {
      let currDocs = this._recursive(values[i], doScoring);
      if (docResults === null) {
        docResults = this._recursive(values[0], doScoring);
        continue;
      }

      let docs = Object.keys(docResults);
      for (let j = 0, docId; j < docs.length, docId = docs[j]; j++) {
        if (currDocs[docId] === undefined) {
          delete docResults[docId];
        } else {
          docResults[docId].push(...currDocs[docId]);
        }
      }
    }
    return docResults;
  }

  private _getAll(values: ANY[], doScoring: boolean) {
    let docResults = {};
    for (let i = 0; i < values.length; i++) {
      let currDocs = this._recursive(values[i], doScoring);
      let docs = Object.keys(currDocs);
      for (let j = 0, docId; j < docs.length, docId = docs[j]; j++) {
        if (docResults[docId] === undefined) {
          docResults[docId] = currDocs[docId];
        } else {
          docResults[docId].push(...currDocs[docId]);
        }
      }
    }
    return docResults;
  }
}

/**
 * Calculates the levenshtein distance.
 * Copyright Kigiri: https://github.com/kigiri
 *           Milot Mirdita: https://github.com/milot-mirdita
 *           Toni Neubert:  https://github.com/Viatorus/
 * @param {string} a - a string
 * @param {string} b - a string
 */
function levenshteinDistance(a: string, b: string) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  let tmp;
  let i;
  let j;
  let prev;
  let val;
  // swap to save some memory O(min(a,b)) instead of O(a)
  if (a.length > b.length) {
    tmp = a;
    a = b;
    b = tmp;
  }

  const row = Array(a.length + 1);
  // init the row
  for (i = 0; i <= a.length; i++) {
    row[i] = i;
  }

  // fill in the rest
  for (i = 1; i <= b.length; i++) {
    prev = i;
    for (j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {	// match
        val = row[j - 1];
      } else {
        val = Math.min(row[j - 1] + 1, // substitution
          Math.min(prev + 1,         // insertion
            row[j] + 1));          // deletion

        // transposition.
        if (i > 1 && j > 1 && b[i - 2] === a[j - 1] && a[j - 2] === b[i - 1]) {
          val = Math.min(val, row[j - 1] - (a[j - 1] === b[i - 1] ? 1 : 0));
        }
      }
      row[j - 1] = prev;
      prev = val;
    }
    row[a.length] = prev;
  }
  return row[a.length];
}

/**
 * Performs a fuzzy search.
 * @param {ANY} query - the fuzzy query
 * @param {InvertedIndex.Index} root - the root index
 * @returns {Array}
 */
function fuzzySearch(query: ANY, root: InvertedIndex.Index) {
  let value = query.value;
  let fuzziness = query.fuzziness !== undefined ? query.fuzziness : "AUTO";
  if (fuzziness === "AUTO") {
    if (value.length <= 2) {
      fuzziness = 0;
    } else if (value.length <= 5) {
      fuzziness = 1;
    } else {
      fuzziness = 2;
    }
  }
  let prefixLength = query.prefix_length !== undefined ? query.prefix_length : 2;
  let extended = query.extended !== undefined ? query.extended : false;

  // Todo: Include levenshtein to reduce similar iterations.
  // Tree tokens at same depth share same row until depth (should works if recursive).
  // Pregenerate tree token ?
  // var treeToken = Array(token.length + maxDistance);

  let start = root;
  let pre = value.slice(0, prefixLength);
  let fuzzy = value;
  if (prefixLength !== 0) {
    start = InvertedIndex.getTermIndex(pre, start);
    fuzzy = fuzzy.slice(prefixLength);
  }
  if (start === null) {
    return [];
  }
  if (fuzzy.length === 0) {
    // Return if prefixLength == value length.
    return [{term: "", index: start, boost: 1}];
  }

  /// Fuzziness of the fuzzy without extension.
  let extend_fuzzy = 1e10;

  let similarTokens = [];
  let stack = [start];
  let treeStack = [""];
  do {
    let index = stack.pop();
    let treeTerms = treeStack.pop();

    // Compare tokens if they are in near distance.
    if (index.df !== undefined) {
      let matched = false;
      if (Math.abs(fuzzy.length - treeTerms.length) <= fuzziness) {
        const distance = levenshteinDistance(fuzzy, treeTerms);
        if (distance <= fuzziness) {
          let term = pre + treeTerms;
          // Calculate boost.
          let boost = 1 - distance / Math.min(term.length, value.length);
          similarTokens.push({term, index: index, boost});
          matched = true;
        }
      }
      // Only include extended terms that did not previously match.
      if (extend_fuzzy <= fuzziness && !matched) {
        let term = pre + treeTerms;
        // Calculate boost.
        let boost = 1 - (extend_fuzzy + treeTerms.length - fuzzy.length) / Math.min(term.length, value.length);
        similarTokens.push({term: term, index: index, boost});
      }
    }

    // Check if fuzzy should be extended.
    if (extended && treeTerms.length === fuzzy.length) {
      extend_fuzzy = levenshteinDistance(fuzzy, treeTerms);
    } else {
      extend_fuzzy = extended && extend_fuzzy <= fuzziness && treeTerms.length >= fuzzy.length
        ? extend_fuzzy
        : 1e10;
    }

    // Iterate over all subtrees.
    // If token from tree is not longer than maximal distance.
    if ((treeTerms.length - fuzzy.length <= fuzziness) || extend_fuzzy <= fuzziness) {
      // Iterate over all subtrees.
      let keys = Object.keys(index);
      for (let i = 0; i < keys.length; i++) {
        if (keys[i].length === 1) {
          stack.push(index[keys[i]]);
          treeStack.push(treeTerms + keys[i]);
        }
      }
    }
  } while (stack.length !== 0);

  return similarTokens;
}

/**
 * Performs a wildcard search.
 * @param {ANY} query - the wildcard query
 * @param {InvertedIndex.Index} root - the root index
 * @returns {Array}
 */
function wildcardSearch(query: ANY, root: InvertedIndex.Index) {
  let wildcard = query.value;
  let result: ANY[] = [];

  function recursive(index: Tree, idx: number = 0, term: string = "", escaped: boolean = false) {
    if (index === null) {
      return;
    }

    if (idx === wildcard.length) {
      if (index.df !== undefined) {
        result.push({index: index, term});
      }
      return;
    }

    if (!escaped && wildcard[idx] === "\\") {
      recursive(index, idx + 1, term, true);
    } else if (!escaped && wildcard[idx] === "?") {
      let others = InvertedIndex.getNextTermIndex(index);
      for (let i = 0; i < others.length; i++) {
        recursive(others[i].index, idx + 1, term + others[i].term);
      }
    } else if (!escaped && wildcard[idx] === "*") {
      // Check if asterisk is last wildcard character
      if (idx + 1 === wildcard.length) {
        const all = InvertedIndex.extendTermIndex(index);
        for (let i = 0; i < all.length; i++) {
          recursive(all[i].index, idx + 1, term + all[i].term);
        }
        return;
      }
      // Iterate over the whole tree.
      recursive(index, idx + 1, term);
      const indices = [{index: index, term: ""}];
      do {
        const index = indices.pop();
        let others = InvertedIndex.getNextTermIndex(index.index);
        for (let i = 0; i < others.length; i++) {
          recursive(others[i].index, idx + 1, term + index.term + others[i].term);
          indices.push({index: others[i].index, term: index.term + others[i].term});
        }
      } while (indices.length !== 0);
    } else {
      recursive(InvertedIndex.getTermIndex(wildcard[idx], index), idx + 1, term + wildcard[idx]);
    }
  }
  recursive(root);

  return result;
}
