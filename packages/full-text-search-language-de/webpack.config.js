/* global __dirname, module, require */
const path = require("path");
const webpackConigCreator = require('../../config/webpack-config-creator.js');

module.exports = webpackConigCreator({
  entry: path.join(__dirname, "src", "language.ts"),
  filename: "lokijs.full-text-search-de.js",
  library: "@lokijs/full-text-search-de",
  externals: {
    "../../full-text-search-language/src/language": "@lokijs/full-text-search-language",
    "../../full-text-search/src/index": "@lokijs/full-text-search"
  },
});
