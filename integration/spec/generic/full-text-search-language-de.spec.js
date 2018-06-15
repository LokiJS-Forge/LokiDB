test_integration("full-text-search-language-de",
  ["full-text-search-language"],
  {
    "GermanAnalyzer": (GermanAnalyzer) => {
      const ga = new GermanAnalyzer();
      expect(ga).toHaveMember("tokenizer");
      expect(ga).toHaveMember("token_filter");
    },
  }
);
