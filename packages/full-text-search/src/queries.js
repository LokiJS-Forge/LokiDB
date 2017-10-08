/**
 * Query builder
 */
//import * as Utils from './utils.js';

/**
 * The base query class to enable boost to a query type.
 */
export class BaseQuery {
  /**
   * @param {string} type - the type name of the query
   * @param data
   */
  constructor(type, data = {}) {
    this._data = data;
    this._data.type = type;
  }

  /**
   * Boosts the query result.
   *
   * See also [Lucene#BoostQuery]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/BoostQuery.html}
   * and [Elasticsearch#boost]{@link https://www.elastic.co/guide/en/elasticsearch/reference/5.2/mapping-boost.html}.
   *
   * @param {number} value - the positive boost
   * @return {BaseQuery} object itself for cascading
   */
  boost(value) {
    if (value < 0) {
      throw TypeError("Boost must be a positive number.");
    }
    this._data.boost = value;
    return this;
  }

  /**
   * Build the final query.
   * @return {Object} - the final query
   */
  build() {
    return this._data;
  }
}

/**
 * A query which finds documents where a document field contains a term.
 *
 * See also [Lucene#TermQuery]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/TermQuery.html}
 * and [Elasticsearch#TermQuery]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-term-query.html}.
 *
 * @example
 * new QueryBuilder()
 *   .term("name", "infinity"])
 * .build();
 * // The resulting documents:
 * // contains the term infinity
 *
 * @extends BaseQuery
 */
export class TermQuery extends BaseQuery {
  /**
   * @param {string} field - the field name of the document
   * @param {string} term - the term
   * @param data
   */
  constructor(field, term, data = {}) {
    super("term", data);
    this._data.field = field;
    this._data.value = term;
  }
}

/**
 * A query which finds documents where a document field contains any of the terms.
 *
 * See also [Lucene#TermRangeQuery]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/TermRangeQuery.html}
 * and [Elasticsearch#TermsQuery]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-terms-query.html}.
 *
 * @example
 * new QueryBuilder()
 *   .terms("quotes", ["infinity", "atom", "energy"])
 * .build();
 * // The resulting documents:
 * // contains the terms infinity, atom or energy
 *
 * @extends BaseQuery
 */
export class TermsQuery extends BaseQuery {
  /**
   * @param {string} field - the field name of the document
   * @param {string[]} terms - the terms
   * @param data
   */
  constructor(field, terms, data = {}) {
    super("terms", data);
    this._data.field = field;
    this._data.value = terms;
  }
}

/**
 * A query which finds documents where the wildcard term can be applied at an existing document field term.
 *
 * Wildcard | Description
 * -------- | ------------
 * ? (question mark) | Skips a single character.
 *
 * To escape a wildcard character, use _\_ (backslash), e.g. \?.
 *
 * * To enable scoring for wildcard queries, use {@link WildcardQuery#enableScoring}.
 *
 * See also [Lucene#WildcardQuery]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/WildcardQuery.html}
 * and [Elasticsearch#WildcardQuery]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-wildcard-query.html}.
 *
 * _TODO: Implement wildcard * (asterisk) to skip zero or more characters._
 * @todo Implement wildcard * (asterisk) to skip zero or more characters.
 *
 * @example
 * new QueryBuilder()
 *   .wildcard("question", "e?nste?n\?")
 * .build();
 * // The resulting documents:
 * // contains the wildcard surname e?nste?n\? (like Einstein? or Eynsteyn? but not Einsteine or Ensten?)
 *
 * @extends BaseQuery
 */
export class WildcardQuery extends BaseQuery {
  /**
   * @param {string} field - the field name of the document
   * @param {string} wildcard - the wildcard term
   * @param data
   */
  constructor(field, wildcard, data = {}) {
    super("wildcard", data);
    this._data.field = field;
    this._data.value = wildcard;
  }

  /**
   * This flag enables scoring for wildcard results, similar to {@link TermQuery}.
   * @param {boolean} enable - flag to enable or disable scoring
   * @return {WildcardQuery}
   */
  enableScoring(enable) {
    this._data.enable_scoring = enable;
    return this;
  }
}

/**
 * A query which finds documents where the fuzzy term can be transformed into an existing document field term within a
 * given edit distance
 * ([Damerau–Levenshtein distance]{@link https://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance}).
 *
 * The edit distance is the minimum number of an insertion, deletion or substitution of a single character
 * or a transposition of two adjacent characters.
 *
 * * To set the maximal allowed edit distance, use {@link FuzzyQuery#fuzziness} (default is AUTO).
 * * To set the initial word length, which should ignored for fuzziness, use {@link FuzzyQuery#prefixLength}.
 *
 * See also [Lucene#FuzzyQuery]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/FuzzyQuery.html}
 * and [Elasticsearch#FuzzyQuery]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-fuzzy-query.html}.
 *
 * @example
 * new QueryBuilder()
 *   .fuzzy("surname", "einsten")
 *     .fuzziness(3)
 *     .prefixLength(3)
 * .build();
 * // The resulting documents:
 * // contains the fuzzy surname einstn (like Einstein or Einst but not Eisstein or Insten)
 *
 * @extends BaseQuery
 */
export class FuzzyQuery extends BaseQuery {
  /**
   * @param {string} field - the field name of the document
   * @param {string} fuzzy - the fuzzy term
   * @param data
   */
  constructor(field, fuzzy, data = {}) {
    super("fuzzy", data);
    this._data.field = field;
    this._data.value = fuzzy;
  }

  /**
   * Sets the maximal allowed fuzziness.
   * @param {number|string} fuzziness - the edit distance as number or AUTO
   *
   * AUTO generates an edit distance based on the length of the term:
   * * 0..2 -> must match exactly
   * * 3..5 -> one edit allowed
   * * >5 two edits allowed
   *
   * @return {FuzzyQuery} - object itself for cascading
   */
  fuzziness(fuzziness) {
    if (fuzziness !== "AUTO" && fuzziness < 0) {
      throw TypeError("Fuzziness must be a positive number or AUTO.");
    }
    this._data.fuzziness = fuzziness;
    return this;
  }

  /**
   * Sets the initial word length.
   * @param {number} prefixLength - the positive prefix length
   * @return {FuzzyQuery}  object itself for cascading
   */
  prefixLength(prefixLength) {
    if (prefixLength < 0) {
      throw TypeError("Prefix length must be a positive number.");
    }
    this._data.prefix_length = prefixLength;
    return this;
  }
}

/**
 * A query which matches documents containing the prefix of a term inside a field.
 *
 * * To enable scoring for wildcard queries, use {@link WildcardQuery#enableScoring}.
 *
 * See also [Lucene#PrefixQuery]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/PrefixQuery.html}
 * and [Elasticsearch#MatchQuery]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-prefix-query.html}
 *
 * @example
 * new QueryBuilder()
 *   .prefix("surname", "alb")
 * .build()
 * // The resulting documents:
 * // contains the term prefix alb as surname
 *
 * @extends BaseQuery
 */
export class PrefixQuery extends BaseQuery {
  /**
   * @param {string} field - the field name of the document
   * @param {string} prefix - the prefix of a term
   * @param data
   */
  constructor(field, prefix, data = {}) {
    super("prefix", data);
    this._data.field = field;
    this._data.value = prefix;
  }

  /**
   * This flag enables scoring for wildcard results, similar to {@link TermQuery}.
   * @param {boolean} enable - flag to enable or disable scoring
   * @return {PrefixQuery}
   */
  enableScoring(enable) {
    this._data.enable_scoring = enable;
    return this;
  }
}

/**
 * A query which matches all documents with a given field.
 *
 * See also [Elasticsearch#ExistsQuery]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-exists-query.html}.
 *
 * @example
 * new QueryBuilder()
 *   .exists("name")
 * .build()
 * // The resulting documents:
 * // has the field "name"
 *
 * @extends BaseQuery
 */
export class ExistsQuery extends BaseQuery {
  /**
   * @param {string} field - the field name of the document
   * @param data
   */
  constructor(field, data = {}) {
    super("exists", data);
    this._data.field = field;
  }
}

/**
 * A query which tokenizes the given query text, performs a query foreach token and combines the results using a boolean
 * operator.
 *
 * Operator      | Description
 * ------------- | -------------
 * or (default) | Finds documents which matches some tokens. The minimum amount of matches can be controlled with [minimumShouldMatch]{@link MatchQuery#minimumShouldMatch} (default is 1).
 * and | Finds documents which matches all tokens.
 *
 * To enable a [fuzzy query]{@link FuzzyQuery} for the tokens, use {@link MatchQuery#fuzziness} and {@link MatchQuery#prefixLength}.
 *
 * See also [Lucene#?]{@link ?}
 * and [Elasticsearch#MatchQuery]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-match-query.html}.
 *
 * @example
 * new QueryBuilder()
 *   .match("name", "albrt einsten")
 *     .boost(2.5)
 *     .operator("and")
 *     .fuzziness(2)
 *     .prefixLength(3)
 * .build();
 * // The resulting documents:
 * // contains the fuzzy name albrt einsten (like Albert Einstein) with a boost of 2.5
 *
 * @extends BaseQuery
 */
export class MatchQuery extends BaseQuery {
  /**
   * @param {string} field - the field name of the document
   * @param {string} query - the query text
   * @param data
   */
  constructor(field, query, data = {}) {
    super("match", data);
    this._data.field = field;
    this._data.value = query;
  }

  /**
   * Controls the amount of minimum matching sub queries before a document will be considered.
   * @param {number} minShouldMatch - number of minimum matching sub queries
   *   minShouldMatch >= 1: Indicates a fixed value regardless of the number of sub queries.
   *   minShouldMatch <= -1: Indicates that the number of sub queries, minus this number should be mandatory.
   *   minShouldMatch < 0: Indicates that this percent of the total number of sub queries can be missing.
   *     The number computed from the percentage is rounded down, before being subtracted from the total to determine
   *     the minimum.
   *   minShouldMatch < 1: Indicates that this percent of the total number of sub queries are necessary.
   *     The number computed from the percentage is rounded down and used as the minimum.
   * @return {MatchQuery} object itself for cascading
   */
  minimumShouldMatch(minShouldMatch) {
    if (this._data.operator !== undefined && this._data.operator === "and") {
      throw SyntaxError("Match query with \"and\" operator does not support minimum should match.");
    }
    this._data.minimum_should_match = minShouldMatch;
    return this;
  }

  /**
   * Sets the boolean operator.
   * @param {string} op - the operator (_or_/_and_)
   * @return {MatchQuery} object itself for cascading
   */
  operator(op) {
    if (op !== "and" && op !== "or") {
      throw SyntaxError("Unknown operator.");
    }
    this._data.operator = op;
    if (this._data.minimum_should_match !== undefined && this._data.operator === "and") {
      throw SyntaxError("Match query with \"and\" operator does not support minimum should match.");
    }
    return this;
  }

  /**
   * Sets the maximal allowed fuzziness.
   * @param {number|string} fuzziness - the edit distance as number or AUTO
   *
   * AUTO generates an edit distance based on the length of the term:
   * * 0..2 -> must match exactly
   * * 3..5 -> one edit allowed
   * * >5 two edits allowed
   *
   * @return {MatchQuery} - object itself for cascading
   */
  fuzziness(fuzziness) {
    if (fuzziness !== "AUTO" && fuzziness < 0) {
      throw TypeError("Fuzziness must be a positive number or AUTO.");
    }
    this._data.fuzziness = fuzziness;
    return this;
  }

  /**
   * Sets the starting word length which should not be considered for fuzziness.
   * @param {number} prefixLength - the positive prefix length
   * @return {MatchQuery} - object itself for cascading
   */
  prefixLength(prefixLength) {
    if (prefixLength < 0) {
      throw TypeError("Prefix length must be a positive number.");
    }
    this._data.prefix_length = prefixLength;
    return this;
  }
}

/**
 * A query that matches all documents and giving them a constant score equal to the query boost.
 *
 * Typically used inside a must clause of a {@link BoolQuery} to subsequently reject non matching documents with the not
 * clause.
 *
 * See also [Lucene#MatchAllDocsQuery]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/MatchAllDocsQuery.html}
 * and [Elasticsearch#MatchAllQuery]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-match-all-query.html}.
 *
 * @example
 * new QueryBuilder()
 *   .matchAll()
 *     .boost(2.5)
 * .build()
 * // The resulting documents:
 * // all documents and giving a score of 2.5
 *
 * @extends BaseQuery
 */
export class MatchAllQuery extends BaseQuery {
  constructor(data = {}) {
    super("match_all", data);
  }
}

/**
 * A query which holds all sub queries like an array.
 * @private
 */
class ArrayQuery extends BaseQuery {
  constructor(callbackName, callback, data = {}) {
    super("array", data);
    this._data.values = [];
    this._callbackName = callbackName;
    this[callbackName] = callback;

    this._prepare = (queryType, ...args) => {
      let data = {};
      let query = new queryType(...args, data);
      this._data.values.push(data);
      query.bool = this.bool;
      query.constantScore = this.constantScore;
      query.term = this.term;
      query.terms = this.terms;
      query.wildcard = this.wildcard;
      query.fuzzy = this.fuzzy;
      query.match = this.match;
      query.matchAll = this.matchAll;
      query.prefix = this.prefix;
      query.exists = this.exists;
      query._prepare = this._prepare;
      query[this._callbackName] = this[this._callbackName];
      return query;
    };
  }

  bool() {
    return this._prepare(BoolQuery);
  }

  constantScore() {
    return this._prepare(ConstantScoreQuery);
  }

  term(field, term) {
    return this._prepare(TermQuery, field, term);
  }

  terms(field, terms) {
    return this._prepare(TermsQuery, field, terms);
  }

  wildcard(field, wildcard) {
    return this._prepare(WildcardQuery, field, wildcard);
  }

  fuzzy(field, fuzzy) {
    return this._prepare(FuzzyQuery, field, fuzzy);
  }

  match(field, query) {
    return this._prepare(MatchQuery, field, query);
  }

  matchAll() {
    return this._prepare(MatchAllQuery);
  }

  prefix(field, prefix) {
    return this._prepare(PrefixQuery, field, prefix);
  }

  exists(field) {
    return this._prepare(ExistsQuery, field);
  }
}

/**
 * A query that wraps sub queries and returns a constant score equal to the query boost for every document in the filter.
 *
 * See also [Lucene#BooleanQuery]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/ConstantScoreQuery.html}
 * and [Elasticsearch#ConstantScoreQuery]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-constant-score-query.html}.
 *
 * @example
 * new QueryBuilder()
 *   .constantScore()
 *     .boost(1.5)
 *     .beginFilter()
 *       .term("first_name", "albert")
 *       .term("surname", "einstein")
 *     .endFilter()
 * .build()
 * // The resulting documents:
 * // * contains albert as first name, einstein as surname and the document score is 42.
 *
 * @extends BaseQuery
 */
export class ConstantScoreQuery extends BaseQuery {
  constructor(data = {}) {
    super("constant_score", data);
  }

  /**
   * Starts an array of queries. Use endFilter() to finish the array.
   * @return {ArrayQuery} array query for holding sub queries
   */
  beginFilter() {
    this._data.filter = {};
    return new ArrayQuery("endFilter", () => {
      return this;
    }, this._data.filter);
  }
}

/**
 * A query that matches documents matching boolean combinations of sub queries.
 *
 * This query consists of one or more boolean clauses with different behavior but interrelated to each other.
 *
 * Occur         | Description
 * ------------- | -------------
 * must  | Finds documents which matches all sub queries.
 * filter  | Finds documents which matches all sub queries but these documents do not contribute to the score.
 * should  | Finds documents which matches some sub queries. The minimum amount of matches can be controlled with [minimumShouldMatch]{@link BoolQuery#minimumShouldMatch} (default is 1).
 * not  | Documents which match any sub query will be ignored.
 *
 * A sub query can be any other query type and also the bool query itself.
 *
 * See also [Lucene#BooleanQuery]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/BooleanQuery.html}
 * and [Elasticsearch#BoolQuery]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-bool-query.html}.
 *
 * @example
 * new QueryBuilder()
 *   .bool()
 *     .beginMust().boost(2)
 *       .term("first_name", "albert")
 *     .endMust()
 *     .beginFilter()
 *       .term("birthplace", "ulm")
 *     .endFilter()
 *     .beginShould().minimumShouldMatch(2)
 *       .fuzzy("surname", "einstin")
 *       .wildcard("name", "geni?s")
 *       .term("quotes", "infinity")
 *     .endShould()
 *     .beginNot()
 *       .terms("research_field", ["biology", "geography"])
 *     .endNot()
 * .build();
 * // The resulting documents:
 * // contains the name albert (must: contribute to the score with a boost of 2)
 * // contains the birthplace ulm (filter: not contribute to the score)
 * // contains a minimum of two matches from the fuzzy, wildcard and/or term query (should: contribute to the score)
 * // do not contains biology or geography as research field (not: not contribute to the score)
 *
 * @extends BaseQuery
 */
export class BoolQuery extends BaseQuery {
  constructor(data = {}) {
    super("bool", data);
  }

  /**
   * Starts an array of queries for must clause. Use endMust() to finish the array.
   * @return {ArrayQuery} array query for holding sub queries
   */
  beginMust() {
    this._data.must = {};
    return new ArrayQuery("endMust", () => {
      return this;
    }, this._data.must);
  }

  /**
   * Starts an array of queries for filter clause. Use endFilter() to finish the array.
   * @return {ArrayQuery} array query for holding sub queries
   */
  beginFilter() {
    this._data.filter = {};
    return new ArrayQuery("endFilter", () => {
      return this;
    }, this._data.filter);
  }

  /**
   * Starts an array of queries for should clause. Use endShould() to finish the array.
   * @return {ArrayQuery} array query for holding sub queries
   */
  beginShould() {
    this._data.should = {};
    return new ArrayQuery("endShould", () => {
      return this;
    }, this._data.should);
  }

  /**
   * Starts an array of queries for not clause. Use endNot() to finish the array.
   * @return {ArrayQuery} array query for holding sub queries
   */
  beginNot() {
    this._data.not = {};
    return new ArrayQuery("endNot", () => {
      return this;
    }, this._data.not);
  }

  /**
   * Controls the amount of minimum matching sub queries before a document will be considered.
   * @param {number} minShouldMatch - number of minimum matching sub queries
   *   minShouldMatch >= 1: Indicates a fixed value regardless of the number of sub queries.
   *   minShouldMatch <= -1: Indicates that the number of sub queries, minus this number should be mandatory.
   *   minShouldMatch < 0: Indicates that this percent of the total number of sub queries can be missing.
   *     The number computed from the percentage is rounded down, before being subtracted from the total to determine
   *     the minimum.
   *   minShouldMatch < 1: Indicates that this percent of the total number of sub queries are necessary.
   *     The number computed from the percentage is rounded down and used as the minimum.
   * @return {BoolQuery} object itself for cascading
   */
  minimumShouldMatch(minShouldMatch) {
    this._data.minimum_should_match = minShouldMatch;
    return this;
  }
}

/**
 * This query builder is the root of each query search.
 * The query contains a sub query and parameters for setup scoring and search options.
 *
 * Possible sub query types are:
 * {@link TermQuery}, {@link TermsQuery}, {@link FuzzyQuery}, {@link WildcardQuery},
 * {@link MatchQuery}, {@link MatchAllQuery}, {@link PrefixQuery},  {@link BoolQuery},
 * {@link ConstantScoreQuery}, {@link ExistsQuery}
 *
 * @example
 * new QueryBuilder()
 *   .finalScoring(true)
 *   .useBM25(1.5, 0.5)
 *   .term("first_name", "albert")
 * .build();
 * // The resulting documents:
 * // contains the first name albert
 * // are scored and ranked using BM25 with k1=1.5 and b=0.5
 */
export class QueryBuilder {
  constructor() {
    this._data = {query: {}};
    this.useBM25();
  }

  /**
   * The query performs a final scoring over all scored sub queries and rank documents by there relevant.
   * @param {boolean} enable - flag to enable or disable final scoring
   * @return {QueryBuilder}
   */
  enableFinalScoring(enable) {
    this._data.final_scoring = enable;
    return this;
  }

  /**
   * Use [Okapi BM25]{@link https://en.wikipedia.org/wiki/Okapi_BM25} as scoring model (default).
   *
   * See also [Lucene#MatchAllDocsQuery]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/similarities/BM25Similarity.html}
   * and [Elasticsearch#BM25]{@link https://www.elastic.co/guide/en/elasticsearch/guide/current/pluggable-similarites.html#bm25}.
   *
   * @param {number} [k1=1.2] - controls how quickly an increase in term frequency results in term-frequency saturation.
   *                            Lower values result in quicker saturation, and higher values in slower saturation.
   * @param {number} [b=0.75] - controls how much effect field-length normalization should have.
   *                            A value of 0.0 disables normalization completely, and a value of 1.0 normalizes fully.
   * @return {QueryBuilder}
   */
  useBM25(k1 = 1.2, b = 0.75) {
    if (k1 < 0) {
      throw TypeError("BM25s k1 must be a positive number.");
    }
    if (b < 0 || b > 1) {
      throw TypeError("BM25s b must be a number between 0 and 1 inclusive.");
    }

    this._data.scoring = {
      type: "BM25",
      k1,
      b
    };
    return this;
  }

  bool() {
    return this._prepare(BoolQuery);
  }

  constantScore() {
    return this._prepare(ConstantScoreQuery);
  }

  term(field, term) {
    return this._prepare(TermQuery, field, term);
  }

  terms(field, terms) {
    return this._prepare(TermsQuery, field, terms);
  }

  wildcard(field, wildcard) {
    return this._prepare(WildcardQuery, field, wildcard);
  }

  fuzzy(field, fuzzy) {
    return this._prepare(FuzzyQuery, field, fuzzy);
  }

  match(field, query) {
    return this._prepare(MatchQuery, field, query);
  }

  matchAll() {
    return this._prepare(MatchAllQuery);
  }

  prefix(field, prefix) {
    return this._prepare(PrefixQuery, field, prefix);
  }

  exists(field) {
    return this._prepare(ExistsQuery, field);
  }

  _prepare(queryType, ...args) {
    this._child = new queryType(...args, this._data.query);
    this._child.build = () => {
      return this._data;
    };
    return this._child;
  }
}
