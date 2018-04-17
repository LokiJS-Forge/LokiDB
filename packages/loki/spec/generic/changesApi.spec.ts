/* global describe, it, expect */
import {Loki} from "../../src/loki";

describe("changesApi", () => {

  interface User {
    name: string;
  }

  it("does what it says on the tin", () => {
    const db = new Loki();
    const options = {
      asyncListeners: false,
      disableChangesApi: false
    };
    const users = db.addCollection<User>("users", options);
    const test = db.addCollection<User>("test", options);
    const test2 = db.addCollection<User>("test2", options);

    const u = users.insert({
      name: "joe"
    });
    u.name = "jack";
    users.update(u);
    test.insert({
      name: "test"
    });
    test2.insert({
      name: "test2"
    });

    const userChanges = db.generateChangesNotification(["users"]);

    expect(userChanges.length).toEqual(2);
    expect(db.serializeChanges(["users"])).toEqual(JSON.stringify(userChanges));

    const someChanges = db.generateChangesNotification(["users", "test2"]);

    expect(someChanges.length).toEqual(3);
    const allChanges = db.generateChangesNotification();

    expect(allChanges.length).toEqual(4);
    users.setChangesApi(true);
    expect(users["_disableChangesApi"]).toEqual(true);

    u.name = "john";
    users.update(u);
    const newChanges = db.generateChangesNotification(["users"]);

    expect(newChanges.length).toEqual(2);
    db.clearChanges();

    expect(users.getChanges().length).toEqual(0);

    u.name = "jim";
    users.update(u);
    users.flushChanges();

    expect(users.getChanges().length).toEqual(0);
  });

  it("works with delta mode", () => {
    const db = new Loki();
    const options = {
      asyncListeners: false,
      disableChangesApi: false,
      disableDeltaChangesApi: false
    };

    interface User {
      name: string;
      owner: string;
      maker: {
        name: string,
        count: number;
      };
    }

    const items = db.addCollection<User>("items", options);

    // Add some documents to the collection
    items.insert({name: "mjolnir", owner: "thor", maker: {name: "dwarves", count: 1}});
    items.insert({name: "gungnir", owner: "odin", maker: {name: "elves", count: 1}});
    items.insert({name: "tyrfing", owner: "Svafrlami", maker: {name: "dwarves", count: 1}});
    items.insert({name: "draupnir", owner: "odin", maker: {name: "elves", count: 1}});

    // Find and update an existing document
    const tyrfing = items.findOne({"name": "tyrfing"});
    tyrfing.owner = "arngrim";
    items.update(tyrfing);
    tyrfing.maker.count = 4;
    items.update(tyrfing);

    let changes_serialized = db.serializeChanges(["items"]);
    let changes = JSON.parse(changes_serialized);

    expect(changes.length).toEqual(6);

    const firstUpdate = changes[4];
    expect(firstUpdate.operation).toEqual("U");
    expect(firstUpdate.obj.owner).toEqual("arngrim");
    expect(firstUpdate.obj.name).toBeUndefined();

    const secondUpdate = changes[5];
    expect(secondUpdate.operation).toEqual("U");
    expect(secondUpdate.obj.owner).toBeUndefined();
    expect(secondUpdate.obj.maker).toEqual({count: 4});
  });

  it("batch operations work with delta mode", () => {

    interface User {
      name: string;
      maker: string;
      owner: string;
      count: number;
    }

    const db = new Loki();
    const options = {
      asyncListeners: false,
      disableChangesApi: false,
      disableDeltaChangesApi: false
    };
    const items = db.addCollection<User>("items", options);

    // Add some documents to the collection
    items.insert([
      {name: "mjolnir", owner: "thor", maker: "dwarves", count: 0},
      {name: "gungnir", owner: "odin", maker: "elves", count: 0},
      {name: "tyrfing", owner: "Svafrlami", maker: "dwarves", count: 0},
      {name: "draupnir", owner: "odin", maker: "elves", count: 0}
    ]);

    items.chain().update((o) => {
      o.count++;
      return o;
    });

    const changes = JSON.parse(db.serializeChanges(["items"]));
    expect(changes.length).toEqual(8);

    expect(changes[0].name).toEqual("items");
    expect(changes[0].operation).toEqual("I");
    expect(changes[1].name).toEqual("items");
    expect(changes[1].operation).toEqual("I");
    expect(changes[2].name).toEqual("items");
    expect(changes[2].operation).toEqual("I");
    expect(changes[3].name).toEqual("items");
    expect(changes[3].operation).toEqual("I");

    expect(changes[4].name).toEqual("items");
    expect(changes[4].operation).toEqual("U");
    expect(changes[4].obj.count).toEqual(1);
    expect(changes[5].name).toEqual("items");
    expect(changes[5].operation).toEqual("U");
    expect(changes[5].obj.count).toEqual(1);
    expect(changes[6].name).toEqual("items");
    expect(changes[6].operation).toEqual("U");
    expect(changes[6].obj.count).toEqual(1);
    expect(changes[7].name).toEqual("items");
    expect(changes[7].operation).toEqual("U");
    expect(changes[7].obj.count).toEqual(1);

    const keys = Object.keys(changes[7].obj);
    keys.sort();
    expect(keys[0]).toEqual("$loki");
    expect(keys[1]).toEqual("count");
    expect(keys[2]).toEqual("meta");
  });
});
