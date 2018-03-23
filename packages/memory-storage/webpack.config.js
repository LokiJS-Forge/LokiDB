/* global __dirname, module, require */
const path = require("path");
const webpackConigCreator = require('../../config/webpack-config-creator.js');

module.exports = webpackConigCreator({
  entry: path.join(__dirname, "src", "index.ts"),
  filename: "lokidb.memory-storage.js",
  library: "@lokidb/memory-storage",
  externals: {
    "../../loki/src/loki": "@lokidb/loki"
  },
});
