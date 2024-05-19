/* eslint-disable */
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { InjectManifest } = require("workbox-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const ImageminWebpWebpackPlugin = require("imagemin-webp-webpack-plugin");
const Dotenv = require("dotenv-webpack")
require("dotenv").config()

module.exports = {
    entry: {
        index: path.resolve(__dirname, "src/index.js"),
        style: path.resolve(__dirname, "src/styles/style.min.js"),
        serviceWorkerHandler: path.resolve(__dirname, "src/utils/ServiceWorker/ServiceWorkerHandler.js"),
    },
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, "dist"),
        clean: true,
    },
    optimization: {
        splitChunks: {
            chunks: "all",
            minSize: 20000,
            maxSize: 70000,
            minChunks: 1,
            maxAsyncRequests: 30,
            maxInitialRequests: 30,
            automaticNameDelimiter: "~",
            enforceSizeThreshold: 50000,
            cacheGroups: {
                defaultVendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10,
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true,
                },
            },
        },
    },
    plugins: [
        new Dotenv(),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: process.env.APP_TITLE,
            filename: "index.html",
            template: path.resolve(__dirname, "src/views/templates/template.html"),
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, "src/public/"),
                    to: path.resolve(__dirname, "dist/public/"),
                },
                {
                    from: path.resolve(__dirname, "src/views/"),
                    to: path.resolve(__dirname, "dist/views/"),
                },
            ],
        }),
        new FaviconsWebpackPlugin({
            logo: process.env.APP_ICON,
            mode: "webapp",
            devMode: "webapp",
            favicons: {
                appName: process.env.APP_TITLE,
                appDescription: process.env.APP_DESCRIPTION,
                developerName: process.env.APP_OWNER,
                background: process.env.APP_BACKROUND,
                theme_color: process.env.APP_THEME,
                icons: {
                    android: true,
                    appleIcon: true,
                    appleStartup: true,
                    favicons: true,
                    windows: true,
                    yandex: true,
                },
            },
        }),
        new InjectManifest({
            swSrc: path.resolve(__dirname, "src/utils/ServiceWorker/InjectManifest.js"),
            swDest: "sw.bundle.js",
            // maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        }),
        new BundleAnalyzerPlugin(),
        new ImageminWebpWebpackPlugin({
            config: [
                {
                    test: /\.(jpe?g|png)/,
                    options: {
                        quality: 50,
                    },
                },
            ],
            overrideExtension: true,
        })
    ],
};
