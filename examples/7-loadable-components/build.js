const { backendCompiler, frontendCompiler, isomorphicCompiler } = require('@rockpack/compiler');
const path = require('node:path');

isomorphicCompiler(
  backendCompiler({
    dist: 'dist',
    src: 'src/server.jsx',
  }),
  frontendCompiler({
    copy: [{ from: path.resolve(__dirname, './src/assets/favicon.ico'), to: './' }],
    dist: 'public',
    src: 'src/client.jsx',
  }),
);
