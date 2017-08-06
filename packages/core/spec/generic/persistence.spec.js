/* global describe, it, expect, beforeEach */
import {Loki as loki} from '../../src/loki';
import {LokiMemoryAdapter} from '../../src/memory_adapter';
import {LokiPartitioningAdapter} from '../../src/partitioning_adapter';

describe('testing unique index serialization', () => {
  let db, users;
  beforeEach(() => {
    db = new loki();
    users = db.addCollection('users');
    users.insert([{
      username: 'joe'
    }, {
      username: 'jack'
    }, {
      username: 'john'
    }, {
      username: 'jim'
    }]);
    users.ensureUniqueIndex('username');
  });

  it('should have a unique index', () => {
    const ser = db.serialize(), reloaded = new loki();
    const loaded = reloaded.loadJSON(ser);
    const coll = reloaded.getCollection('users');
    expect(coll.data.length).toEqual(4);
    expect(coll.constraints.unique.username).toBeDefined();
    const joe = coll.by('username', 'joe');
    expect(joe).toBeDefined();
    expect(joe.username).toEqual('joe');

    expect(reloaded.options.serializationMethod).toBe("normal");
    expect(reloaded.options.destructureDelimiter).toBe("$<\n");
  });
});

describe('testing destructured serialization/deserialization', () => {
  it('verify default (D) destructuring works as expected', () => {
    const ddb = new loki("test.db", {serializationMethod: "destructured"});
    const coll = ddb.addCollection("testcoll");
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

    const coll2 = ddb.addCollection("another");
    coll2.insert({
      a: 1,
      b: 2
    });

    const destructuredJson = ddb.serialize();

    const cddb = new loki("test.db", {serializationMethod: "destructured"});
    cddb.loadJSON(destructuredJson);

    expect(cddb.options.serializationMethod).toEqual("destructured");
    expect(cddb.collections.length).toEqual(2);
    expect(cddb.collections[0].data.length).toEqual(3);
    expect(cddb.collections[0].data[0].val).toEqual(ddb.collections[0].data[0].val);
    expect(cddb.collections[1].data.length).toEqual(1);
    expect(cddb.collections[1].data[0].a).toEqual(ddb.collections[1].data[0].a);
  });

  // Destructuring Formats :
  // D : one big Delimited string { partitioned: false, delimited : true }
  // DA : Delimited Array of strings [0] db [1] collection [n] collection { partitioned: true, delimited: true }
  // NDA : Non-Delimited Array : one iterable array with empty string collection partitions { partitioned: false, delimited: false }
  // NDAA : Non-Delimited Array with subArrays. db at [0] and collection subarrays at [n] { partitioned: true, delimited : false }

  it('verify custom destructuring works as expected', () => {
    const methods = ['D', 'DA', 'NDA', 'NDAA'];
    let idx, options, result;
    let cddb;
    const ddb = new loki("test.db");
    const coll = ddb.addCollection("testcoll");
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

    const coll2 = ddb.addCollection("another");
    coll2.insert({
      a: 1,
      b: 2
    });

    for (idx = 0; idx < methods.length; idx++) {
      switch (idx) {
        case 'D' :
          options = {partitioned: false, delimited: true};
          break;
        case 'DA' :
          options = {partitioned: true, delimited: true};
          break;
        case 'NDA' :
          options = {partitioned: false, delimited: false};
          break;
        case 'NDAA' :
          options = {partitioned: true, delimited: false};
          break;
        default :
          options = {};
          break;
      }

      // do custom destructuring
      result = ddb.serializeDestructured(options);

      // reinflate from custom destructuring
      cddb = new loki("test.db");
      const reinflatedDatabase = cddb.deserializeDestructured(result, options);
      cddb.loadJSONObject(reinflatedDatabase);

      // assert expectations on reinflated database
      expect(cddb.collections.length).toEqual(2);
      expect(cddb.collections[0].data.length).toEqual(3);
      expect(cddb.collections[0].data[0].val).toEqual(ddb.collections[0].data[0].val);
      expect(cddb.collections[0].data[0].$loki).toEqual(ddb.collections[0].data[0].$loki);
      expect(cddb.collections[0].data[2].$loki).toEqual(ddb.collections[0].data[2].$loki);
      expect(cddb.collections[1].data.length).toEqual(1);
      expect(cddb.collections[1].data[0].a).toEqual(ddb.collections[1].data[0].a);
    }
  });

  it('verify individual partitioning works correctly', () => {
    let idx, options, result;
    let cddb;
    const ddb = new loki("test.db");
    const coll = ddb.addCollection("testcoll");
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

    const coll2 = ddb.addCollection("another");
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

    cddb = new loki('test');
    cddb.loadJSON(result);

    expect(cddb.collections.length).toEqual(2);
    expect(cddb.collections[0].data.length).toEqual(0);
    expect(cddb.collections[1].data.length).toEqual(0);
    expect(cddb.collections[0].name).toEqual(ddb.collections[0].name);
    expect(cddb.collections[1].name).toEqual(ddb.collections[1].name);

    // Verify collection alone works correctly using NDAA format
    result = ddb.serializeDestructured({
      partitioned: true,
      delimited: false,
      partition: 0 // collection [0] only
    });

    // we dont need to test all components of reassembling whole database
    // so we will just call helper function to deserialize just collection data
    let data = ddb.deserializeCollection(result, {partitioned: true, delimited: false});

    expect(data.length).toEqual(ddb.collections[0].data.length);
    expect(data[0].val).toEqual(ddb.collections[0].data[0].val);
    expect(data[1].val).toEqual(ddb.collections[0].data[1].val);
    expect(data[2].val).toEqual(ddb.collections[0].data[2].val);
    expect(data[0].$loki).toEqual(ddb.collections[0].data[0].$loki);
    expect(data[1].$loki).toEqual(ddb.collections[0].data[1].$loki);
    expect(data[2].$loki).toEqual(ddb.collections[0].data[2].$loki);

    // Verify collection alone works correctly using DA format (the other partitioned format)
    result = ddb.serializeDestructured({
      partitioned: true,
      delimited: true,
      partition: 0 // collection [0] only
    });

    // now reinflate from that interim DA format
    data = ddb.deserializeCollection(result, {partitioned: true, delimited: true});

    expect(data.length).toEqual(ddb.collections[0].data.length);
    expect(data[0].val).toEqual(ddb.collections[0].data[0].val);
    expect(data[1].val).toEqual(ddb.collections[0].data[1].val);
    expect(data[2].val).toEqual(ddb.collections[0].data[2].val);
    expect(data[0].$loki).toEqual(ddb.collections[0].data[0].$loki);
    expect(data[1].$loki).toEqual(ddb.collections[0].data[1].$loki);
    expect(data[2].$loki).toEqual(ddb.collections[0].data[2].$loki);
  });

});

describe('testing adapter functionality', () => {
  it('verify basic memory adapter functionality works', (done) => {
    let idx, options, result;

    const memAdapter = new LokiMemoryAdapter();
    const ddb = new loki("test.db");

    ddb.initializePersistence({adapter: memAdapter});

    const coll = ddb.addCollection("testcoll");
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

    const coll2 = ddb.addCollection("another");
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

    const cdb = new loki("test.db");
    cdb.initializePersistence({adapter: memAdapter});

    const p2 = cdb.loadDatabase().then(() => {
      expect(cdb.collections.length).toEqual(2);
      expect(cdb.getCollection("testcoll").findOne({name: "test2"}).val).toEqual(101);
      expect(cdb.collections[0].data.length).toEqual(3);
      expect(cdb.collections[1].data.length).toEqual(1);
      expect(cdb.getCollection("another").getDynamicView("test").data()).toEqual(coll2.find({"a": 1}));
    });

    Promise.all([p1, p2]).then(done, done.fail);
  });

  it('verify loki deleteDatabase works', (done) => {
    const memAdapter = new LokiMemoryAdapter();
    const ddb = new loki("test.db");
    ddb.initializePersistence({adapter: memAdapter});

    const coll = ddb.addCollection("testcoll");
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

  it('verify partioning adapter works', (done) => {
    const mem = new LokiMemoryAdapter();
    const adapter = new LokiPartitioningAdapter(mem);

    const db = new loki('sandbox.db');
    let db2;

    db.initializePersistence({adapter: adapter});

    // Add a collection to the database
    const items = db.addCollection('items');
    items.insert({name: 'mjolnir', owner: 'thor', maker: 'dwarves'});
    items.insert({name: 'gungnir', owner: 'odin', maker: 'elves'});
    items.insert({name: 'tyrfing', owner: 'Svafrlami', maker: 'dwarves'});
    items.insert({name: 'draupnir', owner: 'odin', maker: 'elves'});

    const another = db.addCollection('another');
    const ai = another.insert({a: 1, b: 2});

    db.saveDatabase().then(() => {
      // should have partitioned the data
      expect(Object.keys(mem.hashStore).length).toEqual(3);
      expect(mem.hashStore.hasOwnProperty("sandbox.db")).toEqual(true);
      expect(mem.hashStore.hasOwnProperty("sandbox.db.0")).toEqual(true);
      expect(mem.hashStore.hasOwnProperty("sandbox.db.1")).toEqual(true);
      // all partitions should have been saved once each
      expect(mem.hashStore["sandbox.db"].savecount).toEqual(1);
      expect(mem.hashStore["sandbox.db.0"].savecount).toEqual(1);
      expect(mem.hashStore["sandbox.db.1"].savecount).toEqual(1);

      // so let's go ahead and update one of our collections to make it dirty
      ai.b = 3;
      another.update(ai);

      // and save again to ensure lastsave is different on for db container and that one collection
      return db.saveDatabase();
    }).then(() => {
      // db container always gets saved since we currently have no 'dirty' flag on it to check
      expect(mem.hashStore["sandbox.db"].savecount).toEqual(2);
      // we didn't change this
      expect(mem.hashStore["sandbox.db.0"].savecount).toEqual(1);
      // we updated this collection so it should have been saved again
      expect(mem.hashStore["sandbox.db.1"].savecount).toEqual(2);

      // ok now lets load from it
      db2 = new loki('sandbox.db');

      db2.initializePersistence({adapter: adapter});

      return db2.loadDatabase();
    }).then(() => {
      expect(db2.collections.length).toEqual(2);
      expect(db2.collections[0].data.length).toEqual(4);
      expect(db2.collections[1].data.length).toEqual(1);
      expect(db2.getCollection("items").findOne({name: 'gungnir'}).owner).toEqual("odin");
      expect(db2.getCollection("another").findOne({a: 1}).b).toEqual(3);
    }).then(done, done.fail);
  });

  it('verify partioning adapter with paging mode enabled works', (done) => {
    const mem = new LokiMemoryAdapter();

    // we will use an exceptionally low page size (128bytes) to test with small dataset
    const adapter = new LokiPartitioningAdapter(mem, {paging: true, pageSize: 128});

    const db = new loki('sandbox.db');
    let db2;

    db.initializePersistence({adapter: adapter});

    // Add a collection to the database
    const items = db.addCollection('items');
    items.insert({name: 'mjolnir', owner: 'thor', maker: 'dwarves'});
    items.insert({name: 'gungnir', owner: 'odin', maker: 'elves'});
    const tyr = items.insert({name: 'tyrfing', owner: 'Svafrlami', maker: 'dwarves'});
    items.insert({name: 'draupnir', owner: 'odin', maker: 'elves'});

    const another = db.addCollection('another');
    const ai = another.insert({a: 1, b: 2});

    // for purposes of our memory adapter it is pretty much synchronous
    db.saveDatabase().then(() => {
      // should have partitioned the data
      expect(Object.keys(mem.hashStore).length).toEqual(4);
      expect(mem.hashStore.hasOwnProperty("sandbox.db")).toEqual(true);
      expect(mem.hashStore.hasOwnProperty("sandbox.db.0.0")).toEqual(true);
      expect(mem.hashStore.hasOwnProperty("sandbox.db.0.1")).toEqual(true);
      expect(mem.hashStore.hasOwnProperty("sandbox.db.1.0")).toEqual(true);
      // all partitions should have been saved once each
      expect(mem.hashStore["sandbox.db"].savecount).toEqual(1);
      expect(mem.hashStore["sandbox.db.0.0"].savecount).toEqual(1);
      expect(mem.hashStore["sandbox.db.0.1"].savecount).toEqual(1);
      expect(mem.hashStore["sandbox.db.1.0"].savecount).toEqual(1);

      // so let's go ahead and update one of our collections to make it dirty
      ai.b = 3;
      another.update(ai);

      // and save again to ensure lastsave is different on for db container and that one collection
      return db.saveDatabase();
    }).then(() => {
      // db container always gets saved since we currently have no 'dirty' flag on it to check
      expect(mem.hashStore["sandbox.db"].savecount).toEqual(2);
      // we didn't change this
      expect(mem.hashStore["sandbox.db.0.0"].savecount).toEqual(1);
      expect(mem.hashStore["sandbox.db.0.0"].savecount).toEqual(1);
      // we updated this collection so it should have been saved again
      expect(mem.hashStore["sandbox.db.1.0"].savecount).toEqual(2);

      // now update a multi page items collection and verify both pages were saved
      tyr.maker = "elves";
      items.update(tyr);

      return db.saveDatabase();
    }).then(() => {
      expect(mem.hashStore["sandbox.db"].savecount).toEqual(3);
      expect(mem.hashStore["sandbox.db.0.0"].savecount).toEqual(2);
      expect(mem.hashStore["sandbox.db.0.0"].savecount).toEqual(2);
      expect(mem.hashStore["sandbox.db.1.0"].savecount).toEqual(2);

      // ok now lets load from it
      db2 = new loki('sandbox.db');
      db2.initializePersistence({adapter: adapter});
      return db2.loadDatabase();
    }).then(() => {
      expect(db2.collections.length).toEqual(2);
      expect(db2.collections[0].data.length).toEqual(4);
      expect(db2.collections[1].data.length).toEqual(1);
      expect(db2.getCollection("items").findOne({name: 'tyrfing'}).maker).toEqual("elves");
      expect(db2.getCollection("another").findOne({a: 1}).b).toEqual(3);

      // verify empty collection saves with paging
      db.addCollection("extracoll");
      return db.saveDatabase();
    }).then(() => {
      expect(mem.hashStore["sandbox.db"].savecount).toEqual(4);
      expect(mem.hashStore["sandbox.db.0.0"].savecount).toEqual(2);
      expect(mem.hashStore["sandbox.db.0.0"].savecount).toEqual(2);
      expect(mem.hashStore["sandbox.db.1.0"].savecount).toEqual(2);
      expect(mem.hashStore["sandbox.db.2.0"].savecount).toEqual(1);

      // now verify loading empty collection works with paging codepath
      db2 = new loki('sandbox.db');
      db2.initializePersistence({adapter: adapter});
      return db2.loadDatabase();
    }).then(() => {
      expect(db2.collections.length).toEqual(3);
      expect(db2.collections[0].data.length).toEqual(4);
      expect(db2.collections[1].data.length).toEqual(1);
      expect(db2.collections[2].data.length).toEqual(0);
    }).then(done, done.fail);
  });

  it('verify reference adapters get db reference which is copy and serializable-safe', (done) => {
    // Current loki functionality with regards to reference mode adapters:
    // Since we don't use serializeReplacer on reference mode adapters, we make
    // lightweight clone, cloning only db container and collection containers (object refs are same).

    function MyFakeReferenceAdapter() {
      this.mode = "reference";
    }

    MyFakeReferenceAdapter.prototype.loadDatabase = (dbname) => {
      expect(typeof(dbname)).toEqual("string");

      const result = new loki("new db");
      const n1 = result.addCollection("n1");
      const n2 = result.addCollection("n2");
      n1.insert({m: 9, n: 8});
      n2.insert({m: 7, n: 6});

      return result;
    };

    MyFakeReferenceAdapter.prototype.exportDatabase = (dbname, dbref) => {
      expect(typeof(dbname)).toEqual("string");
      expect(dbref.constructor.name).toEqual("Loki");

      expect(dbref.persistenceAdapter).toEqual(null);
      expect(dbref.collections.length).toEqual(2);
      expect(dbref.getCollection("c1").findOne({a: 1}).b).toEqual(2);
      // these changes should not affect original database
      dbref.filename = "somethingelse";
      dbref.collections[0].name = "see1";
      // (accidentally?) updating a document should...
      dbref.collections[0].findOne({a: 1}).b = 3;
    };

    const adapter = new MyFakeReferenceAdapter();
    const db = new loki("rma test");
    let db2;
    db.initializePersistence({adapter: adapter});
    const c1 = db.addCollection("c1");
    const c2 = db.addCollection("c2");
    c1.insert({a: 1, b: 2});
    c2.insert({a: 3, b: 4});

    db.saveDatabase().then(() => {
      expect(db.persistenceAdapter).not.toEqual(null);
      expect(db.filename).toEqual("rma test");
      expect(db.collections[0].name).toEqual("c1");
      expect(db.getCollection("c1").findOne({a: 1}).b).toEqual(3);

      db2 = new loki("other name");
      db2.initializePersistence({adapter: adapter});

      return db2.loadDatabase();
    }).then(() => {
      expect(db2.collections.length).toEqual(2);
      expect(db2.collections[0].name).toEqual("n1");
      expect(db2.collections[1].name).toEqual("n2");
      expect(db2.getCollection("n1").findOne({m: 9}).n).toEqual(8);
    }).then(done, done.fail);
  });
});

describe('async adapter tests', () => {
  it('verify throttled async drain', (done) => {
    const mem = new LokiMemoryAdapter({asyncResponses: true, asyncTimeout: 50});
    const db = new loki('sandbox.db');
    db.initializePersistence({adapter: mem, throttledSaves: true});

    // Add a collection to the database
    const items = db.addCollection('items');
    const mjol = items.insert({name: 'mjolnir', owner: 'thor', maker: 'dwarves'});
    const gun = items.insert({name: 'gungnir', owner: 'odin', maker: 'elves'});
    const tyr = items.insert({name: 'tyrfing', owner: 'Svafrlami', maker: 'dwarves'});
    const drau = items.insert({name: 'draupnir', owner: 'odin', maker: 'elves'});

    const another = db.addCollection('another');
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

    drau.maker = 'dwarves';
    items.update(drau);
    db.saveDatabase();

    db.throttledSaveDrain().then(() => {
      // Wait until saves are complete and then loading the database and make
      // sure all saves are complete and includes their changes
      const db2 = new loki('sandbox.db');
      db2.initializePersistence({adapter: mem});

      db2.loadDatabase().then(() => {
        // total of 2 saves should have occurred
        expect(mem.hashStore["sandbox.db"].savecount).toEqual(2);

        // verify the saved database contains all expected changes
        expect(db2.getCollection("another").findOne({a: 1}).b).toEqual(3);
        expect(db2.getCollection("items").findOne({name: 'tyrfing'}).owner).toEqual('arngrim');
        expect(db2.getCollection("items").findOne({name: 'draupnir'}).maker).toEqual('dwarves');
        done();
      });
    });
  });

  it('verify throttledSaveDrain with duration timeout works', (done) => {
    const mem = new LokiMemoryAdapter({asyncResponses: true, asyncTimeout: 100});
    const db = new loki('sandbox.db');
    db.initializePersistence({adapter: mem});

    // Add a collection to the database
    const items = db.addCollection('items');
    const mjol = items.insert({name: 'mjolnir', owner: 'thor', maker: 'dwarves'});
    const gun = items.insert({name: 'gungnir', owner: 'odin', maker: 'elves'});
    const tyr = items.insert({name: 'tyrfing', owner: 'Svafrlami', maker: 'dwarves'});
    const drau = items.insert({name: 'draupnir', owner: 'odin', maker: 'elves'});

    const another = db.addCollection('another');
    const ai = another.insert({a: 1, b: 2});

    // this should immediately kick off the first save (~100ms)
    db.saveDatabase();

    // now queue up a sequence to be run one after the other, at ~50ms each (~300ms total) when first completes
    ai.b = 3;
    another.update(ai);
    db.saveDatabase(() => {
      tyr.owner = "arngrim";
      items.update(tyr);

      db.saveDatabase(() => {
        drau.maker = 'dwarves';
        items.update(drau);

        db.saveDatabase();
      });
    });

    expect(db.throttledSaveRunning).not.toEqual(null);
    expect(db.throttledSavePending).not.toEqual(null);

    // we want this to fail so above they should be bootstrapping several
    // saves which take about 400ms to complete.
    // The full drain can take one save/callback cycle longer than duration (~100ms).
    db.throttledSaveDrain({recursiveWaitLimit: true, recursiveWaitLimitDuration: 200})
      .then(() => {
        expect(true).toEqual(true);
      }, () => {
        expect(true).toEqual(false);
      });

    setTimeout(() => {
      done();
    }, 600);
  });

  it('verify throttled async throttles', (done) => {
    const mem = new LokiMemoryAdapter({asyncResponses: true, asyncTimeout: 50});
    const db = new loki('sandbox.db');
    db.initializePersistence({adapter: mem});

    // Add a collection to the database
    const items = db.addCollection('items');
    const mjol = items.insert({name: 'mjolnir', owner: 'thor', maker: 'dwarves'});
    const gun = items.insert({name: 'gungnir', owner: 'odin', maker: 'elves'});
    const tyr = items.insert({name: 'tyrfing', owner: 'Svafrlami', maker: 'dwarves'});
    const drau = items.insert({name: 'draupnir', owner: 'odin', maker: 'elves'});

    const another = db.addCollection('another');
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

    drau.maker = 'dwarves';
    items.update(drau);
    db.saveDatabase();

    // give all async saves time to complete and then verify outcome
    setTimeout(() => {
      // total of 2 saves should have occurred
      expect(mem.hashStore["sandbox.db"].savecount).toEqual(2);

      // verify the saved database contains all expected changes
      const db2 = new loki('sandbox.db');
      db2.initializePersistence({adapter: mem});
      db2.loadDatabase().then(() => {
        expect(db2.getCollection("another").findOne({a: 1}).b).toEqual(3);
        expect(db2.getCollection("items").findOne({name: 'tyrfing'}).owner).toEqual('arngrim');
        expect(db2.getCollection("items").findOne({name: 'draupnir'}).maker).toEqual('dwarves');
        done();
      });
    }, 200);
  });

  it('verify throttled async works as expected', (done) => {
    const mem = new LokiMemoryAdapter({asyncResponses: true, asyncTimeout: 50});
    const adapter = new LokiPartitioningAdapter(mem);
    const throttled = true;
    const db = new loki('sandbox.db');
    db.initializePersistence({adapter: adapter, throttledSaves: throttled});

    // Add a collection to the database
    const items = db.addCollection('items');
    items.insert({name: 'mjolnir', owner: 'thor', maker: 'dwarves'});
    items.insert({name: 'gungnir', owner: 'odin', maker: 'elves'});
    const tyr = items.insert({name: 'tyrfing', owner: 'Svafrlami', maker: 'dwarves'});
    items.insert({name: 'draupnir', owner: 'odin', maker: 'elves'});

    const another = db.addCollection('another');
    const ai = another.insert({a: 1, b: 2});

    db.saveDatabase().then(() => {
      // should have partitioned the data
      expect(Object.keys(mem.hashStore).length).toEqual(3);
      expect(mem.hashStore.hasOwnProperty("sandbox.db")).toEqual(true);
      expect(mem.hashStore.hasOwnProperty("sandbox.db.0")).toEqual(true);
      expect(mem.hashStore.hasOwnProperty("sandbox.db.1")).toEqual(true);
      // all partitions should have been saved once each
      expect(mem.hashStore["sandbox.db"].savecount).toEqual(1);
      expect(mem.hashStore["sandbox.db.0"].savecount).toEqual(1);
      expect(mem.hashStore["sandbox.db.1"].savecount).toEqual(1);

      // so let's go ahead and update one of our collections to make it dirty
      ai.b = 3;
      another.update(ai);

      // and save again to ensure lastsave is different on for db container and that one collection
      db.saveDatabase().then(() => {
        // db container always gets saved since we currently have no 'dirty' flag on it to check
        expect(mem.hashStore["sandbox.db"].savecount).toEqual(2);
        // we didn't change this
        expect(mem.hashStore["sandbox.db.0"].savecount).toEqual(1);
        // we updated this collection so it should have been saved again
        expect(mem.hashStore["sandbox.db.1"].savecount).toEqual(2);

        // now update a multi page items collection and verify both pages were saved
        tyr.maker = "elves";
        items.update(tyr);
        db.saveDatabase().then(() => {
          expect(mem.hashStore["sandbox.db"].savecount).toEqual(3);
          expect(mem.hashStore["sandbox.db.0"].savecount).toEqual(2);
          expect(mem.hashStore["sandbox.db.1"].savecount).toEqual(2);

          // ok now lets load from it
          let db2 = new loki('sandbox.db');
          db2.initializePersistence({adapter: adapter, throttledSaves: throttled});
          db2.loadDatabase().then(() => {
            expect(db2.collections.length).toEqual(2);
            expect(db2.collections[0].data.length).toEqual(4);
            expect(db2.collections[1].data.length).toEqual(1);
            expect(db2.getCollection("items").findOne({name: 'tyrfing'}).maker).toEqual("elves");
            expect(db2.getCollection("another").findOne({a: 1}).b).toEqual(3);

            // verify empty collection saves with paging
            db.addCollection("extracoll");
            db.saveDatabase().then(() => {
              expect(mem.hashStore["sandbox.db"].savecount).toEqual(4);
              expect(mem.hashStore["sandbox.db.0"].savecount).toEqual(2);
              expect(mem.hashStore["sandbox.db.1"].savecount).toEqual(2);
              expect(mem.hashStore["sandbox.db.2"].savecount).toEqual(1);

              // now verify loading empty collection works with paging codepath
              db2 = new loki('sandbox.db');
              db2.initializePersistence({adapter: adapter, throttledSaves: throttled});
              db2.loadDatabase().then(() => {
                expect(db2.collections.length).toEqual(3);
                expect(db2.collections[0].data.length).toEqual(4);
                expect(db2.collections[1].data.length).toEqual(1);
                expect(db2.collections[2].data.length).toEqual(0);

                // since async calls are being used, use jasmine done() to indicate test finished
                done();
              });
            });
          });
        });
      });
    });
  });


  it('verify loadDatabase in the middle of throttled saves will wait for queue to drain first', (done) => {
    const mem = new LokiMemoryAdapter({asyncResponses: true, asyncTimeout: 75});
    const db = new loki('sandbox.db');
    db.initializePersistence({adapter: mem});

    // Add a collection to the database
    const items = db.addCollection('items');
    const mjol = items.insert({name: 'mjolnir', owner: 'thor', maker: 'dwarves'});
    const gun = items.insert({name: 'gungnir', owner: 'odin', maker: 'elves'});
    const tyr = items.insert({name: 'tyrfing', owner: 'Svafrlami', maker: 'dwarves'});
    const drau = items.insert({name: 'draupnir', owner: 'odin', maker: 'elves'});

    const another = db.addCollection('another');
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
        drau.maker = 'dwarves';
        items.update(drau);

        db.saveDatabase();
      });
    });

    expect(db.throttledSaveRunning).not.toEqual(null);
    expect(db.throttledSavePending).not.toEqual(null);

    // at this point, several rounds of saves should be triggered...
    // a load at this scope (possibly simulating script run from different code path)
    // should wait until any pending saves are complete, then freeze saves (queue them ) while loading,
    // then re-enable saves
    db.loadDatabase().then(() => {

      expect(db.getCollection('another').findOne({a: 1}).b).toEqual(3);
      expect(db.getCollection('items').findOne({name: 'tyrfing'}).owner).toEqual('arngrim');
      expect(db.getCollection('items').findOne({name: 'draupnir'}).maker).toEqual('dwarves');
    });

    setTimeout(() => {
      done();
    }, 600);
  });
});

describe('testing changesAPI', () => {
  it('verify pending changes persist across save/load cycle', (done) => {
    const mem = new LokiMemoryAdapter();
    const db = new loki('sandbox.db');
    let db2;
    db.initializePersistence({adapter: mem});

    // Add a collection to the database
    const items = db.addCollection('items', {disableChangesApi: false});

    // Add some documents to the collection
    items.insert({name: 'mjolnir', owner: 'thor', maker: 'dwarves'});
    items.insert({name: 'gungnir', owner: 'odin', maker: 'elves'});
    items.insert({name: 'tyrfing', owner: 'Svafrlami', maker: 'dwarves'});
    items.insert({name: 'draupnir', owner: 'odin', maker: 'elves'});

    // Find and update an existing document
    const tyrfing = items.findOne({'name': 'tyrfing'});
    tyrfing.owner = 'arngrim';
    items.update(tyrfing);

    // memory adapter is synchronous so i will not bother with callbacks
    db.saveDatabase().then(() => {
      db2 = new loki('sandbox.db');
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
