/* global describe, beforeEach, it, expect */
import { Loki } from "../../src/loki";
import { Collection } from "../../src/collection";

describe("loki", () => {
  let db: Loki;

  interface User {
    name: string;
    age: number;
    lang: string;
  }

  let users: Collection<User>;

  beforeEach(() => {
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

    users.insert({
      name: "jonas",
      age: 30,
      lang: "Swedish"
    });
  });


  describe("core methods", () => {
    it("works", () => {
      const tdb = new Loki("regextests");
      const tcu = tdb.addCollection<User>("user");
      tcu.insert({
        name: "abcd",
        age: 25,
        lang: "English"
      });

      tcu.insert({
        name: "AbCd",
        age: 39,
        lang: "Italian"
      });

      tcu.insert({
        name: "acdb",
        age: 30,
        lang: "Swedish"
      });

      tcu.insert({
        name: "aBcD",
        age: 30,
        lang: "Swedish"
      });


      // findOne()
      const j = users.findOne({
        "name": "jonas"
      });
      expect(j.name).toEqual("jonas");

      // find()
      const result = users.find({
        "age": {
          "$gt": 29
        }
      });
      expect(result.length).toEqual(2);

      // $regex test with raw regex
      expect(users.find({
        "name": {
          "$regex": /o/
        }
      }).length).toEqual(2);

      // case insensitive regex with array of ["pattern", "options"]
      expect(tcu.find({
        "name": {
          "$regex": ["abcd", "i"]
        }
      }).length).toEqual(3);

      // regex with single encoded string pattern (no options)
      expect(tcu.find({
        "name": {
          "$regex": "cd"
        }
      }).length).toEqual(2);

      // $contains
      expect(users.find({
        "name": {
          "$contains": "jo"
        }
      }).length).toEqual(2);

      // $contains using array element
      expect(users.find({
        "name": {
          "$contains": ["jo"]
        }
      }).length).toEqual(2);


      // $contains any with one value
      expect(users.find({
        "name": {
          "$containsAny": "nas"
        }
      }).length).toEqual(1);

      // $contains any with multiple values
      expect(users.find({
        "name": {
          "$containsAny": ["nas", "dave"]
        }
      }).length).toEqual(2);


      // insert() : try inserting existing document (should fail), try adding doc with legacy id column
      const collectionLength = users.count();
      const objDave = users.findOne({
        "name": "dave"
      });
      let wasAdded = true;
      try {
        users.insert(objDave);
      } catch (err) {
        wasAdded = false;
      }
      expect(wasAdded).toEqual(false);
      expect(collectionLength).toEqual(users.count());

      // our collections are not strongly typed so lets invent some object that has its 'own' id column
      let legacyObject = {
        id: 999,
        first: "aaa",
        last: "bbb",
        city: "pasadena",
        state: "ca"
      };

      wasAdded = true;

      try {
        users.insert(legacyObject as any);
      } catch (err) {
        wasAdded = false;
      }

      expect(wasAdded).toEqual(true);

      // remove object so later queries access valid properties on all objects
      if (wasAdded) {
        users.remove(legacyObject as any); // the object itself should have been modified
      }

      // update()
      legacyObject = {
        id: 998,
        first: "aaa",
        last: "bbb",
        city: "pasadena",
        state: "ca"
      };
      let wasUpdated = true;

      try {
        users.update(legacyObject as any);
      } catch (err) {
        wasUpdated = false;
      }
      expect(wasUpdated).toEqual(false);

      // remove() - add some bogus object to remove
      const userCount1 = users.count();

      const testObject = {
        first: "aaa",
        last: "bbb",
        city: "pasadena",
        state: "ca"
      };

      users.insert(testObject as any);

      expect(userCount1 + 1).toEqual(users.count());
      users.remove(testObject as any);
      expect(userCount1).toEqual(users.count());
    });

    it("meta not set on returned objects", function () {
      const tdb = new Loki("test.db");
      const coll = tdb.addCollection<{ a: number, b: number }>("tc", { disableMeta: true });

      // verify single insert return objs do not have meta set
      const obj = coll.insert({ a: 1, b: 2 });
      expect(obj.hasOwnProperty("meta")).toEqual(false);
      expect(obj.hasOwnProperty("$loki")).toEqual(true);

      // verify batch insert return objs do not have meta set
      const objs = coll.insert([{ a: 2, b: 3 }, { a: 3, b: 4 }]);
      expect(Array.isArray(objs));
      objs.forEach((o) => {
        expect(o.hasOwnProperty("meta")).toEqual(false);
        expect(o.hasOwnProperty("$loki")).toEqual(true);
      });
    });
  });

  describe("dot notation", () => {
    it("works", () => {

      interface DNC {
        first: string;
        last: string;
        addr?: {
          street?: string;
          state?: string;
          zip?: number;
        };
      }

      const dnc = db.addCollection<DNC, { "addr.state": string, "addr.zip": number }>("dncoll",
        {
          nestedProperties: ["addr.state", "addr.zip"]
        });

      dnc.insert({
        first: "aaa",
        last: "bbb",
        addr: {
          street: "111 anystreet",
          state: "AS",
          zip: 12345
        }
      });

      dnc.insert({
        first: "ddd",
        last: "eee",
        addr: {
          street: "222 anystreet",
          state: "FF",
          zip: 32345
        }
      });

      // make sure it can handle case where top level property doesn't exist
      dnc.insert({
        first: "mmm",
        last: "nnn"
      });

      // make sure it can handle case where subscan property doesn't exist
      dnc.insert({
        first: "ooo",
        last: "ppp",
        addr: {
          state: "YY"
        }
      });

      dnc.insert({
        first: "jjj",
        last: "kkk",
        addr: {
          street: "777 anystreet",
          state: "WW",
          zip: 12345
        }
      });

      // test dot notation using regular find (with multiple results)
      const firstResult = dnc.find({
        "addr.zip": 12345
      });
      expect(firstResult.length).toEqual(2);
      expect(firstResult[0].addr.zip).toEqual(12345);
      expect(firstResult[1].addr.zip).toEqual(12345);

      // test not notation using findOne
      const secObj = dnc.findOne({
        "addr.state": "FF"
      });

      expect(secObj !== null).toBeTruthy();
      expect(secObj.addr.zip).toEqual(32345);

    });

  });

  // We only support dot notation involving array when
  // the leaf property is the array.  This verifies that functionality
  describe("dot notation across leaf object array", () => {
    it("works", () => {

      interface ABC {
        id: number;
        children: {
          someProperty?: number
        }[];
      }

      const dna = db.addCollection<ABC, { "children.someProperty": number[] }>("dnacoll", {
        nestedProperties: ["children.someProperty"]
      });

      dna.insert({
        id: 1,
        children: [{
          someProperty: 11
        }]
      });

      dna.insert({
        id: 2,
        children: [{
          someProperty: 22
        }]
      });

      dna.insert({
        id: 3,
        children: [{
          someProperty: 33
        }, {
          someProperty: 22
        }]
      });

      dna.insert({
        id: 4,
        children: [{
          someProperty: 11
        }]
      });

      dna.insert({
        id: 5,
        children: [{
          // Missing
        }]
      });

      dna.insert({
        id: 6,
        children: [{
          someProperty: null
        }]
      });

      let results = dna.find({ "children.someProperty": { "$contains": 33 } });
      expect(results.length).toEqual(1);

      results = dna.find({ "children.someProperty": { "$contains": 22 } });
      expect(results.length).toEqual(2);

      results = dna.find({ "children.someProperty": { "$contains": 11 } });
      expect(results.length).toEqual(2);
    });
  });


  describe("dot notation terminating at leaf array", () => {
    it("works", () => {

      interface ABC {
        relations: {
          ids: number[];
        };
      }

      const dna = db.addCollection<ABC, { "relations.ids": number[] }>("dnacoll",
        {
          nestedProperties: ["relations.ids"]
        });

      dna.insert({
        "relations": {
          "ids": [379]
        }
      });

      dna.insert({
        "relations": {
          "ids": [12, 379]
        }
      });

      dna.insert({
        "relations": {
          "ids": [111]
        }
      });

      const results = dna.find({
        "relations.ids": { $contains: 379 }
      });

      expect(results.length).toEqual(2);
    });
  });

  describe("dot notation across child array", () => {
    it("works", () => {

      interface ABC {
        id: number;
        children: {
          id: number;
          someArray: {
            someProperty?: number
          }[]
        }[];
      }

      const dna = db.addCollection<ABC, { "children.someArray.someProperty": number[] }>("dnacoll",
        {
          nestedProperties: ["children.someArray.someProperty"]
        });

      dna.insert({
        id: 1,
        children: [{
          id: 11,
          someArray: [{
            someProperty: 111
          }]
        }]
      });

      dna.insert({
        id: 2,
        children: [{
          id: 22,
          someArray: [{
            someProperty: 222
          }]
        }]
      });

      dna.insert({
        id: 3,
        children: [{
          id: 33,
          someArray: [{
            someProperty: 333
          }, {
            someProperty: 222
          }]
        }]
      });

      dna.insert({
        id: 4,
        children: [{
          id: 44,
          someArray: [{
            someProperty: 111
          }]
        }]
      });

      dna.insert({
        id: 5,
        children: [{
          id: 55,
          someArray: [{
            // Missing
          }]
        }]
      });

      dna.insert({
        id: 6,
        children: [{
          id: 66,
          someArray: [{
            someProperty: null
          }]
        }]
      });

      let results = dna.find({ "children.someArray.someProperty": { "$contains": 333 } });
      expect(results.length).toEqual(1);

      results = dna.find({ "children.someArray.someProperty": { "$contains": 111 } });
      expect(results.length).toEqual(2);

      results = dna.find({ "children.someArray.someProperty": { "$contains": 222 } });
      expect(results.length).toEqual(2);

      results = dna.find({ "$and": [{ "id": 3 }, { "children.someArray.someProperty": { "$contains": 222 } }] });
      expect(results.length).toEqual(1);

      results = dna.find({ "$and": [{ "id": 1 }, { "children.someArray.someProperty": { "$contains": 222 } }] });
      expect(results.length).toEqual(0);

      results = dna.find({ "$or": [{ "id": 1 }, { "children.someArray.someProperty": { "$contains": 222 } }] });
      expect(results.length).toEqual(3);
    });
  });

  describe("btree indexes", () => {
    it("works", () => {
      interface ITC {
        "testid": number;
      }

      const itc = db.addCollection<ITC>("test", {
        rangedIndexes: {
          testid: { indexTypeName: "btree", comparatorName: "js" }
        }
      });

      itc.insert({
        "testid": 1
      });
      itc.insert({
        "testid": 2
      });
      itc.insert({
        "testid": 5
      });
      itc.insert({
        "testid": 5
      });
      itc.insert({
        "testid": 9
      });
      itc.insert({
        "testid": 11
      });
      itc.insert({
        "testid": 22
      });
      itc.insert({
        "testid": 22
      });

      // lte
      let results = itc.find({
        "testid": {
          "$lte": 1
        }
      });
      expect(results.length).toEqual(1);

      results = itc.find({
        "testid": {
          "$lte": 22
        }
      });
      expect(results.length).toEqual(8);

      // lt
      results = itc.find({
        "testid": {
          "$lt": 1
        }
      });
      expect(results.length).toEqual(0);

      results = itc.find({
        "testid": {
          "$lt": 22
        }
      });
      expect(results.length).toEqual(6);

      // eq
      results = itc.find({
        "testid": {
          "$eq": 22
        }
      });
      expect(results.length).toEqual(2);

      // gt
      results = itc.find({
        "testid": {
          "$gt": 22
        }
      });
      expect(results.length).toEqual(0);

      results = itc.find({
        "testid": {
          "$gt": 5
        }
      });
      expect(results.length).toEqual(4);

      // gte
      results = itc.find({
        "testid": {
          "$gte": 5
        }
      });
      expect(results.length).toEqual(6);

      results = itc.find({
        "testid": {
          "$gte": 10
        }
      });
      expect(results.length).toEqual(3);
    });
  });

  describe("ResultSet", () => {
    it("works", () => {
      // ResultSet find
      expect(users.chain().find({
        "age": {
          "$gte": 30
        }
      }).where((obj: User) => obj.lang === "Swedish").data().length).toEqual(1);

      // ResultSet offset
      expect(users.chain().offset(1).data().length).toEqual(users.count() - 1);

      // ResultSet limit
      expect(users.chain().limit(2).data().length).toEqual(2);
    });
  });

  describe("andOrOps", () => {
    it("works", () => {
      interface EIC {
        "testid": number;
        "testString": string;
        "testFloat": number;
      }

      const eic = db.addCollection<EIC>("eic");

      eic.insert({
        "testid": 1,
        "testString": "hhh",
        "testFloat": 5.2
      }); //0
      eic.insert({
        "testid": 1,
        "testString": "bbb",
        "testFloat": 6.2
      }); //1
      eic.insert({
        "testid": 5,
        "testString": "zzz",
        "testFloat": 7.2
      }); //2
      eic.insert({
        "testid": 6,
        "testString": "ggg",
        "testFloat": 1.2
      }); //3
      eic.insert({
        "testid": 9,
        "testString": "www",
        "testFloat": 8.2
      }); //4
      eic.insert({
        "testid": 11,
        "testString": "yyy",
        "testFloat": 4.2
      }); //5
      eic.insert({
        "testid": 22,
        "testString": "bbb",
        "testFloat": 9.2
      }); //6
      eic.insert({
        "testid": 23,
        "testString": "m",
        "testFloat": 2.2
      }); //7

      // coll.find explicit $and
      expect(eic.find({
        "$and": [{
          "testid": 1
        }, {
          "testString": "bbb"
        }]
      }).length).toEqual(1);

      // coll.find implicit '$and'
      expect(eic.find({
        "testid": 1,
        "testString": "bbb"
      }).length).toEqual(1);

      // ResultSet.find explicit $and
      expect(eic.chain().find({
        "$and": [{
          "testid": 1
        }, {
          "testString": "bbb"
        }]
      }).data().length).toEqual(1);

      // ResultSet.find implicit $and
      expect(eic.chain().find({
        "testid": 1,
        "testString": "bbb"
      }).data().length).toEqual(1);

      // ResultSet.find explicit operators
      expect(eic.chain().find({
        "$and": [{
          "testid": {
            "$eq": 1
          }
        }, {
          "testFloat": {
            "$gt": 6.0
          }
        }]
      }).data().length).toEqual(1);

      // coll.find $or
      expect(eic.find({
        "$or": [{
          "testid": 1
        }, {
          "testString": "bbb"
        }]
      }).length).toEqual(3);

      // ResultSet.find $or
      expect(eic.chain().find({
        "$or": [{
          "testid": 1
        }, {
          "testString": "bbb"
        }]
      }).data().length).toEqual(3);

      // ResultSet.find explicit operators
      expect(eic.chain().find({
        "$or": [{
          "testid": 1
        }, {
          "testFloat": {
            "$gt": 7.0
          }
        }]
      }).data().length).toEqual(5);

      // add index and repeat final test
      eic.ensureRangedIndex("testid");

      expect(eic.chain().find({
        "$and": [{
          "testid": {
            "$eq": 1
          }
        }, {
          "testFloat": {
            "$gt": 6.0
          }
        }]
      }).data().length).toEqual(1);

      expect(eic.chain().find({
        "$or": [{
          "testid": 1
        }, {
          "testFloat": {
            "$gt": 7.0
          }
        }]
      }).data().length).toEqual(5);

      db.removeCollection("eic");
    });
  });

  describe("findOne", () => {
    it("works", () => {
      interface EIC {
        "testid": number;
        "testString": string;
        "testFloat": number;
      }

      const eic = db.addCollection<EIC>("eic");

      eic.insert({
        "testid": 1,
        "testString": "hhh",
        "testFloat": 5.2
      }); //0
      eic.insert({
        "testid": 1,
        "testString": "bbb",
        "testFloat": 6.2
      }); //1
      eic.insert({
        "testid": 5,
        "testString": "zzz",
        "testFloat": 7.2
      }); //2

      // coll.findOne return type
      expect(typeof eic.findOne({
        "testid": 1
      })).toEqual("object");

      // coll.findOne return match
      expect(eic.findOne({
        "testid": 5
      }).testFloat).toEqual(7.2);

      // findOne with $and op
      expect(eic.findOne({
        "$and": [{
          "testid": 1
        }, {
          "testString": "bbb"
        }]
      }).testFloat).toEqual(6.2);

      expect(eic.findOne({
        "$or": [{
          "testid": 2
        }, {
          "testString": "zzz"
        }]
      }).testFloat).toEqual(7.2);

      db.removeCollection("eic");
    });
  });

  describe("ResultSet unfiltered simplesort works", () => {
    it("works", () => {
      const ssdb = new Loki("sandbox.db");

      interface User {
        name: string;
        owner: string;
        maker: string;
      }

      // Add a collection to the database
      const items = ssdb.addCollection<User>("items", { rangedIndexes: { "name": {}} });

      // Add some documents to the collection
      items.insert({ name: "mjolnir", owner: "thor", maker: "dwarves" });
      items.insert({ name: "gungnir", owner: "odin", maker: "elves" });
      items.insert({ name: "tyrfing", owner: "svafrlami", maker: "dwarves" });
      items.insert({ name: "draupnir", owner: "odin", maker: "elves" });

      // simplesort without filters on prop with index should work
      let results = items.chain().simplesort("name").data();
      expect(results.length).toEqual(4);
      expect(results[0].name).toEqual("draupnir");
      expect(results[1].name).toEqual("gungnir");
      expect(results[2].name).toEqual("mjolnir");
      expect(results[3].name).toEqual("tyrfing");

      // simplesort without filters on prop without index should work
      results = items.chain().simplesort("owner").data();
      expect(results.length).toEqual(4);
      expect(results[0].owner).toEqual("odin");
      expect(results[1].owner).toEqual("odin");
      expect(results[2].owner).toEqual("svafrlami");
      expect(results[3].owner).toEqual("thor");
    });
  });

  describe("ResultSet data clone", () => {
    it("nested works ", () => {
      const idb = new Loki("sandbox.db");

      interface AUser {
        user: {
          name: string;
          owner: string;
          maker: string;
        };
      }

      // Add a collection to the database
      const items = idb.addCollection<AUser, { "user.name": string }>("items", { nestedProperties: ["user.name"] });

      // Add some documents to the collection
      items.insert({ user: { name: "mjolnir", owner: "thor", maker: "dwarves" } });
      items.insert({ user: { name: "gungnir", owner: "odin", maker: "elves" } });
      items.insert({ user: { name: "tyrfing", owner: "svafrlami", maker: "dwarves" } });
      items.insert({ user: { name: "draupnir", owner: "odin", maker: "elves" } });

      const result = items.chain().data({ forceClones: true });
      expect(result[0]["user.name"]).toBeDefined();
      expect(result[0]["user.owner"]).toBeUndefined();
    });
  });

  describe("ResultSet data removeMeta works", () => {
    it("works", () => {
      const idb = new Loki("sandbox.db");

      interface User {
        name: string;
        owner: string;
        maker: string;
      }

      // Add a collection to the database
      const items = idb.addCollection<User>("items", { rangedIndexes: { "owner" : {}} });

      // Add some documents to the collection
      items.insert({ name: "mjolnir", owner: "thor", maker: "dwarves" });
      items.insert({ name: "gungnir", owner: "odin", maker: "elves" });
      items.insert({ name: "tyrfing", owner: "svafrlami", maker: "dwarves" });
      items.insert({ name: "draupnir", owner: "odin", maker: "elves" });

      // unfiltered with strip meta
      let result = items.chain().data({ removeMeta: true });
      expect(result.length).toEqual(4);
      expect(result[0].hasOwnProperty("$loki")).toEqual(false);
      expect(result[0].hasOwnProperty("meta")).toEqual(false);
      expect(result[1].hasOwnProperty("$loki")).toEqual(false);
      expect(result[1].hasOwnProperty("meta")).toEqual(false);
      expect(result[2].hasOwnProperty("$loki")).toEqual(false);
      expect(result[2].hasOwnProperty("meta")).toEqual(false);
      expect(result[3].hasOwnProperty("$loki")).toEqual(false);
      expect(result[3].hasOwnProperty("meta")).toEqual(false);

      // indexed sort with strip meta
      result = items.chain().simplesort("owner").limit(2).data({ removeMeta: true });
      expect(result.length).toEqual(2);
      expect(result[0].owner).toEqual("odin");
      expect(result[0].hasOwnProperty("$loki")).toEqual(false);
      expect(result[0].hasOwnProperty("meta")).toEqual(false);
      expect(result[1].owner).toEqual("odin");
      expect(result[1].hasOwnProperty("$loki")).toEqual(false);
      expect(result[1].hasOwnProperty("meta")).toEqual(false);

      // unindexed find strip meta
      result = items.chain().find({ maker: "elves" }).data({ removeMeta: true });
      expect(result.length).toEqual(2);
      expect(result[0].maker).toEqual("elves");
      expect(result[0].hasOwnProperty("$loki")).toEqual(false);
      expect(result[0].hasOwnProperty("meta")).toEqual(false);
      expect(result[1].maker).toEqual("elves");
      expect(result[1].hasOwnProperty("$loki")).toEqual(false);
      expect(result[1].hasOwnProperty("meta")).toEqual(false);

      // now try unfiltered without strip meta and ensure loki and meta are present
      result = items.chain().data();
      expect(result.length).toEqual(4);
      expect(result[0].hasOwnProperty("$loki")).toEqual(true);
      expect(result[0].hasOwnProperty("meta")).toEqual(true);
      expect(result[1].hasOwnProperty("$loki")).toEqual(true);
      expect(result[1].hasOwnProperty("meta")).toEqual(true);
      expect(result[2].hasOwnProperty("$loki")).toEqual(true);
      expect(result[2].hasOwnProperty("meta")).toEqual(true);
      expect(result[3].hasOwnProperty("$loki")).toEqual(true);
      expect(result[3].hasOwnProperty("meta")).toEqual(true);

      // now try without strip meta and ensure loki and meta are present
      result = items.chain().simplesort("owner").limit(2).data();
      expect(result.length).toEqual(2);
      expect(result[0].owner).toEqual("odin");
      expect(result[0].hasOwnProperty("$loki")).toEqual(true);
      expect(result[0].hasOwnProperty("meta")).toEqual(true);
      expect(result[1].owner).toEqual("odin");
      expect(result[1].hasOwnProperty("$loki")).toEqual(true);
      expect(result[1].hasOwnProperty("meta")).toEqual(true);

      // unindexed find strip meta
      result = items.chain().find({ maker: "elves" }).data();
      expect(result.length).toEqual(2);
      expect(result[0].maker).toEqual("elves");
      expect(result[0].hasOwnProperty("$loki")).toEqual(true);
      expect(result[0].hasOwnProperty("meta")).toEqual(true);
      expect(result[1].maker).toEqual("elves");
      expect(result[1].hasOwnProperty("$loki")).toEqual(true);
      expect(result[1].hasOwnProperty("meta")).toEqual(true);
    });
  });

  describe("chained removes", () => {
    it("works", () => {
      interface RSC {
        "testid": number;
        "testString": string;
        "testFloat": number;
      }

      const rsc = db.addCollection<RSC>("rsc");

      rsc.insert({
        "testid": 1,
        "testString": "hhh",
        "testFloat": 5.2
      });
      rsc.insert({
        "testid": 1,
        "testString": "bbb",
        "testFloat": 6.2
      });
      rsc.insert({
        "testid": 2,
        "testString": "ccc",
        "testFloat": 6.2
      });
      rsc.insert({
        "testid": 5,
        "testString": "zzz",
        "testFloat": 7.2
      });

      const docCount = rsc.find().length;

      // verify initial doc count
      expect(docCount).toEqual(4);

      // remove middle documents
      rsc.chain().find({ testFloat: 6.2 }).remove();


      // verify new doc count
      expect(rsc.find().length).toEqual(2);
      expect(rsc.chain().data().length).toEqual(2);

      // now fetch and retain all remaining documents
      const results = rsc.chain().simplesort("testString").data();

      // make sure its the documents we expect
      expect(results[0].testString).toEqual("hhh");
      expect(results[1].testString).toEqual("zzz");
    });
  });

  /* Dynamic View Tests */
});
