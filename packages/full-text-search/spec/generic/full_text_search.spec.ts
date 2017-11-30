/* global describe, ddescribe, it, expect */
import {Loki} from "../../../loki/src/loki";
import {QueryBuilder} from "../../src/query_builder";
import {LokiMemoryAdapter} from "../../../loki/src/memory_adapter";
import {Collection} from "../../../loki/src/collection";
import {FullTextSearch} from "../../src/full_text_search";

describe("full text search", () => {
  FullTextSearch.register();

  interface User {
    name: string;
    id: number;
  }

  let db: Loki;
  let coll: Collection<User>;

  beforeEach(() => {
    db = new Loki("MyDB");
    coll = db.addCollection<User>("User", {fullTextSearch: [{name: "name"}]});

    coll.insert([
      {name: "quark", id: 1},
      {name: "quarrk", id: 2},
      {name: "quak", id: 3},
      {name: "quask", id: 4},
    ]);
  });

  it("usage", () => {
    let query = new QueryBuilder().fuzzy("name", "quak").fuzziness(1).build();
    expect(coll.find({"$fts": query}).length).toBe(3);
  });

  it("chained", () => {
    let query = new QueryBuilder().fuzzy("name", "quak").fuzziness(1).build();

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

  it("update", () => {
    coll.updateWhere((user: User) => {
      return user.name == "quak";
    }, (user: User) => {
      user.name = "quaaak";
      return user;
    });

    let query = new QueryBuilder().fuzzy("name", "quak").fuzziness(1).build();
    expect(coll.find({"$fts": query}).length).toBe(2);
  });

  it("remove", () => {
    coll.removeWhere((user: User) => {
      return user.name == "quak";
    });

    let query = new QueryBuilder().fuzzy("name", "quak").fuzziness(1).build();
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

    let query = new QueryBuilder().fuzzy("name", "quak").fuzziness(1).build();
    expect(coll.find({"$fts": query}).length).toBe(0);

    query = new QueryBuilder().fuzzy("name", "abcde").fuzziness(1).build();
    expect(coll.find({"$fts": query}).length).toBe(3);
  });

  it("sort", () => {
    let query = new QueryBuilder().fuzzy("name", "quak").fuzziness(2).build();

    expect(coll.chain().sortByScoring).toThrowAnyError();

    let res = coll.chain().find({"$fts": query});
    expect(res.data().length).toBe(4);

    const unsorted = res.data();
    const sorted_desc = res.sortByScoring().data();
    const sorted_asc = res.sortByScoring(true).data();

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

    expect(dv.applySortByScoring().data()).toEqual(sorted_desc);
    expect(dv.applySortByScoring(true).data()).toEqual(sorted_asc);
  });

  it("from/to json", () => {
    const fts = coll["_fullTextSearch"];
    const fts2 = FullTextSearch.fromJSONObject(JSON.parse(JSON.stringify(fts)));
    expect(JSON.stringify(fts)).toEqual(JSON.stringify(fts2));
  });

  it("save/load", (done) => {
    const adapter = {adapter: new LokiMemoryAdapter()};
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
            let query = new QueryBuilder().fuzzy("name", "quak").fuzziness(1).build();
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
