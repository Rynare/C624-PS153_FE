/* eslint-disable */
const { merge } = require("webpack-merge");
const path = require("path");
const common = require("./webpack.common.js");
/* eslint-enable */

module.exports = merge(common, {
  mode: "development",
  devtool: "eval-source-map",
  devServer: {
    hot: true,
    static: path.resolve(__dirname, "dist"),
    client: {
      overlay: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        exclude: /\.lazy\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.lazy\.css$/i,
        use: [
          { loader: "style-loader", options: { injectType: "lazyStyleTag" } },
          {
            loader: "css-loader",
          },
        ],
      },
    ],
  },
});
