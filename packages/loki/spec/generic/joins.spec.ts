/* global describe, beforeEach, it, expect */
import {Loki} from "../../src/loki";
import {Collection} from "../../src/collection";
import {ResultSet} from "../../src/result_set";
import {Doc} from "../../../common/types";

interface Director {
  name: string;
  directorId: number;
}

interface Film {
  title: string;
  filmId: number;
  directorId: number;
}

describe("joins", () => {
  let db: Loki;
  let directors: Collection<Director>;
  let films: Collection<Film>;

  beforeEach(() => {
    db = new Loki("testJoins");
    directors = db.addCollection<Director>("directors");
    films = db.addCollection<Film>("films");

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

    films.insert([{
      title: "Taxi",
      filmId: 1,
      directorId: 1
    }, {
      title: "Raging Bull",
      filmId: 2,
      directorId: 1
    }, {
      title: "The Godfather",
      filmId: 3,
      directorId: 2
    }, {
      title: "Jaws",
      filmId: 4,
      directorId: 3
    }, {
      title: "ET",
      filmId: 5,
      directorId: 3
    }, {
      title: "Raiders of the Lost Ark",
      filmId: 6,
      directorId: 3
    }]);
  });

  it("works", () => {
    let joined;

    //Basic non-mapped join
    joined = films.eqJoin(directors.data, "directorId", "directorId").data();
    expect(joined[0].left.title).toEqual("Taxi");

    //Basic join with map
    joined = films.eqJoin(directors.data, "directorId", "directorId", (left: Film, right: Director) => ({
      filmTitle: left.title,
      directorName: right.name
    })).data();
    expect(joined.length).toEqual(films.data.length);
    expect(joined[0].filmTitle).toEqual("Taxi");
    expect(joined[0].directorName).toEqual("Martin Scorsese");

    //Basic non-mapped join with chained map
    joined = films.eqJoin(directors.data, "directorId", "directorId")
      .map((obj: {left: Film, right: Director}) => ({
        filmTitle: obj.left.title,
        directorName: obj.right.name
      })).data();
    expect(joined[0].filmTitle).toEqual("Taxi");
    expect(joined[0].directorName).toEqual("Martin Scorsese");


    interface Join1 {
      filmTitle: string;
      directorName: string;
    }

    //Test filtered join
    joined = films
      .chain()
      .find({
        directorId: 3
      })
      .simplesort("title")
      .eqJoin(directors, "directorId", "directorId", (left: Film, right: Director) => ({
        filmTitle: left.title,
        directorName: right.name
      })) as any as ResultSet<Join1>;
    expect(joined.data().length).toEqual(3);

    //Test chaining after join
    joined.find({
      filmTitle: "Jaws"
    });
    expect(joined.data()[0].filmTitle).toEqual("Jaws");

    interface Join2 {
      left: Doc<Film>;
      right: Doc<Director>;
    }

    //Test calculated keys
    joined = films.chain().eqJoin(directors,
      (film: Film) => String(film.directorId + 1),
      (director: Director) => String(director.directorId - 1))
      .data() as Join2[];

    expect(joined[0].right.name).toEqual("Steven Spielberg");
  });
});
