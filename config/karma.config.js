/* global process, require, module, require */
const path = require("path");

module.exports = function (config) {
  const configuration = {
    frameworks: ["jasmine", "jasmine-matchers"],
    browsers: ["Chrome"],
    files: [
      // {pattern: "../packages/*/spec/generic/**/*.spec.js", watched: false},
      // {pattern: "../packages/*/spec/web/**/*.spec.js", watched: false},
      {pattern: "../packages/*/spec/generic/**/*.spec.ts", watched: false},
      {pattern: "../packages/*/spec/web/**/*.spec.ts", watched: false},
    ],
    preprocessors: {
      //"../packages/*/spec/generic/**/*.spec.js": ["webpack"],
      //"../packages/*/spec/web/**/*.spec.js": ["webpack"],
      "../packages/*/spec/generic/**/*.spec.ts": ["webpack"],
      "../packages/*/spec/web/**/*.spec.ts": ["webpack"],
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
      resolve: {
        extensions: ['.ts', '.js'],
      },
      devtool: "source-map-inline",
      module: {
        rules: [
          {
            test: /\.ts$/,
            use: [
              {
                loader: "istanbul-instrumenter-loader",
                options: {
                  esModules: true
                }
              },
            ]
          },
          {
            test: /\.ts$/,
            use: [
              {
                loader: 'awesome-typescript-loader'
              }
            ],
            exclude: [/\.e2e\.ts$/]
          },
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
