

var script = document.createElement('script');

script.setAttribute('src', "/dist/packages/loki/lokidb.loki.js");
script.onload = callback;

document.head.appendChild(script);

function callback() {
  console.log("loaded");
}
