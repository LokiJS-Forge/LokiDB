/* global describe, it, expect */
import {Loki} from "../../src/loki";
import {LokiMemoryAdapter} from "../../src/memory_adapter";

describe("Constraints", () => {

  it("should retrieve records with by()", () => {
    const db = new Loki();

    interface User {
      username: string;
      name: string;
    }

    const coll = db.addCollection<User>("users", {
      unique: ["username"]
    });
    coll.insert({
      username: "joe",
      name: "Joe"
    });
    coll.insert({
      username: "jack",
      name: "Jack"
    });
    expect(coll.by("username", "joe").name).toEqual("Joe");

    const byUsername = (value: string) => coll.by("username", value);
    expect(byUsername("jack").name).toEqual("Jack");

    const joe = coll.by("username", "joe");
    joe.username = "jack";
    expect(() => {
      coll.update(joe);
    }).toThrow(new Error("Duplicate key for property username: " + joe.username));
    joe.username = "jim";
    coll.update(joe);
    expect(byUsername("jim")).toEqual(joe);

    coll.update(joe);
  });

  it("should create a unique index", () => {
    const db = new Loki();
    const coll2 = db.addCollection("moreusers");
    coll2.insert({
      name: "jack"
    });
    coll2.insert({
      name: "tim"
    });
    coll2.ensureUniqueIndex("name");
  });

  it("should not add record with null index", () => {
    const db = new Loki();
    const coll3 = db.addCollection("nullusers", {
      unique: ["username"]
    });
    coll3.insert({
      username: "joe",
      name: "Joe"
    });
    coll3.insert({
      username: null,
      name: "Jack"
    });

    expect(Object.keys(coll3["constraints"].unique["username"]["_keyMap"]).length).toEqual(1);
  });

  it("chained search", () => {
    const db = new Loki();
    const coll = db.addCollection("morenullusers", {
      unique: ["name"]
    });
    coll.insert({
      numb: 1,
      username: "jacky",
      name: "Joe"
    });
    coll.insert({
      numb: 1,
      username: "jacky",
      name: "Jack"
    });

    expect(coll.find({"name": "Joe"}).length).toBe(1);
    expect(coll.find({"numb": 1}).length).toBe(2);

    expect(coll.chain()
      .find({"numb": 1})
      .find({"name": "Jack"}).data().length).toBe(1);

    expect(coll.chain()
      .find({"name": "Jack"})
      .find({"numb": 1}).data().length).toBe(1);

    expect(coll.chain()
      .find({"name": "Jack"})
      .find({"numb": 1})
      .find({"username": "jacky"}).data().length).toBe(1);

    expect(coll.chain()
      .find({"username": "jacky"})
      .find({"name": "Jack"}).data().length).toBe(1);

    expect(coll.chain()
      .find({"name": "Joe"})
      .find({"name": "Jack"}).data().length).toBe(0);
  });

  it("should not throw an error id multiple nulls are added", () => {
    const db = new Loki();
    const coll4 = db.addCollection("morenullusers", {
      unique: ["username"]
    });
    coll4.insert({
      username: "joe",
      name: "Joe"
    });
    coll4.insert({
      username: null,
      name: "Jack"
    });
    coll4.insert({
      username: null,
      name: "Jake"
    });
    expect(Object.keys(coll4["constraints"].unique["username"]["_keyMap"]).length).toEqual(1);
  });

  it("coll.clear should affect unique indices correctly", () => {
    let db = new Loki();
    let coll = db.addCollection("users", {unique: ["username"]});
    coll.insert({username: "joe", name: "Joe"});
    coll.insert({username: "jack", name: "Jack"});
    coll.insert({username: "jake", name: "Jake"});
    expect(Object.keys(coll["constraints"].unique["username"]["_keyMap"]).length).toEqual(3);
    coll.clear();
    expect(Object.keys(coll["constraints"].unique["username"]["_keyMap"]).length).toEqual(0);
    coll.insert({username: "joe", name: "Joe"});
    coll.insert({username: "jack", name: "Jack"});
    expect(Object.keys(coll["constraints"].unique["username"]["_keyMap"]).length).toEqual(2);
    coll.insert({username: "jake", name: "Jake"});
    expect(Object.keys(coll["constraints"].unique["username"]["_keyMap"]).length).toEqual(3);

    db = new Loki();
    coll = db.addCollection("users", {unique: ["username"]});

    coll.insert({username: "joe", name: "Joe"});
    coll.insert({username: "jack", name: "Jack"});
    coll.insert({username: "jake", name: "Jake"});
    expect(Object.keys(coll["constraints"].unique["username"]["_keyMap"]).length).toEqual(3);
    coll.clear({removeIndices: true});
    expect(coll["constraints"].unique.hasOwnProperty("username")).toEqual(false);
    coll.insert({username: "joe", name: "Joe"});
    coll.insert({username: "jack", name: "Jack"});
    coll.insert({username: "jake", name: "Jake"});
    expect(coll["constraints"].unique.hasOwnProperty("username")).toEqual(false);
  });

  it("persistence check", () => {
    let db = new Loki("TestUnique");
    let coll = db.addCollection("users", {unique: ["name"]});
    coll.insert({
      name: "Joe"
    });
    coll.insert({
      name: "Jack"
    });

    let mem = new LokiMemoryAdapter();

    expect(() => coll.insert({name: "Jack"})).toThrow();

    db.initializePersistence({adapter: mem})
      .then(() => {
        return db.saveDatabase();
      })
      .then(() => {
        const db2 = new Loki("TestUnique");
        return db2.initializePersistence({adapter: mem})
          .then(() => {
            return db2.loadDatabase();
          })
          .then(() => {
            const coll2 = db2.getCollection("users");
            expect(() => coll2.insert({name: "Jack"})).toThrow();
          });
      })
      .catch(() => {
        expect(false).toBe(true);
      });

  });
});
