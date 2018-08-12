/* global describe, beforeEach, it, expect */
import { LokiOperatorPackageMap } from "../../src/helper";

describe("Testing comparator helpers", () => {
  beforeEach(() => {
  });

  it("$eq works as expected", () => {
    expect(LokiOperatorPackageMap["js"].$eq(true, true)).toEqual(true);
    expect(LokiOperatorPackageMap["js"].$eq(true, false)).toEqual(false);

    expect(LokiOperatorPackageMap["js"].$eq(5, "5")).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$eq(5, "5")).toEqual(true);
  });

  it("$ne works as expected", () => {
    expect(LokiOperatorPackageMap["js"].$ne(true, true)).toEqual(false);
    expect(LokiOperatorPackageMap["js"].$ne(true, false)).toEqual(true);
  });

  it("$in works as expected", () => {
    expect(LokiOperatorPackageMap["js"].$in(4, [1, 3, 4])).toEqual(true);
    expect(LokiOperatorPackageMap["js"].$in(8, [1, 3, 4])).toEqual(false);
  });

  it("$nin works as expected", () => {
    expect(LokiOperatorPackageMap["js"].$nin(4, [1, 3, 4])).toEqual(false);
    expect(LokiOperatorPackageMap["js"].$nin(8, [1, 3, 4])).toEqual(true);
  });

  it("$gt works as expected", () => {
    //Testing strategy:
    // First, only the same type data will be compared,
    // both with and without the third optional arg.
    // This includes all primitives*.
    //
    // Then complex* values will be compared.
    //
    // Finally, some tests will be ran trying to compare
    // values of different types.
    //
    // *Primitives: boolean, null, undefined, number, string
    // *Complex: date

    expect(LokiOperatorPackageMap["loki"].$gt(false, false)).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$gte(false, false)).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$gt(true, false)).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$gt(true, true)).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$gte(true, true)).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$gt(null, null)).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$gte(null, null)).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$gt(undefined, undefined)).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$gte(undefined, undefined)).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$gt(-1, 0)).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$gt(0, 0)).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$gte(0, 0)).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$gt(1, 0)).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$gt(new Date(2010), new Date(2015))).toEqual(false);

    expect(LokiOperatorPackageMap["js"].$gte(new Date(2015), new Date(2015))).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$gte(new Date(2015), new Date(2015))).toEqual(true);

    // mixed type checking (or mixed falsy edge tests)
    expect(LokiOperatorPackageMap["loki"].$gt("14", 12)).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$gt(12, "14")).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$gt("10", 12)).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$gt(12, "10")).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$gt("test", 12)).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$gt(12, "test")).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$gt(12, 0)).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$gt(0, 12)).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$gt(12, "")).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$gt("", 12)).toEqual(false);
  });

  it("$lt works as expected", () => {
    //Testing strategy:
    // First, only the same type data will be compared,
    // both with and without the third optional arg.
    // This includes all primitives*.
    //
    // Then complex* values will be compared.
    //
    // Finally, some tests will be ran trying to compare
    // values of different types.
    //
    // *Primitives: boolean, null, undefined, number, string
    // *Complex: date

    expect(LokiOperatorPackageMap["loki"].$lt(false, false)).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$lte(false, false)).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$lt(true, false)).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$lt(true, true)).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$lte(true, true)).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$lt(null, null)).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$lte(null, null)).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$lt(undefined, undefined)).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$lte(undefined, undefined)).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$lt(-1, 0)).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$lt(0, 0)).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$lte(0, 0)).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$lt(1, 0)).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$lt(new Date(2010), new Date(2015))).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$lt(new Date(2015), new Date(2015))).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$lte(new Date(2015), new Date(2015))).toEqual(true);

    // mixed type checking (or mixed falsy edge tests)
    expect(LokiOperatorPackageMap["loki"].$lt("12", 14)).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$lt(14, "12")).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$lt("10", 12)).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$lt(12, "10")).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$lt("test", 12)).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$lt(12, "test")).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$lt(12, 0)).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$lt(0, 12)).toEqual(true);
    expect(LokiOperatorPackageMap["loki"].$lt(12, "")).toEqual(false);
    expect(LokiOperatorPackageMap["loki"].$lt("", 12)).toEqual(true);
  });

});
