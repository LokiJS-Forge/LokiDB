/* global describe, it, expect */
import {Loki as loki} from '../../src/loki';
import {LokiMemoryAdapter} from '../../src/memory_adapter';

describe('dynamicviews', () => {
  let testRecords;
  let db, users, jonas;

  beforeEach(() => {
    testRecords = [
      {name: 'mjolnir', owner: 'thor', maker: 'dwarves'},
      {name: 'gungnir', owner: 'odin', maker: 'elves'},
      {name: 'tyrfing', owner: 'Svafrlami', maker: 'dwarves'},
      {name: 'draupnir', owner: 'odin', maker: 'elves'}
    ];

    db = new loki('test.json');
    users = db.addCollection('user');

    users.insert({
      name: 'dave',
      age: 25,
      lang: 'English'
    });

    users.insert({
      name: 'joe',
      age: 39,
      lang: 'Italian'
    });

    jonas = users.insert({
      name: 'jonas',
      age: 30,
      lang: 'Swedish'
    });
  });

  function docCompare(a, b) {
    if (a.$loki < b.$loki) return -1;
    if (a.$loki > b.$loki) return 1;

    return 0;
  }

  describe('test empty filter across changes', () => {
    it('works', () => {

      const db = new loki('dvtest');
      const items = db.addCollection('users');
      items.insert(testRecords);
      const dv = items.addDynamicView();

      // with no filter, results should be all documents
      let results = dv.data();
      expect(results.length).toBe(4);

      // find and update a document which will notify view to re-evaluate
      const gungnir = items.findOne({'name': 'gungnir'});
      expect(gungnir.owner).toBe('odin');
      gungnir.maker = 'dvalin';
      items.update(gungnir);

      results = dv.data();
      expect(results.length).toBe(4);
    });
  });

  describe('dynamic view rematerialize works as expected', () => {
    it('works', () => {
      const db = new loki('dvtest');
      const items = db.addCollection('users');
      items.insert(testRecords);
      const dv = items.addDynamicView();

      dv.applyFind({'owner': 'odin'});
      dv.applyWhere((obj) => obj.maker === 'elves');

      expect(dv.data().length).toEqual(2);
      expect(dv._filterPipeline.length).toEqual(2);

      dv.rematerialize({removeWhereFilters: true});
      expect(dv.data().length).toEqual(2);
      expect(dv._filterPipeline.length).toEqual(1);
    });
  });

  describe('dynamic view toJSON does not circularly reference', () => {
    it('works', () => {
      const db = new loki('dvtest');
      const items = db.addCollection('users');
      items.insert(testRecords);
      const dv = items.addDynamicView();

      const obj = dv.toJSON();
      expect(obj._collection).toEqual(undefined);
    });
  });

  describe('dynamic view removeFilters works as expected', () => {
    it('works', () => {
      const db = new loki('dvtest');
      const items = db.addCollection('users');
      items.insert(testRecords);
      const dv = items.addDynamicView("ownr");

      dv.applyFind({'owner': 'odin'});
      dv.applyWhere((obj) => obj.maker === 'elves');

      expect(dv._filterPipeline.length).toEqual(2);
      expect(dv.data().length).toEqual(2);

      dv.removeFilters();
      expect(dv._filterPipeline.length).toEqual(0);
      expect(dv.count()).toEqual(4);
    });
  });

  describe('removeDynamicView works correctly', () => {
    it('works', () => {
      const db = new loki('dvtest');
      const items = db.addCollection('users');
      items.insert(testRecords);
      const dv = items.addDynamicView("ownr", {persistent: true});

      dv.applyFind({'owner': 'odin'});
      dv.applyWhere((obj) => obj.maker === 'elves');

      expect(items._dynamicViews.length).toEqual(1);

      items.removeDynamicView('ownr');
      expect(items._dynamicViews.length).toEqual(0);
    });
  });

  describe('stepEvaluateDocument', () => {
    it('works', () => {
      const view = users.addDynamicView('test');
      const query = {
        'age': {
          '$gt': 24
        }
      };

      view.applyFind(query);

      // churn evaluateDocuments() to make sure it works right
      jonas.age = 23;
      users.update(jonas);
      // evaluate documents
      expect(view.data().length).toEqual(users.data.length - 1);
      jonas.age = 30;
      users.update(jonas);
      expect(view.data().length).toEqual(users.data.length);
      jonas.age = 23;
      users.update(jonas);
      expect(view.data().length).toEqual(users.data.length - 1);
      jonas.age = 30;
      users.update(jonas);
      expect(view.data().length).toEqual(users.data.length);

      // assert set equality of docArrays irrelevant of sort/sequence
      const result1 = users.find(query).sort(docCompare);
      const result2 = view.data().sort(docCompare);
      result1.forEach((obj) => {
        delete obj.meta;
      });
      result2.forEach((obj) => {
        delete obj.meta;
      });

      expect(result1).toEqual(result2, 'Result data Equality');

      //TODO: expect(users.find(query) === view.data()).toBeTruthy('Strict Equality');
      expect(view._resultset).toEqual(view._resultset.copy(), 'View data equality');
      expect(view._resultset === view._resultset.copy()).toBeFalsy('View data copy strict equality');

      return view;
    });
  });

  describe('stepDynamicViewPersistence', () => {
    it('works', () => {
      const query = {
        'age': {
          '$gt': 24
        }
      };

      // set up a persistent dynamic view with sort
      const pview = users.addDynamicView('test2', {
        persistent: true
      });
      pview.applyFind(query);
      pview.applySimpleSort('age');

      // the dynamic view depends on an internal resultset
      // the persistent dynamic view also depends on an internal resultdata data array
      // filteredrows should be applied immediately to resultset will be lazily built into resultdata later when data() is called
      expect(pview._resultset.filteredrows.length).toEqual(3, 'dynamic view initialization 1');
      expect(pview._resultdata.length).toEqual(0, 'dynamic view initialization 2');

      // compare how many documents are in results before adding new ones
      const pviewResultsetLenBefore = pview._resultset.filteredrows.length;

      users.insert({
        name: 'abc',
        age: 21,
        lang: 'English'
      });

      users.insert({
        name: 'def',
        age: 25,
        lang: 'English'
      });

      // now see how many are in  (without rebuilding persistent view)
      const pviewResultsetLenAfter = pview._resultset.filteredrows.length;

      // only one document should have been added to resultset (1 was filtered out)
      expect(pviewResultsetLenBefore + 1).toEqual(pviewResultsetLenAfter, 'dv resultset is valid');

      // Test sorting and lazy build of resultdata

      // retain copy of internal resultset's filteredrows before lazy sort
      const frcopy = pview._resultset.filteredrows.slice();
      pview.data();
      // now make a copy of internal result's filteredrows after lazy sort
      const frcopy2 = pview._resultset.filteredrows.slice();

      // verify filteredrows logically matches resultdata (irrelevant of sort)
      expect(frcopy2.length).not.toBe(0);
      for (let idxFR = 0; idxFR < frcopy2.length; idxFR++) {
        expect(pview._resultdata[idxFR]).not.toBe(undefined);
        expect(pview._resultdata[idxFR]).toEqual(pview._collection.data[frcopy2[idxFR]],
          'dynamic view resultset/resultdata consistency');
      }
      // now verify they are not exactly equal (verify sort moved stuff)
      expect(frcopy).not.toEqual(frcopy2, 'dynamic view sort');
    });
  });

  describe('stepDynamicViewPersistence', () => {
    it('works', () => {
      const test = db.addCollection('nodupes', ['index']);

      const item = test.insert({
        index: 'key',
        a: 1
      });

      let results = test.find({
        index: 'key'
      });
      expect(results.length).toEqual(1, 'one result exists');
      expect(results[0].a).toEqual(1, 'the correct result is returned');


      item.a = 2;
      test.update(item);

      results = test.find({
        index: 'key'
      });

      expect(results.length).toEqual(1, 'one result exists');
      expect(results[0].a).toEqual(2, 'the correct result is returned');
    });
  });

  describe('stepDynamicViewPersistence', () => {
    it('works', function testEmptyTableWithIndex() {
      const itc = db.addCollection('test', ['testindex']);

      const resultsNoIndex = itc.find({
        'testid': 2
      });
      expect(resultsNoIndex.length).toEqual(0);

      const resultsWithIndex = itc.find({
        'testindex': 4
      });
      it('no results found', () => {
        expect(resultsWithIndex.length).toEqual(0);
      });
    });
  });

  describe('stepDynamicViewPersistence', () => {
    it('works', (done) => {
      // mock persistence by using memory adapter
      const mem = new LokiMemoryAdapter();
      const db = new loki('testCollections', {adapter: mem});
      db.name = 'testCollections';
      it('DB name', () => {
        expect(db.getName()).toEqual('testCollections');
      });
      const t = db.addCollection('test1', {
        transactional: true
      });
      db.addCollection('test2');
      expect(() => t.remove('foo')).toThrowErrorOfType("Error", 'Throw error on wrong remove');
      expect(() => t.remove({
        name: 'joe'
      })).toThrowErrorOfType("Error", 'Throw error on non-synced doc');

      expect(db.listCollections().length).toEqual(2);
      t.clear();
      const users = [{
        name: 'joe'
      }, {
        name: 'dave'
      }];
      t.insert(users);

      expect(2).toEqual(t.data.length);
      t.remove(users);
      expect(0).toEqual(t.data.length);

      function TestError() {
      }

      TestError.prototype = new Error;
      db.autosaveEnable();
      db.on('close', () => {
        throw new TestError;
      });
      db.close().then(done.fail, done);
    });
  });
});
