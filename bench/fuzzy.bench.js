/* global suite, benchmark */
const FTS = require("./../dist/packages/full-text-search/lokijs.full-text-search.min");
const FTS2 = require("./full-text-search2.min");
const Benchmark = require("benchmark");

function make_word() {
  let text = "";
  const possible = "abcdefghijklmnopqrstuvwxyz";
  const length = Math.floor(Math.random() * 10);

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

const suite = new Benchmark.Suite();

let fts = new FTS.FullTextSearch([{name: "body"}]);
let fts2 = new FTS2.FullTextSearch([{name: "body"}]);
let docs = [];
for (let i = 0; i < 1e4; i++) {
  let doc = make_word();
  fts.addDocument({$loki: i, body: doc});
  fts2.addDocument({$loki: i, body: doc});
  docs.push(doc);
}

var doc = docs.sort(function (a, b) { return b.length - a.length; })[0];

let query = new FTS.QueryBuilder().fuzzy("body", doc).prefixLength(1).fuzziness(1).extended(true).build();





// let ii = new FTS.InvertedIndex();
// ii.insert("abcd", 1);
// ii.insert("abdc", 2);
// ii.insert("abc", 3);
// ii.insert("abcde", 4);
// ii.insert("bcd", 5);
// ii.insert("bacd", 6);
// ii.insert("badc", 7);

// run(ra, ii.root);
//
// QueryBuilder = FTS.QueryBuilder;
//
// let fts = new FTS.FullTextSearch([{name: "body"}], "id");
// fts.addDocument({body: "abcd"}, 1);
// fts.addDocument({body: "abdc"}, 2);
// fts.addDocument({body: "abc"}, 3);
// fts.addDocument({body: "abcde"}, 4);
// fts.addDocument({body: "bcd"}, 5);
// fts.addDocument({body: "bacd"}, 6);
// fts.addDocument({body: "\u{169}"}, 7);
//
//
//
//
// try {
//   //let r = fts.search(new QueryBuilder().fuzzy("body", "bcd").prefixLength(0).fuzziness(2).build());
//   let r = fts.search(new QueryBuilder().prefix("body", "\u{169}").build());
//   console.log(r);
// } catch (e) {
//   console.log(e);
// }
console.log("here");
let r = fts.search(query);
let f = fts2.search(query);
console.log(JSON.stringify(Object.keys(r)) === JSON.stringify(Object.keys(f)));
console.log(query);

suite
  .add("a", () => {
    fts.search(query);
  })
  .add("b", () => {
    fts2.search(query);
  })
  .add("a", () => {
    fts.search(query);
  })
  // add listeners
  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();

