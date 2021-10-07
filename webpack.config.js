//@ts-check
'use strict';
const path = require('path');

/**@type {import('webpack').Configuration}*/
const extensionConfig = {
  target: 'node', // see: https://webpack.js.org/configuration/node/
  mode: 'none', // this leaves the source code as close as possible to the original
  entry: './src/extension.ts', // see: https://webpack.js.org/configuration/entry-context/
  output: {
    // see: https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
  },
  devtool: 'nosources-source-map',
  externals: {
    vscode: 'commonjs vscode' // see: https://webpack.js.org/configuration/externals/
    // modules added here also need to be added in the .vsceignore file
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

module.exports = [extensionConfig];
