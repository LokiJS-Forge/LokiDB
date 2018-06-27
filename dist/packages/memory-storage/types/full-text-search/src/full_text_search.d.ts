import { InvertedIndex } from "./inverted_index";
import { Dict } from "../../common/types";
import { Query } from "./query_types";
import { Scorer } from "./scorer";
import { Analyzer } from "./analyzer/analyzer";
export declare class FullTextSearch {
    private _id;
    private _docs;
    private _idxSearcher;
    private _invIdxs;
    /**
     * Registers the full-text search as plugin.
     */
    static register(): void;
    /**
     * Initialize the full-text search for the given fields.
     * @param {object[]} fieldOptions - the field options
     * @param {string} fieldOptions.field - the name of the property field
     * @param {boolean=true} fieldOptions.store - flag to indicate if the full-text search should be stored on serialization or
     *  rebuild on deserialization
     * @param {boolean=true} fieldOptions.optimizeChanges - flag to optimize updating and deleting of documents
     *    (requires more memory but performs faster)
     * @param {Analyzer} fieldOptions.analyzer - an analyzer for the field
     * @param {string} [id] - the property name of the document index
     */
    constructor(fieldOptions?: FullTextSearch.FieldOptions[], id?: string);
    addDocument(doc: object, id?: InvertedIndex.DocumentIndex): void;
    removeDocument(doc: object, id?: InvertedIndex.DocumentIndex): void;
    updateDocument(doc: object, id?: InvertedIndex.DocumentIndex): void;
    clear(): void;
    search(query: Query): Scorer.ScoreResults;
    toJSON(): FullTextSearch.Serialization;
    static fromJSONObject(serialized: FullTextSearch.Serialization, analyzers?: Dict<Analyzer>): FullTextSearch;
}
export declare namespace FullTextSearch {
    interface FieldOptions extends InvertedIndex.FieldOptions {
        field: string;
    }
    interface Serialization {
        id: string;
        ii: Dict<InvertedIndex.Serialization>;
    }
}
