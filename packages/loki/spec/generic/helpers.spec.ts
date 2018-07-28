/* global describe, beforeEach, it, expect */
import { LokiOps } from "../../src/result_set";
import { ILokiRangedComparer, ComparatorMap } from "../../src/helper";

describe("Testing comparator helpers", () => {

  let ops: typeof LokiOps;
  let lokiComparator: ILokiRangedComparer<any> = ComparatorMap["loki"];

  beforeEach(() => {
    ops = LokiOps;
  });

  it("$eq works as expected", () => {
    expect(ops.$eq(true, true, lokiComparator)).toEqual(true);

    expect(ops.$eq(true, false, lokiComparator)).toEqual(false);
  });

  /*
  it("$aeq works as expected", () => {
    expect(ops.$aeq(4, "4")).toEqual(true);
    expect(ops.$aeq(4, 4)).toEqual(true);
    expect(ops.$aeq(3, 2)).toEqual(false);
    expect(ops.$aeq(3, "three")).toEqual(false);
    expect(ops.$aeq("3", 3)).toEqual(true);
    expect(ops.$aeq("1.23", 1.23)).toEqual(true);
  });
  */

  it("$ne works as expected", () => {
    expect(ops.$ne(true, true, lokiComparator)).toEqual(false);

    expect(ops.$ne(true, false, lokiComparator)).toEqual(true);
  });

  it("$in works as expected", () => {
    expect(ops.$in(4, [1, 3, 4])).toEqual(true);

    expect(ops.$in(8, [1, 3, 4])).toEqual(false);
  });

  it("$nin works as expected", () => {
    expect(ops.$nin(4, [1, 3, 4])).toEqual(false);

    expect(ops.$nin(8, [1, 3, 4])).toEqual(true);
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

    expect(ops.$gt(false, false, lokiComparator)).toEqual(false);

    expect(ops.$gte(false, false, lokiComparator)).toEqual(true);

    expect(ops.$gt(true, false, lokiComparator)).toEqual(true);

    expect(ops.$gt(true, true, lokiComparator)).toEqual(false);

    expect(ops.$gte(true, true, lokiComparator)).toEqual(true);

    expect(ops.$gt(null, null, lokiComparator)).toEqual(false);

    expect(ops.$gte(null, null, lokiComparator)).toEqual(true);

    expect(ops.$gt(undefined, undefined, lokiComparator)).toEqual(false);

    expect(ops.$gte(undefined, undefined, lokiComparator)).toEqual(true);

    expect(ops.$gt(-1, 0, lokiComparator)).toEqual(false);

    expect(ops.$gt(0, 0, lokiComparator)).toEqual(false);

    expect(ops.$gte(0, 0, lokiComparator)).toEqual(true);

    expect(ops.$gt(1, 0, lokiComparator)).toEqual(true);

    expect(ops.$gt(new Date(2010), new Date(2015), lokiComparator)).toEqual(false);

    expect(ops.$gt(new Date(2015), new Date(2015), lokiComparator)).toEqual(false);

    expect(ops.$gte(new Date(2015), new Date(2015), lokiComparator)).toEqual(true);

    // mixed type checking (or mixed falsy edge tests)
    expect(ops.$gt("14", 12, lokiComparator)).toEqual(true);

    expect(ops.$gt(12, "14", lokiComparator)).toEqual(false);

    expect(ops.$gt("10", 12, lokiComparator)).toEqual(false);

    expect(ops.$gt(12, "10", lokiComparator)).toEqual(true);

    expect(ops.$gt("test", 12, lokiComparator)).toEqual(true);

    expect(ops.$gt(12, "test", lokiComparator)).toEqual(false);

    expect(ops.$gt(12, 0, lokiComparator)).toEqual(true);

    expect(ops.$gt(0, 12, lokiComparator)).toEqual(false);

    expect(ops.$gt(12, "", lokiComparator)).toEqual(true);

    expect(ops.$gt("", 12, lokiComparator)).toEqual(false);
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

    expect(ops.$lt(false, false, lokiComparator)).toEqual(false);

    expect(ops.$lte(false, false, lokiComparator)).toEqual(true);

    expect(ops.$lt(true, false, lokiComparator)).toEqual(false);

    expect(ops.$lt(true, true, lokiComparator)).toEqual(false);

    expect(ops.$lte(true, true, lokiComparator)).toEqual(true);

    expect(ops.$lt(null, null, lokiComparator)).toEqual(false);

    expect(ops.$lte(null, null, lokiComparator)).toEqual(true);

    expect(ops.$lt(undefined, undefined, lokiComparator)).toEqual(false);

    expect(ops.$lte(undefined, undefined, lokiComparator)).toEqual(true);

    expect(ops.$lt(-1, 0, lokiComparator)).toEqual(true);

    expect(ops.$lt(0, 0, lokiComparator)).toEqual(false);

    expect(ops.$lte(0, 0, lokiComparator)).toEqual(true);

    expect(ops.$lt(1, 0, lokiComparator)).toEqual(false);

    expect(ops.$lt(new Date(2010), new Date(2015), lokiComparator)).toEqual(true);

    expect(ops.$lt(new Date(2015), new Date(2015), lokiComparator)).toEqual(false);

    expect(ops.$lte(new Date(2015), new Date(2015), lokiComparator)).toEqual(true);

    // mixed type checking (or mixed falsy edge tests)
    expect(ops.$lt("12", 14, lokiComparator)).toEqual(true);

    expect(ops.$lt(14, "12", lokiComparator)).toEqual(false);

    expect(ops.$lt("10", 12, lokiComparator)).toEqual(true);

    expect(ops.$lt(12, "10", lokiComparator)).toEqual(false);

    expect(ops.$lt("test", 12, lokiComparator)).toEqual(false);

    expect(ops.$lt(12, "test", lokiComparator)).toEqual(true);

    expect(ops.$lt(12, 0, lokiComparator)).toEqual(false);

    expect(ops.$lt(0, 12, lokiComparator)).toEqual(true);

    expect(ops.$lt(12, "", lokiComparator)).toEqual(false);

    expect(ops.$lt("", 12, lokiComparator)).toEqual(true);
  });

});
