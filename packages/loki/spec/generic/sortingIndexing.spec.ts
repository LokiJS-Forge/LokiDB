/* global describe, beforeEach, it, expect */
import { Loki } from "../../src/loki";
import { LokiOps } from "../../src/result_set";

describe("sorting and indexing", () => {
  let db: Loki;
  beforeEach(() => {
    db = new Loki("sortingIndexingTest");
  });

  it("ResultSet simplesort", () => {
    interface Sortable {
      a: number;
      b: number;
    }

    const rss = db.addCollection<Sortable>("rssort");

    rss.insert({ a: 4, b: 2 });
    rss.insert({ a: 7, b: 1 });
    rss.insert({ a: 3, b: 4 });
    rss.insert({ a: 9, b: 5 });

    const results = rss.chain().simplesort("a").data();
    expect(results[0].a).toBe(3);
    expect(results[1].a).toBe(4);
    expect(results[2].a).toBe(7);
    expect(results[3].a).toBe(9);
  });

  it("ResultSet simplesort descending", () => {
    interface Sortable {
      a: number;
      b: number;
    }

    const rss = db.addCollection<Sortable>("rssort");

    rss.insert({ a: 4, b: 2 });
    rss.insert({ a: 7, b: 1 });
    rss.insert({ a: 3, b: 4 });
    rss.insert({ a: 9, b: 5 });

    let results = rss.chain().simplesort("a", true).data();
    expect(results[0].a).toBe(9);
    expect(results[1].a).toBe(7);
    expect(results[2].a).toBe(4);
    expect(results[3].a).toBe(3);

    // test when indexed
    const rss2 = db.addCollection<Sortable>("rssort2", { indices: ["a"] });

    rss2.insert({ a: 4, b: 2 });
    rss2.insert({ a: 7, b: 1 });
    rss2.insert({ a: 3, b: 4 });
    rss2.insert({ a: 9, b: 5 });

    results = rss2.chain().simplesort("a", true).data();
    expect(results[0].a).toBe(9);
    expect(results[1].a).toBe(7);
    expect(results[2].a).toBe(4);
    expect(results[3].a).toBe(3);
  });

  it("ResultSet simplesort on nested properties", () => {
    interface Sortable {
      foo: {
        a: number;
        b: number;
      };
    }

    const rss = db.addCollection<Sortable, { "foo.a": number }>("rssort",
      {
        nestedProperties: ["foo.a"]
      });

    rss.insert({ foo: { a: 4, b: 2 } });
    rss.insert({ foo: { a: 7, b: 1 } });
    rss.insert({ foo: { a: 3, b: 4 } });
    rss.insert({ foo: { a: 9, b: 5 } });

    const results = rss.chain().simplesort("foo.a").data();
    expect(results[0].foo.a).toBe(3);
    expect(results[1].foo.a).toBe(4);
    expect(results[2].foo.a).toBe(7);
    expect(results[3].foo.a).toBe(9);
  });

  it("ResultSet simplesort with dates", () => {
    const now = new Date().getTime();
    const dt1 = new Date(now - 1000);
    const dt2 = new Date(now + 5000);
    const dt3 = new Date(2000, 6, 1);
    const dt4 = new Date(now + 2000);
    const dt5 = new Date(now - 3000);

    interface Sortable {
      a: number;
      b: Date;
    }

    const rss = db.addCollection<Sortable>("rssort");

    rss.insert({ a: 1, b: dt1 });
    rss.insert({ a: 2, b: dt2 });
    rss.insert({ a: 3, b: dt3 });
    rss.insert({ a: 4, b: dt4 });
    rss.insert({ a: 5, b: dt5 });

    const results = rss.chain().simplesort("b").data();
    expect(results[0].a).toBe(3);
    expect(results[1].a).toBe(5);
    expect(results[2].a).toBe(1);
    expect(results[3].a).toBe(4);
    expect(results[4].a).toBe(2);
  });

  it("ResultSet sort works correctly", () => {
    interface Sortable {
      a: number;
      b: number;
      c: string;
    }

    const db = new Loki("test.db");
    const coll = db.addCollection<Sortable>("coll");

    coll.insert([
      { a: 1, b: 9, c: "first" },
      { a: 5, b: 7, c: "second" },
      { a: 2, b: 9, c: "third" }
    ]);

    const sortfun = (obj1: Sortable, obj2: Sortable) => {
      if (obj1.a === obj2.a) return 0;
      if (obj1.a > obj2.a) return 1;
      return -1;
    };

    const result = coll.chain().sort(sortfun).data();
    expect(result.length).toEqual(3);
    expect(result[0].a).toEqual(1);
    expect(result[1].a).toEqual(2);
    expect(result[2].a).toEqual(5);
  });

  it("ResultSet compoundsort works correctly", () => {
    const db = new Loki("test.db");

    interface ABC {
      a: number;
      b: number;
      c: string;
    }

    const coll = db.addCollection<ABC>("coll");

    coll.insert([
      { a: 1, b: 9, c: "first" },
      { a: 5, b: 7, c: "second" },
      { a: 2, b: 9, c: "third" }
    ]);

    let result = coll.chain().compoundsort(["b", "c"]).data();
    expect(result.length).toEqual(3);
    expect(result[0].a).toEqual(5);
    expect(result[1].a).toEqual(1);
    expect(result[2].a).toEqual(2);

    result = coll.chain().compoundsort(["b", ["c", true]]).data();
    expect(result.length).toEqual(3);
    expect(result[0].a).toEqual(5);
    expect(result[1].a).toEqual(2);
    expect(result[2].a).toEqual(1);
  });

  it("ResultSet compoundsort on nested properties works correctly", () => {
    const db = new Loki("test.db");

    interface AZYBC {
      a: number;
      z: {
        y: {
          b: number;
          c: string;
        };
      };
    }

    const coll = db.addCollection<AZYBC, { "z.y.b": number, "z.y.c": number }>("coll",
      {
        nestedProperties: ["z.y.b", "z.y.c"]
      });

    coll.insert([
      { a: 1, z: { y: { b: 9, c: "first" } } },
      { a: 5, z: { y: { b: 7, c: "second" } } },
      {
        a: 2, z: { y: { b: 9, c: "third" } }
      }]);

    let result = coll.chain().compoundsort(["z.y.b", "z.y.c"]).data();
    expect(result.length).toEqual(3);
    expect(result[0].a).toEqual(5);
    expect(result[1].a).toEqual(1);
    expect(result[2].a).toEqual(2);

    result = coll.chain().compoundsort(["z.y.b", ["z.y.c", true]]).data();
    expect(result.length).toEqual(3);
    expect(result[0].a).toEqual(5);
    expect(result[1].a).toEqual(2);
    expect(result[2].a).toEqual(1);
  });

  describe("collection indexing", () => {
    it("mixed types sort as expected", () => {

      interface AB {
        a?: any;
        b?: any;
      }

      const coll = db.addCollection<AB>("coll");
      coll.insert({ a: undefined, b: 5 });
      coll.insert({ b: 5 });
      coll.insert({ a: null, b: 5 });
      coll.insert({ a: 7, b: 5 });
      coll.insert({ a: "7", b: 5 });
      coll.insert({ a: 7.0, b: 5 });
      coll.insert({ a: "11", b: 5 });
      coll.insert({ a: "4", b: 5 });
      coll.insert({ a: new Date(), b: 5 });
      coll.insert({ a: { ack: "object" }, b: 5 });
      coll.insert({ a: 7.5, b: 5 });
      coll.insert({ a: NaN, b: 5 });
      coll.insert({ a: [8, 1, 15], b: 5 });
      coll.insert({ a: "asdf", b: 5 });

      let indexVals: any[] = [];

      // make sure unindexed sort is as expected

      let result = coll.chain().simplesort("a").data();
      result.forEach((obj) => {
        indexVals.push(obj.a);
      });

      expect(indexVals.length).toEqual(14);

      // undefined, null, or NaN
      expect(indexVals[0] !== indexVals[0]).toEqual(true);
      expect(indexVals[1] == null).toEqual(true);
      expect(indexVals[2] == null).toEqual(true);
      expect(indexVals[3] == null).toEqual(true);

      expect(indexVals[4] === "4").toEqual(true);
      expect(indexVals[5] === "7" || indexVals[5] === 7).toEqual(true);
      expect(indexVals[6] === "7" || indexVals[5] === 7).toEqual(true);
      expect(indexVals[7] === "7" || indexVals[5] === 7).toEqual(true);
      expect(indexVals[8] === 7.5).toEqual(true);
      expect(indexVals[9] === "11").toEqual(true);
      expect(indexVals[10] instanceof Date).toEqual(true);
      expect(Array.isArray(indexVals[11])).toEqual(true);
      expect(typeof indexVals[12] === "object").toEqual(true);
      expect(indexVals[13] === "asdf").toEqual(true);

      // now make sure binary index uses same range
      coll.ensureIndex("a");

      indexVals = [];
      result = coll.chain().simplesort("a").data();
      result.forEach((obj) => {
        indexVals.push(obj.a);
      });

      expect(indexVals.length).toEqual(14);

      // undefined, null, or NaN
      expect(indexVals[0] !== indexVals[0]).toEqual(true);
      expect(indexVals[1] == null).toEqual(true);
      expect(indexVals[2] == null).toEqual(true);
      expect(indexVals[3] == null).toEqual(true);

      expect(indexVals[4] === "4").toEqual(true);
      expect(indexVals[5] === "7" || indexVals[5] === 7).toEqual(true);
      expect(indexVals[6] === "7" || indexVals[5] === 7).toEqual(true);
      expect(indexVals[7] === "7" || indexVals[5] === 7).toEqual(true);
      expect(indexVals[8] === 7.5).toEqual(true);
      expect(indexVals[9] === "11").toEqual(true);
      expect(indexVals[10] instanceof Date).toEqual(true);
      expect(Array.isArray(indexVals[11])).toEqual(true);
      expect(typeof indexVals[12] === "object").toEqual(true);
      expect(indexVals[13] === "asdf").toEqual(true);
    });

    it("date sort as expected", () => {
      const now = new Date().getTime();
      const dt1 = new Date(now - 1000);
      const dt2 = new Date(now + 5000);
      const dt3 = new Date(2000, 6, 1);
      const dt4 = new Date(now + 2000);
      const dt5 = new Date(now - 3000);

      interface Sortable {
        a: number;
        b: Date;
      }

      const cidx = db.addCollection<Sortable>("collidx", {
        rangedIndexes: { customId: {} }
      });

      cidx.insert({ a: 1, b: dt1 });
      cidx.insert({ a: 2, b: dt2 });
      cidx.insert({ a: 3, b: dt3 });
      cidx.insert({ a: 4, b: dt4 });
      cidx.insert({ a: 5, b: dt5 });

      // force index build while simultaneously testing date equality test
      let results = cidx.find({ "b": { $aeq: dt2 } });
      expect(results[0].a).toBe(2);

      // NOTE :
      // Binary Index imposes loose equality checks to construct its order
      // Strict equality checks would need to be extra filtering phase
      const sdt = new Date(now + 5000);

      // after refactoring binary indices to be loose equality/ranges everywhere,
      // this unit test passed, meaning the dteq op is not needed if binary index exists
      results = cidx.find({ "b": sdt });
      expect(results.length).toBe(0);

      // now try with new $dteq operator
      results = cidx.find({ "b": { "$dteq": sdt } });
      expect(results.length).toBe(1);
      expect(results[0].a).toBe(2);
    });
  });

  it("simplesort index intersect works correctly", () => {
    const db = new Loki("rss.db");
    const rss = db.addCollection<{ a: number, b: number }>("rssort", { indices: ["a", "b"] });

    rss.insert({ a: 4, b: 1 });
    rss.insert({ a: 7, b: 1 });
    rss.insert({ a: 3, b: 1 });
    rss.insert({ a: 9, b: 5 });
    rss.insert({ a: 14, b: 1 });
    rss.insert({ a: 17, b: 1 });
    rss.insert({ a: 13, b: 1 });
    rss.insert({ a: 19, b: 5 });

    // test explicit force index intercept simplesort code path
    let results = rss.chain().find({ b: 1 }).simplesort("a", { forceIndexIntersect: true }).data();
    expect(results.length).toBe(6);
    for (let i = 0; i < results.length - 1; i++) {
      expect(LokiOps.$lte(results[i]["a"], results[i + 1]["a"]));
    }

    // test explicit disable index intercept simplesort code path
    results = rss.chain().find({ b: 1 }).simplesort("a", { disableIndexIntersect: true }).data();
    expect(results.length).toBe(6);
    for (let i = 0; i < results.length - 1; i++) {
      expect(LokiOps.$lte(results[i]["a"], results[i + 1]["a"]));
    }

    // test 'smart' simplesort
    results = rss.chain().find({ b: 1 }).simplesort("a").data();
    expect(results.length).toBe(6);
    for (let i = 0; i < results.length - 1; i++) {
      expect(LokiOps.$lte(results[i]["a"], results[i + 1]["a"]));
    }
  });

  it("simplesort using javascript sorting works correctly", () => {
    const db = new Loki("rss.db");
    const rss = db.addCollection<{ a: number, b: number }>("rssort", { indices: ["a", "b"] });

    rss.insert({ a: 4, b: 1 });
    rss.insert({ a: 7, b: 1 });
    rss.insert({ a: 3, b: 1 });
    rss.insert({ a: 9, b: 5 });
    rss.insert({ a: 14, b: 1 });
    rss.insert({ a: 17, b: 1 });
    rss.insert({ a: 13, b: 1 });
    rss.insert({ a: 19, b: 5 });

    // test explicit force index intercept simplesort code path
    const results = rss.chain().find({ b: 1 }).simplesort("a", { useJavascriptSorting: true }).data();

    expect(results.length).toBe(6);
    for (let i = 0; i < results.length - 1; i++) {
      expect(LokiOps.$lte(results[i]["a"], results[i + 1]["a"]));
    }
  });
});
