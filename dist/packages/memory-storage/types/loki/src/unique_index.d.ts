import { Doc } from "../../common/types";
export declare class UniqueIndex<E extends object = object> {
    private _field;
    private _keyMap;
    /**
     * Constructs an unique index object.
     * @param {number|string} propertyField - the property field to index
     */
    constructor(propertyField: keyof E);
    /**
     * Sets a document's unique index.
     * @param {Doc} doc - the document
     * @param {number} row - the data row of the document
     */
    set(doc: Doc<E>, row: number): void;
    /**
     * Returns the data row of an unique index.
     * @param {number|string} index - the index
     * @returns {number | string} - the row
     */
    get(index: keyof E): number;
    /**
     * Updates a document's unique index.
     * @param  {Object} doc - the document
     * @param  {number} row - the data row of the document
     */
    update(doc: Doc<E>, row: number): void;
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
