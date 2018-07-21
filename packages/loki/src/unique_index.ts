import { Dict, Doc } from "../../common/types";

export class UniqueIndex<T extends object = object> {
  // The property field to index.
  private _field: keyof T;
  // maps value to loki
  private _lokiMap: Dict<number>;
  // maps loki to value
  private _valMap: Dict<any>;

  /**
   * Constructs an unique index object.
   * @param {number|string} propertyField - the property field to index
   */
  constructor(propertyField: keyof T) {
    this._field = propertyField;
    this._lokiMap = {};
    this._valMap = {};
  }

  /**
   * Sets a document's unique index.
   * @param {Doc} doc - the document
   */
  public set(doc: Doc<T>): void {
    const fieldValue = doc[this._field] as any as string;

    // unique index should not include null/undefined values
    if (fieldValue !== null && fieldValue !== undefined) {
      if (fieldValue in this._lokiMap) {
        throw new Error("Duplicate key for property " + this._field + ": " + fieldValue);
      }

      if (doc.$loki in this._valMap) {
        throw new Error("Duplicate key for property $loki : " + doc.$loki);
      }

      this._lokiMap[fieldValue] = doc.$loki;
      this._valMap[doc.$loki] = fieldValue;
    }
  }

  /**
   * Returns the $loki id of an unique value.
   * @param {number|string} value - the index
   * @returns {number} - the $loki id of a match
   */
  public get(value: any): number {
    return this._lokiMap[value];
  }

  /**
   * Updates a document's unique index.
   * @param  {Object} doc - the document
   */
  public update(doc: Doc<T>): void {
    let fieldValue = doc[this._field] as any as string;
    if (fieldValue in this._lokiMap && this._lokiMap[fieldValue] !== doc.$loki) {
      throw new Error("Duplicate key for property " + this._field + ": " + fieldValue);
    }
    this.remove(doc.$loki);
    this.set(doc);
  }

  /**
   * Removes an unique index.
   * @param {number|string} lokiId - the $loki id of doc to remove
   */
  public remove(lokiId: number): void {
    if (!(lokiId in this._valMap)) {
      throw new Error("Key is not in unique index: " + this._field);
    }

    let oldValue = this._valMap[lokiId];

    delete this._lokiMap[oldValue];
    delete this._valMap[lokiId];
  }

  /**
   * Clears the unique index.
   */
  public clear(): void {
    this._lokiMap = {};
    this._valMap = {};
  }
}
