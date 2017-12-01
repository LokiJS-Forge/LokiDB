import {FullTextSearch, Tokenizer, QueryBuilder} from "../../../full-text-search/src/index";

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
  let assertMatches = (searcher: any, query: any, docIds: number[] = []) => {
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
      name: "body",
      tokenizer: data.tokenizer
    }]);

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
        let query = new QueryBuilder().match("body", test.search).build();
        assertMatches(fts, query, test.expected);
      });
    }
  });
}
