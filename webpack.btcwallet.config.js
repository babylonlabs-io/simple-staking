// webpack.btcWallet.config.js
const path = require("path");
const webpack = require("webpack");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const Dotenv = require("dotenv-webpack");

module.exports = (env) => {
  const networkEnv = env.NEXT_PUBLIC_NETWORK || "mainnet"; // Default to mainnet if not provided

  return {
    entry: "./e2e/helper/btcWallet.ts",
    output: {
      filename: `btcWallet.${networkEnv}.bundle.js`, // Dynamically set the output filename based on the env variable
      path: path.resolve(__dirname, "dist"),
      library: "btcWalletModule",
      libraryTarget: "umd",
    },
    resolve: {
      extensions: [".ts", ".js"],
      plugins: [
        new TsconfigPathsPlugin({
          configFile: path.resolve(__dirname, "tsconfig.json"),
        }),
      ],
      fallback: {
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        assert: require.resolve("assert/"),
        buffer: require.resolve("buffer/"),
        util: require.resolve("util/"),
        path: require.resolve("path-browserify"),
        process: require.resolve("process/browser"),
        os: require.resolve("os-browserify/browser"),
        fs: false,
        net: false,
        tls: false,
        child_process: false,
      },
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: {
            loader: "ts-loader",
            options: {
              configFile: path.resolve(__dirname, "tsconfig.json"),
              transpileOnly: false,
            },
          },
          exclude: /node_modules/,
        },
      ],
    },
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
        process: "process/browser",
      }),
      new Dotenv({
        path: `./.env.${networkEnv}`, // Dynamically load .env files based on the network
        systemvars: true,
      }),
    ],
    mode: "production",
    target: "web",
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          extractComments: false, // Disable license file generation
        }),
      ],
    },
  };
};
