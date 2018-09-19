import { Loki } from '../../packages/loki/src/loki';
import { ILokiOperatorPackageMap, LokiOperatorPackage } from '../../packages/loki/src/operator_packages';

type user = {
   last: string,
   first: string,
   age: number
}

let db = new Loki("test.db");

// add collection using the default ('js') LokiOperatorPackage
let dc = db.addCollection<user>("default-ops");

dc.insert({
   last: "doe",
   first: "jane",
   age: 21
});

// default ('js') LokiOperatorPackage
// run through some in-depth query object constructs to ensure typescript tooling is ok syntax
let result = dc.find({
   "first": { $len: 4 }
});

// 'loki' LokiAbstractOperatorPackage
// run through some in-depth query object constructs to ensure typescript tooling is ok syntax
let ac = db.addCollection<user>("abstract-ops", { defaultLokiOperatorPackage: "loki" });
let result = dc.find({
   "age": { $aeq: '21' }
});

// 'compat' LokiCompatibilityOperatorPackage
// run through some in-depth query object constructs to ensure typescript tooling is ok syntax
let cc = db.addCollection<user>("compat-ops", { defaultLokiOperatorPackage: "compat" });
result = cc.find({
   "first": { $jgte: "aaaa" }
});

// user-defined (set up user injected operator package and use within query object constructs)
// run through some in-depth query object constructs to ensure typescript tooling is ok syntax
class MyOperatorPackage extends LokiOperatorPackage {
   constructor() {
      super();
   }

   $foo(a: any, b: any): boolean {
      return b.length === a.length;
   }
}

let lokiOperatorPackageMap: ILokiOperatorPackageMap = {
   "MyOperatorPackage": new MyOperatorPackage()
}

let cdb = new Loki("test2.db", { lokiOperatorPackageMap: lokiOperatorPackageMap });

let custom = cdb.addCollection<user>("custom-ops", { defaultLokiOperatorPackage: "MyOperatorPackage" });

let customResults = custom.find({
   "first": { $foo: "abcd" }
})