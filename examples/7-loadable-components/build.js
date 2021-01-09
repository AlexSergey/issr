const { isomorphicCompiler, backendCompiler, frontendCompiler } = require('@rockpack/compiler');

isomorphicCompiler(
  backendCompiler({
    src: 'src/server.jsx',
    dist: 'dist',
    babel: {
      plugins: [
        '@issr/babel-plugin'
      ]
    },
  }),
  frontendCompiler({
    src: 'src/client.jsx',
    dist: 'public',
    babel: {
      plugins: [
        '@issr/babel-plugin'
      ]
    },
    copy: [
      { from: path.resolve(__dirname, './src/assets/favicon.ico'), to: './' }
    ]
  })
);
