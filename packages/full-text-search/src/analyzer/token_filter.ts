/**
 * A token filter takes tokens from a tokenizer and modify, delete or add tokens.
 */
export type TokenFilter = (value: string, index: number, array: string[]) => string;

/**
 * Converts a token to lowercase.
 * @param {string} token - the token
 * @returns {string} - the lowercased token
 */
export function lowercaseTokenFilter(token: string): string {
  return token.toLowerCase();
}

/**
 * Converts a token to uppercase.
 * @param {string} token - the token
 * @returns {string} - the uppercased token
 */
export function uppercaseTokenFilter(token: string): string {
  return token.toUpperCase();
}
