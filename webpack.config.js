//@ts-check
'use strict';
const path = require('path');

/**@type {import('webpack').Configuration}*/
const config = {
  target: 'node', // see: https://webpack.js.org/configuration/node/
  entry: './src/extension.ts', // see: https://webpack.js.org/configuration/entry-context/
  output: {
    // see: https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]'
  },
  devtool: 'source-map',
  externals: {
    vscode: 'commonjs vscode' // see: https://webpack.js.org/configuration/externals/
  },
  resolve: {
    // see: https://github.com/TypeStrong/ts-loader
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  }
};

module.exports = config;
