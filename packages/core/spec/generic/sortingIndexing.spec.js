/* global describe, it, expect */
import {Loki as loki} from '../../src/loki';

describe('sorting and indexing', () => {
  let db;
  let items;

  beforeEach(() => {
    db = new loki('sortingIndexingTest'),
			items = db.addCollection('items');

    items.insert({name: 'mjolnir', owner: 'thor', maker: 'dwarves'});
    items.insert({name: 'gungnir', owner: 'odin', maker: 'elves'});
    items.insert({name: 'tyrfing', owner: 'Svafrlami', maker: 'dwarves'});
    items.insert({name: 'draupnir', owner: 'odin', maker: 'elves'});
  });

  describe('resultset simplesort', () => {
    it('works', () => {
      const rss = db.addCollection('rssort');

      rss.insert({a: 4, b: 2});
      rss.insert({a: 7, b: 1});
      rss.insert({a: 3, b: 4});
      rss.insert({a: 9, b: 5});

      const results = rss.chain().simplesort('a').data();
      expect(results[0].a).toBe(3);
      expect(results[1].a).toBe(4);
      expect(results[2].a).toBe(7);
      expect(results[3].a).toBe(9);
    });
  });

  describe('resultset simplesort descending', () => {
    it('works', () => {
      const rss = db.addCollection('rssort');

      rss.insert({a: 4, b: 2});
      rss.insert({a: 7, b: 1});
      rss.insert({a: 3, b: 4});
      rss.insert({a: 9, b: 5});

      let results = rss.chain().simplesort('a', true).data();
      expect(results[0].a).toBe(9);
      expect(results[1].a).toBe(7);
      expect(results[2].a).toBe(4);
      expect(results[3].a).toBe(3);

			// test when indexed
      const rss2 = db.addCollection('rssort2', {indices: ['a']});

      rss2.insert({a: 4, b: 2});
      rss2.insert({a: 7, b: 1});
      rss2.insert({a: 3, b: 4});
      rss2.insert({a: 9, b: 5});

      results = rss2.chain().simplesort('a', true).data();
      expect(results[0].a).toBe(9);
      expect(results[1].a).toBe(7);
      expect(results[2].a).toBe(4);
      expect(results[3].a).toBe(3);
    });
  });

  describe('resultset simplesort with dates', () => {
    it('works', () => {
      const now = new Date().getTime();
      const dt1 = new Date(now - 1000);
      const dt2 = new Date(now + 5000);
      const dt3 = new Date(2000, 6, 1);
      const dt4 = new Date(now + 2000);
      const dt5 = new Date(now - 3000);

      const rss = db.addCollection('rssort');

      rss.insert({a: 1, b: dt1});
      rss.insert({a: 2, b: dt2});
      rss.insert({a: 3, b: dt3});
      rss.insert({a: 4, b: dt4});
      rss.insert({a: 5, b: dt5});

      const results = rss.chain().simplesort('b').data();
      expect(results[0].a).toBe(3);
      expect(results[1].a).toBe(5);
      expect(results[2].a).toBe(1);
      expect(results[3].a).toBe(4);
      expect(results[4].a).toBe(2);
    });
  });

  describe('resultset sort works correctly', () => {
    it('works', () => {
      const db = new loki('test.db');
      const coll = db.addCollection('coll');

      coll.insert([{a: 1, b: 9, c: 'first'}, {a: 5, b: 7, c: 'second'}, {a: 2, b: 9, c: 'third'}]);

      const sortfun = (obj1, obj2) => {
        if (obj1.a === obj2.a) return 0;
        if (obj1.a > obj2.a) return 1;
        if (obj1.a < obj2.a) return -1;
      };

      const result = coll.chain().sort(sortfun).data();
      expect(result.length).toEqual(3);
      expect(result[0].a).toEqual(1);
      expect(result[1].a).toEqual(2);
      expect(result[2].a).toEqual(5);
    });
  });

  describe('resultset compoundsort works correctly', () => {
    it('works', () => {
      const db = new loki('test.db');
      const coll = db.addCollection('coll');

      coll.insert([{a: 1, b: 9, c: 'first'}, {a: 5, b: 7, c: 'second'}, {a: 2, b: 9, c: 'third'}]);

      let result = coll.chain().compoundsort(['b', 'c']).data();
      expect(result.length).toEqual(3);
      expect(result[0].a).toEqual(5);
      expect(result[1].a).toEqual(1);
      expect(result[2].a).toEqual(2);

      result = coll.chain().compoundsort(['b', ['c', true]]).data();
      expect(result.length).toEqual(3);
      expect(result[0].a).toEqual(5);
      expect(result[1].a).toEqual(2);
      expect(result[2].a).toEqual(1);
    });
  });

  describe('collection indexing', () => {
    it('mixed types sort as expected', () => {
      const mtdb = new loki('mtdb');
      const coll = db.addCollection('coll');
      coll.insert({a: undefined, b: 5});
      coll.insert({b: 5});
      coll.insert({a: null, b: 5});
      coll.insert({a: 7, b: 5});
      coll.insert({a: '7', b: 5});
      coll.insert({a: 7.0, b: 5});
      coll.insert({a: '11', b: 5});
      coll.insert({a: '4', b: 5});
      coll.insert({a: new Date(), b: 5});
      coll.insert({a: {ack: "object"}, b: 5});
      coll.insert({a: 7.5, b: 5});
      coll.insert({a: NaN, b: 5});
      coll.insert({a: [8, 1, 15], b: 5});
      coll.insert({a: 'asdf', b: 5});

      let indexVals = [];

			// make sure unindexed sort is as expected

      const result = coll.chain().simplesort("a").data();
      result.forEach((obj) => {
        indexVals.push(obj.a);
      });

      expect(indexVals.length).toEqual(14);

			// undefined, null, or NaN
      expect(indexVals[0] !== indexVals[0]).toEqual(true);
      expect(indexVals[1] == null).toEqual(true);
      expect(indexVals[2] == null).toEqual(true);
      expect(indexVals[3] == null).toEqual(true);

      expect(indexVals[4] === "4").toEqual(true);
      expect(indexVals[5] === "7" || indexVals[5] === 7).toEqual(true);
      expect(indexVals[6] === "7" || indexVals[5] === 7).toEqual(true);
      expect(indexVals[7] === "7" || indexVals[5] === 7).toEqual(true);
      expect(indexVals[8] === 7.5).toEqual(true);
      expect(indexVals[9] === "11").toEqual(true);
      expect(indexVals[10] instanceof Date).toEqual(true);
      expect(Array.isArray(indexVals[11])).toEqual(true);
      expect(typeof indexVals[12] === "object").toEqual(true);
      expect(indexVals[13] === "asdf").toEqual(true);

			// now make sure binary index uses same range
      indexVals = [];
      coll.ensureIndex('a');

      coll.binaryIndices.a.values.forEach((vi) => {
        indexVals.push(coll.data[vi].a);
      });

      expect(indexVals.length).toEqual(14);

			// undefined, null, or NaN
      expect(indexVals[0] !== indexVals[0]).toEqual(true);
      expect(indexVals[1] == null).toEqual(true);
      expect(indexVals[2] == null).toEqual(true);
      expect(indexVals[3] == null).toEqual(true);

      expect(indexVals[4] === "4").toEqual(true);
      expect(indexVals[5] === "7" || indexVals[5] === 7).toEqual(true);
      expect(indexVals[6] === "7" || indexVals[5] === 7).toEqual(true);
      expect(indexVals[7] === "7" || indexVals[5] === 7).toEqual(true);
      expect(indexVals[8] === 7.5).toEqual(true);
      expect(indexVals[9] === "11").toEqual(true);
      expect(indexVals[10] instanceof Date).toEqual(true);
      expect(Array.isArray(indexVals[11])).toEqual(true);
      expect(typeof indexVals[12] === "object").toEqual(true);
      expect(indexVals[13] === "asdf").toEqual(true);
    });

    it('works', () => {
      const now = new Date().getTime();
      const dt1 = new Date(now - 1000);
      const dt2 = new Date(now + 5000);
      const dt3 = new Date(2000, 6, 1);
      const dt4 = new Date(now + 2000);
      const dt5 = new Date(now - 3000);

      const cidx = db.addCollection('collidx', {indices: ['b']});

      cidx.insert({a: 1, b: dt1});
      cidx.insert({a: 2, b: dt2});
      cidx.insert({a: 3, b: dt3});
      cidx.insert({a: 4, b: dt4});
      cidx.insert({a: 5, b: dt5});

			// force index build while simultaneously testing date equality test
      let results = cidx.find({'b': {$aeq: dt2}});
      expect(results[0].a).toBe(2);

			// NOTE :
			// Binary Index imposes loose equality checks to construct its order
			// Strict equality checks would need to be extra filtering phase
      const sdt = new Date(now + 5000);


			// after refactoring binary indices to be loose equality/ranges everywhere,
			// this unit test passed, meaning the dteq op is not needed if binary index exists

			//results = cidx.find({'b': sdt});
			//expect(results.length).toBe(0);

			// now try with new $dteq operator
      results = cidx.find({'b': {'$dteq': sdt}});
      expect(results.length).toBe(1);
      expect(results[0].a).toBe(2);

			// now verify indices
			// they are array of 'positions' so both array index and value are zero based
      expect(cidx.binaryIndices.b.values[0]).toBe(2);
      expect(cidx.binaryIndices.b.values[1]).toBe(4);
      expect(cidx.binaryIndices.b.values[2]).toBe(0);
      expect(cidx.binaryIndices.b.values[3]).toBe(3);
      expect(cidx.binaryIndices.b.values[4]).toBe(1);
    });
  });

});
