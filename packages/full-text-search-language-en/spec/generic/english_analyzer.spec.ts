import {EnglishAnalyzer} from "../../src/english_analyzer";
import {createLanguageTest, LanguageTestData} from "../../../full-text-search-language/spec/helper/create_lanuage_test";

export const en: LanguageTestData = {
  analyzer: new EnglishAnalyzer(),
  docs: [
    "In on announcing if of comparison pianoforte projection. Maids hoped gay yet bed asked blind dried point. On abroad danger likely regret twenty edward do. Too horrible consider followed may differed age.",
    "By so delight of showing neither believe he present. Deal sigh up in shew away when. Pursuit considering express no or prepare replied."
  ],
  tests: [{
    what: "find the word",
    search: "announcing",
    expected: [0]
  },{
    what: "find the word",
    search: "believe",
    expected: [1]
  }, {
    what: "find the word",
    search: "consider",
    expected: [0, 1]
  }, {
    what: "find the word",
    search: "show",
    expected: [1]
  }, {
    what: "never find a word that does not exist, like",
    search: "inexistent",
    expected: []
  }, {
    what: "never find a stop word like",
    search: "neither",
    expected: []
  }, {
    what: "find a correctly stemmed word",
    search: "show",
    expected: [1]
  }]
};

createLanguageTest("en", en);
