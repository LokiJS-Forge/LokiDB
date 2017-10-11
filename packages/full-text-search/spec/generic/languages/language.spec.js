/* global describe, it, expect */
import {de} from "./de";
import {FullTextSearch} from "../../../src/full_text_search";
import {QueryBuilder} from "../../../src/query_builder";

let testData = {
  de: de
};

let assertMatches = (searcher, query, docIds = []) => {
  let res = searcher.search(query);
  expect(Object.keys(res).length).toEqual(docIds.length);
  for (let i = 0; i < docIds.length; i++) {
    expect(res).toHaveMember(String(docIds[i]));
    delete res[String(docIds[i])];
  }
  expect(res).toEqual({});
};

for (let key of Object.keys(testData)) {
  let testDatum = testData[key];

  describe("language " + key, () => {
    let fts = new FullTextSearch([{
      name: "body",
      tokenizer: testDatum.tokenizer
    }]);
    for (let i = 0; i < testDatum.docs.length; i++) {
      fts.addDocument({
        $loki: i,
        body: testDatum.docs[i]
      });
    }

    for (let i = 0; i < testDatum.tests.length; i++) {
      let test = testDatum.tests[i];
      it(test.what + " " + test.search, () => {
        let query = new QueryBuilder().match("body", test.search).build();
        assertMatches(fts, query, test.found);
      });
    }
  });

}
