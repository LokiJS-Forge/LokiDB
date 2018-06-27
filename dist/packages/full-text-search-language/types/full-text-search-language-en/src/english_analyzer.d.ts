import { Analyzer } from "../../full-text-search/src/analyzer/analyzer";
export declare class EnglishAnalyzer implements Analyzer {
    tokenizer: (str: string) => string[];
    token_filter: ((token: string) => string)[];
}
