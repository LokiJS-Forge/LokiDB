/* global suite, benchmark */
import {FullTextSearch, QueryBuilder} from "./../dist/packages/full-text-search/lokijs.full-text-search";

function make_word() {
  let text = "";
  const possible = "abcdef";
  const length = Math.floor(Math.random() * 10);

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}


suite("Full text search queries", function () {

  let fts = new FullTextSearch([{name: "body"}]);
  let docs = [];
  for (let i = 0; i < 1e6; i++) {
    let doc = make_word();
    fts.addDocument({$loki: i, body: doc});
    docs.push(doc);
  }

  let query = new QueryBuilder().fuzzy("body", "abcd").prefixLength(2).fuzziness(1).extended(true).build();

  benchmark("a", function () {
    fts.search(query);
  });

  benchmark("b", function () {
    fts.search(query);
  });

  benchmark("c", function () {
    fts.search(query);
  });
}, {
  onCycle: function (event) {
  },
  onStart: function () {

  },
  onComplete: function () {

  }
});
