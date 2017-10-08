/* global __dirname, module, require */
const path = require("path");

module.exports = {
  devtool: "source-map",
  entry: path.join(__dirname, "src", "index.ts"),
  output: {
    filename: "lokijs.full-text-search.js",
    library: "@lokijs/full-text-search",
    libraryTarget: "umd2",
    umdNamedDefine: false
  },
  externals: {
    "../../loki/src/loki": "@lokijs/loki"
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    loaders: [
      {
        test: /(\.ts)$/,
        loader: "ts-loader",
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
  },
  plugins: [
    new DtsBundlePlugin()
  ]
};

function DtsBundlePlugin() {
}
DtsBundlePlugin.prototype.apply = function (compiler) {
  compiler.plugin('done', function () {
    var dts = require('dts-bundle');

    dts.bundle({
      name: "@lokijs/full-text-search",
      main: path.join(__dirname, "src", "full_text_search.ts"),
      out: path.join(__dirname, "src", "index.d.ts"),
      removeSource: true,
      outputAsModuleFolder: true // to use npm in-package typings
    });
  });
};
