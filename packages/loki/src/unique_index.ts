export type ANY = any;

export class UniqueIndex {

  private _field: string;
  private _keyMap: object;

  constructor(uniqueField: string) {
    this._field = uniqueField;
    this._keyMap = {};
  }

  set(obj: ANY, row: number) {
    const fieldValue = obj[this._field];
    if (fieldValue !== null && fieldValue !== undefined) {
      if (this._keyMap[fieldValue] !== undefined) {
        throw new Error("Duplicate key for property " + this._field + ": " + fieldValue);
      } else {
        this._keyMap[fieldValue] = row;
      }
    }
  }

  get(key: string) {
    return this._keyMap[key];
  }

  /**
   * Updates a document's unique index given an updated object.
   * @param  {Object} obj - Original document object
   * @param  {number} row - the data row of the document
   */
  update(doc: object, row: number) {
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

  remove(key: string) {
    const obj = this._keyMap[key];
    if (obj !== null && obj !== undefined) {
      delete this._keyMap[key];
    } else {
      throw new Error("Key is not in unique index: " + this._field);
    }
  }

  clear() {
    this._keyMap = {};
  }
}
