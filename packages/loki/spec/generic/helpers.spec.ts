/* global describe, beforeEach, it, expect */
import { LokiOperatorPackageMap, LokiOperatorPackage, ILokiComparer, ComparatorOperatorPackage } from "../../src/helper";
import { Loki } from "../../src/loki";

describe("Testing comparator helpers", () => {
  beforeEach(() => {
  });

  it("LokiOperatorPackage (js) works as expected", () => {
    expect(LokiOperatorPackageMap["js"].$eq(true, true)).toEqual(true);
    expect(LokiOperatorPackageMap["js"].$eq(true, false)).toEqual(false);
    expect(LokiOperatorPackageMap["js"].$eq(5, "5")).toEqual(false);
    expect(LokiOperatorPackageMap["js"].$eq(null, null)).toEqual(true);
    expect(LokiOperatorPackageMap["js"].$eq(null, undefined)).toEqual(false);
    expect(LokiOperatorPackageMap["js"].$eq(undefined, undefined)).toEqual(true);
    expect(LokiOperatorPackageMap["js"].$eq(new Date(2015), new Date(2015))).toEqual(false);

    expect(LokiOperatorPackageMap["js"].$ne(true, true)).toEqual(false);
    expect(LokiOperatorPackageMap["js"].$ne(true, false)).toEqual(true);

    expect(LokiOperatorPackageMap["js"].$in(4, [1, 3, 4])).toEqual(true);
    expect(LokiOperatorPackageMap["js"].$in(8, [1, 3, 4])).toEqual(false);

    expect(LokiOperatorPackageMap["js"].$nin(4, [1, 3, 4])).toEqual(false);
    expect(LokiOperatorPackageMap["js"].$nin(8, [1, 3, 4])).toEqual(true);

    expect(LokiOperatorPackageMap["js"].$gte(new Date(2015), new Date(2015))).toEqual(true);
    expect(LokiOperatorPackageMap["js"].$lt(5, 10)).toEqual(true);
    expect(LokiOperatorPackageMap["js"].$lt(10, 5)).toEqual(false);
    expect(LokiOperatorPackageMap["js"].$lte(5, 5)).toEqual(true);
    expect(LokiOperatorPackageMap["js"].$lte(10, 5)).toEqual(false);

    expect(LokiOperatorPackageMap["js"].$gte(new Date(2015), new Date(2015))).toEqual(true);
    expect(LokiOperatorPackageMap["js"].$gt(5, 10)).toEqual(false);
    expect(LokiOperatorPackageMap["js"].$gt(10, 5)).toEqual(true);
    expect(LokiOperatorPackageMap["js"].$gte(5, 5)).toEqual(true);
    expect(LokiOperatorPackageMap["js"].$gte(10, 5)).toEqual(true);
  });

  it("LokiAbstractOperatorPackage works as expected", () => {
    expect(LokiOperatorPackageMap["loki"].$eq(5, "5")).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$eq(null, undefined)).toEqual(true);

    expect(LokiOperatorPackageMap["loki"].$gte(null, null)).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$gt(undefined, undefined)).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$gte(undefined, undefined)).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$gt(0, 0)).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$gte(0, 0)).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$gt(new Date(2010), new Date(2015))).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$gte(new Date(2015), new Date(2015))).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$gt("14", 12)).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$gt(12, "14")).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$gt("10", 12)).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$gt(12, "10")).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$gt("test", 12)).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$gt(12, "test")).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$gt(12, 0)).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$gt(0, 12)).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$gt(12, "")).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$gt("", 12)).toEqual(false);

    expect(LokiOperatorPackageMap["loki"].$lt(false, false)).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$lte(false, false)).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$lt(true, false)).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$lt(true, true)).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$lte(true, true)).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$lt(null, null)).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$lte(null, null)).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$lt(undefined, undefined)).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$lte(undefined, undefined)).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$lt(-1, 0)).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$lt(0, 0)).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$lte(0, 0)).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$lt(1, 0)).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$lt(new Date(2010), new Date(2015))).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$lt(new Date(2015), new Date(2015))).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$lte(new Date(2015), new Date(2015))).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$lt("12", 14)).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$lt(14, "12")).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$lt("10", 12)).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$lt(12, "10")).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$lt("test", 12)).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$lt(12, "test")).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$lt(12, 0)).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$lt(0, 12)).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$lt(12, "")).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$lt("", 12)).toEqual(true);
  });

  it ("user defined LokiOperatorPackage works as expected", () => {
    // simple inline class overriding some ops to work negatively
    class MyOperatorPackage extends LokiOperatorPackage {
      $gt(a: any, b: any): boolean {
        if (a < b) return true;
        return false;
      }

      $lt(a: any, b: any): boolean {
        if (a > b) return true;
        return false;
      }
    }

    // inject our new operator into global LokiOperatorPackageMap.
    // if it already exists, it will overwrite... this includes overriding native packages.
    let db = new Loki("test.db", {
      lokiOperatorPackageMap : {
        "MyOperatorPackage": new MyOperatorPackage()
      }
    });

    interface IMyDoc {
      a: number;
      b: number;
    }

    // for this collection, we will specify to use that operator package for its find ops
    let coll = db.addCollection<IMyDoc>("coll", {
      defaultLokiOperatorPackage: "MyOperatorPackage"
    });

    coll.insert([
      { a: 8, b: 2 },
      { a: 3, b: 7 },
      { a: 12, b: 1 },
      { a: 5, b: 11 },
      { a: 6, b: 8 },
      { a: 10, b: 6 },
      { a: 20, b: 15 }
    ]);

    // our $lt op override actually means gt, so find all docs greater than 9 sort largest to least (desc)
    let results = coll.chain().find({ a: { $lt: 9 } }).simplesort("a", { desc: true }).data();

    expect(results.length).toEqual(3);
    expect(results[0].a).toEqual(20);
    expect(results[1].a).toEqual(12);
    expect(results[2].a).toEqual(10);
  });

  it ("ComparatorOperatorPackage works as expected", () => {
    let customComparator: ILokiComparer<any> = (a: any, b: any) => {
      if (typeof a === "string" && typeof b === "string") {
        a = a.toLocaleLowerCase();
        b = b.toLocaleLowerCase();
      }

      if (a === b) return 0;
      if (a > b) return 1;
      return -1;
    };

    // we want to utilize our custom comparator withing ComparatorOperatorPackage
    // so we will extend it and instantiate with our own comparator
    class MyComparatorOperatorPackage extends ComparatorOperatorPackage<string> {}
    let myComparatorOperatorPackage = new MyComparatorOperatorPackage(customComparator);

    let db = new Loki("test.db", {
      lokiOperatorPackageMap: {
        "MyComparatorOperatorPackage": myComparatorOperatorPackage
      }
    });

    interface IMyDoc {
      name: string;
      num: number;
    }

    let coll = db.addCollection<IMyDoc>("coll", {
      defaultLokiOperatorPackage: "MyComparatorOperatorPackage"
    });

    coll.insert([
      { name: "a", num: 1 },
      { name: "B", num: 2 },
      { name: "c", num: 3 },
      { name: "D", num: 4 },
      { name: "e", num: 5 },
      { name: "F", num: 6 },
      { name: "g", num: 7 },
      { name: "h", num: 8 }
    ]);

    let results = coll.chain().find({ name : { $lte: "d" }}).simplesort("name").data();

    expect(results.length).toEqual(4);

    // our filtering used our case insensitive comparator, but or sort did not...
    // we could have mapped comparator into comparator map and set unindexedComparatorMap to use it...
    // see another unit test for how to do that
    expect(results[0].name).toEqual("B");
    expect(results[1].name).toEqual("D");
    expect(results[2].name).toEqual("a");
    expect(results[3].name).toEqual("c");

    // just making sure our in-op rewrite of variable tolowercase did not affect document
    expect(coll.findOne({ name: "B"}).num).toEqual(2);
  });

  it ("Comparator map + unindexSortComparator works as expected", () => {
    let customComparator: ILokiComparer<any> = (a: any, b: any) => {
      if (typeof a === "string" && typeof b === "string") {
        a = a.toLocaleLowerCase();
        b = b.toLocaleLowerCase();
      }

      if (a === b) return 0;
      if (a > b) return 1;
      return -1;
    };

    let db = new Loki("test.db", {
      comparatorMap: {
        "MyCustomComparator": customComparator
      }
    });

    interface IMyDoc {
      name: string;
      num: number;
    }

    let coll = db.addCollection<IMyDoc>("coll", {
      unindexedSortComparator: "MyCustomComparator"
    });

    coll.insert([
      { name: "g", num: 7 },
      { name: "a", num: 1 },
      { name: "e", num: 5 },
      { name: "B", num: 2 },
      { name: "D", num: 4 },
      { name: "F", num: 6 },
      { name: "h", num: 8 },
      { name: "c", num: 3 }
    ]);

    let results = coll.chain().simplesort("name").data();

    expect(results[0].name).toEqual("a");
    expect(results[1].name).toEqual("B");
    expect(results[2].name).toEqual("c");
    expect(results[3].name).toEqual("D");
    expect(results[4].name).toEqual("e");
    expect(results[5].name).toEqual("F");
    expect(results[6].name).toEqual("g");
    expect(results[7].name).toEqual("h");
  });
});
