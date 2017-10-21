/* global describe, beforeEach, it, expect */
import {Loki} from "../../src/loki";

describe("eventEmitter", () => {
  let db: Loki;
  let users;

  beforeEach(() => {
    db = new Loki("test");
    users = db.addCollection("users", {
      asyncListeners: false
    });

    users.insert({
      name: "joe"
    });
  });

  it("async", function testAsync() {
    expect(db["asyncListeners"]).toBe(false);
  });

  it("emit", () => {
    const index = db.on("test", function test(obj: any) {
      expect(obj).toEqual(42);
    });

    db.emit("test", 42);
    db.removeListener("test", index);

    expect(db["events"]["test"].length).toEqual(0);
  });
});
