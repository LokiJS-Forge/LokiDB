/* global describe, beforeEach, it, expect */
import {Loki} from "../../src/loki";
import {Collection, CloneMethod} from "../../src/collection";

export type ANY = any;

describe("cloning behavior", () => {
  interface User {
    name: string;
    owner: string;
    maker: string;
  }

  let db;
  let items: Collection<User>;

  beforeEach(() => {
    db = new Loki("cloningDisabled");
    items = db.addCollection<User>("items");
    items.insert({name: "mjolnir", owner: "thor", maker: "dwarves"});
    items.insert({name: "gungnir", owner: "odin", maker: "elves"});
    items.insert({name: "tyrfing", owner: "Svafrlami", maker: "dwarves"});
    items.insert({name: "draupnir", owner: "odin", maker: "elves"});
  });

  describe("cloning disabled", () => {
    it("works", () => {

      const mj = items.findOne({name: "mjolnir"});

      // you are modifying the actual object instance so this is worst case
      // where you modify that object and dont even call update().
      // this is not recommended, you should definately call update after modifying an object.
      mj.maker = "the dwarves";

      const mj2 = items.findOne({name: "mjolnir"});
      expect(mj2.maker).toBe("the dwarves");
    });
  });

  describe("cloning inserts are immutable", () => {
    it("works", () => {
      const cdb = new Loki("clonetest");
      const citems = cdb.addCollection<User>("items", {clone: true});
      const oldObject = {name: "mjolnir", owner: "thor", maker: "dwarves"};
      const insObject = citems.insert(oldObject);

      // cant' have either of these polluting our collection
      oldObject.name = "mewmew";
      insObject.name = "mewmew";

      const result = citems.findOne({"owner": "thor"});
      expect(result.name).toBe("mjolnir");
    });
  });

  describe("cloning updates are immutable", () => {
    it("works", () => {
      const cdb = new Loki("clonetest");
      const citems = cdb.addCollection<User>("items", {clone: true});
      const oldObject = {name: "mjolnir", owner: "thor", maker: "dwarves"};
      citems.insert(oldObject);
      const rObject = citems.findOne({"owner": "thor"});

      // after all that, just do this to ensure internal ref is different
      citems.update(rObject);

      // can't have this polluting our collection
      rObject.name = "mewmew";

      const result = citems.findOne({"owner": "thor"});

      expect(result.name).toBe("mjolnir");
    });
  });

  describe("cloning method \"shallow\" save prototype", function () {
    it("works", () => {
      class Item {
        public name: string;
        public owner: string;
        public maker: string;

        constructor(name: string, owner: string, maker: string) {
          this.name = name;
          this.owner = owner;
          this.maker = maker;
        }
      }

      const cdb = new Loki("clonetest");
      const citems = cdb.addCollection<User>("items", {clone: true, cloneMethod: "shallow"});
      const oldObject = new Item("mjolnir", "thor", "dwarves");
      const insObject = citems.insert(oldObject);

      // cant' have either of these polluting our collection
      oldObject.name = "mewmew";
      insObject.name = "mewmew";

      const result = citems.findOne({"owner": "thor"});
      expect(result instanceof Item).toBe(true);
      expect(result.name).toBe("mjolnir");
    });
  });

  describe("collection find() cloning works", () => {
    it("works", () => {
      const cdb = new Loki("cloningEnabled");
      const citems = cdb.addCollection<User>("items", {
        clone: true
      });

      citems.insert({name: "mjolnir", owner: "thor", maker: "dwarves"});
      citems.insert({name: "gungnir", owner: "odin", maker: "elves"});
      citems.insert({name: "tyrfing", owner: "Svafrlami", maker: "dwarves"});
      citems.insert({name: "draupnir", owner: "odin", maker: "elves"});

      // just to prove that resultset.data() is not giving the user the actual object reference we keep internally
      // we will modify the object and see if future requests for that object show the change
      const mj = citems.find({name: "mjolnir"})[0];
      mj.maker = "the dwarves";

      const mj2 = citems.find({name: "mjolnir"})[0];
      expect(mj2.maker).toBe("dwarves");
    });

    it("works with stringify", () => {
      const cdb = new Loki("cloningEnabled");
      const citems = cdb.addCollection<User>("items", {
        clone: true,
        cloneMethod: "parse-stringify"
      });

      citems.insert({name: "mjolnir", owner: "thor", maker: "dwarves"});
      citems.insert({name: "gungnir", owner: "odin", maker: "elves"});
      citems.insert({name: "tyrfing", owner: "Svafrlami", maker: "dwarves"});
      citems.insert({name: "draupnir", owner: "odin", maker: "elves"});

      // just to prove that resultset.data() is not giving the user the actual object reference we keep internally
      // we will modify the object and see if future requests for that object show the change
      const mj = citems.find({name: "mjolnir"})[0];
      mj.maker = "the dwarves";

      const mj2 = citems.find({name: "mjolnir"})[0];
      expect(mj2.maker).toBe("dwarves");
    });
  });

  describe("collection findOne() cloning works", () => {
    it("works", () => {
      const cdb = new Loki("cloningEnabled");
      const citems = cdb.addCollection<User>("items", {
        clone: true
      });

      citems.insert({name: "mjolnir", owner: "thor", maker: "dwarves"});
      citems.insert({name: "gungnir", owner: "odin", maker: "elves"});
      citems.insert({name: "tyrfing", owner: "Svafrlami", maker: "dwarves"});
      citems.insert({name: "draupnir", owner: "odin", maker: "elves"});

      // just to prove that resultset.data() is not giving the user the actual object reference we keep internally
      // we will modify the object and see if future requests for that object show the change
      const mj = citems.findOne({name: "mjolnir"});
      mj.maker = "the dwarves";

      const mj2 = citems.findOne({name: "mjolnir"});

      expect(mj2.maker).toBe("dwarves");
    });
  });

  describe("collection where() cloning works", () => {
    it("works", () => {
      const cdb = new Loki("cloningEnabled");
      const citems = cdb.addCollection<User>("items", {
        clone: true
      });

      citems.insert({name: "mjolnir", owner: "thor", maker: "dwarves"});
      citems.insert({name: "gungnir", owner: "odin", maker: "elves"});
      citems.insert({name: "tyrfing", owner: "Svafrlami", maker: "dwarves"});
      citems.insert({name: "draupnir", owner: "odin", maker: "elves"});

      // just to prove that resultset.data() is not giving the user the actual object reference we keep internally
      // we will modify the object and see if future requests for that object show the change
      const mj = citems.where((obj: ANY) => obj.name === "mjolnir")[0];
      mj.maker = "the dwarves";

      const mj2 = citems.where((obj: ANY) => obj.name === "mjolnir")[0];
      expect(mj2.maker).toBe("dwarves");
    });
  });

  describe("collection by() cloning works", () => {
    it("works", () => {
      const cdb = new Loki("cloningEnabled");
      const citems = cdb.addCollection<User>("items", {
        clone: true,
        unique: ["name"]
      });

      citems.insert({name: "mjolnir", owner: "thor", maker: "dwarves"});
      citems.insert({name: "gungnir", owner: "odin", maker: "elves"});
      citems.insert({name: "tyrfing", owner: "Svafrlami", maker: "dwarves"});
      citems.insert({name: "draupnir", owner: "odin", maker: "elves"});

      // just to prove that resultset.data() is not giving the user the actual object reference we keep internally
      // we will modify the object and see if future requests for that object show the change
      const mj = citems.by("name", "mjolnir");
      mj.maker = "the dwarves";

      const mj2 = citems.by("name", "mjolnir");

      expect(mj2.maker).toBe("dwarves");
    });
  });

  describe("collection by() cloning works with no data", () => {
    it("works", () => {
      const cdb = new Loki("cloningEnabled");
      const citems = cdb.addCollection<User>("items", {
        clone: true,
        unique: ["name"]
      });

      citems.insert({name: "mjolnir", owner: "thor", maker: "dwarves"});

      // we dont have any items so this should return null
      let result = citems.by("name", "gungnir");
      expect(result).toEqual(null);
      result = citems.by("name", "mjolnir");
      expect(result.owner).toEqual("thor");
    });
  });

  describe("resultset data cloning works", () => {
    it("works", () => {
      const cdb = new Loki("cloningEnabled");
      const citems = cdb.addCollection<User>("items", {
        clone: true
      });

      citems.insert({name: "mjolnir", owner: "thor", maker: "dwarves"});
      citems.insert({name: "gungnir", owner: "odin", maker: "elves"});
      citems.insert({name: "tyrfing", owner: "Svafrlami", maker: "dwarves"});
      citems.insert({name: "draupnir", owner: "odin", maker: "elves"});

      // just to prove that resultset.data() is not giving the user the actual object reference we keep internally
      // we will modify the object and see if future requests for that object show the change
      const mj = citems.chain().find({name: "mjolnir"}).data()[0];
      mj.maker = "the dwarves";

      const mj2 = citems.findOne({name: "mjolnir"});
      expect(mj2.maker).toBe("dwarves");
    });
  });

  describe("resultset data forced cloning works", () => {
    it("works", () => {
      // although our collection does not define cloning, we can choose to clone results
      // within resultset.data() options
      const mj = items.chain().find({name: "mjolnir"}).data({
        forceClones: true
      })[0];
      mj.maker = "the dwarves";

      const mj2 = items.findOne({name: "mjolnir"});
      expect(mj2.maker).toBe("dwarves");
    });
  });
});
