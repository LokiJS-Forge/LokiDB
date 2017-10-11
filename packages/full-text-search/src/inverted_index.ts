import {Tokenizer} from "./tokenizer";

/**
 * Inverted index class handles featured text search for specific document fields.
 * @constructor InvertedIndex
 * @param {boolean} [options.store=true] - inverted index will be stored at serialization rather than rebuilt on load.
 */
export class InvertedIndex {
  private _store: boolean;
  private _optimizeChanges: boolean;
  private _tokenizer: Tokenizer;
  private _docCount: number = 0;
  private _docStore: object = {};
  private _totalFieldLength: number = 0;
  private _root: InvertedIndex.Index = {};

  /**
   * @param {boolean} store
   * @param {boolean} optimizeChanges
   * @param {Tokenizer} tokenizer
   */
  constructor(options: InvertedIndex.FieldOption = {}) {
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

    const termRefs: any[] = [];
    this._docStore[docId] = {fieldLength: fieldTokens.length};
    if (this._optimizeChanges) {
      Object.defineProperties(this._docStore[docId], {
        termRefs: {enumerable: false, configurable: true, writable: true, value: termRefs}
      });
    }

    // Iterate over all unique field terms.
    for (const term of new Set(fieldTokens)) {
      if (term === "") {
        continue;
      }
      // Calculate term frequency.
      let tf = 0;
      for (let j = 0; j < fieldTokens.length; j++) {
        if (fieldTokens[j] === term) {
          ++tf;
        }
      }

      // Add term to index tree.
      let branch = this._root;
      for (let i = 0; i < term.length; i++) {
        const c = term[i];
        if (branch[c] === undefined) {
          const child = {};
          if (this._optimizeChanges) {
            Object.defineProperties(child, {
              pa: {enumerable: false, configurable: true, writable: true, value: branch}
            });
          }
          branch[c] = child;
        }
        branch = branch[c];
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
          if (Object.keys(index).length !== 0) {
            continue;
          }

          // Delete term branch if not used anymore.
          let keys = [];
          do {
            // Go tree upwards.
            const parent = index.pa;
            // Delete parent reference for preventing memory leak (cycle reference).
            delete index.pa;

            // Iterate over all children.
            keys = Object.keys(parent);
            for (let k = 0; k < keys.length; k++) {
              const key = keys[k];
              if (key.length !== 1) {
                continue;
              }
              // Remove previous child form parent.
              if (parent[key] === index) {
                delete parent[key];
                break;
              }
            }
            index = parent;
          } while (index.pa !== undefined && keys.length === 1);
        }
      }
    } else {
      // Iterate over the whole inverted index and remove the document.
      // Delete branch if not needed anymore.
      const recursive = (root: InvertedIndex.Index) => {
        const keys = Object.keys(root);
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          if (key.length === 1) {
            // Checkout branch.
            if (recursive(root[key])) {
              delete root[key];
            }
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
        return Object.keys(root).length === 0;
      };
      recursive(this._root);
    }
  }

  /**
   * Gets the term index of a term.
   * @param {string} term - the term.
   * @param {object} root - the term index to start from
   * @param {number} start - the position of the term string to start from
   * @return {object} - The term index or null if the term is not in the term tree.
   */
  static getTermIndex(term: string, root: InvertedIndex.Index, start: number = 0) {
    if (start >= term.length) {
      return null;
    }
    for (let i = start; i < term.length; i++) {
      if (root[term[i]] === undefined) {
        return null;
      }
      root = root[term[i]];
    }
    return root;
  }

  /**
   * Extends a term index for the one branch.
   * @param {object} root - the term index to start from
   * @return {Array} - array with term indices and extension
   */
  static getNextTermIndex(root: InvertedIndex.Index) {
    const termIndices: any[] = [];
    const keys = Object.keys(root);
    for (let i = 0; i < keys.length; i++) {
      if (keys[i].length === 1) {
        termIndices.push({index: root[keys[i]], term: keys[i]});
      }
    }
    return termIndices;
  }

  /**
   * Extends a term index to all available term leafs.
   * @param {object} root - the term index to start from
   * @returns {Array} - Array with term indices and extension
   */
  static extendTermIndex(root: InvertedIndex.Index) {
    const termIndices: any[] = [];
    const stack = [root];
    const treeStack = [""];
    do {
      const root = stack.pop();
      const treeTerm = treeStack.pop();

      if (root.df !== undefined) {
        termIndices.push({index: root, term: treeTerm});
      }

      const keys = Object.keys(root);
      for (let i = 0; i < keys.length; i++) {
        if (keys[i].length === 1) {
          stack.push(root[keys[i]]);
          treeStack.push(treeTerm + keys[i]);
        }
      }
    } while (stack.length !== 0);

    return termIndices;
  }

  /**
   * Serialize the inverted index.
   * @returns {{docStore: *, _fields: *, index: *}}
   */
  toJSON() {
    if (this._store) {
      return this;
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
  static fromJSONObject(serialized: InvertedIndex.Serialization, funcTok: any = undefined) {
    const invIdx = new InvertedIndex({
      store: serialized._store,
      optimizeChanges: serialized._optimizeChanges,
      tokenizer: Tokenizer.fromJSONObject(serialized._tokenizer, funcTok)
    });
    if (invIdx._store) {
      invIdx._docCount = serialized._docCount;
      invIdx._docStore = serialized._docStore;
      invIdx._totalFieldLength = serialized._totalFieldLength;
      invIdx._root = serialized._root;
    }

    const regenerate = (index: InvertedIndex.Index, parent: InvertedIndex.Index) => {
      // Set parent.
      if (parent !== null) {
        Object.defineProperties(index, {
          pa: {enumerable: false, configurable: true, writable: false, value: parent}
        });
      }

      // Iterate over all keys.
      const keys = Object.keys(index);
      for (let i = 0; i < keys.length; i++) {
        // Found term, save in document store.
        if (keys[i] === "dc") {
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
        } else if (keys[i].length === 1) {
          // Iterate over subtree.
          regenerate(index[keys[i]], index);
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
  export interface FieldOption {
    store?: boolean;
    optimizeChanges?: boolean;
    tokenizer?: Tokenizer;
  }

  export interface Index {
    dc?: object;
    df?: number;
  }

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
