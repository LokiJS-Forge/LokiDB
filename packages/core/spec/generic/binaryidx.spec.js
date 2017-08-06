/* global describe, it, expect */
import {Loki as loki} from '../../src/loki';

describe('binary indices', () => {
  let testRecords;

  beforeEach(() => {
    testRecords = [
			{name: 'mjolnir', owner: 'thor', maker: 'dwarves'},
			{name: 'gungnir', owner: 'odin', maker: 'elves'},
			{name: 'tyrfing', owner: 'Svafrlami', maker: 'dwarves'},
			{name: 'draupnir', owner: 'odin', maker: 'elves'}
    ];
  });

  describe('collection.clear affects binary indices correctly', () => {
    it('works', () => {
      const db = new loki('idxtest');
      const t2 = JSON.parse(JSON.stringify(testRecords));

      const items = db.addCollection('users', {indices: ['name']});
      items.insert(testRecords);
      expect(items.binaryIndices.name.values.length).toBe(4);
      items.clear();
      expect(items.binaryIndices.hasOwnProperty('name')).toEqual(true);
      expect(items.binaryIndices.name.values.length).toBe(0);
      items.insert(t2);
      expect(items.binaryIndices.name.values.length).toBe(4);
      items.clear({removeIndices: true});
      expect(items.binaryIndices.hasOwnProperty('name')).toEqual(false);
    });
  });

  describe('binary index loosly but reliably works across datatypes', () => {
    it('works', () => {
      const db = new loki('ugly.db');

			// Add a collection to the database
      const dirtydata = db.addCollection('dirtydata', {indices: ['b']});

			// Add some documents to the collection
      dirtydata.insert({a: 0});
      const b4 = {a: 1, b: 4};
      dirtydata.insert(b4);
      dirtydata.insert({a: 2, b: undefined});
      dirtydata.insert({a: 3, b: 3.14});
      dirtydata.insert({a: 4, b: new Date()});
      dirtydata.insert({a: 5, b: false});
      dirtydata.insert({a: 6, b: true});
      dirtydata.insert({a: 7, b: null});
      dirtydata.insert({a: 8, b: '0'});
      dirtydata.insert({a: 9, b: 0});
      dirtydata.insert({a: 10, b: 3});
      dirtydata.insert({a: 11, b: '3'});
      dirtydata.insert({a: 12, b: '4'});
    });
  });

  describe('index maintained across inserts', () => {
    it('works', () => {

      const db = new loki('idxtest');
      const items = db.addCollection('users', {indices: ['name']});
      items.insert(testRecords);

			// force index build
      items.find({name: 'mjolnir'});

      let bi = items.binaryIndices.name;
      expect(bi.values.length).toBe(4);
      expect(bi.values[0]).toBe(3);
      expect(bi.values[1]).toBe(1);
      expect(bi.values[2]).toBe(0);
      expect(bi.values[3]).toBe(2);

      items.insert({name: 'gjallarhorn', owner: 'heimdallr', maker: 'Gjöll'});

			// force index build
      items.find({name: 'mjolnir'});

			// reaquire values array
      bi = items.binaryIndices.name;

      expect(bi.values[0]).toBe(3);
      expect(bi.values[1]).toBe(4);
      expect(bi.values[2]).toBe(1);
      expect(bi.values[3]).toBe(0);
      expect(bi.values[4]).toBe(2);
    });
  });

  describe('index maintained across removes', () => {
    it('works', () => {

      const db = new loki('idxtest');
      const items = db.addCollection('users', {indices: ['name']});
      items.insert(testRecords);

			// force index build
      items.find({name: 'mjolnir'});

      let bi = items.binaryIndices.name;
      expect(bi.values.length).toBe(4);
      expect(bi.values[0]).toBe(3);
      expect(bi.values[1]).toBe(1);
      expect(bi.values[2]).toBe(0);
      expect(bi.values[3]).toBe(2);

      const tyrfing = items.findOne({name: 'tyrfing'});
      items.remove(tyrfing);

			// force index build
      items.find({name: 'mjolnir'});

			// reaquire values array
      bi = items.binaryIndices.name;

			// values are data array positions which should be collapsed, decrementing all index positions after the deleted
      expect(bi.values[0]).toBe(2);
      expect(bi.values[1]).toBe(1);
      expect(bi.values[2]).toBe(0);
    });
  });

  describe('index maintained across updates', () => {
    it('works', () => {

      const db = new loki('idxtest');
      const items = db.addCollection('users', {indices: ['name']});
      items.insert(testRecords);

			// force index build
      items.find({name: 'mjolnir'});

      let bi = items.binaryIndices.name;
      expect(bi.values.length).toBe(4);
      expect(bi.values[0]).toBe(3);
      expect(bi.values[1]).toBe(1);
      expect(bi.values[2]).toBe(0);
      expect(bi.values[3]).toBe(2);

      const tyrfing = items.findOne({name: 'tyrfing'});
      tyrfing.name = 'etyrfing';
      items.update(tyrfing);

			// force index build
      items.find({name: 'mjolnir'});

			// reaquire values array
      bi = items.binaryIndices.name;

      expect(bi.values[0]).toBe(3);
      expect(bi.values[1]).toBe(2);
      expect(bi.values[2]).toBe(1);
      expect(bi.values[3]).toBe(0);
    });
  });

  describe('positional lookup using get works', () => {
    it('works', () => {
			// Since we use coll.get's ability to do a positional lookup of a loki id during adaptive indexing we will test it here

			// let's base this off of our 'remove' test so data is more meaningful

      const db = new loki('idxtest');
      const items = db.addCollection('users', {indices: ['name']});
      items.insert(testRecords);

			// force index build
      items.find({name: 'mjolnir'});

      let dataPosition;

      let item = items.findOne({name: 'tyrfing'});
      items.remove(item);

      item = items.findOne({name: 'draupnir'});
      dataPosition = items.get(item.$loki, true);
      expect(dataPosition[1]).toBe(2);

      item = items.findOne({name: 'gungnir'});
      dataPosition = items.get(item.$loki, true);
      expect(dataPosition[1]).toBe(1);

      item = items.findOne({name: 'mjolnir'});
      dataPosition = items.get(item.$loki, true);
      expect(dataPosition[1]).toBe(0);
    });
  });

  describe('positional index lookup using getBinaryIndexPosition works', () => {
    it('works', () => {

			// Since our indexes contain -not loki id values- but coll.data[] positions
			// we shall verify our getBinaryIndexPosition method's ability to look up an
			// index value based on data array position function (obtained via get)

      const db = new loki('idxtest');
      const items = db.addCollection('users', {indices: ['name']});
      items.insert(testRecords);

			// force index build
      items.find({name: 'mjolnir'});

			// tyrfing should be in coll.data[2] since it was third added item and we have not deleted yet
      let pos = items.getBinaryIndexPosition(2, 'name');
			// yet in our index it should be fourth (array index 3) since sorted alphabetically
      expect(pos).toBe(3);

			// now remove draupnir
      const draupnir = items.findOne({name: 'draupnir'});
      items.remove(draupnir);

			// force index build
      items.find({name: 'mjolnir'});

			// tyrfing should be in coll.data[2] since it was third added item and we have not deleted yet
      pos = items.getBinaryIndexPosition(2, 'name');
			// yet in our index it should be now be third (array index 2)
      expect(pos).toBe(2);

    });
  });

  describe('calculateRangeStart works for inserts', () => {
    it('works', () => {

			// calculateRangeStart is helper function for adaptive inserts/updates
			// we will use it to find position within index where (new) nonexistent value should be inserted into index

      const db = new loki('idxtest');
      const items = db.addCollection('users', {indices: ['name']});
      items.insert(testRecords);

			// force index build
      items.find({name: 'mjolnir'});

      let pos = items.calculateRangeStart('name', 'fff', true);
      expect(pos).toBe(1);

      pos = items.calculateRangeStart('name', 'zzz', true);
      expect(pos).toBe(4);

      pos = items.calculateRangeStart('name', 'aaa', true);
      expect(pos).toBe(0);

      pos = items.calculateRangeStart('name', 'gungnir', true);
      expect(pos).toBe(1);
    });
  });

  describe('adaptiveBinaryIndexInsert works', () => {
    it('works', () => {

			// Since we use coll.get's ability to do a positional lookup of a loki id during adaptive indexing we will test it here
			// let's base this off of our 'remove' test so data is more meaningful

      const db = new loki('idxtest');
      const items = db.addCollection('users', {
        adaptiveBinaryIndices: false,
        indices: ['name']
      });
      items.insert(testRecords);

			// force index build
      items.find({name: 'mjolnir'});

			// we know this will go in coll.data[4] as fifth document
      items.insert({
        name: 'fff'
      });

      items.adaptiveBinaryIndexInsert(4, "name");

      expect(items.binaryIndices.name.values[0]).toBe(3);  // draupnir at index position 0 and data[] position 3 (same as old)
      expect(items.binaryIndices.name.values[1]).toBe(4);  // fff at index position 1 and data[] position 4 (now)
      expect(items.binaryIndices.name.values[2]).toBe(1);  // gungnir at index position 2 (now) and data[] position 1
      expect(items.binaryIndices.name.values[3]).toBe(0);  // mjolnir at index position 3 (now) and data[] position 0
      expect(items.binaryIndices.name.values[4]).toBe(2);  // tyrfing at index position 4 (now) and data[] position 2
    });
  });

  describe('adaptiveBinaryIndexUpdate works', () => {
    it('works', () => {

      const db = new loki('idxtest');
      const items = db.addCollection('users', {
        adaptiveBinaryIndices: false, // we are doing utility function testing
        indices: ['name']
      });

      items.insert(testRecords);

			// force index build
      items.find({name: 'mjolnir'});

      expect(items.binaryIndices.name.values[0]).toBe(3);
      expect(items.binaryIndices.name.values[1]).toBe(1);
      expect(items.binaryIndices.name.values[2]).toBe(0);
      expect(items.binaryIndices.name.values[3]).toBe(2);

			// for this test, just update gungnir directly in collection.data
      items.data[1].name = 'ygungnir';

			// renegotiate index position of 2nd data element (ygungnir) within name index
      items.adaptiveBinaryIndexUpdate(1, "name");

      expect(items.binaryIndices.name.values[0]).toBe(3);
      expect(items.binaryIndices.name.values[1]).toBe(0);
      expect(items.binaryIndices.name.values[2]).toBe(2);
      expect(items.binaryIndices.name.values[3]).toBe(1);
    });
  });

  describe('adaptiveBinaryIndexRemove works', () => {
    it('works', () => {

			// Since we use coll.get's ability to do a positional lookup of a loki id during adaptive indexing we will test it here

			// let's base this off of our 'remove' test so data is more meaningful

      const db = new loki('idxtest');
      const items = db.addCollection('users', {indices: ['name']});
      items.insert(testRecords);

			// force index build
      items.find({name: 'mjolnir'});

			// at this point lets break convention and use internal method directly, without calling higher level remove() to remove
			// from both data[] and index[].  We are not even removing from data we are just testing adaptiveBinaryIndexRemove as if we did/will.

			// lets 'remove' gungnir (which is in data array position 1) from our 'name' index
      items.adaptiveBinaryIndexRemove(1, "name");

			// should only be three index array elements now (ordered by name)
      expect(items.binaryIndices.name.values[0]).toBe(2);  // draupnir at index position 0 and data[] position 2 (now)
      expect(items.binaryIndices.name.values[1]).toBe(0);  // mjolnir at index position 1 and data[] position 0
      expect(items.binaryIndices.name.values[2]).toBe(1);  // tyrfing at index position 2 and data[] position 1 (now)
    });
  });

  describe('adaptiveBinaryIndex high level operability test', () => {
    it('works', () => {

      const db = new loki('idxtest');
      const coll = db.addCollection('users', {
        adaptiveBinaryIndices: true,
        indices: ['customIdx']
      });

      let idx, result;

			// add 1000 records
      for (idx = 0; idx < 1000; idx++) {
        coll.insert({
          customIdx: idx,
          originalIdx: idx,
          desc: "inserted doc with customIdx of " + idx
        });
      }

			// update 1000 records causing index to move first in ordered list to last, one at a time
			// when finding each document we are also verifying it gave us back the correct document
      for (idx = 0; idx < 1000; idx++) {
        result = coll.findOne({customIdx: idx});
        expect(result).not.toEqual(null);
        expect(result.customIdx).toBe(idx);
        result.customIdx += 1000;
        coll.update(result);
      }

			// find each document again (by its new customIdx), verify it is who we thought it was, then remove it
      for (idx = 0; idx < 1000; idx++) {
        result = coll.findOne({customIdx: idx + 1000});
        expect(result).not.toEqual(null);
        expect(result.customIdx).toBe(idx + 1000);
        coll.remove(result);
      }

			// all documents should be gone
      expect(coll.count()).toBe(0);

			// with empty collection , insert some records
      const one = coll.insert({customIdx: 100});
      const two = coll.insert({customIdx: 200});
      const three = coll.insert({customIdx: 300});
      const four = coll.insert({customIdx: 400});
      const five = coll.insert({customIdx: 500});

			// intersperse more records before and after previous each element
      coll.insert({customIdx: 7});
      coll.insert({customIdx: 123});
      coll.insert({customIdx: 234});
      coll.insert({customIdx: 345});
      coll.insert({customIdx: 567});

			// verify some sampling returns correct objects
      expect(coll.findOne({customIdx: 300}).customIdx).toBe(300);
      expect(coll.findOne({customIdx: 234}).customIdx).toBe(234);
      expect(coll.findOne({customIdx: 7}).customIdx).toBe(7);
      expect(coll.findOne({customIdx: 567}).customIdx).toBe(567);

			// remove 4 records at various positions, forcing indices to be inserted and removed
      coll.remove(coll.findOne({customIdx: 567}));
      coll.remove(coll.findOne({customIdx: 234}));
      coll.remove(coll.findOne({customIdx: 7}));
      coll.remove(coll.findOne({customIdx: 300}));

			// verify find() returns correct document or null for all previously added customIdx's
      expect(coll.findOne({customIdx: 100}).customIdx).toBe(100);
      expect(coll.findOne({customIdx: 200}).customIdx).toBe(200);
      expect(coll.findOne({customIdx: 300})).toBe(null);
      expect(coll.findOne({customIdx: 400}).customIdx).toBe(400);
      expect(coll.findOne({customIdx: 500}).customIdx).toBe(500);
      expect(coll.findOne({customIdx: 7})).toBe(null);
      expect(coll.findOne({customIdx: 123}).customIdx).toBe(123);
      expect(coll.findOne({customIdx: 234})).toBe(null);
      expect(coll.findOne({customIdx: 345}).customIdx).toBe(345);
      expect(coll.findOne({customIdx: 567})).toBe(null);
    });
  });

  describe('adaptiveBinaryIndex high level random stress test', () => {
    it('works', () => {
      const db = new loki('idxtest');
      const coll = db.addCollection('users', {
        adaptiveBinaryIndices: true,
        indices: ['customIdx']
      });

      let idx;
      let result;
      const minVal = 1;
      const maxVal = 1000;
      let currId;
      const idVector = [];

			// add 1000 records
      for (idx = 0; idx < 1000; idx++) {
        currId = Math.floor(Math.random() * (maxVal - minVal) + minVal);

        coll.insert({
          customIdx: currId,
          sequence: idx,
          desc: "inserted doc with sequence of " + idx
        });

        idVector.push(currId);
      }

			// update 1000 records causing index to move first in ordered list to last, one at a time
			// when finding each document we are also verifying it gave us back the correct document
      for (idx = 0; idx < 1000; idx++) {
        currId = idVector.pop();
        result = coll.findOne({customIdx: currId});
        expect(result).not.toEqual(null);
        expect(result.customIdx).toBe(currId);
      }
    });

  });

  describe('adaptiveBinaryIndex collection serializes correctly', () => {
    it('works', () => {

      let db = new loki('idxtest');
      let coll = db.addCollection('users', {
        adaptiveBinaryIndices: true,
        indices: ['customIdx']
      });
      coll.insert({customIdx: 1});

      let jsonString = db.serialize();

      let newDatabase = new loki('idxtest');
      newDatabase.loadJSON(jsonString);

      expect(newDatabase.getCollection('users').adaptiveBinaryIndices).toBe(true);


			// repeat without option set
      db = new loki('idxtest');
      coll = db.addCollection('users', {
        adaptiveBinaryIndices: false,
        indices: ['customIdx']
      });
      coll.insert({customIdx: 1});

      jsonString = db.serialize();
      newDatabase = new loki('idxtest');
      newDatabase.loadJSON(jsonString);

      expect(newDatabase.getCollection('users').adaptiveBinaryIndices).toBe(false);
    });
  });

});
