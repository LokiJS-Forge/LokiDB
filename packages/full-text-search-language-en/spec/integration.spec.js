test_integration("full-text-search-language-en",
  ["full-text-search-language"],
  {
    "EnglishAnalyzer": (EnglishAnalyzer) => {
      const ea = new EnglishAnalyzer();
      expect(ea).toHaveMember("tokenizer");
      expect(ea).toHaveMember("token_filter");
    },
  }
);
