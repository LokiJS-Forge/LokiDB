// import {Loki} from "../../src/loki";


import {mergeRightBiasedWithProxy} from '../../src/clone';

fdescribe("load different database versions", function () {
  fit("mergeRightBiasedWithProxy", () => {

    let left = {
      version: 1 as 1,
      name: "abc",
      value: 2,
      sub: {
        query: [1, 2, 3],
        older: {
          enabled: false as false
        }
      },
      oldObj: {
        prop1: {
          val: true
        }
      },
      oldProp: 1,
      query: {
        doit: 1
      },
      filter: [1, 2]
    };

    let right = {
      version: 2 as 2,
      name: "def",
      value: 3,
      sub: {
        query: [true, false, false],
        newer: {
          disabled: false
        }
      },
      newProp: 2.0 as 2.0,
      query: [1, 3, true],
      filter: {
        one: 2
      }
    };

    interface Merged {
      version: 2;
      name: string;
      value: number;
      sub: {
        query: boolean[];
        older: {
          enabled: false
        }
        newer: {
          disabled: boolean
        }
      };
      oldObj: {
        prop1: {
          val: boolean;
        }
      };
      oldProp: number;
      newProp: 2.0;
      query: (boolean | number)[];
      filter: {
        one: number
      };
    }

    let merged: Merged = mergeRightBiasedWithProxy(left, right);
    expect(merged.version).toEqual(2);
    expect(merged.name).toEqual("def");
    expect(merged.value).toEqual(3);
    expect(merged.sub.query).toEqual([true, false, false]);
    expect(merged.sub.older.enabled).toEqual(false);
    expect(merged.sub.newer.disabled).toEqual(false);
    expect(merged.oldObj.prop1.val).toEqual(true);
    expect(merged.oldProp).toEqual(1);
    expect(merged.query).toEqual([1, 3, true]);
    expect(merged.newProp).toEqual(2.0);
    expect(merged.filter.one).toEqual(2);

  });

    // B + A without B


    // type AB<T extends object, U extends T> = {
    //   [P in keyof T]: T[P]
    // };
    //
    // let r2: AB<Serialized2, DEFINED_BY_NEW> = {name: "abc"};


    // type rr = Omit<Serialized2, keyof ADD>;
    // let f: rr;
    // f.


    // const legacyDB = new loki();
    // {
    //   const abc = legacyDB.addCollection("abc", {indices: ["a", "c"], unique: ["b"]});
    //   abc.insert([
    //     {
    //       a: 1, b: 2,/*/ c: 1, d: {
    //         msg: "hello"
    //       }
    //     },
    //     {
    //       a: 2, b: 6, c: 2, d: {
    //         msg: "loki"
    //       }
    //     },
    //     {
    //       a: 3, b: 8, c: 1, d: {
    //         msg: "legacy"
    //       }
    //     },
    //   ]);
    //   const tx = [
    //     {
    //       type: "find",
    //       value: {
    //         "d.msg": "loki"
    //       }
    //     }
    //   ];
    //   abc.addTransform("findLoki", tx);
    //
    //   let result = abc.chain("findLoki").data();
    //   expect(result.length).toEqual(1);
    //   expect(result[0].d.msg).toEqual("loki");
    //
    //   const dyn = abc.addDynamicView("notLoki");
    //   dyn.applyFind({c: 1});
    //   dyn.applySimpleSort("a", true);
    //   result = dyn.data();
    //   expect(result.length).toEqual(2);
    //   expect(result[0].d.msg).toEqual("legacy");
    //   expect(result[1].d.msg).toEqual("hello");
    // }
    //
    // const db = new Loki();
    // db.loadJSONObject(legacyDB);
});
