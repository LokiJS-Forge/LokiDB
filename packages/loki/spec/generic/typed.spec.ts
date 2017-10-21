/* global describe, it, expect */
import {Loki} from "../../src/loki";

describe("typed", () => {
  it("works", () => {
    const db = new Loki("test.json");
    let users;

    function User(n: any) {
      this.name = n || "";
    }

    const json = {
      "filename": "test.json",
      "collections": [{
        "name": "users",
        "data": [{
          "name": "joe",
          "objType": "users",
          "meta": {
            "version": 0,
            "created": 1415467401386,
            "revision": 0
          },
          "$loki": 1
        }, {
          "name": "jack",
          "objType": "users",
          "meta": {
            "version": 0,
            "created": 1415467401388,
            "revision": 0
          },
          "$loki": 2
        }],
        "idIndex": [1, 2],
        "binaryIndices": {},
        "objType": "users",
        "transactional": false,
        "maxId": 2
      }],
      "events": {
      },
      "ENV": "NODEJS",
      "fs": {}
    };

    // Loading only using proto:
    db.loadJSON(JSON.stringify(json), {
      users: {
        proto: User
      }
    });

    users = db.getCollection("users");

    expect(users.get(1) instanceof User).toBe(true);
    expect(users.get(1).name).toBe("joe");

    // Loading using proto and inflate:
    db.loadJSON(JSON.stringify(json), {
      users: {
        proto: User,
        inflate: function (src: any, dest: any) {
          dest.$loki = src.$loki;
          dest.meta = src.meta;
          dest.customInflater = true;
        }
      }
    });

    users = db.getCollection("users");

    expect(users.get(1) instanceof User).toBe(true);
    expect(users.get(1).name).toBe("");
    expect(users.get(1).customInflater).toBe(true);

    // Loading only using inflate:
    db.loadJSON(JSON.stringify(json), {
      users: {
        inflate: function (src: any) {
          const dest: any = {};

          dest.$loki = src.$loki;
          dest.meta = src.meta;
          dest.onlyInflater = true;

          return dest;
        }
      }
    });

    users = db.getCollection("users");

    expect(users.get(1) instanceof User).toBe(false);
    expect(users.get(1).name).toBe(undefined);
    expect(users.get(1).onlyInflater).toBe(true);
  });
});
