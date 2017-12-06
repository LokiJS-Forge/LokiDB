/* global describe, it, expect */
import {Loki} from "../../src/loki";
import {Doc} from "../../../common/types";

describe("typed", () => {
  it("works", () => {
    const db = new Loki("test.json");
    let users;

    class User {
      public name?: string;
      public customInflater?: boolean;
      public onlyInflater?: boolean;
      constructor(name: string = "") {
        this.name = name;
      }
    }

    const json = {
      "filename": "test.json",
      "_collections": [{
        "name": "users",
        "data": [{
          "name": "joe",
          "meta": {
            "version": 0,
            "created": 1415467401386,
            "revision": 0
          },
          "$loki": 1
        }, {
          "name": "jack",
          "meta": {
            "version": 0,
            "created": 1415467401388,
            "revision": 0
          },
          "$loki": 2
        }],
        "idIndex": [1, 2],
        "binaryIndices": {},
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

    users = db.getCollection<User>("users");

    expect(users.get(1) instanceof User).toBe(true);
    expect(users.get(1).name).toBe("joe");

    // Loading using proto and inflate:
    db.loadJSON(JSON.stringify(json), {
      users: {
        proto: User,
        inflate: function (src: Doc<User>, dest: Doc<User>) {
          dest.$loki = src.$loki;
          dest.meta = src.meta;
          dest.customInflater = true;
        }
      }
    });

    users = db.getCollection<User>("users");

    expect(users.get(1) instanceof User).toBe(true);
    expect(users.get(1).name).toBe("");
    expect(users.get(1).customInflater).toBe(true);

    // Loading only using inflate:
    db.loadJSON(JSON.stringify(json), {
      users: {
        inflate: function (src: Doc<User>) {
          return {
            $loki: src.$loki,
            meta: src.meta,
            onlyInflater: true
          };
        }
      }
    });

    users = db.getCollection<User>("users");

    expect(users.get(1) instanceof User).toBe(false);
    expect(users.get(1).name).toBe(undefined);
    expect(users.get(1).onlyInflater).toBe(true);
  });
});
