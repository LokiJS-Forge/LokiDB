/**
 * The base query class to enable boost to a query type.
 */
export class BaseQueryBuilder {
  protected _data: any;

  /**
   * @param {string} type - the type name of the query
   * @param data
   */
  constructor(type: string, data: any = {}) {
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
   * @return {BaseQueryBuilder} object itself for cascading
   */
  boost(value: number) {
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
  build(): any {
    return this._data;
  }
}

export interface BaseQuery<Type> {
  type: Type;
  boost?: number;
}

/**
 * A query which finds documents where a document field contains a term.
 *
 * See also [Lucene#TermQueryBuilder]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/TermQuery.html}
 * and [Elasticsearch#TermQueryBuilder]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-term-query.html}.
 *
 * @example
 * new QueryBuilder()
 *   .term("name", "infinity"])
 * .build();
 * // The resulting documents:
 * // contains the term infinity
 *
 * @extends BaseQueryBuilder
 */
export class TermQueryBuilder extends BaseQueryBuilder {
  /**
   * @param {string} field - the field name of the document
   * @param {string} term - the term
   * @param data
   */
  constructor(field: string, term: string, data: any = {}) {
    super("term", data);
    this._data.field = field;
    this._data.value = term;
  }
}

export interface TermQuery extends BaseQuery<"term"> {
  field: string;
  value: string;
}

/**
 * A query which finds documents where a document field contains any of the terms.
 *
 * See also [Lucene#TermRangeQuery]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/TermRangeQuery.html}
 * and [Elasticsearch#TermsQueryBuilder]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-terms-query.html}.
 *
 * @example
 * new QueryBuilder()
 *   .terms("quotes", ["infinity", "atom", "energy"])
 * .build();
 * // The resulting documents:
 * // contains the terms infinity, atom or energy
 *
 * @extends BaseQueryBuilder
 */
export class TermsQueryBuilder extends BaseQueryBuilder {
  /**
   * @param {string} field - the field name of the document
   * @param {string[]} terms - the terms
   * @param data
   */
  constructor(field: string, terms: Array<string>, data: any = {}) {
    super("terms", data);
    this._data.field = field;
    this._data.value = terms;
  }
}

export interface TermsQuery extends BaseQuery<"terms"> {
  field: string;
  value: string[];
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
 * * To enable scoring for wildcard queries, use {@link WildcardQueryBuilder#enableScoring}.
 *
 * See also [Lucene#WildcardQueryBuilder]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/WildcardQuery.html}
 * and [Elasticsearch#WildcardQueryBuilder]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-wildcard-query.html}.
 *
 * @example
 * new QueryBuilder()
 *   .wildcard("question", "e?nst*n\?")
 * .build();
 * // The resulting documents:
 * // contains the wildcard surname e?nst*n\? (like Einstein? or Eynsteyn? but not Einsteine or Ensten?)
 *
 * @extends BaseQueryBuilder
 */
export class WildcardQueryBuilder extends BaseQueryBuilder {
  /**
   * @param {string} field - the field name of the document
   * @param {string} wildcard - the wildcard term
   * @param data
   */
  constructor(field: string, wildcard: string, data: any = {}) {
    super("wildcard", data);
    this._data.field = field;
    this._data.value = wildcard;
  }

  /**
   * This flag enables scoring for wildcard results, similar to {@link TermQueryBuilder}.
   * @param {boolean} enable - flag to enable or disable scoring
   * @return {WildcardQueryBuilder}
   */
  enableScoring(enable: boolean) {
    this._data.enable_scoring = enable;
    return this;
  }
}

export interface WildcardQuery extends BaseQuery<"wildcard"> {
  field: string;
  value: string;
  enable_scoring?: boolean;
}

/**
 * A query which finds documents where the fuzzy term can be transformed into an existing document field term within a
 * given edit distance.
 * ([Damerau–Levenshtein distance]{@link https://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance}).
 *
 * The edit distance is the minimum number of an insertion, deletion or substitution of a single character
 * or a transposition of two adjacent characters.
 *
 * * To set the maximal allowed edit distance, use {@link FuzzyQueryBuilder#fuzziness} (default is AUTO).
 * * To set the initial word length, which should ignored for fuzziness, use {@link FuzzyQueryBuilder#prefixLength}.
 * * To include longer document field terms than the fuzzy term and edit distance together, use
 *   {@link FuzzyQueryBuilder#extended}.
 *
 * See also [Lucene#FuzzyQueryBuilder]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/FuzzyQuery.html}
 * and [Elasticsearch#FuzzyQueryBuilder]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-fuzzy-query.html}.
 *
 * @example
 * new QueryBuilder()
 *   .fuzzy("surname", "einsten")
 *     .fuzziness(2)
 *     .prefixLength(3)
 * .build();
 * // The resulting documents:
 * // contains the fuzzy surname einstn (like Einstein or Einst but not Eisstein or Insten)
 *
 * @extends BaseQueryBuilder
 */
export class FuzzyQueryBuilder extends BaseQueryBuilder {
  /**
   * @param {string} field - the field name of the document
   * @param {string} fuzzy - the fuzzy term
   * @param data
   */
  constructor(field: string, fuzzy: string, data: any = {}) {
    super("fuzzy", data);
    this._data.field = field;
    this._data.value = fuzzy;
  }

  /**
   * Sets the maximal allowed fuzziness.
   * @param {number|string} fuzziness - the edit distance 0, 1, 2 or AUTO
   *
   * AUTO generates an edit distance based on the length of the term:
   * * 0..2 -> must match exactly
   * * 3..5 -> one edit allowed
   * * >5 two edits allowed
   *
   * @return {FuzzyQueryBuilder} - object itself for cascading
   */
  fuzziness(fuzziness: 0 | 1 | 2 | "AUTO") {
    if (fuzziness !== "AUTO" && (fuzziness < 0 || fuzziness > 2)) {
      throw TypeError("Fuzziness must be 0, 1, 2 or AUTO.");
    }
    this._data.fuzziness = fuzziness;
    return this;
  }

  /**
   * Sets the initial word length.
   * @param {number} prefixLength - the positive prefix length
   * @return {FuzzyQueryBuilder}  object itself for cascading
   */
  prefixLength(prefixLength: number) {
    if (prefixLength < 0) {
      throw TypeError("Prefix length must be a positive number.");
    }
    this._data.prefix_length = prefixLength;
    return this;
  }

  /**
   * This flag allows longer document field terms than the actual fuzzy.
   * @param {boolean} extended - flag to enable or disable extended search
   * @return {FuzzyQueryBuilder}
   */
  extended(extended: boolean) {
    this._data.extended = extended;
    return this;
  }
}

export interface FuzzyQuery extends BaseQuery<"fuzzy"> {
  field: string;
  value: string;
  fuzziness?: 0 | 1 | 2 | "AUTO";
  prefix_length?: number;
  extended?: boolean;
}

/**
 * A query which matches documents containing the prefix of a term inside a field.
 *
 * * To enable scoring for wildcard queries, use {@link WildcardQueryBuilder#enableScoring}.
 *
 * See also [Lucene#PrefixQueryBuilder]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/PrefixQuery.html}
 * and [Elasticsearch#MatchQueryBuilder]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-prefix-query.html}
 *
 * @example
 * new QueryBuilder()
 *   .prefix("surname", "alb")
 * .build()
 * // The resulting documents:
 * // contains the term prefix alb as surname
 *
 * @extends BaseQueryBuilder
 */
export class PrefixQueryBuilder extends BaseQueryBuilder {
  /**
   * @param {string} field - the field name of the document
   * @param {string} prefix - the prefix of a term
   * @param data
   */
  constructor(field: string, prefix: string, data: any = {}) {
    super("prefix", data);
    this._data.field = field;
    this._data.value = prefix;
  }

  /**
   * This flag enables scoring for prefix results, similar to {@link TermQueryBuilder}.
   * @param {boolean} enable - flag to enable or disable scoring
   * @return {PrefixQueryBuilder}
   */
  enableScoring(enable: boolean) {
    this._data.enable_scoring = enable;
    return this;
  }
}

export interface PrefixQuery extends BaseQuery<"prefix"> {
  field: string;
  value: string;
  enable_scoring?: boolean;
}

/**
 * A query which matches all documents with a given field.
 *
 * See also [Elasticsearch#ExistsQueryBuilder]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-exists-query.html}.
 *
 * @example
 * new QueryBuilder()
 *   .exists("name")
 * .build()
 * // The resulting documents:
 * // has the field "name"
 *
 * @extends BaseQueryBuilder
 */
export class ExistsQueryBuilder extends BaseQueryBuilder {
  /**
   * @param {string} field - the field name of the document
   * @param data
   */
  constructor(field: string, data: any = {}) {
    super("exists", data);
    this._data.field = field;
  }
}

export interface ExistsQuery extends BaseQuery<"exists"> {
  field: string;
}


/**
 * A query which tokenizes the given query text, performs a query foreach token and combines the results using a boolean
 * operator.
 *
 * Operator      | Description
 * ------------- | -------------
 * or (default) | Finds documents which matches some tokens. The minimum amount of matches can be controlled with [minimumShouldMatch]{@link MatchQueryBuilder#minimumShouldMatch} (default is 1).
 * and | Finds documents which matches all tokens.
 *
 * To enable a [fuzzy query]{@link FuzzyQueryBuilder} for the tokens, use {@link MatchQueryBuilder#fuzziness},
 * {@link MatchQueryBuilder#prefixLength} and {@link MatchQueryBuilder#extended}
 *
 * See also [Lucene#?]{@link ?}
 * and [Elasticsearch#MatchQueryBuilder]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-match-query.html}.
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
 * @extends BaseQueryBuilder
 */
export class MatchQueryBuilder extends BaseQueryBuilder {
  /**
   * @param {string} field - the field name of the document
   * @param {string} query - the query text
   * @param data
   */
  constructor(field: string, query: string, data: any = {}) {
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
   * @return {MatchQueryBuilder} object itself for cascading
   */
  minimumShouldMatch(minShouldMatch: number) {
    if (this._data.operator !== undefined && this._data.operator === "and") {
      throw SyntaxError("Match query with \"and\" operator does not support minimum should match.");
    }
    this._data.minimum_should_match = minShouldMatch;
    return this;
  }

  /**
   * Sets the boolean operator.
   * @param {string} op - the operator ("or" || "and")
   * @return {MatchQueryBuilder} object itself for cascading
   */
  operator(op: string) {
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
   * @param {number|string} fuzziness - the edit distance 0, 1, 2 or AUTO
   *
   * AUTO generates an edit distance based on the length of the term:
   * * 0..2 -> must match exactly
   * * 3..5 -> one edit allowed
   * * >5 two edits allowed
   *
   * @return {MatchQueryBuilder} - object itself for cascading
   */
  fuzziness(fuzziness: 0 | 1 | 2 | "AUTO") {
    if (fuzziness !== "AUTO" && (fuzziness < 0 || fuzziness > 2)) {
      throw TypeError("Fuzziness must be 0, 1, 2 or AUTO.");
    }
    this._data.fuzziness = fuzziness;
    return this;
  }

  /**
   * Sets the starting word length which should not be considered for fuzziness.
   * @param {number} prefixLength - the positive prefix length
   * @return {MatchQueryBuilder} - object itself for cascading
   */
  prefixLength(prefixLength: number) {
    if (prefixLength < 0) {
      throw TypeError("Prefix length must be a positive number.");
    }
    this._data.prefix_length = prefixLength;
    return this;
  }

  /**
   * This flag allows longer document field terms than the actual fuzzy.
   * @param {boolean} extended - flag to enable or disable extended search
   * @return {MatchQueryBuilder}
   */
  extended(extended: boolean) {
    this._data.extended = extended;
    return this;
  }
}

export interface MatchQuery extends BaseQuery<"match"> {
  field: string;
  value: string;
  minimum_should_match?: number;
  operator?: "and" | "or";
  fuzziness?: 0 | 1 | 2 | "AUTO";
  prefix_length?: number;
  extended?: boolean;
}

/**
 * A query that matches all documents and giving them a constant score equal to the query boost.
 *
 * Typically used inside a must clause of a {@link BoolQueryBuilder} to subsequently reject non matching documents with the not
 * clause.
 *
 * See also [Lucene#MatchAllDocsQuery]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/MatchAllDocsQuery.html}
 * and [Elasticsearch#MatchAllQueryBuilder]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-match-all-query.html}.
 *
 * @example
 * new QueryBuilder()
 *   .matchAll()
 *     .boost(2.5)
 * .build()
 * // The resulting documents:
 * // all documents and giving a score of 2.5
 *
 * @extends BaseQueryBuilder
 */
export class MatchAllQueryBuilder extends BaseQueryBuilder {
  constructor(data: any = {}) {
    super("match_all", data);
  }
}

export interface MatchQueryAll extends BaseQuery<"match_all"> {
}

/**
 * A query that wraps sub queries and returns a constant score equal to the query boost for every document in the filter.
 *
 * See also [Lucene#BooleanQuery]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/ConstantScoreQuery.html}
 * and [Elasticsearch#ConstantScoreQueryBuilder]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-constant-score-query.html}.
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
 * @extends BaseQueryBuilder
 */
export class ConstantScoreQueryBuilder extends BaseQueryBuilder {
  constructor(data: any = {}) {
    super("constant_score", data);
  }

  /**
   * Starts an array of queries. Use endFilter() to finish the array.
   * @return {ArrayQueryBuilder} array query for holding sub queries
   */
  beginFilter(): ArrayQueryBuilder & { endFilter(): ConstantScoreQueryBuilder } {
    this._data.filter = {};
    return new ArrayQueryBuilder("endFilter", () => {
      return this;
    }, this._data.filter) as any;
  }
}

export interface ConstantScoreQuery extends BaseQuery<"constant_score"> {
  filter: ArrayQuery;
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
 * should  | Finds documents which matches some sub queries. The minimum amount of matches can be controlled with [minimumShouldMatch]{@link BoolQueryBuilder#minimumShouldMatch} (default is 1).
 * not  | Documents which match any sub query will be ignored.
 *
 * A sub query can be any other query type and also the bool query itself.
 *
 * See also [Lucene#BooleanQuery]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/BooleanQuery.html}
 * and [Elasticsearch#BoolQueryBuilder]{@link https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-bool-query.html}.
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
 * @extends BaseQueryBuilder
 */
export class BoolQueryBuilder extends BaseQueryBuilder {
  constructor(data: any = {}) {
    super("bool", data);
  }

  /**
   * Starts an array of queries for must clause. Use endMust() to finish the array.
   * @return {ArrayQueryBuilder} array query for holding sub queries
   */
  beginMust(): ArrayQueryBuilder & { endMust(): BoolQueryBuilder } {
    this._data.must = {};
    return new ArrayQueryBuilder("endMust", () => {
      return this;
    }, this._data.must) as any;
  }

  /**
   * Starts an array of queries for filter clause. Use endFilter() to finish the array.
   * @return {ArrayQueryBuilder} array query for holding sub queries
   */
  beginFilter(): ArrayQueryBuilder & { endFilter(): BoolQueryBuilder } {
    this._data.filter = {};
    return new ArrayQueryBuilder("endFilter", () => {
      return this;
    }, this._data.filter) as any;
  }

  /**
   * Starts an array of queries for should clause. Use endShould() to finish the array.
   * @return {ArrayQueryBuilder} array query for holding sub queries
   */
  beginShould(): ArrayQueryBuilder & { endShould(): BoolQueryBuilder } {
    this._data.should = {};
    return new ArrayQueryBuilder("endShould", () => {
      return this;
    }, this._data.should) as any;
  }

  /**
   * Starts an array of queries for not clause. Use endNot() to finish the array.
   * @return {ArrayQueryBuilder} array query for holding sub queries
   */
  beginNot(): ArrayQueryBuilder & { endNot(): BoolQueryBuilder } {
    this._data.not = {};
    return new ArrayQueryBuilder("endNot", () => {
      return this;
    }, this._data.not) as any;
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
   * @return {BoolQueryBuilder} object itself for cascading
   */
  minimumShouldMatch(minShouldMatch: number) {
    this._data.minimum_should_match = minShouldMatch;
    return this;
  }
}

export interface BoolQuery extends BaseQuery<"bool"> {
  must?: ArrayQuery;
  filter?: ArrayQuery;
  should?: ArrayQuery;
  not?: ArrayQuery;
  minimum_should_match?: number;
}


/**
 * A query which holds all sub queries like an array.
 */
export class ArrayQueryBuilder extends BaseQueryBuilder {
  private _callbackName: string;
  private _prepare: (queryType: { new(...args: any[]): any }, ...args: any[]) => any;

  constructor(callbackName: string, callback: Function, data: any = {}) {
    super("array", data);
    this._data.values = [];
    this._callbackName = callbackName;
    this[callbackName] = callback;

    this._prepare = (queryType: any, ...args: any[]) => {
      const data = {};
      const query = new queryType(...args, data);
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
    return this._prepare(BoolQueryBuilder);
  }

  constantScore() {
    return this._prepare(ConstantScoreQueryBuilder);
  }

  term(field: string, term: string) {
    return this._prepare(TermQueryBuilder, field, term);
  }

  terms(field: string, terms: Array<string>) {
    return this._prepare(TermsQueryBuilder, field, terms);
  }

  wildcard(field: string, wildcard: string) {
    return this._prepare(WildcardQueryBuilder, field, wildcard);
  }

  fuzzy(field: string, fuzzy: string) {
    return this._prepare(FuzzyQueryBuilder, field, fuzzy);
  }

  match(field: string, query: string) {
    return this._prepare(MatchQueryBuilder, field, query);
  }

  matchAll() {
    return this._prepare(MatchAllQueryBuilder);
  }

  prefix(field: string, prefix: string) {
    return this._prepare(PrefixQueryBuilder, field, prefix);
  }

  exists(field: string) {
    return this._prepare(ExistsQueryBuilder, field);
  }
}

export interface ArrayQuery extends BaseQuery<"array"> {
  values: QueryTypes[];
}

/**
 * This query builder is the root of each query search.
 * The query contains a sub query and parameters for setup scoring and search options.
 *
 * Possible sub query types are:
 * {@link TermQueryBuilder}, {@link TermsQueryBuilder}, {@link FuzzyQueryBuilder}, {@link WildcardQueryBuilder},
 * {@link MatchQueryBuilder}, {@link MatchAllQueryBuilder}, {@link PrefixQueryBuilder},  {@link BoolQueryBuilder},
 * {@link ConstantScoreQueryBuilder}, {@link ExistsQueryBuilder}
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
  private _data: any;

  constructor() {
    this._data = {query: {}};
  }

  /**
   * The query performs a final scoring over all scored sub queries.
   * @param {boolean} enable - flag to enable or disable final scoring
   * @return {this}
   */
  enableFinalScoring(enable: boolean) {
    this._data.final_scoring = enable;
    return this;
  }

  /**
   * Adds an explanation of the scoring of each document for all matched terms.
   * @param {boolean} enable -flag to enable or disable explanation
   * @returns {this}
   */
  explain(enable: boolean) {
    this._data.explain = enable;
    return this;
  }

  /**
   * Configures the [Okapi BM25]{@link https://en.wikipedia.org/wiki/Okapi_BM25} as scoring model.
   *
   * See also [Lucene#MatchAllDocsQuery]{@link https://lucene.apache.org/core/6_4_0/core/org/apache/lucene/search/similarities/BM25Similarity.html}
   * and [Elasticsearch#BM25]{@link https://www.elastic.co/guide/en/elasticsearch/guide/current/pluggable-similarites.html#bm25}.
   *
   * @param {number} [k1=1.2] - controls how quickly an increase in term frequency results in term-frequency saturation.
   *                            Lower values result in quicker saturation, and higher values in slower saturation
   * @param {number} [b=0.75] - controls how much effect field-length normalization should have.
   *                            A value of 0.0 disables normalization completely, and a value of 1.0 normalizes fully
   * @return {this}
   */
  BM25Similarity(k1: number = 1.2, b: number = 0.75) {
    if (k1 < 0) {
      throw TypeError("BM25s k1 must be a positive number.");
    }
    if (b < 0 || b > 1) {
      throw TypeError("BM25s b must be a number between 0 and 1 inclusive.");
    }

    this._data.bm25 = {
      k1,
      b
    };
    return this;
  }

  bool(): BoolQueryBuilder {
    return this._prepare(BoolQueryBuilder);
  }

  constantScore(): ConstantScoreQueryBuilder {
    return this._prepare(ConstantScoreQueryBuilder);
  }

  term(field: string, term: string): TermQueryBuilder {
    return this._prepare(TermQueryBuilder, field, term);
  }

  terms(field: string, terms: Array<string>): TermsQueryBuilder {
    return this._prepare(TermsQueryBuilder, field, terms);
  }

  wildcard(field: string, wildcard: string): WildcardQueryBuilder {
    return this._prepare(WildcardQueryBuilder, field, wildcard);
  }

  fuzzy(field: string, fuzzy: string): FuzzyQueryBuilder {
    return this._prepare(FuzzyQueryBuilder, field, fuzzy);
  }

  match(field: string, query: string): MatchQueryBuilder {
    return this._prepare(MatchQueryBuilder, field, query);
  }

  matchAll(): MatchAllQueryBuilder {
    return this._prepare(MatchAllQueryBuilder);
  }

  prefix(field: string, prefix: string): PrefixQueryBuilder {
    return this._prepare(PrefixQueryBuilder, field, prefix);
  }

  exists(field: string): ExistsQueryBuilder {
    return this._prepare(ExistsQueryBuilder, field);
  }

  private _prepare<T extends BaseQueryBuilder>(queryType: { new(...args: any[]): T }, ...args: any[]): T {
    const query = new queryType(...args, this._data.query);
    query.build = () => {
      return this._data;
    };
    return query;
  }
}

export type QueryTypes = BoolQuery | ConstantScoreQuery | TermQuery | TermsQuery | WildcardQuery | FuzzyQuery
  | MatchQuery | MatchQueryAll | PrefixQuery | ExistsQuery;

export interface Query {
  query: QueryTypes;
  final_scoring?: boolean;
  explain?: boolean;
  bm25?: {
    k1: number;
    b: number;
  };
}
