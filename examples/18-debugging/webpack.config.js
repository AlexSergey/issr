const path = require('path');
const NodemonPlugin = require('nodemon-webpack-plugin');

const commonConfig = {
  module: {
    rules: [
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-react'
              ],
              plugins: [
                '@issr/babel-plugin'
              ]
            }
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: [
      '.js',
      '.jsx'
    ]
  }
}

module.exports = [
  {
    ...commonConfig,
    target: 'node',
    devtool: 'source-map',
    entry: './src/server.jsx',
    output: {
      path: path.resolve(__dirname, './dist'),
      filename: 'index.js',
    },
    plugins: [
      new NodemonPlugin({
        watch: path.resolve(__dirname, './dist'),
        nodeArgs: [
          `--inspect`,
          '--require="source-map-support/register"'
        ]
      })
    ]
  },
  {
    ...commonConfig,
    entry: './src/client.jsx',
    output: {
      path: path.resolve(__dirname, './public'),
      filename: 'index.js',
    }
  }
];
