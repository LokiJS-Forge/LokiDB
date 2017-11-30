import {InvertedIndex} from "./inverted_index";
import {IndexSearcher} from "./index_searcher";
import {Tokenizer} from "./tokenizer";
import {Dict} from "../../common/types";
import {PLUGINS} from "../../common/plugin";
import {Query} from "./query_builder";
import {ScoreResult} from "./scorer";

export class FullTextSearch {
  private _id: string;
  private _docs: Set<number>;
  private _idxSearcher: IndexSearcher;
  private _invIdxs: Dict<InvertedIndex> = {};

  /**
   * Registers the full text search as plugin.
   */
  public static register(): void {
    PLUGINS["FullTextSearch"] = FullTextSearch;
  }

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

  public addDocument(doc: object, id: number = doc[this._id]): void {
    let fieldNames = Object.keys(doc);
    for (let i = 0, fieldName; i < fieldNames.length, fieldName = fieldNames[i]; i++) {
      if (this._invIdxs[fieldName] !== undefined) {
        this._invIdxs[fieldName].insert(doc[fieldName], id);
      }
    }
    this._docs.add(id);
    this.setDirty();
  }

  public removeDocument(doc: object, id: number = doc[this._id]): void {
    let fieldNames = Object.keys(this._invIdxs);
    for (let i = 0; i < fieldNames.length; i++) {
      this._invIdxs[fieldNames[i]].remove(id);
    }
    this._docs.delete(id);
    this.setDirty();
  }

  public updateDocument(doc: object, id: number = doc[this._id]): void {
    this.removeDocument(doc, id);
    this.addDocument(doc, id);
  }

  public clear(): void {
    for (let id of this._docs) {
      this.removeDocument(null, id);
    }
  }

  public search(query: Query): ScoreResult {
    return this._idxSearcher.search(query);
  }

  public setDirty(): void {
    this._idxSearcher.setDirty();
  }

  public toJSON(): FullTextSearch.Serialization {
    let serialized = {id: this._id, ii: {}};
    let fieldNames = Object.keys(this._invIdxs);
    for (let i = 0; i < fieldNames.length; i++) {
      const fieldName = fieldNames[i];
      serialized.ii[fieldName] = this._invIdxs[fieldName].toJSON();
    }
    return serialized;
  }

  public static fromJSONObject(serialized: FullTextSearch.Serialization, tokenizers: Dict<Tokenizer.FunctionSerialization> = {}): FullTextSearch {
    let fts = new FullTextSearch([], serialized.id);
    let fieldNames = Object.keys(serialized.ii);
    for (let i = 0; i < fieldNames.length; i++) {
      const fieldName = fieldNames[i];
      fts._invIdxs[fieldName] = InvertedIndex.fromJSONObject(serialized.ii[fieldName], tokenizers[fieldName]);
    }
    return fts;
  }
}

export namespace FullTextSearch {
  export interface FieldOptions extends InvertedIndex.FieldOptions {
    name: string;
  }

  export interface Serialization {
    id: string;
    ii: Dict<InvertedIndex.Serialization>;
  }
}


export default FullTextSearch;
