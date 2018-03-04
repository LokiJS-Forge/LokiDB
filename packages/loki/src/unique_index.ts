import {Dict, Doc} from "../../common/types";

export class UniqueIndex<T extends object = object> {
  // The property field to index.
  private _field: keyof T;
  // The map with the indices rows of unique property fields.
  private _keyMap: Dict<number>;

  /**
   * Constructs an unique index object.
   * @param {number|string} propertyField - the property field to index
   */
  constructor(propertyField: keyof T) {
    this._field = propertyField;
    this._keyMap = {};
  }

  /**
   * Sets a document's unique index.
   * @param {Doc} doc - the document
   * @param {number} row - the data row of the document
   */
  public set(doc: Doc<T>, row: number): void {
    const fieldValue = doc[this._field] as any as number;
    if (fieldValue !== null && fieldValue !== undefined) {
      if (this._keyMap[fieldValue] !== undefined) {
        throw new Error("Duplicate key for property " + this._field + ": " + fieldValue);
      } else {
        this._keyMap[fieldValue] = row;
      }
    }
  }

  /**
   * Returns the data row of an unique index.
   * @param {number|string} index - the index
   * @returns {number | string} - the row
   */
  public get(index: keyof T): number {
    return this._keyMap[index];
  }

  /**
   * Updates a document's unique index.
   * @param  {Object} doc - the document
   * @param  {number} row - the data row of the document
   */
  public update(doc: Doc<T>, row: number): void {
    // Find and remove current keyMap for row.
    const uniqueNames = Object.keys(this._keyMap);
    for (let i = 0; i < uniqueNames.length; i++) {
      if (row === this._keyMap[uniqueNames[i]]) {
        delete this._keyMap[uniqueNames[i]];
        break;
      }
    }
    this.set(doc, row);
  }

  /**
   * Removes an unique index.
   * @param {number|string} index - the unique index
   */
  public remove(index: number | string): void {
    if (this._keyMap[index] !== undefined) {
      delete this._keyMap[index];
    } else {
      throw new Error("Key is not in unique index: " + this._field);
    }
  }

  /**
   * Clears all unique indexes.
   */
  public clear(): void {
    this._keyMap = {};
  }
}
