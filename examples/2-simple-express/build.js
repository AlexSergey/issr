const { backendCompiler, frontendCompiler, isomorphicCompiler } = require('@rockpack/compiler');

isomorphicCompiler(
  frontendCompiler({
    dist: 'public',
    src: 'src/client.jsx',
  }),
  backendCompiler({
    dist: 'dist',
    src: 'src/server.jsx',
  }),
);
