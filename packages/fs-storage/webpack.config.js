/* global __dirname, module, require */
const path = require("path");
const webpackConigCreator = require('../../config/webpack-config-creator.js');

module.exports = webpackConigCreator({
  entry: path.join(__dirname, "src", "fs_storage.ts"),
  filename: "lokijs.fs-storage.js",
  library: "@lokijs/fs-storage",
  externals: {
    "../../loki/src/loki": "@lokijs/loki",
    "fs": "fs"
  },
});
