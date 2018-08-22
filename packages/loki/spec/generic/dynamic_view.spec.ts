/* global describe, beforeEach, it, expect */
import { Loki } from "../../src/loki";
import { MemoryStorage } from "../../../memory-storage/src/memory_storage";
import { Collection } from "../../src/collection";
import { Doc } from "../../../common/types";
import { LokiOperatorPackageMap } from "../../src/operator_packages";

describe("dynamicviews", () => {
  interface User {
    name: string;
    owner?: string;
    maker?: string;
    age?: number;
    lang?: string;
  }

  let testRecords: User[];
  let db: Loki;
  let users: Collection<User>;
  let jonas: Doc<User>;

  beforeEach(() => {
    testRecords = [
      {name: "mjolnir", owner: "thor", maker: "dwarves"},
      {name: "gungnir", owner: "odin", maker: "elves"},
      {name: "tyrfing", owner: "Svafrlami", maker: "dwarves"},
      {name: "draupnir", owner: "odin", maker: "elves"}
    ];

    db = new Loki("test.json");
    users = db.addCollection<User>("user");

    users.insert({
      name: "dave",
      age: 25,
      lang: "English"
    });

    users.insert({
      name: "joe",
      age: 39,
      lang: "Italian"
    });

    jonas = users.insert({
      name: "jonas",
      age: 30,
      lang: "Swedish"
    });
  });

  function docCompare(a: Doc<User>, b: Doc<User>) {
    if (a.$loki < b.$loki) return -1;
    if (a.$loki > b.$loki) return 1;

    return 0;
  }

  describe("test empty filter across changes", () => {
    it("works", () => {

      const db = new Loki("dvtest");
      const items = db.addCollection<User>("users");
      items.insert(testRecords);
      const dv = items.addDynamicView("view");

      // with no filter, results should be all documents
      let results = dv.data();
      expect(results.length).toBe(4);

      // find and update a document which will notify view to re-evaluate
      const gungnir = items.findOne({"name": "gungnir"});
      expect(gungnir.owner).toBe("odin");
      gungnir.maker = "dvalin";
      items.update(gungnir);

      results = dv.data();
      expect(results.length).toBe(4);
    });
  });

  describe("dynamic view rematerialize works as expected", () => {
    it("works", () => {
      const db = new Loki("dvtest");
      const items = db.addCollection<User>("users");
      items.insert(testRecords);
      const dv = items.addDynamicView("view");

      dv.applyFind({"owner": "odin"});
      dv.applyWhere((obj: User) => obj.maker === "elves");

      expect(dv.data().length).toEqual(2);
      expect(dv["_filterPipeline"].length).toEqual(2);

      dv["_rematerialize"]({removeWhereFilters: true});
      expect(dv.data().length).toEqual(2);
      expect(dv["_filterPipeline"].length).toEqual(1);
    });
  });

  describe("dynamic view toJSON does not circularly reference", () => {
    it("works", () => {
      const db = new Loki("dvtest");
      const items = db.addCollection<User>("users");
      items.insert(testRecords);
      const dv = items.addDynamicView("view");

      const obj = dv.toJSON();
      expect(obj["_collection"]).toEqual(undefined);
    });
  });

  describe("dynamic view removeFilters works as expected", () => {
    it("works", () => {
      const db = new Loki("dvtest");
      const items = db.addCollection<User>("users");
      items.insert(testRecords);
      const dv = items.addDynamicView("ownr");
      dv.applyFind({"owner": "odin"});
      dv.applyWhere((obj: User) => obj.maker === "elves");

      expect(dv["_filterPipeline"].length).toEqual(2);
      expect(dv.data().length).toEqual(2);

      dv.removeFilters();
      expect(dv["_filterPipeline"].length).toEqual(0);
      expect(dv.count()).toEqual(4);
    });
  });

  describe("removeDynamicView works correctly", () => {
    it("works", () => {
      const db = new Loki("dvtest");
      const items = db.addCollection<User>("users");
      items.insert(testRecords);
      const dv = items.addDynamicView("ownr", {persistent: true});

      dv.applyFind({"owner": "odin"});
      dv.applyWhere((obj: User) => obj.maker === "elves");

      expect(items["_dynamicViews"].length).toEqual(1);

      items.removeDynamicView("ownr");
      expect(items["_dynamicViews"].length).toEqual(0);
    });
  });

  describe("stepEvaluateDocument", () => {
    it("works", () => {
      const view = users.addDynamicView("test");
      const query = {
        "age": {
          "$gt": 24
        }
      };

      view.applyFind(query);

      // churn evaluateDocuments() to make sure it works right
      jonas.age = 23;
      users.update(jonas);
      // evaluate documents
      expect(view.data().length).toEqual(users.count() - 1);
      jonas.age = 30;
      users.update(jonas);
      expect(view.data().length).toEqual(users.count());
      jonas.age = 23;
      users.update(jonas);
      expect(view.data().length).toEqual(users.count() - 1);
      jonas.age = 30;
      users.update(jonas);
      expect(view.data().length).toEqual(users.count());

      // assert set equality of docArrays irrelevant of sort/sequence
      const result1 = users.find(query).sort(docCompare);
      const result2 = view.data().sort(docCompare);
      result1.forEach((obj: Doc<User>) => {
        delete obj.meta;
      });
      result2.forEach((obj: Doc<User>) => {
        delete obj.meta;
      });

      expect(result1).toEqual(result2, "Result data Equality");
      expect(view["_resultSet"]).toEqual(view["_resultSet"].copy(), "View data equality");
      expect(view["_resultSet"] === view["_resultSet"].copy()).toBeFalsy("View data copy strict equality");

      return view;
    });
  });

  describe("stepDynamicViewPersistence", () => {
    it("works 1", () => {
      const query = {
        "age": {
          "$gt": 24
        }
      };

      // set up a persistent dynamic view with sort
      const pview = users.addDynamicView("test2", {
        persistent: true
      });
      pview.applyFind(query);
      pview.applySimpleSort("age");

      // the dynamic view depends on an internal ResultSet
      // the persistent dynamic view also depends on an internal resultdata data array
      // filteredrows should be applied immediately to ResultSet will be lazily built into resultdata later when data() is called
      expect(pview["_resultSet"]._filteredRows.length).toEqual(3, "dynamic view initialization 1");
      expect(pview["_resultData"].length).toEqual(0, "dynamic view initialization 2");

      // compare how many documents are in results before adding new ones
      const pviewResultsetLenBefore = pview["_resultSet"]._filteredRows.length;

      users.insert({
        name: "abc",
        age: 21,
        lang: "English"
      });

      users.insert({
        name: "def",
        age: 25,
        lang: "English"
      });

      // now see how many are in  (without rebuilding persistent view)
      const pviewResultsetLenAfter = pview["_resultSet"]._filteredRows.length;

      // only one document should have been added to ResultSet (1 was filtered out)
      expect(pviewResultsetLenBefore + 1).toEqual(pviewResultsetLenAfter, "dv ResultSet is valid");

      // Test sorting and lazy build of resultdata

      // retain copy of internal ResultSet's filteredrows before lazy sort
      const frcopy = pview["_resultSet"]._filteredRows.slice();
      pview.data();
      // now make a copy of internal result's filteredrows after lazy sort
      const frcopy2 = pview["_resultSet"]._filteredRows.slice();

      // verify filteredrows logically matches resultdata (irrelevant of sort)
      expect(frcopy2.length).not.toBe(0);
      for (let idxFR = 0; idxFR < frcopy2.length; idxFR++) {
        expect(pview["_resultData"][idxFR]).not.toBe(undefined);
        expect(pview["_resultData"][idxFR]).toEqual(pview["_collection"]._data[frcopy2[idxFR]],
          "dynamic view ResultSet/resultdata consistency");
      }
      // now verify they are not exactly equal (verify sort moved stuff)
      expect(frcopy).not.toEqual(frcopy2, "dynamic view sort");
    });


    it("works 2", () => {
      interface CR {
        index: string;
        a: number;
      }

      const test = db.addCollection<CR>("nodupes", {
        rangedIndexes: { index: {} }
      });

      const item = test.insert({
        index: "key",
        a: 1
      });

      let results = test.find({
        index: "key"
      });
      expect(results.length).toEqual(1, "one result exists");
      expect(results[0].a).toEqual(1, "the correct result is returned");


      item.a = 2;
      test.update(item);

      results = test.find({
        index: "key"
      });

      expect(results.length).toEqual(1, "one result exists");
      expect(results[0].a).toEqual(2, "the correct result is returned");
    });


    it("works 3", function testEmptyTableWithIndex() {
      const itc = db.addCollection<any>("test", {
        rangedIndexes: { testindex: {} }
      });

      const resultsNoIndex = itc.find({
        "testid": 2
      });
      expect(resultsNoIndex.length).toEqual(0);

      const resultsWithIndex = itc.find({
        "testindex": 4
      });
      //it("no results found", () => {
      expect(resultsWithIndex.length).toEqual(0);
      //});
    });

    it("works 4", (done) => {
      // mock persistence by using memory storage
      const mem = new MemoryStorage();
      const db = new Loki("testCollections");
      db.initializePersistence({adapter: mem})
        .then(() => {
          expect(db.filename).toEqual("testCollections");

          const t = db.addCollection<any>("test1", {
            transactional: true
          });
          db.addCollection("test2");
          // Throw error on wrong remove.
          expect(() => t.remove("foo")).toThrowErrorOfType("Error");
          // Throw error on non-synced doc
          expect(() => t.remove({
            name: "joe"
          })).toThrowErrorOfType("Error");

          expect(db.listCollections().length).toEqual(2);
          t.clear();
          const users = [{
            name: "joe"
          }, {
            name: "dave"
          }];
          t.insert(users);

          expect(2).toEqual(t.count());
          t.remove(users);
          expect(0).toEqual(t.count());

          class TestError implements Error {
            public name = "TestError";
            public message = "TestErrorMessage";
          }

          db["_autosaveEnable"]();
          db.on("close", () => {
            throw new TestError();
          });
          db.close().then(() => done.fail, done);
        });
    });
  });

  it("applySortCriteria", () => {
    const db = new Loki("dvtest.db");
    const coll = db.addCollection<User>("any");
    coll.insert([{
      name: "mjolnir",
      owner: "odin",
      maker: "dwarves",
    }, {
      name: "tyrfing",
      owner: "thor",
      maker: "dwarves",
    }, {
      name: "gungnir",
      owner: "odin",
      maker: "elves",
    }, {
      name: "draupnir",
      owner: "thor",
      maker: "elves",
    }]);
    const dv = coll.addDynamicView("test");

    let result = dv.applySortCriteria(["owner", "maker"]).data();
    expect(result).toEqual(dv.applySortCriteria([["owner", false], ["maker", false]]).data());
    expect(result.length).toBe(4);
    expect(result[0].name).toBe("mjolnir");
    expect(result[1].name).toBe("gungnir");
    expect(result[2].name).toBe("tyrfing");
    expect(result[3].name).toBe("draupnir");

    result = dv.applySortCriteria([["owner", false], ["maker", true]]).data();
    expect(result.length).toBe(4);
    expect(result[0].name).toBe("gungnir");
    expect(result[1].name).toBe("mjolnir");
    expect(result[2].name).toBe("draupnir");
    expect(result[3].name).toBe("tyrfing");

    result = dv.applySortCriteria([["owner", true], ["maker", false]]).data();
    expect(result.length).toBe(4);
    expect(result[0].name).toBe("tyrfing");
    expect(result[1].name).toBe("draupnir");
    expect(result[2].name).toBe("mjolnir");
    expect(result[3].name).toBe("gungnir");

    result = dv.applySortCriteria([["owner", true], ["maker", true]]).data();
    expect(result.length).toBe(4);
    expect(result[0].name).toBe("draupnir");
    expect(result[1].name).toBe("tyrfing");
    expect(result[2].name).toBe("gungnir");
    expect(result[3].name).toBe("mjolnir");

    result = dv.applySortCriteria(["maker", "owner"]).data();
    expect(result).toEqual(dv.applySortCriteria([["maker", false], ["owner", false]]).data());
    expect(result.length).toBe(4);
    expect(result[0].name).toBe("mjolnir");
    expect(result[1].name).toBe("tyrfing");
    expect(result[2].name).toBe("gungnir");
    expect(result[3].name).toBe("draupnir");

    result = dv.applySortCriteria([["maker", false], ["owner", true]]).data();
    expect(result.length).toBe(4);
    expect(result[0].name).toBe("tyrfing");
    expect(result[1].name).toBe("mjolnir");
    expect(result[2].name).toBe("draupnir");
    expect(result[3].name).toBe("gungnir");

    result = dv.applySortCriteria([["maker", true], ["owner", false]]).data();
    expect(result.length).toBe(4);
    expect(result[0].name).toBe("gungnir");
    expect(result[1].name).toBe("draupnir");
    expect(result[2].name).toBe("mjolnir");
    expect(result[3].name).toBe("tyrfing");

    result = dv.applySortCriteria([["maker", true], ["owner", true]]).data();
    expect(result.length).toBe(4);
    expect(result[0].name).toBe("draupnir");
    expect(result[1].name).toBe("gungnir");
    expect(result[2].name).toBe("tyrfing");
    expect(result[3].name).toBe("mjolnir");
  });

  describe("dynamic view simplesort options work correctly", () => {
    it("works", function () {
      const db = new Loki("dvtest.db");
      let coll = db.addCollection<{ a: number, b: number }>("colltest", {
        rangedIndexes: {
          a: {},  // uses default 'js' comparator
          b: {}   // uses default 'js' comparator
        }
      });

      // add basic dv with filter on a and basic simplesort on b
      let dv = coll.addDynamicView("dvtest");
      dv.applyFind({a: {$lte: 20}});
      dv.applySimpleSort("b");

      // data only needs to be inserted once since we are leaving collection intact while
      // building up and tearing down dynamic views within it
      coll.insert([{a: 1, b: 11}, {a: 2, b: 9}, {a: 8, b: 3}, {a: 6, b: 7}, {a: 2, b: 14}, {a: 22, b: 1}]);

      // test whether results are valid
      let results = dv.data();
      expect(results.length).toBe(5);
      for (let idx = 0; idx < results.length - 1; idx++) {
        expect(LokiOperatorPackageMap["js"].$lte(results[idx]["b"], results[idx + 1]["b"]));
      }

      // remove dynamic view
      coll.removeDynamicView("dvtest");
    });
  });
});
