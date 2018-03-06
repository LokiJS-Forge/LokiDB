/* global describe, ddescribe, it, expect */
import {Loki} from "../../../loki/src/loki";
import {Query} from "../../src/query_types";
import {MemoryStorage} from "../../../memory-storage/src/memory_storage";
import {Collection} from "../../../loki/src/collection";
import {FullTextSearch} from "../../src/full_text_search";
import {Doc} from "../../../common/types";
import {Analyzer} from "../../src/analyzer/analyzer";

describe("full-text search", () => {
  FullTextSearch.register();

  interface User {
    name: string;
    id: number;
  }

  let db: Loki;
  let coll: Collection<User>;

  beforeEach(() => {
    db = new Loki("MyDB");
    coll = db.addCollection<User>("User", {fullTextSearch: [{field: "name"}]});

    coll.insert([
      {name: "quark", id: 1},
      {name: "quarrk", id: 2},
      {name: "quak", id: 3},
      {name: "quask", id: 4},
    ]);
  });

  it("usage", () => {
    let query: Query = {query: {type: "fuzzy", field: "name", value: "quak", fuzziness: 1}};
    expect(coll.find({"$fts": query}).length).toBe(3);
  });

  it("chained", () => {
    let query: Query = {query: {type: "fuzzy", field: "name", value: "quak", fuzziness: 1}};
    expect(
      coll.find({"$fts": query})).not.toEqual(
      coll.find({"id": {"$in": [1, 2, 3]}}));

    expect(
      coll
        .chain()
        .find({"id": {"$in": [1, 2, 3]}})
        .find({"$fts": query})
        .data().length)
      .toBe(2);

    expect(
      coll
        .chain()
        .find({"$fts": query})
        .find({"id": {"$in": [1, 2, 3]}})
        .data().length)
      .toBe(2);
  });

  it("nested", () => {
    const coll2 = db.addCollection<{ user: { name: string, id: number } }, { "user.name": string, "user.id": number }>("coll", {
      nestedProperties: ["user.name", "user.id"],
      fullTextSearch: [{field: "user.name"}]
    });
    for (let i of coll.find()) {
      coll2.insert({user: i});
    }

    let query: Query = {query: {type: "fuzzy", field: "user.name", value: "quak", fuzziness: 1}};
    expect(coll2.find({"$fts": query}).length).toBe(3);

    expect(
      coll2.find({"$fts": query})).not.toEqual(
      coll2.find({"user.id": {"$in": [1, 2, 3]}}));

    expect(
      coll2
        .chain()
        .find({"user.id": {"$in": [1, 2, 3]}})
        .find({"$fts": query})
        .data().length)
      .toBe(2);

    expect(
      coll2
        .chain()
        .find({"$fts": query})
        .find({"user.id": {"$in": [1, 2, 3]}})
        .data().length)
      .toBe(2);
  });

  it("update", () => {
    coll.updateWhere((user: User) => {
      return user.name === "quak";
    }, (user: Doc<User>) => {
      user.name = "quaaak";
      return user;
    });

    let query: Query = {query: {type: "fuzzy", field: "name", value: "quak", fuzziness: 1}};
    expect(coll.find({"$fts": query}).length).toBe(2);
  });

  it("remove", () => {
    coll.removeWhere((user: User) => {
      return user.name === "quak";
    });

    let query: Query = {query: {type: "fuzzy", field: "name", value: "quak", fuzziness: 1}};
    expect(coll.find({"$fts": query}).length).toBe(2);
  });

  it("clear", () => {
    coll.clear();

    coll.insert([
      {name: "abcd", id: 1},
      {name: "abcde", id: 2},
      {name: "abcdef", id: 3},
      {name: "abcdefg", id: 4},
    ]);

    let query: Query = {query: {type: "fuzzy", field: "name", value: "quak", fuzziness: 1}};
    expect(coll.find({"$fts": query}).length).toBe(0);

    query = {query: {type: "fuzzy", field: "name", value: "abcde", fuzziness: 1}};
    expect(coll.find({"$fts": query}).length).toBe(3);
  });

  it("sort", () => {
    let query: Query = {query: {type: "fuzzy", field: "name", value: "quak", fuzziness: 2}};

    expect(coll.chain().sortByScoring).toThrowAnyError();
    expect(coll.chain().getScoring).toThrowAnyError();

    let res = coll.chain().find({"$fts": query});
    expect(res.data().length).toBe(4);

    const unsorted = res.data();
    const sorted_desc = res.sortByScoring().data();
    const sorted_asc = res.sortByScoring(true).data();

    expect(res.getScoring()).toBeArrayOfSize(unsorted.length);

    expect(unsorted.length).toBe(sorted_desc.length);
    expect(sorted_desc.length).toBe(sorted_asc.length);
    expect(unsorted).not.toEqual(sorted_desc);
    expect(unsorted).not.toEqual(sorted_asc);

    expect(sorted_desc[0].name).toBe("quak");
    expect(sorted_desc[3].name).toBe("quarrk");

    expect(sorted_asc[0].name).toBe("quarrk");
    expect(sorted_asc[3].name).toBe("quak");

    // With dynamic view.
    const dv = coll.addDynamicView("MyScoringView");
    expect(dv.data()).toEqual(unsorted);

    expect(dv.applySortByScoring).toThrowAnyError();
    dv.applyFind({"$fts": query});

    expect(dv.getScoring()).toBeArrayOfSize(unsorted.length);

    expect(dv.applySortByScoring().data()).toEqual(sorted_desc);
    expect(dv.applySortByScoring(true).data()).toEqual(sorted_asc);
  });

  it("explain", () => {
    let query: Query = {query: {type: "fuzzy", field: "name", value: "quak", fuzziness: 2}, explain: true};
    let res = coll.chain().find({"$fts": query});
    expect(res.data().length).toBe(4);
    expect(res.getScoring()[0].explanation).toBeArrayOfObjects();
  });

  it("from/to json", () => {
    const fts = coll["_fullTextSearch"];
    const fts2 = FullTextSearch.fromJSONObject(JSON.parse(JSON.stringify(fts)));
    expect(JSON.stringify(fts)).toEqual(JSON.stringify(fts2));
  });

  it("save/load", (done) => {
    const adapter = {adapter: new MemoryStorage()};
    db.initializePersistence(adapter)
      .then(() => {
        return db.saveDatabase();
      })
      .then(() => {
        const db2 = new Loki("MyDB");
        return db2.initializePersistence(adapter)
          .then(() => {
            return db2.loadDatabase();
          }).then(() => {
            const coll2 = db2.getCollection<User>("User");
            let query: Query = {query: {type: "fuzzy", field: "name", value: "quak", fuzziness: 1}};
            expect(coll2.find({"$fts": query}).length).toBe(3);
            done();
          });
      })
      .catch(() => {
        expect(true).toBe(false);
        done();
      });
  });

  it("save/load with analyzer", (done) => {
    const adapter = {adapter: new MemoryStorage()};
    db = new Loki("MyDB");
    const myAnalyzer: Analyzer = {
      tokenizer: str => (str.split("b"))
    };
    coll = db.addCollection<User>("User", {fullTextSearch: [{field: "name", analyzer: myAnalyzer}]});
    coll.insert([
      {name: "abc", id: 1},
      {name: "defba", id: 2},
    ]);

    db.initializePersistence(adapter)
      .then(() => {
        return db.saveDatabase();
      })
      .then(() => {
        const db2 = new Loki("MyDB");
        return db2.initializePersistence(adapter)
          .then(() => {
            return db2.loadDatabase({fullTextSearch: {name: myAnalyzer}});
          }).then(() => {
            const coll2 = db2.getCollection<User>("User");

            const query: Query = {query: {type: "term", field: "name", value: "a"}};
            expect(coll2.find({"$fts": query}).length).toBe(2);

            // Analyzer still works.
            coll2.insert({name: "abxyz", id: 3});
            expect(coll2.find({"$fts": query}).length).toBe(3);
            done();
          });
      })
      .catch(() => {
        expect(true).toBe(false);
        done();
      });
  });
});
