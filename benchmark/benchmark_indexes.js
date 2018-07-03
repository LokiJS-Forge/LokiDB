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
 * - BTree Indexes based on self-balancing AVL trees (Currently has added overhead of $loki index lookup)
 */


let Loki = require('../dist/packages/loki/lokidb.loki.js').default,
   crypto = require("crypto"), // for less 'leaky' random string generation
   db = new Loki('binary index perf'),
   samplecoll = null,
   arraySize = 5000, // default, we usually override when calling init functions
   keysToRemove = []; // when inserting docs, we will store rng keys

function genRandomVal() {
   return crypto.randomBytes(50).toString('hex');
}

// in addition to the loki id we will create a key of our own
// (customId) which is number from 1- totalIterations
// we will later perform find() queries against customId with and 
// without an index

function createDatabase(indexType) {
   db = new Loki('binary index perf');

   switch (indexType) {
      case "none":
         samplecoll = db.addCollection('samplecoll');
         break;
      case "lazy":
         samplecoll = db.addCollection('samplecoll', {
            adaptiveBinaryIndices: false,
            indices: ['customId']
         });
         break;
      case "adaptive":
         samplecoll = db.addCollection('samplecoll', {
            adaptiveBinaryIndices: true,
            indices: ['customId']
         });
         break;
      case "btree":
         samplecoll = db.addCollection('samplecoll', {
            btreeIndexes: ['customId']
         });
         break;
   }
}

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

// scenario for many individual, consecutive inserts
function initializeDatabase(silent, docCount) {
   let start, end, totalTime;
   let totalTimes = [];
   let totalMS = 0.0;

   if (typeof docCount === "undefined") {
      docCount = 5000;
   }

   arraySize = docCount;
   keysToRemove = [];

   let id;
   for (let idx = 0; idx < arraySize; idx++) {
      id = genRandomVal();
      v1 = genRandomVal();

      start = process.hrtime();
      samplecoll.insert({
         customId: id,
         val1: v1,
         val2: "more data 1234567890"
      });
      end = process.hrtime(start);
      totalTimes.push(end);

      keysToRemove.push(id);
   }

   shuffle(keysToRemove);

   if (silent === true) {
      return;
   }

   for (let idx = 0; idx < totalTimes.length; idx++) {
      totalMS += totalTimes[idx][0] * 1e3 + totalTimes[idx][1] / 1e6;
   }

   // let's include final find which will probably punish lazy indexes more 
   start = process.hrtime();
   samplecoll.find({ customIdx: 50 });
   end = process.hrtime(start);
   totalTimes.push(end);

   totalMS = totalMS.toFixed(2);
   let rate = arraySize * 1000 / totalMS;
   rate = rate.toFixed(2);
   console.log("load (individual inserts) : " + totalMS + "ms (" + rate + ") ops/s (" + arraySize + " documents)");
}

// silent : if true we wont log timing info to console
// docCount : number of random documents to generate collection with
function initializeDatabaseBatch(silent, docCount) {
   let start, end;
   let totalTimes = [];
   let totalMS = 0.0;
   let batch = [];

   if (typeof docCount === "undefined") {
      docCount = 5000;
   }

   arraySize = docCount;
   keysToRemove = [];

   let id, v1;
   for (let idx = 0; idx < arraySize; idx++) {
      id = genRandomVal();
      v1 = genRandomVal();

      batch.push({
         customId: id,
         val: v1,
         val2: "more data 1234567890"
      });
   }

   keysToRemove.push(id);

   start = process.hrtime();
   samplecoll.insert(batch);
   end = process.hrtime(start);
   totalTimes.push(end);

   shuffle(keysToRemove);

   if (silent === true) {
      return;
   }

   for (let idx = 0; idx < totalTimes.length; idx++) {
      totalMS += totalTimes[idx][0] * 1e3 + totalTimes[idx][1] / 1e6;
   }

   totalMS = totalMS.toFixed(2);
   let rate = arraySize * 1000 / totalMS;
   rate = rate.toFixed(2);
   console.log("load (batch insert) : " + totalMS + "ms (" + rate + ") ops/s (" + arraySize + " documents)");
}

function formatBytes(bytes, decimals) {
   if (bytes == 0) return '0 Byte';
   let k = 1000; // or 1024 for binary
   let dm = decimals + 1 || 3;
   let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
   let i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function logMemoryUsage(msg) {
   let pmu = process.memoryUsage();
   console.log(msg + " => rss : " + formatBytes(pmu.rss) + " heapTotal : " + formatBytes(pmu.heapTotal) + " heapUsed : " + formatBytes(pmu.heapUsed));
}

function profileDatabaseMemory(indexType) {
   let mdb = new Loki("memprof");
   let coll;

   switch (indexType) {
      case "unindexed":
         coll = mdb.addCollection('samplecoll');
         break;
      case "lazy":
         coll = mdb.addCollection('samplecoll', {
            adaptiveBinaryIndices: false,
            indices: ['customId']
         });
         break;
      case "adaptive":
         coll = mdb.addCollection('samplecoll', {
            adaptiveBinaryIndices: true,
            indices: ['customId']
         });
         break;
      case "btree":
         coll = mdb.addCollection('samplecoll', {
            btreeIndexes: ['customId']
         });
         break;
   }

   let id, v1;

   for (let idx = 0; idx < 100000; idx++) {
      id = genRandomVal();
      v1 = genRandomVal();

      coll.insert({
         customId: id,
         val1: v1,
         val2: "more data 1234567890"
      });
   }

   logMemoryUsage(indexType);
}

function perfFind(multiplier) {
   let start, end;
   let totalTimes = [];
   let totalMS = 0;

   let loopIterations = arraySize;
   if (typeof (multiplier) != "undefined") {
      loopIterations = loopIterations * multiplier;
   }

   let customIdx, findId;

   for (let idx = 0; idx < loopIterations; idx++) {
      customIdx = Math.floor(Math.random() * keysToRemove.length) + 1;
      findId = keysToRemove[customIdx];

      start = process.hrtime();
      let results = samplecoll.find({
         'customId': customIdx
      });
      end = process.hrtime(start);
      totalTimes.push(end);
   }

   for (let idx = 0; idx < totalTimes.length; idx++) {
      totalMS += totalTimes[idx][0] * 1e3 + totalTimes[idx][1] / 1e6;
   }

   totalMS = totalMS.toFixed(2);
   let rate = loopIterations * 1000 / totalMS;
   rate = rate.toFixed(2);
   console.log("random coll.find() : " + totalMS + "ms (" + rate + " ops/s) " + loopIterations + " iterations");
}

//  Find Interlaced Inserts ->  insert 5000, for 5000 more iterations insert same test obj after
function perfFindInterlacedInserts(multiplier) {
   let start, end;
   let totalTimes = [];
   let totalMS = 0;

   let loopIterations = arraySize;
   if (typeof (multiplier) != "undefined") {
      loopIterations = loopIterations * multiplier;
   }

   let customIdx, findId, insertId;

   for (let idx = 0; idx < loopIterations; idx++) {
      customIdx = Math.floor(Math.random() * keysToRemove.length) + 1;
      findId = keysToRemove[customIdx];
      insertId = genRandomVal();

      start = process.hrtime();
      let results = samplecoll.find({
         'customId': findId
      });
      // insert junk record, now (outside timing routine) to force index rebuild
      let obj = samplecoll.insert({
         customId: insertId,
         val: 999,
         val2: 999,
         val3: "more data 1234567890"
      });

      end = process.hrtime(start);
      totalTimes.push(end);

      keysToRemove.push(insertId);
   }

   for (let idx = 0; idx < totalTimes.length; idx++) {
      totalMS += totalTimes[idx][0] * 1e3 + totalTimes[idx][1] / 1e6;
   }

   totalMS = totalMS.toFixed(2);
   let rate = loopIterations * 1000 / totalMS;
   rate = rate.toFixed(2);
   console.log("interlaced inserts + coll.find() : " + totalMS + "ms (" + rate + " ops/s) " + loopIterations + " iterations");

}

//  Find Interlaced Removes -> use linear customid for() loop find() and delete that obj when found
function perfFindInterlacedRemoves() {
   let start, end;
   let totalTimes = [];
   let totalMS = 0;

   let removeId;

   for (let idx = 0; idx < arraySize; idx++) {
      removeId = keysToRemove[idx];

      start = process.hrtime();
      let result = samplecoll.findOne({
         'customId': removeId
      });
      samplecoll.remove(result);

      end = process.hrtime(start);
      totalTimes.push(end);
   }

   for (let idx = 0; idx < totalTimes.length; idx++) {
      totalMS += totalTimes[idx][0] * 1e3 + totalTimes[idx][1] / 1e6;
   }

   totalMS = totalMS.toFixed(2);
   let rate = arraySize * 1000 / totalMS;
   rate = rate.toFixed(2);
   console.log("interlaced removes + coll.find() : " + totalMS + "ms (" + rate + " ops/s) " + arraySize + " iterations");
}

//  Find Interlaced Updates -> same as now except mix up customId val (increment by 10000?)
function perfFindInterlacesUpdates() {
   let start, end;
   let totalTimes = [];
   let totalMS = 0;

   let findId, updateId;

   for (let idx = 0; idx < arraySize; idx++) {
      findId = keysToRemove.pop();
      updateId = genRandomVal();

      start = process.hrtime();
      let results = samplecoll.findOne({
         'customId': findId
      });
      results.customId = updateId;
      samplecoll.update(results);

      end = process.hrtime(start);
      totalTimes.push(end);

      keysToRemove.push(updateId);
   }

   for (let idx = 0; idx < totalTimes.length; idx++) {
      totalMS += totalTimes[idx][0] * 1e3 + totalTimes[idx][1] / 1e6;
   }

   totalMS = totalMS.toFixed(2);
   let rate = arraySize * 1000 / totalMS;
   rate = rate.toFixed(2);
   console.log("interlaced updates + coll.find() : " + totalMS + "ms (" + rate + " ops/s) " + arraySize + " iterations");
}

/**
 * Attempt to free up global variables and invoke node garbage collector (if enabled)
 */
function cleanup() {
   if (db) db.close();
   samplecoll = null;
   db = null;
   keysToRemove = [];

   if (global.gc) {
      global.gc();
   }
}

let memoryProfileSteps = [
   () => logMemoryUsage("baseline"),
   cleanup,
   () => {},
   () => profileDatabaseMemory("unindexed"),
   cleanup,
   () => {},
   () => logMemoryUsage("baseline"),
   () => profileDatabaseMemory("adaptive"),
   cleanup,
   () => {},
   () => logMemoryUsage("baseline"),
   () => profileDatabaseMemory("btree")
];

let insertionProfileSteps = [
   // Unindexed Inserts
   () => console.log("no index"),
   () => createDatabase("none"),
   () => initializeDatabase(false, 100000),
   cleanup,
   () => {},
   // Unindexed Batch Inserts
   () => createDatabase("none"),
   () => initializeDatabaseBatch(false, 100000),
   cleanup,
   () => {},
   // Indexed (lazy) inserts
   () => console.log("lazy binary"),
   () => createDatabase("lazy"),
   () => initializeDatabase(false, 100000),
   cleanup,
   () => {},
   // Indexed (lazy) batch inserts
   () => createDatabase("lazy"),
   () => initializeDatabaseBatch(false, 100000),
   cleanup,
   () => {},
   // Indexed (Adaptive) inserts
   () => console.log("adaptive binary"),
   () => createDatabase("adaptive"),
   () => initializeDatabase(false, 100000),
   cleanup,
   () => {},
   // Indexed (Adaptive) batch inserts
   () => createDatabase("adaptive"),
   () => initializeDatabaseBatch(false, 100000),
   cleanup,
   () => {},
   () => console.log("btree"),
   () => createDatabase("btree"),
   () => initializeDatabase(false, 100000),
   cleanup,
   () => {},
   () => createDatabase("btree"),
   () => initializeDatabaseBatch(false, 100000)
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
   () => initializeDatabase(true, 5000),
   () => perfFind(),
   cleanup,
   () => createDatabase("none"),
   () => initializeDatabase(true, 5000),
   () => perfFindInterlacedInserts(),
   cleanup,
   () => createDatabase("none"),
   () => initializeDatabase(true, 5000),
   () => perfFindInterlacedRemoves(),
   cleanup,
   () => createDatabase("none"),
   () => initializeDatabase(true, 5000),
   () => perfFindInterlacesUpdates()
];

let nightmareUnindexedHighSteps = [
   () => {
      console.log("Perf: Unindexed Nightmare (Higher Scale @ 10,000 docs/iterations) ------------------------");
      createDatabase("none");
   },
   () => initializeDatabase(true, 10000),
   () => {},
   () => perfFind(),
   cleanup,
   () => createDatabase("none"),
   () => initializeDatabase(true, 10000),
   () => {},
   () => perfFindInterlacedInserts(),
   cleanup,
   () => createDatabase("none"),
   () => initializeDatabase(true, 10000),
   () => {},
   () => perfFindInterlacedRemoves(),
   cleanup,
   () => createDatabase("none"),
   () => initializeDatabase(true, 10000),
   () => {},
   () => perfFindInterlacesUpdates(),
];

let nightmareAdaptiveLowSteps = [
   () => {
      console.log("Perf: Adaptive Indexed Nightmare (Lower Scale @ 10,000 docs/iterations) ---");

      createDatabase("adaptive");
   },
   () => initializeDatabase(true, 10000),
   () => {},
   () => perfFind(),
   cleanup,
   () => createDatabase("adaptive"),
   () => initializeDatabase(true, 10000),
   () => {},
   () => perfFindInterlacedInserts(1),
   cleanup,
   () => createDatabase("adaptive"),
   () => initializeDatabase(true, 10000),
   () => {},
   () => perfFindInterlacedRemoves(),
   cleanup,
   () => createDatabase("adaptive"),
   () => initializeDatabase(true, 10000),
   () => {},
   () => perfFindInterlacesUpdates(),
];

let nightmareAdaptiveHighSteps = [
   () => {
      console.log("Perf: Adaptive Indexed Nightmare (Higher Scale @ 40,000 docs/iterations) ---");

      createDatabase("adaptive");
   },
   () => initializeDatabase(true, 40000),
   () => {},
   () => perfFind(),
   cleanup,
   () => createDatabase("adaptive"),
   () => initializeDatabase(true, 40000),
   () => {},
   () => perfFindInterlacedInserts(1),
   cleanup,
   () => createDatabase("adaptive"),
   () => initializeDatabase(true, 40000),
   () => {},
   () => perfFindInterlacedRemoves(),
   cleanup,
   () => createDatabase("adaptive"),
   () => initializeDatabase(true, 40000),
   () => {},
   () => perfFindInterlacesUpdates(),
];

let nightmareBtreeLowSteps = [
   () => {
      console.log("Perf: BTree Indexed Nightmare (Lower Scale @ 40,000 docs/iterations) ---");

      createDatabase("btree");
   },
   () => initializeDatabase(true, 40000),
   () => {},
   () => perfFind(),
   () => createDatabase("btree"),
   () => initializeDatabase(true, 40000),
   () => {},
   () => perfFindInterlacedInserts(1),
   () => createDatabase("btree"),
   () => initializeDatabase(true, 40000),
   () => {},
   () => perfFindInterlacedRemoves(),
   () => createDatabase("btree"),
   () => initializeDatabase(true, 40000),
   () => {},
   () => perfFindInterlacesUpdates(),
];

let nightmareBtreeHighSteps = [
   () => {
      console.log("Perf: BTree Indexed Nightmare (Higher Scale @ 100,000 docs/iterations) ---");

      createDatabase("btree");
   },
   () => initializeDatabase(true, 100000),
   () => {},
   () => perfFind(),
   () => createDatabase("btree"),
   () => initializeDatabase(true, 100000),
   () => {},
   () => perfFindInterlacedInserts(1),
   () => createDatabase("btree"),
   () => initializeDatabase(true, 100000),
   () => {},
   () => perfFindInterlacedRemoves(),
   () => createDatabase("btree"),
   () => initializeDatabase(true, 100000),
   () => {},
   () => perfFindInterlacesUpdates()
];

let perfGroups = [
   { name: "Memory Profiling of database with various indexing", steps: memoryProfileSteps },
   { name: "Document Insertion rates with various indexes", steps: insertionProfileSteps },
   { name: "Nightmare Unindexed (Low Range)", steps: nightmareUnindexedLowSteps },
   { name: "Nightmare Unindexed (High Range)", steps: nightmareUnindexedHighSteps },
   { name: "Nightmare Adaptive (Low Range)", steps: nightmareAdaptiveLowSteps },
   { name: "Nightmare Adaptive (Low Range)", steps: nightmareAdaptiveHighSteps },
   { name: "Nightmare Btree (Low Range)", steps: nightmareBtreeLowSteps },
   { name: "Nightmare Btree (High Range)", steps: nightmareBtreeHighSteps }
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

execGroups();