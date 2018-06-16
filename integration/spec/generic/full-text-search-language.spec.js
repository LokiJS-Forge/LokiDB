test_integration("full-text-search-language",
  [],
  {
    "generateStopWordFilter": (generateStopWordFilter) => {
      expect(generateStopWordFilter).toBeFunction();
    },
    "generateTrimmer": (generateTrimmer) => {
      expect(generateTrimmer).toBeFunction();
    },
    "Among": (Among) => {
      const among = new Among("1", 1, 1);
      expect(among).toHaveMember("s");
      expect(among).toHaveMember("method");
    },
    "SnowballProgram": (SnowballProgram) => {
      const sp = new SnowballProgram();
      expect(sp).toHaveMethod("setCurrent");
      expect(sp).toHaveMethod("getCurrent");
    }
  }
);
