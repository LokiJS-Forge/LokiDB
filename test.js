/*function a() {
  const {Loki} = require("./dist/packages/loki/lokijs.loki");

  console.log(Loki)

}

//import c from "./dist/packages/loki/lokijs.loki";


const dd = require("./dist/packages/loki/lokijs.loki");

console.log(dd)

function b() {
  var requirejs = require("requirejs");

  requirejs.config({
    paths: {
      "Loki": "./dist/packages/loki/lokijs.loki"
    }
  });

  var {Loki} = requirejs("Loki");

  console.log(Loki)

  requirejs(["Loki"], function ({Loki}) {
    console.log(Loki);
  });
}


a(), b();*/

// var requirejs = require("requirejs");
//
// requirejs.config({
//   paths: {
//     "@lokijs/loki": "./dist/packages/loki/lokijs.loki",
//     "@lokijs/partitioning-adapter": "./dist/packages/partitioning-adapter/lokijs.partitioning-adapter",
//     "@lokijs/local-storage": "./dist/packages/local-storage/lokijs.local-storage"
//   }
// });
//
// requirejs(["@lokijs/partitioning-adapter"], function ({LokiPartitioningAdapter}) {
//   console.log(LokiPartitioningAdapter);
// });
//
// requirejs(["@lokijs/local-storage"], function ({LokiLocalStorage}) {
//   console.log(LokiLocalStorage);
// });

const {InvertedIndex} = require("./dist/packages/full-text-search/lokijs.full-text-search")

let a = JSON.stringify(new InvertedIndex({store: true }));
let b = JSON.stringify(new InvertedIndex({store: false }));
console.log( a );
console.log( b);

InvertedIndex.fromJSONObject(JSON.parse(a));
InvertedIndex.fromJSONObject(JSON.parse(b));

/*

 (function webpackUniversalModuleDefinition(root, factory) {
 if(typeof exports === "object" && typeof module === "object")
  module.exports = factory();
 else if(typeof define === "function" && define.amd)
  define([], factory);
 else {
 var a = factory();
 for(var i in a) (typeof exports === "object" ? exports : root)[i] = a[i];
 }


 */
/*

if(typeof exports === "object" && typeof module === "object")
  module.exports = factory();
else if(typeof define === "function" && define.amd)
  define("LokiJS", [], factory);
else if(typeof exports === "object")
  exports["LokiJS"] = factory();
else
  root["LokiJS"] = factory();
*/
