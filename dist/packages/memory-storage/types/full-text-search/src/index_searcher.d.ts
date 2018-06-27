import { Scorer } from "./scorer";
import { InvertedIndex } from "./inverted_index";
import { Query } from "./query_types";
import { Dict } from "../../common/types";
/**
 * @hidden
 */
export declare class IndexSearcher {
    private _invIdxs;
    private _docs;
    private _scorer;
    /**
     * Constructs an index searcher.
     * @param {Dict<InvertedIndex>} invIdxs - the inverted indexes
     * @param {Set<number>} docs - the ids of the documents
     */
    constructor(invIdxs: Dict<InvertedIndex>, docs: Set<InvertedIndex.DocumentIndex>);
    search(query: Query): Scorer.ScoreResults;
    setDirty(): void;
    private _recursive(query, doScoring);
    private _getUnique(queries, doScoring, queryResults);
    private _getAll(queries, doScoring, queryResults?);
}
