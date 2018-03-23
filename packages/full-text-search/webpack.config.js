/* global __dirname, module, require */
const path = require("path");
const webpackConigCreator = require('../../config/webpack-config-creator.js');

module.exports = webpackConigCreator({
  entry: path.join(__dirname, "src", "index.ts"),
  filename: "lokidb.full-text-search.js",
  library: "@lokidb/full-text-search",
  externals: {
    "../../loki/src/loki": "@lokidb/loki"
  },
});
