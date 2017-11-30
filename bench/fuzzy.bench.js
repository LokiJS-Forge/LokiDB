/* global suite, benchmark */
const FTS = require("./lokijs.full-text-search-old.min");
const FTS2 = require("./../dist/packages/full-text-search/lokijs.full-text-search.min");
const Benchmark = require("benchmark");

// const RunAutomaton = FTS2.RunAutomaton;
// const LevenshteinAutomata = FTS2.LevenshteinAutomata;
//
// for (let i = 0; i < 1e3; i++)
//   new RunAutomaton(new LevenshteinAutomata("aabbcc", 2).toAutomaton());



function make_word() {
  let text = "";
  const possible = "abcdefghijklmnopqrstuvwxyz";
  const length = Math.floor(Math.random() * 10) + 1;

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

var doc = docs.sort(function (a, b) { return b.length - a.length; })[8e3];
let query = new FTS.QueryBuilder().fuzzy("body", doc).prefixLength(1).fuzziness(2).extended(true).build();

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
  .add("c", () => {
    fts.search(query);
  })
  .add("d", () => {
    fts2.search(query);
  })
  // add listeners
  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
//
// let arr = [];
// for (let i = 0; i < 1e3; i++) {
//   arr[i] = [new FTS.FullTextSearch(), new FTS2.FullTextSearch()];
// }
//
// suite
//   .add("a", () => {
//     let j = 0;
//     for (const child of arr) {
//       j += child.length;
//     }
//   })
//   .add("b", () => {
//     let j = 0;
//     for (let i = 0; i < arr.length; i++) {
//       let f = arr[i];
//       j += f.length;
//     }
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
//
