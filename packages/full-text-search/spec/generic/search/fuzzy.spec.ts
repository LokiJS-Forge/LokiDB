/* global describe, it, expect */
import { FullTextSearch } from "../../../src/full_text_search";
import { FuzzyQuery, MatchQuery, Query, QueryTypes } from "../../../src/query_types";

describe("fuzzy query", () => {
  // from lucene 6.4.0 core: TestFuzzyQuery
  let assertMatches = (searcher: FullTextSearch, subQuery: QueryTypes, docIds: number[] = [], query: Query = {
    query: subQuery
  }) => {
    let res = searcher.search(query);
    expect(Object.keys(res).length).toEqual(docIds.length);
    for (let i = 0; i < docIds.length; i++) {
      expect(res).toHaveMember(String(docIds[i]));
      delete res[String(docIds[i])];
    }
    expect(res).toEqual({});
  };

  it("Fuzzy query (1).", () => {
    let docs = ["aaaaa", "aaaab", "aaabb", "aabbb", "abbbb", "bbbbb", "ddddd"];
    let fts = new FullTextSearch([{field: "body"}], "$loki");
    for (let i = 0; i < docs.length; i++) {
      fts.addDocument({
        $loki: i,
        body: docs[i]
      });
    }
    let fuzzyQuery: FuzzyQuery = {type: "fuzzy", field: "body", value: "aaaaa", prefix_length: 0, fuzziness: 2};
    // With prefix.
    assertMatches(fts, fuzzyQuery, [0, 1, 2]);
    fuzzyQuery.prefix_length = 1;
    assertMatches(fts, fuzzyQuery, [0, 1, 2]);
    fuzzyQuery.prefix_length = 2;
    assertMatches(fts, fuzzyQuery, [0, 1, 2]);
    fuzzyQuery.prefix_length = 3;
    assertMatches(fts, fuzzyQuery, [0, 1, 2]);
    fuzzyQuery.prefix_length = 4;
    assertMatches(fts, fuzzyQuery, [0, 1]);
    fuzzyQuery.prefix_length = 5;
    assertMatches(fts, fuzzyQuery, [0]);
    fuzzyQuery.prefix_length = 6;
    assertMatches(fts, fuzzyQuery, [0]);

    // not similar enough:
    delete fuzzyQuery.prefix_length;
    fuzzyQuery.value = "xxxxx";
    assertMatches(fts, fuzzyQuery);
    fuzzyQuery.value = "aaccc";
    assertMatches(fts, fuzzyQuery);

    // query identical to a word in the index:
    fuzzyQuery.value = "aaaaa";
    assertMatches(fts, fuzzyQuery, [0, 1, 2]);

    // query similar to a word in the index:
    fuzzyQuery.value = "aaaac";
    assertMatches(fts, fuzzyQuery, [0, 1, 2]);

    // With prefix.
    fuzzyQuery.prefix_length = 1;
    assertMatches(fts, fuzzyQuery, [0, 1, 2]);
    fuzzyQuery.prefix_length = 2;
    assertMatches(fts, fuzzyQuery, [0, 1, 2]);
    fuzzyQuery.prefix_length = 3;
    assertMatches(fts, fuzzyQuery, [0, 1, 2]);
    fuzzyQuery.prefix_length = 4;
    assertMatches(fts, fuzzyQuery, [0, 1]);
    fuzzyQuery.prefix_length = 5;
    assertMatches(fts, fuzzyQuery);

    // Something other.
    delete fuzzyQuery.prefix_length;
    fuzzyQuery.value = "ddddx";
    assertMatches(fts, fuzzyQuery, [6]);

    // With prefix
    fuzzyQuery.prefix_length = 1;
    assertMatches(fts, fuzzyQuery, [6]);
    fuzzyQuery.prefix_length = 2;
    assertMatches(fts, fuzzyQuery, [6]);
    fuzzyQuery.prefix_length = 3;
    assertMatches(fts, fuzzyQuery, [6]);
    fuzzyQuery.prefix_length = 4;
    assertMatches(fts, fuzzyQuery, [6]);
    fuzzyQuery.prefix_length = 5;
    assertMatches(fts, fuzzyQuery);

    // Without prefix length (default should be 0).
    delete fuzzyQuery.prefix_length;
    fuzzyQuery.value = "aaaab";
    assertMatches(fts, fuzzyQuery, [0, 1, 2, 3]);
    fuzzyQuery.value = "aaabb";
    assertMatches(fts, fuzzyQuery, [0, 1, 2, 3, 4]);
    fuzzyQuery.value = "abbbb";
    assertMatches(fts, fuzzyQuery, [2, 3, 4, 5]);

    // Empty.
    fuzzyQuery.value = "";
    assertMatches(fts, fuzzyQuery);

    // Other.
    fuzzyQuery.fuzziness = 1;
    fuzzyQuery.value = "aaaaa";
    fuzzyQuery.prefix_length = 0;
    assertMatches(fts, fuzzyQuery, [0, 1]);

    fuzzyQuery.value = "aaaab";
    fuzzyQuery.prefix_length = 0;
    assertMatches(fts, fuzzyQuery, [0, 1, 2]);

    fuzzyQuery.value = "ababb";
    fuzzyQuery.prefix_length = 2;
    assertMatches(fts, fuzzyQuery, [4]);

    fuzzyQuery.value = "aaaaa";
    fuzzyQuery.prefix_length = 5;
    assertMatches(fts, fuzzyQuery, [0]);

    fuzzyQuery.prefix_length = 6;
    assertMatches(fts, fuzzyQuery, [0]);

    fuzzyQuery.value = "aaaaaa";
    assertMatches(fts, fuzzyQuery, []);
  });

  it("Fuzzy query (2).", () => {
    let docs = ["lange", "lueth", "pirsing", "riegel", "trzecziak", "walker", "wbr", "we", "web", "webe", "weber",
      "webere", "webree", "weberei", "wbre", "wittkopf", "wojnarowski", "wricke"];
    let fts = new FullTextSearch([{field: "body"}], "$loki");
    for (let i = 0; i < docs.length; i++) {
      fts.addDocument({
        $loki: i,
        body: docs[i]
      });
    }
    let fuzzyQuery: FuzzyQuery = {type: "fuzzy", field: "body", value: "weber", prefix_length: 1, fuzziness: 2};
    assertMatches(fts, fuzzyQuery, [6, 8, 9, 10, 11, 12, 13, 14]);

    delete fuzzyQuery.prefix_length;
    fuzzyQuery.fuzziness = 0;
    assertMatches(fts, fuzzyQuery, [10]);
  });

  it("unicode", () => {
    let docs = ["\u{000169bb}\u{000569bb}\u{000969bb}", "\u{000169bb}\u{000569bb}\u{000969be}",
      "\u{000169bb}\u{000969be}", "\u{000969bb}", "\u{000569bb}", "\u{000285ac}\u{000969bb}"];

    let fts = new FullTextSearch([{field: "body"}], "$loki");
    for (let i = 0; i < docs.length; i++) {
      fts.addDocument({
        $loki: i,
        body: docs[i]
      });
    }
    let fuzzyQuery: FuzzyQuery = {
      type: "fuzzy", field: "body", value: "\u{000169bb}\u{000969bb}", prefix_length: 0,
      fuzziness: 1
    };
    assertMatches(fts, fuzzyQuery, [0, 2, 3, 5]);
  });

  it("Fuzzy query extended.", () => {
    let docs = ["walker", "wbr", "we", "web", "webe", "weber", "webere", "webree", "weberei", "wbes", "wbert", "wbb",
      "xeb", "wrr", "wrr"];
    let fts = new FullTextSearch([{field: "body"}], "$loki");
    for (let i = 0; i < docs.length; i++) {
      fts.addDocument({
        $loki: i,
        body: docs[i]
      });
    }

    let fuzzyQuery: FuzzyQuery = {
      type: "fuzzy", field: "body", value: "web", prefix_length: 1, fuzziness: 1,
      extended: true
    };
    assertMatches(fts, fuzzyQuery, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

    let matchQuery: MatchQuery = {
      type: "match", field: "body", value: "web", prefix_length: 1, fuzziness: 1,
      extended: true
    };
    assertMatches(fts, matchQuery, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it("Fuzzy query extended 2.", () => {
    let docs = ["abca", "abcd", "abcde"];
    let fts = new FullTextSearch([{field: "body"}], "$loki");
    for (let i = 0; i < docs.length; i++) {
      fts.addDocument({
        $loki: i,
        body: docs[i]
      });
    }
    let fuzzyQuery: FuzzyQuery = {
      type: "fuzzy", field: "body", value: "abcd", prefix_length: 1, fuzziness: 0,
      extended: true
    };
    assertMatches(fts, fuzzyQuery, [1, 2]);

    assertMatches(fts, fuzzyQuery, [1, 2], {query: fuzzyQuery, calculate_scoring: false});
  });
});
