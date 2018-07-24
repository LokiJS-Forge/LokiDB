/**
 * Core, "single object lookup" benchmarks
 */

let Loki = require('../build/packages/loki/lokidb.loki.js').default,
  crypto = require("crypto");

/**
 * Generates a random string using node crypto library which is less memory 'leaky'
 */
function genRandomVal() {
  return crypto.randomBytes(50).toString('hex');
}

/**
 * Helper method for instantiating a loki database
 * @param {*} mode 
 */
function createDatabase(mode) {
  let tdb = new Loki("temp.db");
  let coll;

  switch (mode) {
    case "avl":
      coll = tdb.addCollection('perfcoll', {
        rangedIndexes: {
          "customId": { indexTypeName: "btree", comparatorName: "js" }
        }
      });
      break;
    case "unique":
      coll = tdb.addCollection('perfcoll', {
        unique: ['customId']
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
 * @param {*} db 
 * @param {*} count 
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
 * Benchmarks collection.by() performance with unique index
 * @param {*} count 
 * @param {*} multiple 
 */
function benchUniquePerf(count, multiple) {
  let udb = createDatabase("unique");
  let uniquecoll = udb.getCollection('perfcoll');

  let v1, idxbuf = [];

  for (let idx = 0; idx < count; idx++) {
    v1 = genRandomVal();

    uniquecoll.insert({
      customId: (count - idx),
      val: v1,
      val2: "more data 1234567890"
    });

    idxbuf.push(count - idx);
  }

  let start, end;
  let totalTimes = [];
  let totalMS = 0.0;

  let customIdx, result;

  for (let m = 0; m < multiple; m++) {
    for (let idx = 0; idx < count; idx++) {
      customIdx = idxbuf[idx];

      start = process.hrtime();
      result = uniquecoll.by('customId', customIdx);
      end = process.hrtime(start);
      totalTimes.push(end);

      if (result.customId !== customIdx) {
        console.log("(perfUnique) object retrieved does match custom id");
      }
    }
  }

  for (let idx = 0; idx < totalTimes.length; idx++) {
    totalMS += totalTimes[idx][0] * 1e3 + totalTimes[idx][1] / 1e6;
  }

  totalMS = totalMS.toFixed(2);
  let rate = multiple * count * 1000 / totalMS;
  rate = rate.toFixed(2);
  console.log("coll.by() : " + totalMS + "ms (" + rate + " ops/s)  " + multiple*count + " iterations, " + count + " docs x " + multiple);
};

/**
 * Benchmarks collection.get() performance
 * @param {*} count number of documents to insert into collection
 * @param {*} multiple number of times to repeat get() for each document
 */
function testperfGet(count, multiple) {
  let gdb = createDatabase("none");
  let coll = gdb.getCollection('perfcoll');

  let start, end;
  let totalTimes = [];
  let totalMS = 0.0;

  let customIdx, v1, obj = {}, idxbuf = [];

  for (let idx = 0; idx < count; idx++) {
    v1 = genRandomVal();

    obj = coll.insert({
      customId: (count - idx),
      val: v1,
      val2: "more data 1234567890"
    });

    idxbuf.push(obj.$loki);
  }

  let result;

  for (let m = 0; m < multiple; m++) {
    for (let idx = 0; idx < count; idx++) {
      customIdx = idxbuf[idx];

      start = process.hrtime();
      result = coll.get(customIdx);
      end = process.hrtime(start);
      totalTimes.push(end);

      if (result.$loki !== customIdx) {
        console.log("(perfGet) object retrieved does match get id");
      }
    }
  }

  for (let idx = 0; idx < totalTimes.length; idx++) {
    totalMS += totalTimes[idx][0] * 1e3 + totalTimes[idx][1] / 1e6;
  }

  totalMS = totalMS.toFixed(2);
  let rate = multiple * count * 1000 / totalMS;
  rate = rate.toFixed(2);
  console.log("coll.get() : " + totalMS + "ms (" + rate + " ops/s)  " + multiple*count + " iterations, " + count + " docs x " + multiple);
}

/**
 * Benchmark collection find() performance
 * @param {*} mode Index Mode ("none", "unique", "avl")
 * @param {*} count Document count to populate collection with
 * @param {*} multiple Used to repeat finding each document this number of times
 */
function testperfFind(mode, count, multiple) {
  multiple = multiple || 1;

  let fdb = createDatabase(mode);
  let idxbuf = populateDatabase(fdb, count);
  let coll = fdb.getCollection("perfcoll");

  let start, end;
  let totalTimes = [];
  let totalMS = 0;

  let results;

  for (let m = 0; m < multiple; m++) {
    for (let idx = 0; idx < count; idx++) {
      customIdx = idxbuf[idx];
  
      start = process.hrtime();
      results = coll.find({
        'customId': customIdx
      });
      end = process.hrtime(start);
      totalTimes.push(end);
  
      if (results.length !== 1) {
        console.log("(perfFind) received " + results.length + "instead of 1 matches!");
      }
    }
  }

  for (let idx = 0; idx < totalTimes.length; idx++) {
    totalMS += totalTimes[idx][0] * 1e3 + totalTimes[idx][1] / 1e6;
  }

  totalMS = totalMS.toFixed(2);
  let rate = multiple * count * 1000 / totalMS;
  rate = rate.toFixed(2);
  console.log("coll.find() : " + totalMS + "ms (" + rate + " ops/s) " + multiple * count + " iterations, " + count + " docs x " + multiple);
}

/**
 * Resultset benchmark
 * @param {*} mode 
 * @param {*} count 
 */
function testperfRS(mode, count, multiple) {
  multiple = multiple || 1;

  let rsdb = createDatabase(mode);
  let idxbuf = populateDatabase(rsdb, count);
  let coll = rsdb.getCollection("perfcoll");

  let start, end;
  let totalTimes = [];
  let totalMS = 0;

  let customIdx, results;

  for (let m = 0; m < multiple; m++) {
    for (let idx = 0; idx < count; idx++) {
      customIdx = idxbuf[idx];
  
      start = process.hrtime();
      results = coll.chain().find({
        'customId': customIdx
      }).data();
      end = process.hrtime(start)
      totalTimes.push(end);
  
      if (results.length !== 1) {
        console.log("(perfRS) received " + results.length + "instead of 1 matches!");
      }
    }
  }

  for (let idx = 0; idx < totalTimes.length; idx++) {
    totalMS += totalTimes[idx][0] * 1e3 + totalTimes[idx][1] / 1e6;
  }

  totalMS = totalMS.toFixed(2);
  let rate = multiple * count * 1000 / totalMS;
  rate = rate.toFixed(2);
  console.log("resultset chained find() :  " + totalMS + "ms (" + rate + " ops/s) " + multiple * count + " iterations, " + count + " docs x " + multiple);
}

/**
 * Benchmark dynamic view performance
 * @param {*} mode 
 * @param {*} count 
 * @param {*} multiple 
 */
function testperfDV(mode, count, multiple) {
  multiple = multiple || 1;
  
  let dvdb = createDatabase(mode);
  let idxbuf = populateDatabase(dvdb, count);
  let coll = dvdb.getCollection("perfcoll");

  let start, end;
  let start2, end2, totalTime2 = 0.0;
  let totalTimes = [];
  let totalTimes2 = [];
  let totalMS = 0;
  let totalMS2 = 0;

  let customIdx, dv, results;

  for (let m = 0; m < multiple; m++) {
    for (let idx = 0; idx < count; idx++) {
      customIdx = idxbuf[idx];
  
      start = process.hrtime();
      dv = coll.addDynamicView("perfview");
      dv.applyFind({
        'customId': customIdx
      });
      results = dv.data();
      end = process.hrtime(start);
      totalTimes.push(end);
  
      // test speed of repeated query on an already set up dynamicview
      start2 = process.hrtime();
      results = dv.data();
      end2 = process.hrtime(start2);
      totalTimes2.push(end2);
  
      coll.removeDynamicView("perfview");
    }
  }

  for (let idx = 0; idx < totalTimes.length; idx++) {
    totalMS += totalTimes[idx][0] * 1e3 + totalTimes[idx][1] / 1e6;
    totalMS2 += totalTimes2[idx][0] * 1e3 + totalTimes2[idx][1] / 1e6;
  }

  totalMS = totalMS.toFixed(2);
  totalMS2 = totalMS2.toFixed(2);
  let rate = multiple * count * 1000 / totalMS;
  let rate2 = multiple * count * 1000 / totalMS2;
  rate = rate.toFixed(2);
  rate2 = rate2.toFixed(2);

  console.log("loki dynamic view first find : " + totalMS + "ms (" + rate + " ops/s) " + multiple * count + " iterations, " + count + " docs x " + multiple);
  console.log("loki dynamic view subsequent finds : " + totalMS2 + "ms (" + rate2 + " ops/s) " + multiple * count + " iterations, " + count + " docs x " + multiple);
}

/**
 * Attempt to free up global variables and invoke node garbage collector (if enabled)
 */
function cleanup() {
  if (global.gc) {
    global.gc()
  }
}

let corePerf = [
  () => testperfGet(200000, 20),
  () => benchUniquePerf(200000, 20)
];

let nonIndexedSteps = [
  () => testperfFind("none", 5000, 8),
  () => testperfRS("none", 5000, 8),
  () => testperfDV("none", 5000, 8)
];

let nonIndexedStepsHigh = [
  () => testperfFind("none", 10000, 1),
  () => testperfRS("none", 10000, 1),
  () => testperfDV("none", 10000, 1)
];

let avlIndexSteps = [
  () => testperfFind("avl", 20000, 20),
  () => testperfRS("avl", 20000, 20),
  () => testperfDV("avl", 20000, 20)
];

let avlIndexStepsHigh = [
  () => testperfFind("avl", 200000, 2),
  () => testperfRS("avl", 200000, 2),
  () => testperfDV("avl", 200000, 2)
];

let perfGroups = [
  { name: "Benchmarking Core Id lookup performance", steps: corePerf },
  { name: "Benchmarking NON-INDEX query performance (Lower doc count)", steps: nonIndexedSteps },
  { name: "Benchmarking NON-INDEX query performance (Higher doc count)", steps: nonIndexedStepsHigh },
  { name: "Benchmarking AVL TREE INDEX query performance (Lower doc count)", steps: avlIndexSteps },
  { name: "Benchmarking AVL TREE INDEX query performance (Higher doc count)", steps: avlIndexStepsHigh }
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

  let s = steps.shift();

  s();

  setTimeout(() => { execSteps(steps); }, 1000);
}

/**
 * Kicks off a group of benchmarks, cleaning up in between
 */
function execGroups() {
  let g = perfGroups.shift();
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

if (!global.gc) {
  console.warn("##");
  console.warn("## IMPORTANT! : For accuracy of results, launch node with --expose-gc flag");
  console.warn("##");
}

execGroups();