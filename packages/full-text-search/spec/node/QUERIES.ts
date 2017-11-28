import {QueryBuilder as QB} from "../../src/query_builder";

const FIELD_NAME_1 = "msg";

export const QUERIES = [
  {
    fts: new QB()
      .term(FIELD_NAME_1, "sollicitudin")
      .build(),
    es: {
      term: {
        [FIELD_NAME_1]: "sollicitudin"
      }
    }
  },
  {
    fts: new QB()
      .constantScore().beginFilter()
      .term(FIELD_NAME_1, "sollicitudin")
      .endFilter().boost(2.45)
      .build(),
    es: {
      constant_score: {
        filter: {
          term: {
            [FIELD_NAME_1]: "sollicitudin"
          }
        },
        boost: 2.45
      }
    }
  },
  {
    fts: new QB()
      .fuzzy(FIELD_NAME_1, "a")
      .build(),
    es: {
      fuzzy: {
        [FIELD_NAME_1]: "a"
      }
    }
  },
  {
    fts: new QB()
      .fuzzy(FIELD_NAME_1, "este")
      .build(),
    es: {
      fuzzy: {
        [FIELD_NAME_1]: "este"
      }
    }
  },
  {
    fts: new QB()
      .fuzzy(FIELD_NAME_1, "est").prefixLength(3)
      .build(),
    es: {
      fuzzy: {
        [FIELD_NAME_1]: {
          value: "est",
          prefix_length: 3
        }
      }
    }
  },
  {
    fts: new QB()
      .fuzzy(FIELD_NAME_1, "ege").prefixLength(3).fuzziness(2)
      .build(),
    es: {
      fuzzy: {
        [FIELD_NAME_1]: {
          value: "ege",
          prefix_length: 3,
          fuzziness: 2
        }
      }
    },
    empty: true
  },
  {
    fts: new QB()
      .fuzzy(FIELD_NAME_1, "est").fuzziness(0)
      .build(),
    es: {
      fuzzy: {
        [FIELD_NAME_1]: {
          value: "est",
          fuzziness: 0
        }
      }
    }
  },
  {
    fts: new QB()
      .wildcard(FIELD_NAME_1, "a?").build(),
    es: {
      wildcard: {
        [FIELD_NAME_1]: {
          value: "a?"
        }
      }
    }
  },
  {
    fts: new QB()
      .wildcard(FIELD_NAME_1, "a?").enableScoring(true).build(),
    es: {
      wildcard: {
        [FIELD_NAME_1]: {
          value: "a?",
          rewrite: "scoring_boolean"
        }
      }
    }
  },
  {
    fts: new QB()
      .wildcard(FIELD_NAME_1, "so*").build(),
    es: {
      wildcard: {
        [FIELD_NAME_1]: {
          value: "so*"
        }
      }
    }
  },
  {
    fts: new QB()
      .wildcard(FIELD_NAME_1, "so*n").build(),
    es: {
      wildcard: {
        [FIELD_NAME_1]: {
          value: "so*n"
        }
      }
    }
  },
  {
    fts: new QB()
      .wildcard(FIELD_NAME_1, "e*t").build(),
    es: {
      wildcard: {
        [FIELD_NAME_1]: {
          value: "e*t"
        }
      }
    }
  },
  {
    fts: new QB()
      .term(FIELD_NAME_1, "sollicitudin").boost(2)
      .build(),
    es: {
      term: {
        [FIELD_NAME_1]: {
          value: "sollicitudin",
          boost: 2
        }
      }
    }
  },
  {
    fts: new QB()
      .matchAll()
      .build(),
    es: {
      match_all: {}
    }
  },
  {
    fts: new QB()
      .exists(FIELD_NAME_1)
      .build(),
    es: {
      exists: {
        "field": FIELD_NAME_1
      }
    }
  },
  {
    fts: new QB()
      .prefix(FIELD_NAME_1, "es").boost(3.5)
      .build(),
    es: {
      prefix: {
        [FIELD_NAME_1]: {
          value: "es",
          boost: 3.5
        },
      }
    }
  },
  {
    fts: new QB()
      .prefix(FIELD_NAME_1, "es").enableScoring(true)
      .build(),
    es: {
      prefix: {
        [FIELD_NAME_1]: {
          value: "es",
          rewrite: "scoring_boolean"
        },
      }
    }
  },
  {
    fts: new QB()
      .bool()
      .beginMust().term(FIELD_NAME_1, "a").term(FIELD_NAME_1, "ac").endMust()
      .build(),
    es: {
      bool: {
        must: [
          {
            term: {
              [FIELD_NAME_1]: "a"
            }
          },
          {
            term: {
              [FIELD_NAME_1]: "ac"
            }
          }
        ]
      }
    }
  },
  {
    fts: new QB()
      .bool()
      .beginMust().term(FIELD_NAME_1, "est").endMust()
      .beginNot().term(FIELD_NAME_1, "ac").endNot()
      .build(),
    es: {
      bool: {
        must: [
          {
            term: {
              [FIELD_NAME_1]: "est"
            }
          }
        ],
        must_not: [
          {
            term: {
              [FIELD_NAME_1]: "ac"
            }
          }
        ]
      }
    }
  },
  {
    fts: new QB()
      .bool()
      .beginMust().term(FIELD_NAME_1, "abc").endMust()
      .beginNot().term(FIELD_NAME_1, "ac").endNot()
      .build(),
    es: {
      bool: {
        must: [
          {
            term: {
              [FIELD_NAME_1]: "abc"
            }
          }
        ],
        must_not: [
          {
            term: {
              [FIELD_NAME_1]: "ac"
            }
          }
        ]
      }
    },
    empty: true
  },
  {
    fts: new QB()
      .bool()
      .beginMust().term(FIELD_NAME_1, "est").endMust()
      .beginShould().term(FIELD_NAME_1, "ac").endShould()
      .build(),
    es: {
      bool: {
        must: [
          {
            term: {
              [FIELD_NAME_1]: "est"
            }
          }
        ],
        should: [
          {
            term: {
              [FIELD_NAME_1]: "ac"
            }
          }
        ]
      }
    }
  },
  {
    fts: new QB()
      .bool()
      .minimumShouldMatch(2)
      .beginShould()
      .term(FIELD_NAME_1, "ac")
      .term(FIELD_NAME_1, "enim")
      .term(FIELD_NAME_1, "est")
      .endShould()
      .build(),
    es: {
      bool: {
        should: [
          {
            term: {
              [FIELD_NAME_1]: "ac"
            }
          },
          {
            term: {
              [FIELD_NAME_1]: "enim"
            }
          },
          {
            term: {
              [FIELD_NAME_1]: "est"
            }
          }
        ],
        minimum_should_match: 2,
      }
    }
  },
  {
    fts: new QB()
      .bool()
      .minimumShouldMatch(-2)
      .beginShould()
      .term(FIELD_NAME_1, "ac")
      .term(FIELD_NAME_1, "enim")
      .term(FIELD_NAME_1, "est")
      .endShould()
      .build(),
    es: {
      bool: {
        should: [
          {
            term: {
              [FIELD_NAME_1]: "ac"
            }
          },
          {
            term: {
              [FIELD_NAME_1]: "enim"
            }
          },
          {
            term: {
              [FIELD_NAME_1]: "est"
            }
          }
        ],
        minimum_should_match: -2,
      }
    }
  },
  {
    fts: new QB()
      .bool()
      .minimumShouldMatch(0.75)
      .beginShould()
      .term(FIELD_NAME_1, "ac")
      .term(FIELD_NAME_1, "enim")
      .term(FIELD_NAME_1, "est")
      .term(FIELD_NAME_1, "at")
      .term(FIELD_NAME_1, "sed")
      .endShould()
      .build(),
    es: {
      bool: {
        should: [
          {
            term: {
              [FIELD_NAME_1]: "ac"
            }
          },
          {
            term: {
              [FIELD_NAME_1]: "enim"
            }
          },
          {
            term: {
              [FIELD_NAME_1]: "est"
            }
          },
          {
            term: {
              [FIELD_NAME_1]: "at"
            }
          },
          {
            term: {
              [FIELD_NAME_1]: "sed"
            }
          }
        ],
        minimum_should_match: "75%",
      }
    }
  },
  {
    fts: new QB()
      .bool()
      .minimumShouldMatch(-0.25)
      .beginShould()
      .term(FIELD_NAME_1, "ac")
      .term(FIELD_NAME_1, "enim")
      .term(FIELD_NAME_1, "est")
      .term(FIELD_NAME_1, "at")
      .term(FIELD_NAME_1, "sed")
      .endShould()
      .build(),
    es: {
      bool: {
        should: [
          {
            term: {
              [FIELD_NAME_1]: "ac"
            }
          },
          {
            term: {
              [FIELD_NAME_1]: "enim"
            }
          },
          {
            term: {
              [FIELD_NAME_1]: "est"
            }
          },
          {
            term: {
              [FIELD_NAME_1]: "at"
            }
          },
          {
            term: {
              [FIELD_NAME_1]: "sed"
            }
          }
        ],
        minimum_should_match: "-25%",
      }
    }
  },
  {
    fts: new QB()
      .bool()
      .beginMust().matchAll().endMust()
      .beginNot().term(FIELD_NAME_1, "ac").endNot()
      .build(),
    es: {
      bool: {
        must: [
          {
            match_all: {}
          }
        ],
        must_not: [
          {
            term: {
              [FIELD_NAME_1]: "ac"
            }
          }
        ]
      }
    }
  },
  {
    fts: new QB()
      .bool()
      .beginMust().term(FIELD_NAME_1, "ac").endMust()
      .beginShould().constantScore().beginFilter().wildcard(FIELD_NAME_1, "a?").endFilter().endShould()
      .build(),
    es: {
      bool: {
        must: [
          {
            term: {
              [FIELD_NAME_1]: "ac"
            }
          }
        ],
        should: [
          {
            constant_score: {
              filter: {
                wildcard: {
                  [FIELD_NAME_1]: "a?"
                }
              }
            }
          }
        ]
      }
    }
  },
  {
    fts: new QB()
      .match(FIELD_NAME_1, "orci habitasse eget")
      .build(),
    es: {
      match: {
        [FIELD_NAME_1]: "orci habitasse eget"
      }
    }
  },
  {
    fts: new QB()
      .match(FIELD_NAME_1, "orci habitasse eget")
      .operator("and")
      .build(),
    es: {
      match: {
        [FIELD_NAME_1]: {
          query: "orci habitasse eget",
          operator: "and"
        }
      }
    }
  },
  {
    fts: new QB()
      .match(FIELD_NAME_1, "orca este")
      .fuzziness("AUTO")
      .build(),
    es: {
      match: {
        [FIELD_NAME_1]: {
          query: "orca este",
          fuzziness: "AUTO"
        }
      }
    }
  },
  {
    fts: new QB()
      .match(FIELD_NAME_1, "orci est")
      .operator("and")
      .build(),
    es: {
      match: {
        [FIELD_NAME_1]: {
          query: "orci est",
          operator: "and"
        }
      }
    }
  },
  {
    fts: new QB()
      .match(FIELD_NAME_1, "orci est in")
      .minimumShouldMatch(0.33)
      .build(),
    es: {
      match: {
        [FIELD_NAME_1]: {
          query: "orci est in",
          minimum_should_match: "33%"
        }
      }
    }
  },
];
