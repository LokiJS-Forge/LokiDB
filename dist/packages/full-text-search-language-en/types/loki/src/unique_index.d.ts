import { Doc } from "../../common/types";
export declare class UniqueIndex {
    private _field;
    private _keyMap;
    /**
     * Constructs an unique index object.
     * @param {number|string} propertyField - the property field to index
     */
    constructor(propertyField: number | string);
    /**
     * Sets a document's unique index.
     * @param {Doc} doc - the document
     * @param {number} row - the data row of the document
     */
    set(doc: Doc, row: number): void;
    /**
     * Returns the data row of an unique index.
     * @param {number|string} index - the index
     * @returns {number | string} - the row
     */
    get(index: number | string): number;
    /**
     * Updates a document's unique index.
     * @param  {Object} doc - the document
     * @param  {number} row - the data row of the document
     */
    update(doc: Doc, row: number): void;
    /**
     * Removes an unique index.
     * @param {number|string} index - the unique index
     */
    remove(index: number | string): void;
    /**
     * Clears all unique indexes.
     */
    clear(): void;
}
