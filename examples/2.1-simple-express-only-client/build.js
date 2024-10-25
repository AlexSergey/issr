const { backendCompiler, frontendCompiler, getArgs, isomorphicCompiler } = require('@rockpack/compiler');

if (getArgs().client) {
  frontendCompiler({
    dist: 'public',
    global: {
      client: true,
    },
    src: 'src/client.jsx',
  });
} else {
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
}
