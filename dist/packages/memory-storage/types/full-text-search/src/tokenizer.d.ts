/**
 * Splits a string at non-alphanumeric characters into lower case tokens.
 * @param {string} str - the string
 * @returns {string[]} - the tokens
 * @private
 */
import { Dict } from "../../common/types";
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
export declare class Tokenizer {
    private _splitter;
    private _queue;
    private _symbol;
    /**
     * Initializes the tokenizer with a splitter, which splits a string at non-alphanumeric characters.
     * The queue is empty.
     */
    constructor();
    /**
     * Sets a function with defined label as the splitter function.
     * The function must take a string as argument and return an array of tokens.
     *
     * @param {string} label - the label
     * @param {function} func - the function
     */
    setSplitter(label: string, func: Tokenizer.SplitterFunction): void;
    /**
     * Gets the splitter.
     * @return {Array.<string, function>} - tuple with label and function
     */
    getSplitter(): any[];
    /**
     * Resets the splitter to default.
     */
    resetSplitter(): void;
    /**
     * Checks if a function is inside the queue.
     * @param {string|function} labelFunc - an existing label or function
     * @returns {boolean} true if exists, otherwise false
     */
    has(labelFunc: string | Tokenizer.TokinizeFunction): boolean;
    /**
     * Gets a function from the queue.
     * Only the first found function gets returned if a label or a function is multiple used.
     *
     * @param {string|function} labelFunc - an existing label or function
     * @return {Array.<string, function>} - tuple with label and function
     */
    get(labelFunc: string | Tokenizer.TokinizeFunction): any[];
    /**
     * Adds a function with defined label to the end of the queue.
     * The function must take a token string as argument and return a token.
     *
     * @param {string} label - the label
     * @param {function} func - the function
     */
    add(label: string, func: Tokenizer.TokinizeFunction): void;
    /**
     * Adds a function with defined label before an existing function to the queue.
     * The function must take a token string as argument and return a token.
     *
     * @param {string|function} labelFunc - an existing label or function
     * @param {string} label - the label
     * @param {function} func - the function
     */
    addBefore(labelFunc: string | Tokenizer.TokinizeFunction, label: string, func: Tokenizer.TokinizeFunction): void;
    /**
     * Adds a function with defined label after an existing function to the queue.
     * The function must take a token string as argument and return a token.
     *
     * @param {string|function} labelFunc - an existing label or function
     * @param {string} label - the label
     * @param {function} func - the function
     */
    addAfter(labelFunc: string | Tokenizer.TokinizeFunction, label: string, func: Tokenizer.TokinizeFunction): void;
    /**
     * Removes a function from the queue.
     * @param {string|function} labelFunc - an existing label or function
     */
    remove(labelFunc: string | Tokenizer.TokinizeFunction): void;
    /**
     * Resets the splitter and tokenize queue to default.
     */
    reset(): void;
    /**
     * Tokenizes a string into tokens.
     * @param {string} str - the string
     * @return {string[]} the tokens
     */
    tokenize(str: string): string[];
    /**
     * Serializes the tokenizer by returning the labels of the used functions.
     * @returns {{splitter: string?, tokenizers: string[]}} - the serialization
     */
    toJSON(): Tokenizer.Serialization;
    /**
     * Deserializes the tokenizer by reassign the correct function to each label.
     * @param {{splitter: string, tokenizers: string[]}} serialized - the serialized labels
     * @param {Object.<string, function>|Tokenizer} funcTok - the depending functions with labels
     *  or an equivalent tokenizer
     */
    static fromJSONObject(serialized: Tokenizer.Serialization, funcTok?: Tokenizer.FunctionSerialization): Tokenizer;
    /**
     * Returns the position of a function inside the queue.
     * @param {string|function} labelFunc - an existing label or function
     * @return {number} the position
     * @private
     */
    private _getPosition(labelFunc);
    /**
     * Adds a function with defined label at a specific position to the queue.
     * @param {string} label - the label
     * @param {function} func - the function
     * @param {number} pos - the position
     * @private
     */
    private _addFunction(label, func, pos);
}
export declare namespace Tokenizer {
    type SplitterFunction = (word: string) => string[];
    type TokinizeFunction = (word: string) => string;
    interface Serialization {
        splitter?: string;
        tokenizers: string[];
    }
    type FunctionSerialization = {
        splitters: Dict<SplitterFunction>;
        tokenizers: Dict<TokinizeFunction>;
    } | Tokenizer;
}
