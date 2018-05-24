/* global describe, it, expect */
import { Loki } from "../../../loki/src/loki";
import { MemoryStorage } from "../../../memory-storage/src/memory_storage";
import { PartitioningAdapter } from "../../src/partitioning_adapter";


interface AB {
  a: number;
  b: number;
}


interface User {
  name: string;
  owner: string;
  maker: string;
}

describe("partitioning adapter", () => {
  let db2: Loki;

  it("verify partioning adapter works", (done) => {
    const mem = new MemoryStorage();
    const adapter = new PartitioningAdapter(mem);

    const db = new Loki("sandbox.db");

    db.initializePersistence({adapter: adapter});

    // Add a collection to the database
    const items = db.addCollection<User>("items");
    items.insert({name: "mjolnir", owner: "thor", maker: "dwarves"});
    items.insert({name: "gungnir", owner: "odin", maker: "elves"});
    items.insert({name: "tyrfing", owner: "Svafrlami", maker: "dwarves"});
    items.insert({name: "draupnir", owner: "odin", maker: "elves"});

    const another = db.addCollection<AB>("another");
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
      db2 = new Loki("sandbox.db");

      db2.initializePersistence({adapter: adapter});

      return db2.loadDatabase();
    }).then(() => {
      expect(db2["_collections"].length).toEqual(2);
      expect(db2["_collections"][0].count()).toEqual(4);
      expect(db2["_collections"][1].count()).toEqual(1);
      expect(db2.getCollection<User>("items").findOne({name: "gungnir"}).owner).toEqual("odin");
      expect(db2.getCollection<AB>("another").findOne({a: 1}).b).toEqual(3);
    }).then(done, done.fail);
  });

  it("verify partioning adapter with paging mode enabled works", (done) => {
    const mem = new MemoryStorage();

    // we will use an exceptionally low page size (64bytes) to test with small dataset
    // every object will serialize to over 64bytes so that is not a hard limit but when
    // we exceed that we will stop adding to page (so for this test 1 doc per page)
    const adapter = new PartitioningAdapter(mem, {paging: true, pageSize: 64});

    const db = new Loki("sandbox.db");

    db.initializePersistence({adapter: adapter});

    // Add a collection to the database
    const items = db.addCollection<User>("items");
    items.insert({name: "mjolnir", owner: "thor", maker: "dwarves"});
    items.insert({name: "gungnir", owner: "odin", maker: "elves"});
    const tyr = items.insert({name: "tyrfing", owner: "Svafrlami", maker: "dwarves"});
    items.insert({name: "draupnir", owner: "odin", maker: "elves"});

    const another = db.addCollection<AB>("another");
    const ai = another.insert({a: 1, b: 2});

    // for purposes of our memory storage it is pretty much synchronous
    db.saveDatabase().then(() => {
      // should have partitioned the data
      expect(Object.keys(mem.hashStore).length).toEqual(6);
      expect(mem.hashStore.hasOwnProperty("sandbox.db")).toEqual(true);
      expect(mem.hashStore.hasOwnProperty("sandbox.db.0.0")).toEqual(true);
      expect(mem.hashStore.hasOwnProperty("sandbox.db.0.1")).toEqual(true);
      expect(mem.hashStore.hasOwnProperty("sandbox.db.0.2")).toEqual(true);
      expect(mem.hashStore.hasOwnProperty("sandbox.db.0.3")).toEqual(true);
      expect(mem.hashStore.hasOwnProperty("sandbox.db.1.0")).toEqual(true);
      // all partitions should have been saved once each
      expect(mem.hashStore["sandbox.db"].savecount).toEqual(1);
      expect(mem.hashStore["sandbox.db.0.0"].savecount).toEqual(1);
      expect(mem.hashStore["sandbox.db.0.1"].savecount).toEqual(1);
      expect(mem.hashStore["sandbox.db.0.2"].savecount).toEqual(1);
      expect(mem.hashStore["sandbox.db.0.3"].savecount).toEqual(1);
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
      expect(mem.hashStore["sandbox.db.0.2"].savecount).toEqual(1);
      expect(mem.hashStore["sandbox.db.0.3"].savecount).toEqual(1);
      // we updated this collection so it should have been saved again
      expect(mem.hashStore["sandbox.db.1.0"].savecount).toEqual(2);

      // now update a multi page items collection and verify both pages were saved
      tyr.maker = "elves";
      items.update(tyr);

      return db.saveDatabase();
    }).then(() => {
      expect(mem.hashStore["sandbox.db"].savecount).toEqual(3);
      expect(mem.hashStore["sandbox.db.0.0"].savecount).toEqual(2);
      expect(mem.hashStore["sandbox.db.0.1"].savecount).toEqual(2);
      expect(mem.hashStore["sandbox.db.0.2"].savecount).toEqual(2);
      expect(mem.hashStore["sandbox.db.0.3"].savecount).toEqual(2);
      expect(mem.hashStore["sandbox.db.1.0"].savecount).toEqual(2);

      // ok now lets load from it
      db2 = new Loki("sandbox.db");
      db2.initializePersistence({adapter: adapter});
      return db2.loadDatabase();
    }).then(() => {
      expect(db2["_collections"].length).toEqual(2);
      expect(db2["_collections"][0].count()).toEqual(4);
      expect(db2["_collections"][1].count()).toEqual(1);
      expect(db2.getCollection<User>("items").findOne({name: "tyrfing"}).maker).toEqual("elves");
      expect(db2.getCollection<AB>("another").findOne({a: 1}).b).toEqual(3);

      // verify empty collection saves with paging
      db.addCollection("extracoll");
      return db.saveDatabase();
    }).then(() => {
      expect(mem.hashStore["sandbox.db"].savecount).toEqual(4);
      expect(mem.hashStore["sandbox.db.0.0"].savecount).toEqual(2);
      expect(mem.hashStore["sandbox.db.0.1"].savecount).toEqual(2);
      expect(mem.hashStore["sandbox.db.0.2"].savecount).toEqual(2);
      expect(mem.hashStore["sandbox.db.0.3"].savecount).toEqual(2);
      expect(mem.hashStore["sandbox.db.1.0"].savecount).toEqual(2);
      expect(mem.hashStore["sandbox.db.2.0"].savecount).toEqual(1);

      // now verify loading empty collection works with paging codepath
      db2 = new Loki("sandbox.db");
      db2.initializePersistence({adapter: adapter});
      return db2.loadDatabase();
    }).then(() => {
      expect(db2["_collections"].length).toEqual(3);
      expect(db2["_collections"][0].count()).toEqual(4);
      expect(db2["_collections"][1].count()).toEqual(1);
      expect(db2["_collections"][2].count()).toEqual(0);
    }).then(done, done.fail);
  });

  it("verify throttled async works as expected", (done) => {
    const mem = new MemoryStorage({asyncResponses: true, asyncTimeout: 50});
    const adapter = new PartitioningAdapter(mem);
    const throttled = true;
    const db = new Loki("sandbox.db");
    db.initializePersistence({adapter: adapter, throttledSaves: throttled});

    // Add a collection to the database
    const items = db.addCollection<User>("items");
    items.insert({name: "mjolnir", owner: "thor", maker: "dwarves"});
    items.insert({name: "gungnir", owner: "odin", maker: "elves"});
    const tyr = items.insert({name: "tyrfing", owner: "Svafrlami", maker: "dwarves"});
    items.insert({name: "draupnir", owner: "odin", maker: "elves"});

    const another = db.addCollection<AB>("another");
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
          let db2 = new Loki("sandbox.db");
          db2.initializePersistence({adapter: adapter, throttledSaves: throttled});
          db2.loadDatabase().then(() => {
            expect(db2["_collections"].length).toEqual(2);
            expect(db2["_collections"][0].count()).toEqual(4);
            expect(db2["_collections"][1].count()).toEqual(1);
            expect(db2.getCollection<User>("items").findOne({name: "tyrfing"}).maker).toEqual("elves");
            expect(db2.getCollection<AB>("another").findOne({a: 1}).b).toEqual(3);

            // verify empty collection saves with paging
            db.addCollection("extracoll");
            db.saveDatabase().then(() => {
              expect(mem.hashStore["sandbox.db"].savecount).toEqual(4);
              expect(mem.hashStore["sandbox.db.0"].savecount).toEqual(2);
              expect(mem.hashStore["sandbox.db.1"].savecount).toEqual(2);
              expect(mem.hashStore["sandbox.db.2"].savecount).toEqual(1);

              // now verify loading empty collection works with paging codepath
              db2 = new Loki("sandbox.db");
              db2.initializePersistence({adapter: adapter, throttledSaves: throttled});
              db2.loadDatabase().then(() => {
                expect(db2["_collections"].length).toEqual(3);
                expect(db2["_collections"][0].count()).toEqual(4);
                expect(db2["_collections"][1].count()).toEqual(1);
                expect(db2["_collections"][2].count()).toEqual(0);

                // since async calls are being used, use jasmine done() to indicate test finished
                done();
              });
            });
          });
        }).catch((e) => {
          done.fail(e);
        });
      });
    });
  });
});
