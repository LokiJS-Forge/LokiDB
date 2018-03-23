/* global __dirname, module, require */
const path = require("path");
const webpackConigCreator = require('../../config/webpack-config-creator.js');

module.exports = webpackConigCreator({
  entry: path.join(__dirname, "src", "fs_storage.ts"),
  filename: "lokidb.fs-storage.js",
  library: "@lokidb/fs-storage",
  externals: {
    "../../loki/src/loki": "@lokidb/loki",
    "fs": "fs"
  },
});
