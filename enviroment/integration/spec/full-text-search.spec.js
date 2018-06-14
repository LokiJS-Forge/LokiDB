test_integration("full-text-search",
  [],
  {
    "FullTextSearch": (FullTextSearch) => {
      expect(FullTextSearch.Analyzer).toBeDefined();
      expect(FullTextSearch.Tokenizer).toBeDefined();
      expect(FullTextSearch.TokenFilter).toBeDefined();

      const fts = new FullTextSearch();
      expect(fts).toHaveMethod("search");
      expect(fts).toHaveMethod("removeDocument");
    },
    "analyze": (analyze) => {
      expect(analyze).toBeFunction();
    },
    "StandardAnalyzer": (StandardAnalyzer) => {
      const sa = new StandardAnalyzer();
      expect(sa).toHaveMember("tokenizer");
      expect(sa).toHaveMember("token_filter");
    },
    "whitespaceTokenizer": (whitespaceTokenizer) => {
      expect(whitespaceTokenizer).toBeFunction();
    },
    "lowercaseTokenFilter": (lowercaseTokenFilter) => {
      expect(lowercaseTokenFilter).toBeFunction();
    },
    "uppercaseTokenFilter": (uppercaseTokenFilter) => {
      expect(uppercaseTokenFilter).toBeFunction();
    }
  }
);
