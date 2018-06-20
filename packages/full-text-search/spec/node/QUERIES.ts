import {QueryTypes} from "../../src/query_types";

const FIELD_NAME_1 = "msg";

export const QUERIES: { fts: QueryTypes, es: any, empty?: boolean, focus?: boolean }[] = [
  {
    fts: {
      type: "term",
      field: FIELD_NAME_1,
      value: "sollicitudin"
    },
    es: {
      term: {
        [FIELD_NAME_1]: "sollicitudin"
      }
    }
  },
  {
    fts: {
      type: "constant_score",
      boost: 2.45,
      filter: [
        {
          type: "term",
          field: FIELD_NAME_1,
          value: "sollicitudin",
        }
      ]
    },
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
    fts: {
      type: "fuzzy",
      field: FIELD_NAME_1,
      value: "a"
    },
    es: {
      fuzzy: {
        [FIELD_NAME_1]: {
          value: "a",
          transpositions: true
        }
      }
    }
  },
  {
    fts: {
      type: "fuzzy",
      field: FIELD_NAME_1,
      value: "este"
    },
    es: {
      fuzzy: {
        [FIELD_NAME_1]: {
          value: "este",
          transpositions: true
        }
      }
    }
  },
  {
    fts: {
      type: "fuzzy",
      field: FIELD_NAME_1,
      value: "est",
      prefix_length: 3
    },
    es: {
      fuzzy: {
        [FIELD_NAME_1]: {
          value: "est",
          prefix_length: 3,
          transpositions: true
        }
      }
    }
  },
  {
    fts: {
      type: "fuzzy",
      field: FIELD_NAME_1,
      value: "ege",
      prefix_length: 3,
      fuzziness: 2
    },
    es: {
      fuzzy: {
        [FIELD_NAME_1]: {
          value: "ege",
          prefix_length: 3,
          fuzziness: 2,
          transpositions: true
        }
      }
    },
    empty: true
  },
  {
    fts: {
      type: "fuzzy",
      field: FIELD_NAME_1,
      value: "est",
      fuzziness: 0
    },
    es: {
      fuzzy: {
        [FIELD_NAME_1]: {
          value: "est",
          fuzziness: 0,
          transpositions: true
        }
      }
    }
  },
  {
    fts: {
      type: "fuzzy",
      field: FIELD_NAME_1,
      value: "just",
      fuzziness: 2
    },
    es: {
      fuzzy: {
        [FIELD_NAME_1]: {
          value: "just",
          fuzziness: 2,
          transpositions: true
        }
      }
    }
  },
  {
    fts: {
      type: "fuzzy",
      field: FIELD_NAME_1,
      value: "jus",
      fuzziness: 1
    },
    es: {
      fuzzy: {
        [FIELD_NAME_1]: {
          value: "jus",
          fuzziness: 1,
          transpositions: true
        }
      }
    }
  },
  {
    fts: {
      type: "fuzzy",
      field: FIELD_NAME_1,
      value: "jus",
      fuzziness: 2,
      prefix_length: 1
    },
    es: {
      fuzzy: {
        [FIELD_NAME_1]: {
          value: "jus",
          fuzziness: 2,
          prefix_length: 1,
          transpositions: true
        }
      }
    }
  },
  {
    fts: {
      type: "fuzzy",
      field: FIELD_NAME_1,
      value: "js",
      fuzziness: 2
    },
    es: {
      fuzzy: {
        [FIELD_NAME_1]: {
          value: "js",
          fuzziness: 2,
          prefix_length: 0,
          transpositions: true
        }
      }
    }
  },
  {
    fts: {
      type: "fuzzy",
      field: FIELD_NAME_1,
      value: "js",
      fuzziness: 2,
      boost: 5
    },
    es: {
      fuzzy: {
        [FIELD_NAME_1]: {
          value: "js",
          fuzziness: 2,
          prefix_length: 0,
          transpositions: true,
          boost: 5
        }
      }
    }
  },
  {
    fts: {
      type: "wildcard",
      field: FIELD_NAME_1,
      value: "a?"
    },
    es: {
      wildcard: {
        [FIELD_NAME_1]: {
          value: "a?"
        }
      }
    }
  },
  {
    fts: {
      type: "wildcard",
      field: FIELD_NAME_1,
      value: "a?",
      enable_scoring: true
    },
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
    fts: {
      type: "wildcard",
      field: FIELD_NAME_1,
      value: "so*"
    },
    es: {
      wildcard: {
        [FIELD_NAME_1]: {
          value: "so*"
        }
      }
    }
  },
  {
    fts: {
      type: "wildcard",
      field: FIELD_NAME_1,
      value: "so*n"
    },
    es: {
      wildcard: {
        [FIELD_NAME_1]: {
          value: "so*n"
        }
      }
    }
  },
  {
    fts: {
      type: "wildcard",
      field: FIELD_NAME_1,
      value: "e*t"
    },
    es: {
      wildcard: {
        [FIELD_NAME_1]: {
          value: "e*t"
        }
      }
    }
  },
  {
    fts: {
      type: "term",
      boost: 2,
      field: FIELD_NAME_1,
      value: "sollicitudin"
    },
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
    fts: {type: "match_all"},
    es: {
      match_all: {}
    }
  },
  {
    fts: {
      type: "exists",
      field: FIELD_NAME_1
    },
    es: {
      exists: {
        "field": FIELD_NAME_1
      }
    }
  },
  {
    fts: {
      type: "prefix",
      boost: 3.5,
      field: FIELD_NAME_1,
      value: "es"
    },
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
    fts: {
      type: "prefix",
      field: FIELD_NAME_1,
      value: "es",
      enable_scoring: true
    },
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
    fts: {
      type: "bool",
      must: [
        {
          type: "term",
          field: FIELD_NAME_1,
          value: "a",
          boost: 2
        },
        {
          type: "term",
          field: FIELD_NAME_1,
          value: "ac"
        }
      ],
      boost: 10
    },
    es: {
      bool: {
        must: [
          {
            term: {
              [FIELD_NAME_1]: {
                value: "a",
                boost: 2
              }
            }
          },
          {
            term: {
              [FIELD_NAME_1]: "ac"
            }
          }
        ],
        boost: 10
      }
    }
  },
  {
    fts: {
      type: "bool",
      must: [
        {
          type: "term",
          field: FIELD_NAME_1,
          value: "a"
        },
        {
          type: "fuzzy",
          field: FIELD_NAME_1,
          value: "just"
        },
        {
          type: "term",
          field: FIELD_NAME_1,
          value: "ac"
        }
      ]
    },
    es: {
      bool: {
        must: [
          {
            term: {
              [FIELD_NAME_1]: "a"
            }
          },
          {
            fuzzy: {
              [FIELD_NAME_1]: "just"
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
    fts: {
      type: "bool",
      must: [
        {
          type: "term",
          field: FIELD_NAME_1,
          value: "a"
        },
        {
          type: "wildcard",
          field: FIELD_NAME_1,
          value: "j*",
          enable_scoring: true
        },
        {
          type: "term",
          field: FIELD_NAME_1,
          value: "ac"
        }
      ]
    },
    es: {
      bool: {
        must: [
          {
            term: {
              [FIELD_NAME_1]: "a"
            }
          },
          {
            wildcard: {
              [FIELD_NAME_1]: {
                value: "j*",
                rewrite: "scoring_boolean"
              }
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
    fts: {
      type: "bool",
      must: [
        {
          type: "term",
          field: FIELD_NAME_1,
          value: "est"
        }
      ],
      not: [
        {
          type: "term",
          field: FIELD_NAME_1,
          value: "ac"
        }
      ]
    },
    es: {
      bool: {
        must: [
          {
            term: {
              [FIELD_NAME_1]: "est"
            }
          }
        ],
        must_not:
          [
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
    fts: {
      type: "bool",
      must: [
        {
          type: "term",
          field: FIELD_NAME_1,
          value: "abc"
        }
      ],
      not: [
        {
          type: "term",
          field: FIELD_NAME_1,
          value: "ac"
        }
      ]
    },
    es: {
      bool: {
        must: [
          {
            term: {
              [FIELD_NAME_1]: "abc"
            }
          }
        ],
        must_not:
          [
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
    fts: {
      type: "bool",
      must: [
        {
          type: "term",
          field: FIELD_NAME_1,
          value: "est"
        }
      ],
      filter: [
        {
          type: "term",
          field: FIELD_NAME_1,
          value: "ac"
        }
      ]
    },
    es: {
      bool: {
        must: [
          {
            term: {
              [FIELD_NAME_1]: "est"
            }
          }
        ],
        filter:
          [
            {
              term: {
                [FIELD_NAME_1]: "ac"
              }
            }
          ]
      }
    },
  },
  {
    fts: {
      type: "bool",
      filter: [
        {
          type: "term",
          field: FIELD_NAME_1,
          value: "ac"
        }
      ]
    },
    es: {
      bool: {
        filter:
          [
            {
              term: {
                [FIELD_NAME_1]: "ac"
              }
            }
          ]
      }
    },
  },
  {
    fts: {
      type: "bool",
      must: [
        {
          type: "term",
          field: FIELD_NAME_1,
          value: "est"
        }
      ],
      should: [
        {
          type: "term",
          field: FIELD_NAME_1,
          value: "ac"
        }
      ]
    },
    es: {
      bool: {
        must: [
          {
            term: {
              [FIELD_NAME_1]: "est"
            }
          }
        ],
        should:
          [
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
    fts: {
      type: "bool",
      should: [
        {
          type: "term",
          field: FIELD_NAME_1,
          value: "ac"
        },
        {
          type: "term",
          field: FIELD_NAME_1,
          value: "enim"
        },
        {
          type: "term",
          field: FIELD_NAME_1,
          value: "est"
        }
      ],
      minimum_should_match: 2
    },
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
        minimum_should_match:
          2,
      }
    }
  },
  {
    fts: {
      type: "bool",
      should: [
        {
          type: "term",
          field: FIELD_NAME_1,
          value: "ac"
        },
        {
          type: "term",
          field: FIELD_NAME_1,
          value: "enim"
        },
        {
          type: "term",
          field: FIELD_NAME_1,
          value: "est"
        }
      ],
      minimum_should_match: -2
    },
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
        minimum_should_match: -2
      }
    }
  },
  {
    fts: {
      type: "bool",
      should: [
        {
          type: "term",
          field: FIELD_NAME_1,
          value: "ac"
        },
        {
          type: "term",
          field: FIELD_NAME_1,
          value: "enim"
        },
        {
          type: "term",
          field: FIELD_NAME_1,
          value: "est"
        },
        {
          type: "term",
          field: FIELD_NAME_1,
          value: "at"
        },
        {
          type: "term",
          field: FIELD_NAME_1,
          value: "sed"
        },
      ],
      minimum_should_match: 0.75
    },
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
        minimum_should_match:
          "75%",
      }
    }
  },
  {
    fts: {
      type: "bool",
      should: [
        {
          type: "term",
          field: FIELD_NAME_1,
          value: "ac",
          boost: 10
        },
        {
          type: "term",
          field: FIELD_NAME_1,
          value: "enim"
        },
        {
          type: "term",
          field: FIELD_NAME_1,
          value: "est"
        },
        {
          type: "term",
          field: FIELD_NAME_1,
          value: "at"
        },
        {
          type: "term",
          field: FIELD_NAME_1,
          value: "sed"
        },
      ],
      minimum_should_match: -0.25
    },
    es: {
      bool: {
        should: [
          {
            term: {
              [FIELD_NAME_1]: {
                value: "ac",
                boost: 10
              }
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
        minimum_should_match:
          "-25%",
      }
    }
  },
  {
    fts: {
      type: "bool",
      must: [{
        type: "match_all"
      }],
      not: [{
        type: "term",
        field: FIELD_NAME_1,
        value: "ac"
      }],
    },
    es: {
      bool: {
        must: [
          {
            match_all: {}
          }
        ],
        must_not:
          [
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
    fts: {
      type: "bool",
      boost: 2,
      not: [{
        type: "term",
        field: FIELD_NAME_1,
        value: "ac"
      }],
    },
    es: {
      bool: {
        must_not:
          [
            {
              term: {
                [FIELD_NAME_1]: "ac"
              }
            }
          ],
        boost: 2
      }
    }
  },
  {
    fts: {
      type: "bool",
      boost: 2,
    },
    es: {
      bool: {
        boost: 2
      }
    }
  },
  {
    fts: {
      type: "bool",
      must: [{
        type: "term",
        field: FIELD_NAME_1,
        value: "ac"
      }],
      should: [{
        type: "constant_score",
        filter: [{
          type: "wildcard",
          field: FIELD_NAME_1,
          value: "a?"
        }]
      }],
    },
    es: {
      bool: {
        must: [
          {
            term: {
              [FIELD_NAME_1]: "ac"
            }
          }
        ],
        should:
          [
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
    fts: {
      type: "match",
      field: FIELD_NAME_1,
      value: "orci habitasse eget"
    },
    es: {
      match: {
        [FIELD_NAME_1]: "orci habitasse eget"
      }
    }
  },
  {
    fts: {
      type: "match",
      field: FIELD_NAME_1,
      value: "orci habitasse eget",
      operator: "and"
    },
    es: {
      match: {
        [FIELD_NAME_1]:
          {
            query: "orci habitasse eget",
            operator: "and"
          }
      }
    }
  },
  {
    fts: {
      type: "match",
      field: FIELD_NAME_1,
      value: "orca este",
      fuzziness: "AUTO"
    },
    es: {
      match: {
        [FIELD_NAME_1]:
          {
            query: "orca este",
            fuzziness: "AUTO"
          }
      }
    }
  },
  {
    fts: {
      type: "match",
      field: FIELD_NAME_1,
      value: "orci est",
      operator: "and"
    },
    es: {
      match: {
        [FIELD_NAME_1]:
          {
            query: "orci est",
            operator:
              "and"
          }
      }
    }
  },
  {
    fts: {
      type: "match",
      field: FIELD_NAME_1,
      value: "orci est in",
      minimum_should_match: 0.33
    },
    es: {
      match: {
        [FIELD_NAME_1]:
          {
            query: "orci est in",
            minimum_should_match: "33%"
          }
      }
    }
  },
  {
    fts: {
      type: "match",
      field: FIELD_NAME_1,
      value: "orci est in",
      boost: 10
    },
    es: {
      match: {
        [FIELD_NAME_1]: {
          query: "orci est in",
          boost: 10
        }
      }
    }
  }
];
