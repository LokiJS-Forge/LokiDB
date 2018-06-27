/**
 * Base query to enable boost to a query type.
 */
export interface BaseQuery<Type> {
    type: Type;
    boost?: number;
}
/**
 * A query which finds documents where a document field contains a term.
 */
export interface TermQuery extends BaseQuery<"term"> {
    field: string;
    value: string;
}
/**
 * A query which finds documents where a document field contains any of the terms.
 */
export interface TermsQuery extends BaseQuery<"terms"> {
    field: string;
    value: string[];
}
/**
 * A query which finds documents where the wildcard term can be applied at an existing document field term.
 */
export interface WildcardQuery extends BaseQuery<"wildcard"> {
    field: string;
    value: string;
    enable_scoring?: boolean;
}
/**
 * A query which finds documents where the fuzzy term can be transformed into an existing document field term within a
 * given edit distance.
 */
export interface FuzzyQuery extends BaseQuery<"fuzzy"> {
    field: string;
    value: string;
    fuzziness?: 0 | 1 | 2 | "AUTO";
    prefix_length?: number;
    extended?: boolean;
}
/**
 * A query which matches documents containing the prefix of a term inside a field.
 */
export interface PrefixQuery extends BaseQuery<"prefix"> {
    field: string;
    value: string;
    enable_scoring?: boolean;
}
/**
 * A query which matches all documents with a given field.
 */
export interface ExistsQuery extends BaseQuery<"exists"> {
    field: string;
}
/**
 * A query which tokenizes the given text into tokens and performs a sub query for each token. The results are combined
 * using a boolean operator.
 */
export interface MatchQuery extends BaseQuery<"match"> {
    field: string;
    value: string;
    minimum_should_match?: number | string;
    operator?: "and" | "or";
    fuzziness?: 0 | 1 | 2 | "AUTO";
    prefix_length?: number;
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
    must?: QueryTypes[];
    filter?: QueryTypes[];
    should?: QueryTypes[];
    not?: QueryTypes[];
    minimum_should_match?: number | string;
}
/**
 * Union type of possible query types.
 */
export declare type QueryTypes = BoolQuery | ConstantScoreQuery | TermQuery | TermsQuery | WildcardQuery | FuzzyQuery | MatchQuery | MatchQueryAll | PrefixQuery | ExistsQuery;
/**
 * The main query with the actually full-text search query and the scoring parameters.
 */
export interface Query {
    query: QueryTypes;
    calculate_scoring?: boolean;
    explain?: boolean;
    bm25?: {
        k1: number;
        b: number;
    };
}
