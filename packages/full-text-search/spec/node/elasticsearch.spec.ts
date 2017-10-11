/* global describe, it, expect, beforeEach */
import {DATA} from "./MOCK_DATA";
import {QUERIES} from "./QUERIES";
import {FullTextSearch} from "../../src/full_text_search";
import {Tokenizer} from "../../src/tokenizer";
import {Client} from "elasticsearch";

const INDEX_NAME = "test_index";
const INDEX_TYPE = "MockUp";
const FIELD_NAME_1 = "msg";
const COMPARE_PRECISION = 1e4;

describe("Compare scoring against elasticsearch", () => {

  let client = new Client({
    host: "localhost:9200",
    log: "warning"
  });

  let fts = initFTS();
  let es = initES();

  beforeEach((done) => {
    es.then(() => {
      done();
    }, () => {
      done();
    });
  });

  for (let i = 0; i < QUERIES.length; i++) {
    let query: any = QUERIES[i];
    it(" -> " + i + ": " + JSON.stringify(query), (done) => {
      client.search({
        index: INDEX_NAME,
        type: INDEX_TYPE,
        searchType: "dfs_query_then_fetch",
        body: {
          explain: true,
          "size": 10000,
          query: query.es
        }
      }).then((body: any) => {
        // Compare results with loki.
        let esHits = body.hits.hits;
        let ftsHits = fts.search(query.fts);
        let ftsHitDocs = Object.keys(ftsHits);

        (() => {
          // Compare hit length.
          expect(esHits.length).toEqual(ftsHitDocs.length);
          if (esHits.length !== ftsHitDocs.length) {
            return;
          }

          // Check if esHits should be empty.
          if (query.hasOwnProperty("empty") && query.empty === true) {
            expect(esHits.length).toEqual(0);
            return;
          } else if (esHits.length === 0) {
            expect(esHits.length).not.toEqual(0);
            return;
          }

          for (let j = 0; j < ftsHitDocs.length; j++) {
            if (esHits[j] === undefined) {
              expect(false).toBe(true);
            }
            let esID = esHits[j]._id;
            expect(ftsHits).toHaveMember(esID);
            if (!ftsHits.hasOwnProperty(esID)) {
              continue;
            }

            let esScore = Math.round(esHits[j]._score * COMPARE_PRECISION) / COMPARE_PRECISION;
            let ftsScore = Math.round(ftsHits[esID] * COMPARE_PRECISION) / COMPARE_PRECISION;

            expect(esScore).toEqual(ftsScore);
            if (esScore !== ftsScore) {
              throw "Different scores: " + esID;
            }
          }
        })();
        done();
      }, (error: Error) => {
        throw error;
      });
    });
  }


  function initES() {
    // Reset client.
    return client.indices.delete({
      index: INDEX_NAME
    }).then(create, create);


    function create() {
      // Add documents.
      return client.indices.create({
        index: INDEX_NAME,
        body: {
          mappings: {
            [INDEX_TYPE]: {
              properties: {
                [FIELD_NAME_1]: {
                  type: "text",
                  index_options: "freqs",
                  analyzer: "my_analyzer"
                },
              }
            }
          },
          settings: {
            analysis: {
              analyzer: {
                my_analyzer: {
                  type: "standard",
                  stopwords: ["habitasse", "morbi"]
                }
              }
            }
          }
        }
      }).then(() => {
        let createAction = (data: any) => client.index({
          index: INDEX_NAME,
          type: INDEX_TYPE,
          id: data.id,
          body: data
        });
        return Promise.all(DATA.map(createAction)).then(() => {
          return client.indices.refresh({index: INDEX_NAME});
        });
      });
    }
  }

  function initFTS() {
    let tkz = new Tokenizer();
    tkz.add("stop-word", (token) => (token !== "habitasse" && token !== "morbi") ? token : "");

    let fts = new FullTextSearch([{
      name: FIELD_NAME_1,
      tokenizer: tkz
    }]);

    // Add documents.
    for (let i = 0; i < DATA.length; i++) {
      fts.addDocument({
        $loki: DATA[i].id,
        [FIELD_NAME_1]: DATA[i][FIELD_NAME_1]
      });
    }
    return fts;
  }
});
