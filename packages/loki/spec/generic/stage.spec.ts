/* global describe, beforeEach, it, expect */
import {Loki} from "../../src/loki";
import {Collection} from "../../src/collection";

interface Director {
  name: string;
  directorId: number;
}

describe("Staging and commits", () => {
  let db: Loki;
  let directors: Collection<Director>;

  beforeEach(() => {
    db = new Loki("testJoins");
    directors = db.addCollection<Director>("directors");

    directors.insert([{
      name: "Martin Scorsese",
      directorId: 1
    }, {
      name: "Francis Ford Coppola",
      directorId: 2
    }, {
      name: "Steven Spielberg",
      directorId: 3
    }, {
      name: "Quentin Tarantino",
      directorId: 4
    }]);
  });

  it("work", () => {

    const stageName = "tentative directors";
    const newDirectorsName = "Joel and Ethan Cohen";
    const message = "Edited Cohen brothers name";

    const cohen = directors.insert({
      name: "Cohen Brothers",
      directorId: 5
    });
    const new_cohen = directors.stage(stageName, cohen);
    new_cohen.name = newDirectorsName;
    expect(cohen.name).toEqual("Cohen Brothers");
    directors.commitStage(stageName, message);
    expect(directors.get(cohen.$loki).name).toEqual("Joel and Ethan Cohen");
    expect(directors["_commitLog"][0].message).toEqual(message);
  });
});
