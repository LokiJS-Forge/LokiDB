/**
 * A tokenizer splits a string into individual tokens.
 */
export declare type Tokenizer = (value: string) => string[];
/**
 * Splits a string at whitespace characters into tokens.
 * @param {string} value - the string
 * @returns {string[]} - the tokens
 */
export declare function whitespaceTokenizer(value: string): string[];
