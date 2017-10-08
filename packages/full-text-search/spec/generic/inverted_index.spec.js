/* global describe, it, expect */
import {InvertedIndex} from "../../src/inverted_index";

describe("inverted index", () => {

  let ii = new InvertedIndex();

  let field1 = "Hello world, how are you today?!";
  let field2 = "Well done world...";
  let field3 = "I am good, and you?";
  let field4 = "Now again inside today! You...";
  let field5 = "Good bye NO! for all worlds...";

  it ("get", () => {
    expect(ii.documentCount).toBeNumber();
    expect(ii.documentStore).toBeObject();
    expect(ii.totalFieldLength).toBeNumber();
    expect(ii.tokenizer).toBeObject();
    expect(ii.root).toBeObject();
  });

  it("insert", () => {
    ii.insert(field1, 1);
    expect(() =>ii.insert(field2, 1)).toThrowErrorOfType("Error");
    ii.insert(field3, 2);

    ii.tokenizer.add("bad_tokenizer", () => [""]);
    ii.insert(field4, 3);
    ii.tokenizer.remove("bad_tokenizer");
    ii.insert(field4, 4);
    ii.insert(field5, 5);
  });

  it("remove", () => {
    ii.remove(1);
    ii.remove(4);
    ii.remove(15);
  });

  it("getTermIndex", () => {
    expect(InvertedIndex.getTermIndex("you", ii.root)).not.toBe(null);
    expect(InvertedIndex.getTermIndex("ayou", ii.root, 1)).not.toBe(null);
    expect(InvertedIndex.getTermIndex("you", ii.root, 10)).toBe(null);
    expect(InvertedIndex.getTermIndex("xyz1234", ii.root)).toBe(null);
  });

  it("getNextTermIndex", () => {
    InvertedIndex.getNextTermIndex(ii.root);
    let idx = InvertedIndex.getTermIndex("you", ii.root);
    expect(InvertedIndex.getNextTermIndex(idx)).not.toBe(null);
  });

  it("extendTermIndex", () => {
    expect(InvertedIndex.extendTermIndex(ii.root)).toBeArray();
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
