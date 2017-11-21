/* global describe, beforeEach, it, expect */
import {Loki} from "../../src/loki";
import {LokiMemoryAdapter} from "../../src/memory_adapter";
import {Collection} from "../../src/collection";
import SerializationMethod = Loki.SerializationMethod;
import {StorageAdapter} from "../../../common/types";

export type ANY = any;

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

  let users: Collection;
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
    expect(coll.data.length).toEqual(4);
    expect(coll.constraints.unique["username"]).toBeDefined();
    const joe = coll.by("username", "joe");
    expect(joe).toBeDefined();
    expect(joe.username).toEqual("joe");

    expect(reloaded["_serializationMethod"]).toBe(SerializationMethod.NORMAL);
    expect(reloaded["_destructureDelimiter"]).toBe("$<\n");
  });
});

describe("testing destructured serialization/deserialization", () => {
  it("verify default (D) destructuring works as expected", () => {
    const ddb = new Loki("test.db", {serializationMethod: SerializationMethod.DESTRUCTURED});
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

    const cddb = new Loki("test.db", {serializationMethod: SerializationMethod.DESTRUCTURED});
    cddb.loadJSON(destructuredJson);

    expect(cddb["_serializationMethod"]).toEqual(SerializationMethod.DESTRUCTURED);
    expect(cddb["_collections"].length).toEqual(2);
    expect(cddb["_collections"][0].data.length).toEqual(3);
    expect(cddb["_collections"][0].data[0]["val"]).toEqual(ddb["_collections"][0].data[0]["val"]);
    expect(cddb["_collections"][1].data.length).toEqual(1);
    expect(cddb["_collections"][1].data[0]["a"]).toEqual(ddb["_collections"][1].data[0]["a"]);
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
      expect(cddb["_collections"][0].data.length).toEqual(3);
      expect(cddb["_collections"][0].data[0]["val"]).toEqual(ddb["_collections"][0].data[0]["val"]);
      expect(cddb["_collections"][0].data[0].$loki).toEqual(ddb["_collections"][0].data[0].$loki);
      expect(cddb["_collections"][0].data[2].$loki).toEqual(ddb["_collections"][0].data[2].$loki);
      expect(cddb["_collections"][1].data.length).toEqual(1);
      expect(cddb["_collections"][1].data[0]["a"]).toEqual(ddb["_collections"][1].data[0]["a"]);
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
    expect(cddb["_collections"][0].data.length).toEqual(0);
    expect(cddb["_collections"][1].data.length).toEqual(0);
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
    let data: ANY = ddb.deserializeCollection<Test>(result, {partitioned: true, delimited: false});

    expect(data.length).toEqual(ddb["_collections"][0].data.length);
    expect(data[0]["val"]).toEqual(ddb["_collections"][0].data[0]["val"]);
    expect(data[1]["val"]).toEqual(ddb["_collections"][0].data[1]["val"]);
    expect(data[2]["val"]).toEqual(ddb["_collections"][0].data[2]["val"]);
    expect(data[0].$loki).toEqual(ddb["_collections"][0].data[0].$loki);
    expect(data[1].$loki).toEqual(ddb["_collections"][0].data[1].$loki);
    expect(data[2].$loki).toEqual(ddb["_collections"][0].data[2].$loki);

    // Verify collection alone works correctly using DA format (the other partitioned format)
    result = ddb.serializeDestructured({
      partitioned: true,
      delimited: true,
      partition: 0 // collection [0] only
    });

    // now reinflate from that interim DA format
    data = ddb.deserializeCollection<Test>(result, {partitioned: true, delimited: true});

    expect(data.length).toEqual(ddb["_collections"][0].data.length);
    expect(data[0]["val"]).toEqual(ddb["_collections"][0].data[0]["val"]);
    expect(data[1]["val"]).toEqual(ddb["_collections"][0].data[1]["val"]);
    expect(data[2]["val"]).toEqual(ddb["_collections"][0].data[2]["val"]);
    expect(data[0].$loki).toEqual(ddb["_collections"][0].data[0].$loki);
    expect(data[1].$loki).toEqual(ddb["_collections"][0].data[1].$loki);
    expect(data[2].$loki).toEqual(ddb["_collections"][0].data[2].$loki);
  });

});

describe("testing adapter functionality", () => {
  it("verify basic memory adapter functionality works", (done) => {
    const memAdapter = new LokiMemoryAdapter();
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
      expect(memAdapter["hashStore"].hasOwnProperty("test.db")).toEqual(true);
      expect(memAdapter["hashStore"]["test.db"].savecount).toEqual(1);
    });

    const cdb = new Loki("test.db");
    cdb.initializePersistence({adapter: memAdapter});

    const p2 = cdb.loadDatabase().then(() => {
      expect(cdb["_collections"].length).toEqual(2);
      expect(cdb.getCollection<Test>("testcoll").findOne({name: "test2"})["val"]).toEqual(101);
      expect(cdb["_collections"][0].data.length).toEqual(3);
      expect(cdb["_collections"][1].data.length).toEqual(1);
      expect(cdb.getCollection<AB>("another").getDynamicView("test").data()).toEqual(coll2.find({"a": 1}));
    });

    Promise.all([p1, p2]).then(done, done.fail);
  });

  it("verify loki deleteDatabase works", (done) => {
    const memAdapter = new LokiMemoryAdapter();
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
      expect(memAdapter["hashStore"].hasOwnProperty("test.db")).toEqual(true);
      expect(memAdapter["hashStore"]["test.db"].savecount).toEqual(1);

      return ddb.deleteDatabase();
    }).then(() => {
      expect(memAdapter["hashStore"].hasOwnProperty("test.db")).toEqual(false);
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

      deleteDatabase(name: string) {
        return Promise.resolve();
      }

      exportDatabase(dbname: string, dbref: Loki) {
        expect(typeof(dbname)).toEqual("string");
        expect(dbref.constructor.name).toEqual("Loki");

        expect(dbref["_persistenceAdapter"]).toEqual(null);
        expect(dbref["_collections"].length).toEqual(2);
        expect(dbref.getCollection<AB>("c1").findOne({a: 1}).b).toEqual(2);
        // these changes should not affect original database
        dbref["filename"] = "somethingelse";
        dbref["_collections"][0].name = "see1";
        // (accidentally?) updating a document should...
        dbref["_collections"][0].findOne({a: 1})["b"] = 3;
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
      expect(db.getCollection<AB>("c1").findOne({a: 1}).b).toEqual(3);

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
    const mem = new LokiMemoryAdapter({asyncResponses: true, asyncTimeout: 50});
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
        expect(mem["hashStore"]["sandbox.db"].savecount).toEqual(2);

        // verify the saved database contains all expected changes
        expect(db2.getCollection<AB>("another").findOne({a: 1}).b).toEqual(3);
        expect(db2.getCollection<User>("items").findOne({name: "tyrfing"}).owner).toEqual("arngrim");
        expect(db2.getCollection<User>("items").findOne({name: "draupnir"}).maker).toEqual("dwarves");
        done();
      });
    });
  });

  it("verify throttledSaveDrain with duration timeout works", (done) => {
    const mem = new LokiMemoryAdapter({asyncResponses: true, asyncTimeout: 200});
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
    const mem = new LokiMemoryAdapter({asyncResponses: true, asyncTimeout: 50});
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
      expect(mem["hashStore"]["sandbox.db"].savecount).toEqual(2);

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

  it("verify loadDatabase in the middle of throttled saves will wait for queue to drain first", (done) => {
    const mem = new LokiMemoryAdapter({asyncResponses: true, asyncTimeout: 75});
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

describe("testing changesAPI", () => {
  it("verify pending changes persist across save/load cycle", (done) => {
    const mem = new LokiMemoryAdapter();
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

    // memory adapter is synchronous so i will not bother with callbacks
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
