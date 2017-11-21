import {InvertedIndex} from "./inverted_index";
import {IndexSearcher} from "./index_searcher";
import {Tokenizer} from "./tokenizer";
import {ANY, Dict} from "../../loki/src/types";

let Loki: any;
try {
  Loki = require("../../loki/src/loki").Loki;
} catch {
}

export class FullTextSearch {
  private _id: string;
  private _docs: Set<any>;
  private _idxSearcher: IndexSearcher;
  private _invIdxs: Dict<InvertedIndex> = {};

  /**
   * Initialize the full text search for the given fields.
   * @param {object[]} fields - the field options
   * @param {string} fields.name - the name of the field
   * @param {boolean=true} fields.store - flag to indicate if the full text search should be stored on serialization or
   *  rebuild on deserialization
   * @param {boolean=true} fields.optimizeChanges - flag to indicate if deleting/updating a document should be optimized
   *  (requires more memory but performs better)
   * @param {Tokenizer=Tokenizer} fields.tokenizer - the tokenizer of the field
   * @param {string=$loki} id - the property name of the document index
   */
  constructor(fields: FullTextSearch.FieldOptions[] = [], id = "$loki") {
    // Create inverted indices for each field.
    for (let i = 0; i < fields.length; i++) {
      let field = fields[i];
      this._invIdxs[field.name] = new InvertedIndex(field);
    }
    this._id = id;
    this._docs = new Set();
    this._idxSearcher = new IndexSearcher(this._invIdxs, this._docs);
  }

  addDocument(doc: ANY, id: number = doc[this._id]) {
    let fieldNames = Object.keys(doc);
    for (let i = 0, fieldName; i < fieldNames.length, fieldName = fieldNames[i]; i++) {
      if (this._invIdxs[fieldName] !== undefined) {
        this._invIdxs[fieldName].insert(doc[fieldName], id);
      }
    }
    this._docs.add(id);
    this.setDirty();
  }

  removeDocument(doc: ANY, id: number = doc[this._id]) {
    let fieldNames = Object.keys(this._invIdxs);
    for (let i = 0; i < fieldNames.length; i++) {
      this._invIdxs[fieldNames[i]].remove(id);
    }
    this._docs.delete(id);
    this.setDirty();
  }

  updateDocument(doc: ANY, id: number = doc[this._id]) {
    this.removeDocument(doc, id);
    this.addDocument(doc, id);
  }

  clear() {
    for (let id of this._docs) {
      this.removeDocument(null, id);
    }
  }

  search(query: ANY) {
    return this._idxSearcher.search(query);
  }

  toJSON() {
    let serialized = {};
    let fieldNames = Object.keys(this._invIdxs);
    for (let i = 0, fieldName; i < fieldNames.length, fieldName = fieldNames[i]; i++) {
      serialized[fieldName] = this._invIdxs[fieldName].toJSON();
    }
    return serialized;
  }

  static fromJSONObject(serialized: ANY, tokenizers: Tokenizer[] = []) {
    let fts = new FullTextSearch();
    let fieldNames = Object.keys(serialized);
    for (let i = 0, fieldName; i < fieldNames.length, fieldName = fieldNames[i]; i++) {
      fts._invIdxs[fieldName] = InvertedIndex.fromJSONObject(serialized[fieldName], tokenizers[fieldName]);
    }
    return fts;
  }

  setDirty() {
    this._idxSearcher.setDirty();
  }
}

export namespace FullTextSearch {
  export interface FieldOptions extends InvertedIndex.FieldOptions {
    name: string;
  }
}

if (Loki) {
  Loki["FullTextSearch"] = FullTextSearch;
}

export default FullTextSearch;
