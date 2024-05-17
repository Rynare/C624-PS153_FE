/* eslint-disable */

const { merge } = require("webpack-merge");
const path = require("path");
const common = require("./webpack.common.js");

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
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.s[ac]ss$/i,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
});
