import {DE} from "../../../src/language/de";

export const de = {
  tokenizer: DE,
  docs: [
    "An Deutschland grenzen neun Nachbarländer und naturräumlich im Norden die Gewässer der Nord- und Ostsee, im Süden das Bergland der Alpen. Es liegt in der gemäßigten Klimazone, zählt mit rund 80 Millionen Einwohnern zu den dicht besiedelten Flächenstaaten und gilt international als das Land mit der dritthöchsten Zahl von Einwanderern. aufeinanderfolgenden. auffassen.",
    "Deutschland als Urlaubsziel verfügt über günstige Voraussetzungen: Gebirgslandschaften (Alpen und Mittelgebirge), See- und Flusslandschaften, die Küsten und Inseln der Nord- und Ostsee, zahlreiche Kulturdenkmäler und eine Vielzahl geschichtsträchtiger Städte sowie gut ausgebaute Infrastruktur. Vorteilhaft ist die zentrale Lage in Europa."
  ],
  tests: [{
    what: "find the word",
    search: "deutschland",
    found: [0, 1]
  }, {
    what: "find the word",
    search: "urlaubsziel",
    found: [1]
  }, {
    what: "find the word",
    search: "gewass",
    found: [0]
  }, {
    what: "find the word",
    search: "verfugt",
    found: [1]
  }, {
    what: "never find a word that does not exist, like",
    search: "inexistent",
    found: []
  }, {
    what: "never find a stop word like",
    search: "und",
    found: []
  }, {
    what: "find a correctly stemmed word",
    search: "auffassung",
    found: [0]
  }]
};
