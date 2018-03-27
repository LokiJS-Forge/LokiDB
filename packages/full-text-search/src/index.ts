import {FullTextSearch} from "./full_text_search";
import {analyze, StandardAnalyzer} from "./analyzer/analyzer";
import {whitespaceTokenizer} from "./analyzer/tokenizer";
import {lowercaseTokenFilter, uppercaseTokenFilter} from "./analyzer/token_filter";

FullTextSearch["Analyzer"] = {};
FullTextSearch["Analyzer"]["analyze"] = analyze;
FullTextSearch["Analyzer"]["StandardAnalyzer"] = StandardAnalyzer;
FullTextSearch["Tokenizer"] = {};
FullTextSearch["Tokenizer"]["whitespaceTokenizer"] = whitespaceTokenizer;
FullTextSearch["TokenFilter"] = {};
FullTextSearch["TokenFilter"]["lowercaseTokenFilter"] = lowercaseTokenFilter;
FullTextSearch["TokenFilter"]["uppercaseTokenFilter"] = uppercaseTokenFilter;

export {FullTextSearch,
  analyze, StandardAnalyzer,
  whitespaceTokenizer,
  lowercaseTokenFilter, uppercaseTokenFilter
};
export default FullTextSearch;
