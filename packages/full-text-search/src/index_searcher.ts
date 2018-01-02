import {Scorer} from "./scorer";
import {InvertedIndex, toCodePoints} from "./inverted_index";
import {FuzzyQuery, Query, QueryBuilder, WildcardQuery} from "./query_builder";
import {Dict} from "../../common/types";
import {RunAutomaton} from "./fuzzy/run_automaton";
import {LevenshteinAutomata} from "./fuzzy/levenshtein_automata";
import QueryResults = Scorer.QueryResults;
import Index = InvertedIndex.Index;


/**
 * @hidden
 */
export class IndexSearcher {
  private _invIdxs: Dict<InvertedIndex>;
  private _docs: Set<number>;
  private _scorer: Scorer;

  /**
   * @param {object} invIdxs
   */
  constructor(invIdxs: Dict<InvertedIndex>, docs: Set<number>) {
    this._invIdxs = invIdxs;
    this._docs = docs;
    this._scorer = new Scorer(this._invIdxs);
  }

  public search(query: Query): Scorer.ScoreResult {
    let queryResults = this._recursive(query.query, true);

    // Do final scoring.
    if (query.final_scoring !== undefined ? query.final_scoring : true) {
      return this._scorer.finalScore(query, queryResults);
    }

    const result: Scorer.ScoreResult = {};
    for (const key of queryResults.keys()) {
      result[key] = {score: 1};
    }
    return result;
  }

  public setDirty() {
    this._scorer.setDirty();
  }

  private _recursive(query: any, doScoring: boolean) {
    let queryResults: QueryResults = new Map();
    const boost = query.boost !== undefined ? query.boost : 1;
    const fieldName = query.field !== undefined ? query.field : null;

    let root = null;
    let tokenizer = null;
    if (this._invIdxs[fieldName] !== undefined) {
      root = this._invIdxs[fieldName].root;
      tokenizer = this._invIdxs[fieldName].tokenizer;
    }

    switch (query.type) {
      case "bool": {
        queryResults = null;
        if (query.must !== undefined) {
          queryResults = this._getUnique(query.must.values, doScoring, queryResults);
        }
        if (query.filter !== undefined) {
          queryResults = this._getUnique(query.filter.values, false, queryResults);
        }
        if (query.should !== undefined) {
          let shouldDocs = this._getAll(query.should.values, doScoring);

          let empty = false;
          if (queryResults === null) {
            queryResults = new Map();
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
          for (const [docId, res] of shouldDocs) {
            if (res.length >= msm) {
              if (queryResults.has(docId)) {
                queryResults.get(docId).push(...res);
              } else if (empty) {
                queryResults.set(docId, res);
              } else {
                queryResults.delete(docId);
              }
            }
          }
        }
        if (query.not !== undefined) {
          let notDocs = this._getAll(query.not.values, false);
          // Remove all docs.
          for (const docId of notDocs.keys()) {
            if (queryResults.has(docId)) {
              queryResults.delete(docId);
            }
          }
        }
        break;
      }
      case "term": {
        const cps = toCodePoints(query.value);
        let termIdx = InvertedIndex.getTermIndex(cps, root);
        this._scorer.score(fieldName, boost, termIdx, doScoring, queryResults, cps);
        break;
      }
      case "terms": {
        for (let i = 0; i < query.value.length; i++) {
          const cps = toCodePoints(query.value[i]);
          let termIdx = InvertedIndex.getTermIndex(cps, root);
          this._scorer.score(fieldName, boost, termIdx, doScoring, queryResults, cps);
        }
        break;
      }
      case "fuzzy": {
        const f = fuzzySearch(query, root);
        for (let i = 0; i < f.length; i++) {
          this._scorer.score(fieldName, boost * f[i].boost, f[i].index, doScoring, queryResults, f[i].term);
        }
        break;
      }
      case "wildcard": {
        const enableScoring = query.enable_scoring !== undefined ? query.enable_scoring : false;
        const w = wildcardSearch(query, root);
        for (let i = 0; i < w.length; i++) {
          this._scorer.score(fieldName, boost, w[i].index, doScoring && enableScoring, queryResults, w[i].term);
        }
        break;
      }
      case "match_all": {
        for (let docId of this._docs) {
          this._scorer.scoreConstant(boost, docId, queryResults);
        }
        break;
      }
      case "constant_score": {
        let tmpQueryResults = this._getAll(query.filter.values, false);
        // Add to each document a constant score.
        for (const docId of tmpQueryResults.keys()) {
          this._scorer.scoreConstant(boost, docId, queryResults);
        }
        break;
      }
      case "prefix": {
        const enableScoring = query.enable_scoring !== undefined ? query.enable_scoring : false;
        const cps = toCodePoints(query.value);
        const termIdx = InvertedIndex.getTermIndex(cps, root);
        if (termIdx !== null) {
          const termIdxs = InvertedIndex.extendTermIndex(termIdx);
          for (let i = 0; i < termIdxs.length; i++) {
            this._scorer.score(fieldName, boost, termIdxs[i].index, doScoring && enableScoring, queryResults, [...cps, ...termIdxs[i].term]);
          }
        }
        break;
      }
      case "exists": {
        if (root !== null) {
          for (const docId of this._invIdxs[fieldName].documentStore.keys()) {
            this._scorer.scoreConstant(boost, docId, queryResults);
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
        queryResults = this._recursive(tmpQuery.build().query, doScoring);

        break;
      }
      default:
        break;
    }
    return queryResults;
  }

  private _getUnique(queries: any[], doScoring: boolean, queryResults: QueryResults) {
    if (queries.length === 0) {
      return queryResults;
    }

    for (let i = 0; i < queries.length; i++) {
      let currDocs = this._recursive(queries[i], doScoring);
      if (queryResults === null) {
        queryResults = this._recursive(queries[0], doScoring);
        continue;
      }

      for (const docId of queryResults.keys()) {
        if (!currDocs.has(docId)) {
          queryResults.delete(docId);
        } else {
          queryResults.get(docId).push(...currDocs.get(docId));
        }
      }
    }
    return queryResults;
  }

  private _getAll(queries: any[], doScoring: boolean) {
    let queryResults: QueryResults = new Map();
    for (let i = 0; i < queries.length; i++) {
      let currDocs = this._recursive(queries[i], doScoring);
      for (const docId of currDocs.keys()) {
        if (!queryResults.has(docId)) {
          queryResults.set(docId, currDocs.get(docId));
        } else {
          queryResults.get(docId).push(...currDocs.get(docId));
        }
      }
    }
    return queryResults;
  }
}

type FuzzyResult = { index: Index, term: number[], boost: number };

/**
 * Performs a fuzzy search.
 * @param {FuzzyQuery} query - the fuzzy query
 * @param {Index} root - the root index
 * @returns {FuzzyResult} - the results
 */
function fuzzySearch(query: FuzzyQuery, root: Index): FuzzyResult[] {
  let value = toCodePoints(query.value);
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

  // Do just a prefix search if zero fuzziness.
  if (fuzziness === 0) {
    prefixLength = value.length;
  }

  let result: FuzzyResult[] = [];
  let startIdx = root;
  let prefix = value.slice(0, prefixLength);
  let fuzzy = value;

  // Perform a prefix search.
  if (prefixLength !== 0) {
    startIdx = InvertedIndex.getTermIndex(prefix, startIdx);
    fuzzy = fuzzy.slice(prefixLength);
  }

  // No startIdx found.
  if (startIdx === null) {
    return result;
  }

  // Fuzzy is not necessary anymore, because prefix search includes the whole query value.
  if (fuzzy.length === 0) {
    if (extended) {
      // Add all terms down the index.
      const all = InvertedIndex.extendTermIndex(startIdx);
      for (let i = 0; i < all.length; i++) {
        result.push({index: all[i].index, term: all[i].term, boost: 1});
      }
    } else if (startIdx.dc !== undefined) {
      // Add prefix search result.
      result.push({index: startIdx, term: value, boost: 1});
    }
    return result;
  }

  // The matching term.
  const term = [0];
  // Create an automaton from the fuzzy.
  const automaton = new RunAutomaton(new LevenshteinAutomata(fuzzy, fuzziness).toAutomaton());

  function determineEditDistance(state: number, termLength: number, fuzzyLength: number): number {
    // Check how many edits this fuzzy can still do.
    let ed = 0;
    state = automaton.step(state, 0);
    if (state !== -1 && automaton.isAccept(state)) {
      ed++;
      state = automaton.step(state, 0);
      if (state !== -1 && automaton.isAccept(state)) {
        ed++;
      }
    }
    // Include the term and fuzzy length.
    ed -= Math.abs(termLength - fuzzyLength);
    return fuzziness as number - ed;
  }

  function recursive(state: number, key: number, idx: Index) {
    term[term.length - 1] = key;

    // Check the current key of term with the automaton.
    state = automaton.step(state, key);
    if (state === -1) {
      return;
    }

    if (automaton.isAccept(state)) {
      if (extended) {
        // Add all terms down the index.
        let all = InvertedIndex.extendTermIndex(idx);
        for (let i = 0; i < all.length; i++) {
          result.push({index: all[i].index, term: all[i].term, boost: 1});
        }
        return;
      } else if (idx.df !== undefined) {
        // Calculate boost.
        let distance = determineEditDistance(state, term.length, fuzzy.length);
        let boost = 1 - distance / Math.min(prefix.length + term.length, value.length);
        result.push({index: idx, term: [...prefix, ...term], boost});
      }
    }

    term.push(0);
    for (const child of idx) {
      recursive(state, child[0], child[1]);
    }
    term.pop();
  }

  for (const child of startIdx) {
    recursive(0, child[0], child[1]);
  }

  return result;
}

type WildcardResult = { index: Index, term: number[] };

/**
 * Performs a wildcard search.
 * @param {WildcardQuery} query - the wildcard query
 * @param {Index} root - the root index
 * @returns {Array} - the results
 */
function wildcardSearch(query: WildcardQuery, root: Index): WildcardResult[] {
  let wildcard = toCodePoints(query.value);
  let result: WildcardResult[] = [];

  function recursive(index: Index, idx: number = 0, term: number[] = [], escaped: boolean = false) {
    if (index === null) {
      return;
    }

    if (idx === wildcard.length) {
      if (index.df !== undefined) {
        result.push({index: index, term: term.slice()});
      }
      return;
    }

    // Escaped character.
    if (!escaped && wildcard[idx] === 92 /* \ */) {
      recursive(index, idx + 1, term, true);
    } else if (!escaped && wildcard[idx] === 63 /* ? */) {
      for (const child of index) {
        recursive(child[1], idx + 1, [...term, child[0]]);
      }
    } else if (!escaped && wildcard[idx] === 42 /* * */) {
      // Check if asterisk is last wildcard character
      if (idx + 1 === wildcard.length) {
        const all = InvertedIndex.extendTermIndex(index);
        for (let i = 0; i < all.length; i++) {
          recursive(all[i].index, idx + 1, [...term, ...all[i].term]);
        }
      } else {
        // Iterate over the whole tree.
        recursive(index, idx + 1, term, false);
        const indices: InvertedIndex.IndexTerm[] = [{index: index, term: []}];
        do {
          const index = indices.pop();
          for (const child of index.index) {
            recursive(child[1], idx + 1, [...term, ...index.term, child[0]]);
            indices.push({index: child[1], term: [...index.term, child[0]]});
          }
        } while (indices.length !== 0);
      }
    } else {
      recursive(InvertedIndex.getTermIndex([wildcard[idx]], index), idx + 1, [...term, wildcard[idx]]);
    }
  }

  recursive(root);

  return result;
}
