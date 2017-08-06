/* global describe, it, expect */
import {Loki as loki} from '../../src/loki';

describe('typed', () => {
  it('works', () => {
    const db = new loki('test.json');
    let users;

    function User(n) {
      this.name = n || '';
      this.log = function () {
        console.log('Name: ' + this.name);
      };
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
        "cachedIndex": null,
        "cachedBinaryIndex": null,
        "cachedData": null,
        "maxId": 2,
        "DynamicViews": [],
        "events": {
          "insert": [null],
          "update": [null],
          "close": [],
          "flushbuffer": [],
          "error": [],
          "delete": []
        }
      }],
      "events": {
        "close": []
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

    users = db.getCollection('users');

    expect(users.get(1) instanceof User).toBe(true);
    expect(users.get(1).name).toBe("joe");

		// Loading using proto and inflate:
    db.loadJSON(JSON.stringify(json), {
      users: {
        proto: User,
        inflate: function (src, dest) {
          dest.$loki = src.$loki;
          dest.meta = src.meta;
          dest.customInflater = true;
        }
      }
    });

    users = db.getCollection('users');

    expect(users.get(1) instanceof User).toBe(true);
    expect(users.get(1).name).toBe("");
    expect(users.get(1).customInflater).toBe(true);

		// Loading only using inflate:
    db.loadJSON(JSON.stringify(json), {
      users: {
        inflate: function (src) {
          const dest = {};

          dest.$loki = src.$loki;
          dest.meta = src.meta;
          dest.onlyInflater = true;

          return dest;
        }
      }
    });

    users = db.getCollection('users');

    expect(users.get(1) instanceof User).toBe(false);
    expect(users.get(1).name).toBe(undefined);
    expect(users.get(1).onlyInflater).toBe(true);
  });
});
