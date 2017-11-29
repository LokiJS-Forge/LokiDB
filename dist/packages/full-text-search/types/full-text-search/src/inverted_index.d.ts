import { Tokenizer } from "./tokenizer";
export declare type ANY = any;
/**
 * Converts a string into an array of code points.
 * @param str - the string
 * @returns {number[]} to code points
 * @hidden
 */
export declare function toCodePoints(str: string): number[];
export declare type IndexTerm = [InvertedIndex.Index, number[]];
/**
 * Inverted index class handles featured text search for specific document fields.
 * @hidden
 */
export declare class InvertedIndex {
    private _store;
    private _optimizeChanges;
    private _tokenizer;
    private _docCount;
    private _docStore;
    private _totalFieldLength;
    private _root;
    /**
     * @param {boolean} [options.store=true] - inverted index will be stored at serialization rather than rebuilt on load.
     * @param {boolean} optimizeChanges
     * @param {Tokenizer} tokenizer
     */
    constructor(options?: InvertedIndex.FieldOptions);
    store: boolean;
    readonly tokenizer: Tokenizer;
    readonly documentCount: number;
    readonly documentStore: Map<number, InvertedIndex.DocStore>;
    readonly totalFieldLength: number;
    readonly root: InvertedIndex.Index;
    /**
     * Adds defined fields of a document to the inverted index.
     * @param {string} field - the field to add
     * @param {number} docId - the doc id of the field
     */
    insert(field: string, docId: number): void;
    /**
     * Removes all relevant terms of a document from the inverted index.
     * @param {number} docId - the document.
     */
    remove(docId: number): void;
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
     * @param {object} root - the term index to start from
     * @returns {Array} - Array with term indices and extension
     */
    static extendTermIndex(root: InvertedIndex.Index): IndexTerm[];
    private static serializeIndex(index);
    private static deserializeIndex(ar);
    /**
     * Serialize the inverted index.
     * @returns {{docStore: *, _fields: *, index: *}}
     */
    toJSON(): {
        _store: boolean;
        _optimizeChanges: boolean;
        _tokenizer: Tokenizer;
        _docCount: number;
        _docStore: [number, InvertedIndex.DocStore][];
        _totalFieldLength: number;
        _root: any[];
    } | {
        _store: boolean;
        _optimizeChanges: boolean;
        _tokenizer: Tokenizer;
    };
    /**
     * Deserialize the inverted index.
     * @param {{docStore: *, _fields: *, index: *}} serialized - The serialized inverted index.
     * @param {Object.<string, function>|Tokenizer} funcTok[undefined] - the depending functions with labels
     *  or an equivalent tokenizer
     */
    static fromJSONObject(serialized: InvertedIndex.Serialization, funcTok?: ANY): InvertedIndex;
}
export declare namespace InvertedIndex {
    interface FieldOptions {
        store?: boolean;
        optimizeChanges?: boolean;
        tokenizer?: Tokenizer;
    }
    type Index = Map<number, any> & {
        dc?: Map<number, number>;
        df?: number;
        pa?: Index;
    };
    interface Serialization {
        _store: boolean;
        _optimizeChanges: boolean;
        _tokenizer: Tokenizer.Serialization;
        _docCount?: number;
        _docStore?: Map<number, DocStore>;
        _totalFieldLength?: number;
        _root?: Index;
    }
    interface DocStore {
        fieldLength?: number;
        indexRef?: Index[];
    }
}
