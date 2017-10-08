/* global __dirname, module, require */
const path = require("path");

module.exports = {
  devtool: "source-map",
  entry: path.join(__dirname, "src", "full_text_search.js"),
  output: {
    filename: "lokijs.full-text-search.js",
    library: "@lokijs/full-text-search",
    libraryTarget: "umd2",
    umdNamedDefine: false
  },
  externals: {
    "../../loki/src/loki": "@lokijs/loki",
    "fs": "fs"
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  module: {
    loaders: [
      {
        test: /(\.ts)$/,
        loader: "awesome-typescript-loader",
        options: {
          configFileName: path.join("config", "tsconfig.json")
        }
      },
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
