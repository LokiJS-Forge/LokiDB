/* global describe, it, expect */
import {Loki as loki} from '../../src/loki';

describe('Constraints', () => {

  it('should retrieve records with by()', () => {
    const db = new loki();
    const coll = db.addCollection('users', {
      unique: ['username']
    });
    coll.insert({
      username: 'joe',
      name: 'Joe'
    });
    coll.insert({
      username: 'jack',
      name: 'Jack'
    });
    expect(coll.by('username', 'joe').name).toEqual('Joe');

    const byUsername = coll.by('username');
    expect(byUsername('jack').name).toEqual('Jack');

    const joe = coll.by('username', 'joe');
    joe.username = 'jack';
    expect(() => {
      coll.update(joe);
    }).toThrow(new Error('Duplicate key for property username: ' + joe.username));
    joe.username = 'jim';
    coll.update(joe);
    expect(byUsername('jim')).toEqual(joe);
  });

  it('should create a unique index', () => {
    const db = new loki();
    const coll2 = db.addCollection('moreusers');
    coll2.insert({
      name: 'jack'
    });
    coll2.insert({
      name: 'tim'
    });
    coll2.ensureUniqueIndex('name');
  });

  it('should not add record with null index', () => {
    const db = new loki();
    const coll3 = db.addCollection('nullusers', {
      unique: ['username']
    });
    coll3.insert({
      username: 'joe',
      name: 'Joe'
    });
    coll3.insert({
      username: null,
      name: 'Jack'
    });

    expect(Object.keys(coll3.constraints.unique.username.keyMap).length).toEqual(1);
  });

  it('should not throw an error id multiple nulls are added', () => {
    const db = new loki();
    const coll4 = db.addCollection('morenullusers', {
      unique: ['username']
    });
    coll4.insert({
      username: 'joe',
      name: 'Joe'
    });
    coll4.insert({
      username: null,
      name: 'Jack'
    });
    coll4.insert({
      username: null,
      name: 'Jake'
    });
    expect(Object.keys(coll4.constraints.unique.username.keyMap).length).toEqual(1);
  });

  it('coll.clear should affect unique indices correctly', () => {
    let db = new loki();
    let coll = db.addCollection('users', {unique: ['username']});

    coll.insert({username: 'joe', name: 'Joe'});
    coll.insert({username: 'jack', name: 'Jack'});
    coll.insert({username: 'jake', name: 'Jake'});
    expect(Object.keys(coll.constraints.unique.username.keyMap).length).toEqual(3);
    expect(coll.uniqueNames.length).toEqual(1);
    coll.clear();
    expect(Object.keys(coll.constraints.unique.username.keyMap).length).toEqual(0);
    coll.insert({username: 'joe', name: 'Joe'});
    coll.insert({username: 'jack', name: 'Jack'});
    expect(Object.keys(coll.constraints.unique.username.keyMap).length).toEqual(2);
    coll.insert({username: 'jake', name: 'Jake'});
    expect(Object.keys(coll.constraints.unique.username.keyMap).length).toEqual(3);
    expect(coll.uniqueNames.length).toEqual(1);

    db = new loki();
    coll = db.addCollection('users', {unique: ['username']});

    coll.insert({username: 'joe', name: 'Joe'});
    coll.insert({username: 'jack', name: 'Jack'});
    coll.insert({username: 'jake', name: 'Jake'});
    expect(Object.keys(coll.constraints.unique.username.keyMap).length).toEqual(3);
    expect(coll.uniqueNames.length).toEqual(1);
    coll.clear({removeIndices: true});
    expect(coll.constraints.unique.hasOwnProperty('username')).toEqual(false);
    expect(coll.uniqueNames.length).toEqual(0);
    coll.insert({username: 'joe', name: 'Joe'});
    coll.insert({username: 'jack', name: 'Jack'});
    coll.insert({username: 'jake', name: 'Jake'});
    expect(coll.constraints.unique.hasOwnProperty('username')).toEqual(false);
    expect(coll.uniqueNames.length).toEqual(0);
  });
});
