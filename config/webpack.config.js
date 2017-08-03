/* global __dirname, module, require */
const path = require("path");

module.exports = {
  devtool: "source-map",
  output: {
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
          configFile: path.join(__dirname, "eslintrc.js")
        }
      }
    ]
  }
};
