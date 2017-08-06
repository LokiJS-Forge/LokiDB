/* global describe, it, expect */
import {g} from "../../src/index";

describe("autoupdate", () => {
  it("auto updates inserted documents", () => {
    expect(g()).toEqual(1);
  });
});

