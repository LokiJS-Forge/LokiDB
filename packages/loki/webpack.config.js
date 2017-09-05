/* global __dirname, module, require */
const path = require("path");

module.exports = {
  devtool: "source-map",
  entry: path.join(__dirname, "src", "index.js"),
  output: {
    filename: "lokijs.loki.js",
    library: "Loki",
    libraryTarget: "umd",
    umdNamedDefine: true
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
