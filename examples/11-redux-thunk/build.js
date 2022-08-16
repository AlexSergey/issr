const { isomorphicCompiler, backendCompiler, frontendCompiler } = require('@rockpack/compiler');

isomorphicCompiler(
  backendCompiler({
    src: 'src/server.jsx',
    dist: 'dist',
  }),
  frontendCompiler({
    src: 'src/client.jsx',
    dist: 'public',
  })
);
