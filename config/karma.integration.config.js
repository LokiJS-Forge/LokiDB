/* global process, require, module, require */
const path = require("path");

module.exports = function (config) {
  const configuration = {
    frameworks: ["jasmine", "jasmine-matchers"],
    browsers: ["ChromeHeadless"],
    basePath: "../",
    files: [
      {pattern: "packages/common/spec/helper/**/*.helper.js"},
      {pattern: "packages/*/spec/integration.spec.js", watched: false},
      {pattern: 'dist/packages/**/*.js', watched: false, included: false, served: true, nocache: true}
    ],
    reporters: ["progress"],
    mime: {
      "text/x-typescript": ["js"]
    },
    plugins: [
      "karma-chrome-launcher",
      "karma-jasmine",
      "karma-jasmine-matchers",
    ],
  };

  config.set(configuration);
};
