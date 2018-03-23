import { CharacterFilter } from "./character_filter";
import { Tokenizer, whitespaceTokenizer } from "./tokenizer";
import { lowercaseTokenFilter, TokenFilter } from "./token_filter";
/**
 * A analyzer converts a string into tokens which are added to the inverted index for searching.
 */
export interface Analyzer {
    /**
     * The character filters of the analyzer.
     */
    char_filter?: CharacterFilter[];
    /**
     * The tokenizer of the analyzer.
     */
    tokenizer: Tokenizer;
    /**
     * The token filters of the analyzer.
     */
    token_filter?: TokenFilter[];
}
/**
 * Analyzes a given string.
 * @param {Analyzer} analyzer - the analyzer
 * @param {string} str - the string
 * @returns {string[]} - the tokens
 */
export declare function analyze(analyzer: Analyzer, str: string): string[];
/**
 * An analyzer with the whitespace tokenizer and the lowercase token filter.
 */
export declare class StandardAnalyzer implements Analyzer {
    tokenizer: typeof whitespaceTokenizer;
    token_filter: (typeof lowercaseTokenFilter)[];
}
