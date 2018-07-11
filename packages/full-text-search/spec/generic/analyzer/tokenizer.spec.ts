/* global describe, it, expect */
import { whitespaceTokenizer } from "../../../src/analyzer/tokenizer";

describe("tokenizer", () => {

  it("whitespaceTokenizer", () => {
    expect(whitespaceTokenizer("")).toEqual([""]);
    expect(whitespaceTokenizer("abc d'ef 123.")).toEqual(["abc", "d'ef", "123."]);
  });
});
