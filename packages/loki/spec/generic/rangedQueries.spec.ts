/**
 * This set of unit tests will be used to test both indexed and unindexed ranged queries.
 * It will define how comparators work with both.
 */
import { Loki } from "../../src/loki";

describe("ranged indexes", () => {
  interface User {
    name: string;
    owner?: string;
    maker?: string;
  }

  let testRecords: User[];

  beforeEach(() => {
    testRecords = [
      { name: "mjolnir", owner: "thor", maker: "dwarves" },
      { name: "gungnir", owner: "odin", maker: "elves" },
      { name: "tyrfing", owner: "Svafrlami", maker: "dwarves" },
      { name: "draupnir", owner: "odin", maker: "elves" }
    ];
  });

  it("placeholder test", () => {
    let db = new Loki("test.db");
    let coll = db.addCollection("test");
    coll.insert(testRecords);
    let results = coll.find();
    expect(results.length).toEqual(4);
  });
});
