import { AvlTreeIndex, TreeNode } from "../../src/avl_index";
import { CreateJavascriptComparator, ComparatorMap, IRangedIndexRequest, RangedIndexFactoryMap, IRangedIndex, ILokiComparer } from "../../src/helper";
import { Loki } from "../../src/loki";
import { Doc } from "../../../common/types";

describe("avl tree index tests", () => {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const count = 100;

  let cmp = CreateJavascriptComparator<string>();

  // setup utility function for random string generation
  let genRandomVal = () => {
    let text = "";

    for (let i = 0; i < 20; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  };

  // setup utility function to shuffle array
  let shuffle = (array: any[]) => {
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  };

  let reverseString = (str: string) => {
    let splitString = str.split("");
    let reverseArray = splitString.reverse();
    let joinArray = reverseArray.join("");
    return joinArray;
  };

  beforeEach(() => {
  });

  it("avl population works", () => {
    let avl = new AvlTreeIndex<string>("last", cmp);

    avl.insert(1, "smith");
    avl.insert(2, "patterson");
    avl.insert(3, "albertson");
    avl.insert(4, "gilbertson");
    avl.insert(5, "yannitz");
    avl.insert(6, "harrison");
    avl.insert(7, "livingstone");
    avl.insert(8, "gilbertson");
    avl.insert(9, "lapierre");

    // get all sorted ids (since not passing an IRangeRequest)
    let result: number[] = avl.rangeRequest();

    // verify number of elements is accurate
    expect(result.length).toEqual(9);

    // verify ordering is correct
    expect(result[0]).toEqual(3);
    // handle the duplicate
    expect(result[1] === 4 || result[1] === 8).toEqual(true);
    expect(result[2] === 4 || result[2] === 8).toEqual(true);
    expect(result[1] !== result[2]).toEqual(true);
    // resume asserting order of remaining
    expect(result[3]).toEqual(6);
    expect(result[4]).toEqual(9);
    expect(result[5]).toEqual(7);
    expect(result[6]).toEqual(2);
    expect(result[7]).toEqual(1);
    expect(result[8]).toEqual(5);
  });

  it("avl population stress test works", () => {
    let avl = new AvlTreeIndex<string>("rand", cmp);
    let idbuf: number[] = [];
    let rnd: string;

    // Populate avl and retain values
    for (let idx = 0; idx < count; idx++) {
      rnd = genRandomVal();
      idbuf.push(idx + 1);
      avl.insert(idx + 1, rnd);
    }

    expect(idbuf.length).toEqual(count);
    expect(avl.validateIndex()).toEqual(true);
    expect(avl.rangeRequest().length).toEqual(count);

    // suffle id array and then sequentially update index vals
    shuffle(idbuf);
    for (let id of idbuf) {
      avl.update(id, genRandomVal());
    }

    expect(avl.validateIndex()).toEqual(true);
    expect(avl.rangeRequest().length).toEqual(count);
  });

  it("avl maintenance (unique vals) stress test works", () => {
    let idbuf: number[] = [];
    let rnd: string;

    let avl = new AvlTreeIndex<string>("last", cmp);

    // insert random values into avl and retain values using numeric id greater than 0
    for (let idx = 1; idx <= count; idx++) {
      idbuf.push(idx);
      rnd = genRandomVal();
      avl.insert(idx, rnd);
    }

    expect(avl.validateIndex()).toEqual(true);
    expect(avl.rangeRequest().length).toEqual(count);

    // now update every value in the index to a different random value
    shuffle(idbuf);

    for (let id of idbuf) {
      let urnd = genRandomVal();
      avl.update(id, urnd);
    }

    // make sure the index is still valid
    expect(avl.validateIndex()).toEqual(true);
    expect(avl.rangeRequest().length).toEqual(count);

    shuffle(idbuf);
    for (let id of idbuf) {
      avl.remove(id);
      expect(avl.validateIndex()).toEqual(true);
    }
  });

  it("avl maintenance with dups stress test works", () => {
    let idbuf: number[] = [];
    let valbuf: string[] = [];
    let rnd: string;

    let avl = new AvlTreeIndex<string>("last", cmp);

    // insert random values into avl and retain values using numeric id greater than 0
    for (let idx = 1; idx <= count; idx++) {
      idbuf.push(idx);
      rnd = genRandomVal();
      valbuf.push(rnd);
      avl.insert(idx, rnd);
    }

    shuffle(idbuf);

    // now insert duplicate values for all previous inserted values
    for (let idx = 0; idx < count; idx++) {
      avl.insert(count + idx + 1, valbuf[idx]);
    }

    // make sure the index is still valid
    expect(avl.validateIndex()).toEqual(true);
    expect(avl.rangeRequest().length).toEqual(count * 2);
  });

  it("avl maintenance with dups and removes stress", () => {
    let idbuf: number[] = [];
    let valbuf: string[] = [];
    let rnd: string;

    let avl = new AvlTreeIndex<string>("last", cmp);

    // insert random values into avl and retain values using numeric id greater than 0
    for (let idx = 0; idx < count; idx++) {
      idbuf.push(idx + 1);
      rnd = genRandomVal();
      valbuf.push(rnd);
      avl.insert(idx + 1, rnd);
    }

    // now insert duplicate values for all previous inserted values
    for (let idx = 0; idx < count; idx++) {
      idbuf.push(count + idx + 1);
      avl.insert(count + idx + 1, valbuf[idx]);

      // verify siblings
      if (avl.nodes[idx + 1].siblings.length !== 1) {
        throw new Error("wrong number of siblings");
      }
      if (avl.nodes[count + idx + 1].siblings.length !== 0) {
        throw new Error("wrong number of siblings");
      }
      if (avl.nodes[count + idx + 1].parent !== idx + 1) {
        throw new Error("incorrectly parented sibling");
      }
    }

    // make sure the index is still valid
    expect(avl.validateIndex()).toEqual(true);
    expect(avl.rangeRequest().length).toEqual(count * 2);

    shuffle(idbuf);

    for (let idx = 0; idx < idbuf.length; idx++) {
      avl.remove(idbuf[idx]);
    }

    // make sure the index is still valid
    expect(avl.validateIndex()).toEqual(true);
    expect(avl.rangeRequest().length).toEqual(0);
  });

  it("insert rotation balancing check", () => {
    // left heavy involving apex
    // insert s,p,a
    // expect p(a)(s)
    let avl = new AvlTreeIndex<string>("last", cmp);
    avl.insert(1, "smith");
    avl.insert(2, "patterson");
    avl.insert(3, "albertson");
    expect(avl.apex).toEqual(2);
    expect(avl.nodes[avl.apex].height).toEqual(1);
    expect(avl.nodes[avl.apex].balance).toEqual(0);
    expect(avl.nodes[avl.apex].left).toEqual(3);
    expect(avl.nodes[avl.apex].right).toEqual(1);
    expect(avl.nodes[1].height).toEqual(0);
    expect(avl.nodes[1].balance).toEqual(0);
    expect(avl.nodes[3].height).toEqual(0);
    expect(avl.nodes[3].balance).toEqual(0);

    // right heavy involving apex
    // insert a,p,s
    // expect p(a)(s)
    avl = new AvlTreeIndex<string>("last", cmp);
    avl.insert(3, "albertson");
    avl.insert(2, "patterson");
    avl.insert(1, "smith");
    expect(avl.apex).toEqual(2);
    expect(avl.nodes[avl.apex].left).toEqual(3);
    expect(avl.nodes[avl.apex].right).toEqual(1);

    // double right heavy
    // insert order : s,p,a,g,h
    // expect final = p(g(a)(h))(s)
    avl = new AvlTreeIndex<string>("last", cmp);
    avl.insert(1, "smith");
    avl.insert(2, "patterson");
    avl.insert(3, "albertson");
    avl.insert(4, "gilbertson");
    avl.insert(6, "harrison");
    expect(avl.apex).toEqual(2);
    expect(avl.nodes[avl.apex].left).toEqual(4);
    expect(avl.nodes[avl.apex].right).toEqual(1);
    expect(avl.nodes[4].left).toEqual(3);
    expect(avl.nodes[4].right).toEqual(6);

    // right-left heavy
    // insert order : s,p,a,g,d
    // expect final : p(d(a)(g))(s)
    avl = new AvlTreeIndex<string>("last", cmp);
    avl.insert(1, "smith");
    avl.insert(2, "patterson");
    avl.insert(3, "albertson");
    avl.insert(4, "gilbertson");
    avl.insert(6, "donaldson");
    expect(avl.apex).toEqual(2);
    expect(avl.nodes[avl.apex].left).toEqual(6);
    expect(avl.nodes[avl.apex].right).toEqual(1);
    expect(avl.nodes[6].left).toEqual(3);
    expect(avl.nodes[6].right).toEqual(4);

    // double left heavy
    avl = new AvlTreeIndex<string>("last", cmp);
    avl.insert(1, "patterson");
    avl.insert(2, "gilbertson");
    avl.insert(3, "smith");
    avl.insert(4, "donaldson");
    avl.insert(5, "albertson");
    expect(avl.apex).toEqual(1);
    expect(avl.nodes[1].left).toEqual(4);
    expect(avl.nodes[1].right).toEqual(3);
    expect(avl.nodes[4].left).toEqual(5);
    expect(avl.nodes[4].right).toEqual(2);

    // left right heavy
    avl = new AvlTreeIndex<string>("last", cmp);
    avl.insert(1, "patterson");
    avl.insert(2, "gilbertson");
    avl.insert(3, "smith");
    avl.insert(4, "albertson");
    avl.insert(5, "donaldson");
    expect(avl.apex).toEqual(1);
    expect(avl.nodes[1].left).toEqual(5);
    expect(avl.nodes[1].right).toEqual(3);
    expect(avl.nodes[5].left).toEqual(4);
    expect(avl.nodes[5].right).toEqual(2);

  });

  it("remove leafs, causing rotation to rebalance", () => {
    let avl = new AvlTreeIndex<string>("last", cmp);

    // double left heavy involving remove
    // interim tree p (g (d)(h)) (s ()(t))
    // remove t (removing right leaf)
    // final expect g (d (a)(f)) (p (h)(s)))
    avl = new AvlTreeIndex<string>("last", cmp);
    avl.insert(1, "patterson");
    avl.insert(2, "gilbertson");
    avl.insert(3, "smith");
    avl.insert(4, "donaldson");
    avl.insert(5, "harrison");
    avl.insert(6, "thompson"); // keep balanced during next 2 inserts
    avl.insert(7, "albertson");
    avl.insert(8, "fiset");
    expect(avl.apex).toEqual(1);
    expect(avl.nodes[1].left).toEqual(2);
    expect(avl.nodes[1].right).toEqual(3);
    expect(avl.nodes[2].left).toEqual(4);
    expect(avl.nodes[2].right).toEqual(5);
    avl.remove(6); // make tree double left heavy
    expect(avl.apex).toEqual(2);
    expect(avl.nodes[2].left).toEqual(4);
    expect(avl.nodes[2].right).toEqual(1);
    expect(avl.nodes[1].left).toEqual(5);
    expect(avl.nodes[1].right).toEqual(3);
    expect(avl.nodes[4].left).toEqual(7);
    expect(avl.nodes[4].right).toEqual(8);

    // double right heavy involving remove
    // interim tree g (d (a)()) (p (l) (t (s)(w)))
    // remove a (remove left leaf)
    // final tree p (g (d)(l)) (t (s)(w))
    avl = new AvlTreeIndex<string>("last", cmp);
    avl.insert(1, "gilbertson");
    avl.insert(2, "donaldson");
    avl.insert(3, "patterson");
    avl.insert(4, "albertson"); // later leaf to remove
    avl.insert(5, "lapierre");
    avl.insert(6, "thompson");
    avl.insert(7, "smith");
    avl.insert(8, "williams");
    expect(avl.apex).toEqual(1);
    expect(avl.nodes[1].left).toEqual(2);
    expect(avl.nodes[1].right).toEqual(3);
    expect(avl.nodes[3].left).toEqual(5);
    expect(avl.nodes[3].right).toEqual(6);
    avl.remove(4); // make tree double right heavy
    expect(avl.apex).toEqual(3);
    expect(avl.nodes[3].left).toEqual(1);
    expect(avl.nodes[3].right).toEqual(6);
    expect(avl.nodes[1].left).toEqual(2);
    expect(avl.nodes[1].right).toEqual(5);
    expect(avl.nodes[6].left).toEqual(7);
    expect(avl.nodes[6].right).toEqual(8);
  });

  // verify that we use in-order predecessor
  // predecessor may have 0-1 children
  // this test will use predecessor with no children
  it("remove rotation where node has two children and tree is left heavy", () => {
    // interim tree p (g (d)(h)) (s)  root balance = -1
    let avl = new AvlTreeIndex<string>("last", cmp);
    avl.insert(1, "patterson");
    avl.insert(2, "gilbertson");
    avl.insert(3, "smith");
    avl.insert(4, "donaldson");
    avl.insert(5, "harrison");
    expect(avl.apex).toEqual(1);
    expect(avl.nodes[1].left).toEqual(2);
    expect(avl.nodes[1].right).toEqual(3);
    expect(avl.nodes[2].left).toEqual(4);
    expect(avl.nodes[2].right).toEqual(5);
    expect(avl.nodes[3].left).toEqual(null);
    expect(avl.nodes[3].right).toEqual(null);

    // remove root which has two children and that root is left heavy...
    // it will use in-order predecessor (h) to reduce chance of rotation
    // new tree should be h (g (d)()) (s)
    avl.remove(1);
    expect(avl.apex).toEqual(5);
    expect(avl.nodes[5].left).toEqual(2);
    expect(avl.nodes[5].right).toEqual(3);
    expect(avl.nodes[2].left).toEqual(4);
    expect(avl.nodes[2].right).toEqual(null);
    expect(avl.nodes[3].left).toEqual(null);
    expect(avl.nodes[3].right).toEqual(null);
  });

  // verify that we use in-order successor
  // succecessor may have 0-1 children
  // this test will use successor with no children
  it("remove rotation where node has two children and tree is right heavy", () => {
    // interim tree g (d) (p (h)(t))  root balance = +1
    let avl = new AvlTreeIndex<string>("last", cmp);
    avl.insert(1, "gilbertson");
    avl.insert(2, "donaldson");
    avl.insert(3, "patterson");
    avl.insert(4, "harrison");
    avl.insert(5, "thompson");
    expect(avl.apex).toEqual(1);
    expect(avl.nodes[1].left).toEqual(2);
    expect(avl.nodes[1].right).toEqual(3);
    expect(avl.nodes[2].left).toEqual(null);
    expect(avl.nodes[2].right).toEqual(null);
    expect(avl.nodes[3].left).toEqual(4);
    expect(avl.nodes[3].right).toEqual(5);
    // remove root which has two children and that root is right heavy...
    // it will use in-order predecessor (h) to reduce chance of rotation
    // new tree should be h (g (d)()) (s)
    avl.remove(1);
    expect(avl.apex).toEqual(4);
    expect(avl.nodes[4].left).toEqual(2);
    expect(avl.nodes[4].right).toEqual(3);
    expect(avl.nodes[2].left).toEqual(null);
    expect(avl.nodes[2].right).toEqual(null);
    expect(avl.nodes[3].left).toEqual(null);
    expect(avl.nodes[3].right).toEqual(5);
  });

  it("avl $eq rangeRequest works", () => {
    let idbuf: number[] = [];
    let valbuf: string[] = [];
    let rnd: string;

    let avl = new AvlTreeIndex<string>("asdf", cmp);

    // insert random values into avl and retain values using numeric id greater than 0
    for (let idx = 1; idx <= count; idx++) {
      idbuf.push(idx);
      rnd = genRandomVal();
      valbuf.push(rnd);
      avl.insert(idx, rnd);
    }

    for (let idx = 1; idx <= count; idx++) {
      idbuf.push(count + idx);
      avl.insert(count + idx, valbuf[idx - 1]);
    }

    for (let idx = 1; idx <= count; idx++) {
      let matches = avl.rangeRequest({
        op: "$eq",
        val: valbuf[idx - 1]
      });

      expect(matches.length).toEqual(2);
    }
  });

  it("avl $lt rangeRequest works", () => {
    let avl = new AvlTreeIndex<string>("test", cmp);

    avl.insert(1, "dsa");   // should be in results
    avl.insert(2, "xja");
    avl.insert(3, "asd");   // should be in results
    avl.insert(4, "gfd");   // not in results since op is $lt
    avl.insert(5, "ert");   // should be in results
    avl.insert(6, "mnb");
    avl.insert(7, "vbn");
    avl.insert(8, "rty");
    avl.insert(9, "zxc");

    let result: number[] = avl.rangeRequest({ op: "$lt", val: "gfd" });

    expect(result.length).toEqual(3);
    expect(result[0]).toEqual(3);
    expect(result[1]).toEqual(1);
    expect(result[2]).toEqual(5);
  });

  it("avl $lte rangeRequest works", () => {
    let avl = new AvlTreeIndex<string>("test", cmp);

    avl.insert(1, "dsa");   // should be in results
    avl.insert(2, "xja");
    avl.insert(3, "asd");   // should be in results
    avl.insert(4, "gfd");   // should be in results
    avl.insert(5, "ert");   // should be in results
    avl.insert(6, "mnb");
    avl.insert(7, "vbn");
    avl.insert(8, "rty");
    avl.insert(9, "zxc");

    let result: number[] = avl.rangeRequest({ op: "$lte", val: "gfd" });

    expect(result.length).toEqual(4);
    expect(result[0]).toEqual(3);
    expect(result[1]).toEqual(1);
    expect(result[2]).toEqual(5);
    expect(result[3]).toEqual(4);
  });

  it("avl $gt rangeRequest works", () => {
    let avl = new AvlTreeIndex<string>("test", cmp);

    avl.insert(1, "dsa");
    avl.insert(2, "xja");   // should be in results
    avl.insert(3, "asd");
    avl.insert(4, "gfd");
    avl.insert(5, "ert");
    avl.insert(6, "mnb");   // should -not- be in results since op is $gt
    avl.insert(7, "vbn");   // should be in results
    avl.insert(8, "rty");   // should be in results
    avl.insert(9, "zxc");   // should be in results

    let result: number[] = avl.rangeRequest({ op: "$gt", val: "mnb" });

    expect(result.length).toEqual(4);
    expect(result[0]).toEqual(8);
    expect(result[1]).toEqual(7);
    expect(result[2]).toEqual(2);
    expect(result[3]).toEqual(9);
  });

  it("avl $gte rangeRequest works", () => {
    let avl = new AvlTreeIndex<string>("test", cmp);

    avl.insert(1, "dsa");
    avl.insert(2, "xja");   // should be in results
    avl.insert(3, "asd");
    avl.insert(4, "gfd");
    avl.insert(5, "ert");
    avl.insert(6, "mnb");   // should be in results
    avl.insert(7, "vbn");   // should be in results
    avl.insert(8, "rty");   // should be in results
    avl.insert(9, "zxc");   // should be in results

    let result: number[] = avl.rangeRequest({ op: "$gte", val: "mnb" });

    expect(result.length).toEqual(5);
    expect(result[0]).toEqual(6);
    expect(result[1]).toEqual(8);
    expect(result[2]).toEqual(7);
    expect(result[3]).toEqual(2);
    expect(result[4]).toEqual(9);
  });

  it("avl $between rangeRequest works", () => {
    let avl = new AvlTreeIndex<string>("test", cmp);

    avl.insert(1, "dsa");
    avl.insert(2, "xja");
    avl.insert(3, "asd");
    avl.insert(4, "gfd");   // should be in results
    avl.insert(5, "ert");
    avl.insert(6, "mnb");   // should be in results
    avl.insert(7, "vbn");   // should be in results
    avl.insert(8, "rty");   // should be in results
    avl.insert(9, "zxc");

    let result: number[] = avl.rangeRequest({ op: "$between", val: "gfd", high: "vbn" });

    expect(result.length).toEqual(4);
    expect(result[0]).toEqual(4);
    expect(result[1]).toEqual(6);
    expect(result[2]).toEqual(8);
    expect(result[3]).toEqual(7);
  });

  it("collection find ops on avl index work", () => {
    interface TestUserType {
      name: string;
      age: number;
      location: string;
    }

    const db = new Loki("idxtest");
    const items = db.addCollection<TestUserType>("users", {
      rangedIndexes: {
        name: { indexTypeName: "avl", comparatorName: "js" }
      }
    });

    items.insert([
      { name: "patterson", age: 10, location: "a" },
      { name: "gilbertson", age: 20, location: "b" },
      { name: "smith", age: 30, location: "c" },
      { name: "donaldson", age: 40, location: "d" },
      { name: "harrison", age: 50, location: "e" },
      { name: "thompson", age: 60, location: "f" },
      { name: "albertson", age: 70, location: "g" },
      { name: "fiset", age: 80, location: "h" }
    ]);

    // $eq
    let results: TestUserType[] = items.find({ name: "donaldson" });
    expect(results.length).toEqual(1);
    expect(results[0].name).toEqual("donaldson");
    expect(results[0].age).toEqual(40);
    expect(results[0].location).toEqual("d");

    // $lt
    results = items.find({ name: { $lt: "giraffe" } });
    expect(results.length).toEqual(4);
    expect(results[0].name).toEqual("albertson");
    expect(results[1].name).toEqual("donaldson");
    expect(results[2].name).toEqual("fiset");
    expect(results[3].name).toEqual("gilbertson");

    // $lte
    results = items.find({ name: { $lte: "fiset" } });
    expect(results.length).toEqual(3);
    expect(results[0].name).toEqual("albertson");
    expect(results[1].name).toEqual("donaldson");
    expect(results[2].name).toEqual("fiset");

    // $gt
    results = items.find({ name: { $gt: "giraffe" } });
    expect(results.length).toEqual(4);
    expect(results[0].name).toEqual("harrison");
    expect(results[1].name).toEqual("patterson");
    expect(results[2].name).toEqual("smith");
    expect(results[3].name).toEqual("thompson");

    // $gte
    results = items.find({ name: { $gte: "patterson" } });
    expect(results.length).toEqual(3);
    expect(results[0].name).toEqual("patterson");
    expect(results[1].name).toEqual("smith");
    expect(results[2].name).toEqual("thompson");

    // $between
    results = items.find({ name: { $between: ["faraday", "samuel"] } });
    expect(results.length).toEqual(4);
    expect(results[0].name).toEqual("fiset");
    expect(results[1].name).toEqual("gilbertson");
    expect(results[2].name).toEqual("harrison");
    expect(results[3].name).toEqual("patterson");

  });

  it("update works on collection with avl index", () => {
    interface TestUserType {
      name: string;
      age: number;
      location: string;
    }

    const db = new Loki("idxtest");
    const items = db.addCollection<TestUserType>("users", {
      rangedIndexes: {
        name: { indexTypeName: "avl", comparatorName: "js" }
      }
    });

    items.insert([
      { name: "patterson", age: 10, location: "a" },
      { name: "gilbertson", age: 20, location: "b" },
      { name: "smith", age: 30, location: "c" },
      { name: "donaldson", age: 40, location: "d" },
      { name: "harrison", age: 50, location: "e" },
      { name: "thompson", age: 60, location: "f" },
      { name: "albertson", age: 70, location: "g" },
    ]);

    items.chain().update((o: Doc<TestUserType>) => { o.name = reverseString(o.name); return o; });

    let result = items.find({ name: { $lte: "nosk" } });
    expect(result.length).toEqual(3);
    expect(result[0].name).toEqual("htims");
    expect(result[1].name).toEqual("nosdlanod");
    expect(result[2].name).toEqual("nosirrah");

    // using weak filter to return all docs ordered by our index
    result = items.find({ name: { $gte: "a" } });
    expect(result.length).toEqual(7);
    expect(result[0].name).toEqual("htims");
    expect(result[1].name).toEqual("nosdlanod");
    expect(result[2].name).toEqual("nosirrah");
    expect(result[3].name).toEqual("nospmoht");
    expect(result[4].name).toEqual("nosrettap");
    expect(result[5].name).toEqual("nostrebla");
    expect(result[6].name).toEqual("nostreblig");
  });

  it("remove works on collection with avl index", () => {
    interface TestUserType {
      name: string;
      age: number;
      location: string;
    }

    const db = new Loki("idxtest");
    const items = db.addCollection<TestUserType>("users", {
      rangedIndexes: {
        name: { indexTypeName: "avl", comparatorName: "js" }
      }
    });

    items.insert([
      { name: "patterson", age: 10, location: "a" },
      { name: "gilbertson", age: 20, location: "b" },
      { name: "smith", age: 30, location: "c" },
      { name: "donaldson", age: 40, location: "d" },
      { name: "harrison", age: 50, location: "e" },
      { name: "thompson", age: 60, location: "f" },
      { name: "albertson", age: 70, location: "g" },
    ]);

    items.chain().find({ name: { $lte: "goldman" } }).remove();

    let result = items.find({ name: { $lte: "samuels" } });
    expect(result.length).toEqual(2);
    expect(result[0].name).toEqual("harrison");
    expect(result[1].name).toEqual("patterson");
  });

  it("simplesort works on collection with avl index", () => {
    interface TestUserType {
      name: string;
      age: number;
      location: string;
    }

    const db = new Loki("idxtest");
    const items = db.addCollection<TestUserType>("users", {
      rangedIndexes: {
        name: { indexTypeName: "avl", comparatorName: "js" }
      }
    });

    items.insert([
      { name: "patterson", age: 10, location: "a" },
      { name: "gilbertson", age: 20, location: "b" },
      { name: "smith", age: 30, location: "c" },
      { name: "donaldson", age: 40, location: "d" },
      { name: "harrison", age: 50, location: "e" },
      { name: "thompson", age: 60, location: "f" },
      { name: "albertson", age: 70, location: "g" },
    ]);

    let result: TestUserType[] = items.chain().simplesort("name").data();

    expect(result.length).toEqual(7);
    expect(result[0].name).toEqual("albertson");
    expect(result[1].name).toEqual("donaldson");
    expect(result[2].name).toEqual("gilbertson");
    expect(result[3].name).toEqual("harrison");
    expect(result[4].name).toEqual("patterson");
    expect(result[5].name).toEqual("smith");
    expect(result[6].name).toEqual("thompson");
  });

  it("comparator and ranged index maps can be injected into", () => {

    let cmp = (a: any, b: any) => {
      if (a > b) return 1;
      if (a === b) return 0;
      return -1;
    };

    // not really a functional ranged index, should have constructor accepting comparator

    class customRangedIndex<T> implements IRangedIndex<T> {
      public name: string;
      public comparator: ILokiComparer<T>;

      constructor(name: string, comparator: ILokiComparer<T>) {
        this.name = name;
        this.comparator = comparator;
      }

      insert(id: number, val: T) {
        if (!id || !val) throw new Error("");
        return;
      }
      update(id: number, val: T) {
        if (!id || val === null) throw new Error("");
        return;
      }
      remove(id: number) {
        if (!id) throw new Error("");
        return;
      }
      restore(tree: any) {
        if (!tree) throw new Error("");
        return;
      }
      backup() {
        return this;
      }
      rangeRequest(range?: IRangedIndexRequest<T>) {
        if (range === null) {
          // return everything
          return <number[]> [];
        }
        return <number[]> [];
      }
      validateIndex() {
        return true;
      }
    }

    let myCustomIndexFactory = (name: string, cmp: ILokiComparer<any>) => { return new customRangedIndex<any>(name, cmp); };

    let db = new Loki("test.db", {
      comparatorMap: {
        "FastNumeric": cmp
      },
      rangedIndexFactoryMap: {
        "MyCustomRangedIndex": myCustomIndexFactory
      }
    });

    expect(db instanceof Loki).toEqual(true);

    // verify they are registered into (global for now) comparator and rangedindex factory maps
    expect(ComparatorMap.hasOwnProperty("FastNumeric")).toEqual(true);
    expect(typeof ComparatorMap["FastNumeric"]).toEqual("function");
    expect(RangedIndexFactoryMap.hasOwnProperty("MyCustomRangedIndex")).toEqual(true);
    expect(typeof RangedIndexFactoryMap["MyCustomRangedIndex"]).toEqual("function");

  });

  it("nested property with avl index work", () => {
    interface TestUserType {
      user: {
        name: string;
        age: number;
        location: string;
      };
    }

    const db = new Loki("idxtest");
    const items = db.addCollection<TestUserType, { "user.name": string }>("users", {
      rangedIndexes: {
        "user.name": { indexTypeName: "avl", comparatorName: "js" }
      },
      nestedProperties: ["user.name"]
    });

    items.insert([
      { user: { name: "patterson", age: 10, location: "a" } },
      { user: { name: "gilbertson", age: 20, location: "b" } },
      { user: { name: "smith", age: 30, location: "c" } },
      { user: { name: "donaldson", age: 40, location: "d" } },
      { user: { name: "harrison", age: 50, location: "e" } },
      { user: { name: "thompson", age: 60, location: "f" } },
      { user: { name: "albertson", age: 70, location: "g" } },
      { user: { name: "fiset", age: 80, location: "h" } }
    ]);

    // $eq
    let results: TestUserType[] = items.find({ "user.name": "donaldson" });
    expect(results.length).toEqual(1);
    expect(results[0].user.name).toEqual("donaldson");
    expect(results[0].user.age).toEqual(40);
    expect(results[0].user.location).toEqual("d");

    // $lt
    results = items.find({ "user.name": { $lt: "giraffe" } });
    expect(results.length).toEqual(4);
    expect(results[0].user.name).toEqual("albertson");
    expect(results[1].user.name).toEqual("donaldson");
    expect(results[2].user.name).toEqual("fiset");
    expect(results[3].user.name).toEqual("gilbertson");

    // $lte
    results = items.find({ "user.name": { $lte: "fiset" } });
    expect(results.length).toEqual(3);
    expect(results[0].user.name).toEqual("albertson");
    expect(results[1].user.name).toEqual("donaldson");
    expect(results[2].user.name).toEqual("fiset");

    // $gt
    results = items.find({ "user.name": { $gt: "giraffe" } });
    expect(results.length).toEqual(4);
    expect(results[0].user.name).toEqual("harrison");
    expect(results[1].user.name).toEqual("patterson");
    expect(results[2].user.name).toEqual("smith");
    expect(results[3].user.name).toEqual("thompson");

    // $gte
    results = items.find({ "user.name": { $gte: "patterson" } });
    expect(results.length).toEqual(3);
    expect(results[0].user.name).toEqual("patterson");
    expect(results[1].user.name).toEqual("smith");
    expect(results[2].user.name).toEqual("thompson");

    // $between
    results = items.find({ "user.name": { $between: ["faraday", "samuel"] } });
    expect(results.length).toEqual(4);
    expect(results[0].user.name).toEqual("fiset");
    expect(results[1].user.name).toEqual("gilbertson");
    expect(results[2].user.name).toEqual("harrison");
    expect(results[3].user.name).toEqual("patterson");

    // simplesort
    results = items.chain().simplesort("user.name").data();
    expect(results.length).toEqual(8);
    expect(results[0].user.name).toEqual("albertson");
    expect(results[1].user.name).toEqual("donaldson");
    expect(results[2].user.name).toEqual("fiset");
    expect(results[3].user.name).toEqual("gilbertson");
    expect(results[4].user.name).toEqual("harrison");
    expect(results[5].user.name).toEqual("patterson");
    expect(results[6].user.name).toEqual("smith");
    expect(results[7].user.name).toEqual("thompson");

    // remove
    items.chain().find({ "user.name": { $lte: "goldman" } }).remove();
    results = items.find({ "user.name": { $lte: "samuels" } });
    expect(results.length).toEqual(2);
    expect(results[0].user.name).toEqual("harrison");
    expect(results[1].user.name).toEqual("patterson");

    // update
    items.chain().update((o) => { o.user.name = reverseString(o.user.name); return o; });
    results = items.find({ "user.name": { $gte: "nork" } });
    expect(results.length).toEqual(3);
    expect(results[0].user.name).toEqual("nosirrah");
    expect(results[1].user.name).toEqual("nospmoht");
    expect(results[2].user.name).toEqual("nosrettap");
  });

  it("avl index raises exceptions where appropriate", () => {
    let cmp: ILokiComparer<any> = (a: any, b: any) => { return (a > b) ? -1 : 0; };
    let avl = new AvlTreeIndex("test", cmp);

    // if inserting val <= 0, expect an error to be thrown
    expect(() => avl.insert(0, "test")).toThrow(new Error("avl index ids are required to be numbers greater than zero"));

    // if comparator returns value other than -1, 0, or 1, expect an error to be thrown
    let node1: TreeNode<any> = {
      id: 0, value: 0, parent: null, balance: 0, height: 0, left: null, right: null, siblings: []
    };
    let node2: TreeNode<any> = {
      id: 0, value: 0, parent: null, balance: 0, height: 0, left: null, right: null, siblings: []
    };

    let icmp = (a: any, b: any) => { return (a > b) ? -2 : 2; };
    cmp = icmp as any as ILokiComparer<any>;

    avl.comparator = cmp;

    expect(() => avl.insertNode(node1, node2)).toThrow(new Error("Invalid comparator result"));

    // attempting to remove a node from an avl tree which has no index should throw error
    avl.apex = null;
    expect(() => avl.remove(1)).toThrow(new Error("remove() : attempting remove when tree has no apex"));
  });
});
