/* global describe, it, expect */
import {web_func} from "../../src/index";

describe("test", () => {
  it("web", () => {
    expect(web_func()).toEqual(300);
  });
});

