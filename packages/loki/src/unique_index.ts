import { Dict } from "../../common/types";

export class UniqueIndex {
  // The property field to index.
  private _field: string;
  // maps value to loki
  private _lokiMap: Dict<number>;
  // maps loki to value - turns this into birectional map enforcing 1-1
  // while this is optional and doubles memory overhead, it will improve maintenance costs
  private _valMap: Dict<any>;

  /**
   * Constructs an unique index object.
   * @param {string} propertyField - the property field to index
   */
  constructor(propertyField: string) {
    this._field = propertyField;
    this._lokiMap = {};
    this._valMap = {};
  }

  /**
   * Sets a document's unique index.
   * @param {number} id loki id to associate with value
   * @param {*} value  value to associate with id
   */
  public set(id: number, value: any): void {
    // unique index should not include null/undefined values
    if (value !== null && value !== undefined) {
      if (value in this._lokiMap) {
        throw new Error("Duplicate key for property " + this._field + ": " + value);
      }

      if (id in this._valMap) {
        throw new Error("Duplicate key for property $loki : " + id);
      }

      this._lokiMap[value] = id;
      this._valMap[id] = value;
    }
  }

  /**
   * Returns the $loki id of an unique value.
   * @param {*} value the value to retrieve a loki id match for
   */
  public get(value: any): number {
    return this._lokiMap[value];
  }

  /**
   * Updates a document's unique index.
   * @param {number} id (loki) id of document to update the value to
   * @param {*} value value to associate with loki id
   */
  public update(id: number, value: any): void {
    if (value in this._lokiMap && this._lokiMap[value] !== id) {
      throw new Error("Duplicate key for property " + this._field + ": " + value);
    }
    this.remove(id);
    this.set(id, value);
  }

  /**
   * Removes an unique index.
   * @param {number} id (loki) id to remove from index
   */
  public remove(id: number): void {
    if (!(id in this._valMap)) {
      throw new Error("Key is not in unique index: " + this._field);
    }

    let oldValue = this._valMap[id];

    delete this._lokiMap[oldValue];
    delete this._valMap[id];
  }

  /**
   * Clears the unique index.
   */
  public clear(): void {
    this._lokiMap = {};
    this._valMap = {};
  }
}
