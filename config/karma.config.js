/* global process, require, module, require */
const path = require("path");

module.exports = function (config) {
  const configuration = {
    frameworks: ["jasmine", "jasmine-matchers"],
    browsers: ["Chrome"],
    files: [
      {pattern: "../packages/*/spec/generic/**/*.spec.ts", watched: false},
      {pattern: "../packages/*/spec/web/**/*.spec.ts", watched: false}
    ],
    preprocessors: {
      "../packages/*/spec/generic/**/*.spec.ts": ["webpack"],
      "../packages/*/spec/web/**/*.spec.ts": ["webpack"]
    },

    // coverage reporter generates the coverage
    reporters: ["progress", "coverage-istanbul"],
    coverageIstanbulReporter: {
      dir: "./coverage/karma/",
      reports: ["text-summary", "lcov", "html", "json"],
      fixWebpackSourcePaths: false
    },
    mime: {
      'text/x-typescript': ['ts']
    },
    webpack: {
      externals: {
        "fs": "fs"
      },
      resolve: {
        extensions: ['.ts', '.js'],
      },
      devtool: "inline-source-map",
      module: {
        // rules: [
        //   {
        //     test: /\.js$/,
        //     use: [
        //       {
        //         loader: "istanbul-instrumenter-loader",
        //         options: {
        //           esModules: true
        //         }
        //       },
        //     ]
        //   }
        // ],
        loaders: [
          {
            test: /\.ts$/,
            loader: "ts-loader"
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
