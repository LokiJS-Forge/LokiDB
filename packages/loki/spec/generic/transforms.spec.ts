/* global describe, beforeEach, it, expect */
import {Loki} from "../../src/loki";
import {Collection} from "../../src/collection";
import Transform = Collection.Transform;
import {Doc} from "../../../common/types";

describe("transforms", () => {
  interface User {
    name: string;
    owner?: string;
    maker?: string;
  }

  let db: Loki;
  let items: Collection<User>;

  beforeEach(() => {
    db = new Loki("transformTest");
    items = db.addCollection<User>("items");

    items.insert({name: "mjolnir", owner: "thor", maker: "dwarves"});
    items.insert({name: "gungnir", owner: "odin", maker: "elves"});
    items.insert({name: "tyrfing", owner: "Svafrlami", maker: "dwarves"});
    items.insert({name: "draupnir", owner: "odin", maker: "elves"});
  });

  describe("basic find transform", () => {
    it("works", () => {

      const tx: Transform<User>[] = [
        {
          type: "find",
          value: {
            owner: "odin"
          }
        }
      ];

      const results = items.chain(tx).data();

      expect(results.length).toBe(2);
    });
  });

  describe("basic multi-step transform", () => {
    it("works", () => {

      const tx: Transform<User>[] = [
        {
          type: "find",
          value: {
            owner: "odin"
          }
        },
        {
          type: "where",
          value: function (obj: User) {
            return (obj.name.indexOf("drau") !== -1);
          }
        }
      ];

      const results = items.chain(tx).data();

      expect(results.length).toBe(1);
    });
  });

  describe("parameterized find", () => {
    it("works", () => {

      const tx: Transform<User>[] = [
        {
          type: "find",
          value: {
            owner: "[%lktxp]OwnerName"
          }
        }
      ];

      const params = {
        OwnerName: "odin"
      };

      const results = items.chain(tx, params).data();

      expect(results.length).toBe(2);
    });
  });

  describe("parameterized transform with non-serializable non-params", function () {
    it("works", function () {

      interface Person {
        name: string;
        age: number;
      }


      const db = new Loki("tx.db");
      const items = db.addCollection<Person>("items");

      items.insert({name: "mjolnir", age: 5});
      items.insert({name: "tyrfing", age: 9});

      let mapper = function (item: Person) {
        return item.age;
      };

      let averageReduceFunction = function (values: number[]) {
        let sum = 0;

        values.forEach(function (i) {
          sum += i;
        });

        return sum / values.length;
      };

      // so ideally, transform params are useful for
      // - extracting values that will change across multiple executions, and also
      // - extracting values which are not serializable so that the transform can be
      //   named and serialized along with the database.
      //
      // The transform used here is not serializable so this test is just to verify
      // that our parameter substitution method does not have problem with
      // non-serializable transforms.

      let tx1: Transform<Person>[] = [
        {
          type: "mapReduce",
          mapFunction: mapper,
          reduceFunction: averageReduceFunction
        }
      ];

      let tx2: Transform[] = [
        {
          type: "find",
          value: {
            age: {
              "$gt": "[%lktxp]minimumAge"
            },
          }
        },
        {
          type: "mapReduce",
          mapFunction: mapper,
          reduceFunction: averageReduceFunction
        }
      ] as any;

      // no data() call needed to mapReduce
      expect(items.chain(tx1) as any as number).toBe(7);
      expect(items.chain(tx1, {foo: 5}) as any as number).toBe(7);
      // params will cause a recursive shallow clone of objects before substitution
      expect(items.chain(tx2, {minimumAge: 4}) as any as number).toBe(7);

      // make sure original transform is unchanged
      expect(tx2[0].type).toEqual("find");
      expect(tx2[0]["value"].age.$gt).toEqual("[%lktxp]minimumAge");
      expect(tx2[1].type).toEqual("mapReduce");
      expect(typeof tx2[1]["mapFunction"]).toEqual("function");
      expect(typeof tx2[1]["reduceFunction"]).toEqual("function");
    });
  });

  describe("parameterized where", () => {
    it("works", () => {

      const tx: Transform<User>[] = [
        {
          type: "where",
          value: "[%lktxp]NameFilter"
        }
      ];

      const params = {
        NameFilter: function (obj: User) {
          return (obj.name.indexOf("nir") !== -1);
        }
      };

      const results = items.chain(tx, params).data();

      expect(results.length).toBe(3);
    });
  });

  describe("named find transform", () => {
    it("works", () => {

      const tx: Transform<User>[] = [
        {
          type: "find",
          value: {
            owner: "[%lktxp]OwnerName"
          }
        }
      ];

      items.addTransform("OwnerLookup", tx);

      const params = {
        OwnerName: "odin"
      };

      const results = items.chain("OwnerLookup", params).data();

      expect(results.length).toBe(2);
    });
  });

  describe("dynamic view named transform", () => {
    it("works", () => {
      interface AB {
        a: string;
        b: number;
      }

      const testColl = db.addCollection<AB>("test");

      testColl.insert({
        a: "first",
        b: 1
      });

      testColl.insert({
        a: "second",
        b: 2
      });

      testColl.insert({
        a: "third",
        b: 3
      });

      testColl.insert({
        a: "fourth",
        b: 4
      });

      testColl.insert({
        a: "fifth",
        b: 5
      });

      testColl.insert({
        a: "sixth",
        b: 6
      });

      testColl.insert({
        a: "seventh",
        b: 7
      });

      testColl.insert({
        a: "eighth",
        b: 8
      });

      // our view should allow only first 4 test records
      const dv = testColl.addDynamicView("lower");
      dv.applyFind({b: {"$lte": 4}});

      // our transform will desc sort string column as 'third', 'second', 'fourth', 'first',
      // and then limit to first two
      const tx: Transform<AB>[] = [
        {
          type: "simplesort",
          property: "a",
          options: true
        },
        {
          type: "limit",
          value: 2
        }
      ];

      expect(dv.branchResultSet(tx).data().length).toBe(2);

      // now store as named (collection) transform and run off dynamic view
      testColl.addTransform("desc4limit2", tx);

      const results = dv.branchResultSet("desc4limit2").data();
      expect(results.length).toBe(2);
      expect(results[0].a).toBe("third");
      expect(results[1].a).toBe("second");

    });
  });
  describe("eqJoin step with dataOptions works", function () {
    it("works", () => {
      const db1 = new Loki("testJoins");

      interface Director {
        name: string;
        directorId: number;
      }

      interface Film {
        title: string;
        filmId: number;
        directorId: number;
      }

      const directors = db1.addCollection<Director>("directors");
      const films = db1.addCollection<Film>("films");

      directors.insert([
        {name: "Martin Scorsese", directorId: 1},
        {name: "Francis Ford Coppola", directorId: 2},
        {name: "Steven Spielberg", directorId: 3},
        {name: "Quentin Tarantino", directorId: 4}
      ]);

      films.insert([
        {title: "Taxi", filmId: 1, directorId: 1},
        {title: "Raging Bull", filmId: 2, directorId: 1},
        {title: "The Godfather", filmId: 3, directorId: 2},
        {title: "Jaws", filmId: 4, directorId: 3},
        {title: "ET", filmId: 5, directorId: 3},
        {title: "Raiders of the Lost Ark", filmId: 6, directorId: 3}
      ]);

      // Since our collection options do not specify cloning, this is only safe
      // because we have cloned internal objects with dataOptions before modifying them.
      function fdmap(left: object, right: object) {
        // PhantomJS does not support es6 Object.assign
        //left = Object.assign(left, right);
        Object.keys(right).forEach((key) => {
          left[key] = right[key];
        });
        return left;
      }

      // The 'joinData' in this instance is a Collection which we will call
      //   data() on with the specified (optional) dataOptions on.
      //   It could also be a ResultSet or data array.
      // Our left side ResultSet which this transform is executed on will also
      //   call data() with specified (optional) dataOptions.
      films.addTransform("filmdirect", [
        {
          type: "eqJoin",
          joinData: directors,
          leftJoinKey: "directorId",
          rightJoinKey: "directorId",
          mapFun: fdmap,
          dataOptions: {removeMeta: true}
        }
      ]);

      // Although we removed all meta, the eqjoin inserts the resulting objects
      // into a new volatile collection which would adds its own meta and loki.
      // We don't care about these useless volatile data so grab results without it.
      const results = films.chain("filmdirect").data({removeMeta: true}) as any as (Director & Film)[];

      expect(results.length).toEqual(6);
      expect(results[0].title).toEqual("Taxi");
      expect(results[0].name).toEqual("Martin Scorsese");
      expect(results[5].title).toEqual("Raiders of the Lost Ark");
      expect(results[5].name).toEqual("Steven Spielberg");
      results.forEach((obj) => {
        expect(Object.keys(obj).length).toEqual(4);
      });
    });
  });

  describe("map step with dataOptions works", function () {
    it("works", () => {
      const db1 = new Loki("testJoins");

      interface C1 {
        a: number;
        b: number;
        c?: number;
      }

      const c1 = db1.addCollection<C1>("c1");
      c1.insert([
        {a: 1, b: 9},
        {a: 2, b: 8},
        {a: 3, b: 7},
        {a: 4, b: 6}
      ]);

      // only safe because our 'removeMeta' option will clone objects passed in
      function graftMap(obj: C1) {
        obj.c = obj.b - obj.a;
        return obj;
      }

      const tx: Transform<C1>[] = [{
        type: "map",
        value: graftMap,
        dataOptions: {removeMeta: true}
      }];

      const results = c1.chain(tx).data({removeMeta: true});

      expect(results.length).toEqual(4);
      expect(results[0].a).toEqual(1);
      expect(results[0].b).toEqual(9);
      expect(results[0].c).toEqual(8);
      expect(results[3].a).toEqual(4);
      expect(results[3].b).toEqual(6);
      expect(results[3].c).toEqual(2);
      results.forEach((obj) => {
        expect(Object.keys(obj).length).toEqual(3);
      });
    });
  });
});
