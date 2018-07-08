/* global describe, beforeEach, it, expect */
import {Loki} from "../../src/loki";
import {MemoryStorage} from "../../../memory-storage/src/memory_storage";
import {Collection} from "../../src/collection";
import {StorageAdapter} from "../../../common/types";

interface AB {
  a: number;
  b: number;
}

interface Test {
  name: string;
  val: number;
}

interface User {
  name: string;
  owner?: string;
  maker?: string;
}

describe("testing unique index serialization", () => {
  let db: Loki;

  interface AUser {
    username: string;
  }

  let users: Collection<AUser>;
  beforeEach(() => {
    db = new Loki();
    users = db.addCollection<AUser>("users");
    users.insert([{
      username: "joe"
    }, {
      username: "jack"
    }, {
      username: "john"
    }, {
      username: "jim"
    }]);
    users.ensureUniqueIndex("username");
  });

  it("should have a unique index", () => {
    const ser = db.serialize(), reloaded = new Loki();
    reloaded.loadJSON(ser);
    const coll = reloaded.getCollection<AUser>("users");
    expect(coll.count()).toEqual(4);
    expect(coll._constraints.unique["username"]).toBeDefined();
    const joe = coll.by("username", "joe");
    expect(joe).toBeDefined();
    expect(joe.username).toEqual("joe");

    expect(reloaded["_serializationMethod"]).toBe("normal");
    expect(reloaded["_destructureDelimiter"]).toBe("$<\n");
  });
});

describe("testing nested binary index serialization", () => {
  let db: Loki;

  interface AUser {
    user: {
      id: number;
    };
  }

  interface Nested {
    "user.id": number;
  }

  let users: Collection<AUser, Nested>;
  beforeEach(() => {
    db = new Loki();
    users = db.addCollection<AUser, Nested>("users", {
      nestedProperties: ["user.id"],
      indices: ["user.id"],
    });
    users.insert([{
      user: {
        id: 1
      }
    }, {
      user: {
        id: 2
      }
    }, {
      user: {
        id: 3
      }
    }, {
      user: {
        id: 4
      }
    }]);
    users.ensureIndex("user.id");
  });

  it("should have a binary index", () => {
    const ser = db.serialize();
    const reloaded = new Loki();
    reloaded.loadJSON(ser);
    const coll = reloaded.getCollection<AUser, Nested>("users");
    expect(coll.count()).toEqual(4);
    expect(coll._binaryIndices["user.id"].values.length).toBe(4);
    const joe = coll.find({"user.id": 1})[0];
    expect(joe).toBeDefined();
    expect(joe.user.id).toEqual(1);

    expect(reloaded["_serializationMethod"]).toBe("normal");
    expect(reloaded["_destructureDelimiter"]).toBe("$<\n");
  });
});

describe("testing btree index serialization", function() {
  it("collection find ops on btree index work", (done) => {
    interface TestUserType {
       name: string;
       age: number;
       location: string;
    }

    const memAdapter = new MemoryStorage();
    const db = new Loki("idxtest");
    db.initializePersistence({adapter: memAdapter});

    const items = db.addCollection<TestUserType>("users", { 
       rangedIndexes: {
          name: { indexTypeName: "btree", comparatorName: "js" } 
       }
    });

    items.insert([
       { name: "patterson", age: 10, location: "a" },
       { name: "gilbertson", age: 20, location: "b" },
       { name: "smith", age: 30, location: "c" },
       { name: "donaldson", age: 40, location: "d" },
       { name: "harrison", age: 50, location: "e" },
       { name: "thompson", age: 60, location: "f" },
       { name: "albertson", age: 70, location: "g" },
       { name: "fiset", age: 80, location: "h" }
    ]);

    db.saveDatabase().then(() => {
      // now deserialize via loadDatabase() and ensure index is functional
      const db2 = new Loki("idxtest");
      db2.initializePersistence({adapter: memAdapter});
      db2.loadDatabase({}).then(() => {
        let items2 = db.getCollection<TestUserType>("users");

        // $eq
        let results: TestUserType[] = items2.find({ name: "donaldson" });
        expect(results.length).toEqual(1);
        expect(results[0].name).toEqual("donaldson");
        expect(results[0].age).toEqual(40);
        expect(results[0].location).toEqual("d");

        // $lt
        results = items2.find({ name: { $lt: "giraffe" } });
        expect(results.length).toEqual(4);
        expect(results[0].name).toEqual("albertson");
        expect(results[1].name).toEqual("donaldson");
        expect(results[2].name).toEqual("fiset");
        expect(results[3].name).toEqual("gilbertson");

        // $lte
        results = items2.find({ name: { $lte: "fiset" } });
        expect(results.length).toEqual(3);
        expect(results[0].name).toEqual("albertson");
        expect(results[1].name).toEqual("donaldson");
        expect(results[2].name).toEqual("fiset");

        // $gt
        results = items2.find({ name: { $gt: "giraffe" } });
        expect(results.length).toEqual(4);
        expect(results[0].name).toEqual("harrison");
        expect(results[1].name).toEqual("patterson");
        expect(results[2].name).toEqual("smith");
        expect(results[3].name).toEqual("thompson");

        // $gte
        results = items2.find({ name: { $gte: "patterson" } });
        expect(results.length).toEqual(3);
        expect(results[0].name).toEqual("patterson");
        expect(results[1].name).toEqual("smith");
        expect(results[2].name).toEqual("thompson");

        // $between
        results = items2.find({ name: { $between: ["faraday", "samuel"] } });
        expect(results.length).toEqual(4);
        expect(results[0].name).toEqual("fiset");
        expect(results[1].name).toEqual("gilbertson");
        expect(results[2].name).toEqual("harrison");
        expect(results[3].name).toEqual("patterson");

        done();
      });
    });
  });
});

describe("testing disable meta serialization", function () {
  it("should have meta disabled", function () {
    const db = new Loki();
    db.addCollection<User>("users", {disableMeta: true});

    const ser = db.serialize();
    const reloaded = new Loki();
    reloaded.loadJSON(ser);
    const coll = reloaded.getCollection("users");
    expect(coll["_disableMeta"]).toEqual(true);
  });
});

describe("testing destructured serialization/deserialization", () => {
  it("verify default (D) destructuring works as expected", () => {
    const ddb = new Loki("test.db", {serializationMethod: "destructured"});
    const coll = ddb.addCollection<Test>("testcoll");
    coll.insert({
      name: "test1",
      val: 100
    });
    coll.insert({
      name: "test2",
      val: 101
    });
    coll.insert({
      name: "test3",
      val: 102
    });

    const coll2 = ddb.addCollection<AB>("another");
    coll2.insert({
      a: 1,
      b: 2
    });

    const destructuredJson = ddb.serialize();

    const cddb = new Loki("test.db", {serializationMethod: "destructured"});
    cddb.loadJSON(destructuredJson);

    expect(cddb["_serializationMethod"]).toEqual("destructured");
    expect(cddb["_collections"].length).toEqual(2);
    expect(cddb["_collections"][0].count()).toEqual(3);
    expect(cddb["_collections"][0]._data[0]["val"]).toEqual(ddb["_collections"][0]._data[0]["val"]);
    expect(cddb["_collections"][1].count()).toEqual(1);
    expect(cddb["_collections"][1]._data[0]["a"]).toEqual(ddb["_collections"][1]._data[0]["a"]);
  });

  // Destructuring Formats :
  // D : one big Delimited string { partitioned: false, delimited : true }
  // DA : Delimited Array of strings [0] db [1] collection [n] collection { partitioned: true, delimited: true }
  // NDA : Non-Delimited Array : one iterable array with empty string collection partitions { partitioned: false, delimited: false }
  // NDAA : Non-Delimited Array with subArrays. db at [0] and collection subarrays at [n] { partitioned: true, delimited : false }

  it("verify custom destructuring works as expected", () => {
    const methods = ["D", "DA", "NDA", "NDAA"];
    let idx, options, result;
    let cddb;
    const ddb = new Loki("test.db");
    const coll = ddb.addCollection<Test>("testcoll");
    coll.insert({
      name: "test1",
      val: 100
    });
    coll.insert({
      name: "test2",
      val: 101
    });
    coll.insert({
      name: "test3",
      val: 102
    });

    const coll2 = ddb.addCollection<AB>("another");
    coll2.insert({
      a: 1,
      b: 2
    });

    for (idx = 0; idx < methods.length; idx++) {
      switch (methods[idx]) {
        case "D" :
          options = {partitioned: false, delimited: true};
          break;
        case "DA" :
          options = {partitioned: true, delimited: true};
          break;
        case "NDA" :
          options = {partitioned: false, delimited: false};
          break;
        case "NDAA" :
          options = {partitioned: true, delimited: false};
          break;
        default :
          options = {};
          break;
      }

      // do custom destructuring
      result = ddb.serializeDestructured(options);

      // reinflate from custom destructuring
      cddb = new Loki("test.db");
      const reinflatedDatabase = cddb.deserializeDestructured(result, options);
      cddb.loadJSONObject(reinflatedDatabase);

      // assert expectations on reinflated database
      expect(cddb["_collections"].length).toEqual(2);
      expect(cddb["_collections"][0]._data.length).toEqual(3);
      expect(cddb["_collections"][0]._data[0]["val"]).toEqual(ddb["_collections"][0]._data[0]["val"]);
      expect(cddb["_collections"][0]._data[0].$loki).toEqual(ddb["_collections"][0]._data[0].$loki);
      expect(cddb["_collections"][0]._data[2].$loki).toEqual(ddb["_collections"][0]._data[2].$loki);
      expect(cddb["_collections"][1].count()).toEqual(1);
      expect(cddb["_collections"][1]._data[0]["a"]).toEqual(ddb["_collections"][1]._data[0]["a"]);
    }
  });

  it("verify individual partitioning works correctly", () => {
    let result;
    let cddb;
    const ddb = new Loki("test.db");
    const coll = ddb.addCollection<Test>("testcoll");
    coll.insert({
      name: "test1",
      val: 100
    });
    coll.insert({
      name: "test2",
      val: 101
    });
    coll.insert({
      name: "test3",
      val: 102
    });

    const coll2 = ddb.addCollection<AB>("another");
    coll2.insert({
      a: 1,
      b: 2
    });

    // Verify db alone works correctly using NDAA format
    result = ddb.serializeDestructured({
      partitioned: true,
      delimited: false,
      partition: -1 // indicates to get serialized db container only
    });

    cddb = new Loki("test");
    cddb.loadJSON(result);

    expect(cddb["_collections"].length).toEqual(2);
    expect(cddb["_collections"][0].count()).toEqual(0);
    expect(cddb["_collections"][1].count()).toEqual(0);
    expect(cddb["_collections"][0].name).toEqual(ddb["_collections"][0]["name"]);
    expect(cddb["_collections"][1].name).toEqual(ddb["_collections"][1]["name"]);

    // Verify collection alone works correctly using NDAA format
    result = ddb.serializeDestructured({
      partitioned: true,
      delimited: false,
      partition: 0 // collection [0] only
    });

    // we dont need to test all components of reassembling whole database
    // so we will just call helper function to deserialize just collection data
    let data = ddb.deserializeCollection<Test>(result, {partitioned: true, delimited: false});

    expect(data.length).toEqual(ddb["_collections"][0].count());
    expect(data[0]["val"]).toEqual(ddb["_collections"][0]._data[0]["val"]);
    expect(data[1]["val"]).toEqual(ddb["_collections"][0]._data[1]["val"]);
    expect(data[2]["val"]).toEqual(ddb["_collections"][0]._data[2]["val"]);
    expect(data[0].$loki).toEqual(ddb["_collections"][0]._data[0].$loki);
    expect(data[1].$loki).toEqual(ddb["_collections"][0]._data[1].$loki);
    expect(data[2].$loki).toEqual(ddb["_collections"][0]._data[2].$loki);

    // Verify collection alone works correctly using DA format (the other partitioned format)
    result = ddb.serializeDestructured({
      partitioned: true,
      delimited: true,
      partition: 0 // collection [0] only
    });

    // now reinflate from that interim DA format
    data = ddb.deserializeCollection<Test>(result, {partitioned: true, delimited: true});

    expect(data.length).toEqual(ddb["_collections"][0].count());
    expect(data[0]["val"]).toEqual(ddb["_collections"][0]._data[0]["val"]);
    expect(data[1]["val"]).toEqual(ddb["_collections"][0]._data[1]["val"]);
    expect(data[2]["val"]).toEqual(ddb["_collections"][0]._data[2]["val"]);
    expect(data[0].$loki).toEqual(ddb["_collections"][0]._data[0].$loki);
    expect(data[1].$loki).toEqual(ddb["_collections"][0]._data[1].$loki);
    expect(data[2].$loki).toEqual(ddb["_collections"][0]._data[2].$loki);
  });

});

describe("testing adapter functionality", () => {
  it("verify basic memory storage functionality works", (done) => {
    const memAdapter = new MemoryStorage();
    const ddb = new Loki("test.db");

    ddb.initializePersistence({adapter: memAdapter});

    const coll = ddb.addCollection<Test>("testcoll");
    coll.insert({
      name: "test1",
      val: 100
    });
    coll.insert({
      name: "test2",
      val: 101
    });
    coll.insert({
      name: "test3",
      val: 102
    });

    const coll2 = ddb.addCollection<AB>("another");
    coll2.insert({
      a: 1,
      b: 2
    });
    let dv = coll2.addDynamicView("test");
    dv.applyFind({"a": 1});
    dv.data();

    const p1 = ddb.saveDatabase().then(() => {
      expect(memAdapter.hashStore.hasOwnProperty("test.db")).toEqual(true);
      expect(memAdapter.hashStore["test.db"].savecount).toEqual(1);
    });

    const cdb = new Loki("test.db");
    cdb.initializePersistence({adapter: memAdapter});

    const p2 = cdb.loadDatabase().then(() => {
      expect(cdb["_collections"].length).toEqual(2);
      expect(cdb.getCollection<Test>("testcoll").findOne({name: "test2"})["val"]).toEqual(101);
      expect(cdb["_collections"][0].count()).toEqual(3);
      expect(cdb["_collections"][1].count()).toEqual(1);
      expect(cdb.getCollection<AB>("another").getDynamicView("test").data()).toEqual(coll2.find({"a": 1}));
    });

    Promise.all([p1, p2]).then(done, done.fail);
  });

  it("verify loki deleteDatabase works", (done) => {
    const memAdapter = new MemoryStorage();
    const ddb = new Loki("test.db");
    ddb.initializePersistence({adapter: memAdapter});

    const coll = ddb.addCollection<Test>("testcoll");
    coll.insert({
      name: "test1",
      val: 100
    });
    coll.insert({
      name: "test2",
      val: 101
    });
    coll.insert({
      name: "test3",
      val: 102
    });

    ddb.saveDatabase().then(() => {
      expect(memAdapter.hashStore.hasOwnProperty("test.db")).toEqual(true);
      expect(memAdapter.hashStore["test.db"].savecount).toEqual(1);

      return ddb.deleteDatabase();
    }).then(() => {
      expect(memAdapter.hashStore.hasOwnProperty("test.db")).toEqual(false);
    }).then(done, done.fail);
  });

  it("verify reference adapters get db reference which is copy and serializable-safe", (done) => {
    // Current loki functionality with regards to reference mode adapters:
    // Since we don't use serializeReplacer on reference mode adapters, we make
    // lightweight clone, cloning only db container and collection containers (object refs are same).

    interface MN {
      m: number;
      n: number;
    }

    class MyFakeReferenceAdapter implements StorageAdapter {
      mode = "reference";

      loadDatabase(dbname: string) {
        expect(typeof(dbname)).toEqual("string");

        const result = new Loki("new db");
        const n1 = result.addCollection<MN>("n1");
        const n2 = result.addCollection<MN>("n2");
        n1.insert({m: 9, n: 8});
        n2.insert({m: 7, n: 6});

        return Promise.resolve(result);
      }

      saveDatabase() {
        return Promise.resolve();
      }

      deleteDatabase() {
        return Promise.resolve();
      }

      exportDatabase(dbname: string, dbref: Loki) {
        expect(typeof(dbname)).toEqual("string");
        expect(dbref.constructor.name).toEqual("Loki");

        expect(dbref["_persistenceAdapter"]).toEqual(null);
        expect(dbref["_collections"].length).toEqual(2);
        // these changes should not affect original database
        dbref["filename"] = "somethingelse";
        dbref["_collections"][0].name = "see1";
        return Promise.resolve();
      }
    }

    const adapter = new MyFakeReferenceAdapter();
    const db = new Loki("rma test");
    let db2: Loki;
    db.initializePersistence({adapter: adapter});
    const c1 = db.addCollection<AB>("c1");
    const c2 = db.addCollection<AB>("c2");
    c1.insert({a: 1, b: 2});
    c2.insert({a: 3, b: 4});

    db.saveDatabase().then(() => {
      expect(db["persistenceAdapter"]).not.toEqual(null);
      expect(db["filename"]).toEqual("rma test");
      expect(db["_collections"][0].name).toEqual("c1");
      expect(db.getCollection<AB>("c1").findOne({a: 1}).b).toEqual(2);

      db2 = new Loki("other name");
      db2.initializePersistence({adapter: adapter});

      return db2.loadDatabase();
    }).then(() => {
      expect(db2["_collections"].length).toEqual(2);
      expect(db2["_collections"][0].name).toEqual("n1");
      expect(db2["_collections"][1].name).toEqual("n2");
      expect(db2.getCollection<MN>("n1").findOne({m: 9}).n).toEqual(8);
    }).then(done, done.fail);
  });
});

describe("async adapter tests", () => {
  it("verify throttled async drain", (done) => {
    const mem = new MemoryStorage({asyncResponses: true, asyncTimeout: 50});
    const db = new Loki("sandbox.db");
    db.initializePersistence({adapter: mem, throttledSaves: true});

    // Add a collection to the database
    const items = db.addCollection<User>("items");
    items.insert({name: "mjolnir", owner: "thor", maker: "dwarves"});
    items.insert({name: "gungnir", owner: "odin", maker: "elves"});
    const tyr = items.insert({name: "tyrfing", owner: "Svafrlami", maker: "dwarves"});
    const drau = items.insert({name: "draupnir", owner: "odin", maker: "elves"});

    const another = db.addCollection<AB>("another");
    const ai = another.insert({a: 1, b: 2});

    // this should immediately kick off the first save
    db.saveDatabase();

    // the following saves (all async) should coalesce into one save
    ai.b = 3;
    another.update(ai);
    db.saveDatabase();

    tyr.owner = "arngrim";
    items.update(tyr);
    db.saveDatabase();

    drau.maker = "dwarves";
    items.update(drau);
    db.saveDatabase();

    db.throttledSaveDrain().then(() => {
      // Wait until saves are complete and then loading the database and make
      // sure all saves are complete and includes their changes
      const db2 = new Loki("sandbox.db");
      db2.initializePersistence({adapter: mem});

      db2.loadDatabase().then(() => {
        // total of 2 saves should have occurred
        expect(mem.hashStore["sandbox.db"].savecount).toEqual(2);

        // verify the saved database contains all expected changes
        expect(db2.getCollection<AB>("another").findOne({a: 1}).b).toEqual(3);
        expect(db2.getCollection<User>("items").findOne({name: "tyrfing"}).owner).toEqual("arngrim");
        expect(db2.getCollection<User>("items").findOne({name: "draupnir"}).maker).toEqual("dwarves");
        done();
      });
    });
  });

  it("verify throttledSaveDrain with duration timeout works", (done) => {
    const mem = new MemoryStorage({asyncResponses: true, asyncTimeout: 200});
    const db = new Loki("sandbox.db");
    db.initializePersistence({adapter: mem});

    // Add a collection to the database
    const items = db.addCollection<User>("items");
    items.insert({name: "mjolnir", owner: "thor", maker: "dwarves"});
    items.insert({name: "gungnir", owner: "odin", maker: "elves"});
    const tyr = items.insert({name: "tyrfing", owner: "Svafrlami", maker: "dwarves"});
    const drau = items.insert({name: "draupnir", owner: "odin", maker: "elves"});

    const another = db.addCollection<AB>("another");
    const ai = another.insert({a: 1, b: 2});

    // this should immediately kick off the first save (~200ms)
    db.saveDatabase();
    // now queue up a sequence to be run one after the other, at ~50ms each (~300ms total) when first completes
    ai.b = 3;
    another.update(ai);

    db.saveDatabase().then(() => {
      tyr.owner = "arngrim";
      items.update(tyr);

      return db.saveDatabase();
    }).then(() => {
      drau.maker = "dwarves";
      items.update(drau);

      return db.saveDatabase();
    });

    expect(db["_throttledSaveRunning"]).not.toEqual(null);
    expect(db["_throttledSavePending"]).not.toEqual(null);

    // we want this to fail so above they should be bootstrapping several
    // saves which take about 400ms to complete.
    // The full drain can take one save/callback cycle longer than duration (~200ms).
    db.throttledSaveDrain({recursiveWaitLimit: true, recursiveWaitLimitDuration: 200})
      .then(() => {
        expect(true).toEqual(false);
        done();
      }, () => {
        expect(true).toEqual(true);
        done();
      });
  });

  it("verify throttled async throttles", (done) => {
    const mem = new MemoryStorage({asyncResponses: true, asyncTimeout: 50});
    const db = new Loki("sandbox.db");
    db.initializePersistence({adapter: mem});

    // Add a collection to the database
    const items = db.addCollection<User>("items");
    items.insert({name: "mjolnir", owner: "thor", maker: "dwarves"});
    items.insert({name: "gungnir", owner: "odin", maker: "elves"});
    const tyr = items.insert({name: "tyrfing", owner: "Svafrlami", maker: "dwarves"});
    const drau = items.insert({name: "draupnir", owner: "odin", maker: "elves"});

    const another = db.addCollection<AB>("another");
    const ai = another.insert({a: 1, b: 2});

    // this should immediately kick off the first save
    db.saveDatabase();

    // the following saves (all async) should coalesce into one save
    ai.b = 3;
    another.update(ai);
    db.saveDatabase();

    tyr.owner = "arngrim";
    items.update(tyr);
    db.saveDatabase();

    drau.maker = "dwarves";
    items.update(drau);
    db.saveDatabase();

    // give all async saves time to complete and then verify outcome
    setTimeout(() => {
      // total of 2 saves should have occurred
      expect(mem.hashStore["sandbox.db"].savecount).toEqual(2);

      // verify the saved database contains all expected changes
      const db2 = new Loki("sandbox.db");
      db2.initializePersistence({adapter: mem});
      db2.loadDatabase().then(() => {
        expect(db2.getCollection<AB>("another").findOne({a: 1}).b).toEqual(3);
        expect(db2.getCollection<User>("items").findOne({name: "tyrfing"}).owner).toEqual("arngrim");
        expect(db2.getCollection<User>("items").findOne({name: "draupnir"}).maker).toEqual("dwarves");
        done();
      });
    }, 200);
  });

  it("verify there is no race condition with dirty-checking", (done) => {
    const mem = new MemoryStorage({asyncResponses: true, asyncTimeout: 50});
    const db = new Loki("sandbox.db");

    db.initializePersistence({adapter: mem});

    const items = db.addCollection<User & { foo?: string }>("items");
    items.insert({name: "mjolnir", owner: "thor", maker: "dwarves"});
    const gungnir = items.insert({name: "gungnir", owner: "odin", maker: "elves"});

    expect(db["_autosaveDirty"]()).toBe(true);

    db.saveDatabase().then(() => {
      // since an update happened after calling saveDatabase (but before save was commited), db should still be dirty
      expect(db["_autosaveDirty"]()).toBe(true);
      done();
    });

    // this happens immediately after saveDatabase is called
    gungnir.foo = "bar";
    items.update(gungnir);
  });

  it("verify loadDatabase in the middle of throttled saves will wait for  queue to drain first", (done) => {
    const mem = new MemoryStorage({asyncResponses: true, asyncTimeout: 75});
    const db = new Loki("sandbox.db");
    db.initializePersistence({adapter: mem});

    // Add a collection to the database
    const items = db.addCollection<User>("items");
    items.insert({name: "mjolnir", owner: "thor", maker: "dwarves"});
    items.insert({name: "gungnir", owner: "odin", maker: "elves"});
    const tyr = items.insert({name: "tyrfing", owner: "Svafrlami", maker: "dwarves"});
    const drau = items.insert({name: "draupnir", owner: "odin", maker: "elves"});

    const another = db.addCollection<AB>("another");
    const ai = another.insert({a: 1, b: 2});

    // this should immediately kick off the first save (~100ms)
    db.saveDatabase();

    // now queue up a sequence to be run one after the other, at ~50ms each (~300ms total) when first completes
    ai.b = 3;
    another.update(ai);
    db.saveDatabase().then(() => {
      tyr.owner = "arngrim";
      items.update(tyr);

      db.saveDatabase().then(() => {
        drau.maker = "dwarves";
        items.update(drau);

        db.saveDatabase();
      });
    });

    expect(db["_throttledSaveRunning"]).not.toEqual(null);
    expect(db["_throttledSavePending"]).not.toEqual(null);

    // at this point, several rounds of saves should be triggered...
    // a load at this scope (possibly simulating script run from different code path)
    // should wait until any pending saves are complete, then freeze saves (queue them ) while loading,
    // then re-enable saves
    db.loadDatabase().then(() => {

      expect(db.getCollection<AB>("another").findOne({a: 1}).b).toEqual(3);
      expect(db.getCollection<User>("items").findOne({name: "tyrfing"}).owner).toEqual("arngrim");
      expect(db.getCollection<User>("items").findOne({name: "draupnir"}).maker).toEqual("dwarves");
    });

    setTimeout(() => {
      done();
    }, 600);
  });
});

describe("autosave/autoload", () => {
  it("verify autosave works", (done) => {
    class DummyStorage implements StorageAdapter {

      public counter = 0;

      loadDatabase(_0: string): Promise<any> {
        return undefined;
      }

      saveDatabase(_0: string, _1: string): Promise<void> {
        this.counter++;
        return Promise.resolve();
      }
    }

    const dummyStorage = new DummyStorage();
    const db = new Loki("sandbox.db");
    const items = db.addCollection<User>("items");

    db.initializePersistence({adapter: dummyStorage, autosave: true, autosaveInterval: 1})
      .then(() => {
        items.insert({name: "mjolnir", owner: "thor", maker: "dwarves"});
        expect(dummyStorage.counter).toEqual(0);
        return new Promise(resolve => setTimeout(resolve, 2));
      })
      .then(() => {
        items.insert({name: "gungnir", owner: "odin", maker: "elves"});
        expect(dummyStorage.counter).toEqual(1);
        return new Promise(resolve => setTimeout(resolve, 2));
      })
      .then(() => {
        items.insert({name: "gungnir", owner: "odin", maker: "elves"});
        expect(dummyStorage.counter).toEqual(2);
        return db.close();
      })
      .then(() => {
        expect(dummyStorage.counter).toEqual(3);
      })
      .then(done)
      .catch(done.fail);
  });

  it("verify autosave with autoload works", (done) => {
    const mem = new MemoryStorage({asyncResponses: true, asyncTimeout: 1});
    const db = new Loki("sandbox.db");
    const db2 = new Loki("sandbox.db");
    const items = db.addCollection<User>("items");

    db.initializePersistence({adapter: mem, autosave: true, autosaveInterval: 1})
      .then(() => {
        items.insert({name: "mjolnir", owner: "thor", maker: "dwarves"});
        return new Promise(resolve => setTimeout(resolve, 2));
      })
      .then(() => {
        return db2.initializePersistence({adapter: mem, autoload: true});
      })
      .then(() => {
        expect(db2.getCollection("items")).toBeDefined();
        return db.close();
      })
      .then(done)
      .catch(done.fail);
  });
});

describe("testing changesAPI", () => {
  it("verify pending changes persist across save/load cycle", (done) => {
    const mem = new MemoryStorage();
    const db = new Loki("sandbox.db");
    let db2: Loki;
    db.initializePersistence({adapter: mem});

    // Add a collection to the database
    const items = db.addCollection<User>("items", {disableChangesApi: false});

    // Add some documents to the collection
    items.insert({name: "mjolnir", owner: "thor", maker: "dwarves"});
    items.insert({name: "gungnir", owner: "odin", maker: "elves"});
    items.insert({name: "tyrfing", owner: "Svafrlami", maker: "dwarves"});
    items.insert({name: "draupnir", owner: "odin", maker: "elves"});

    // Find and update an existing document
    const tyrfing = items.findOne({"name": "tyrfing"});
    tyrfing.owner = "arngrim";
    items.update(tyrfing);

    // memory storage is synchronous so i will not bother with callbacks
    db.saveDatabase().then(() => {
      db2 = new Loki("sandbox.db");
      db2.initializePersistence({adapter: mem});

      return db2.loadDatabase();
    }).then(() => {
      const result = JSON.parse(db2.serializeChanges());
      expect(result.length).toEqual(5);

      expect(result[0].name).toEqual("items");
      expect(result[0].operation).toEqual("I");
      expect(result[0].obj.name).toEqual("mjolnir");

      expect(result[4].name).toEqual("items");
      expect(result[4].operation).toEqual("U");
      expect(result[4].obj.name).toEqual("tyrfing");
    }).then(done, done.fail);
  });
});
