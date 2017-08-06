/* global describe, it, expect, beforeEach */
import {Loki as loki} from '../../src/loki';

describe('eventEmitter', () => {
  let db;
  let users;

  beforeEach(() => {
    db = new loki('test', {
      persistenceMethod: null
    }),
			users = db.addCollection('users', {
  asyncListeners: false
});

    users.insert({
      name: 'joe'
    });
  });

  it('async', function testAsync() {
    expect(db.asyncListeners).toBe(false);
  });

  it('emit', () => {
    const index = db.on('test', function test(obj) {
      expect(obj).toEqual(42);
    });

    db.emit('test', 42);
    db.removeListener('test', index);

    expect(db.events['test'].length).toEqual(0);
  });
});
