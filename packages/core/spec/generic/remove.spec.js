/* global describe, it, expect */
import {Loki as loki} from '../../src/loki';

describe('remove', () => {
  it('removes', () => {
    const db = new loki();
    const users = db.addCollection('users');

    users.insert({
      name: 'joe',
      age: 39
    });
    users.insert({
      name: 'jack',
      age: 20
    });
    users.insert({
      name: 'jim',
      age: 40
    });
    users.insert({
      name: 'dave',
      age: 33
    });
    users.insert({
      name: 'jim',
      age: 29
    });
    users.insert({
      name: 'dave',
      age: 21
    });

    const dv = users.addDynamicView('testview');
    dv.applyWhere((obj) => obj.name.length > 3);

    users.removeWhere((obj) => obj.age > 35);
    expect(users.data.length).toEqual(4);
    users.removeWhere({
      'age': {
        $gt: 25
      }
    });
    expect(users.data.length).toEqual(2);
    users.remove(6);
    expect(users.data.length).toEqual(1);
    users.removeDataOnly();
    expect(users.data.length).toEqual(0);
    expect(!!users.getDynamicView('testview')).toEqual(true);


    const foo = {
      name: 'foo',
      age: 42
    };
    users.insert(foo);
    expect(users.data.length).toEqual(1);
    const bar = users.remove(foo);
    expect(users.data.length).toEqual(0);
		// test that $loki and meta properties have been removed correctly to allow object re-insertion
    expect(!bar.$loki).toEqual(true);
    expect(!bar.meta).toEqual(true);
    users.insert(bar);
    expect(users.data.length).toEqual(1);
  });

  it('removes with unique index', () => {
    const db = new loki();
    const users1 = db.addCollection('userswithunique', {
      unique: ['username']
    });

    const joe = users1.insert({
      username: 'joe',
      name: 'joe',
      age: 39
    });
    const jack = users1.insert({
      username: 'jack',
      name: 'jack',
      age: 20
    });
    expect(users1.data.length).toEqual(2);
    users1.removeDataOnly();
    expect(users1.data.length).toEqual(0);
  });
});
