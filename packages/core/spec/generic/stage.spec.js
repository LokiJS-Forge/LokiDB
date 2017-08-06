/* global describe, it, expect */
import {Loki as loki} from '../../src/loki';

describe('Staging and commits', () => {
  let db, directors, films;

  beforeEach(() => {
    db = new loki('testJoins', {
      persistenceMethod: null
    });
    directors = db.addCollection('directors');
    films = db.addCollection('films');

    directors.insert([{
      name: 'Martin Scorsese',
      directorId: 1
    }, {
      name: 'Francis Ford Coppola',
      directorId: 2
    }, {
      name: 'Steven Spielberg',
      directorId: 3
    }, {
      name: 'Quentin Tarantino',
      directorId: 4
    }]);
  });

  it('work', () => {

    const stageName = 'tentative directors', newDirectorsName = 'Joel and Ethan Cohen',
      message = 'Edited Cohen brothers name';

    const cohen = directors.insert({
      name: 'Cohen Brothers',
      directorId: 5
    });
    const new_cohen = directors.stage(stageName, cohen);
    new_cohen.name = newDirectorsName;
    expect(cohen.name).toEqual('Cohen Brothers');
    directors.commitStage(stageName, message);
    expect(directors.get(cohen.$loki).name).toEqual('Joel and Ethan Cohen');
    expect(directors.commitLog[0].message).toEqual(message);
  });
});
