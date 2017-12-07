/* global __dirname, module, require */
const path = require("path");
const webpackConigCreator = require('../../config/webpack-config-creator.js');

module.exports = webpackConigCreator({
  entry: path.join(__dirname, "src", "index.ts"),
  filename: "lokijs.indexed-storage.js",
  library: "@lokijs/indexed-storage",
  externals: {
    "../../loki/src/loki": "@lokijs/loki"
  },
});
