import { InvertedIndex } from "./inverted_index";
import { Tokenizer } from "./tokenizer";
import { ANY } from "../../common/types";
export declare class FullTextSearch {
    private _id;
    private _docs;
    private _idxSearcher;
    private _invIdxs;
    /**
     * Registers the full text search as plugin.
     */
    static register(): void;
    /**
     * Initialize the full text search for the given fields.
     * @param {object[]} fields - the field options
     * @param {string} fields.name - the name of the field
     * @param {boolean=true} fields.store - flag to indicate if the full text search should be stored on serialization or
     *  rebuild on deserialization
     * @param {boolean=true} fields.optimizeChanges - flag to indicate if deleting/updating a document should be optimized
     *  (requires more memory but performs better)
     * @param {Tokenizer=Tokenizer} fields.tokenizer - the tokenizer of the field
     * @param {string=$loki} id - the property name of the document index
     */
    constructor(fields?: FullTextSearch.FieldOptions[], id?: string);
    addDocument(doc: ANY, id?: number): void;
    removeDocument(doc: ANY, id?: number): void;
    updateDocument(doc: ANY, id?: number): void;
    clear(): void;
    search(query: ANY): {};
    toJSON(): {};
    static fromJSONObject(serialized: ANY, tokenizers?: Tokenizer[]): FullTextSearch;
    setDirty(): void;
}
export declare namespace FullTextSearch {
    interface FieldOptions extends InvertedIndex.FieldOptions {
        name: string;
    }
}
export default FullTextSearch;
