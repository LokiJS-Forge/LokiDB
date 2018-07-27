/**
 * This module is to be used to benchmark loki binary index lifecycle
 *
 * Attempt to simulate and benchmark effects of various rebuild strategies on
 * insert, find, remove, and update to be used to instrument refactorings/optimizations.
 *
 * Since a given index type may prioritize lookups/finds over maintenance of insert/update/remove ops,
 * the 'Nightmare' tests attempt to pair a find along with insert/update/removes. The resulting
 * times tend to average out this bias to allow examining overall performance for scale.
 * 
 * Currently, this benchmark will compare the following index options :
 * - Unindexed
 * - Adaptive Binary Indices (Lazy benchmarks can be uncommented if you wish those as well)
 * - AVL Indexes based on self-balancing AVL binary search trees 
 */


let Loki = require('../build/packages/loki/lokidb.loki.js').default,
  crypto = require("crypto"); // for less 'leaky' random string generation

/**
 * Generate random string using node cryto lib for less memory 'leaky' behavior than js string construction
 */
function genRandomVal() {
  return crypto.randomBytes(50).toString('hex');
}

/**
 * Helper method to shuffle array
 * @param {*} array 
 */
function shuffle(array) {
  let currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

/**
 * Helper method to convert number of bytes into more readable representation.
 * @param {*} bytes 
 * @param {*} decimals 
 */
function formatBytes(bytes, decimals) {
  if (bytes == 0) return '0 Byte';
  let k = 1000; // or 1024 for binary
  let dm = decimals + 1 || 3;
  let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Logs memory usage info to console
 * @param {*} msg 
 */
function logMemoryUsage(msg) {
  let pmu = process.memoryUsage();
  console.log(msg + " => rss : " + formatBytes(pmu.rss) + " heapTotal : " + formatBytes(pmu.heapTotal) + " heapUsed : " + formatBytes(pmu.heapUsed));
}

/**
 * Helper method for instantiating a loki database
 * @param {*} mode indexing mode ("none", "avl")
 */
function createDatabase(mode) {
  let tdb = new Loki("temp.db");
  let coll;

  switch (mode) {
    case "avl":
      coll = tdb.addCollection('perfcoll', {
        rangedIndexes: {
          "customId": { indexTypeName: "avl", comparatorName: "js" }
        }
      });
      break;
    case "none":
    default:
      coll = tdb.addCollection('perfcoll');
      break;
  }

  return tdb;
}

/**
 * Helper method for populating a collection
 * @param {*} db loki database instance containing collection to populate
 * @param {*} count number of documents to insert
 */
function populateDatabase(db, count) {
  let coll = db.getCollection("perfcoll");

  // populate collection
  let idxbuf = [];
  let customIdx, v1;
  for (let idx = 0; idx < count; idx++) {
    customIdx = count - idx;

    idxbuf.push(customIdx);
    v1 = genRandomVal();

    coll.insert({
      customId: customIdx,
      val: v1,
      val2: "more data 1234567890"
    });
  }

  return idxbuf;
}

/**
 * Profiles memory usage for unindexed and avl indexed collections
 * @param {*} mode indexing mode ("none", "avl") 
 * @param {*} count 
 */
function profileDatabaseMemory(mode, count) {
  let mdb = createDatabase(mode);
  populateDatabase(mdb, count);
  let coll = mdb.getCollection("perfcoll");

  let id, v1;

  for (let idx = 0; idx < 100000; idx++) {
    id = count - idx;
    v1 = genRandomVal();

    coll.insert({
      customId: id,
      val1: v1,
      val2: "more data 1234567890"
    });
  }

  logMemoryUsage(mode);
}

/**
 * Benchmarks insertion rates for unindexed and avl indexed collections
 * @param {*} mode indexing mode ("none", "avl") 
 * @param {*} count 
 */
function profileInsertion(mode, count) {
  let mdb = createDatabase(mode);
  let coll = mdb.getCollection("perfcoll");

  let start, end;
  let totalTimes = [];
  let totalMS = 0;

  // populate collection manually instead of helper since we won't retain idxbuf
  let customIdx, v1;
  for (let idx = 0; idx < count; idx++) {
    customIdx = count - idx;

    v1 = genRandomVal();

    start = process.hrtime();

    coll.insert({
      customId: customIdx,
      val: v1,
      val2: "more data 1234567890"
    });

    end = process.hrtime(start);
    totalTimes.push(end);
  }

  for (let idx = 0; idx < totalTimes.length; idx++) {
    totalMS += totalTimes[idx][0] * 1e3 + totalTimes[idx][1] / 1e6;
  }

  totalMS = totalMS.toFixed(2);
  let rate = count * 1000 / totalMS;
  rate = rate.toFixed(2);
  console.log("insertion rate (" + mode + ") : " + totalMS + "ms (" + rate + " ops/s) " + count + " documents");
}

/**
 * Benchmarks find performance for given document count (not multiplied to show raw ms perf)
 * @param {*} mode indexing mode ("none", "avl")
 * @param {*} count 
 */
function perfFind(mode, count) {
  let fdb = createDatabase(mode);
  let idxbuf = populateDatabase(fdb, count);
  let coll = fdb.getCollection("perfcoll");

  let start, end;
  let totalTimes = [];
  let totalMS = 0;

  let customIdx, results;

  for (let idx = 0; idx < count; idx++) {
    customIdx = idxbuf[idx];

    start = process.hrtime();
    results = coll.find({
      'customId': customIdx
    });
    end = process.hrtime(start);
    totalTimes.push(end);
  }

  for (let idx = 0; idx < totalTimes.length; idx++) {
    totalMS += totalTimes[idx][0] * 1e3 + totalTimes[idx][1] / 1e6;
  }

  totalMS = totalMS.toFixed(2);
  let rate = count * 1000 / totalMS;
  rate = rate.toFixed(2);
  console.log("random coll.find() : " + totalMS + "ms (" + rate + " ops/s) " + count + " iterations");
}

/**
 * Benchmarks interlacing insert + find (on indexed column) to measure index thrashing
 * @param {*} mode indexing mode ("none", "avl")
 * @param {*} count 
 */
function perfFindInterlacedInserts(mode, count) {
  let fdb = createDatabase(mode);
  let idxbuf = [];
  let coll = fdb.getCollection("perfcoll");

  let start, end;
  let totalTimes = [];
  let totalMS = 0;

  let customIdx, results;

  for (let idx = 0; idx < count; idx++) {
    customIdx = count - idx;

    start = process.hrtime();

    // insert record with id outside range of pre-populated records
    coll.insert({
      customId: customIdx,
      val: 999,
      val2: 999,
      val3: "more data 1234567890"
    });

    // do quick find of object just inserted
    results = coll.find({
      'customId': customIdx
    });

    end = process.hrtime(start);
    totalTimes.push(end);

    if (results.length !== 1 || results[0].customId !== customIdx) {
      console.log("(interlaced inserts) unexpected results")
    }
  }

  if (coll.find().length !== count) {
    console.log("(interlaced inserts) unexpected total inserted document count");
  }

  for (let idx = 0; idx < totalTimes.length; idx++) {
    totalMS += totalTimes[idx][0] * 1e3 + totalTimes[idx][1] / 1e6;
  }

  totalMS = totalMS.toFixed(2);
  let rate = count * 1000 / totalMS;
  rate = rate.toFixed(2);
  console.log("interlaced inserts + coll.find() : " + totalMS + "ms (" + rate + " ops/s) " + count + " iterations");
}

/**
 * Benchmarks interlacing find + remove (on indexed column) to measure index thrashing
 * @param {*} mode indexing mode ("none", "avl")
 * @param {*} count
 */
function perfFindInterlacedRemoves(mode, count, multiple) {
  let fdb = createDatabase(mode);
  let idxbuf = populateDatabase(fdb, count);
  let coll = fdb.getCollection("perfcoll");

  let start, end;
  let totalTimes = [];
  let totalMS = 0;

  let removeId, result;

  for (let idx = 0; idx < count; idx++) {
    removeId = idxbuf.pop();

    start = process.hrtime();
    result = coll.findOne({
      'customId': removeId
    });
    coll.remove(result);

    end = process.hrtime(start);
    totalTimes.push(end);
  }

  if (coll.find().length !== 0) {
    console.log("(interlaces removes) unexpected final doc count");
  }

  for (let idx = 0; idx < totalTimes.length; idx++) {
    totalMS += totalTimes[idx][0] * 1e3 + totalTimes[idx][1] / 1e6;
  }

  totalMS = totalMS.toFixed(2);
  let rate = count * 1000 / totalMS;
  rate = rate.toFixed(2);
  console.log("interlaced removes + coll.find() : " + totalMS + "ms (" + rate + " ops/s) " + count + " iterations");
}

/**
 * Benchmarks interlacing find + update (on indexed column) to measure index thrashing
 * @param {*} mode indexing mode ("none", "avl")
 * @param {*} count number of interlaced finds+updates to perform
 */
function perfFindInterlacesUpdates(mode, count) {
  let fdb = createDatabase(mode);
  let idxbuf = populateDatabase(fdb, count);
  let coll = fdb.getCollection("perfcoll");

  let start, end;
  let totalTimes = [];
  let totalMS = 0;

  let customIdx, newIdx, result;

  for (let idx = 0; idx < count; idx++) {
    customIdx = idxbuf.pop();
    newIdx = count + idx;

    start = process.hrtime();

    // lookup next doc
    result = coll.findOne({
      'customId': customIdx
    });

    // update doc, modifying the field (potentially) being indexed
    result.customId = newIdx;
    coll.update(result);

    end = process.hrtime(start);
    totalTimes.push(end);
  }

  if (coll.find().length !== count) {
    console.log("(interlaced updates) unexpected final doc count");
  }

  for (let idx = 0; idx < totalTimes.length; idx++) {
    totalMS += totalTimes[idx][0] * 1e3 + totalTimes[idx][1] / 1e6;
  }

  totalMS = totalMS.toFixed(2);
  let rate = count * 1000 / totalMS;
  rate = rate.toFixed(2);
  console.log("interlaced updates + coll.find() : " + totalMS + "ms (" + rate + " ops/s) " + count + " iterations");
}

/**
 * Attempt to free up global variables and invoke node garbage collector (if enabled)
 */
function cleanup() {
  if (global.gc) {
    global.gc();
  }
}

let memoryProfileSteps = [
  cleanup,
  () => logMemoryUsage("baseline"),
  () => profileDatabaseMemory("unindexed", 10000),
  cleanup,
  () => logMemoryUsage("baseline"),
  () => profileDatabaseMemory("avl", 10000)
];

let insertionProfileSteps = [
  // Unindexed Inserts
  cleanup,
  () => console.log("no index"),
  () => profileInsertion("none", 100000),
  // AVL indexed inserts
  cleanup,
  () => console.log("avl tree index"),
  () => profileInsertion("avl", 100000)
];

let nightmareUnindexedLowSteps = [
  () => {
    console.log("");
    console.log("------------ Beginning Nightmare Benchmarks ------------");
    console.log("Nightmare tests combine a find() with either an insert(), update(), or remove()");
    console.log("to remove any bias and show weaknesses that each indexing strategy may be leveraging, ");
    console.log("such as placing all emphasis on find() performance to detriment of index maintenance costs.");
    console.log("");
  },
  () => {
    console.log("Perf: Unindexed Nightmare (Lower Scale @ 5,000 docs/iterations) ------------------------");
    createDatabase("none");
  },
  cleanup,
  () => perfFind("none", 5000),
  cleanup,
  () => perfFindInterlacedInserts("none", 5000),
  cleanup,
  () => perfFindInterlacedRemoves("none", 5000),
  cleanup,
  () => perfFindInterlacesUpdates("none", 5000)
];

let nightmareUnindexedHighSteps = [
  () => {
    console.log("Perf: Unindexed Nightmare (Higher Scale @ 10,000 docs/iterations) ------------------------");
    createDatabase("none");
  },
  cleanup,
  () => perfFind("none", 10000),
  cleanup,
  () => perfFindInterlacedInserts("none", 10000),
  cleanup,
  () => perfFindInterlacedRemoves("none", 10000),
  cleanup,
  () => perfFindInterlacesUpdates("none", 10000),
];

let nightmareAvlLowSteps = [
  () => console.log("Perf: AVL Indexed Nightmare (Lower Scale @ 40,000 docs/iterations) ---"),
  cleanup,
  () => perfFind("avl", 40000),
  cleanup,
  () => perfFindInterlacedInserts("avl", 40000),
  cleanup,
  () => perfFindInterlacedRemoves("avl", 40000),
  cleanup,
  () => perfFindInterlacesUpdates("avl", 40000),
];

let nightmareAvlHighSteps = [
  () => console.log("Perf: AVL Indexed Nightmare (Higher Scale @ 100,000 docs/iterations) ---"),
  cleanup,
  () => perfFind("avl", 100000),
  cleanup,
  () => perfFindInterlacedInserts("avl", 100000),
  cleanup,
  () => perfFindInterlacedRemoves("avl", 100000),
  cleanup,
  () => perfFindInterlacesUpdates("avl", 100000)
];

let perfGroups = [
  //{ name: "Memory Profiling of database with various indexing", steps: memoryProfileSteps },
  //{ name: "Document Insertion rates with various indexes", steps: insertionProfileSteps },
  { name: "Nightmare Unindexed (Low Range)", steps: nightmareUnindexedLowSteps },
  { name: "Nightmare Unindexed (High Range)", steps: nightmareUnindexedHighSteps },
  { name: "Nightmare AVL Index (Low Range)", steps: nightmareAvlLowSteps },
  { name: "Nightmare AVL Index (High Range)", steps: nightmareAvlHighSteps }
];

function execSteps(steps) {
  if (steps.length === 0) {
    setTimeout(execGroups, 4000);
    return;
  }

  let s = steps.shift();

  s();

  setTimeout(() => { execSteps(steps); }, 1000);
}

function execGroups() {
  let g = perfGroups.shift();
  if (!g) return;

  cleanup();

  console.log("");
  console.log("## " + g.name + " ##");
  console.log("");
  execSteps(g.steps);
}

if (!global.gc) {
  console.warn("##");
  console.warn("## IMPORTANT! : For accuracy of results, launch node with --expose-gc flag");
  console.warn("##");
}

console.log("");
console.log("Note: run 'npm run build' before benchmarking after getting latest or modifying code");
console.log("");

execGroups();