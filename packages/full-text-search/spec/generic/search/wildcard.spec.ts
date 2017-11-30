/* global describe, it, expect */
import {FullTextSearch} from "../../../src/full_text_search";
import {QueryBuilder as QB, WildcardQueryBuilder} from "../../../src/query_builder";
import {Tokenizer} from "../../../src/tokenizer";

describe("wildcard query", () => {
  // from lucene 6.4.0 core: TestWildCard
  let assertMatches = (searcher: FullTextSearch, query: object, docIds: number[] = []) => {
    let res = searcher.search(query);
    expect(Object.keys(res).length).toEqual(docIds.length);
    for (let i = 0; i < docIds.length; i++) {
      expect(res).toHaveMember(String(docIds[i]));
      delete res[String(docIds[i])];
    }
    expect(res).toEqual({});
  };

  it("Wild card query: QB", () => {
    let q = new WildcardQueryBuilder("user", "alb?rt").boost(4.5).build();
    expect(q).toEqual({type: "wildcard", field: "user", value: "alb?rt", boost: 4.5});
  });

  it("Tests Wildcard queries with an asterisk.", () => {
    let docs = ["metal", "metals", "mXtals", "mXtXls"];
    let fts = new FullTextSearch([{name: "body"}]);
    for (let i = 0; i < docs.length; i++) {
      fts.addDocument({
        $loki: i,
        body: docs[i]
      });
    }
    let query = null;
    query = new QB().wildcard("body", "metal*").build();
    assertMatches(fts, query, [0, 1]);
    query = new QB().wildcard("body", "metals*").build();
    assertMatches(fts, query, [1]);
    query = new QB().wildcard("body", "mx*").build();
    assertMatches(fts, query, [2, 3]);
    query = new QB().wildcard("body", "mX*").build();
    assertMatches(fts, query);
    query = new QB().wildcard("body", "m*").build();
    assertMatches(fts, query, [0, 1, 2, 3]);
    query = new QB().wildcard("body", "m*tal").build();
    assertMatches(fts, query, [0]);
    query = new QB().wildcard("body", "m*tal*").build();
    assertMatches(fts, query, [0, 1, 2]);
    query = new QB().wildcard("body", "m*tals").build();
    assertMatches(fts, query, [1, 2]);
    query = new QB().wildcard("body", "*tall").build();
    assertMatches(fts, query, []);
    query = new QB().wildcard("body", "*tal").build();
    assertMatches(fts, query, [0]);
    query = new QB().wildcard("body", "*tal*").build();
    assertMatches(fts, query, [0, 1, 2]);
  });

  it("Tests Wildcard queries with a question mark.", () => {
    let docs = ["metal", "metals", "mXtals", "mXtXls"];
    let fts = new FullTextSearch([{name: "body"}]);
    for (let i = 0; i < docs.length; i++) {
      fts.addDocument({
        $loki: i,
        body: docs[i]
      });
    }
    let query = null;
    query = new QB().wildcard("body", "m?tal").build();
    assertMatches(fts, query, [0]);
    query = new QB().wildcard("body", "metal?").build();
    assertMatches(fts, query, [1]);
    query = new QB().wildcard("body", "metals?").build();
    assertMatches(fts, query);
    query = new QB().wildcard("body", "m?t?ls").build();
    assertMatches(fts, query, [1, 2, 3]);
    query = new QB().wildcard("body", "M?t?ls").build();
    assertMatches(fts, query);
    query = new QB().wildcard("body", "meta??").build();
    assertMatches(fts, query, [1]);
  });

  it("Tests if wildcard escaping works.", () => {
    let docs = ["foo*bar", "foo??bar", "fooCDbar", "fooSOMETHINGbar", "foo\\", "foo\\\\"];

    let tkz = new Tokenizer();
    // Don't split the text.
    tkz.setSplitter("nosplit", (text) => [text]);

    let fts = new FullTextSearch([{name: "body", tokenizer: tkz}]);
    for (let i = 0; i < docs.length; i++) {
      fts.addDocument({
        $loki: i,
        body: docs[i]
      });
    }
    let query = null;
    query = new QB().wildcard("body", "foo*bar").build();
    assertMatches(fts, query, [0, 1, 2, 3]);
    query = new QB().wildcard("body", "foo\\*bar").build();
    assertMatches(fts, query, [0]);
    query = new QB().wildcard("body", "foo??bar").build();
    assertMatches(fts, query, [1, 2]);
    query = new QB().wildcard("body", "foo\\?\\?bar").build();
    assertMatches(fts, query, [1]);
    query = new QB().wildcard("body", "foo\\\\").build();
    assertMatches(fts, query, [4]);
    query = new QB().wildcard("body", "foo\\\\*").build();
    assertMatches(fts, query, [4, 5]);
  });
});
