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


var Loki = require('../dist/packages/loki/lokidb.loki.js').default,
   crypto = require("crypto"), // for random string generation
   db = new Loki('binary index perf'),
   samplecoll = null,
   uniquecoll = null,
   arraySize = 5000, // default, we usually override when calling init functions
   keysToRemove = [], // when inserting docs, we will store rng keys
   totalIterations = 20000, // how many times we search it
   results = [],
   getIterations = 2000000; // get is crazy fast due to binary search so this needs separate scale

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
   var start, end, totalTime;
   var totalTimes = [];
   var totalMS = 0.0;

   if (typeof docCount === "undefined") {
      docCount = 5000;
   }

   arraySize = docCount;
   keysToRemove = [];

   var id, va;
   for (var idx = 0; idx < arraySize; idx++) {
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

   for (var idx = 0; idx < totalTimes.length; idx++) {
      totalMS += totalTimes[idx][0] * 1e3 + totalTimes[idx][1] / 1e6;
   }

   // let's include final find which will probably punish lazy indexes more 
   start = process.hrtime();
   samplecoll.find({ customIdx: 50 });
   end = process.hrtime(start);
   totalTimes.push(end);

   //var totalMS = end[0] * 1e3 + end[1]/1e6;
   totalMS = totalMS.toFixed(2);
   var rate = arraySize * 1000 / totalMS;
   rate = rate.toFixed(2);
   console.log("load (individual inserts) : " + totalMS + "ms (" + rate + ") ops/s (" + arraySize + " documents)");
}

// silent : if true we wont log timing info to console
// docCount : number of random documents to generate collection with
function initializeDatabaseBatch(silent, docCount) {
   var start, end, totalTime;
   var totalTimes = [];
   var totalMS = 0.0;
   var batch = [];

   if (typeof docCount === "undefined") {
      docCount = 5000;
   }

   arraySize = docCount;
   keysToRemove = [];

   var id, v1;
   for (var idx = 0; idx < arraySize; idx++) {
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

   for (var idx = 0; idx < totalTimes.length; idx++) {
      totalMS += totalTimes[idx][0] * 1e3 + totalTimes[idx][1] / 1e6;
   }

   //var totalMS = end[0] * 1e3 + end[1]/1e6;
   totalMS = totalMS.toFixed(2);
   var rate = arraySize * 1000 / totalMS;
   rate = rate.toFixed(2);
   console.log("load (batch insert) : " + totalMS + "ms (" + rate + ") ops/s (" + arraySize + " documents)");
}

function formatBytes(bytes, decimals) {
   if (bytes == 0) return '0 Byte';
   var k = 1000; // or 1024 for binary
   var dm = decimals + 1 || 3;
   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
   var i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function logMemoryUsage(msg) {
   var pmu = process.memoryUsage();
   console.log(msg + " => rss : " + formatBytes(pmu.rss) + " heapTotal : " + formatBytes(pmu.heapTotal) + " heapUsed : " + formatBytes(pmu.heapUsed));
}

function profileDatabaseMemory(indexType) {
   let mdb = new Loki("memprof");
   let coll;
   let hu1, hu2;

   hu1 = process.memoryUsage().heapUsed;

   switch (indexType) {
      case "none":
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

   hu2 = process.memoryUsage().heapUsed;
   //console.log("heap used (" + indexType + ") : " + formatBytes(hu2-hu1));
   logMemoryUsage(indexType);
}

function perfFind(multiplier) {
   var start, end;
   var totalTimes = [];
   var totalMS = 0;

   var loopIterations = arraySize;
   if (typeof (multiplier) != "undefined") {
      loopIterations = loopIterations * multiplier;
   }

   var customIdx, findId;

   for (var idx = 0; idx < loopIterations; idx++) {
      customIdx = Math.floor(Math.random() * keysToRemove.length) + 1;
      findId = keysToRemove[customIdx];

      start = process.hrtime();
      var results = samplecoll.find({
         'customId': customIdx
      });
      end = process.hrtime(start);
      totalTimes.push(end);
   }

   for (var idx = 0; idx < totalTimes.length; idx++) {
      totalMS += totalTimes[idx][0] * 1e3 + totalTimes[idx][1] / 1e6;
   }

   totalMS = totalMS.toFixed(2);
   var rate = loopIterations * 1000 / totalMS;
   rate = rate.toFixed(2);
   console.log("random coll.find() : " + totalMS + "ms (" + rate + " ops/s) " + loopIterations + " iterations");
}

//  Find Interlaced Inserts ->  insert 5000, for 5000 more iterations insert same test obj after
function perfFindInterlacedInserts(multiplier) {
   var start, end;
   var totalTimes = [];
   var totalMS = 0;

   var loopIterations = arraySize;
   if (typeof (multiplier) != "undefined") {
      loopIterations = loopIterations * multiplier;
   }

   var customIdx, findId, insertId;

   for (var idx = 0; idx < loopIterations; idx++) {
      customIdx = Math.floor(Math.random() * keysToRemove.length) + 1;
      findId = keysToRemove[customIdx];
      insertId = genRandomVal();

      start = process.hrtime();
      var results = samplecoll.find({
         'customId': findId
      });
      // insert junk record, now (outside timing routine) to force index rebuild
      var obj = samplecoll.insert({
         customId: insertId,
         val: 999,
         val2: 999,
         val3: "more data 1234567890"
      });

      end = process.hrtime(start);
      totalTimes.push(end);

      keysToRemove.push(insertId);
   }

   for (var idx = 0; idx < totalTimes.length; idx++) {
      totalMS += totalTimes[idx][0] * 1e3 + totalTimes[idx][1] / 1e6;
   }

   totalMS = totalMS.toFixed(2);
   var rate = loopIterations * 1000 / totalMS;
   rate = rate.toFixed(2);
   console.log("interlaced inserts + coll.find() : " + totalMS + "ms (" + rate + " ops/s) " + loopIterations + " iterations");

}

//  Find Interlaced Removes -> use linear customid for() loop find() and delete that obj when found
function perfFindInterlacedRemoves() {
   var start, end;
   var totalTimes = [];
   var totalMS = 0;

   var removeId;

   for (var idx = 0; idx < arraySize; idx++) {
      removeId = keysToRemove[idx];

      start = process.hrtime();
      var result = samplecoll.findOne({
         'customId': removeId
      });
      samplecoll.remove(result);

      end = process.hrtime(start);
      totalTimes.push(end);
   }

   for (var idx = 0; idx < totalTimes.length; idx++) {
      totalMS += totalTimes[idx][0] * 1e3 + totalTimes[idx][1] / 1e6;
   }

   totalMS = totalMS.toFixed(2);
   var rate = arraySize * 1000 / totalMS;
   rate = rate.toFixed(2);
   console.log("interlaced removes + coll.find() : " + totalMS + "ms (" + rate + " ops/s) " + arraySize + " iterations");
}

//  Find Interlaced Updates -> same as now except mix up customId val (increment by 10000?)
function perfFindInterlacesUpdates() {
   var start, end;
   var totalTimes = [];
   var totalMS = 0;

   var findId, updateId;

   for (var idx = 0; idx < arraySize; idx++) {
      findId = keysToRemove.pop();
      updateId = genRandomVal();

      start = process.hrtime();
      var results = samplecoll.findOne({
         'customId': findId
      });
      results.customId = updateId;
      samplecoll.update(results);

      end = process.hrtime(start);
      totalTimes.push(end);

      keysToRemove.push(updateId);
   }

   for (var idx = 0; idx < totalTimes.length; idx++) {
      totalMS += totalTimes[idx][0] * 1e3 + totalTimes[idx][1] / 1e6;
   }

   totalMS = totalMS.toFixed(2);
   var rate = arraySize * 1000 / totalMS;
   rate = rate.toFixed(2);
   console.log("interlaced updates + coll.find() : " + totalMS + "ms (" + rate + " ops/s) " + arraySize + " iterations");
}

var steps = [
   () => {
      console.log("Memory Profile (database population along with index overhead) ----")
   },
   () => logMemoryUsage("baseline"),
   () => {},
   () => {},
   () => {
      //console.log("Memory Profile (Unindexed) ------------------")
      profileDatabaseMemory("none");
   },
   () => {},
   () => {},
   () => {
      //console.log("Memory Profile (Adaptive) ------------------")
      profileDatabaseMemory("adaptive");
   },
   () => {},
   () => {},
   () => {},
   () => {
      //console.log("Memory Profile (BTree) ------------------")
      profileDatabaseMemory("btree");
   },
   () => {},
   () => {},
   () => {},
   () => { console.log("2nd pass --------------") },
   () => logMemoryUsage("baseline"),
   () => {},
   () => {},
   () => {
      //console.log("Memory Profile (Unindexed) ------------------")
      profileDatabaseMemory("none");
   },
   () => {},
   () => {},
   () => {
      //console.log("Memory Profile (Adaptive) ------------------")
      profileDatabaseMemory("adaptive");
   },
   () => {},
   () => {},
   () => {},
   () => {
      //console.log("Memory Profile (BTree) ------------------")
      profileDatabaseMemory("btree");
   },
   () => {},
   () => {},
   () => {},
   () => { console.log("3rd pass --------------") },
   () => logMemoryUsage("baseline"),
   () => {},
   () => {},
   () => {
      //console.log("Memory Profile (Unindexed) ------------------")
      profileDatabaseMemory("none");
   },
   () => {},
   () => {},
   () => {
      //console.log("Memory Profile (Adaptive) ------------------")
      profileDatabaseMemory("adaptive");
   },
   () => {},
   () => {},
   () => {},
   () => {
      //console.log("Memory Profile (BTree) ------------------")
      profileDatabaseMemory("btree");
   },
   () => {},
   () => {},
   () => {},
   () => {
      console.log("");
      console.log("Perf: Unindexed Inserts---------------------");
      createDatabase("none");
   },
   () => initializeDatabase(false, 100000),
   () => createDatabase("none"),
   () => initializeDatabaseBatch(false, 100000),
   () => {
      console.log("");
      console.log("Perf: Indexed Inserts (Lazy) ------------------------");
      createDatabase("lazy");
   },
   () => initializeDatabase(false, 100000),
   () => createDatabase("lazy"),
   () => initializeDatabaseBatch(false, 100000),
   () => {
      console.log("");
      console.log("Perf: Indexed Inserts (Adaptive) ------------------------");
      createDatabase("adaptive");
   },
   () => initializeDatabase(false, 100000),
   () => createDatabase("adaptive"),
   () => initializeDatabaseBatch(false, 100000),
   () => {
      console.log("");
      console.log("------------ Beginning Nightmare Benchmarks ------------");
      console.log("Nightmare tests combine a find() with either an insert(), update(), or remove()");
      console.log("to remove any bias and show weaknesses that each indexing strategy may be leveraging, ");
      console.log("such as placing all emphasis on find() performance to detriment of index maintenance costs.");
      console.log("");

   },
   () => {
      console.log("");
      console.log("Perf: Unindexed Nightmare (Lower Scale @ 5,000) ------------------------");
      createDatabase("none");
   },
   () => initializeDatabase(true, 5000),
   () => perfFind(),
   () => createDatabase("none"),
   () => initializeDatabase(true, 5000),
   () => perfFindInterlacedInserts(),
   () => createDatabase("none"),
   () => initializeDatabase(true, 5000),
   () => perfFindInterlacedRemoves(),
   () => createDatabase("none"),
   () => initializeDatabase(true, 5000),
   () => perfFindInterlacesUpdates(),
   () => {
      console.log("");
      console.log("Perf: Unindexed Nightmare (Higher Scale @ 10,000) ------------------------");
      createDatabase("none");
   },
   () => initializeDatabase(true, 10000),
   () => perfFind(),
   () => createDatabase("none"),
   () => initializeDatabase(true, 10000),
   () => perfFindInterlacedInserts(),
   () => createDatabase("none"),
   () => initializeDatabase(true, 10000),
   () => perfFindInterlacedRemoves(),
   () => createDatabase("none"),
   () => initializeDatabase(true, 10000),
   () => perfFindInterlacesUpdates(),
   // Uncomment the below if you wish to compare nightmare lazy with subsequent nightmare adaptive.
   // At this point i don't think many people will be using the (non-default) lazy binary indices
   //() => {
   //   console.log("");
   //   console.log("Perf: Indexed finds (Nightmare Lazy Index Thrashing Test) ------");
   //   createDatabaseIndexed(false);
   //},
   //() => initializeDatabase(true, 80000),
   //() => perfFind(),
   //() => createDatabaseIndexed(false),
   //() => initializeDatabase(true, 3000),
   //() => perfFindInterlacedInserts(1),
   //() => createDatabaseIndexed(false),
   //() => initializeDatabase(true, 3000),
   //() => perfFindInterlacedRemoves(),
   //() => createDatabaseIndexed(false),
   //() => initializeDatabase(true, 3000),
   //() => perfFindInterlacesUpdates(),
   () => {
      console.log("");
      console.log("Perf: Adaptive Indexed Nightmare (Lower Scale @ 10,000) ---");

      createDatabase("adaptive");
   },
   () => initializeDatabase(true, 10000),
   () => perfFind(),
   () => createDatabase("adaptive"),
   () => initializeDatabase(true, 10000),
   () => perfFindInterlacedInserts(1),
   () => createDatabase("adaptive"),
   () => initializeDatabase(true, 10000),
   () => perfFindInterlacedRemoves(),
   () => createDatabase("adaptive"),
   () => initializeDatabase(true, 10000),
   () => perfFindInterlacesUpdates(),
   () => {
      console.log("");
      console.log("Perf: Adaptive Indexed Nightmare (Higher Scale @ 40,000) ---");

      createDatabase("adaptive");
   },
   () => initializeDatabase(true, 40000),
   () => perfFind(),
   () => createDatabase("adaptive"),
   () => initializeDatabase(true, 40000),
   () => perfFindInterlacedInserts(1),
   () => createDatabase("adaptive"),
   () => initializeDatabase(true, 40000),
   () => perfFindInterlacedRemoves(),
   () => createDatabase("adaptive"),
   () => initializeDatabase(true, 40000),
   () => perfFindInterlacesUpdates(),
   () => {
      console.log("");
      console.log("Perf: BTree Indexed Nightmare (Lower Scale @ 40,000) ---");

      createDatabase("btree");
   },
   () => initializeDatabase(true, 40000),
   () => perfFind(),
   () => createDatabase("btree"),
   () => initializeDatabase(true, 40000),
   () => perfFindInterlacedInserts(1),
   () => createDatabase("btree"),
   () => initializeDatabase(true, 40000),
   //() => console.log("btree index height : " + db.getCollection("samplecoll")._binaryTreeIndexes.customId.nodes[db.getCollection("samplecoll")._binaryTreeIndexes.customId.apex].height),
   () => perfFindInterlacedRemoves(),
   () => createDatabase("btree"),
   () => initializeDatabase(true, 40000),
   () => perfFindInterlacesUpdates(),
   () => {
      console.log("");
      console.log("Perf: BTree Indexed Nightmare (Higher Scale @ 80,000) ---");

      createDatabase("btree");
   },
   () => initializeDatabase(true, 100000),
   () => perfFind(),
   () => createDatabase("btree"),
   () => initializeDatabase(true, 100000),
   () => perfFindInterlacedInserts(1),
   () => createDatabase("btree"),
   () => initializeDatabase(true, 100000),
   //() => console.log("btree index height : " + db.getCollection("samplecoll")._binaryTreeIndexes.customId.nodes[db.getCollection("samplecoll")._binaryTreeIndexes.customId.apex].height),
   () => perfFindInterlacedRemoves(),
   () => createDatabase("btree"),
   () => initializeDatabase(true, 100000),
   () => perfFindInterlacesUpdates()
];

function execNext() {
   var f = steps.shift();
   if (!f) return;
   f();
   setTimeout(execNext, 500);
}

console.log("");
execNext();