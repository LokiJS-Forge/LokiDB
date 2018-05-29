import { Analyzer, StandardAnalyzer, analyze } from "./analyzer/analyzer";

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
  public analyzer: Analyzer;
  public docCount: number = 0;
  public docStore: Map<InvertedIndex.DocumentIndex, InvertedIndex.DocStore> = new Map();
  public totalFieldLength: number = 0;
  public root: InvertedIndex.Index = new Map();

  private _store: boolean;
  private _optimizeChanges: boolean;

  /**
   * @param {boolean} [options.store=true] - inverted index will be stored at serialization rather than rebuilt on load
   * @param {boolean} [options.optimizeChanges=true] - flag to
   * @param {Analyzer} [options.analyzer=] - the analyzer of this inverted index
   */
  constructor(options: InvertedIndex.FieldOptions = {}) {
    (
      {
        store: this._store = true,
        optimizeChanges: this._optimizeChanges = true,
        analyzer: this.analyzer = new StandardAnalyzer()
      } = options
    );
  }

  /**
   * Adds defined fields of a document to the inverted index.
   * @param {string} field - the field to add
   * @param {number} docId - the doc id of the field
   */
  public insert(field: string, docId: InvertedIndex.DocumentIndex): void {
    if (this.docStore.has(docId)) {
      throw Error("Field already added.");
    }

    // Tokenize document field.
    const fieldTokens = analyze(this.analyzer, field);
    this.totalFieldLength += fieldTokens.length;
    this.docCount += 1;
    this.docStore.set(docId, {fieldLength: fieldTokens.length});

    // Holds references to each index of a document.
    const indexRef: InvertedIndex.Index[] = [];
    if (this._optimizeChanges) {
      Object.defineProperties(this.docStore.get(docId), {
        indexRef: {enumerable: false, configurable: true, writable: true, value: indexRef}
      });
    }

    // Iterate over all unique field terms.
    for (const token of new Set(fieldTokens)) {
      // Calculate term frequency.
      let tf = 0;
      for (let j = 0; j < fieldTokens.length; j++) {
        if (fieldTokens[j] === token) {
          ++tf;
        }
      }

      // Add term to index tree.
      let branch = this.root;

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
  public remove(docId: InvertedIndex.DocumentIndex): void {
    if (!this.docStore.has(docId)) {
      return;
    }
    const docStore = this.docStore.get(docId);
    // Remove document.
    this.docStore.delete(docId);
    this.docCount -= 1;

    // Reduce total field length.
    this.totalFieldLength -= docStore.fieldLength;

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
      this._remove(this.root, docId);
    }
  }

  /**
   * Gets the term index of a term.
   * @param {string} term - the term
   * @param {object} root - the term index to start from
   * @param {number} start - the position of the term string to start from
   * @return {object} - The term index or null if the term is not in the term tree.
   */
  public static getTermIndex(term: number[], root: InvertedIndex.Index, start: number = 0): InvertedIndex.Index {
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
  public static extendTermIndex(idx: InvertedIndex.Index, term: number[] = [],
                                termIndices: InvertedIndex.IndexTerm[] = []): InvertedIndex.IndexTerm[] {
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
  public toJSON(): InvertedIndex.Serialized {
    if (this._store) {
      return {
        store: true,
        optimizeChanges: this._optimizeChanges,
        docCount: this.docCount,
        docStore: [...this.docStore],
        totalFieldLength: this.totalFieldLength,
        root: InvertedIndex._serializeIndex(this.root)
      };
    }
    return {
      store: false,
      optimizeChanges: this._optimizeChanges,
    };
  }

  /**
   * Deserialize the inverted index.
   * @param {{docStore: *, _fields: *, index: *}} serialized - The serialized inverted index.
   * @param {Analyzer} analyzer[undefined] - an analyzer
   */
  public static fromJSONObject(serialized: InvertedIndex.Serialized, analyzer?: Analyzer): InvertedIndex {
    const invIdx = new InvertedIndex({
      store: serialized.store,
      optimizeChanges: serialized.optimizeChanges,
      analyzer: analyzer
    });

    if (serialized.store) {
      invIdx.docCount = serialized.docCount;
      invIdx.docStore = new Map(serialized.docStore);
      invIdx.totalFieldLength = serialized.totalFieldLength;
      invIdx.root = InvertedIndex._deserializeIndex(serialized.root);
    }

    if (invIdx._optimizeChanges) {
      invIdx._regenerate(invIdx.root, null);
    }

    return invIdx;
  }

  private static _serializeIndex(idx: InvertedIndex.Index): InvertedIndex.SerializedIndex {
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
      values.push(InvertedIndex._serializeIndex(child[1]));
    }
    serialized.k = keys;
    serialized.v = values;

    return serialized;
  }

  private static _deserializeIndex(serialized: InvertedIndex.SerializedIndex): InvertedIndex.Index {
    const idx: InvertedIndex.Index = new Map();

    if (serialized.k !== undefined) {
      for (let i = 0; i < serialized.k.length; i++) {
        idx.set(serialized.k[i], InvertedIndex._deserializeIndex(serialized.v[i]));
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
  private _regenerate(index: InvertedIndex.Index, parent: InvertedIndex.Index): void {
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
        const ref = this.docStore.get(docId);
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
  private _remove(idx: InvertedIndex.Index, docId: InvertedIndex.DocumentIndex): boolean {
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
    analyzer?: Analyzer;
  }

  export type Index = Map<number, any> & { dc?: Map<DocumentIndex, number>, df?: number, pa?: Index };

  export type IndexTerm = { index: Index, term: number[] };

  export interface SerializedIndex {
    d?: {
      df: number;
      dc: [DocumentIndex, number][]
    };
    k?: number[];
    v?: SerializedIndex[];
  }

  export type Serialized = SpareSerialized | FullSerialized;

  export type SpareSerialized = {
    store: false;
    optimizeChanges: boolean;
  };

  export type FullSerialized = {
    store: true;
    optimizeChanges: boolean;
    docCount: number;
    docStore: [DocumentIndex, DocStore][];
    totalFieldLength: number;
    root: SerializedIndex;
  };

  export interface DocStore {
    fieldLength?: number;
    indexRef?: Index[];
  }

  export type DocumentIndex = number | string;
}
