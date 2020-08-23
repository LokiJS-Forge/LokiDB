import { Analyzer } from "./analyzer/analyzer";
/**
 * Converts a string into an array of code points.
 * @param str - the string
 * @returns {number[]} to code points
 * @hidden
 */
export declare function toCodePoints(str: string): number[];
/**
 * Inverted index class handles featured text search for specific document fields.
 * @hidden
 */
export declare class InvertedIndex {
    analyzer: Analyzer;
    docCount: number;
    docStore: Map<InvertedIndex.DocumentIndex, InvertedIndex.DocStore>;
    totalFieldLength: number;
    root: InvertedIndex.Index;
    private _store;
    private _optimizeChanges;
    /**
     * @param {boolean} [options.store=true] - inverted index will be stored at serialization rather than rebuilt on load
     * @param {boolean} [options.optimizeChanges=true] - flag to store additional metadata inside the index for better
     *  performance if an existing field is updated or removed
     * @param {Analyzer} [options.analyzer=] - the analyzer of this inverted index
     */
    constructor(options?: InvertedIndex.FieldOptions);
    /**
     * Adds defined fields of a document to the inverted index.
     * @param {string} field - the field to add
     * @param {number} docId - the doc id of the field
     */
    insert(field: string, docId: InvertedIndex.DocumentIndex): void;
    /**
     * Removes all relevant terms of a document from the inverted index.
     * @param {number} docId - the document.
     */
    remove(docId: InvertedIndex.DocumentIndex): void;
    /**
     * Gets the term index of a term.
     * @param {string} term - the term
     * @param {object} root - the term index to start from
     * @param {number} start - the position of the term string to start from
     * @return {object} - The term index or null if the term is not in the term tree.
     */
    static getTermIndex(term: number[], root: InvertedIndex.Index, start?: number): InvertedIndex.Index;
    /**
     * Extends a term index to all available term leafs.
     * @param {object} idx - the term index to start from
     * @param {number[]} [term=[]] - the current term
     * @param {Array} termIndices - all extended indices with their term
     * @returns {Array} - Array with term indices and extension
     */
    static extendTermIndex(idx: InvertedIndex.Index, term?: number[], termIndices?: InvertedIndex.IndexTerm[]): InvertedIndex.IndexTerm[];
    /**
     * Serialize the inverted index.
     * @returns {{docStore: *, _fields: *, index: *}}
     */
    toJSON(): InvertedIndex.Serialization;
    /**
     * Deserialize the inverted index.
     * @param {{docStore: *, _fields: *, index: *}} serialized - The serialized inverted index.
     * @param {Analyzer} analyzer[undefined] - an analyzer
     */
    static fromJSONObject(serialized: InvertedIndex.Serialization, analyzer?: Analyzer): InvertedIndex;
    private static _serializeIndex(idx);
    private static _deserializeIndex(serialized);
    /**
     * Set parent of to each index and regenerate the indexRef.
     * @param {Index} index - the index
     * @param {Index} parent - the parent
     */
    private _regenerate(index, parent);
    /**
     * Iterate over the whole inverted index and remove the document.
     * Delete branch if not needed anymore.
     * Function is needed if index is used without optimization.
     * @param {Index} idx - the index
     * @param {number} docId - the doc id
     * @returns {boolean} true if index is empty
     */
    private _remove(idx, docId);
}
export declare namespace InvertedIndex {
    interface FieldOptions {
        store?: boolean;
        optimizeChanges?: boolean;
        analyzer?: Analyzer;
    }
    type Index = Map<number, any> & {
        dc?: Map<DocumentIndex, number>;
        df?: number;
        pa?: Index;
    };
    type IndexTerm = {
        index: Index;
        term: number[];
    };
    interface SerializedIndex {
        d?: {
            df: number;
            dc: [DocumentIndex, number][];
        };
        k?: number[];
        v?: SerializedIndex[];
    }
    type Serialization = SpareSerialization | FullSerialization;
    type SpareSerialization = {
        _store: false;
        _optimizeChanges: boolean;
    };
    type FullSerialization = {
        _store: true;
        _optimizeChanges: boolean;
        docCount: number;
        docStore: [DocumentIndex, DocStore][];
        totalFieldLength: number;
        root: SerializedIndex;
    };
    interface DocStore {
        fieldLength?: number;
        indexRef?: Index[];
    }
    type DocumentIndex = number | string;
}
