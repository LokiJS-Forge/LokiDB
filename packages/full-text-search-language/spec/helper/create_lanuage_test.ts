import {FullTextSearch, Tokenizer} from "../../../full-text-search/src/index";
import {Query} from "../../../full-text-search/src/query_types";

export interface LanguageTestData {
  tokenizer: Tokenizer;
  docs: string[];
  tests: {
    what: string;
    search: string;
    expected: number[];
  }[];
}

/**
 * Performs unit tests for a language
 * @param {string} language - the language name
 * @param {LanguageTestData} data - the language data
 */
export function createLanguageTest(language: string, data: LanguageTestData) {
  let assertMatches = (searcher: FullTextSearch, query: Query, docIds: number[] = []) => {
    let res = searcher.search(query);
    expect(Object.keys(res).length).toEqual(docIds.length);
    for (let i = 0; i < docIds.length; i++) {
      expect(res).toHaveMember(String(docIds[i]));
      delete res[String(docIds[i])];
    }
    expect(res).toEqual({});
  };

  describe("language-" + language + ":", () => {
    // Setup full-text search.
    let fts = new FullTextSearch([{
      field: "body",
      tokenizer: data.tokenizer
    }], "$loki");

    // Add documents.
    for (let i = 0; i < data.docs.length; i++) {
      fts.addDocument({
        $loki: i,
        body: data.docs[i]
      });
    }

    // Check each test.
    for (let i = 0; i < data.tests.length; i++) {
      let test = data.tests[i];
      it(test.what + " '" + test.search + "'", () => {
        assertMatches(fts, {query: {type: "match", field: "body", value: test.search}}, test.expected);
      });
    }
  });
}
