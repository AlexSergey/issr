const path = require('path');
const NodemonPlugin = require('nodemon-webpack-plugin');

const common = {
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
    ...common,
    target: 'node',
    entry: './src/server.jsx',
    output: {
      path: path.resolve(__dirname, './dist'),
      filename: 'index.js',
    },
    plugins: [
      new NodemonPlugin({
        watch: path.resolve(__dirname, './dist'),
      })
    ]
  },
  {
    ...common,
    entry: './src/client.jsx',
    output: {
      path: path.resolve(__dirname, './public'),
      filename: 'index.js',
    }
  }
];
