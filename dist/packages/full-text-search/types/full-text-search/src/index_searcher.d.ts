import { InvertedIndex } from "./inverted_index";
import { Dict } from "../../common/types";
export declare type ANY = any;
/**
 * @hidden
 */
export declare class IndexSearcher {
    private _invIdxs;
    private _docs;
    private _scorer;
    /**
     * @param {object} invIdxs
     */
    constructor(invIdxs: Dict<InvertedIndex>, docs: ANY);
    search(query: ANY): {};
    setDirty(): void;
    private _recursive(query, doScoring);
    private _getUnique(values, doScoring, docResults);
    private _getAll(values, doScoring);
}
