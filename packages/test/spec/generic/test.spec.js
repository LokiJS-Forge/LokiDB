/* global describe, it, expect */
import {func} from "../../src/index";

describe("test", () => {
  it("generic", () => {
    expect(func()).toEqual(100);
  });
});

