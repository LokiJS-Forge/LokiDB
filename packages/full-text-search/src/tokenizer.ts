/**
 * Splits a string at non-alphanumeric characters into lower case tokens.
 * @param {string} str - the string
 * @returns {string[]} - the tokens
 * @private
 */
import {Dict} from "../../common/types";

function defaultSplitter(str: string) {
  let tokens = str.split(/[^\w]+/);
  for (let i = 0; i < tokens.length; i++) {
    tokens[i] = tokens[i].toLowerCase();
  }
  return tokens;
}

/**
 * The tokenizer is used to prepare the string content of a document field for the inverted index.
 * Firstly the string gets split into tokens.
 * After that the tokens will be trimmed/stemmed with defined functions from the queue.
 *
 * * To change the splitter function, use {@link Tokenizer#setSplitter}.
 * * To add functions to the queue, use {@link Tokenizer#add}, {@link Tokenizer#addBefore} and
 *   {@link Tokenizer#addAfter}.
 * * To remove a function from the queue, use {@link Tokenizer#remove}.
 * * To reset the tokenizer, use {@link Tokenizer#reset}.
 */
export class Tokenizer {
  private _splitter: Tokenizer.SplitterFunction;
  private _queue: Tokenizer.TokinizeFunction[] = [];
  private _symbol: any = Symbol("label");

  /**
   * Initializes the tokenizer with a splitter, which splits a string at non-alphanumeric characters.
   * The queue is empty.
   */
  constructor() {
    this.reset();
  }

  /**
   * Sets a function with defined label as the splitter function.
   * The function must take a string as argument and return an array of tokens.
   *
   * @param {string} label - the label
   * @param {function} func - the function
   */
  setSplitter(label: string, func: Tokenizer.SplitterFunction) {
    if (label === "") {
      throw Error("Label cannot be empty.");
    }
    func[this._symbol] = label;
    this._splitter = func;
  }

  /**
   * Gets the splitter.
   * @return {Array.<string, function>} - tuple with label and function
   */
  getSplitter() {
    return [this._splitter[this._symbol], this._splitter];
  }

  /**
   * Resets the splitter to default.
   */
  resetSplitter() {
    this._splitter = defaultSplitter;
  }

  /**
   * Checks if a function is inside the queue.
   * @param {string|function} labelFunc - an existing label or function
   * @returns {boolean} true if exists, otherwise false
   */
  has(labelFunc: string | Tokenizer.TokinizeFunction) {
    return this._getPosition(labelFunc) !== -1;
  }

  /**
   * Gets a function from the queue.
   * Only the first found function gets returned if a label or a function is multiple used.
   *
   * @param {string|function} labelFunc - an existing label or function
   * @return {Array.<string, function>} - tuple with label and function
   */
  get(labelFunc: string | Tokenizer.TokinizeFunction) {
    let pos = this._getPosition(labelFunc);
    if (pos === -1) {
      throw Error("Cannot find existing function.");
    }
    return [this._queue[pos][this._symbol], this._queue[pos]];
  }

  /**
   * Adds a function with defined label to the end of the queue.
   * The function must take a token string as argument and return a token.
   *
   * @param {string} label - the label
   * @param {function} func - the function
   */
  add(label: string, func: Tokenizer.TokinizeFunction) {
    this._addFunction(label, func, this._queue.length);
  }

  /**
   * Adds a function with defined label before an existing function to the queue.
   * The function must take a token string as argument and return a token.
   *
   * @param {string|function} labelFunc - an existing label or function
   * @param {string} label - the label
   * @param {function} func - the function
   */
  addBefore(labelFunc: string | Tokenizer.TokinizeFunction, label: string, func: Tokenizer.TokinizeFunction) {
    let pos = this._getPosition(labelFunc);
    if (pos === -1) {
      throw Error("Cannot find existing function.");
    }
    this._addFunction(label, func, pos);
  }

  /**
   * Adds a function with defined label after an existing function to the queue.
   * The function must take a token string as argument and return a token.
   *
   * @param {string|function} labelFunc - an existing label or function
   * @param {string} label - the label
   * @param {function} func - the function
   */
  addAfter(labelFunc: string | Tokenizer.TokinizeFunction, label: string, func: Tokenizer.TokinizeFunction) {
    let pos = this._getPosition(labelFunc);
    if (pos === -1) {
      throw Error("Cannot find existing function.");
    }
    this._addFunction(label, func, pos + 1);
  }

  /**
   * Removes a function from the queue.
   * @param {string|function} labelFunc - an existing label or function
   */
  remove(labelFunc: string | Tokenizer.TokinizeFunction) {
    let pos = this._getPosition(labelFunc);
    if (pos === -1) {
      throw Error("Cannot find existing function.");
    }
    this._queue.splice(pos, 1);
  }

  /**
   * Resets the splitter and tokenize queue to default.
   */
  reset() {
    this._splitter = defaultSplitter;
    this._queue = [];
  }

  /**
   * Tokenizes a string into tokens.
   * @param {string} str - the string
   * @return {string[]} the tokens
   */
  tokenize(str: string) {
    let tokens = this._splitter(str);
    // Apply each token over the queue functions.
    for (let i = 0; i < this._queue.length; i++) {
      let newTokens: string[] = [];
      for (let j = 0; j < tokens.length; j++) {
        let token: string = this._queue[i](tokens[j]);
        if (token) {
          newTokens.push(token);
        }
      }
      tokens = newTokens;
    }
    return tokens;
  }

  /**
   * Serializes the tokenizer by returning the labels of the used functions.
   * @returns {{splitter: string?, tokenizers: string[]}} - the serialization
   */
  toJSON() {
    let serialized: Tokenizer.Serialization = {
      tokenizers: []
    };
    if (this._splitter !== defaultSplitter) {
      serialized.splitter = this._splitter[this._symbol];
    }
    for (let i = 0; i < this._queue.length; i++) {
      serialized.tokenizers.push(this._queue[i][this._symbol]);
    }
    return serialized;
  }

  /**
   * Deserializes the tokenizer by reassign the correct function to each label.
   * @param {{splitter: string, tokenizers: string[]}} serialized - the serialized labels
   * @param {Object.<string, function>|Tokenizer} funcTok - the depending functions with labels
   *  or an equivalent tokenizer
   */
  static fromJSONObject(serialized: Tokenizer.Serialization, funcTok?: Tokenizer.FunctionSerialization) {
    let tkz = new Tokenizer();
    if (funcTok instanceof Tokenizer) {
      if (serialized.splitter !== undefined) {
        let splitter = funcTok.getSplitter();
        if (serialized.splitter !== splitter[0]) {
          throw Error("Splitter function not found.");
        }
        tkz.setSplitter(splitter[0], splitter[1]);
      }

      for (let i = 0; i < serialized.tokenizers.length; i++) {
        if (!funcTok.has(serialized.tokenizers[i])) {
          throw Error("Tokenizer function not found.");
        }
        let labelFunc = funcTok.get(serialized.tokenizers[i]);
        tkz.add(labelFunc[0], labelFunc[1]);
      }
    } else {
      if (serialized.splitter !== undefined) {
        if (funcTok.splitters[serialized.splitter] === undefined) {
          throw Error("Splitter function not found.");
        }
        tkz.setSplitter(serialized.splitter, funcTok.splitters[serialized.splitter]);
      }
      for (let i = 0; i < serialized.tokenizers.length; i++) {
        if (funcTok.tokenizers[serialized.tokenizers[i]] === undefined) {
          throw Error("Tokenizer function not found.");
        }
        tkz.add(serialized.tokenizers[i], funcTok.tokenizers[serialized.tokenizers[i]]);
      }
    }
    return tkz;
  }

  /**
   * Returns the position of a function inside the queue.
   * @param {string|function} labelFunc - an existing label or function
   * @return {number} the position
   * @private
   */
  private _getPosition(labelFunc: string | Tokenizer.TokinizeFunction) {
    if (labelFunc instanceof Function) {
      return this._queue.indexOf(labelFunc);
    } else {
      for (let i = 0; i < this._queue.length; i++) {
        if (this._queue[i][this._symbol] === labelFunc) {
          return i;
        }
      }
    }
    return -1;
  }

  /**
   * Adds a function with defined label at a specific position to the queue.
   * @param {string} label - the label
   * @param {function} func - the function
   * @param {number} pos - the position
   * @private
   */
  private _addFunction(label: string, func: Tokenizer.TokinizeFunction, pos: number) {
    if (label === "") {
      throw Error("Label cannot be empty.");
    }
    func[this._symbol] = label;
    this._queue.splice(pos, 0, func);
  }
}

export namespace Tokenizer {
  export type SplitterFunction = (word: string) => string[];
  export type TokinizeFunction = (word: string) => string;

  export interface Serialization {
    splitter?: string;
    tokenizers: string[];
  }

  export type FunctionSerialization =
    { splitters: Dict<SplitterFunction>, tokenizers: Dict<TokinizeFunction> }
    | Tokenizer;
}
