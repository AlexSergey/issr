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
              plugins: ['@issr/babel-plugin', 'babel-plugin-react-compiler'],
              presets: [['@babel/preset-react', { runtime: 'automatic', useBuiltIns: true }]],
            },
          },
        ],
      },
    ],
  },
  resolve: {
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
    extensions: ['.js', '.jsx'],
  },
};

module.exports = [
  {
    ...commonConfig,
    entry: './src/server.jsx',
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, './dist'),
    },
    plugins: [
      new NodemonPlugin({
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
