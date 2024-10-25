const { backendCompiler, frontendCompiler, isomorphicCompiler } = require('@rockpack/compiler');

isomorphicCompiler(
  backendCompiler({
    dist: 'dist',
    src: 'src/server.jsx',
  }),
  frontendCompiler({
    dist: 'public',
    src: 'src/client.jsx',
  }),
);
