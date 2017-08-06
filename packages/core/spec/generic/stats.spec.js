/* global describe, it, expect */
import {Loki as loki} from '../../src/loki';

describe('stats', () => {
  const db = new loki();
  const users = db.addCollection('users');
  users.insert({
    name: 'joe',
    age: 35,
    relatives: {
      firstgrade: 15
    }
  });
  users.insert({
    name: 'jack',
    age: 20,
    relatives: {
      firstgrade: 20
    }
  });
  users.insert({
    name: 'jim',
    age: 40,
    relatives: {
      firstgrade: 32
    }
  });
  users.insert({
    name: 'dave',
    age: 15,
    relatives: {
      firstgrade: 20
    }
  });
  users.insert({
    name: 'jim',
    age: 28,
    relatives: {
      firstgrade: 15
    }
  });
  users.insert({
    name: 'dave',
    age: 12,
    relatives: {
      firstgrade: 12
    }
  });

  it('max should be 32', () => {

    expect(users.max('relatives.firstgrade')).toEqual(32);

  });
  it('max record should be 3, 32', () => {
    expect({
      index: 3,
      value: 32
    }).toEqual(users.maxRecord('relatives.firstgrade'));
  });

  it('min should be 12', () => {
    expect(users.min('age')).toEqual(12);
  });

  it('min record to be 6, 12', () => {
    expect(users.minRecord('age')).toEqual({
      index: 6,
      value: 12
    });
  });

  it('average to be 19', () => {
    expect(users.avg('relatives.firstgrade')).toEqual(19);
  });

  it('median to be 17.5', () => {
    expect(users.median('relatives.firstgrade')).toEqual(17.5);
  });

  it('ages should be [35, 20, 40, 15, 28, 12]', () => {
    expect(users.extract('age')).toEqual([35, 20, 40, 15, 28, 12]);
  });

  it('Standard deviation on firstgrade relatives should be 6.48...', () => {
    expect(users.stdDev('relatives.firstgrade')).toEqual(6.48074069840786);
  });

  it('stdDev should be 10.23...', () => {
    expect(users.stdDev('age')).toEqual(10.23067283548187);
  });

});
