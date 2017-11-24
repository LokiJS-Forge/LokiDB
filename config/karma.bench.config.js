/* global process, require, module, require */
const path = require("path");

module.exports = function (config) {
  const configuration = {
    frameworks: ["benchmark"],
    browsers: ["Chrome"],
    files: [
      {pattern: "../bench/**/*.bench.js", watched: false},
    ],
    preprocessors: {
      "../bench/**/*.bench.js": ["webpack"],
    },
    browserNoActivityTimeout: 60000,
    // coverage reporter generates the coverage
    reporters: ['benchmark', 'junit'],
    junitReporter: {
      outputDir: "../bench/",
      outputFile: "benchmark.xml"
    },
    webpack: {
      resolve: {
        extensions: [".js"],
      }
    },
    plugins: [
      "karma-benchmark",
      "karma-benchmark-reporter",
      "karma-chrome-launcher",
      "karma-junit-reporter",
      "karma-webpack",
    ],
  };

  config.set(configuration);
};
