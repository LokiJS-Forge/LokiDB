import {Scorer} from "./scorer";
import {InvertedIndex} from "./inverted_index";
import {QueryBuilder} from "./queries";

export class IndexSearcher {
  /**
   *
   * @param {object} invIdxs
   */
  constructor(invIdxs, docs) {
    this._invIdxs = invIdxs;
    this._docs = docs;
    this._scorer = new Scorer(this._invIdxs);
  }

  search(query) {
    let docResults = this._recursive(query.query, true);

    // Final scoring.
    let finalScoring = query.final_scoring !== undefined ? query.final_scoring : true;
    if (finalScoring) {
      return this._scorer.finalScore(query, docResults);
    }
    return docResults;
  }

  setDirty() {
    this._scorer.setDirty();
  }

  _recursive(query, doScoring) {
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
        let f = new FuzzySearch(query);
        let b = f.search(root);
        for (let i = 0; i < b.length; i++) {
          this._scorer.prepare(fieldName, boost * b[i].boost, b[i].index, doScoring, docResults, b[i].term);
        }
        break;
      }
      case "wildcard": {
        let w = new WildcardSearch(query);
        let a = w.search(root);
        for (let i = 0; i < a.length; i++) {
          this._scorer.prepare(fieldName, boost, a[i].index, doScoring && enableScoring, docResults, a[i].term);
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
          termIdx = InvertedIndex.extendTermIndex(termIdx);
          for (let i = 0; i < termIdx.length; i++) {
            this._scorer.prepare(fieldName, boost, termIdx[i].index, doScoring && enableScoring, docResults, query.value + termIdx[i].term);
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

        let tmpQuery = new QueryBuilder().bool();
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
          // Add each fuzzy.
          for (let i = 0; i < terms.length; i++) {
            tmpQuery = tmpQuery.fuzzy(fieldName, terms[i]).fuzziness(query.fuzziness).prefixLength(prefixLength);
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

  _getUnique(values, doScoring, docResults) {
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

  _getAll(values, doScoring) {
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


class FuzzySearch {
  constructor(query) {
    this._fuzzy = query.value;
    this._fuzziness = query.fuzziness !== undefined ? query.fuzziness : "AUTO";
    if (this._fuzziness === "AUTO") {
      if (this._fuzzy.length <= 2) {
        this._fuzziness = 0;
      } else if (this._fuzzy.length <= 5) {
        this._fuzziness = 1;
      } else {
        this._fuzziness = 2;
      }
    }
    this._prefixLength = query.prefix_length !== undefined ? query.prefix_length : 2;
  }

  /**
   * Copyright Kigiri: https://github.com/kigiri
   *           Milot Mirdita: https://github.com/milot-mirdita
   *           Toni Neubert:  https://github.com/Viatorus/
   */
  levenshtein_distance(a, b) {
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
   * Performs a fuzzy search for a given term.
   * @param {string} query - a fuzzy term to match.
   * @param {number} [maxDistance=2] - maximal edit distance between terms
   * @returns {Array} - array with all matching term indices.
   */
  search(root) {
    // Todo: Include levenshtein to reduce similar iterations.
    // Tree tokens at same depth share same row until depth (should works if recursive).
    // Pregenerate tree token ?
    // var treeToken = Array(token.length + maxDistance);

    let start = root;
    let pre = this._fuzzy.slice(0, this._prefixLength);
    let fuzzy = this._fuzzy;
    if (this._prefixLength !== 0) {
      start = InvertedIndex.getTermIndex(pre, start);
      fuzzy = fuzzy.slice(this._prefixLength);
    }
    if (start === null) {
      return [];
    }
    if (fuzzy.length === 0) {
      // Return if prefixLength == this._fuzzy length.
      return [{term: this._fuzziness, index: start, boost: 1}];
    }

    let similarTokens = [];

    let stack = [start];
    let treeStack = [""];
    do {
      let root = stack.pop();
      let treeTerms = treeStack.pop();

      // Compare tokens if they are in near distance.
      if (root.df !== undefined && Math.abs(fuzzy.length - treeTerms.length) <= this._fuzziness) {
        const distance = this.levenshtein_distance(fuzzy, treeTerms);
        if (distance <= this._fuzziness) {
          let term = pre + treeTerms;
          // Calculate boost.
          let boost = 1 - distance / Math.min(term.length, this._fuzzy.length);
          similarTokens.push({term, index: root, boost});
        }
      }

      // Iterate over all subtrees.
      // If token from tree is not longer than maximal distance.
      if (treeTerms.length - fuzzy.length <= this._fuzziness) {
        // Iterate over all subtrees.
        let keys = Object.keys(root);
        for (let i = 0; i < keys.length; i++) {
          if (keys[i].length === 1) {
            stack.push(root[keys[i]]);
            treeStack.push(treeTerms + keys[i]);
          }
        }
      }
    } while (stack.length !== 0);

    return similarTokens;
  }
}

class WildcardSearch {

  constructor(query) {
    this._wildcard = query.value;
    this._result = [];
  }

  /**
   * Performs a wild card search for a given query term.
   * @param {string} query - a wild card query to match.
   * @returns {Array} - array with all matching term indices.
   */
  search(root) {
    // Todo: Need an implementation for star operator in the middle.
    this._result = [];
    this._recursive(root);
    return this._result;
  }

  /**
   *
   * @param root
   * @param idx
   * @param term
   * @param escaped
   * @private
   */
  _recursive(root, idx = 0, term = "", escaped = false) {
    if (root === null) {
      return;
    }

    if (idx === this._wildcard.length) {
      if (root.df !== undefined) {
        this._result.push({index: root, term});
      }
      return;
    }

    if (!escaped && this._wildcard[idx] === "\\") {
      this._recursive(root, idx + 1, term, true);
    } else if (!escaped && this._wildcard[idx] === "?") {
      let others = InvertedIndex.getNextTermIndex(root);
      for (let i = 0; i < others.length; i++) {
        this._recursive(others[i].index, idx + 1, term + others[i].term);
      }
    } else if (!escaped && this._wildcard[idx] === "*") {
      // Check if asterisk is last wildcard character
      if (idx + 1 === this._wildcard.length) {
        let all = InvertedIndex.extendTermIndex(root);
        for (let i = 0; i < all.length; i++) {
          this._recursive(all[i].index, idx + 1, term + all[i].term);
        }
        return;
      }
      // Iterate over the whole tree.
      this._recursive(root, idx + 1, term);
      let roots = [{index: root, term: ""}];
      do {
        root = roots.pop();
        let others = InvertedIndex.getNextTermIndex(root.index);
        for (let i = 0; i < others.length; i++) {
          this._recursive(others[i].index, idx + 1, term + root.term + others[i].term);
          roots.push({index: others[i].index, term: root.term + others[i].term});
        }
      } while (roots.length !== 0);
    } else {
      this._recursive(InvertedIndex.getTermIndex(this._wildcard[idx], root), idx + 1, term + this._wildcard[idx]);
    }
  }
}
