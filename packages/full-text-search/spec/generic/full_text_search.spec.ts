/* global describe, it, expect */
import {FullTextSearch} from "../../src/full_text_search";
import {Loki} from "../../../loki/src/loki";
import {QueryBuilder} from "../../src/query_builder";
import {LokiMemoryAdapter} from "../../../loki/src/memory_adapter";

describe("full text search", () => {

  // Force usage.
  FullTextSearch;

  interface User {
    name: string;
    id: number;
  }

  it("usa", () => {
    const db = new Loki;
    const coll = db.addCollection<User>("User", {fullTextSearch: [{name: "name"}]});

    coll.insert([{name: "quark", id: 1}, {name: "quarrk", id: 2}]);
    let query = new QueryBuilder().fuzzy("name", "quak").fuzziness(1).build();
    expect(coll.find({"$fts": query}).length).toBe(1);
  });

  it("save/load", (done) => {
    const db = new Loki("myTestApp");
    const adapter = {adapter: new LokiMemoryAdapter()};

    const coll = db.addCollection<User>("User", {fullTextSearch: [{name: "name"}]});
    coll.insert([{name: "quark", id: 1}, {name: "quarrk", id: 2}]);

    db.initializePersistence(adapter)
      .then(() => {
        return db.saveDatabase();
      })
      .then(() => {
        const db2 = new Loki("myTestApp");
        return db2.initializePersistence(adapter)
          .then(() => {
            return db2.loadDatabase();
          }).then(() => {
            const coll2 = db2.getCollection<User>("User");
            let query = new QueryBuilder().fuzzy("name", "quak").fuzziness(1).build();
            expect(coll2.find({"$fts": query}).length).toBe(1);
            done();
          });
      });
  });
});
