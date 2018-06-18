/* global process, require, module, require */
module.exports = function (config) {
  const configuration = {
    frameworks: ["jasmine", "jasmine-matchers"],
    browsers: ["ChromeHeadless"],
    basePath: "../",
    files: [
      {pattern: "node_modules/requirejs/require.js", watched: false},
      {pattern: "spec/helper/*.helper.js", watched: false},
      {pattern: "spec/generic/*.spec.js", watched: false},
      {pattern: "spec/web/*.spec.js", watched: false},
      {pattern: "node_modules/@lokidb/**/lokidb.*.js", watched: false, included: false, served: true, nocache: true}
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
