/**
 * A token filter takes tokens from a tokenizer and modify, delete or add tokens.
 */
export declare type TokenFilter = (value: string, index: number, array: string[]) => string;
/**
 * Converts a token to lowercase.
 * @param {string} token - the token
 * @returns {string} - the lowercased token
 */
export declare function lowercaseTokenFilter(token: string): string;
/**
 * Converts a token to uppercase.
 * @param {string} token - the token
 * @returns {string} - the uppercased token
 */
export declare function uppercaseTokenFilter(token: string): string;
