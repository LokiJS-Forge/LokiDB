import { GermanAnalyzer } from "../../src/german_analyzer";
import { createLanguageTest, LanguageTestData } from "../../../full-text-search-language/spec/helper/create_lanuage_test.helper";

export const de: LanguageTestData = {
  analyzer: new GermanAnalyzer(),
  docs: [
    "An Deutschland grenzen neun Nachbarländer und naturräumlich im Norden die Gewässer der Nord- und Ostsee, im Süden das Bergland der Alpen. Es liegt in der gemäßigten Klimazone, zählt mit rund 80 Millionen Einwohnern zu den dicht besiedelten Flächenstaaten und gilt international als das Land mit der dritthöchsten Zahl von Einwanderern. aufeinanderfolgenden. auffassen.",
    "Deutschland als Urlaubsziel verfügt über günstige Voraussetzungen: Gebirgslandschaften (Alpen und Mittelgebirge), See- und Flusslandschaften, die Küsten und Inseln der Nord- und Ostsee, zahlreiche Kulturdenkmäler und eine Vielzahl geschichtsträchtiger Städte sowie gut ausgebaute Infrastruktur. Vorteilhaft ist die zentrale Lage in Europa."
  ],
  tests: [{
    what: "find the word",
    search: "deutschland",
    expected: [0, 1]
  }, {
    what: "find the word",
    search: "urlaubsziel",
    expected: [1]
  }, {
    what: "find the word",
    search: "gewass",
    expected: [0]
  }, {
    what: "find the word",
    search: "verfugt",
    expected: [1]
  }, {
    what: "never find a word that does not exist, like",
    search: "inexistent",
    expected: []
  }, {
    what: "never find a stop word like",
    search: "und",
    expected: []
  }, {
    what: "find a correctly stemmed word",
    search: "auffass",
    expected: [0]
  }]
};

createLanguageTest("de", de);
