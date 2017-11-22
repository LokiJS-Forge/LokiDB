/* global __dirname, module, require */
const path = require("path");
const webpackConigCreator = require('../../config/webpack-config-creator.js');

module.exports = webpackConigCreator({
  entry: path.join(__dirname, "src", "en.ts"),
  filename: "lokijs.full-text-search-language-en.js",
  library: "@lokijs/full-text-search-language-en",
  externals: {
    "../../full-text-search-language/src/language": "@lokijs/full-text-search-language",
    "../../full-text-search/src/index": "@lokijs/full-text-search"
  },
});
