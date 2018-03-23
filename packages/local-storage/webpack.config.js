/* global __dirname, module, require */
const path = require("path");
const webpackConigCreator = require('../../config/webpack-config-creator.js');

module.exports = webpackConigCreator({
  entry: path.join(__dirname, "src", "index.ts"),
  filename: "lokidb.local-storage.js",
  library: "@lokidb/local-storage",
  externals: {
    "../../loki/src/loki": "@lokidb/loki"
  },
});
