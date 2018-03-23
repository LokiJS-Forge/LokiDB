/* global __dirname, module, require */
const path = require("path");
const webpackConigCreator = require('../../config/webpack-config-creator.js');

module.exports = webpackConigCreator({
  entry: path.join(__dirname, "src", "index.ts"),
  filename: "lokidb.full-text-search-language-de.js",
  library: "@lokidb/full-text-search-language-de",
  externals: {
    "../../full-text-search-language/src/language": "@lokidb/full-text-search-language",
    "../../full-text-search/src/index": "@lokidb/full-text-search"
  },
});
