/* global process, require, module, require */
module.exports = function (config) {
  const configuration = {
    frameworks: ["jasmine", "jasmine-matchers"],
    browsers: ["Chrome"],
    basePath: "",
    files: [
      {pattern: "integration.helper.js"},
      {pattern: "spec/*.spec.js", watched: false},
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
