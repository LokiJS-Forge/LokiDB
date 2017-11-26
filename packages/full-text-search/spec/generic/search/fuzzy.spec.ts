/* global describe, it, expect */
import {FullTextSearch} from "../../../src/full_text_search";
import {QueryBuilder as QB, FuzzyQuery} from "../../../src/query_builder";

describe("fuzzy query", () => {
  // from lucene 6.4.0 core: TestFuzzyQuery
  let assertMatches = (searcher: FullTextSearch, query: object, docIds: number[] = []) => {
    let res = searcher.search(query);
    expect(Object.keys(res).length).toEqual(docIds.length);
    for (let i = 0; i < docIds.length; i++) {
      expect(res).toHaveMember(String(docIds[i]));
      delete res[String(docIds[i])];
    }
    expect(res).toEqual({});
  };

  it("Fuzzy query: QB", () => {
    let q = new FuzzyQuery("user", "albrt").boost(5.5).fuzziness(3).prefixLength(3).build();
    expect(q).toEqual({type: "fuzzy", field: "user", value: "albrt", boost: 5.5, fuzziness: 3, prefix_length: 3});

    q = new QB().fuzzy("a", "abc");
    expect(() => q.fuzziness("AUTO")).not.toThrowErrorOfType("TypeError");
    expect(() => q.fuzziness(-3)).toThrowErrorOfType("TypeError");
    expect(() => q.fuzziness("3")).not.toThrowErrorOfType("TypeError");
    expect(() => q.prefixLength(-1)).toThrowErrorOfType("TypeError");
    expect(() => q.prefixLength("1")).not.toThrowErrorOfType("TypeError");
  });

  it("Fuzzy query (1).", () => {
    let docs = ["aaaaa", "aaaab", "aaabb", "aabbb", "abbbb", "bbbbb", "ddddd"];
    let fts = new FullTextSearch([{name: "body"}]);
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

    // Without prefix length (default should be 2).
    query = new QB().fuzzy("body", "aaaab").fuzziness(2).build();
    assertMatches(fts, query, [0, 1, 2, 3]);
    query = new QB().fuzzy("body", "aaabb").fuzziness(2).build();
    assertMatches(fts, query, [0, 1, 2, 3]);
    query = new QB().fuzzy("body", "aabbb").fuzziness(2).build();
    assertMatches(fts, query, [1, 2, 3]);

    // Empty.
    query = new QB().fuzzy("body", "").build();
    assertMatches(fts, query);
  });

  it("Fuzzy query (2).", () => {
    let docs = ["lange", "lueth", "pirsing", "riegel", "trzecziak", "walker", "wbr", "we", "web", "webe", "weber",
      "webere", "webree", "weberei", "wbre", "wittkopf", "wojnarowski", "wricke"];
    let fts = new FullTextSearch([{name: "body"}]);
    for (let i = 0; i < docs.length; i++) {
      fts.addDocument({
        $loki: i,
        body: docs[i]
      });
    }
    let query = new QB().fuzzy("body", "weber").prefixLength(1).fuzziness(2).build();
    assertMatches(fts, query, [6, 8, 9, 10, 11, 12, 13, 14]);
  });

  it("Fuzzy query extended.", () => {
    let docs = ["walker", "wbr", "we", "web", "webe", "weber", "webere", "webree", "weberei", "wbes", "wbert", "wbb",
      "xeb", "wrr"];
    let fts = new FullTextSearch([{name: "body"}]);
    for (let i = 0; i < docs.length; i++) {
      fts.addDocument({
        $loki: i,
        body: docs[i]
      });
    }
    let query = new QB().fuzzy("body", "web").prefixLength(1).fuzziness(1).extended(true).build();
    assertMatches(fts, query, [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

    query = new QB().match("body", "web").prefixLength(1).fuzziness(1).extended(true).build();
    assertMatches(fts, query, [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });
});
