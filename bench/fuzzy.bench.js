/* global suite, benchmark */
const FTS = require("./../dist/packages/full-text-search/lokijs.full-text-search.min");
const Benchmark = require("benchmark");

//const Long = require("long");

function make_word() {
  let text = "";
  const possible = "abcdef";
  const length = Math.floor(Math.random() * 10);

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

const suite = new Benchmark.Suite();

// let fts = new FTS.FullTextSearch([{name: "body"}]);
// let docs = [];
// for (let i = 0; i < 1e6; i++) {
//   let doc = make_word();
//   fts.addDocument({$loki: i, body: doc});
//   docs.push(doc);
// }
// let query = new FTS.QueryBuilder().fuzzy("body", "abcd").prefixLength(2).fuzziness(1).extended(true).build();

/**
 * Idea from:
 * * http://blog.mikemccandless.com/2011/03/lucenes-fuzzyquery-is-100-times-faster.html
 * * http://julesjacobs.github.io/2015/06/17/disqus-levenshtein-simple-and-fast.html
 *
 */



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
QueryBuilder = FTS.QueryBuilder;

let fts = new FTS.FullTextSearch([{name: "body"}], "id");
fts.addDocument({body: "abcd"}, 1);
fts.addDocument({body: "abdc"}, 2);
fts.addDocument({body: "abc"}, 3);
fts.addDocument({body: "abcde"}, 4);
fts.addDocument({body: "bcd"}, 5);
fts.addDocument({body: "bacd"}, 6);
fts.addDocument({body: "badc"}, 7);



try {
  let r = fts.search(new QueryBuilder().fuzzy("body", "bcd").build());
  console.log(r);
} catch (e) {
  console.log(e);
}



//
//
// suite
//   .add("a", () => {
//     fts.search(query);
//   })
//   .add("b", () => {
//     fts.search(query);
//   })
//   // add listeners
//   .on('cycle', function (event) {
//     console.log(String(event.target));
//   })
//   .on('complete', function () {
//     console.log('Fastest is ' + this.filter('fastest').map('name'));
//   })
//   .run();
//
