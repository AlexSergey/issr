const NodemonPlugin = require('nodemon-webpack-plugin');
const path = require('path');

const commonConfig = {
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.jsx$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              plugins: ['@issr/babel-plugin'],
              presets: [['@babel/preset-react', { runtime: 'automatic', useBuiltIns: true }]],
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};

module.exports = [
  {
    ...commonConfig,
    devtool: 'source-map',
    entry: './src/server.jsx',
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, './dist'),
    },
    plugins: [
      new NodemonPlugin({
        nodeArgs: [`--inspect`, '--require="source-map-support/register"'],
        watch: path.resolve(__dirname, './dist'),
      }),
    ],
    target: 'node',
  },
  {
    ...commonConfig,
    entry: './src/client.jsx',
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, './public'),
    },
  },
];
