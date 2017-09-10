/* global __dirname, module, require */
const path = require("path");

module.exports = {
  devtool: "source-map",
  entry: path.join(__dirname, "src", "local_storage.js"),
  output: {
    filename: "lokijs.local-storage.js",
    library: "@lokijs/local-storage",
    libraryTarget: "umd2",
    umdNamedDefine: false
  },
  externals: {
    "../../loki/src/loki": "@lokijs/loki",
  },
  module: {
    loaders: [
      {
        test: /(\.js)$/,
        loader: "eslint-loader",
        exclude: /(node_modules|bower_components)/,
        options: {
          configFile: path.join("config", "eslintrc.js")
        }
      }
    ]
  }
};
