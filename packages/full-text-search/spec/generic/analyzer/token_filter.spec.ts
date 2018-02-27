/* global describe, it, expect */
import {lowercaseTokenFilter, uppercaseTokenFilter} from "../../../src/analyzer/token_filter";

describe("token filter", () => {

  it("lowercaseTokenFilter", () => {
    expect(lowercaseTokenFilter("")).toEqual("");
    expect(lowercaseTokenFilter("Abc")).toEqual("abc");
    expect(lowercaseTokenFilter("c'eEf.")).toEqual("c'eef.");
    expect(lowercaseTokenFilter("def")).toEqual("def");
    expect(lowercaseTokenFilter("12.3")).toEqual("12.3");
  });

  it("uppercaseTokenFilter", () => {
    expect(uppercaseTokenFilter("")).toEqual("");
    expect(uppercaseTokenFilter("Abc")).toEqual("ABC");
    expect(uppercaseTokenFilter("c'eEf.")).toEqual("C'EEF.");
    expect(uppercaseTokenFilter("DEF")).toEqual("DEF");
    expect(uppercaseTokenFilter("12.3")).toEqual("12.3");
  });
});
