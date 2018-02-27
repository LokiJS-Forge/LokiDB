/**
 * A tokenizer splits a string into individual tokens.
 */
export type Tokenizer = (value: string) => string[];

/**
 * Splits a string at whitespace characters into tokens.
 * @param {string} value - the string
 * @returns {string[]} - the tokens
 */
export function whitespaceTokenizer(value: string): string[] {
  return value.split(/[\s]+/);
}

