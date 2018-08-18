import { Loki } from "../../src/loki";
import { ILokiComparer, ComparatorMap, CreateJavascriptComparator, CreateAbstractDateJavascriptComparator, CreateAbstractJavascriptComparator } from "../../src/comparators";

describe("comparator feature tests", () => {
  it("comparator injection works", () => {
    let customComparator: ILokiComparer<any> = (a: any, b: any) => {
      if (typeof a === "string" && typeof b === "string") {
        a = a.toLocaleLowerCase();
        b = b.toLocaleLowerCase();
      }

      if (a === b) return 0;
      if (a > b) return 1;
      return -1;
    };

    let db = new Loki("test", {
      comparatorMap: {
        "MyCustomComparator": customComparator
      }
    });

    expect(typeof ComparatorMap["MyCustomComparator"]).toEqual("function");

    let cc = ComparatorMap["MyCustomComparator"];

    expect(cc("a", "b")).toEqual(-1);
    expect(cc("A", "b")).toEqual(-1);
    expect(cc("a", "B")).toEqual(-1);
    expect(cc("b", "b")).toEqual(0);
    expect(cc("B", "b")).toEqual(0);
    expect(cc("b", "B")).toEqual(0);
    expect(cc("b", "a")).toEqual(1);
    expect(cc("B", "a")).toEqual(1);
    expect(cc("b", "A")).toEqual(1);
    expect(cc(4, 4)).toEqual(0);
    expect(cc(1, 4)).toEqual(-1);
    expect(cc(4, 1)).toEqual(1);

    // since we are temporarily exposing ComparatorMap globally, this test proves only
    // that the constructor will modify that global variable (which will be used by collection/resultset/etc)
    db.close();
  });

  it("CreateJavascriptComparator helper function works", () => {

    let fn = CreateJavascriptComparator<any>();

    expect(fn(4, 12)).toEqual(-1);
    expect(fn(12, 4)).toEqual(1);
    expect(fn("4", 4) === 0).toEqual(false);
    expect(fn(4, "4") === 0).toEqual(false);
    expect(fn(null, undefined) === 0).toEqual(false);
  });

  it("CreateAbstractJavascriptComparator helper function works", () => {
    let fn = CreateAbstractJavascriptComparator<any>();

    expect(fn(4, 12)).toEqual(-1);
    expect(fn("4", 12)).toEqual(-1);
    expect(fn("4", 4) === 0).toEqual(true);
    expect(fn(4, "4") === 0).toEqual(true);
    expect(fn(12, 4)).toEqual(1);
    expect(fn(null, undefined) === 0).toEqual(true);
  });

  it("CreateAbstractDateComparator helper function works", () => {
    let fn = CreateAbstractDateJavascriptComparator();

    expect(fn(new Date("2015"), new Date("2015"))).toEqual(0);
    expect(fn(new Date("2015"), new Date("1/1/2014"))).toEqual(1);
    expect(fn(new Date("2015"), new Date("1/1/2016"))).toEqual(-1);
  });
});
