/* global describe, it, expect */
import {Loki as loki} from '../../src/loki';
import {Collection} from '../../src/collection';

describe('collection', () => {
  it('works', () => {
		// function SubclassedCollection() {
		// 	Collection.apply(this, Array.prototype.slice.call(arguments));
		// }
		// SubclassedCollection.prototype = new Collection;
		// SubclassedCollection.prototype.extendedMethod = function () {
		// 	return this.name.toUpperCase();
		// }
    class SubclassedCollection extends Collection {
      constructor(...args) {
        super(...args);
      }

      extendedMethod() {
        return this.name.toUpperCase();
      }
		}

    const coll = new SubclassedCollection('users', {});

    expect(coll != null).toBe(true);
    expect('users'.toUpperCase()).toEqual(coll.extendedMethod());
    coll.insert({
      name: 'joe'
    });
    expect(coll.data.length).toEqual(1);
  });

  it('findAndUpdate works', () => {
    const db = new loki('test.db');
    const coll = db.addCollection('testcoll');
    coll.insert([{a: 3, b: 3}, {a: 6, b: 7}, {a: 1, b: 2}, {a: 7, b: 8}, {a: 6, b: 4}]);

    coll.findAndUpdate({a: 6}, (obj) => {
      obj.b += 1;
    });

    const result = coll.chain().find({a: 6}).simplesort("b").data();
    expect(result.length).toEqual(2);
    expect(result[0].b).toEqual(5);
    expect(result[1].b).toEqual(8);
  });

  it('findAndRemove works', () => {
    const db = new loki('test.db');
    const coll = db.addCollection('testcoll');
    coll.insert([{a: 3, b: 3}, {a: 6, b: 7}, {a: 1, b: 2}, {a: 7, b: 8}, {a: 6, b: 4}]);

    coll.findAndRemove({a: 6});

    expect(coll.data.length).toEqual(3);

    const result = coll.chain().find().simplesort("b").data();
    expect(result.length).toEqual(3);
    expect(result[0].b).toEqual(2);
    expect(result[1].b).toEqual(3);
    expect(result[2].b).toEqual(8);
  });

  it('removeWhere works', () => {
    const db = new loki('test.db');
    const coll = db.addCollection('testcoll');
    coll.insert([{a: 3, b: 3}, {a: 6, b: 7}, {a: 1, b: 2}, {a: 7, b: 8}, {a: 6, b: 4}]);

    coll.removeWhere((obj) => obj.a === 6);

    expect(coll.data.length).toEqual(3);

    const result = coll.chain().find().simplesort("b").data();
    expect(result.length).toEqual(3);
    expect(result[0].b).toEqual(2);
    expect(result[1].b).toEqual(3);
    expect(result[2].b).toEqual(8);
  });

  it('updateWhere works', () => {
    const db = new loki('test.db');
    const coll = db.addCollection('testcoll');
    coll.insert([{a: 3, b: 3}, {a: 6, b: 7}, {a: 1, b: 2}, {a: 7, b: 8}, {a: 6, b: 4}]);

		// guess we need to return object for this to work
    coll.updateWhere((fobj) => fobj.a === 6, (obj) => {
      obj.b += 1;
      return obj;
    });

    const result = coll.chain().find({a: 6}).simplesort("b").data();
    expect(result.length).toEqual(2);
    expect(result[0].b).toEqual(5);
    expect(result[1].b).toEqual(8);
  });

	// coll.mode(property) should return single value of property which occurs most in collection
	// if more than one value 'ties' it will just pick one
  it('mode works', () => {
    const db = new loki('test.db');
    const coll = db.addCollection('testcoll');
    coll.insert([{a: 3, b: 3}, {a: 6, b: 7}, {a: 1, b: 2}, {a: 7, b: 8}, {a: 6, b: 4}]);

		// seems mode returns string so loose equality
    const result = coll.mode('a') == 6;

    expect(result).toEqual(true);
  });

  it('single inserts emit with meta when async listeners false', () => {
    const db = new loki('test.db');
    const coll = db.addCollection('testcoll');

		// listen for insert events to validate objects
    coll.on("insert", (obj) => {
      expect(obj.hasOwnProperty('a')).toEqual(true);
      expect([3, 6, 1, 7, 5].indexOf(obj.a)).toBeGreaterThan(-1);

      switch (obj.a) {
        case 3:
          expect(obj.b).toEqual(3);
          break;
        case 6:
          expect(obj.b).toEqual(7);
          break;
        case 1:
          expect(obj.b).toEqual(2);
          break;
        case 7:
          expect(obj.b).toEqual(8);
          break;
        case 5:
          expect(obj.b).toEqual(4);
          break;
      }


      expect(obj.hasOwnProperty('$loki')).toEqual(true);
      expect(obj.hasOwnProperty('meta')).toEqual(true);
      expect(obj.meta.hasOwnProperty('revision')).toEqual(true);
      expect(obj.meta.hasOwnProperty('created')).toEqual(true);
      expect(obj.meta.hasOwnProperty('version')).toEqual(true);
      expect(obj.meta.revision).toEqual(0);
      expect(obj.meta.version).toEqual(0);
      expect(obj.meta.created).toBeGreaterThan(0);
    });

    coll.insert({a: 3, b: 3});
    coll.insert({a: 6, b: 7});
    coll.insert({a: 1, b: 2});
    coll.insert({a: 7, b: 8});
    coll.insert({a: 5, b: 4});
  });

  it('single inserts (with clone) emit meta and return instances correctly', () => {
    const db = new loki('test.db');
    const coll = db.addCollection('testcoll', {clone: true});

		// listen for insert events to validate objects
    coll.on("insert", (obj) => {
      expect(obj.hasOwnProperty('a')).toEqual(true);
      expect([3, 6, 1, 7, 5].indexOf(obj.a)).toBeGreaterThan(-1);

      switch (obj.a) {
        case 3:
          expect(obj.b).toEqual(3);
          break;
        case 6:
          expect(obj.b).toEqual(7);
          break;
        case 1:
          expect(obj.b).toEqual(2);
          break;
        case 7:
          expect(obj.b).toEqual(8);
          break;
        case 5:
          expect(obj.b).toEqual(4);
          break;
      }


      expect(obj.hasOwnProperty('$loki')).toEqual(true);
      expect(obj.hasOwnProperty('meta')).toEqual(true);
      expect(obj.meta.hasOwnProperty('revision')).toEqual(true);
      expect(obj.meta.hasOwnProperty('created')).toEqual(true);
      expect(obj.meta.hasOwnProperty('version')).toEqual(true);
      expect(obj.meta.revision).toEqual(0);
      expect(obj.meta.version).toEqual(0);
      expect(obj.meta.created).toBeGreaterThan(0);
    });

    const i1 = coll.insert({a: 3, b: 3});
    coll.insert({a: 6, b: 7});
    coll.insert({a: 1, b: 2});
    coll.insert({a: 7, b: 8});
    coll.insert({a: 5, b: 4});

		// verify that the objects returned from an insert are clones by tampering with values
    i1.b = 9;
    const result = coll.findOne({a: 3});
    expect(result.b).toEqual(3);
  });

  it('batch inserts emit with meta', () => {
    const db = new loki('test.db');
    const coll = db.addCollection('testcoll');

		// listen for insert events to validate objects
    coll.on("insert", (objs) => {
      expect(Array.isArray(objs)).toEqual(true);
      expect(objs.length).toEqual(5);

      expect(objs[0].b).toEqual(3);
      expect(objs[1].b).toEqual(7);
      expect(objs[2].b).toEqual(2);
      expect(objs[3].b).toEqual(8);
      expect(objs[4].b).toEqual(4);

      expect(objs[0].hasOwnProperty('$loki')).toEqual(true);
      expect(objs[1].hasOwnProperty('$loki')).toEqual(true);
      expect(objs[2].hasOwnProperty('$loki')).toEqual(true);
      expect(objs[3].hasOwnProperty('$loki')).toEqual(true);
      expect(objs[4].hasOwnProperty('$loki')).toEqual(true);

      expect(objs[0].hasOwnProperty('meta')).toEqual(true);
      expect(objs[1].hasOwnProperty('meta')).toEqual(true);
      expect(objs[2].hasOwnProperty('meta')).toEqual(true);
      expect(objs[3].hasOwnProperty('meta')).toEqual(true);
      expect(objs[4].hasOwnProperty('meta')).toEqual(true);

      expect(objs[0].meta.hasOwnProperty('revision')).toEqual(true);
      expect(objs[0].meta.hasOwnProperty('created')).toEqual(true);
      expect(objs[0].meta.hasOwnProperty('version')).toEqual(true);
      expect(objs[0].meta.revision).toEqual(0);
      expect(objs[0].meta.version).toEqual(0);
      expect(objs[0].meta.created).toBeGreaterThan(0);
    });

    coll.insert([{a: 3, b: 3}, {a: 6, b: 7}, {a: 1, b: 2}, {a: 7, b: 8}, {a: 5, b: 4}]);
  });

  it('batch inserts emit with meta and return clones', () => {
    const db = new loki('test.db');
    const coll = db.addCollection('testcoll', {clone: true});

		// listen for insert events to validate objects
    coll.on("insert", (objs) => {
      expect(Array.isArray(objs)).toEqual(true);
      expect(objs.length).toEqual(5);

      expect(objs[0].b).toEqual(3);
      expect(objs[1].b).toEqual(7);
      expect(objs[2].b).toEqual(2);
      expect(objs[3].b).toEqual(8);
      expect(objs[4].b).toEqual(4);

      expect(objs[0].hasOwnProperty('$loki')).toEqual(true);
      expect(objs[1].hasOwnProperty('$loki')).toEqual(true);
      expect(objs[2].hasOwnProperty('$loki')).toEqual(true);
      expect(objs[3].hasOwnProperty('$loki')).toEqual(true);
      expect(objs[4].hasOwnProperty('$loki')).toEqual(true);

      expect(objs[0].hasOwnProperty('meta')).toEqual(true);
      expect(objs[1].hasOwnProperty('meta')).toEqual(true);
      expect(objs[2].hasOwnProperty('meta')).toEqual(true);
      expect(objs[3].hasOwnProperty('meta')).toEqual(true);
      expect(objs[4].hasOwnProperty('meta')).toEqual(true);

      expect(objs[0].meta.hasOwnProperty('revision')).toEqual(true);
      expect(objs[0].meta.hasOwnProperty('created')).toEqual(true);
      expect(objs[0].meta.hasOwnProperty('version')).toEqual(true);
      expect(objs[0].meta.revision).toEqual(0);
      expect(objs[0].meta.version).toEqual(0);
      expect(objs[0].meta.created).toBeGreaterThan(0);
    });

    const obj1 = {a: 3, b: 3};
    const result = coll.insert([obj1, {a: 6, b: 7}, {a: 1, b: 2}, {a: 7, b: 8}, {a: 5, b: 4}]);

    expect(Array.isArray(result)).toEqual(true);

		// tamper original (after insert)
    obj1.b = 99;
		// returned values should have been clones of original
    expect(result[0].b).toEqual(3);

		// internal data references should have benn clones of original
    const obj = coll.findOne({a: 3});
    expect(obj.b).toEqual(3);
  });
});
