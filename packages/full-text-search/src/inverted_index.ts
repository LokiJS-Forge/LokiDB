import {Tokenizer} from "./tokenizer";

export type ANY = any;

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
  private _docStore: object = {};
  private _totalFieldLength: number = 0;
  private _root: InvertedIndex.Index = new Map();

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
    if (this._docStore[docId] !== undefined) {
      throw Error("Field already added.");
    }

    this._docCount += 1;
    this._docStore[docId] = {};

    // Tokenize document field.
    const fieldTokens = this._tokenizer.tokenize(field);
    this._totalFieldLength += fieldTokens.length;

    const termRefs: ANY[] = [];
    this._docStore[docId] = {fieldLength: fieldTokens.length};
    if (this._optimizeChanges) {
      Object.defineProperties(this._docStore[docId], {
        termRefs: {enumerable: false, configurable: true, writable: true, value: termRefs}
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
            Object.defineProperties(child, {
              pa: {enumerable: false, configurable: true, writable: true, value: branch}
            });
          }
          branch.set(c, child);
        }
        branch = child;
      }
      // Add term info to index leaf.
      if (branch.dc === undefined) {
        branch.dc = {};
        branch.df = 0;
      }
      branch.dc[docId] = tf;
      branch.df += 1;

      // Store index leaf for deletion.
      termRefs.push(branch);
    }
  }

  /**
   * Removes all relevant terms of a document from the inverted index.
   * @param {number} docId - the document.
   */
  remove(docId: number) {
    if (this._docStore[docId] === undefined) {
      return;
    }
    const docStore = this._docStore[docId];
    // Remove document.
    delete this._docStore[docId];
    this._docCount -= 1;

    // Reduce total field length.
    this._totalFieldLength -= docStore.fieldLength;

    if (this._optimizeChanges) {
      // Iterate over all term references.
      // Remove docId from docs and decrement document frequency.
      const termRefs = docStore.termRefs;
      for (let j = 0; j < termRefs.length; j++) {
        let index = termRefs[j];
        index.df -= 1;
        delete index.dc[docId];

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
      // Iterate over the whole inverted index and remove the document.
      // Delete branch if not needed anymore.
      const recursive = (root: InvertedIndex.Index) => {
        for (const child of root) {
          // Checkout branch.
          if (recursive(child[1])) {
            root.delete(child[0]);
          }
        }
        // Remove docId from docs and decrement document frequency.
        if (root.df !== undefined) {
          if (root.dc[docId] !== undefined) {
            root.df -= 1;
            delete root.dc[docId];

            // Delete unused meta data of branch.
            if (root.df === 0) {
              delete root.df;
              delete root.dc;
            }
          }
        }
        return root.size === 0 && root.dc === undefined;
      };
      recursive(this._root);
    }
  }

  /**
   * Gets the term index of a term.
   * @param {string} term - the term
   * @param {object} root - the term index to start from
   * @param {number} start - the position of the term string to start from
   * @return {object} - The term index or null if the term is not in the term tree.
   */
  static getTermIndex(term: number[], root: InvertedIndex.Index, start: number = 0) {
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
   * @param {object} root - the term index to start from
   * @returns {Array} - Array with term indices and extension
   */
  static extendTermIndex(root: InvertedIndex.Index) {
    const termIndices: ANY[] = [];

    const recursive = (idx: InvertedIndex.Index, r: number[]) => {
      if (idx.df !== undefined) {
        termIndices.push({index: idx, term: r.slice()});
      }

      r.push(0);
      for (const child of idx) {
        r[r.length - 1] = child[0];
        recursive(child[1], r);
      }
      r.pop();
    };
    recursive(root, []);
    return termIndices;
  }

  private static serializeIndex(index: InvertedIndex.Index): any[] {
    const recursive = (idx: InvertedIndex.Index): any[] => {

      let k: ANY[] = [];
      let v: ANY[] = [];
      let r = {df: idx.df, dc: idx.dc};

      if (idx.size === 0) {
        return [k, v, r];
      }

      for (const child of idx) {
        k.push(child[0]);
        v.push(recursive(child[1]));
      }
      return [k, v, r];
    };

    return recursive(index);
  }

  private static deserializeIndex(ar: any): InvertedIndex.Index {
    const recursive = (arr: any): any => {
      let idx: InvertedIndex.Index = new Map();

      for (let i = 0; i < arr[0].length; i++) {
        idx.set(arr[0][i], recursive(arr[1][i]));
      }
      if (arr[2].df !== undefined) {
        idx.df = arr[2].df;
        idx.dc = arr[2].dc;
      }

      return idx;
    };

    return recursive(ar);
  }

  /**
   * Serialize the inverted index.
   * @returns {{docStore: *, _fields: *, index: *}}
   */
  toJSON() {
    if (this._store) {
      return {
        _store: true,
        _optimizeChanges: this._optimizeChanges,
        _tokenizer: this._tokenizer,
        _docCount: this._docCount,
        _docStore: this._docStore,
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
  static fromJSONObject(serialized: InvertedIndex.Serialization, funcTok: ANY = undefined) {
    const invIdx = new InvertedIndex({
      store: serialized._store,
      optimizeChanges: serialized._optimizeChanges,
      tokenizer: Tokenizer.fromJSONObject(serialized._tokenizer, funcTok)
    });
    if (invIdx._store) {
      invIdx._docCount = serialized._docCount;
      invIdx._docStore = serialized._docStore;
      invIdx._totalFieldLength = serialized._totalFieldLength;
      invIdx._root = InvertedIndex.deserializeIndex(serialized._root);
    }

    const regenerate = (index: InvertedIndex.Index, parent: InvertedIndex.Index) => {
      // Set parent.
      if (parent !== null) {
        Object.defineProperties(index, {
          pa: {enumerable: false, configurable: true, writable: false, value: parent}
        });
      }

      // Iterate over subtree.
      for (const child of index.values()) {
        regenerate(child, index);
      }

      if (index.dc !== undefined) {
        // Get documents of term.
        const docIds = Object.keys(index.dc);
        for (let j = 0; j < docIds.length; j++) {
          // Get document store at specific document/field.
          const ref = invIdx._docStore[docIds[j]];
          if (ref.termRefs === undefined) {
            Object.defineProperties(ref, {
              termRefs: {enumerable: false, configurable: true, writable: true, value: []}
            });
          }
          // Set reference to term index.
          ref.termRefs.push(index);
        }
      }
    };

    if (invIdx._optimizeChanges) {
      regenerate(invIdx._root, null);
    }

    return invIdx;
  }
}

export namespace InvertedIndex {
  export interface FieldOptions {
    store?: boolean;
    optimizeChanges?: boolean;
    tokenizer?: Tokenizer;
  }

  export type Index = Map<number, any> & { dc?: object, df?: number };

  export interface Serialization {
    _store: boolean;
    _optimizeChanges: boolean;
    _tokenizer: Tokenizer.Serialization;
    _docCount?: number;
    _docStore?: object;
    _totalFieldLength?: number;
    _root?: Index;
  }
}
