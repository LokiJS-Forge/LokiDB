/* global __dirname, module, require */
const path = require("path");
const webpackConigCreator = require('../../config/webpack-config-creator.js');

module.exports = webpackConigCreator({
  entry: path.join(__dirname, "src", "index.ts"),
  filename: "lokidb.partitioning-adapter.js",
  library: "@lokidb/partitioning-adapter",
  externals: {
    "../../loki/src/loki": "@lokidb/loki"
  },
});
