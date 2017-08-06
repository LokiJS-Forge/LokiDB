/* global describe, it, expect */
import {node_func} from "../../src/index";

describe("test", () => {
  it("node", () => {
    expect(node_func()).toEqual(200);
  });
});

