/* global describe, it, expect, beforeEach */
import {DATA} from "./MOCK_DATA";
import {QUERIES} from "./QUERIES";
import {FullTextSearch} from "../../src/full_text_search";
import {Tokenizer} from "../../src/tokenizer";
import {Client} from "elasticsearch";
import {Scorer} from "../../src/scorer";
import * as util from "util";

const INDEX_NAME = "test_index";
const INDEX_TYPE = "MockUp";
const FIELD_NAME_1 = "msg";
const COMPARE_PRECISION = 1e4;

function fieldLengthES5(fieldLength: number) {
  // Lucene 5 uses a SmallFloat (size of 1 byte) to store the field length in scoring.
  // This is useless in javascript, because every number is represented as a double (8 byte).
  // To align the scoring result with lucene, this calculation is still needed.
  // Lucene also includes the field boost, but field boost is deprecated and not supported by Loki.

  // Find closest value in array.
  const lockUp = [1, 1.30612242, 1.77777779, 2.55999994, 4, 5.22448969, 7.11111116, 10.2399998, 16, 20.8979588,
    28.4444447, 40.9599991, 64, 83.591835, 113.777779, 163.839996, 256, 334.36734, 455.111115, 655.359985, 1024,
    1337.46936, 1820.44446, 2621.43994, 4096, 5349.87744, 7281.77783, 10485.7598, 16384, 21399.5098, 29127.1113,
    41943.0391, 65536, 85598.0391, 116508.445, 167772.156, 262144, 342392.156, 466033.781, 671088.625, 1048576,
    1369568.62, 1864135.12, 2684354.5, 4194304, 5478274.5, 7456540.5, 10737418, 16777216, 21913098, 29826162,
    42949672, 67108864, 87652392, 119304648, 171798688, 268435456, 350609568, 477218592, 687194752];

  for (let i = 0; i < lockUp.length; i++) {
    if (lockUp[i] >= fieldLength) {
      return lockUp[i];
    }
  }
  throw RangeError("Unsupported field length.");
}

function fieldLengthES6(fieldLength: number) {
  // Lucene 6 uses a SmallInteger (size of 1 byte) to store the field length in scoring.
  // This is useless in javascript, because every number is represented as a double (8 byte).
  // To align the scoring result with lucene, this calculation is still needed.
  // Lucene also includes the field boost, but field boost is deprecated and not supported by Loki.

  function leading(value: number) {
    let result = 0;//could be a char or int8_t instead
    if (value) {//this assumes the value is 64bit
      if (0xFFFFFFFF00000000 & value) {
        value >>= (1 << 5);
        result |= (1 << 5);
      }//if it is 32bit then remove this line
      if (0x00000000FFFF0000 & value) {
        value >>= (1 << 4);
        result |= (1 << 4);
      }//and remove the 32msb
      if (0x000000000000FF00 & value) {
        value >>= (1 << 3);
        result |= (1 << 3);
      }
      if (0x00000000000000F0 & value) {
        value >>= (1 << 2);
        result |= (1 << 2);
      }
      if (0x000000000000000C & value) {
        value >>= (1 << 1);
        result |= (1 << 1);
      }
      if (0x0000000000000002 & value) {
        result |= (1 << 0);
      }
    } else {
      result = -1;
    }
    return 64 - result - 1;
  }

  function longToInt4(i: number) {
    let numBits = 64 - leading(i);
    if (numBits < 4) {
      // subnormal value
      return i;
    } else {
      // normal value
      let shift = numBits - 4;
      // only keep the 5 most significant bits
      let encoded = (i >> shift);//Math.toIntExact(i >>> shift);
      // clear the most significant bit, which is implicit
      encoded &= 0x07;
      // encode the shift, adding 1 because 0 is reserved for subnormal values
      encoded |= (shift + 1) << 3;
      return encoded;
    }
  }

  function int4ToLong(i: number) {
    let bits = i & 0x07;
    let shift = (i >> 3) - 1;
    let decoded;
    if (shift === -1) {
      // subnormal value
      decoded = bits;
    } else {
      // normal value
      decoded = (bits | 0x08) << shift;
    }
    return decoded;
  }

  let MAX_INT4 = longToInt4(Math.pow(2, 31));
  let NUM_FREE_VALUES = 24;//64 - MAX_INT4;

  function intToByte4(i: number) {
    if (i < NUM_FREE_VALUES) {
      return i;
    } else {
      return (NUM_FREE_VALUES + longToInt4(i - NUM_FREE_VALUES));
    }
  }

  function byte4ToInt(b: number) {
    let i = b;
    if (i < NUM_FREE_VALUES) {
      return i;
    } else {
      let decoded = NUM_FREE_VALUES + int4ToLong(i - NUM_FREE_VALUES);
      return decoded;
    }
  }

  return byte4ToInt(intToByte4(fieldLength));
}

describe("Compare scoring against elasticsearch", () => {

  let client = new Client({
    host: "localhost:9200",
    log: "warning"
  });

  let fts = initFTS();
  let es = initES();

  beforeEach((done) => {
    es.then(() => {
      return client.info({});
    }).then((body: any) => {
      // Select correct field length function.
      if (body.version.number.startsWith("5")) {
        Scorer["_calculateFieldLength"] = fieldLengthES5;
      } else {
        Scorer["_calculateFieldLength"] = fieldLengthES6;
      }
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
      })
        .then((body: any) => {
          // Compare results with loki.
          let esHits = body.hits.hits;
          let ftsHits = fts.search(query.fts);
          let ftsHitDocs = Object.keys(ftsHits);

          // Compare hit length.
          expect(esHits.length).toEqual(ftsHitDocs.length);
          if (esHits.length !== ftsHitDocs.length) {
            done();
            return;
          }

          // Check if esHits should be empty.
          if (query.hasOwnProperty("empty") && query.empty === true) {
            expect(esHits.length).toEqual(0);
            done();
            return;
          } else if (esHits.length === 0) {
            expect(esHits.length).not.toEqual(0);
            done();
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
          }
          done();
        })
        .catch(() => {
          expect(false).toBe(true);
          done();
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
    }], "$loki");

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
