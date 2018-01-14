/* global describe, it, expect */
import {FullTextSearch} from "../../../src/full_text_search";
import {QueryBuilder as QB, FuzzyQueryBuilder, Query} from "../../../src/query_builder";
import {Tokenizer} from "../../../src/tokenizer";

describe("fuzzy query", () => {
  // from lucene 6.4.0 core: TestFuzzyQuery
  let assertMatches = (searcher: FullTextSearch, query: Query, docIds: number[] = []) => {
    let res = searcher.search(query);
    expect(Object.keys(res).length).toEqual(docIds.length);
    for (let i = 0; i < docIds.length; i++) {
      expect(res).toHaveMember(String(docIds[i]));
      delete res[String(docIds[i])];
    }
    expect(res).toEqual({});
  };

  it("Fuzzy query: QB", () => {
    let q = new FuzzyQueryBuilder("user", "albrt").boost(5.5).fuzziness(2).prefixLength(3).extended(true).build();
    expect(q).toEqual({
      type: "fuzzy",
      field: "user",
      value: "albrt",
      boost: 5.5,
      fuzziness: 2,
      prefix_length: 3,
      extended: true
    });

    let fb = new QB().fuzzy("a", "abc");
    expect(() => fb.fuzziness("AUTO")).not.toThrowErrorOfType("TypeError");
    expect(() => fb.fuzziness(-3 as any)).toThrowErrorOfType("TypeError");
    expect(() => fb.fuzziness("3" as any)).toThrowErrorOfType("TypeError");
    expect(() => fb.prefixLength(-1)).toThrowErrorOfType("TypeError");
    expect(() => fb.prefixLength("-1" as any)).toThrowErrorOfType("TypeError");
  });

  it("Fuzzy query (1).", () => {
    let docs = ["aaaaa", "aaaab", "aaabb", "aabbb", "abbbb", "bbbbb", "ddddd"];
    let fts = new FullTextSearch([{field: "body"}], "$loki");
    for (let i = 0; i < docs.length; i++) {
      fts.addDocument({
        $loki: i,
        body: docs[i]
      });
    }
    let query;
    // With prefix.
    query = new QB().fuzzy("body", "aaaaa").prefixLength(0).fuzziness(2).build();
    assertMatches(fts, query, [0, 1, 2]);
    query = new QB().fuzzy("body", "aaaaa").prefixLength(1).fuzziness(2).build();
    assertMatches(fts, query, [0, 1, 2]);
    query = new QB().fuzzy("body", "aaaaa").prefixLength(2).fuzziness(2).build();
    assertMatches(fts, query, [0, 1, 2]);
    query = new QB().fuzzy("body", "aaaaa").prefixLength(3).fuzziness(2).build();
    assertMatches(fts, query, [0, 1, 2]);
    query = new QB().fuzzy("body", "aaaaa").prefixLength(4).fuzziness(2).build();
    assertMatches(fts, query, [0, 1]);
    query = new QB().fuzzy("body", "aaaaa").prefixLength(5).fuzziness(2).build();
    assertMatches(fts, query, [0]);
    query = new QB().fuzzy("body", "aaaaa").prefixLength(6).fuzziness(2).build();
    assertMatches(fts, query, [0]);

    // not similar enough:
    query = new QB().fuzzy("body", "xxxxx").fuzziness(2).build();
    assertMatches(fts, query);
    query = new QB().fuzzy("body", "aaccc").fuzziness(2).build();
    assertMatches(fts, query);

    // query identical to a word in the index:
    query = new QB().fuzzy("body", "aaaaa").fuzziness(2).build();
    assertMatches(fts, query, [0, 1, 2]);

    // query similar to a word in the index:
    query = new QB().fuzzy("body", "aaaac").fuzziness(2).build();
    assertMatches(fts, query, [0, 1, 2]);

    // With prefix.
    query = new QB().fuzzy("body", "aaaac").prefixLength(1).fuzziness(2).build();
    assertMatches(fts, query, [0, 1, 2]);
    query = new QB().fuzzy("body", "aaaac").prefixLength(2).fuzziness(2).build();
    assertMatches(fts, query, [0, 1, 2]);
    query = new QB().fuzzy("body", "aaaac").prefixLength(3).fuzziness(2).build();
    assertMatches(fts, query, [0, 1, 2]);
    query = new QB().fuzzy("body", "aaaac").prefixLength(4).fuzziness(2).build();
    assertMatches(fts, query, [0, 1]);
    query = new QB().fuzzy("body", "aaaac").prefixLength(5).fuzziness(2).build();
    assertMatches(fts, query);

    // Something other.
    query = new QB().fuzzy("body", "ddddx").build();
    assertMatches(fts, query, [6]);

    // With prefix
    query = new QB().fuzzy("body", "ddddx").prefixLength(1).fuzziness(2).build();
    assertMatches(fts, query, [6]);
    query = new QB().fuzzy("body", "ddddx").prefixLength(2).fuzziness(2).build();
    assertMatches(fts, query, [6]);
    query = new QB().fuzzy("body", "ddddx").prefixLength(3).fuzziness(2).build();
    assertMatches(fts, query, [6]);
    query = new QB().fuzzy("body", "ddddx").prefixLength(4).fuzziness(2).build();
    assertMatches(fts, query, [6]);
    query = new QB().fuzzy("body", "ddddx").prefixLength(5).fuzziness(2).build();
    assertMatches(fts, query);

    // Without prefix length (default should be 0).
    query = new QB().fuzzy("body", "aaaab").fuzziness(2).build();
    assertMatches(fts, query, [0, 1, 2, 3]);
    query = new QB().fuzzy("body", "aaabb").fuzziness(2).build();
    assertMatches(fts, query, [0, 1, 2, 3, 4]);
    query = new QB().fuzzy("body", "abbbb").fuzziness(2).build();
    assertMatches(fts, query, [2, 3, 4, 5]);

    // Empty.
    query = new QB().fuzzy("body", "").build();
    assertMatches(fts, query);

    // Other.
    query = new QB().fuzzy("body", "aaaaa").prefixLength(0).fuzziness(1).build();
    assertMatches(fts, query, [0, 1]);

    query = new QB().fuzzy("body", "aaaab").prefixLength(0).fuzziness(1).build();
    assertMatches(fts, query, [0, 1, 2]);

    query = new QB().fuzzy("body", "ababb").prefixLength(2).fuzziness(1).build();
    assertMatches(fts, query, [4]);

    query = new QB().fuzzy("body", "aaaaa").prefixLength(5).fuzziness(1).build();
    assertMatches(fts, query, [0]);

    query = new QB().fuzzy("body", "aaaaa").prefixLength(6).fuzziness(1).build();
    assertMatches(fts, query, [0]);

    query = new QB().fuzzy("body", "aaaaa").prefixLength(6).fuzziness(1).build();
    assertMatches(fts, query, [0]);

    query = new QB().fuzzy("body", "aaaaaa").prefixLength(6).fuzziness(1).build();
    assertMatches(fts, query, []);
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
    let query = new QB().fuzzy("body", "weber").prefixLength(1).fuzziness(2).build();
    assertMatches(fts, query, [6, 8, 9, 10, 11, 12, 13, 14]);

    query = new QB().fuzzy("body", "weber").fuzziness(0).build();
    assertMatches(fts, query, [10]);
  });

  it("unicode", () => {
    let docs = ["\u{000169bb}\u{000569bb}\u{000969bb}", "\u{000169bb}\u{000569bb}\u{000969be}",
      "\u{000169bb}\u{000969be}", "\u{000969bb}", "\u{000569bb}", "\u{000285ac}\u{000969bb}"];

    let tkz = new Tokenizer();
    tkz.setSplitter("split", (tokens: string) => {
      return tokens.split(" ");
    });

    let fts = new FullTextSearch([{field: "body", tokenizer: tkz}], "$loki");
    for (let i = 0; i < docs.length; i++) {
      fts.addDocument({
        $loki: i,
        body: docs[i]
      });
    }
    let query = new QB().fuzzy("body", "\u{000169bb}\u{000969bb}").fuzziness(1).prefixLength(0).build();
    assertMatches(fts, query, [0, 2, 3, 5]);
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

    let query = new QB().fuzzy("body", "web").prefixLength(1).fuzziness(1).extended(true).build();
    assertMatches(fts, query, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

    let query2 = new QB().match("body", "web").prefixLength(1).fuzziness(1).extended(true).build();
    assertMatches(fts, query2, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it("Fuzzy query extended.", () => {
    let docs = ["abca", "abcd", "abcde"];
    let fts = new FullTextSearch([{field: "body"}], "$loki");
    for (let i = 0; i < docs.length; i++) {
      fts.addDocument({
        $loki: i,
        body: docs[i]
      });
    }
    let query = new QB().fuzzy("body", "abcd").prefixLength(1).fuzziness(0).extended(true).build();
    assertMatches(fts, query, [1, 2]);

    query = new QB().enableFinalScoring(false).fuzzy("body", "abcd").prefixLength(1).fuzziness(0).extended(true).build();
    assertMatches(fts, query, [1, 2]);
  });
});
