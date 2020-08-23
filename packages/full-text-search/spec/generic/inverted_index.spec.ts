/* global describe, it, expect */
import { InvertedIndex, toCodePoints } from "../../src/inverted_index";

describe("inverted index", () => {

  let field1 = "Hello world, how are you today?!";
  let field2 = "Well done world...";
  let field3 = "I am good, and you?";
  let field4 = "Now again inside today! You...";
  let field5 = "Good bye NO! for all worlds...";

  it("get", () => {
    let ii = new InvertedIndex();
    expect(ii.docCount).toBeNumber();
    expect(ii.docStore instanceof Map).toBeTrue();
    expect(ii.totalFieldLength).toBeNumber();
    expect(ii.analyzer).toBeObject();
    expect(ii.root instanceof Map).toBeTrue();
  });

  it("insert", () => {
    let ii = new InvertedIndex();
    ii.insert(field1, 1);
    expect(() => ii.insert(field2, 1)).toThrowErrorOfType("Error");
    ii.insert(field3, 2);
    ii.insert(field4, 3);
    ii.insert(field4, 4);
    ii.insert(field5, 5);
  });

  it("remove", () => {
    let ii = new InvertedIndex();
    ii.insert(field1, 1);
    ii.insert(field2, 2);
    ii.remove(1);
    ii.remove(2);
    ii.remove(15);
  });

  it("insert and remove empty does not change document count", () => {
    let ii = new InvertedIndex();
    ii.insert(field1, 1);
    expect(ii.docCount).toEqual(1);
    ii.insert("", 2);
    expect(ii.docCount).toEqual(1);
    ii.remove(2);
    expect(ii.docCount).toEqual(1);
    ii.remove(1);
    expect(ii.docCount).toEqual(0);
  });

  it("getTermIndex", () => {
    let ii = new InvertedIndex();
    ii.insert(field1, 1);
    ii.insert(field2, 2);
    ii.insert(field3, 3);
    ii.insert(field4, 4);

    expect(InvertedIndex.getTermIndex(toCodePoints("you"), ii.root)).not.toBe(null);
    expect(InvertedIndex.getTermIndex(toCodePoints("ayou"), ii.root, 1)).not.toBe(null);
    expect(InvertedIndex.getTermIndex(toCodePoints("you"), ii.root, 10)).toBe(null);
    expect(InvertedIndex.getTermIndex(toCodePoints("xyz1234"), ii.root)).toBe(null);
  });


  it("extendTermIndex", () => {
    let ii = new InvertedIndex();
    ii.insert(field1, 1);
    expect(InvertedIndex.extendTermIndex(ii.root).length).toEqual(6);
  });

  it("serialize", () => {
    let ii1 = new InvertedIndex();
    ii1.insert(field1, 1);
    ii1.insert(field2, 2);
    ii1.insert(field3, 3);

    let ii2 = new InvertedIndex();
    ii2.insert(field1, 1);
    ii2.insert(field2, 2);
    ii2.insert(field3, 3);
    ii2.insert(field4, 4);

    let ii3 = InvertedIndex.fromJSONObject(JSON.parse(JSON.stringify(ii2)));

    expect(JSON.stringify(ii3)).toEqual(JSON.stringify(ii2));
    ii2.remove(4);
    ii3.remove(4);
    expect(JSON.stringify(ii2)).toEqual(JSON.stringify(ii1));
    expect(JSON.stringify(ii3)).toEqual(JSON.stringify(ii1));
    expect(JSON.stringify(ii3)).toEqual(JSON.stringify(ii2));

    ii2.remove(1);
    ii3.remove(2);
    expect(JSON.stringify(ii2)).not.toEqual(JSON.stringify(ii1));
    expect(JSON.stringify(ii3)).not.toEqual(JSON.stringify(ii1));
    expect(JSON.stringify(ii3)).not.toEqual(JSON.stringify(ii2));

    ii1.remove(1);
    ii1.remove(2);
    ii2.remove(2);
    ii3.remove(1);
    expect(JSON.stringify(ii2)).toEqual(JSON.stringify(ii1));
    expect(JSON.stringify(ii3)).toEqual(JSON.stringify(ii1));
    expect(JSON.stringify(ii3)).toEqual(JSON.stringify(ii2));

    ii2 = InvertedIndex.fromJSONObject(JSON.parse(JSON.stringify(ii1)));
    expect(JSON.stringify(ii2)).toEqual(JSON.stringify(ii1));

    ii1.insert(field5, 5);
    expect(JSON.stringify(ii2)).not.toEqual(JSON.stringify(ii1));
    expect(JSON.stringify(ii3)).not.toEqual(JSON.stringify(ii1));

    ii1.remove(5);
    expect(JSON.stringify(ii2)).toEqual(JSON.stringify(ii1));
    expect(JSON.stringify(ii3)).toEqual(JSON.stringify(ii1));
    expect(JSON.stringify(ii3)).toEqual(JSON.stringify(ii2));

    // Check if still can be used
    ii3.insert(field5, 6);
    ii3.remove(6);
  });

  it("serialize without store", () => {
    let ii1 = new InvertedIndex({store: false});
    ii1.insert(field1, 1);
    ii1.insert(field2, 2);
    ii1.insert(field3, 3);

    let ii2 = InvertedIndex.fromJSONObject(JSON.parse(JSON.stringify(ii1)));
    ii2.insert(field1, 1);
    ii2.insert(field2, 2);
    ii2.insert(field3, 3);

    expect(JSON.stringify(ii1)).toEqual(JSON.stringify(ii2));
    ii1["_store"] = true;
    ii2["_store"] = true;
    expect(JSON.stringify(ii1)).toEqual(JSON.stringify(ii2));

    ii2.insert(field4, 4);
    expect(JSON.stringify(ii1)).not.toEqual(JSON.stringify(ii2));
  });

  it("serialize without optimization", () => {
    let ii1 = new InvertedIndex({optimizeChanges: false});
    ii1.insert(field1, 1);
    ii1.insert(field2, 2);
    ii1.insert(field3, 3);

    let ii2 = new InvertedIndex({optimizeChanges: false});
    ii2.insert(field1, 1);
    ii2.insert(field2, 2);
    ii2.insert(field3, 3);
    ii2.insert(field4, 4);

    let ii3 = InvertedIndex.fromJSONObject(JSON.parse(JSON.stringify(ii2)));
    expect(JSON.stringify(ii3)).toEqual(JSON.stringify(ii2));
    ii2.remove(4);
    ii3.remove(4);
    expect(JSON.stringify(ii2)).toEqual(JSON.stringify(ii1));
    expect(JSON.stringify(ii3)).toEqual(JSON.stringify(ii1));
    expect(JSON.stringify(ii3)).toEqual(JSON.stringify(ii2));

    ii2.remove(1);
    ii3.remove(2);
    expect(JSON.stringify(ii2)).not.toEqual(JSON.stringify(ii1));
    expect(JSON.stringify(ii3)).not.toEqual(JSON.stringify(ii1));
    expect(JSON.stringify(ii3)).not.toEqual(JSON.stringify(ii2));

    // Compare with optimized inverted index.
    let iio3 = new InvertedIndex();
    iio3.insert(field1, 1);
    iio3.insert(field3, 3);
    expect(JSON.stringify(ii3.root)).toEqual(JSON.stringify(iio3.root));

    ii1.remove(1);
    ii1.remove(2);
    ii2.remove(2);
    ii3.remove(1);
    expect(JSON.stringify(ii2)).toEqual(JSON.stringify(ii1));
    expect(JSON.stringify(ii3)).toEqual(JSON.stringify(ii1));
    expect(JSON.stringify(ii3)).toEqual(JSON.stringify(ii2));

    ii2 = InvertedIndex.fromJSONObject(JSON.parse(JSON.stringify(ii1)));
    expect(JSON.stringify(ii2)).toEqual(JSON.stringify(ii1));

    ii1.insert(field5, 5);
    expect(JSON.stringify(ii2)).not.toEqual(JSON.stringify(ii1));
    expect(JSON.stringify(ii3)).not.toEqual(JSON.stringify(ii1));

    ii1.remove(5);
    expect(JSON.stringify(ii2)).toEqual(JSON.stringify(ii1));
    expect(JSON.stringify(ii3)).toEqual(JSON.stringify(ii1));
    expect(JSON.stringify(ii3)).toEqual(JSON.stringify(ii2));

    // Check if still can be used
    ii3.insert(field5, 6);
    ii3.remove(6);
  });
});
