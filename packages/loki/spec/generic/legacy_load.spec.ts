import {Loki} from "../../src/loki";

declare var loki: any;

describe("testing legacy loader", function () {

  it("test", () => {
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
      ]);
      const tx = [
        {
          type: "find",
          value: {
            "d.msg": "loki"
          }
        }
      ];
      abc.addTransform("findLoki", tx);

      let result = abc.chain("findLoki").data();
      expect(result.length).toEqual(1);
      expect(result[0].d.msg).toEqual("loki");

      const dyn = abc.addDynamicView("notLoki");
      dyn.applyFind({c: 1});
      dyn.applySimpleSort("a", true);
      result = dyn.data();
      expect(result.length).toEqual(2);
      expect(result[0].d.msg).toEqual("legacy");
      expect(result[1].d.msg).toEqual("hello");
    }

    const db = new Loki();
    db.loadJSONObject(legacyDB);


  });
});
