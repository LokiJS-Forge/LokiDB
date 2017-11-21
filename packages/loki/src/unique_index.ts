export type ANY = any;

export class UniqueIndex {

  private field: string;
  private keyMap: object;
  private lokiMap: object;

  constructor(uniqueField: string) {
    this.field = uniqueField;
    this.keyMap = {};
    this.lokiMap = {};
  }

  set(obj: ANY, id: number) {
    const fieldValue = obj[this.field];
    if (fieldValue !== null && fieldValue !== undefined) {
      if (this.keyMap[fieldValue]) {
        throw new Error("Duplicate key for property " + this.field + ": " + fieldValue);
      } else {
        this.keyMap[fieldValue] = id;
        this.lokiMap[obj.$loki] = fieldValue;
      }
    }
  }

  get(key: string) {
    return this.keyMap[key];
  }

  byId(id: number) {
    return this.keyMap[this.lokiMap[id]];
  }

  /**
   * Updates a document's unique index given an updated object.
   * @param  {Object} obj Original document object
   * @param  {Object} doc New document object (likely the same as obj)
   */
  update(obj: ANY, doc: object, id: number) {
    if (this.lokiMap[obj.$loki] !== doc[this.field]) {
      const old = this.lokiMap[obj.$loki];
      this.set(doc, id);
      delete this.keyMap[old];
    } else {
      this.keyMap[obj[this.field]] = doc;
    }
  }

  remove(key: string) {
    const obj = this.keyMap[key];
    if (obj !== null && obj !== undefined) {
      this.keyMap[key] = undefined;
      this.lokiMap[obj.$loki] = undefined;
    } else {
      throw new Error("Key is not in unique index: " + this.field);
    }
  }

  clear() {
    this.keyMap = {};
    this.lokiMap = {};
  }
}
