/* global process, require, module, require */
const path = require("path");

module.exports = function (config) {
  const configuration = {
    frameworks: ["jasmine", "jasmine-matchers"],
    browsers: ["Chrome"],
    basePath: "../",
    files: [
      {pattern: "packages/common/integration/helpers/**/*.helper.js"},
      {pattern: "packages/*/integration/web/**/*.int.js", watched: false},
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
