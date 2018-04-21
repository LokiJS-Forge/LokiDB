// import {Loki} from "../../src/loki";

// declare var loki: any;

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

interface DatabaseVersion {
  version: number;
}

interface Serialized {
  version: 2;
  name: string;
  value: number;
  sub: SubSerialized;
}

interface SubSerialized {
  work: number[];
  query: boolean;
  nested: {
    get: number;
    float: number;
    nester: {
      oh: boolean;
      wow?: null;
    }
  };
}

interface Serialized2 {
  version: 1;
  name: string;
  sub: SubSerialized2;
}

interface SubSerialized2 {
  work: number[];
}

function get<T, U extends object = object>(t: T, other?: U): (T & U) extends Omit<Serialized, "version"> ? Serialized : never {
  let l = new Proxy({},
    {
      get: (obj, prop) => {
        if (obj.hasOwnProperty(prop)) {
          return obj[prop];
        } else if (other && other.hasOwnProperty(prop)) {
          if (other[prop] !== null && typeof other[prop] === "object") {
            return get(t ? t[prop]: undefined, other[prop]);
          } else {
            return other[prop];
          }
        } else if (t && t.hasOwnProperty(prop)) {
          return t[prop];
        }
      }
    }
  );
  return l as any;
}

fdescribe("testing legacy loader", function () {

  fit("test", () => {

    let serialized2: Serialized2 = {
      version: 1,
      name: "abc",
      sub: {work: [1]}
    };
    let serialized1 = get(serialized2, {version: 2, value: 1, sub: {query: true, nested: {get: 2, float: 3.0, nester: {oh: true}}}});
    console.log(serialized1.version);



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
});
