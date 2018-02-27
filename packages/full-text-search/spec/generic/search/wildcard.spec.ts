/* global describe, it, expect */
import {FullTextSearch} from "../../../src/full_text_search";
import {Query, QueryTypes, WildcardQuery} from "../../../src/query_types";
import {Analyzer} from "../../../src/analyzer/analyzer";

describe("wildcard query", () => {
  // from lucene 6.4.0 core: TestWildCard
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

  it("Tests Wildcard queries with an asterisk.", () => {
    let docs = ["metal", "metals", "mXtals", "mXtXls"];
    let fts = new FullTextSearch([{field: "body"}], "$loki");
    for (let i = 0; i < docs.length; i++) {
      fts.addDocument({
        $loki: i,
        body: docs[i]
      });
    }
    let wildcardQuery: WildcardQuery = {type: "wildcard", field: "body", value: "metal*"};
    assertMatches(fts, wildcardQuery, [0, 1]);
    wildcardQuery.value = "metals*";
    assertMatches(fts, wildcardQuery, [1]);
    wildcardQuery.value = "mx*";
    assertMatches(fts, wildcardQuery, [2, 3]);
    wildcardQuery.value = "mX*";
    assertMatches(fts, wildcardQuery);
    wildcardQuery.value = "m*";
    assertMatches(fts, wildcardQuery, [0, 1, 2, 3]);
    wildcardQuery.value = "m*tal";
    assertMatches(fts, wildcardQuery, [0]);
    wildcardQuery.value = "m*tal*";
    assertMatches(fts, wildcardQuery, [0, 1, 2]);
    wildcardQuery.value = "m*tals";
    assertMatches(fts, wildcardQuery, [1, 2]);
    wildcardQuery.value = "*tall";
    assertMatches(fts, wildcardQuery, []);
    wildcardQuery.value = "*tal";
    assertMatches(fts, wildcardQuery, [0]);
    wildcardQuery.value = "*tal*";
    assertMatches(fts, wildcardQuery, [0, 1, 2]);
  });

  it("Tests Wildcard queries with a question mark.", () => {
    let docs = ["metal", "metals", "mXtals", "mXtXls"];
    let fts = new FullTextSearch([{field: "body"}], "$loki");
    for (let i = 0; i < docs.length; i++) {
      fts.addDocument({
        $loki: i,
        body: docs[i]
      });
    }
    let wildcardQuery: WildcardQuery = {type: "wildcard", field: "body", value: "m?tal"};
    assertMatches(fts, wildcardQuery, [0]);
    wildcardQuery.value = "metal?";
    assertMatches(fts, wildcardQuery, [1]);
    wildcardQuery.value = "metals?";
    assertMatches(fts, wildcardQuery);
    wildcardQuery.value = "m?t?ls";
    assertMatches(fts, wildcardQuery, [1, 2, 3]);
    wildcardQuery.value = "M?t?ls";
    assertMatches(fts, wildcardQuery);
    wildcardQuery.value = "meta??";
    assertMatches(fts, wildcardQuery, [1]);
  });

  it("Tests if wildcard escaping works.", () => {
    let docs = ["foo*bar", "foo??bar", "fooCDbar", "fooSOMETHINGbar", "foo\\", "foo\\\\"];

    const analyzer: Analyzer = {
      // Don't split the text.
      tokenizer: (text) => [text]
    };

    let fts = new FullTextSearch([{field: "body", analyzer: analyzer}], "$loki");
    for (let i = 0; i < docs.length; i++) {
      fts.addDocument({
        $loki: i,
        body: docs[i]
      });
    }
    let wildcardQuery: WildcardQuery = {type: "wildcard", field: "body", value: "foo*bar"};
    assertMatches(fts, wildcardQuery, [0, 1, 2, 3]);
    wildcardQuery.value = "foo\\*bar";
    assertMatches(fts, wildcardQuery, [0]);
    wildcardQuery.value = "foo??bar";
    assertMatches(fts, wildcardQuery, [1, 2]);
    wildcardQuery.value = "foo\\?\\?bar";
    assertMatches(fts, wildcardQuery, [1]);
    wildcardQuery.value = "foo\\\\";
    assertMatches(fts, wildcardQuery, [4]);
    wildcardQuery.value = "foo\\\\*";
    assertMatches(fts, wildcardQuery, [4, 5]);
  });
});
