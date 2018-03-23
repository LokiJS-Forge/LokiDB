/* global __dirname, module, require */
const path = require("path");
const webpackConigCreator = require('../../config/webpack-config-creator.js');

module.exports = webpackConigCreator({
  entry: path.join(__dirname, "src", "index.ts"),
  filename: "lokidb.indexed-storage.js",
  library: "@lokidb/indexed-storage",
  externals: {
    "../../loki/src/loki": "@lokidb/loki"
  },
});
