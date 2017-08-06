/* global describe, it, expect */
import {Loki as loki} from '../../src/loki';

describe('transforms', () => {
  let db, items;

  beforeEach(() => {
    db = new loki('transformTest'),
			items = db.addCollection('items');

    items.insert({name: 'mjolnir', owner: 'thor', maker: 'dwarves'});
    items.insert({name: 'gungnir', owner: 'odin', maker: 'elves'});
    items.insert({name: 'tyrfing', owner: 'Svafrlami', maker: 'dwarves'});
    items.insert({name: 'draupnir', owner: 'odin', maker: 'elves'});
  });

  describe('basic find transform', () => {
    it('works', () => {

      const tx = [
        {
          type: 'find',
          value: {
            owner: 'odin'
          }
        }
      ];

      const results = items.chain(tx).data();

      expect(results.length).toBe(2);
    });
  });

  describe('basic multi-step transform', () => {
    it('works', () => {

      const tx = [
        {
          type: 'find',
          value: {
            owner: 'odin'
          }
        },
        {
          type: 'where',
          value: function (obj) {
            return (obj.name.indexOf("drau") !== -1);
          }
        }
      ];

      const results = items.chain(tx).data();

      expect(results.length).toBe(1);
    });
  });

  describe('parameterized find', () => {
    it('works', () => {

      const tx = [
        {
          type: 'find',
          value: {
            owner: '[%lktxp]OwnerName'
          }
        }
      ];

      const params = {
        OwnerName: 'odin'
      };

      const results = items.chain(tx, params).data();

      expect(results.length).toBe(2);
    });
  });

  describe('parameterized where', () => {
    it('works', () => {

      const tx = [
        {
          type: 'where',
          value: '[%lktxp]NameFilter'
        }
      ];

      const params = {
        NameFilter: function (obj) {
          return (obj.name.indexOf("nir") !== -1);
        }
      };

      const results = items.chain(tx, params).data();

      expect(results.length).toBe(3);
    });
  });

  describe('named find transform', () => {
    it('works', () => {

      const tx = [
        {
          type: 'find',
          value: {
            owner: '[%lktxp]OwnerName'
          }
        }
      ];

      items.addTransform("OwnerLookup", tx);

      const params = {
        OwnerName: 'odin'
      };

      const results = items.chain("OwnerLookup", params).data();

      expect(results.length).toBe(2);
    });
  });

  describe('dynamic view named transform', () => {
    it('works', () => {
      const testColl = db.addCollection('test');

      testColl.insert({
        a: 'first',
        b: 1
      });

      testColl.insert({
        a: 'second',
        b: 2
      });

      testColl.insert({
        a: 'third',
        b: 3
      });

      testColl.insert({
        a: 'fourth',
        b: 4
      });

      testColl.insert({
        a: 'fifth',
        b: 5
      });

      testColl.insert({
        a: 'sixth',
        b: 6
      });

      testColl.insert({
        a: 'seventh',
        b: 7
      });

      testColl.insert({
        a: 'eighth',
        b: 8
      });

			// our view should allow only first 4 test records
      const dv = testColl.addDynamicView('lower');
      dv.applyFind({b: {'$lte': 4}});

			// our transform will desc sort string column as 'third', 'second', 'fourth', 'first',
			// and then limit to first two
      const tx = [
        {
          type: 'simplesort',
          property: 'a',
          desc: true
        },
        {
          type: 'limit',
          value: 2
        }
      ];

      expect(dv.branchResultset(tx).data().length).toBe(2);

			// now store as named (collection) transform and run off dynamic view
      testColl.addTransform("desc4limit2", tx);

      const results = dv.branchResultset("desc4limit2").data();

      expect(results.length).toBe(2);
      expect(results[0].a).toBe("third");
      expect(results[1].a).toBe("second");

    });
  });

});
