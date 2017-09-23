/* global describe, it, expect */
import {Loki as loki} from "../../src/loki";

describe("changesApi", () => {
  it("does what it says on the tin", () => {
    const db = new loki(),
      // gordian = require('gordian'),
      // suite = new gordian('testEvents'),
      options = {
        asyncListeners: false,
        disableChangesApi: false
      },
      users = db.addCollection("users", options),
      test = db.addCollection("test", options),
      test2 = db.addCollection("test2", options);

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
    users.setChangesApi(false);
    expect(users.disableChangesApi).toEqual(true);

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

  it('works with delta mode', function () {
    const db = new loki(),
      options = {
        asyncListeners: false,
        disableChangesApi: false,
        disableDeltaChangesApi: false
      },
      items = db.addCollection('items', options);

    // Add some documents to the collection
    items.insert({name: 'mjolnir', owner: 'thor', maker: {name: 'dwarves', count: 1}});
    items.insert({name: 'gungnir', owner: 'odin', maker: {name: 'elves', count: 1}});
    items.insert({name: 'tyrfing', owner: 'Svafrlami', maker: {name: 'dwarves', count: 1}});
    items.insert({name: 'draupnir', owner: 'odin', maker: {name: 'elves', count: 1}});

    // Find and update an existing document
    const tyrfing = items.findOne({'name': 'tyrfing'});
    tyrfing.owner = 'arngrim';
    items.update(tyrfing);
    tyrfing.maker.count = 4;
    items.update(tyrfing);

    let changes = db.serializeChanges(['items']);
    changes = JSON.parse(changes);

    expect(changes.length).toEqual(6);

    const firstUpdate = changes[4];
    expect(firstUpdate.operation).toEqual('U');
    expect(firstUpdate.obj.owner).toEqual('arngrim');
    expect(firstUpdate.obj.name).toBeUndefined();

    const secondUpdate = changes[5];
    expect(secondUpdate.operation).toEqual('U');
    expect(secondUpdate.obj.owner).toBeUndefined();
    expect(secondUpdate.obj.maker).toEqual({count: 4});
  });
});
