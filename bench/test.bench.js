const Benchmark = require("benchmark");

const arr = [];

for (let i = 0; i < 2; i++) {
  arr.push("adawdawdawdawdawd" + i);
}

const suite = new Benchmark.Suite();

function toCodePoints2(str) {
  const r = [];
  for (let i = 0; i < str.length;) {
    const chr = str.charCodeAt(i++);
    if(chr >= 0xD800 && chr <= 0xDBFF) {
      // surrogate pair
      const low = str.charCodeAt(i++);
      r.push(0x10000 + ((chr - 0xD800) << 10) | (low - 0xDC00));
    } else {
      // ordinary character
      r.push(chr);
    }
  }
  return r;
}

function toCodePoints(str) {
  let i = 0;
  const r = [];
  while(i < str.length) {
    const chr = str.charCodeAt(i++);
    if(chr >= 0xD800 && chr <= 0xDBFF) {
      // surrogate pair
      const low = str.charCodeAt(i++);
      r.push(0x10000 + ((chr - 0xD800) << 10) | (low - 0xDC00));
    } else {
      // ordinary character
      r.push(chr);
    }
  }
  return r;
}

suite
  .add("a", () => {
    let l = 0;
    for (const a of arr) {
      l += toCodePoints(a).length;
    }
  })
  .add("b", () => {
    let l = 0;
    for (let i = 0; i < arr.length; i++) {
      l += toCodePoints(arr[i]).length;
    }
  })
  // add listeners
  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
