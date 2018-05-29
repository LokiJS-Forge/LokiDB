import {Loki, Serialization} from "../../src/loki";
import {mergeRightBiasedWithProxy} from "../../src/clone";

declare var require: (moduleId: string) => any;
const loki = require("../../../lokijs/lokijs.js");

describe("load different database versions", function () {
  it("mergeRightBiasedWithProxy", () => {
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
      filter: [1, 2],
      colls: [
        {
          id: 1,
          trans: [
            {
              ix: 1
            }
          ]
        },
        {
          id: 2,
          trans: [
            {
              ix: 2
            },
            {
              ix: 3
            }
          ]
        }
      ],
      callbackOld: () => false,
      callback: () => "1"
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
      },
      colls: left.colls.map(coll => mergeRightBiasedWithProxy(coll, {
        name: coll.id + ":id",
        trans: coll.trans.map(tran => mergeRightBiasedWithProxy(tran, {
          nx: tran.ix + ":ix"
        }))
      })),
      callback: () => 1,
      callbackNew: () => "2"
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
      colls: {
        id: number;
        name: string;
        trans: {
          ix: number;
          nx: string;
        }[];
      }[];
      callbackOld: () => boolean;
      callback: () => number;
      callbackNew: () => string;
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

    expect(merged.colls.length).toEqual(2);
    expect(merged.colls[0].id).toEqual(1);
    expect(merged.colls[0].name).toEqual("1:id");
    expect(merged.colls[1].id).toEqual(2);
    expect(merged.colls[1].name).toEqual("2:id");
    expect(merged.colls[0].trans.length).toEqual(1);
    expect(merged.colls[1].trans.length).toEqual(2);
    expect(merged.colls[0].trans[0].ix).toEqual(1);
    expect(merged.colls[0].trans[0].nx).toEqual("1:ix");
    expect(merged.colls[1].trans[0].ix).toEqual(2);
    expect(merged.colls[1].trans[0].nx).toEqual("2:ix");
    expect(merged.colls[1].trans[1].ix).toEqual(3);
    expect(merged.colls[1].trans[1].nx).toEqual("3:ix");


    expect(merged.callbackOld()).toEqual(false);
    expect(merged.callback()).toEqual(1);
    expect(merged.callbackNew()).toEqual("2");
  });
});

describe("load lokijs", () => {

  interface Data {
    a: number;
    b: number;
    c: number;
    d: {
      msg: string;
    };
  }

  const legacyDB = new loki();
  {
    const abc = legacyDB.addCollection("abc", {indices: ["a", "c"], unique: ["b"]});
    abc.insert([
      {
        a: 1, b: 2, c: 1, d: {
          msg: "hello"
        }
      },
      {
        a: 2, b: 6, c: 2, d: {
          msg: "loki"
        }
      },
      {
        a: 3, b: 8, c: 1, d: {
          msg: "legacy"
        }
      },
    ] as Data[]);
    const tx = [
      {
        type: "find",
        value: {
          "d.msg": "loki"
        }
      }
    ];
    abc.addTransform("findLoki", tx);

    const txParam = [
      {
        type: "limit",
        value: "[%lktxp]param"
      }
    ];
    abc.addTransform("limit", txParam);

    const dyn = abc.addDynamicView("notLoki");
    dyn.applyFind({c: 1});
    dyn.applySimpleSort("a", true);
  }

  it("test lokijs", () => {

    const abc = legacyDB.getCollection("abc");

    let result = abc.chain("findLoki").data();
    expect(result.length).toEqual(1);
    expect(result[0].d.msg).toEqual("loki");

    result = abc.chain("limit", {param: 1}).data();
    expect(result.length).toEqual(1);


    const dyn = abc.getDynamicView("notLoki");
    result = dyn.data();
    expect(result.length).toEqual(2);
    expect(result[0].d.msg).toEqual("legacy");
    expect(result[1].d.msg).toEqual("hello");
  });

  it("test LokiDB with serialization inflation", () => {
    let db = new Loki();
    db.loadJSONObject(legacyDB as Serialization.Serialized, {
      loader: (_1, coll) => {
        coll.nestedProperties = [{name: "d.msg", path: ["d", "msg"]}];
        return false;
      }
    });

    const abc = db.getCollection<Data>("abc");

    let result = abc.chain("findLoki").data();
    expect(result.length).toEqual(1);
    expect(result[0].d.msg).toEqual("loki");

    result = abc.chain("limit", {param: 1}).data();
    expect(result.length).toEqual(1);

    const dyn = abc.getDynamicView("notLoki");
    dyn.applyFind({c: 1});
    dyn.applySimpleSort("a", true);
    result = dyn.data();
    expect(result.length).toEqual(2);
    expect(result[0].d.msg).toEqual("legacy");
    expect(result[1].d.msg).toEqual("hello");
  });


  it("test LokiDB with options inflation", () => {
    const db = new Loki();

    // Transform and dynamic view will not be deserialized.
    db.loadJSONObject(legacyDB as Serialization.Serialized, {
      loader: (_1, _2, options) => {
        options.nestedProperties = ["d.msg"];
        return true;
      }
    });

    const abc = db.getCollection<Data, {"d.msg": string}>("abc");

    let result = abc.find({"d.msg": "loki"});
    expect(result.length).toEqual(1);
    expect(result[0].d.msg).toEqual("loki");

    result = abc.chain().find({c: 1}).simplesort("a", true).data();
    expect(result.length).toEqual(2);
    expect(result[0].d.msg).toEqual("legacy");
    expect(result[1].d.msg).toEqual("hello");
  });
});
