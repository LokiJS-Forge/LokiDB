/**
 * Base query to enable boost to a query type.
 */
export interface BaseQuery<Type> {
  /// The query type.
  type: Type;
  /// The query boost.
  boost?: number;
}

/**
 * A query which finds documents where a document field contains a term.
 */
export interface TermQuery extends BaseQuery<"term"> {
  /// The field name.
  field: string;
  /// The term.
  value: string;
}

/**
 * A query which finds documents where a document field contains any of the terms.
 */
export interface TermsQuery extends BaseQuery<"terms"> {
  /// The field name.
  field: string;
  /// The terms.
  value: string[];
}

/**
 * A query which finds documents where the wildcard term can be applied at an existing document field term.
 */
export interface WildcardQuery extends BaseQuery<"wildcard"> {
  /// The field name.
  field: string;
  /// The wildcard term.
  value: string;
  /// Flag to enable scoring for wildcard queries.
  enable_scoring?: boolean;
}

/**
 * A query which finds documents where the fuzzy term can be transformed into an existing document field term within a
 * given edit distance.
 */
export interface FuzzyQuery extends BaseQuery<"fuzzy"> {
  /// The field name.
  field: string;
  /// The fuzzy term.
  value: string;
  /// The the maximal allowed fuzziness.
  fuzziness?: 0 | 1 | 2 | "AUTO";
  /// The initial word length.
  prefix_length?: number;
  /// Flag to match longer terms than the actual fuzzy term.
  extended?: boolean;
}

/**
 * A query which matches documents containing the prefix of a term inside a field.
 */
export interface PrefixQuery extends BaseQuery<"prefix"> {
  /// The field name.
  field: string;
  /// The prefix term.
  value: string;
  /// Flag to enable scoring for prefix queries.
  enable_scoring?: boolean;
}

/**
 * A query which matches all documents with a given field.
 */
export interface ExistsQuery extends BaseQuery<"exists"> {
  /// The field name.
  field: string;
}

/**
 * A query which tokenizes the given text into tokens and performs a sub query for each token. The results are combined
 * using a boolean operator.
 */
export interface MatchQuery extends BaseQuery<"match"> {
  /// The field name.
  field: string;
  /// The text.
  value: string;
  /// The amount of minimum matching sub queries.
  minimum_should_match?: number | string;
  /// The boolean operator.
  operator?: "and" | "or";
  /// The the maximal allowed fuzziness.
  fuzziness?: 0 | 1 | 2 | "AUTO";
  /// The initial word length.
  prefix_length?: number;
  /// Flag to match longer terms than the actual fuzzy term.
  extended?: boolean;
}

/**
 * A query that matches all documents and giving them a constant score equal to the query boost.
*/
export interface MatchQueryAll extends BaseQuery<"match_all"> {
}

/**
 * A query that wraps sub queries and returns a constant score equal to the query boost for every document in the filter.
 */
export interface ConstantScoreQuery extends BaseQuery<"constant_score"> {
  filter: QueryTypes[];
}

/**
 * A query that matches documents matching boolean combinations of sub queries.
 */
export interface BoolQuery extends BaseQuery<"bool"> {
  // The array of must queries.
  must?: QueryTypes[];
  // The array of filter queries.
  filter?: QueryTypes[];
  // The array of should queries.
  should?: QueryTypes[];
  // The array of not queries.
  not?: QueryTypes[];
  /// The amount of minimum matching sub queries.
  minimum_should_match?: number | string;
}

/**
 * Union type of possible query types.
 */
export type QueryTypes = BoolQuery | ConstantScoreQuery | TermQuery | TermsQuery | WildcardQuery | FuzzyQuery
  | MatchQuery | MatchQueryAll | PrefixQuery | ExistsQuery;

/**
 * The main query with the actually full-text search query and the scoring parameters.
 */
export interface Query {
  query: QueryTypes;
  /// Flag to enable scoring calculation.
  calculate_scoring?: boolean;
  /// Flag to enable scoring explanation.
  explain?: boolean;
  /// BM25 parameter.
  bm25?: {
    /// The k1 parameter.
    k1: number;
    /// The b parameter.
    b: number;
  };
}
