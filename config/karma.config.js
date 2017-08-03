/* global process, require, module, require */
const path = require("path");

module.exports = function (config) {
  const configuration = {
    frameworks: ["jasmine", "jasmine-matchers"],
    browsers: ["Chrome"],
    files: [
      {pattern: "../packages/*/spec/generic/**/*.spec.js", watched: false},
    ],
    preprocessors: {
      // source files, that you wanna generate coverage for
      // do not include tests or libraries
      // (these files will be instrumented by Istanbul)
      "../packages/*/spec/generic/**/*.spec.js": ["webpack"],
    },

    // coverage reporter generates the coverage
    reporters: ["progress", "coverage-istanbul"],
    coverageIstanbulReporter: {
      dir: "./coverage/karma/",
      reports: ["text-summary", "lcov", "html", "json"],
      fixWebpackSourcePaths: false
    },

    webpack: {
      externals: {
        "fs": "fs"
      },
      devtool: "source-map",
      module: {
        rules: [
          {
            test: /\.js$/,
            use: [
              {
                loader: "istanbul-instrumenter-loader",
                options: {
                  esModules: true,
                  debug: true
                }
              },
            ],
            include: new RegExp(path.resolve("packages") + "/.+?/src/.+.js")
          }
        ]
      }
    },

    plugins: [
      "karma-chrome-launcher",
      "karma-coverage",
      "karma-coverage-istanbul-reporter",
      "istanbul-instrumenter-loader",
      "karma-jasmine",
      "karma-jasmine-matchers",
      "karma-webpack",
    ],
  };

  config.set(configuration);
};
