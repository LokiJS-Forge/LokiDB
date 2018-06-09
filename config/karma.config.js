/* global process, require, module, require */
const path = require("path");

module.exports = function (config) {
  const configuration = {
    frameworks: ["jasmine", "jasmine-matchers"],
    browsers: ["ChromeHeadless"],
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
      fixWebpackSourcePaths: true
    },
    mime: {
      "text/x-typescript": ["ts"]
    },
    webpack: {
      mode: "development",
      resolve: {
        extensions: [".ts"],
      },
      devtool: "source-map",
      module: {
        rules: [
          {
            enforce: "pre",
            test: /\.ts$/,
            loader: "tslint-loader",
            exclude: /node_modules/,
            options: {
              failOnHint: false,
              configFile: path.join(__dirname, "tslint.json"),
            }
          },
          {
            test: /\.ts$/,
            loader: "ts-loader",
            options: {
              configFile: path.join(__dirname, "tsconfig.webpack.json")
            }
          },
          {
            enforce: "post",
            exclude: [
              /node_modules/,
              /\.spec\.ts$/,
              /.*\/spec\/.+\.ts/,
            ],
            loader: "istanbul-instrumenter-loader?esModules=true",
            test: /\.ts$/
          }
        ]
      }
    },

    plugins: [
      "karma-chrome-launcher",
      "karma-coverage-istanbul-reporter",
      "karma-jasmine",
      "karma-jasmine-matchers",
      "karma-webpack",
    ],
  };

  config.set(configuration);
};
