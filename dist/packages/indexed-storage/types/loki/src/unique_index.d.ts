export declare class UniqueIndex {
    private _field;
    private _lokiMap;
    private _valMap;
    /**
     * Constructs an unique index object.
     * @param {string} propertyField - the property field to index
     */
    constructor(propertyField: string);
    /**
     * Sets a document's unique index.
     * @param {number} id loki id to associate with value
     * @param {*} value  value to associate with id
     */
    set(id: number, value: any): void;
    /**
     * Returns the $loki id of an unique value.
     * @param {*} value the value to retrieve a loki id match for
     */
    get(value: any): number;
    /**
     * Updates a document's unique index.
     * @param {number} id (loki) id of document to update the value to
     * @param {*} value value to associate with loki id
     */
    update(id: number, value: any): void;
    /**
     * Removes an unique index.
     * @param {number} id (loki) id to remove from index
     */
    remove(id: number): void;
    /**
     * Clears the unique index.
     */
    clear(): void;
}
