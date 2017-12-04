import {Tokenizer} from "./tokenizer";
import Index = InvertedIndex.Index;

/**
 * Converts a string into an array of code points.
 * @param str - the string
 * @returns {number[]} to code points
 * @hidden
 */
export function toCodePoints(str: string): number[] {
  const r = [];
  for (let i = 0; i < str.length;) {
    const chr = str.charCodeAt(i++);
    if (chr >= 0xD800 && chr <= 0xDBFF) {
      // surrogate pair
      const low = str.charCodeAt(i++);
      r.push(0x10000 + ((chr - 0xD800) << 10) | (low - 0xDC00));
    } else {
      // ordinary character
      r.push(chr);
    }
  }
  return r;
}

/**
 * Inverted index class handles featured text search for specific document fields.
 * @hidden
 */
export class InvertedIndex {
  private _store: boolean;
  private _optimizeChanges: boolean;
  private _tokenizer: Tokenizer;
  private _docCount: number = 0;
  private _docStore: Map<number, InvertedIndex.DocStore> = new Map();
  private _totalFieldLength: number = 0;
  private _root: Index = new Map();

  /**
   * @param {boolean} [options.store=true] - inverted index will be stored at serialization rather than rebuilt on load.
   * @param {boolean} optimizeChanges
   * @param {Tokenizer} tokenizer
   */
  constructor(options: InvertedIndex.FieldOptions = {}) {
    (
      {
        store: this._store = true,
        optimizeChanges: this._optimizeChanges = true,
        tokenizer: this._tokenizer = new Tokenizer()
      } = options
    );
  }

  get store() {
    return this._store;
  }

  set store(val: boolean) {
    this._store = val;
  }

  get tokenizer() {
    return this._tokenizer;
  }

  get documentCount() {
    return this._docCount;
  }

  get documentStore() {
    return this._docStore;
  }

  get totalFieldLength() {
    return this._totalFieldLength;
  }

  get root() {
    return this._root;
  }

  /**
   * Adds defined fields of a document to the inverted index.
   * @param {string} field - the field to add
   * @param {number} docId - the doc id of the field
   */
  insert(field: string, docId: number) {
    if (this._docStore.has(docId)) {
      throw Error("Field already added.");
    }

    // Tokenize document field.
    const fieldTokens = this._tokenizer.tokenize(field);
    this._totalFieldLength += fieldTokens.length;
    this._docCount += 1;
    this._docStore.set(docId, {fieldLength: fieldTokens.length});

    // Holds references to each index of a document.
    const indexRef: Index[] = [];
    if (this._optimizeChanges) {
      Object.defineProperties(this._docStore.get(docId), {
        indexRef: {enumerable: false, configurable: true, writable: true, value: indexRef}
      });
    }

    // Iterate over all unique field terms.
    for (const token of new Set(fieldTokens)) {
      if (token === "") {
        continue;
      }
      // Calculate term frequency.
      let tf = 0;
      for (let j = 0; j < fieldTokens.length; j++) {
        if (fieldTokens[j] === token) {
          ++tf;
        }
      }

      // Add term to index tree.
      let branch = this._root;

      for (const c of toCodePoints(token)) {
        let child = branch.get(c);
        if (child === undefined) {
          child = new Map();
          if (this._optimizeChanges) {
            child.pa = branch;
          }
          branch.set(c, child);
        }
        branch = child;
      }
      // Add term info to index leaf.
      if (branch.dc === undefined) {
        branch.dc = new Map();
        branch.df = 0;
      }
      branch.dc.set(docId, tf);
      branch.df += 1;

      // Store index leaf for deletion.
      indexRef.push(branch);
    }
  }

  /**
   * Removes all relevant terms of a document from the inverted index.
   * @param {number} docId - the document.
   */
  remove(docId: number) {
    if (!this._docStore.has(docId)) {
      return;
    }
    const docStore = this._docStore.get(docId);
    // Remove document.
    this._docStore.delete(docId);
    this._docCount -= 1;

    // Reduce total field length.
    this._totalFieldLength -= docStore.fieldLength;

    if (this._optimizeChanges) {
      // Iterate over all term references.
      // Remove docId from docs and decrement document frequency.
      const indexRef = docStore.indexRef;
      for (let j = 0; j < indexRef.length; j++) {
        let index = indexRef[j];
        index.df -= 1;
        index.dc.delete(docId);

        // Check if no document is left for current tree.
        if (index.df === 0) {
          // Delete unused meta data of branch.
          delete index.df;
          delete index.dc;

          // Check for sub branches.
          if (index.size !== 0) {
            continue;
          }

          // Delete term branch if not used anymore.
          do {
            // Go tree upwards.
            const parent = index.pa;
            // Delete parent reference for preventing memory leak (cycle reference).
            delete index.pa;

            // Iterate over all children.
            for (const key of parent.keys()) {
              // Remove previous child form parent.
              if (parent.get(key) === index) {
                parent.delete(key);
                break;
              }
            }
            index = parent;
          } while (index.pa !== undefined && index.size === 0 && index.df === undefined);
        }
      }
    } else {
      this._remove(this._root, docId);
    }
  }

  /**
   * Gets the term index of a term.
   * @param {string} term - the term
   * @param {object} root - the term index to start from
   * @param {number} start - the position of the term string to start from
   * @return {object} - The term index or null if the term is not in the term tree.
   */
  static getTermIndex(term: number[], root: Index, start: number = 0) {
    if (start >= term.length) {
      return null;
    }
    for (let i = start; i < term.length; i++) {
      let child = root.get(term[i]);
      if (child === undefined) {
        return null;
      }
      root = child;
    }
    return root;
  }

  /**
   * Extends a term index to all available term leafs.
   * @param {object} idx - the term index to start from
   * @param {number[]} [term=[]] - the current term
   * @param {Array} termIndices - all extended indices with their term
   * @returns {Array} - Array with term indices and extension
   */
  static extendTermIndex(idx: Index, term: number[] = [], termIndices: InvertedIndex.IndexTerm[] = []): InvertedIndex.IndexTerm[] {
    if (idx.df !== undefined) {
      termIndices.push({index: idx, term: term.slice()});
    }

    term.push(0);
    for (const child of idx) {
      term[term.length - 1] = child[0];
      InvertedIndex.extendTermIndex(child[1], term, termIndices);
    }
    term.pop();
    return termIndices;
  }

  /**
   * Serialize the inverted index.
   * @returns {{docStore: *, _fields: *, index: *}}
   */
  public toJSON() {
    if (this._store) {
      return {
        _store: true,
        _optimizeChanges: this._optimizeChanges,
        _tokenizer: this._tokenizer,
        _docCount: this._docCount,
        _docStore: [...this._docStore],
        _totalFieldLength: this._totalFieldLength,
        _root: InvertedIndex.serializeIndex(this._root)
      };
    }
    return {
      _store: false,
      _optimizeChanges: this._optimizeChanges,
      _tokenizer: this._tokenizer
    };
  }

  /**
   * Deserialize the inverted index.
   * @param {{docStore: *, _fields: *, index: *}} serialized - The serialized inverted index.
   * @param {Object.<string, function>|Tokenizer} funcTok[undefined] - the depending functions with labels
   *  or an equivalent tokenizer
   */
  public static fromJSONObject(serialized: InvertedIndex.Serialization, funcTok?: Tokenizer.FunctionSerialization) {
    const invIdx = new InvertedIndex({
      store: serialized._store,
      optimizeChanges: serialized._optimizeChanges,
      tokenizer: Tokenizer.fromJSONObject(serialized._tokenizer, funcTok)
    });
    if (invIdx._store) {
      invIdx._docCount = serialized._docCount;
      invIdx._docStore = new Map(serialized._docStore);
      invIdx._totalFieldLength = serialized._totalFieldLength;
      invIdx._root = InvertedIndex.deserializeIndex(serialized._root);
    }

    if (invIdx._optimizeChanges) {
      invIdx._regenerate(invIdx._root, null);
    }

    return invIdx;
  }

  private static serializeIndex(idx: Index): InvertedIndex.SerializedIndex {
    const serialized: InvertedIndex.SerializedIndex = {};
    if (idx.dc !== undefined) {
      serialized.d = {df: idx.df, dc: [...idx.dc]};
    }

    if (idx.size === 0) {
      return serialized;
    }

    const keys = [];
    const values = [];
    for (const child of idx) {
      keys.push(child[0]);
      values.push(InvertedIndex.serializeIndex(child[1]));
    }
    serialized.k = keys;
    serialized.v = values;

    return serialized;
  }

  private static deserializeIndex(serialized: InvertedIndex.SerializedIndex): Index {
    const idx: Index = new Map();

    if (serialized.k !== undefined) {
      for (let i = 0; i < serialized.k.length; i++) {
        idx.set(serialized.k[i], InvertedIndex.deserializeIndex(serialized.v[i]));
      }
    }
    if (serialized.d !== undefined) {
      idx.df = serialized.d.df;
      idx.dc = new Map(serialized.d.dc);
    }
    return idx;
  }

  /**
   * Set parent of to each index and regenerate the indexRef.
   * @param {Index} index - the index
   * @param {Index} parent - the parent
   */
  private _regenerate(index: Index, parent: Index) {
    // Set parent.
    if (parent !== null) {
      index.pa = parent;
    }

    // Iterate over subtree.
    for (const child of index.values()) {
      this._regenerate(child, index);
    }

    if (index.dc !== undefined) {
      // Get documents of term.
      for (const docId of index.dc.keys()) {
        // Get document store at specific document/field.
        const ref = this._docStore.get(docId);
        if (ref.indexRef === undefined) {
          Object.defineProperties(ref, {
            indexRef: {enumerable: false, configurable: true, writable: true, value: []}
          });
        }
        // Set reference to term index.
        ref.indexRef.push(index);
      }
    }
  }

  /**
   * Iterate over the whole inverted index and remove the document.
   * Delete branch if not needed anymore.
   * Function is needed if index is used without optimization.
   * @param {Index} idx - the index
   * @param {number} docId - the doc id
   * @returns {boolean} true if index is empty
   */
  private _remove(idx: Index, docId: number) {
    for (const child of idx) {
      // Checkout branch.
      if (this._remove(child[1], docId)) {
        idx.delete(child[0]);
      }
    }
    // Remove docId from docs and decrement document frequency.
    if (idx.df !== undefined) {
      if (idx.dc.has(docId)) {
        idx.df -= 1;
        idx.dc.delete(docId);

        // Delete unused meta data of branch.
        if (idx.df === 0) {
          delete idx.df;
          delete idx.dc;
        }
      }
    }
    return idx.size === 0 && idx.dc === undefined;
  }
}

export namespace InvertedIndex {
  export interface FieldOptions {
    store?: boolean;
    optimizeChanges?: boolean;
    tokenizer?: Tokenizer;
  }

  export type Index = Map<number, any> & { dc?: Map<number, number>, df?: number, pa?: Index };

  export type IndexTerm = { index: Index, term: number[] };

  export interface SerializedIndex {
    d?: {
      df: number;
      dc: [number, number][]
    };
    k?: number[];
    v?: SerializedIndex[];
  }

  export interface Serialization {
    _store: boolean;
    _optimizeChanges: boolean;
    _tokenizer: Tokenizer.Serialization;
    _docCount?: number;
    _docStore?: Map<number, DocStore>;
    _totalFieldLength?: number;
    _root?: SerializedIndex;
  }

  export interface DocStore {
    fieldLength?: number;
    indexRef?: Index[];
  }
}
