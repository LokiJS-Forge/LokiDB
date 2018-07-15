let Loki = require('../build/packages/loki/lokidb.loki.js').default,
   db = new Loki('perftest'),
   samplecoll = null,
   uniquecoll = null,
   arraySize = 5000, // how large of a dataset to generate
   totalIterations = 20000, // how many times we search it
   getIterations = 2000000; // get is crazy fast due to binary search so this needs separate scale

function genRandomVal() {
   var text = "";
   var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

   for (var i = 0; i < 20; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

   return text;
}

// in addition to the loki id we will create a key of our own
// (customId) which is number from 1- totalIterations
// we will later perform find() queries against customId with and 
// without an index

function initializeDB(mode) {
   db = new Loki('perftest');

   var start, end, totalTime;
   var totalTimes = [];
   var totalMS = 0.0;

   switch (mode) {
      case "btree":
         samplecoll = db.addCollection('samplecoll', {
            rangedIndexes: {
               "customId": { indexTypeName: "btree", comparatorName: "js" }
            }
         });
         break;
      case "none":
      default:
         samplecoll = db.addCollection('samplecoll');
         break;
   }

   for (var idx = 0; idx < arraySize; idx++) {
      var v1 = genRandomVal();
      var v2 = genRandomVal();

      start = process.hrtime();
      samplecoll.insert({
         customId: idx,
         val: v1,
         val2: v2,
         val3: "more data 1234567890"
      });
      end = process.hrtime(start);
      totalTimes.push(end);
   }

   for (var idx = 0; idx < totalTimes.length; idx++) {
      totalMS += totalTimes[idx][0] * 1e3 + totalTimes[idx][1] / 1e6;
   }

   //var totalMS = end[0] * 1e3 + end[1]/1e6;
   totalMS = totalMS.toFixed(2);
   var rate = arraySize * 1000 / totalMS;
   rate = rate.toFixed(2);
   console.log("load (insert) : " + totalMS + "ms (" + rate + ") ops/s");
}

/**
 * initializeUnique : to support benchUniquePerf, we will set up another collection
 * where our customId is enforced as 'unique' using unique index feature of loki.
 */
function initializeUnique() {
   uniquecoll = db.addCollection('uniquecoll', {
      unique: ['customId']
   });

   for (var idx = 0; idx < arraySize; idx++) {
      var v1 = genRandomVal();
      var v2 = genRandomVal();

      uniquecoll.insert({
         customId: (arraySize - idx),
         val: v1,
         val2: v2,
         val3: "more data 1234567890"
      });
   }
}

/**
 * initializeWithEval : repeat of insert bench with a dynamic view registered.
 *    All inserts will be passed into the view's evaluateDocument() method.
 *    This test is an attempt to gauge the level of impact of that overhead.
 */
function initializeWithEval() {
   var dbTest = new Loki('perfInsertWithEval');

   var start, end, totalTime;
   var totalTimes = [];
   var totalMS = 0.0;

   var coll = dbTest.addCollection('samplecoll', {
      indices: ['customId'],
      asyncListeners: false,
      disableChangesApi: true,
      transactional: false,
      clone: false
   });

   var dv = coll.addDynamicView('test');
   dv.applyFind({
      'customId': {
         '$lt': arraySize / 4
      }
   });

   for (var idx = 0; idx < arraySize; idx++) {
      var v1 = genRandomVal();
      var v2 = genRandomVal();

      start = process.hrtime();
      coll.insert({
         customId: idx,
         val: v1,
         val2: v2,
         val3: "more data 1234567890"
      });
      end = process.hrtime(start);
      totalTimes.push(end);
   }

   for (var idx = 0; idx < totalTimes.length; idx++) {
      totalMS += totalTimes[idx][0] * 1e3 + totalTimes[idx][1] / 1e6;
   }

   totalMS = totalMS.toFixed(2);
   var rate = arraySize * 1000 / totalMS;
   rate = rate.toFixed(2);
   console.log("load (insert with dynamic view registered) : " + totalMS + "ms (" + rate + ") ops/s");
}

function benchUniquePerf() {
   var start, end;
   var totalTimes = [];
   var totalMS = 0.0;

   for (var idx = 0; idx < getIterations; idx++) {
      var customidx = Math.floor(Math.random() * arraySize) + 1;

      start = process.hrtime();
      var results = uniquecoll.by('customId', customidx);
      end = process.hrtime(start);
      totalTimes.push(end);
   }

   for (var idx = 0; idx < totalTimes.length; idx++) {
      totalMS += totalTimes[idx][0] * 1e3 + totalTimes[idx][1] / 1e6;
   }

   totalMS = totalMS.toFixed(2);
   var rate = getIterations * 1000 / totalMS;
   rate = rate.toFixed(2);
   console.log("coll.by() : " + totalMS + "ms (" + rate + ") ops/s");
};

function testperfGet() {
   var start, end;
   var totalTimes = [];
   var totalMS = 0.0;

   for (var idx = 0; idx < getIterations; idx++) {
      var customidx = Math.floor(Math.random() * arraySize) + 1;

      start = process.hrtime();
      var results = samplecoll.get(customidx);
      end = process.hrtime(start);
      totalTimes.push(end);
   }

   for (var idx = 0; idx < totalTimes.length; idx++) {
      totalMS += totalTimes[idx][0] * 1e3 + totalTimes[idx][1] / 1e6;
   }

   totalMS = totalMS.toFixed(2);
   var rate = getIterations * 1000 / totalMS;
   rate = rate.toFixed(2);
   console.log("coll.get() : " + totalMS + "ms (" + rate + ") ops/s");
}

function testperfFind(multiplier) {
   var start, end;
   var totalTimes = [];
   var totalMS = 0;

   var loopIterations = totalIterations;
   if (typeof (multiplier) != "undefined") {
      loopIterations = loopIterations * multiplier;
   }

   for (var idx = 0; idx < loopIterations; idx++) {
      var customidx = Math.floor(Math.random() * arraySize) + 1;

      start = process.hrtime();
      var results = samplecoll.find({
         'customId': customidx
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
   console.log("coll.find() : " + totalMS + "ms (" + rate + " ops/s) " + loopIterations + " iterations");
}

function testperfRS(multiplier) {
   var start, end;
   var totalTimes = [];
   var totalMS = 0;

   var loopIterations = totalIterations;
   if (typeof (multiplier) != "undefined") {
      loopIterations = loopIterations * multiplier;
   }

   for (var idx = 0; idx < loopIterations; idx++) {
      var customidx = Math.floor(Math.random() * arraySize) + 1;

      start = process.hrtime();
      var results = samplecoll.chain().find({
         'customId': customidx
      }).data();
      end = process.hrtime(start)
      totalTimes.push(end);
   }

   for (var idx = 0; idx < totalTimes.length; idx++) {
      totalMS += totalTimes[idx][0] * 1e3 + totalTimes[idx][1] / 1e6;
   }

   totalMS = totalMS.toFixed(2);
   var rate = loopIterations * 1000 / totalMS;
   rate = rate.toFixed(2);
   console.log("resultset chained find() :  " + totalMS + "ms (" + rate + " ops/s) " + loopIterations + " iterations");
}

function testperfDV(multiplier) {
   var start, end;
   var start2, end2, totalTime2 = 0.0;
   var totalTimes = [];
   var totalTimes2 = [];
   var totalMS = 0;
   var totalMS2 = 0;

   var loopIterations = totalIterations;
   if (typeof (multiplier) != "undefined") {
      loopIterations = loopIterations * multiplier;
   }

   for (var idx = 0; idx < loopIterations; idx++) {
      var customidx = Math.floor(Math.random() * arraySize) + 1;

      start = process.hrtime();
      var dv = samplecoll.addDynamicView("perfview");
      dv.applyFind({
         'customId': customidx
      });
      var results = dv.data();
      end = process.hrtime(start);
      totalTimes.push(end);

      // test speed of repeated query on an already set up dynamicview
      start2 = process.hrtime();
      var results = dv.data();
      end2 = process.hrtime(start2);
      totalTimes2.push(end2);

      samplecoll.removeDynamicView("perfview");
   }

   for (var idx = 0; idx < totalTimes.length; idx++) {
      totalMS += totalTimes[idx][0] * 1e3 + totalTimes[idx][1] / 1e6;
      totalMS2 += totalTimes2[idx][0] * 1e3 + totalTimes2[idx][1] / 1e6;
   }

   totalMS = totalMS.toFixed(2);
   totalMS2 = totalMS2.toFixed(2);
   var rate = loopIterations * 1000 / totalMS;
   var rate2 = loopIterations * 1000 / totalMS2;
   rate = rate.toFixed(2);
   rate2 = rate2.toFixed(2);

   console.log("loki dynamic view first find : " + totalMS + "ms (" + rate + " ops/s) " + loopIterations + " iterations");
   console.log("loki dynamic view subsequent finds : " + totalMS2 + "ms (" + rate2 + " ops/s) " + loopIterations + " iterations");
}

/**
 * Attempt to free up global variables and invoke node garbage collector (if enabled)
 */
function cleanup() {
   db.close();
   samplecoll = null;
   uniquecoll = null;
   db = null;
   if (global.gc) {
      global.gc()
   }
   else {
      console.log("!! WARNING: Launch node with --expose-gc flag for more accurate results !!")
   }
}

var corePerf = [
   initializeDB,
   initializeUnique,
   testperfGet,
   benchUniquePerf,
];

var nonIndexedSteps = [
   initializeDB,
   testperfFind,
   testperfRS,
   testperfDV
];

var btreeIndexSteps = [
   () => initializeDB("btree"),
   () => { }, // after heavy memory alloc, wait a sec for cpu to settle
   () => testperfFind(20),
   () => testperfRS(15),
   () => testperfDV(15)
];

var perfGroups = [
   { name: "Benchmarking Core Id lookup performance", steps: corePerf },
   { name: "Benchmarking NON-INDEX query performance", steps: nonIndexedSteps },
   { name: "Benchmarking BINARY TREE INDEX query performance", steps: btreeIndexSteps }
];

/**
 * Executes steps within a benchmark group, pausing in between steps.
 * Once the benchmark group steps are depleted, we initiate next group.
 * @param {*} steps 
 */
function execSteps(steps) {
   // if we are finished with this group's steps...
   if (steps.length === 0) {
      // wait a few seconds in between benchmark groups
      setTimeout(execGroups, 4000);
      return;
   }

   var s = steps.shift();

   s();

   setTimeout(() => { execSteps(steps); }, 1000);
}

/**
 * Kicks off a group of benchmarks, cleaning up in between
 */
function execGroups() {
   var g = perfGroups.shift();
   if (!g) return;

   cleanup();

   console.log("");
   console.log("## " + g.name + " ##");
   console.log("");
   execSteps(g.steps);
}

console.log("");
console.log("Note: run 'npm run build' before benchmarking after getting latest or modifying code");
console.log("");

execGroups();